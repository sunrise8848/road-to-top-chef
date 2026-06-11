const seedRecipes = [
  {
    id: 1, title: "番茄炒蛋", image: "assets/tomato-eggs.png", source: "小红书",
    time: 15, difficulty: "简单", servings: 2, favorite: true, cooked: 8,
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
    id: 2, title: "土豆烧鸡", image: "assets/braised-chicken.png", source: "抖音",
    time: 50, difficulty: "中等", servings: 3, favorite: true, cooked: 5,
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
    id: 3, title: "麻婆豆腐", image: "assets/mapo-tofu.png", source: "小红书",
    time: 25, difficulty: "中等", servings: 2, favorite: false, cooked: 2,
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
    id: 4, title: "蒜蓉西兰花", image: "assets/garlic-broccoli.png", source: "自己记录",
    time: 12, difficulty: "简单", servings: 2, favorite: false, cooked: 4,
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
  { id: 101, title: "空气炸锅蜜汁鸡翅", platform: "小红书", url: "#", savedAt: "今天 11:28" },
  { id: 102, title: "先收着：一锅到底焖饭", platform: "抖音", url: "#", savedAt: "昨天 20:14" }
];

const state = {
  recipes: JSON.parse(localStorage.getItem("zaobian-recipes")) || seedRecipes,
  inbox: JSON.parse(localStorage.getItem("zaobian-inbox")) || seedInbox,
  view: "library",
  filter: "全部",
  query: "",
  activeRecipe: null,
  cookStep: 0,
  timerId: null,
  seconds: 0
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

function save() {
  localStorage.setItem("zaobian-recipes", JSON.stringify(state.recipes));
  localStorage.setItem("zaobian-inbox", JSON.stringify(state.inbox));
  document.querySelector("#inboxCount").textContent = state.inbox.length;
}

function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => el.classList.remove("show"), 2200);
}

function filteredRecipes() {
  return state.recipes.filter(recipe => {
    const query = state.query.trim().toLowerCase();
    const text = [recipe.title, recipe.source, ...recipe.tags, ...recipe.ingredients.flat()].join(" ").toLowerCase();
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
  return `
    <article class="recipe-card" data-recipe="${recipe.id}" tabindex="0">
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.title}">
      <button class="favorite ${recipe.favorite ? "on" : ""}" data-favorite="${recipe.id}" aria-label="${recipe.favorite ? "取消常做" : "加入常做"}">${recipe.favorite ? "★" : "☆"}</button>
      <div class="recipe-body">
        <div class="recipe-meta"><span class="source-dot"></span><span>${recipe.source}</span><span>·</span><span>${recipe.time} 分钟</span><span>·</span><span>做过 ${recipe.cooked} 次</span></div>
        <h3>${recipe.title}</h3>
        <div class="tag-row">${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
    </article>
  `;
}

function renderInbox() {
  viewRoot.innerHTML = `
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
        <div class="platform-mark ${item.platform === "抖音" ? "douyin" : ""}">${item.platform.slice(0,1)}</div>
        <div><h3>${item.title}</h3><p>${item.platform} · 收录于 ${item.savedAt}</p></div>
        <div class="inbox-actions">
          <button class="button secondary small" data-delete-inbox="${item.id}">删除</button>
          <button class="button primary small" data-organize="${item.id}">开始整理</button>
        </div>
      </article>`).join("")}</div>` :
      `<div class="empty"><strong>待整理箱已经清空</strong><span>下次看到喜欢的教程，粘贴链接就能先收进来。</span></div>`}
  `;
}

function render() {
  document.querySelectorAll("[data-nav]").forEach(el => el.classList.toggle("active", el.dataset.nav === state.view));
  if (state.view === "inbox") renderInbox(); else renderLibrary();
  save();
}

function openRecipe(id) {
  const recipe = state.recipes.find(item => item.id === Number(id));
  if (!recipe) return;
  state.activeRecipe = recipe;
  document.querySelector("#recipeDetail").innerHTML = `
    <div class="detail-hero">
      <img src="${recipe.image}" alt="${recipe.title}">
      <button class="icon-button detail-close" data-close-detail aria-label="关闭">×</button>
      <div class="detail-title"><span>${recipe.source} · 做过 ${recipe.cooked} 次</span><h2>${recipe.title}</h2><div class="tag-row">${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div></div>
    </div>
    <div class="detail-content">
      <div class="detail-stats">
        <div class="stat"><span>准备与烹饪</span><strong>${recipe.time} 分钟</strong></div>
        <div class="stat"><span>难度</span><strong>${recipe.difficulty}</strong></div>
        <div class="stat"><span>份量</span><strong>${recipe.servings} 人份</strong></div>
        <div class="stat"><span>步骤</span><strong>${recipe.steps.length} 步</strong></div>
      </div>
      <div class="detail-columns">
        <section><h3 class="section-title">食材清单</h3><ul class="ingredient-list">${recipe.ingredients.map(([name, amount]) => `<li><span>${name}</span><strong>${amount}</strong></li>`).join("")}</ul></section>
        <section><h3 class="section-title">制作步骤</h3><ol class="steps">${recipe.steps.map(step => `<li>${step.text}</li>`).join("")}</ol>
          <div class="personal-note"><span class="eyebrow">我的调整</span><p>${recipe.note}</p></div>
        </section>
      </div>
    </div>
    <div class="detail-footer">
      <button class="button secondary" data-favorite="${recipe.id}">${recipe.favorite ? "★ 已加入常做" : "☆ 加入常做"}</button>
      <button class="button primary" data-start-cook="${recipe.id}">开始做菜 →</button>
    </div>`;
  if (!recipeDialog.open) recipeDialog.showModal();
}

