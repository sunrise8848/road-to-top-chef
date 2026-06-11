export default {
  async fetch(request, env) {
    const corsHeaders = createCorsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const apiKey = normalizeApiKey(env.DEEPSEEK_API_KEY);
    const keyLooksValid = isValidApiKey(apiKey);
    const serviceReady = keyLooksValid;

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        status: serviceReady ? "ready" : "configuration_required",
        provider: "deepseek",
        model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        apiKeyConfigured: Boolean(apiKey),
        apiKeyLooksValid: keyLooksValid
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
      if (payload?.action === "plan_together") {
        const recipes = normalizeTogetherRecipes(payload.recipes);
        if (recipes.length < 2) {
          return json({ error: "请至少选择两道菜" }, 400, corsHeaders);
        }
        const plan = await createTogetherPlan(recipes, env, apiKey);
        return json({ plan }, 200, corsHeaders);
      }

      const input = normalizeInput(payload);
      if (!input.shareText) {
        return json({ error: "请提供教程文字或字幕" }, 400, corsHeaders);
      }

      const recipe = await createRecipeDraft(buildSourceText(input), env, apiKey);
      return json(
        {
          recipe,
          needsMoreText: recipe.needsMoreText
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
  return {
    title: String(payload?.title || "").trim().slice(0, 200),
    shareText: String(payload?.shareText || "").trim().slice(0, 12000)
  };
}

function buildSourceText(input) {
  return [
    `用户填写的标题：${input.title || "未填写"}`,
    input.shareText ? `用户提供的教程文字或字幕：\n${input.shareText}` : ""
  ].filter(Boolean).join("\n\n");
}

function normalizeTogetherRecipes(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 6).map(recipe => ({
    title: String(recipe?.title || "").trim().slice(0, 100),
    time: clampInteger(recipe?.time, 1, 1440, 30),
    servings: clampInteger(recipe?.servings, 1, 50, 2),
    ingredients: Array.isArray(recipe?.ingredients)
      ? recipe.ingredients.slice(0, 50).map(item => ({
        name: String(item?.name || "").trim().slice(0, 80),
        amount: String(item?.amount || "适量").trim().slice(0, 80)
      })).filter(item => item.name)
      : [],
    steps: Array.isArray(recipe?.steps)
      ? recipe.steps.slice(0, 30).map(step => ({
        text: String(step?.text || "").trim().slice(0, 500),
        timer: clampInteger(step?.timer, 0, 86400, 0)
      })).filter(step => step.text)
      : [],
    note: String(recipe?.note || "").trim().slice(0, 1000)
  })).filter(recipe => recipe.title && recipe.ingredients.length && recipe.steps.length);
}

async function createTogetherPlan(recipes, env, apiKey) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        { role: "system", content: buildTogetherPrompt() },
        { role: "user", content: JSON.stringify({ recipes }) }
      ],
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      max_tokens: 5000,
      stream: false
    })
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw createHttpError(`DeepSeek API 返回了无法解析的响应（HTTP ${response.status}）`, 502);
  }
  if (!response.ok) {
    throw createHttpError(result?.error?.message || "DeepSeek API 请求失败", response.status);
  }

  const outputText = result.choices?.[0]?.message?.content;
  if (!outputText) throw createHttpError("DeepSeek 没有返回烹饪计划", 502);
  try {
    return normalizeTogetherPlan(JSON.parse(outputText), recipes);
  } catch (error) {
    if (error.status) throw error;
    throw createHttpError("DeepSeek 返回的烹饪计划格式无效，请重试", 502);
  }
}

function buildTogetherPrompt() {
  return [
    "你是擅长多道家常菜协同烹饪的厨房调度助手。只输出 JSON，不要输出 Markdown 或解释。",
    "默认只有一个人操作，普通家庭厨房有两个灶眼；不要安排同一人在同一时间执行两项都需要持续翻炒、切配或看火的主动操作。",
    "先统一备料：prep 必须覆盖每道菜的全部食材和调味料，不能省略盐、油、糖等常用配料。",
    "相同食材必须合并成一项；能可靠相加相同单位时给出合计，单位不同或包含“适量”时在 totalAmount 中按菜名保留分项说明，不要强行换算。",
    "再安排时间线：优先启动腌制、炖、蒸、焖、烤、烧水等耗时或等待步骤，在等待期间穿插其他菜的切配和快炒。",
    "保证每道菜内部步骤顺序正确，并尽量让所有菜接近同时出锅；易凉或需要保持脆嫩的菜尽量靠后完成。",
    "不要在同一个 active 项目中声称一个人同时焯水、切配或翻炒；等待可以与主动操作重叠，但主动操作应按真实先后拆开。",
    "timeline 的 startMinute 和 duration 均为整数分钟；不足 1 分钟的操作按 1 分钟计。type 只能是 active 或 wait。",
    'JSON 格式：{"recipeTitles":["菜1","菜2"],"totalTime":40,"prep":[{"name":"蒜","totalAmount":"6瓣","usedIn":["菜1","菜2"],"prep":"统一切末，分成两份"}],"timeline":[{"startMinute":0,"duration":5,"recipe":"通用备料","action":"清洗并切配全部蔬菜","type":"active","parallelNote":""},{"startMinute":5,"duration":20,"recipe":"菜1","action":"小火炖煮","type":"wait","parallelNote":"期间制作菜2"}],"tips":["快炒菜最后出锅"]}'
  ].join("\n");
}

