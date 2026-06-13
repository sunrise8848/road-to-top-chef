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
        items: String(step?.items || "").trim().slice(0, 500),
        timer: clampInteger(step?.timer, 0, 86400, 0)
      })).filter(step => step.text)
      : [],
    note: String(recipe?.note || "").trim().slice(0, 1000)
  })).filter(recipe => recipe.title && recipe.ingredients.length && recipe.steps.length);
}

async function createTogetherPlan(recipes, env, apiKey) {
  return requestTogetherPlan(recipes, env, apiKey, 0);
}

async function requestTogetherPlan(recipes, env, apiKey, attempt) {
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
        {
          role: "user",
          content: JSON.stringify({
            recipes,
            correction: attempt
              ? "上一次结果未能让所选菜品接近同时出锅，或包含了未选择的菜名。请重新倒排，只使用本次 recipes 中的菜名。"
              : undefined
          })
        }
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
    const plan = normalizeTogetherPlan(JSON.parse(outputText), recipes);
    const issue = getTogetherPlanIssue(plan, recipes);
    if (issue && attempt < 1) {
      return requestTogetherPlan(recipes, env, apiKey, attempt + 1);
    }
    if (issue) throw createHttpError(issue, 502);
    return plan;
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
    "时间线的首要目标是让所有菜尽量同时出锅，而不只是缩短总时长。先确定共同出锅时间，再从每道菜最后一步向前倒排。",
    "除必须静置、冷却或提前腌制的情况外，各道菜最后一个烹饪步骤的完成时间差应控制在 5 分钟以内，理想目标是 0–3 分钟。",
    "优先启动腌制、炖、蒸、焖、烤、烧水等耗时或等待步骤，在等待期间穿插其他菜的切配和快炒；不要因为有空闲就过早完成某道菜。",
    "易凉、容易回软、需要保持脆嫩或必须趁热吃的菜安排在最后阶段完成；可保温的炖菜可以略早，但应在 tips 中说明保温方式。",
    "保证每道菜内部步骤顺序正确。timeline 必须包含每道菜的最后出锅步骤，不得在其他菜仍需长时间烹饪时提前完成快手菜。",
    "不要在同一个 active 项目中声称一个人同时焯水、切配或翻炒；等待可以与主动操作重叠，但主动操作应按真实先后拆开。",
    "timeline 的 startMinute 和 duration 均为整数分钟；不足 1 分钟的操作按 1 分钟计。type 只能是 active 或 wait。",
    "tips 第一项必须说明预计各菜出锅时间或完成时间差，并明确本计划以同步出锅为目标。",
    'JSON 格式：{"recipeTitles":["菜1","菜2"],"totalTime":40,"prep":[{"name":"蒜","totalAmount":"6瓣","usedIn":["菜1","菜2"],"prep":"统一切末，分成两份"}],"timeline":[{"startMinute":0,"duration":5,"recipe":"通用备料","action":"清洗并切配全部蔬菜","type":"active","parallelNote":""},{"startMinute":5,"duration":30,"recipe":"菜1","action":"小火炖煮","type":"wait","parallelNote":"等待期间制作菜2"},{"startMinute":32,"duration":5,"recipe":"菜2","action":"大火快炒并出锅","type":"active","parallelNote":"出锅后短暂保温"},{"startMinute":37,"duration":3,"recipe":"菜1","action":"大火收汁并出锅","type":"active","parallelNote":"菜2已完成，立即收汁"}],"tips":["菜2预计第37分钟、菜1预计第40分钟出锅，完成时间差3分钟"]}'
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

function getTogetherPlanIssue(plan, recipes) {
  const recipeNames = new Set(recipes.map(recipe => recipe.title));
  const unknownRecipes = plan.timeline
    .map(item => item.recipe)
    .filter(name => name !== "通用备料" && name !== "通用" && !recipeNames.has(name));
  if (unknownRecipes.length) {
    return "AI 规划包含未选择的菜品，请重新生成";
  }

  const finishTimes = recipes.map(recipe => {
    const recipeItems = plan.timeline.filter(item => item.recipe === recipe.title);
    if (!recipeItems.length) return null;
    return Math.max(...recipeItems.map(item => item.startMinute + item.duration));
  });
  if (finishTimes.some(time => time === null)) {
    return "AI 规划遗漏了部分菜品，请重新生成";
  }
  if (Math.max(...finishTimes) - Math.min(...finishTimes) > 5) {
    return "AI 未能让各菜在 5 分钟内接近同时出锅，请重新生成";
  }
  return "";
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
    "原文中出现的所有食材、调味料及其具体用量必须完整保留，包括克数、毫升、个数、勺、茶匙、碗、片、瓣、比例和分次用量；不得省略、四舍五入、改写成“适量”或擅自换算单位。",
    "ingredients 必须列出原文提到的完整用量。只有原文确实没有说明某项食材用量时，才填写“适量”。",
    "每个 steps 项必须包含 text 和 items。text 要写成可以直接照做的完整步骤，并在使用配料的位置再次写明该步骤实际加入的具体用量，例如“加入生抽 2 勺、老抽 1 勺翻炒”。",
    "steps.items 是本步骤使用的配料及用量摘要，格式为“生抽 2 勺、老抽 1 勺”；纯切配、等待或不使用新配料的步骤可为空字符串。",
    "如果同一种食材分多次加入，应按照原文保留每次加入的用量；原文只给总量但未说明分配时，不得编造每一步的拆分量，应在相关步骤写明“按原文总量酌情分次加入”。",
    "没有明确时间时给出保守估计；步骤中原文明确的时间和火候也必须保留。",
    "根据食材及用量估算整道菜的总热量，再除以 servings，返回每份热量 calories，单位为千卡；这只是近似营养估算。",
    "若内容不足以可靠提取至少两种食材和两个步骤，needsMoreText 必须为 true。",
    "不要虚构教程中完全没有依据的关键食材或烹饪方法。",
    'JSON 格式示例：{"title":"番茄炒蛋","time":15,"servings":2,"calories":230,"difficulty":"简单","tags":["快手菜"],"ingredients":[{"name":"番茄","amount":"2个"},{"name":"鸡蛋","amount":"3个"},{"name":"盐","amount":"2克"}],"steps":[{"text":"将番茄 2 个切块，鸡蛋 3 个加入盐 1 克打散。","items":"番茄 2个、鸡蛋 3个、盐 1克"},{"text":"锅中加入剩余盐 1 克和番茄块翻炒。","items":"盐 1克、番茄 2个"}],"note":"注意火候。","needsMoreText":false}'
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
      .map(item => ({
        text: String(item?.text || "").trim(),
        items: String(item?.items || "").trim().slice(0, 500),
        ...(clampInteger(item?.timer, 0, 86400, 0) > 0
          ? { timer: clampInteger(item.timer, 0, 86400, 0) }
          : {})
      }))
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