function openCook(id) {
  const recipe = state.recipes.find(item => item.id === Number(id));
  if (!recipe) return;
  state.activeRecipe = recipe;
  state.cookStep = 0;
  state.seconds = 0;
  clearInterval(state.timerId);
  recipeDialog.close();
  renderCook();
  cookDialog.showModal();
}

function renderCook() {
  const recipe = state.activeRecipe;
  const step = recipe.steps[state.cookStep];
  const isLast = state.cookStep === recipe.steps.length - 1;
  document.querySelector("#cookView").innerHTML = `
    <div class="cook-shell">
      <div>
        <header class="cook-head"><button class="icon-button" data-close-cook aria-label="退出做饭模式">×</button><strong>${recipe.title}</strong><span>${state.cookStep + 1}/${recipe.steps.length}</span></header>
        <div class="cook-progress"><span style="width:${(state.cookStep + 1) / recipe.steps.length * 100}%"></span></div>
      </div>
      <main class="cook-main">
        <span class="step-count">步骤 ${state.cookStep + 1}</span>
        <div class="cook-step">${step.text}</div>
        <div class="step-ingredients"><span>本步骤用料</span><strong>${step.items || "按需使用"}</strong></div>
        ${step.timer ? `<div class="timer-panel"><div class="timer" id="timerText">${formatTime(state.seconds || step.timer)}</div><button class="button secondary" data-timer="${step.timer}">${state.timerId ? "暂停" : "开始计时"}</button><button class="button secondary" data-reset-timer="${step.timer}">重置</button></div>` : ""}
      </main>
      <footer class="cook-controls">
        <button class="button secondary" data-cook-prev ${state.cookStep === 0 ? "disabled" : ""}>← 上一步</button>
        <button class="button primary" data-cook-next>${isLast ? "完成这道菜 ✓" : "下一步 →"}</button>
      </footer>
    </div>`;
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function finishCooking() {
  state.activeRecipe.cooked += 1;
  document.querySelector("#weekCount").textContent = Number(document.querySelector("#weekCount").textContent) + 1;
  clearInterval(state.timerId);
  state.timerId = null;
  cookDialog.close();
  save();
  render();
  toast(`已记录：完成 ${state.activeRecipe.title}`);
}

async function openOrganizer(id) {
  const item = state.inbox.find(entry => entry.id === Number(id));
  if (!item) return;

  organizeForm.reset();
  organizeForm.elements.inboxId.value = item.id;
  organizeForm.elements.title.value = item.title;
  organizeDialog.showModal();
  organizeForm.elements.title.focus();
  await recognizeRecipe(item);
}

function setRecognizeStatus(message, type = "") {
  const status = document.querySelector("#organizeStatus");
  status.textContent = message;
  status.className = `recognize-status show ${type}`.trim();
}

function fillRecipeDraft(draft) {
  if (draft.title) organizeForm.elements.title.value = draft.title;
  if (draft.time) organizeForm.elements.time.value = draft.time;
  if (draft.servings) organizeForm.elements.servings.value = draft.servings;
  if (draft.difficulty) organizeForm.elements.difficulty.value = draft.difficulty;
  organizeForm.elements.tags.value = (draft.tags || []).join(", ");
  organizeForm.elements.ingredients.value = (draft.ingredients || [])
    .map(item => `${item.name} | ${item.amount || "适量"}`)
    .join("\n");
  organizeForm.elements.steps.value = (draft.steps || [])
    .map(step => step.text)
    .join("\n");
  organizeForm.elements.note.value = draft.note || "";
}

async function recognizeRecipe(item) {
  if (!recipeApiUrl) {
    setRecognizeStatus("尚未配置识别服务。可以先手动整理，部署 Worker 后在 config.js 中填写接口地址。", "error");
    return;
  }

  const recognizeButton = organizeDialog.querySelector("[data-recognize]");
  const requestId = ++recognizeRequestId;
  recognizeButton.disabled = true;
  setRecognizeStatus("正在读取教程并生成菜谱草稿…", "loading");

  try {
    const response = await fetch(recipeApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: item.url,
        title: item.title,
        platform: item.platform,
        shareText: item.shareText || ""
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "识别服务暂时不可用");
    if (requestId !== recognizeRequestId || !organizeDialog.open) return;

    fillRecipeDraft(result.recipe);
    setRecognizeStatus(
      result.needsMoreText
        ? "已根据现有内容生成草稿，但链接提供的信息较少。建议补充分享文案或字幕后重新识别。"
        : "草稿已自动生成，请检查食材用量和步骤后保存。"
    );
  } catch (error) {
    if (requestId !== recognizeRequestId || !organizeDialog.open) return;
    setRecognizeStatus(`${error.message}。你仍然可以手动填写并生成菜谱。`, "error");
  } finally {
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
    .map(text => ({ text, items: "" }));
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    state.view = nav.dataset.nav;
    state.filter = "全部";
    document.querySelector(".sidebar").classList.remove("open");
    render();
  }
  if (event.target.closest("[data-action='import']")) {
    importDialog.querySelector("[name='url']").setAttribute("required", "");
    importDialog.showModal();
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
    importDialog.showModal();
    importDialog.querySelector("[name='url']").removeAttribute("required");
    importDialog.querySelector("[name='title']").focus();
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
  if (event.target.closest("[data-close-detail]")) recipeDialog.close();
  const start = event.target.closest("[data-start-cook]");
  if (start) openCook(start.dataset.startCook);
  if (event.target.closest("[data-close-cook]")) { clearInterval(state.timerId); state.timerId = null; cookDialog.close(); }
  const organize = event.target.closest("[data-organize]");
  if (organize) openOrganizer(organize.dataset.organize);
  const del = event.target.closest("[data-delete-inbox]");
  if (del) { state.inbox = state.inbox.filter(entry => entry.id !== Number(del.dataset.deleteInbox)); render(); }
  if (event.target.closest("[data-cook-prev]") && state.cookStep > 0) { state.cookStep--; resetTimer(); renderCook(); }
  if (event.target.closest("[data-cook-next]")) {
    if (state.cookStep < state.activeRecipe.steps.length - 1) { state.cookStep++; resetTimer(); renderCook(); }
    else finishCooking();
  }
  const timer = event.target.closest("[data-timer]");
  if (timer) toggleTimer(Number(timer.dataset.timer));
  const reset = event.target.closest("[data-reset-timer]");
  if (reset) { resetTimer(Number(reset.dataset.resetTimer)); renderCook(); }
});

document.addEventListener("keydown", event => {
  const card = event.target.closest?.("[data-recipe]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openRecipe(card.dataset.recipe);
  }
});

function resetTimer(value = 0) {
  clearInterval(state.timerId);
  state.timerId = null;
  state.seconds = value;
}

function toggleTimer(defaultSeconds) {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
    renderCook();
    return;
  }
  if (!state.seconds) state.seconds = defaultSeconds;
  state.timerId = setInterval(() => {
    state.seconds -= 1;
    const text = document.querySelector("#timerText");
    if (text) text.textContent = formatTime(Math.max(0, state.seconds));
    if (state.seconds <= 0) {
      clearInterval(state.timerId);
      state.timerId = null;
      toast("计时结束，可以进行下一步了");
      renderCook();
    }
  }, 1000);
  renderCook();
}

