const seedRecipes = [
  {
    id: 1, title: "番茄炒蛋", image: "assets/tomato-eggs.png",
    time: 15, calories: 230, difficulty: "简单", servings: 2, favorite: true, cooked: 8,
    tags: ["快手菜", "下饭", "15分钟"],
    ingredients: [["番茄", "2个"], ["鸡蛋", "3个"], ["盐", "2克"], ["白糖", "1小勺"], ["葱花", "少许"]],
    steps: [
      { text: "番茄切成小块；鸡蛋加一小撮盐，充分打散。", items: "番茄、鸡蛋、盐" },
      { text: "锅烧热后倒油，放入蛋液，快速推炒到刚刚凝固后盛出。", items: "蛋液、食用油" },
      { text: "原锅放入番茄，加盐和白糖，中火炒到番茄出汁。", items: "番茄、盐、白糖", timer: 180 },
      { text: "倒回鸡蛋，轻轻翻匀，让蛋块裹上番茄汁，撒葱花出锅。", items: "炒蛋、葱花" }
    ],
    note: "鸡蛋不要炒老。番茄偏酸时加一小勺糖，最后不需要勾芡。"
  },
  {
    id: 2, title: "土豆烧鸡", image: "assets/braised-chicken.png",
    time: 50, calories: 520, difficulty: "中等", servings: 3, favorite: true, cooked: 5,
    tags: ["炖菜", "下饭", "周末"],
    ingredients: [["鸡腿肉", "500克"], ["土豆", "2个"], ["生抽", "2勺"], ["老抽", "1勺"], ["冰糖", "15克"], ["姜", "4片"]],
    steps: [
      { text: "鸡腿肉切块，冷水下锅焯水，捞出后擦干表面水分。", items: "鸡腿肉、姜片", timer: 300 },
      { text: "锅中放少量油和冰糖，小火炒至琥珀色。", items: "食用油、冰糖" },
      { text: "倒入鸡块翻炒上色，加入生抽、老抽和姜片。", items: "鸡块、生抽、老抽、姜片" },
      { text: "加入没过鸡块的热水，小火炖20分钟。", items: "热水", timer: 1200 },
      { text: "加入土豆继续炖15分钟，最后开盖大火收汁。", items: "土豆", timer: 900 }
    ],
    note: "第二次做时土豆切大块更合适；收汁前先尝咸淡，不再额外加盐。"
  },
  {
    id: 3, title: "麻婆豆腐", image: "assets/mapo-tofu.png",
    time: 25, calories: 360, difficulty: "中等", servings: 2, favorite: false, cooked: 2,
    tags: ["川味", "下饭", "微辣"],
    ingredients: [["嫩豆腐", "1盒"], ["牛肉末", "80克"], ["豆瓣酱", "1勺"], ["花椒粉", "适量"], ["蒜末", "1勺"], ["水淀粉", "3勺"]],
    steps: [
      { text: "豆腐切成2厘米方块，在淡盐水中煮2分钟后捞出。", items: "嫩豆腐、盐", timer: 120 },
      { text: "热锅少油炒散牛肉末，加入豆瓣酱和蒜末炒出红油。", items: "牛肉末、豆瓣酱、蒜末" },
      { text: "加半碗水，放入豆腐，小火烧5分钟。", items: "豆腐、清水", timer: 300 },
      { text: "分三次淋入水淀粉，轻推豆腐，撒花椒粉和葱花。", items: "水淀粉、花椒粉、葱花" }
    ],
    note: "豆腐入锅后不要频繁翻动，用锅铲背轻推。花椒粉出锅前再放，香味更明显。"
  },
  {
    id: 4, title: "蒜蓉西兰花", image: "assets/garlic-broccoli.png",
    time: 12, calories: 120, difficulty: "简单", servings: 2, favorite: false, cooked: 4,
    tags: ["素菜", "快手菜", "清淡"],
    ingredients: [["西兰花", "1颗"], ["蒜", "4瓣"], ["蚝油", "1小勺"], ["盐", "适量"]],
    steps: [
      { text: "西兰花切小朵，在淡盐水中浸泡后洗净。", items: "西兰花、盐" },
      { text: "水开后加盐和几滴油，放入西兰花焯水90秒。", items: "西兰花、盐、食用油", timer: 90 },
      { text: "热锅少油炒香蒜末，放入西兰花和蚝油，大火翻匀。", items: "蒜末、西兰花、蚝油" }
    ],
    note: "焯水不要超过两分钟，捞出后立刻炒，颜色和脆度都更好。"
  }
];

const seedInbox = [
  { id: 101, title: "空气炸锅蜜汁鸡翅", shareText: "鸡翅腌制后放入空气炸锅，刷蜜汁烤至上色。", savedAt: "今天 11:28" },
  { id: 102, title: "先收着：一锅到底焖饭", shareText: "大米、腊肠和蔬菜放入电饭煲一起焖熟。", savedAt: "昨天 20:14" }
];