function normalizeTogetherPlan(value, recipes) {
  const recipeNames = new Set(recipes.map(recipe => recipe.title));
  const modelPrep = Array.isArray(value?.prep)
    ? value.prep.slice(0, 100).map(item => ({
      name: String(item?.name || "").trim().slice(0, 100),
      totalAmount: String(item?.totalAmount || "按各菜用量").trim().slice(0, 160),
      usedIn: Array.isArray(item?.usedIn)
        ? item.usedIn.map(name => String(name).trim()).filter(Boolean).slice(0, 6)
        : [],
      prep: String(item?.prep || "").trim().slice(0, 500)
    })).filter(item => item.name && item.prep)
    : [];
  const prep = buildMergedPrep(recipes, modelPrep);
  const timeline = Array.isArray(value?.timeline)
    ? value.timeline.slice(0, 100).map(item => ({
      startMinute: clampInteger(item?.startMinute, 0, 1440, 0),
      duration: clampInteger(item?.duration, 1, 1440, 1),
      recipe: String(item?.recipe || "通用").trim().slice(0, 100),
      action: String(item?.action || "").trim().slice(0, 500),
      type: item?.type === "wait" ? "wait" : "active",
      parallelNote: String(item?.parallelNote || "").trim().slice(0, 300)
    })).filter(item => item.action)
      .sort((a, b) => a.startMinute - b.startMinute)
    : [];

  if (!prep.length || !timeline.length) {
    throw createHttpError("生成的计划缺少备料清单或时间线", 502);
  }
  const calculatedEnd = Math.max(...timeline.map(item => item.startMinute + item.duration));
  const returnedTitles = Array.isArray(value?.recipeTitles)
    ? value.recipeTitles.map(name => String(name).trim()).filter(name => recipeNames.has(name))
    : [];
  return {
    recipeTitles: returnedTitles.length ? returnedTitles : recipes.map(recipe => recipe.title),
    totalTime: clampInteger(value?.totalTime, calculatedEnd, 1440, calculatedEnd),
    prep,
    timeline,
    tips: Array.isArray(value?.tips)
      ? value.tips.map(tip => String(tip).trim()).filter(Boolean).slice(0, 12)
      : []
  };
}

function buildMergedPrep(recipes, modelPrep) {
  const groups = new Map();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = ingredient.name.replace(/\s+/g, "").toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { name: ingredient.name, entries: [] });
      }
      groups.get(key).entries.push({
        recipe: recipe.title,
        amount: ingredient.amount
      });
    }
  }

  return [...groups.values()].map(group => {
    const suggestion = modelPrep.find(item =>
      item.name.replace(/\s+/g, "").toLowerCase() === group.name.replace(/\s+/g, "").toLowerCase()
    );
    const usedIn = [...new Set(group.entries.map(entry => entry.recipe))];
    const mentionsUnrelatedRecipe = suggestion && recipes.some(recipe =>
      !usedIn.includes(recipe.title) && suggestion.prep.includes(recipe.title)
    );
    return {
      name: group.name,
      totalAmount: mergeIngredientAmounts(group.entries),
      usedIn,
      prep: suggestion && !mentionsUnrelatedRecipe
        ? suggestion.prep
        : "按各菜需要统一清洗、切配并分装"
    };
  });
}

function mergeIngredientAmounts(entries) {
  const parsed = entries.map(entry => {
    const match = entry.amount.match(/^(\d+(?:\.\d+)?)\s*([^\d]+)$/);
    return match ? { number: Number(match[1]), unit: match[2].trim() } : null;
  });
  if (
    parsed.every(Boolean) &&
    parsed.every(item => item.unit === parsed[0].unit) &&
    !/适量|少许|按需/.test(parsed[0].unit)
  ) {
    const total = parsed.reduce((sum, item) => sum + item.number, 0);
    return `${Number.isInteger(total) ? total : total.toFixed(1)}${parsed[0].unit}`;
  }
  if (entries.length === 1) return entries[0].amount;
  return entries.map(entry => `${entry.recipe} ${entry.amount}`).join("；");
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
    "从用户提供的教程文字或字幕中提取可执行的菜谱草稿。",
    "没有明确用量时填写“适量”；没有明确时间时给出保守估计。",
    "根据食材及用量估算整道菜的总热量，再除以 servings，返回每份热量 calories，单位为千卡；这只是近似营养估算。",
    "若内容不足以可靠提取至少两种食材和两个步骤，needsMoreText 必须为 true。",
    "不要虚构教程中完全没有依据的关键食材或烹饪方法。",
    'JSON 格式示例：{"title":"番茄炒蛋","time":15,"servings":2,"calories":230,"difficulty":"简单","tags":["快手菜"],"ingredients":[{"name":"番茄","amount":"2个"}],"steps":[{"text":"番茄切块。"}],"note":"注意火候。","needsMoreText":false}'
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
    calories: clampInteger(value.calories, 0, 10000, 0),
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
