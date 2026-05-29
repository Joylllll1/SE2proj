# NJU树洞

> 面向南京大学师生的半匿名表达、互助交流与内容治理平台

## 项目概述

NJU树洞提供一个更低压力、但仍可治理的校园匿名社区。项目核心目标不是“完全匿名放飞”，而是在熟人环境里提供可表达、可互动、可追责的平衡方案。

当前仓库已经包含完整前后端：

- 前端：React + Vite + Tailwind CSS v4
- 后端：Express + MongoDB + JWT
- AI：流式聊天、会话管理、人格设置、联网搜索工具

## 当前能力

### 社区与内容

- 帖子级匿名身份：同一用户在同一帖内匿名名稳定，跨帖不可关联
- 发帖、草稿、详情页、多图、评论、回复、点赞、收藏
- 搜索、公告、活动、每日运势
- 举报、后台审核、审计与管理员治理

### AI 助手

- 侧边滑出的 AI 面板，支持多轮会话、历史会话切换与删除
- 流式输出、重新生成、停止生成
- 停止支持按钮，也支持 `Esc`
- 人格设置支持“用户默认”和“当前会话覆盖”两层
- 支持工具调用：`web_search`、`fetch_url`、站内搜索等
- 已接入百度千帆联网搜索接口，适合新闻、天气、政策、人物近况等时效性问题
- LLM 接口可配置，不强绑定 OpenAI；当前代码兼容 DeepSeek / 兼容 OpenAI Chat Completions 的提供方

### 移动端 UI

- 底部导航 + 中央发布按钮
- 顶部搜索框移动端展开
- 搜索确认后自动滚动到首页 feed 区域
- `MyPage` 聚合“我的帖子 / 我的收藏 / 我的喜爱”
- 适配 `safe-area-inset`

## 技术栈

### 前端

- React 18
- Vite 5
- Tailwind CSS v4
- Zustand
- Vitest + Testing Library
- Playwright

### 后端

- Node.js ESM
- Express 4
- MongoDB + Mongoose 8
- JWT + HTTP-only Cookie
- nodemon

## 仓库结构

```text
SE2proj/
├── backend/
│   ├── src/
│   │   ├── config/          # 数据库与运行配置
│   │   ├── controllers/     # 路由控制器
│   │   ├── middlewares/     # 鉴权、错误处理等
│   │   ├── models/          # Mongoose 模型
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务层（含 AI、工具循环、搜索）
│   │   ├── scripts/         # 数据初始化脚本
│   │   └── utils/           # 通用工具
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/       # 页面级组件
│   │   │   ├── features/    # AIPanel、HeroCarousel 等
│   │   │   ├── layout/      # TopBar、Sidebar、MobileNav
│   │   │   └── common/      # Icon、Toast、Modal 等
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── tailwind.css
│   └── README.md
├── docs/
│   └── wiki/
├── openspec/
├── CLAUDE.md
└── README.md
```

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6+
- npm 9+

### 1. 启动后端

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

后端默认监听 `http://localhost:3001`。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认监听 `http://localhost:5173`。

## 关键环境变量

后端环境变量示例见 [`backend/.env.example`](backend/.env.example)。

常用项如下：

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/treehole

JWT_SECRET=...
JWT_REFRESH_SECRET=...

SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=

LLM_API_KEY=
LLM_API_URL=https://api.deepseek.com/v1/chat/completions
LLM_MODEL=deepseek-chat

AI_WEB_SEARCH_BAIDU_API_KEY=
AI_WEB_SEARCH_BAIDU_URL=https://qianfan.baidubce.com/v2/ai_search/web_search
AI_WEB_SEARCH_MAX_RESULTS=8

AI_TOOL_MAX_CALLS=3
AI_TOOL_TIMEOUT_MS=8000
AI_STREAM_IDLE_TIMEOUT_MS=30000
```

说明：

- `LLM_API_URL` / `LLM_MODEL` 可以替换成你自己的兼容接口
- 联网搜索默认走百度千帆，至少需要配置 `AI_WEB_SEARCH_BAIDU_API_KEY`
- 如果没配搜索 key，AI 仍可聊天，但时效性问题不会拿到联网结果

## 常用命令

### 前端

```bash
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint
cd frontend && npm run test
```

### 后端

```bash
cd backend && npm run dev
cd backend && npm run start
cd backend && npm run lint
```

说明：

- 前端测试当前使用 Vitest
- 后端 `npm test` 仍是占位脚本，暂未建立正式测试集

## 部署

### 后端

```bash
cd backend
pm2 start src/index.js --name treehole-api
```

### 前端

```bash
cd frontend
npm run build
```

将 `frontend/dist/` 部署到 Nginx 或其他静态服务器即可。

## 开发备注

- AI 流式中断链路是前后端打通的：前端 `AbortController` + 后端请求级 abort
- DeepSeek 一类接口如果返回 `reasoning_content`，后端会透传并兼容处理
- 首页移动端搜索依赖 `uiStore.feedScrollToken` 触发滚动定位
- 语义化样式主要收敛在 `frontend/src/tailwind.css`

## 相关文档

- [`CLAUDE.md`](CLAUDE.md)
- [`frontend/README.md`](frontend/README.md)
- [`docs/wiki/`](docs/wiki)

## 团队成员

王祎、王嘉乐、邱添、张浩宇