document.querySelector("#importForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = form.get("title")?.trim() || "未命名教程";
  state.inbox.unshift({
    id: Date.now(),
    title,
    platform: form.get("platform"),
    url: form.get("url"),
    shareText: form.get("shareText")?.trim() || "",
    savedAt: "刚刚"
  });
  event.currentTarget.reset();
  importDialog.close();
  state.view = "inbox";
  render();
  toast("教程已收进待整理箱");
});

organizeForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const inboxId = Number(form.get("inboxId"));
  const item = state.inbox.find(entry => entry.id === inboxId);
  if (!item) {
    organizeDialog.close();
    toast("这条待整理教程已不存在");
    return;
  }

  const recipe = {
    id: Date.now(),
    title: form.get("title").trim(),
    image: "assets/garlic-broccoli.png",
    source: item.platform,
    sourceUrl: item.url,
    time: Number(form.get("time")),
    difficulty: form.get("difficulty"),
    servings: Number(form.get("servings")),
    favorite: false,
    cooked: 0,
    tags: form.get("tags").split(/[,，]/).map(tag => tag.trim()).filter(Boolean),
    ingredients: parseIngredients(form.get("ingredients")),
    steps: parseSteps(form.get("steps")),
    note: form.get("note").trim() || "暂无个人调整。"
  };

  state.recipes.unshift(recipe);
  state.inbox = state.inbox.filter(entry => entry.id !== inboxId);
  state.view = "library";
  state.filter = "全部";
  organizeDialog.close();
  event.currentTarget.reset();
  render();
  toast(`“${recipe.title}”已生成菜谱`);
  openRecipe(recipe.id);
});

searchInput.addEventListener("input", event => { state.query = event.target.value; if (state.view === "inbox") state.view = "library"; render(); });
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

render();
