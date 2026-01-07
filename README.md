# 正能量大师 (Positive Energy Master)

一个基于 AI 的心理疏导与问题拆解助手，帮助用户将烦恼转化为可行动的计划。

## 🚀 项目特性
- **AI 驱动**: 支持 Xiaomi MiMo (OpenAI 兼容) 和 Google Gemini 模型。
- **心理学模型**: 采用"共情-重构-闪光点-行动"的正能量拆解方法论。
- **隐私安全**: 敏感 API 密钥仅在服务端通过环境变量注入，前端不存储任何 Key。
- **容器化部署**: 提供完整的 Docker 支持，一键启动。

## 🛠️ 快速开始

### 1. 环境变量配置
本项目严格遵循安全最佳实践，禁止在代码中硬编码 API 密钥。请在项目根目录创建 `.env` 文件（**不要提交此文件到 Git**）。

复制模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件填入您的密钥：

```bash
# Xiaomi MiMo 配置 (推荐)
mimo_api_key=your_mimo_key_here
MIMO_BASE_URL=https://api.xiaomimimo.com/v1

# Google Gemini 配置 (备用)
gemini_key=your_gemini_key_here

# 模型选择
API_MODEL=mimo-v2-flash
```

### 2. Docker 部署
确保已安装 Docker 和 Docker Compose。

```bash
# 构建并启动服务
docker-compose up --build -d
```

访问地址: [http://localhost:3030](http://localhost:3030)

### 3. 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🔐 安全指南

### API 密钥管理
- **获取方式**: 
  - MiMo Key: 请访问 [Xiaomi MiMo 开放平台](https://platform.xiaomimimo.com) 申请。
  - Gemini Key: 请访问 [Google AI Studio](https://aistudio.google.com) 获取。
- **权限要求**: 确保 Key 拥有调用 `chat/completions` (MiMo) 或 `generateContent` (Gemini) 的权限。

### 版本控制规范
- **禁止提交**: `.env`, `*.log`, `node_modules` 等敏感或生成文件。
- **代码审查**: 每次提交前请检查 diff，确保无硬编码的 Key。
- **Git 钩子**: 建议配置 pre-commit hook 扫描敏感信息。

## ⚙️ 架构说明
- **前端**: React + Vite + TailwindCSS
- **后端**: Node.js + Express (作为 API 网关和静态资源服务器)
- **部署**: Docker 容器化，Nginx 可作为反向代理（可选）

## 📝 许可证
MIT License
