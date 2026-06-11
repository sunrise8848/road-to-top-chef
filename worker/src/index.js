export default {
  async fetch(request, env) {
    const corsHeaders = createCorsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const apiKey = normalizeApiKey(env.DEEPSEEK_API_KEY);
    const keyLooksValid = isValidApiKey(apiKey);
    const visionConfigured = Boolean(env.AI);
    const serviceReady = keyLooksValid && visionConfigured;

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        status: serviceReady ? "ready" : "configuration_required",
        provider: "deepseek",
        model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        visionModel: env.VISION_MODEL || "@cf/moonshotai/kimi-k2.6",
        apiKeyConfigured: Boolean(apiKey),
        apiKeyLooksValid: keyLooksValid,
        visionConfigured
      }, serviceReady ? 200 : 503, corsHeaders);
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
      if (!input.shareText && !input.images.length) {
        return json({ error: "请至少提供教程文字或一张图片" }, 400, corsHeaders);
      }
      if (input.images.length && !env.AI) {
        return json({ error: "Worker 尚未配置 Cloudflare AI 图片识别绑定" }, 500, corsHeaders);
      }

      const imageTexts = await recognizeImages(input.images, env);
      const sourceText = buildSourceText(input, imageTexts);

      const recipe = await createRecipeDraft(sourceText, env, apiKey);
      return json(
        {
          recipe,
          needsMoreText: recipe.needsMoreText,
          imageCount: input.images.length
        },
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
  const images = Array.isArray(payload?.images)
    ? payload.images
      .map(image => String(image || ""))
      .filter(Boolean)
      .slice(0, 6)
    : [];

  for (const image of images) {
    if (!/^data:image\/(?:jpeg|png|webp);base64,/i.test(image)) {
      throw createHttpError("图片格式不受支持，请使用 JPG、PNG 或 WebP", 400);
    }
    if (image.length > 2.1 * 1024 * 1024) {
      throw createHttpError("单张图片过大，请压缩后重试", 413);
    }
  }

  return {
    title: String(payload?.title || "").trim().slice(0, 200),
    platform: String(payload?.platform || "其他").trim().slice(0, 30),
    shareText: String(payload?.shareText || "").trim().slice(0, 12000),
    images
  };
}

async function recognizeImages(images, env) {
  const content = [
    {
      type: "text",
      text: [
        `以下 ${images.length} 张图片按上传顺序组成同一份菜谱教程。`,
        "请逐张识别所有可见的中文文字、食材、用量、火候、时间和制作步骤。",
        "用“第1张”“第2张”等标题保留图片顺序；重复内容只需注明重复。",
        "看不清的内容标记为[无法辨认]，不要凭空补充。只输出识别结果。"
      ].join("\n")
    },
    ...images.map(dataUrl => ({
      type: "image_url",
      image_url: { url: dataUrl, detail: "high" }
    }))
  ];
  const result = await env.AI.run(
    env.VISION_MODEL || "@cf/moonshotai/kimi-k2.6",
    {
      messages: [{ role: "user", content }],
      max_completion_tokens: 4000,
      temperature: 0.1
    }
  );
  const text = result?.choices?.[0]?.message?.content;
  if (!text) throw createHttpError("视觉模型没有返回有效的图片识别结果", 502);
  return [String(text).trim().slice(0, 24000)];
}

function buildSourceText(input, imageTexts) {
  return [
    `平台：${input.platform}`,
    `用户填写的标题：${input.title || "未填写"}`,
    input.shareText ? `用户提供的教程文字或字幕：\n${input.shareText}` : "",
    ...imageTexts.map(text => `多张图片识别结果：\n${text || "[未识别到有效内容]"}`)
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
    "从用户文字和多张图片的识别结果中提取可执行的菜谱草稿。",
    "图片按编号排列，请结合所有图片去重并恢复完整的食材清单和步骤顺序。",
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