function loadStoredList(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function loadStoredValue(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

const state = {
  recipes: loadStoredList("zaobian-recipes", seedRecipes),
  inbox: loadStoredList("zaobian-inbox", seedInbox),
  togetherRecipeIds: loadStoredList("zaobian-together-recipes", []).map(Number).slice(0, 6),
  togetherPlan: loadStoredValue("zaobian-together-plan", null),
  togetherLoading: false,
  view: "library",
  filter: "全部",
  query: "",
  activeRecipe: null,
  cookMode: "single",
  cookStep: 0,
  activeTimers: [],
  timerTickerId: null,
  cookSession: loadStoredValue("zaobian-cook-session", null),
  lastBackupAt: localStorage.getItem("zaobian-last-backup") || ""
};

const viewRoot = document.querySelector("#viewRoot");
const importDialog = document.querySelector("#importDialog");
const recipeDialog = document.querySelector("#recipeDialog");
const organizeDialog = document.querySelector("#organizeDialog");
const organizeForm = document.querySelector("#organizeForm");
const cookDialog = document.querySelector("#cookDialog");
const searchInput = document.querySelector("#searchInput");
const recipeApiUrl = window.RECIPE_API_URL?.trim() || "";
let recognizeRequestId = 0;
const DEFAULT_COVER = "assets/garlic-broccoli.png";
const MAX_COVER_EDGE = 1200;
const MAX_COVER_BYTES = 450 * 1024;
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 25 * 1024 * 1024;
let timerAudioContext = null;

function save() {
  localStorage.setItem("zaobian-recipes", JSON.stringify(state.recipes));
  localStorage.setItem("zaobian-inbox", JSON.stringify(state.inbox));
  localStorage.setItem("zaobian-together-recipes", JSON.stringify(state.togetherRecipeIds));
  localStorage.setItem("zaobian-together-plan", JSON.stringify(state.togetherPlan));
  document.querySelector("#inboxCount").textContent = state.inbox.length;
  document.querySelector("#togetherCount").textContent = state.togetherRecipeIds.length;
  renderBackupStatus();
}

function toast(message, actionLabel = "", action = null) {
  const el = document.querySelector("#toast");
  const text = document.querySelector("#toastText");
  const button = document.querySelector("#toastAction");
  text.textContent = message;
  button.hidden = !actionLabel;
  button.textContent = actionLabel;
  button.onclick = actionLabel ? () => {
    action?.();
    el.classList.remove("show");
  } : null;
  el.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => el.classList.remove("show"), actionLabel ? 5000 : 2200);
}

function renderBackupStatus() {
  const status = document.querySelector("#backupStatus");
  if (!status) return;
  status.textContent = state.lastBackupAt
    ? `上次导出：${new Date(state.lastBackupAt).toLocaleDateString("zh-CN")}`
    : "尚未导出备份，建议定期保存";
}

function renderResumeCard() {
  const session = state.cookSession;
  if (!session) return "";
  const recipe = state.recipes.find(item => item.id === Number(session.recipeId));
  const title = session.mode === "together" ? "一起做计划" : recipe?.title;
  if (!title) return "";
  return `
    <div class="resume-card">
      <div><strong>继续上次做菜：${escapeHtml(title)}</strong><span>停在第 ${Number(session.cookStep) + 1} 步，计时器会按实际时间恢复。</span></div>
      <div class="head-actions">
        <button class="button secondary small" data-discard-cook-session>放弃</button>
        <button class="button primary small" data-resume-cook>继续做菜</button>
      </div>
    </div>
  `;
}

function filteredRecipes() {
  return state.recipes.filter(recipe => {
    const query = state.query.trim().toLowerCase();
    const text = [recipe.title, ...recipe.tags, ...recipe.ingredients.flat()].join(" ").toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesView = state.view !== "favorites" || recipe.favorite;
    const matchesFilter = state.filter === "全部" || recipe.tags.includes(state.filter) ||
      (state.filter === "30分钟内" && recipe.time <= 30);
    return matchesQuery && matchesView && matchesFilter;
  });
}

function renderLibrary() {
  const recipes = filteredRecipes();
  const favoriteMode = state.view === "favorites";
  viewRoot.innerHTML = `
    ${renderResumeCard()}
    <div class="view-head">
      <div>
        <span class="eyebrow">${favoriteMode ? "常做清单" : "个人菜谱库"}</span>
        <h1>${favoriteMode ? "这些味道，已经很熟悉" : "今天，想做点什么？"}</h1>
        <p>${favoriteMode ? "收藏真正合你口味、值得反复做的菜。" : `已沉淀 ${state.recipes.length} 道菜谱，包含你每次做完后的调整。`}</p>
      </div>
      <div class="head-actions">
        <button class="button secondary" data-action="manual-add">＋ 手动新建</button>
        <button class="button primary" data-action="import">↓ 收录教程</button>
      </div>
    </div>
    <div class="filter-row">
      ${["全部", "快手菜", "下饭", "素菜", "30分钟内"].map(tag =>
        `<button class="filter ${state.filter === tag ? "active" : ""}" data-filter="${tag}">${tag}</button>`
      ).join("")}
    </div>
    ${recipes.length ? `<div class="recipe-grid">${recipes.map(recipeCard).join("")}</div>` :
      `<div class="empty"><strong>暂时没有匹配的菜谱</strong><span>换个关键词，或者先收录一条新教程。</span></div>`}
  `;
}

function recipeCard(recipe) {
  const calories = Number(recipe.calories);
  const isTogether = state.togetherRecipeIds.includes(recipe.id);
  return `
    <article class="recipe-card" data-recipe="${recipe.id}" tabindex="0">
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.title}">
      <span class="calorie-badge">${calories > 0 ? `约 ${calories} 千卡/份` : "热量待估算"}</span>
      <button class="favorite ${recipe.favorite ? "on" : ""}" data-favorite="${recipe.id}" aria-label="${recipe.favorite ? "取消常做" : "加入常做"}">${recipe.favorite ? "★" : "☆"}</button>
      <div class="recipe-body">
        <div class="recipe-meta"><span class="source-dot"></span><span>${recipe.time} 分钟</span><span>·</span><span>做过 ${recipe.cooked} 次</span></div>
        <h3>${recipe.title}</h3>
        <div class="tag-row">${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
        <button class="button small together-add ${isTogether ? "added" : ""}" data-toggle-together="${recipe.id}" type="button" aria-pressed="${isTogether}">
          ${isTogether ? "✓ 已加入一起做" : "＋ 加入一起做"}
        </button>
      </div>
    </article>
  `;
}

function renderInbox() {
  viewRoot.innerHTML = `
    ${renderResumeCard()}
    <div class="view-head">
      <div>
        <span class="eyebrow">稍后整理</span>
        <h1>先收下，别让灵感溜走</h1>
        <p>教程会先放在这里，等有空时再整理成自己的菜谱。</p>
      </div>
      <button class="button primary" data-action="import">↓ 收录教程</button>
    </div>
    ${state.inbox.length ? `<div class="inbox-list">${state.inbox.map(item => `
      <article class="inbox-item">
        <div class="tutorial-mark">文</div>
        <div><h3>${item.title}</h3><p>文字教程 · 收录于 ${item.savedAt}</p></div>
        <div class="inbox-actions">
          <button class="button secondary small" data-delete-inbox="${item.id}">删除</button>
          <button class="button primary small" data-organize="${item.id}">开始整理</button>
        </div>
      </article>`).join("")}</div>` :
      `<div class="empty"><strong>待整理箱已经清空</strong><span>下次看到喜欢的教程，粘贴文字就能先收进来。</span></div>`}
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTogether() {
  const selectedRecipes = state.togetherRecipeIds
    .map(id => state.recipes.find(recipe => recipe.id === Number(id)))
    .filter(Boolean);
  const plan = isTogetherPlan(state.togetherPlan) ? state.togetherPlan : null;
  viewRoot.innerHTML = `
    ${renderResumeCard()}
    <div class="view-head">
      <div>
        <span class="eyebrow">多菜协同</span>
        <h1>一起做，少忙一阵</h1>
        <p>从菜谱库加入 2–6 道菜，AI 会合并备料，并利用等待时间穿插安排步骤。</p>
      </div>
      <div class="head-actions">
        <button class="button secondary" data-nav="library">去菜谱库添加</button>
        <button class="button primary" data-generate-together ${selectedRecipes.length < 2 || state.togetherLoading ? "disabled" : ""}>
          ${state.togetherLoading ? "正在规划…" : `生成烹饪计划（${selectedRecipes.length}）`}
        </button>
      </div>
    </div>
    ${selectedRecipes.length ? `
      <section class="together-selection">
        <div class="selection-head">
          <div><span class="eyebrow">本次菜单</span><strong>已从菜谱库加入 ${selectedRecipes.length} 道菜</strong></div>
          <span>返回菜谱库可继续添加或移除</span>
        </div>
        <div class="together-picker selected-recipes">
          ${selectedRecipes.map(recipe => `
            <article class="together-card">
              <img src="${recipe.image}" alt="">
              <span><strong>${escapeHtml(recipe.title)}</strong><small>${recipe.time} 分钟 · ${recipe.servings} 人份</small></span>
              <button class="icon-button together-remove" data-toggle-together="${recipe.id}" aria-label="从一起做移除">×</button>
            </article>
          `).join("")}
        </div>
      </section>
    ` : `
      <div class="empty together-empty">
        <strong>还没有加入准备一起做的菜</strong>
        <span>请前往菜谱库，在菜谱卡片或详情中点击“加入一起做”。</span>
        <button class="button primary" data-nav="library">前往菜谱库</button>
      </div>
    `}
    <div id="togetherStatus" class="recognize-status ${state.togetherLoading ? "show loading" : ""}" role="status">
      ${state.togetherLoading ? "AI 正在合并备料并安排并行步骤，通常需要几秒钟…" : ""}
    </div>
    ${plan ? renderTogetherPlan(plan) : selectedRecipes.length ? `
      <div class="empty together-empty">
        <strong>${selectedRecipes.length < 2 ? "还需要再加入至少一道菜" : "菜单已准备好"}</strong>
        <span>${selectedRecipes.length < 2 ? "一起做至少需要两道菜。" : "点击上方按钮，让 AI 合并备料并安排烹饪顺序。"}</span>
      </div>
    ` : ""}
  `;
}

function isTogetherPlan(plan) {
  return Boolean(
    plan &&
    Array.isArray(plan.recipeTitles) &&
    Array.isArray(plan.prep) &&
    Array.isArray(plan.timeline) &&
    Array.isArray(plan.tips)
  );
}

function renderTogetherPlan(plan) {
  return `
    <section class="together-plan">
      <div class="plan-summary">
        <div><span>计划菜品</span><strong>${plan.recipeTitles.map(escapeHtml).join("、")}</strong></div>
        <div><span>预计总用时</span><strong>约 ${plan.totalTime} 分钟</strong></div>
        <div><span>调度目标</span><strong>尽量同时出锅</strong></div>
        <div class="plan-actions">
          <button class="button secondary small" data-generate-together>重新规划</button>
          <button class="button primary small" data-start-together>开始一起做</button>
        </div>
      </div>
      <div class="plan-columns">
        <section class="plan-panel">
          <span class="eyebrow">一次备好</span>
          <h2>合并备料</h2>
          <div class="prep-list">
            ${plan.prep.map(item => `
              <article>
                <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.totalAmount)}</span></div>
                <p>${escapeHtml(item.prep)}</p>
                <small>用于：${item.usedIn.map(escapeHtml).join("、")}</small>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="plan-panel">
          <span class="eyebrow">按这个顺序</span>
          <h2>并行时间线</h2>
          <ol class="plan-timeline">
            ${plan.timeline.map(item => `
              <li class="${item.type === "wait" ? "wait" : ""}">
                <time>${item.startMinute}–${item.startMinute + item.duration} 分钟</time>
                <div><strong>${escapeHtml(item.recipe)}</strong><p>${escapeHtml(item.action)}</p>${item.parallelNote ? `<small>${escapeHtml(item.parallelNote)}</small>` : ""}</div>
              </li>
            `).join("")}
          </ol>
        </section>
      </div>
      ${plan.tips.length ? `<div class="plan-tips"><strong>关键提醒</strong><ul>${plan.tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></div>` : ""}
    </section>
  `;
}

function render() {
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === state.view));
  searchInput.placeholder = state.view === "inbox"
    ? "搜索会自动返回菜谱库"
    : state.view === "together" ? "搜索菜谱并添加到一起做" : "搜索菜名、食材或标签";
  if (state.view === "inbox") renderInbox();
  else if (state.view === "together") renderTogether();
  else renderLibrary();
  save();
}

function openRecipe(id) {
  const recipe = state.recipes.find(item => item.id === Number(id));
  if (!recipe) return;
  const isTogether = state.togetherRecipeIds.includes(recipe.id);
  state.activeRecipe = recipe;
  document.querySelector("#recipeDetail").innerHTML = `
    <div class="detail-hero">
      <img src="${recipe.image}" alt="${recipe.title}">
      <button class="icon-button detail-close" data-close-detail aria-label="关闭">×</button>
      <div class="detail-title"><span>做过 ${recipe.cooked} 次</span><h2>${recipe.title}</h2><div class="tag-row">${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div></div>
    </div>
    <div class="detail-content">
      <div class="detail-stats">
        <div class="stat"><span>准备与烹饪</span><strong>${recipe.time} 分钟</strong></div>
        <div class="stat"><span>难度</span><strong>${recipe.difficulty}</strong></div>
        <div class="stat"><span>份量</span><strong>${recipe.servings} 人份</strong></div>
        <div class="stat"><span>估算热量</span><strong>${Number(recipe.calories) > 0 ? `${recipe.calories} 千卡/份` : "待估算"}</strong></div>
      </div>
      <div class="detail-columns">
        <section><h3 class="section-title">食材清单</h3><ul class="ingredient-list">${recipe.ingredients.map(([name, amount]) => `<li><span>${name}</span><strong>${amount}</strong></li>`).join("")}</ul></section>
        <section><h3 class="section-title">制作步骤</h3><ol class="steps">${recipe.steps.map(step => `
          <li>
            ${escapeHtml(step.text)}
            ${step.items ? `<small class="step-ingredients">本步用料：${escapeHtml(step.items)}</small>` : ""}
          </li>`).join("")}</ol>
          <div class="personal-note"><span class="eyebrow">我的调整</span><p>${recipe.note}</p></div>
        </section>
      </div>
    </div>
    <div class="detail-footer">
      <div>
        <button class="button secondary" data-edit-recipe="${recipe.id}">编辑菜谱</button>
        <button class="button secondary" data-favorite="${recipe.id}">${recipe.favorite ? "★ 已加入常做" : "☆ 加入常做"}</button>
        <button class="button secondary ${isTogether ? "together-added" : ""}" data-toggle-together="${recipe.id}" aria-pressed="${isTogether}">
          ${isTogether ? "✓ 已加入一起做" : "＋ 加入一起做"}
        </button>
        <button class="button danger" data-delete-recipe="${recipe.id}">删除菜谱</button>
      </div>
      <button class="button primary" data-start-cook="${recipe.id}">开始做菜 →</button>
    </div>`;
  if (!recipeDialog.open) recipeDialog.showModal();
}

function openCook(id) {
  const recipe = state.recipes.find(item => item.id === Number(id));
  if (!recipe) return;
  state.activeRecipe = recipe;
  state.cookMode = "single";
  state.cookStep = 0;
  clearCookingTimers();
  persistCookingSession();
  recipeDialog.close();
  renderCook();
  cookDialog.showModal();
}

function openTogetherCook() {
  if (!isTogetherPlan(state.togetherPlan)) {
    toast("请先生成一起做计划");
    return;
  }
  state.cookMode = "together";
  state.activeRecipe = null;
  state.cookStep = 0;
  clearCookingTimers();
  persistCookingSession();
  renderCook();
  cookDialog.showModal();
}

function renderCook() {
  const togetherMode = state.cookMode === "together";
  const recipe = state.activeRecipe;
  const steps = togetherMode ? state.togetherPlan.timeline : recipe.steps;
  const step = steps[state.cookStep];
  const isLast = state.cookStep === steps.length - 1;
  const title = togetherMode ? "一起做" : recipe.title;
  const stepTitle = togetherMode ? step.recipe : `步骤 ${state.cookStep + 1}`;
  const stepText = togetherMode ? step.action : step.text;
  const timerSeconds = togetherMode
    ? (step.type === "wait" ? Math.max(0, Number(step.duration) * 60) : 0)
    : getStepTimerSeconds(step);
  const timerKey = `${togetherMode ? "together" : recipe.id}-${state.cookStep}`;
  const timerExists = state.activeTimers.some(timer => timer.key === timerKey);
  const timelineContext = togetherMode ? renderTimelineContext(steps) : "";
  document.querySelector("#cookView").innerHTML = `
    <div class="cook-shell">
      <div>
        <header class="cook-head"><button class="icon-button" data-close-cook aria-label="退出做饭模式">×</button><strong>${title}</strong><span>${state.cookStep + 1}/${steps.length}</span></header>
        <div class="cook-progress"><span style="width:${(state.cookStep + 1) / steps.length * 100}%"></span></div>
      </div>
      <main class="cook-main">
        <div class="cook-session-tools">
          ${"Notification" in window && Notification.permission !== "granted"
            ? `<button class="button secondary small" data-enable-notifications>开启后台提醒</button>`
            : ""}
        </div>
        ${timelineContext}
        <span class="step-count">${escapeHtml(stepTitle)}</span>
        <div class="cook-step">${escapeHtml(stepText)}</div>
        ${togetherMode && step.parallelNote ? `<p class="cook-note">${escapeHtml(step.parallelNote)}</p>` : ""}
        ${timerSeconds ? `
          <div class="step-timer-start">
            <span>建议计时 ${formatTime(timerSeconds)}</span>
            <button class="button secondary" data-add-timer="${timerKey}" data-timer-seconds="${timerSeconds}" data-timer-label="${escapeHtml(`${stepTitle}：${stepText}`)}" ${timerExists ? "disabled" : ""}>
              ${timerExists ? "计时器已添加" : "＋ 添加计时器"}
            </button>
          </div>
        ` : ""}
        ${renderActiveTimers()}
      </main>
      <footer class="cook-controls">
        <button class="button secondary" data-cook-prev ${state.cookStep === 0 ? "disabled" : ""}>← 上一步</button>
        <button class="button primary" data-cook-next>${isLast ? (togetherMode ? "完成全部菜 ✓" : "完成这道菜 ✓") : "下一步 →"}</button>
      </footer>
    </div>`;
}

function renderTimelineContext(steps) {
  const previous = steps[state.cookStep - 1];
  const current = steps[state.cookStep];
  const next = steps[state.cookStep + 1];
  return `
    <section class="timeline-context">
      <article><span>刚刚完成</span><strong>${previous ? `${escapeHtml(previous.recipe)}：${escapeHtml(previous.action)}` : "准备开始"}</strong></article>
      <article class="current"><span>现在进行</span><strong>${escapeHtml(current.recipe)}：${escapeHtml(current.action)}</strong></article>
      <article><span>下一项</span><strong>${next ? `${escapeHtml(next.recipe)}：${escapeHtml(next.action)}` : "完成全部菜"}</strong></article>
    </section>
  `;
}

function getStepTimerSeconds(step) {
  if (Number(step.timer) > 0) return Number(step.timer);
  const text = String(step.text || "");
  const hour = text.match(/(\d+(?:\.\d+)?)\s*(?:小时|钟头)/);
  const minute = text.match(/(\d+(?:\.\d+)?)\s*分钟/);
  const second = text.match(/(\d+(?:\.\d+)?)\s*秒/);
  return Math.round(
    (hour ? Number(hour[1]) * 3600 : 0) +
    (minute ? Number(minute[1]) * 60 : 0) +
    (second ? Number(second[1]) : 0)
  );
}

function renderActiveTimers() {
  if (!state.activeTimers.length) return "";
  return `
    <section class="active-timers">
      <div class="active-timers-head"><strong>进行中的计时器</strong><span>${state.activeTimers.length} 个</span></div>
      ${state.activeTimers.map(timer => `
        <article class="active-timer ${timer.remaining <= 0 ? "finished" : ""}">
          <div><strong>${escapeHtml(timer.label)}</strong><span data-timer-display="${timer.id}">${formatTime(Math.max(0, timer.remaining))}</span></div>
          <div class="timer-actions">
            <button class="button secondary small" data-timer-toggle="${timer.id}" ${timer.remaining <= 0 ? "disabled" : ""}>${timer.running ? "暂停" : "继续"}</button>
            <button class="button secondary small" data-timer-reset="${timer.id}">重置</button>
            <button class="button secondary small" data-timer-remove="${timer.id}">完成</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function finishCooking() {
  if (state.cookMode === "together") {
    const selectedIds = new Set(state.togetherRecipeIds.map(Number));
    state.recipes.forEach(recipe => {
      if (selectedIds.has(recipe.id)) recipe.cooked += 1;
    });
    toast("已记录：一起完成这桌菜");
  } else {
    state.activeRecipe.cooked += 1;
    toast(`已记录：完成 ${state.activeRecipe.title}`);
  }
  clearCookingSession();
  cookDialog.close();
  save();
  render();
}

async function openOrganizer(id) {
  const item = state.inbox.find(entry => entry.id === Number(id));
  if (!item) return;

  prepareRecipeForm("create");
  organizeForm.elements.inboxId.value = item.id;
  organizeForm.elements.title.value = item.title;
  organizeDialog.showModal();
  organizeForm.elements.title.focus();
  await recognizeRecipe(item);
}

function createBackup() {
  return {
    app: "灶边",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    recipes: state.recipes,
    inbox: state.inbox
  };
}

function exportBackup() {
  const content = JSON.stringify(createBackup(), null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `灶边备份-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  state.lastBackupAt = new Date().toISOString();
  localStorage.setItem("zaobian-last-backup", state.lastBackupAt);
  renderBackupStatus();
  toast(`已导出 ${state.recipes.length} 道菜谱`);
}

function validateBackup(value) {
  if (!value || typeof value !== "object") throw new Error("备份文件内容无效");
  if (value.app !== "灶边") throw new Error("这不是灶边生成的备份文件");
  if (value.version !== BACKUP_VERSION) throw new Error("备份版本不受支持");
  if (!Array.isArray(value.recipes) || !Array.isArray(value.inbox)) {
    throw new Error("备份缺少菜谱或待整理数据");
  }
  if (value.recipes.length > 2000 || value.inbox.length > 2000) {
    throw new Error("备份中的数据条目过多");
  }

  const assertPlainText = (text, label) => {
    const value = String(text ?? "");
    if (/[<>]/.test(value)) throw new Error(`${label}包含不安全的字符`);
    return value;
  };

  const recipes = value.recipes.map((recipe, index) => {
    if (!recipe || typeof recipe !== "object" || !String(recipe.title || "").trim()) {
      throw new Error(`第 ${index + 1} 道菜谱缺少菜名`);
    }
    if (!Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
      throw new Error(`“${recipe.title}”的食材或步骤格式无效`);
    }
    assertPlainText(recipe.title, `第 ${index + 1} 道菜谱`);
    assertPlainText(recipe.note, `“${recipe.title}”的备注`);
    const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
    tags.forEach(tag => assertPlainText(tag, `“${recipe.title}”的标签`));
    const ingredients = recipe.ingredients.map(item => {
      if (!Array.isArray(item) || !String(item[0] || "").trim()) {
        throw new Error(`“${recipe.title}”的食材格式无效`);
      }
      assertPlainText(item[0], `“${recipe.title}”的食材`);
      assertPlainText(item[1], `“${recipe.title}”的用量`);
      return [String(item[0]).trim(), String(item[1] || "适量").trim()];
    });
    const steps = recipe.steps.map(step => {
      if (!step || typeof step !== "object" || !String(step.text || "").trim()) {
        throw new Error(`“${recipe.title}”的步骤格式无效`);
      }
      assertPlainText(step.text, `“${recipe.title}”的步骤`);
      return {
        text: String(step.text).trim(),
        items: assertPlainText(step.items, `“${recipe.title}”的步骤用料`),
        ...(Number(step.timer) > 0 ? { timer: Number(step.timer) } : {})
      };
    });
    const image = String(recipe.image || DEFAULT_COVER);
    if (!/^(?:assets\/[\w.-]+|data:image\/(?:jpeg|png|webp);base64,)/i.test(image)) {
      throw new Error(`“${recipe.title}”的封面格式无效`);
    }
    return {
      id: Number(recipe.id) || Date.now() + index,
      title: String(recipe.title).trim(),
      image,
      time: Math.max(1, Number(recipe.time) || 30),
      calories: Math.max(0, Number(recipe.calories) || 0),
      difficulty: ["简单", "中等", "较难"].includes(recipe.difficulty) ? recipe.difficulty : "简单",
      servings: Math.max(1, Number(recipe.servings) || 2),
      favorite: Boolean(recipe.favorite),
      cooked: Math.max(0, Number(recipe.cooked) || 0),
      tags: tags.map(tag => String(tag).trim()).filter(Boolean),
      ingredients,
      steps,
      note: String(recipe.note || "暂无个人调整。").trim()
    };
  });
  const inbox = value.inbox.map((item, index) => {
    if (!item || typeof item !== "object" || !String(item.shareText || "").trim()) {
      throw new Error(`第 ${index + 1} 条待整理教程缺少文字内容`);
    }
    assertPlainText(item.title, `第 ${index + 1} 条待整理教程`);
    assertPlainText(item.shareText, `第 ${index + 1} 条待整理教程`);
    return {
      id: Number(item.id) || Date.now() + recipes.length + index,
      title: String(item.title || "未命名教程").trim(),
      shareText: String(item.shareText).trim(),
      savedAt: assertPlainText(item.savedAt, `第 ${index + 1} 条待整理教程的保存时间`) || "已导入"
    };
  });

  return { recipes, inbox };
}

async function importBackup(file) {
  if (!file) return;
  if (file.size > MAX_BACKUP_BYTES) throw new Error("备份文件超过 25 MB，无法导入");

  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("无法解析备份文件，请确认它是完整的 JSON 文件");
  }
  const backup = validateBackup(parsed);
  const confirmed = window.confirm(
    `导入后将替换当前的 ${state.recipes.length} 道菜谱和 ${state.inbox.length} 条待整理教程。\n\n确定继续吗？`
  );
  if (!confirmed) return;

  const previousRecipes = state.recipes;
  const previousInbox = state.inbox;
  state.recipes = backup.recipes;
  state.inbox = backup.inbox;
  state.togetherRecipeIds = [];
  state.togetherPlan = null;
  clearCookingSession();
  state.view = "library";
  state.filter = "全部";
  state.query = "";
  searchInput.value = "";
  try {
    save();
  } catch {
    state.recipes = previousRecipes;
    state.inbox = previousInbox;
    throw new Error("浏览器存储空间不足，备份未导入");
  }
  render();
  toast(`备份已恢复，共 ${state.recipes.length} 道菜谱`);
}

function prepareRecipeForm(mode, recipe) {
  organizeForm.reset();
  organizeForm.elements.inboxId.value = "";
  organizeForm.elements.recipeId.value = recipe?.id || "";
  setCover(recipe?.image || DEFAULT_COVER);
  document.querySelector("#organizeStatus").className = "recognize-status";
  document.querySelector("#organizeStatus").textContent = "";
  document.querySelector("#organizeEyebrow").textContent = mode === "edit" ? "编辑菜谱" : "整理教程";
  document.querySelector("#organizeTitle").textContent = mode === "edit" ? "修改菜谱" : "生成新的菜谱";
  document.querySelector("#organizeSubmit").textContent = mode === "edit" ? "保存修改" : "生成菜谱";
  organizeDialog.querySelector("[data-recognize]").hidden = mode === "edit";
}

function openManualEditor() {
  prepareRecipeForm("create");
  organizeDialog.showModal();
  organizeForm.elements.title.focus();
}

function openRecipeEditor(id) {
  const recipe = state.recipes.find(item => item.id === Number(id));
  if (!recipe) return;

  prepareRecipeForm("edit", recipe);
  organizeForm.elements.title.value = recipe.title;
  organizeForm.elements.time.value = recipe.time;
  organizeForm.elements.calories.value = recipe.calories || "";
  organizeForm.elements.servings.value = recipe.servings;
  organizeForm.elements.difficulty.value = recipe.difficulty;
  organizeForm.elements.tags.value = recipe.tags.join(", ");
  organizeForm.elements.ingredients.value = recipe.ingredients
    .map(([name, amount]) => `${name} | ${amount}`)
    .join("\n");
  organizeForm.elements.steps.value = recipe.steps
    .map(step => [
      step.text,
      step.items || "",
      Number(step.timer) > 0 ? step.timer : ""
    ].filter((part, index, parts) => index === 0 || part || parts.slice(index + 1).some(Boolean)).join(" | "))
    .join("\n");
  organizeForm.elements.note.value = recipe.note === "暂无个人调整。" ? "" : recipe.note;
  recipeDialog.close();
  organizeDialog.showModal();
  organizeForm.elements.title.focus();
}

function deleteRecipe(id) {
  const index = state.recipes.findIndex(recipe => recipe.id === id);
  if (index < 0) return;
  const recipe = state.recipes[index];
  const wasTogether = state.togetherRecipeIds.includes(id);
  const previousTogetherPlan = state.togetherPlan;
  if (!window.confirm(`确定删除“${recipe.title}”吗？\n\n删除后可在提示出现期间撤销。`)) return;

  state.recipes.splice(index, 1);
  state.togetherRecipeIds = state.togetherRecipeIds.filter(recipeId => recipeId !== id);
  state.togetherPlan = null;
  if (state.cookSession?.recipeId === id || state.cookSession?.mode === "together") {
    clearCookingSession();
  }
  recipeDialog.close();
  render();
  toast(`已删除“${recipe.title}”`, "撤销", () => {
    state.recipes.splice(Math.min(index, state.recipes.length), 0, recipe);
    if (wasTogether) state.togetherRecipeIds.push(id);
    state.togetherPlan = previousTogetherPlan;
    render();
  });
}

function setCover(image) {
  const cover = image || DEFAULT_COVER;
  organizeForm.elements.cover.value = cover;
  document.querySelector("#coverPreview").src = cover;
}

function setRecognizeStatus(message, type = "") {
  const status = document.querySelector("#organizeStatus");
  status.textContent = message;
  status.className = `recognize-status show ${type}`.trim();
}

function fillRecipeDraft(draft) {
  if (draft.title) organizeForm.elements.title.value = draft.title;
  if (draft.time) organizeForm.elements.time.value = draft.time;
  if (draft.calories) organizeForm.elements.calories.value = draft.calories;
  if (draft.servings) organizeForm.elements.servings.value = draft.servings;
  if (draft.difficulty) organizeForm.elements.difficulty.value = draft.difficulty;
  organizeForm.elements.tags.value = (draft.tags || []).join(", ");
  organizeForm.elements.ingredients.value = (draft.ingredients || [])
    .map(item => `${item.name} | ${item.amount || "适量"}`)
    .join("\n");
  organizeForm.elements.steps.value = (draft.steps || [])
    .map(step => [
      step.text,
      step.items || "",
      Number(step.timer) > 0 ? step.timer : ""
    ].filter((part, index, parts) => index === 0 || part || parts.slice(index + 1).some(Boolean)).join(" | "))
    .join("\n");
  organizeForm.elements.note.value = draft.note || "";
}

async function recognizeRecipe(item) {
  if (!recipeApiUrl) {
    setRecognizeStatus("尚未配置 AI 整理服务。可以先手动整理，部署 Worker 后在 config.js 中填写接口地址。", "error");
    return;
  }

  const recognizeButton = organizeDialog.querySelector("[data-recognize]");
  const requestId = ++recognizeRequestId;
  recognizeButton.disabled = true;
  let elapsedSeconds = 0;
  const statusTimer = setInterval(() => {
    elapsedSeconds += 1;
    if (requestId === recognizeRequestId && organizeDialog.open) {
      setRecognizeStatus(
        `AI 正在整理教程文字，已等待 ${elapsedSeconds} 秒…`,
        "loading"
      );
    }
  }, 1000);
  setRecognizeStatus("AI 正在整理教程文字并生成菜谱草稿…", "loading");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    let response;
    try {
      response = await fetch(recipeApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          title: item.title,
          shareText: item.shareText || ""
        })
      });
    } finally {
      clearTimeout(timeoutId);
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI 整理服务暂时不可用");
    if (requestId !== recognizeRequestId || !organizeDialog.open) return;

    fillRecipeDraft(result.recipe);
    setRecognizeStatus(
      result.needsMoreText
        ? "已生成草稿，但原文信息可能不完整，请重点检查食材用量和步骤。"
        : "已根据教程文字生成草稿，请检查后保存。"
    );
  } catch (error) {
    if (requestId !== recognizeRequestId || !organizeDialog.open) return;
    const message = error.name === "AbortError"
      ? "整理超过 120 秒，已停止，请稍后重试"
      : error.message;
    setRecognizeStatus(`${message}。你仍然可以手动填写并生成菜谱。`, "error");
  } finally {
    clearInterval(statusTimer);
    if (requestId === recognizeRequestId) recognizeButton.disabled = false;
  }
}

function parseIngredients(value) {
  return value.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name, ...amountParts] = line.split("|");
      return [name.trim(), amountParts.join("|").trim() || "适量"];
    });
}

function parseSteps(value) {
  return value.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s*\|\s*/);
      const text = parts.shift() || "";
      const lastPart = parts.at(-1) || "";
      const hasTimer = /^\d+$/.test(lastPart);
      const timerText = hasTimer ? parts.pop() : "";
      const items = parts.join(" | ").trim();
      const timer = Math.max(0, Number(timerText) || 0);
      return {
        text: text.trim(),
        items,
        ...(timer > 0 ? { timer } : {})
      };
    });
}

async function generateTogetherPlan() {
  const recipes = state.togetherRecipeIds
    .map(id => state.recipes.find(recipe => recipe.id === Number(id)))
    .filter(Boolean);
  if (recipes.length < 2) {
    toast("请至少选择两道菜");
    return;
  }
  if (!recipeApiUrl) {
    toast("尚未配置 AI 服务");
    return;
  }

  if (state.cookSession?.mode === "together") clearCookingSession();
  state.togetherLoading = true;
  render();
  try {
    const requestBody = {
      action: "plan_together",
      recipes: recipes.map(recipe => ({
        title: recipe.title,
        time: recipe.time,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(([name, amount]) => ({ name, amount })),
        steps: recipe.steps.map(step => ({
          text: step.text,
          items: step.items || "",
          timer: Number(step.timer) || 0
        })),
        note: recipe.note
      }))
    };
    const response = await fetchWithRetry(recipeApiUrl, requestBody);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI 暂时无法生成计划");
    state.togetherPlan = result.plan;
    save();
  } catch (error) {
    if (error.name === "TypeError" || error.name === "AbortError") {
      state.togetherPlan = buildLocalTogetherPlan(recipes);
      save();
      toast("未连接到 AI，已生成基础烹饪计划");
    } else {
      toast(error.message);
    }
  } finally {
    state.togetherLoading = false;
    render();
  }
}

async function fetchWithRetry(url, body, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    try {
      return await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(body)
      });
    } catch (error) {
      lastError = error;
      if (error.name !== "TypeError" || attempt === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1200));
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

function buildLocalTogetherPlan(recipes) {
  const ingredientGroups = new Map();
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(([name, amount]) => {
      const key = name.replace(/\s+/g, "").toLowerCase();
      if (!ingredientGroups.has(key)) ingredientGroups.set(key, { name, entries: [] });
      ingredientGroups.get(key).entries.push({ recipe: recipe.title, amount });
    });
  });
  const prep = [...ingredientGroups.values()].map(group => ({
    name: group.name,
    totalAmount: group.entries.length === 1
      ? group.entries[0].amount
      : group.entries.map(entry => `${entry.recipe} ${entry.amount}`).join("；"),
    usedIn: group.entries.map(entry => entry.recipe),
    prep: "统一清洗、切配后按菜分装"
  }));

  const prepMinutes = Math.max(5, recipes.length * 3);
  const timeline = [{
    startMinute: 0,
    duration: prepMinutes,
    recipe: "通用备料",
    action: "清洗并切配全部食材，按菜分装调味料",
    type: "active",
    parallelNote: ""
  }];

  const recipeSchedules = recipes.map(recipe => {
    const steps = recipe.steps.map(step => {
      const waitMinutes = Math.max(0, Math.round((Number(step.timer) || 0) / 60));
      return {
        step,
        waitMinutes,
        duration: waitMinutes || 3
      };
    });
    return {
      recipe,
      steps,
      duration: steps.reduce((total, item) => total + item.duration, 0)
    };
  });
  const cookingMinutes = Math.max(...recipeSchedules.map(schedule => schedule.duration));
  const targetFinish = prepMinutes + cookingMinutes;

  recipeSchedules.forEach(schedule => {
    let minute = targetFinish - schedule.duration;
    const { recipe } = schedule;
    schedule.steps.forEach(({ step, waitMinutes, duration }, index) => {
      timeline.push({
        startMinute: minute,
        duration,
        recipe: recipe.title,
        action: step.text,
        type: waitMinutes >= 3 ? "wait" : "active",
        parallelNote: index === schedule.steps.length - 1
          ? `预计第 ${targetFinish} 分钟出锅`
          : waitMinutes >= 3 ? "等待期间穿插其他菜步骤" : ""
      });
      minute += duration;
    });
  });
  timeline.sort((a, b) => a.startMinute - b.startMinute || (a.type === "wait" ? 1 : -1));
  return {
    recipeTitles: recipes.map(recipe => recipe.title),
    totalTime: targetFinish,
    prep,
    timeline,
    tips: [
      `各道菜按第 ${targetFinish} 分钟同步出锅倒排，请根据实际火力前后微调 1–3 分钟。`,
      "这是离线基础计划；网络恢复后可点击“重新规划”获得更合理的灶眼与主动操作安排。"
    ]
  };
}

function toggleTogetherRecipe(id) {
  if (state.cookSession?.mode === "together") clearCookingSession();
  if (state.togetherRecipeIds.includes(id)) {
    state.togetherRecipeIds = state.togetherRecipeIds.filter(recipeId => recipeId !== id);
    toast("已从一起做移除");
  } else if (state.togetherRecipeIds.length < 6) {
    state.togetherRecipeIds.push(id);
    toast("已加入一起做");
  } else {
    toast("一次最多加入 6 道菜");
    return false;
  }
  state.togetherPlan = null;
  save();
  return true;
}

document.addEventListener("click", event => {
  if (event.target.closest("[data-resume-cook]")) {
    resumeCookingSession();
    return;
  }
  if (event.target.closest("[data-discard-cook-session]")) {
    clearCookingSession();
    render();
    return;
  }
  if (event.target.closest("[data-enable-notifications]")) {
    enableCookingNotifications();
    return;
  }
  if (event.target.closest("[data-export-backup]")) {
    exportBackup();
    return;
  }
  if (event.target.closest("[data-import-backup]")) {
    document.querySelector("#backupFile").click();
    return;
  }
  const togetherToggle = event.target.closest("[data-toggle-together]");
  if (togetherToggle) {
    const id = Number(togetherToggle.dataset.toggleTogether);
    if (toggleTogetherRecipe(id)) {
      if (recipeDialog.open) {
        openRecipe(id);
      } else {
        render();
      }
    }
    return;
  }
  if (event.target.closest("[data-generate-together]")) {
    generateTogetherPlan();
    return;
  }
  if (event.target.closest("[data-start-together]")) {
    openTogetherCook();
    return;
  }
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    state.view = nav.dataset.nav;
    state.filter = "全部";
    document.querySelector(".sidebar").classList.remove("open");
    render();
  }
  if (event.target.closest("[data-action='import']")) {
    document.querySelector("#importForm").reset();
    setImportStatus("");
    importDialog.showModal();
    importDialog.querySelector("[name='title']").focus();
  }
  if (event.target.closest("[data-close-import]")) importDialog.close();
  if (event.target.closest("[data-close-organize]")) {
    recognizeRequestId++;
    organizeDialog.close();
  }
  if (event.target.closest("[data-recognize]")) {
    const item = state.inbox.find(entry => entry.id === Number(organizeForm.elements.inboxId.value));
    if (item) recognizeRecipe(item);
  }
  if (event.target.closest("[data-action='manual-add']")) {
    openManualEditor();
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) { state.filter = filter.dataset.filter; render(); }
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    event.stopPropagation();
    const recipe = state.recipes.find(item => item.id === Number(favorite.dataset.favorite));
    recipe.favorite = !recipe.favorite;
    save();
    if (recipeDialog.open) openRecipe(recipe.id); else render();
    toast(recipe.favorite ? "已加入常做菜" : "已从常做菜移除");
  }
  const card = event.target.closest("[data-recipe]");
  if (card) openRecipe(card.dataset.recipe);
  const editRecipe = event.target.closest("[data-edit-recipe]");
  if (editRecipe) openRecipeEditor(editRecipe.dataset.editRecipe);
  const deleteRecipeButton = event.target.closest("[data-delete-recipe]");
  if (deleteRecipeButton) deleteRecipe(Number(deleteRecipeButton.dataset.deleteRecipe));
  if (event.target.closest("[data-close-detail]")) recipeDialog.close();
  const start = event.target.closest("[data-start-cook]");
  if (start) openCook(start.dataset.startCook);
  if (event.target.closest("[data-close-cook]")) {
    persistCookingSession();
    cookDialog.close();
    render();
  }
  const organize = event.target.closest("[data-organize]");
  if (organize) openOrganizer(organize.dataset.organize);
  const del = event.target.closest("[data-delete-inbox]");
  if (del) {
    const id = Number(del.dataset.deleteInbox);
    const index = state.inbox.findIndex(entry => entry.id === id);
    const [removed] = index >= 0 ? state.inbox.splice(index, 1) : [];
    render();
    if (removed) {
      toast("已删除待整理教程", "撤销", () => {
        state.inbox.splice(Math.max(0, index), 0, removed);
        render();
      });
    }
  }
  if (event.target.closest("[data-cook-prev]") && state.cookStep > 0) {
    state.cookStep--;
    persistCookingSession();
    renderCook();
  }
  if (event.target.closest("[data-cook-next]")) {
    const stepCount = state.cookMode === "together"
      ? state.togetherPlan.timeline.length
      : state.activeRecipe.steps.length;
    if (state.cookStep < stepCount - 1) {
      state.cookStep++;
      persistCookingSession();
      renderCook();
    }
    else finishCooking();
  }
  const addTimer = event.target.closest("[data-add-timer]");
  if (addTimer) {
    addCookingTimer(addTimer.dataset.addTimer, addTimer.dataset.timerLabel, Number(addTimer.dataset.timerSeconds));
  }
  const toggleTimer = event.target.closest("[data-timer-toggle]");
  if (toggleTimer) toggleCookingTimer(toggleTimer.dataset.timerToggle);
  const resetTimer = event.target.closest("[data-timer-reset]");
  if (resetTimer) resetCookingTimer(resetTimer.dataset.timerReset);
  const removeTimer = event.target.closest("[data-timer-remove]");
  if (removeTimer) removeCookingTimer(removeTimer.dataset.timerRemove);
});

document.addEventListener("keydown", event => {
  if (event.target.closest?.("button")) return;
  const card = event.target.closest?.("[data-recipe]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openRecipe(card.dataset.recipe);
  }
});

function persistCookingSession() {
  const recipeId = state.cookMode === "single" ? state.activeRecipe?.id : null;
  if (state.cookMode === "single" && !recipeId) return;
  const now = Date.now();
  state.cookSession = {
    mode: state.cookMode,
    recipeId,
    cookStep: state.cookStep,
    activeTimers: state.activeTimers.map(timer => ({
      ...timer,
      remaining: timer.running && timer.endsAt
        ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
        : timer.remaining
    }))
  };
  localStorage.setItem("zaobian-cook-session", JSON.stringify(state.cookSession));
}

function resumeCookingSession() {
  const session = state.cookSession;
  if (!session) return;
  if (session.mode === "together" && !isTogetherPlan(state.togetherPlan)) {
    clearCookingSession();
    toast("原一起做计划已失效，请重新生成");
    render();
    return;
  }
  const recipe = session.mode === "single"
    ? state.recipes.find(item => item.id === Number(session.recipeId))
    : null;
  if (session.mode === "single" && !recipe) {
    clearCookingSession();
    render();
    return;
  }

  state.cookMode = session.mode;
  state.activeRecipe = recipe;
  const steps = session.mode === "together" ? state.togetherPlan.timeline : recipe.steps;
  state.cookStep = Math.min(Math.max(0, Number(session.cookStep) || 0), steps.length - 1);
  const now = Date.now();
  state.activeTimers = (session.activeTimers || []).map(timer => {
    const remaining = timer.running && timer.endsAt
      ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
      : Math.max(0, Number(timer.remaining) || 0);
    return {
      ...timer,
      remaining,
      running: Boolean(timer.running && remaining > 0),
      endsAt: timer.running && remaining > 0 ? Number(timer.endsAt) : null
    };
  });
  ensureTimerTicker();
  renderCook();
  cookDialog.showModal();
}

function clearCookingSession() {
  clearCookingTimers();
  state.cookSession = null;
  localStorage.removeItem("zaobian-cook-session");
}

async function enableCookingNotifications() {
  if (!("Notification" in window)) {
    toast("当前浏览器不支持系统通知");
    return;
  }
  const permission = await Notification.requestPermission();
  toast(permission === "granted" ? "后台计时提醒已开启" : "未获得通知权限");
  renderCook();
}

function addCookingTimer(key, label, seconds) {
  if (!seconds || state.activeTimers.some(timer => timer.key === key)) return;
  prepareTimerAudio();
  state.activeTimers.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    key,
    label,
    total: seconds,
    remaining: seconds,
    running: true,
    endsAt: Date.now() + seconds * 1000
  });
  ensureTimerTicker();
  persistCookingSession();
  renderCook();
}

function toggleCookingTimer(id) {
  const timer = state.activeTimers.find(item => item.id === id);
  if (!timer || timer.remaining <= 0) return;
  if (timer.running) {
    timer.remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    timer.running = false;
    timer.endsAt = null;
  } else {
    prepareTimerAudio();
    timer.running = true;
    timer.endsAt = Date.now() + timer.remaining * 1000;
  }
  ensureTimerTicker();
  persistCookingSession();
  renderCook();
}

function resetCookingTimer(id) {
  const timer = state.activeTimers.find(item => item.id === id);
  if (!timer) return;
  timer.remaining = timer.total;
  timer.running = false;
  timer.endsAt = null;
  persistCookingSession();
  renderCook();
}

function removeCookingTimer(id) {
  state.activeTimers = state.activeTimers.filter(timer => timer.id !== id);
  stopTimerTickerIfIdle();
  persistCookingSession();
  renderCook();
}

function ensureTimerTicker() {
  if (state.timerTickerId || !state.activeTimers.some(timer => timer.running && timer.remaining > 0)) return;
  state.timerTickerId = setInterval(() => {
    let completed = false;
    const now = Date.now();
    state.activeTimers.forEach(timer => {
      if (!timer.running || timer.remaining <= 0) return;
      const previousRemaining = timer.remaining;
      timer.remaining = Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
      if (previousRemaining > 0 && timer.remaining <= 0) {
        timer.remaining = 0;
        timer.running = false;
        timer.endsAt = null;
        completed = true;
      }
      const display = document.querySelector(`[data-timer-display="${timer.id}"]`);
      if (display) display.textContent = formatTime(timer.remaining);
    });
    if (completed) {
      playTimerAlarm();
      showTimerNotification();
      toast("计时结束，请检查对应菜品");
      persistCookingSession();
      renderCook();
    }
    stopTimerTickerIfIdle();
  }, 1000);
}

function stopTimerTickerIfIdle() {
  if (state.activeTimers.some(timer => timer.running && timer.remaining > 0)) return;
  clearInterval(state.timerTickerId);
  state.timerTickerId = null;
}

function clearCookingTimers() {
  clearInterval(state.timerTickerId);
  state.timerTickerId = null;
  state.activeTimers = [];
}

function showTimerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification("灶边计时结束", {
      body: "请返回查看对应菜品步骤。",
      tag: "zaobian-timer"
    });
  } catch {}
}

function prepareTimerAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!timerAudioContext) timerAudioContext = new AudioContextClass();
  if (timerAudioContext.state === "suspended") {
    timerAudioContext.resume().catch(() => {});
  }
  return timerAudioContext;
}

function playTimerAlarm() {
  const audioContext = prepareTimerAudio();
  if (!audioContext) return;

  const play = () => {
    const start = audioContext.currentTime;
    [0, 0.32, 0.64].forEach((delay, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = index === 2 ? 1046 : 880;
      gain.gain.setValueAtTime(0.0001, start + delay);
      gain.gain.exponentialRampToValueAtTime(0.22, start + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.22);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start + delay);
      oscillator.stop(start + delay + 0.24);
    });
    navigator.vibrate?.([180, 100, 180, 100, 260]);
  };

  if (audioContext.state === "suspended") {
    audioContext.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

function setImportStatus(message, type = "") {
  const status = document.querySelector("#importStatus");
  status.textContent = message;
  status.className = message ? `recognize-status show ${type}`.trim() : "recognize-status";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`无法读取图片：${file.name}`));
    };
    image.src = url;
  });
}

async function compressImage(file) {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_COVER_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法处理图片");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let blob;
  for (const quality of [0.78, 0.65, 0.5]) {
    blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_COVER_BYTES) break;
  }
  if (!blob || blob.size > MAX_COVER_BYTES) {
    throw new Error("图片压缩后仍然过大，请选择尺寸较小的图片");
  }
  return blobToDataUrl(blob);
}

document.querySelector("#coverImage").addEventListener("change", async event => {
  const [file] = event.target.files;
  if (!file) return;
  event.target.disabled = true;
  setRecognizeStatus("正在处理封面图…", "loading");
  try {
    setCover(await compressImage(file));
    setRecognizeStatus("封面图已更新。");
  } catch (error) {
    event.target.value = "";
    setRecognizeStatus(error.message, "error");
  } finally {
    event.target.disabled = false;
  }
});

document.querySelector("#resetCover").addEventListener("click", () => {
  document.querySelector("#coverImage").value = "";
  setCover(DEFAULT_COVER);
  setRecognizeStatus("已恢复默认封面。");
});

document.querySelector("#backupFile").addEventListener("change", async event => {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  try {
    await importBackup(file);
  } catch (error) {
    toast(error.message || "备份导入失败");
  }
});

document.querySelector("#importForm").addEventListener("submit", event => {
  event.preventDefault();
  const importForm = event.currentTarget;
  const form = new FormData(importForm);
  const shareText = form.get("shareText")?.trim() || "";
  if (!shareText) {
    setImportStatus("请填写教程文字或字幕。", "error");
    return;
  }
  const title = form.get("title")?.trim() || "未命名教程";
  const organizeNow = form.get("organizeNow") === "on";
  const id = Date.now();
  state.inbox.unshift({
    id,
    title,
    shareText,
    savedAt: "刚刚"
  });
  importForm.reset();
  setImportStatus("");
  importDialog.close();
  state.view = "inbox";
  render();
  toast("教程已收进待整理箱");
  if (organizeNow) openOrganizer(id);
});

organizeForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const inboxId = Number(form.get("inboxId"));
  const recipeId = Number(form.get("recipeId"));
  const existingRecipe = state.recipes.find(recipe => recipe.id === recipeId);
  const values = {
    title: form.get("title").trim(),
    image: form.get("cover") || DEFAULT_COVER,
    time: Number(form.get("time")),
    calories: Math.max(0, Number(form.get("calories")) || 0),
    difficulty: form.get("difficulty"),
    servings: Number(form.get("servings")),
    tags: form.get("tags").split(/[,，]/).map(tag => tag.trim()).filter(Boolean),
    ingredients: parseIngredients(form.get("ingredients")),
    steps: parseSteps(form.get("steps")),
    note: form.get("note").trim() || "暂无个人调整。"
  };

  let recipe;
  if (existingRecipe) {
    Object.assign(existingRecipe, values);
    recipe = existingRecipe;
  } else {
    recipe = {
      id: Date.now(),
      ...values,
      favorite: false,
      cooked: 0
    };
    state.recipes.unshift(recipe);
  }
  if (inboxId) state.inbox = state.inbox.filter(entry => entry.id !== inboxId);
  state.view = "library";
  state.filter = "全部";
  organizeDialog.close();
  event.currentTarget.reset();
  render();
  toast(existingRecipe ? `“${recipe.title}”已保存修改` : `“${recipe.title}”已生成菜谱`);
  openRecipe(recipe.id);
});

searchInput.addEventListener("input", event => {
  state.query = event.target.value;
  if (state.view === "inbox" || state.view === "together") state.view = "library";
  render();
});
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchInput.focus(); }
  if (event.key === "Escape") document.querySelector(".sidebar").classList.remove("open");
});
document.querySelector("#mobileMenu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
recipeDialog.addEventListener("click", event => { if (event.target === recipeDialog) recipeDialog.close(); });
importDialog.addEventListener("click", event => { if (event.target === importDialog) importDialog.close(); });
organizeDialog.addEventListener("click", event => {
  if (event.target === organizeDialog) {
    recognizeRequestId++;
    organizeDialog.close();
  }
});
cookDialog.addEventListener("cancel", event => {
  event.preventDefault();
  persistCookingSession();
  cookDialog.close();
  render();
});

render();
