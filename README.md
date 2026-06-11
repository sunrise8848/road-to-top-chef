# 灶边

一个用于收录短视频教程、整理个人菜谱并在厨房逐步跟做的本地 Web 应用。

## 使用

直接双击 `index.html` 即可打开。数据通过 `localStorage` 保存在当前浏览器中。

## 已实现

- 菜谱搜索和标签筛选
- 常做菜收藏
- 短视频链接待整理箱
- 菜谱详情、食材清单和个人调整
- 全屏逐步做饭模式
- 步骤计时器
- 完成次数记录
- 移动端适配

## AI 菜谱草稿

项目包含一个 Cloudflare Worker，用于读取公开教程页面或分享文案，并通过 DeepSeek API 生成结构化菜谱草稿。小红书、抖音可能要求登录或拦截自动访问，因此收录时建议同时粘贴平台分享文案、作者配文或视频字幕。

### 配置 DeepSeek Key

推荐通过 Cloudflare 网页后台配置，避免 PowerShell 隐藏输入或执行策略造成误操作：

1. 打开 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 选择 `road-to-top-chef-api`。
3. 打开 **Settings → Variables and Secrets**。
4. 删除旧的 `OPENAI_API_KEY`（如果存在）。
5. 新增类型为 **Secret** 的变量：
   - 名称：`DEEPSEEK_API_KEY`
   - 值：DeepSeek 开放平台生成的、以 `sk-` 开头的 API Key
6. 点击 **Save and deploy**。

不要在密钥外添加引号，也不要填写 DeepSeek 登录密码。可访问下面的地址检查配置状态，响应中不会包含密钥：

```text
https://road-to-top-chef-api.sxd19980702.workers.dev/health
```

当 `status` 为 `ready` 且 `apiKeyLooksValid` 为 `true` 时，说明 Worker 已正确读取密钥。

### 部署 Worker

```powershell
cd worker
npm install
npx wrangler login
npm run deploy
```

部署完成后，把 Worker 返回的地址写入根目录的 `config.js`：

```js
window.RECIPE_API_URL = "https://road-to-top-chef-api.<你的子域>.workers.dev";
```

`DEEPSEEK_API_KEY` 只保存在 Cloudflare Secret 中，不要写入 `config.js` 或提交到 GitHub。默认模型在 `worker/wrangler.toml` 的 `DEEPSEEK_MODEL` 中配置。
