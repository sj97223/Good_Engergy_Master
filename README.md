# 正能量大师 (Positive Energy Master)

这是一个基于 React + Vite + TypeScript 的纯前端 AI 聊天应用。它通过结构化的 Prompt 引导 AI 将用户的烦恼转化为积极的可执行计划。

## 功能特性

*   **结构化输出**: 强制 AI 返回 JSON，前端渲染为精美的卡片（包含闪光点、行动清单等）。
*   **会话限制**: 每个话题限制 6 轮对话，上下文保留最近 10 条，防止 Token 浪费。
*   **API 轮询与熔断**: 支持配置多个 API Key，自动轮询。如果某个 Key 请求失败，会自动标记冷却（Cooldown），优先使用可用 Key。
*   **本地状态**: 任务清单（Checklist）的勾选状态保存在 LocalStorage。
*   **纯前端**: 无需后端，直接调用兼容 OpenAI 格式的接口（如 MiMo, OpenAI 等）。

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或者
yarn
```

### 2. 配置环境变量

复制 `.env.example` (如有) 或直接在项目根目录创建 `.env.local` 文件：

```env
# 你的 API Base URL (例如 MiMo 的 endpoint)
# 注意：代码中会追加 /chat/completions，所以这里只写到 v1 或者是 base 路径
VITE_MIMO_BASE_URL=https://api.openai.com/v1

# 配置多个 Key 用于轮询 (Round Robin)
VITE_MIMO_KEY_1=sk-xxxxxxxxxxxxxxxx
VITE_MIMO_KEY_2=sk-yyyyyyyyyyyyyyyy
VITE_MIMO_KEY_3=sk-zzzzzzzzzzzzzzzz
```

> **注意**: 这是一个纯前端演示项目。在生产环境中，将 API Key 暴露在前端是不安全的。建议在生产环境中使用后端代理来隐藏 Key。

### 3. 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`。

## 构建部署

```bash
npm run build
```

构建产物位于 `dist` 目录，可直接部署到任何静态站点托管服务（如 Vercel, Netlify, GitHub Pages）。

## API 适配

本项目默认使用 OpenAI Chat Completion 格式 (`POST /chat/completions`)。
核心请求逻辑位于 `src/lib/apiClient.ts`。如果你的模型返回的数据结构不同，请修改该文件中的 `sendMessage` 方法。

## 安全性声明

本项目仅供演示。所有 API Key 均存储在用户浏览器的内存或构建产物中。请勿在公开网络环境直接使用真实的、高额度的 API Key。