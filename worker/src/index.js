const ALLOWED_HOSTS = [
  "xiaohongshu.com",
  "xhslink.com",
  "douyin.com",
  "iesdouyin.com"
];

export default {
  async fetch(request, env) {
    const corsHeaders = createCorsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const apiKey = normalizeApiKey(env.DEEPSEEK_API_KEY);
    const keyLooksValid = isValidApiKey(apiKey);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        status: keyLooksValid ? "ready" : "configuration_required",
        provider: "deepseek",
        model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        apiKeyConfigured: Boolean(apiKey),
        apiKeyLooksValid: keyLooksValid
      }, keyLooksValid ? 200 : 503, corsHeaders);
    }

    if (request.method !== "POST") {
      return json({ error: "仅支持 POST 请求" }, 405, corsHeaders);
    }

    if (!apiKey) {
      return json({ error: "服务端尚未配置 DEEPSEEK_API_KEY" }, 500, corsHeaders);
    }
    if (!keyLooksValid) {
      return json(
        { error: "DEEPSEEK_API_KEY 格式不正确，请在 Cloudflare Variables and Secrets 中重新配置" },
        500,
        corsHeaders
      );
    }

    try {
      const payload = await request.json();
      const input = normalizeInput(payload);
      const pageText = input.url ? await readPublicPage(input.url) : "";
      if (!input.shareText && pageText.length < 80) {
        return json(
          { error: "平台没有返回足够的公开内容，请在收录时粘贴分享文案或视频字幕" },
          422,
          corsHeaders
        );
      }
      const sourceText = buildSourceText(input, pageText);

      if (!sourceText.trim()) {
        return json({ error: "没有可用于识别的教程内容，请补充分享文案或字幕" }, 400, corsHeaders);
      }

      const recipe = await createRecipeDraft(sourceText, env, apiKey);
      return json(
        { recipe, needsMoreText: recipe.needsMoreText },
        200,
        corsHeaders
      );
    } catch (error) {
      const status = error.status || 500;
      return json({ error: error.message || "生成菜谱草稿失败" }, status, corsHeaders);
    }
  }
};

function createCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  const origin = allowedOrigin === "*" || requestOrigin === allowedOrigin
    ? (requestOrigin || allowedOrigin)
    : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}

function normalizeApiKey(value) {
  let key = String(value || "").trim();
  if (
    (key.startsWith("\"") && key.endsWith("\"")) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

function isValidApiKey(value) {
  return value.startsWith("sk-") && value.length >= 20 && !/\s/.test(value);
}

function normalizeInput(payload) {
  return {
    url: String(payload?.url || "").trim(),
    title: String(payload?.title || "").trim().slice(0, 200),
    platform: String(payload?.platform || "其他").trim().slice(0, 30),
    shareText: String(payload?.shareText || "").trim().slice(0, 12000)
  };
}

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
}

async function readPublicPage(url, redirectsLeft = 3) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw createHttpError("教程链接格式不正确", 400);
  }

  if (parsed.protocol !== "https:" || !isAllowedHost(parsed.hostname)) {
    throw createHttpError("目前仅支持小红书和抖音的 HTTPS 分享链接", 400);
  }

  const response = await fetch(parsed.toString(), {
    redirect: "manual",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RecipeDraftBot/1.0)",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (response.status >= 300 && response.status < 400) {
    if (!redirectsLeft) return "";
    const location = response.headers.get("Location");
    if (!location) return "";
    return readPublicPage(new URL(location, parsed).toString(), redirectsLeft - 1);
  }

  if (!response.ok) return "";
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return "";

  const html = (await response.text()).slice(0, 500000);
  return extractPageText(html).slice(0, 16000);
}

function extractPageText(html) {
  const metadata = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const key = getAttribute(tag, "name") || getAttribute(tag, "property");
    if (!["description", "og:title", "og:description"].includes(key?.toLowerCase())) continue;
    const content = getAttribute(tag, "content");
    if (content) metadata.push(content);
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  return decodeEntities([title, ...metadata, body].join("\n"))
    .replace(/\s+/g, " ")
    .trim();
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match?.[1] || "";
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function buildSourceText(input, pageText) {
  return [
    `平台：${input.platform}`,
    `用户填写的标题：${input.title || "未填写"}`,
    input.url ? `教程链接：${input.url}` : "",
    input.shareText ? `分享文案或字幕：\n${input.shareText}` : "",
    pageText ? `公开页面内容：\n${pageText}` : ""
  ].filter(Boolean).join("\n\n");
}

async function createRecipeDraft(sourceText, env, apiKey) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: buildDeepSeekPrompt()
        },
        { role: "user", content: sourceText }
      ],
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      max_tokens: 3000,
      stream: false
    })
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw createHttpError(
      `DeepSeek API 返回了无法解析的响应（HTTP ${response.status}）`,
      502
    );
  }
  if (!response.ok) {
    throw createHttpError(
      result?.error?.message || "DeepSeek API 请求失败",
      response.status
    );
  }

  const outputText = result.choices?.[0]?.message?.content;
  if (!outputText) throw new Error("DeepSeek 没有返回可用的菜谱草稿，请重试");

  let recipe;
  try {
    recipe = JSON.parse(outputText);
  } catch {
    throw new Error("DeepSeek 返回的菜谱草稿不是有效 JSON，请重试");
  }
  return normalizeRecipeDraft(recipe);
}

function buildDeepSeekPrompt() {
  return [
    "你是中文家常菜谱整理助手。请只输出 JSON，不要输出 Markdown 或解释。",
    "从教程文字中提取可执行的菜谱草稿，不要把链接本身当作事实来源。",
    "没有明确用量时填写“适量”；没有明确时间时给出保守估计。",
    "若内容不足以可靠提取至少两种食材和两个步骤，needsMoreText 必须为 true。",
    "不要虚构教程中完全没有依据的关键食材或烹饪方法。",
    'JSON 格式示例：{"title":"番茄炒蛋","time":15,"servings":2,"difficulty":"简单","tags":["快手菜"],"ingredients":[{"name":"番茄","amount":"2个"}],"steps":[{"text":"番茄切块。"}],"note":"注意火候。","needsMoreText":false}'
  ].join("\n");
}

function normalizeRecipeDraft(value) {
  const difficulty = ["简单", "中等", "较难"].includes(value?.difficulty)
    ? value.difficulty
    : "简单";
  const ingredients = Array.isArray(value?.ingredients)
    ? value.ingredients
      .map(item => ({
        name: String(item?.name || "").trim(),
        amount: String(item?.amount || "适量").trim()
      }))
      .filter(item => item.name)
      .slice(0, 50)
    : [];
  const steps = Array.isArray(value?.steps)
    ? value.steps
      .map(item => ({ text: String(item?.text || "").trim() }))
      .filter(item => item.text)
      .slice(0, 30)
    : [];

  if (!String(value?.title || "").trim() || !ingredients.length || !steps.length) {
    throw new Error("DeepSeek 返回的菜谱草稿缺少必要字段，请补充教程文案后重试");
  }

  return {
    title: String(value.title).trim().slice(0, 100),
    time: clampInteger(value.time, 1, 1440, 30),
    servings: clampInteger(value.servings, 1, 50, 2),
    difficulty,
    tags: Array.isArray(value.tags)
      ? value.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 8)
      : [],
    ingredients,
    steps,
    note: String(value.note || "").trim().slice(0, 1000),
    needsMoreText: Boolean(value.needsMoreText)
  };
}

function clampInteger(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
