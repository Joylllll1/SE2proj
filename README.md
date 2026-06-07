# NJU树洞

> 面向南京大学师生的半匿名表达、互助交流与内容治理平台

## 项目简介

NJU树洞是一个校园匿名社区系统，目标是在“低压力表达”和“可治理、可追责”之间取得平衡。项目支持匿名发帖、评论互动、收藏管理、活动公告、管理员审核、通知中心，以及带工具调用能力的 AI 助手。

当前仓库代码按前后端分层组织，但浏览器侧部署口径已经收敛为“同源访问 + cookie 会话”：

- 前端：React 18 + Vite 5 + Tailwind CSS v4 + Zustand
- 后端：Express 4 + MongoDB / Mongoose + JWT + SSE
- AI：兼容 OpenAI Chat Completions 风格接口，支持会话、人格设置和联网搜索工具

开发时前端通过 Vite 代理把 `/api` 转发到后端；生产建议由 Nginx 或同类反向代理把前端静态资源与 `/api` 挂到同一 origin。

## 主要功能

### 用户账号

- 支持注册、登录、退出登录
- 支持邮箱验证码、忘记密码和修改密码
- 支持个人设置与通知偏好管理

### 社区互动

- 支持匿名发帖、浏览帖子和查看详情
- 支持评论、回复、点赞、收藏、举报
- 收藏夹与收藏关系已落库，状态不再只保存在浏览器本地
- 支持草稿箱、我的帖子、我的收藏、我的喜欢等个人内容管理
- 支持搜索帖子、话题和部分站内内容

### 校园公告

- 支持校园活动浏览、分类筛选和活动详情查看
- 支持用户提交活动申请
- 支持在公告页查看自己的活动申请记录

### AI 助手

- 提供侧边滑出的 AI 面板
- 支持多会话管理、流式回复、重新生成、停止生成
- 支持聊天风格设置，包括角色、语气、回复长度等
- 支持工具调用和联网搜索能力

### 管理后台

- 提供管理员页面与审核面板
- 支持举报处理、活动审核、轮播管理、封禁管理和审计相关能力

### 体验与交互

- 适配桌面端和移动端导航
- 支持通知弹窗、图片灯箱、确认离开弹窗等常用交互
- 帖子统计和评论区支持基于 SSE 的实时更新
- 已处理主要浮层内部滚动区域的 scroll chaining，滚动到边界时不会继续带动背景页面

## 技术栈

### 前端

- React 18
- Vite 5
- Tailwind CSS v4
- Zustand
- react-markdown + remark-gfm
- Vitest + Testing Library
- Playwright

### 后端

- Node.js ESM
- Express 4
- MongoDB
- Mongoose 8
- jsonwebtoken
- bcryptjs
- nodemailer
- SSE（Server-Sent Events）

## 仓库结构

```text
SE2proj/
├── backend/                        # Express 后端
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB 连接
│   │   ├── controllers/           # Controller 层：参数处理、响应组织
│   │   │   ├── adminController.js
│   │   │   ├── aiController.js
│   │   │   ├── authController.js
│   │   │   ├── commentController.js
│   │   │   ├── draftController.js
│   │   │   ├── eventController.js
│   │   │   ├── fortuneController.js
│   │   │   ├── likeController.js
│   │   │   ├── notificationController.js
│   │   │   ├── passwordController.js
│   │   │   ├── postController.js
│   │   │   ├── reportController.js
│   │   │   └── verifyController.js
│   │   ├── middlewares/           # 鉴权、封禁校验、错误处理
│   │   │   ├── auth.js
│   │   │   ├── checkBan.js
│   │   │   ├── errorHandler.js
│   │   │   ├── isAdmin.js
│   │   │   └── optionalAuth.js
│   │   ├── models/                # Mongoose 模型
│   │   │   ├── AIMessage.js
│   │   │   ├── AIProfile.js
│   │   │   ├── AISession.js
│   │   │   ├── AuditLog.js
│   │   │   ├── Ban.js
│   │   │   ├── CheckIn.js
│   │   │   ├── Comment.js
│   │   │   ├── Draft.js
│   │   │   ├── Event.js
│   │   │   ├── FortuneItem.js
│   │   │   ├── Notification.js
│   │   │   ├── Post.js
│   │   │   ├── Report.js
│   │   │   ├── User.js
│   │   │   ├── VerificationCode.js
│   │   │   └── schemas/           # 预留子 schema 目录
│   │   ├── routes/                # 路由注册
│   │   │   ├── adminRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── draftRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── fortuneRoutes.js
│   │   │   ├── likeRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── passwordRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── sseRoutes.js
│   │   │   └── verifyRoutes.js
│   │   ├── scripts/               # 数据脚本 / 初始化脚本
│   │   │   ├── migrate-admin.js
│   │   │   ├── seedFortune.js
│   │   │   └── seedUsers.js
│   │   ├── services/              # 业务核心层
│   │   │   ├── llm/               # LLM 相关子模块目录
│   │   │   ├── tools/             # AI 工具子模块目录
│   │   │   ├── adminService.js
│   │   │   ├── aiPersonaConfig.js
│   │   │   ├── aiPersonaService.js
│   │   │   ├── aiPromptBuilder.js
│   │   │   ├── aiService.js
│   │   │   ├── authService.js
│   │   │   ├── bookmarkService.js
│   │   │   ├── commentCountService.js
│   │   │   ├── commentService.js
│   │   │   ├── draftService.js
│   │   │   ├── emailService.js
│   │   │   ├── eventService.js
│   │   │   ├── fortuneService.js
│   │   │   ├── likeService.js
│   │   │   ├── notificationService.js
│   │   │   ├── postService.js
│   │   │   └── sseManager.js
│   │   ├── utils/                 # 通用工具
│   │   │   ├── AppError.js
│   │   │   ├── authCookies.js
│   │   │   ├── authResponse.js
│   │   │   ├── image.js
│   │   │   └── jwt.js
│   │   └── index.js               # 后端入口
│   └── package.json
├── frontend/                       # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # 通用基础组件
│   │   │   │   ├── ClickableImage.jsx
│   │   │   │   ├── Comment.jsx
│   │   │   │   ├── ConfirmLeaveDialog.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── EventModals.jsx
│   │   │   │   ├── Icon.jsx
│   │   │   │   ├── ImageLightbox.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── PlainTextContent.jsx
│   │   │   │   ├── PostCard.jsx
│   │   │   │   ├── Progress.jsx
│   │   │   │   ├── ReplyCard.jsx
│   │   │   │   ├── RichMessageContent.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── TimeAgo.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── UnderConstruction.jsx
│   │   │   ├── features/          # 功能组件
│   │   │   │   ├── AIPanel.jsx
│   │   │   │   ├── DailyFortune.jsx
│   │   │   │   ├── DailyLuck.jsx
│   │   │   │   ├── HeroCarousel.jsx
│   │   │   │   └── ReportModal.jsx
│   │   │   ├── layout/            # 布局组件
│   │   │   │   ├── AdminMobileNav.jsx
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── AdminTopBar.jsx
│   │   │   │   ├── MobileNav.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TopBar.jsx
│   │   │   └── pages/             # 页面级组件
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminPage.jsx
│   │   │       ├── AnnouncementsPage.jsx
│   │   │       ├── BookmarksPage.jsx
│   │   │       ├── ComposePage.jsx
│   │   │       ├── DetailPage.jsx
│   │   │       ├── DraftsPage.jsx
│   │   │       ├── ForgetPasswordPage.jsx
│   │   │       ├── HomePage.jsx
│   │   │       ├── LandingPage.jsx
│   │   │       ├── LikesPage.jsx
│   │   │       ├── LoginPage.jsx
│   │   │       ├── MyPage.jsx
│   │   │       ├── MyPostsPage.jsx
│   │   │       ├── PasswordChangePage.jsx
│   │   │       ├── RegisterPage.jsx
│   │   │       ├── SettingsPage.jsx
│   │   │       └── TodoPage.jsx
│   │   ├── data/                  # 静态数据目录
│   │   ├── hooks/                 # 逻辑封装
│   │   │   ├── useAuth.js
│   │   │   ├── useEventActions.js
│   │   │   ├── useLikeBookmark.js
│   │   │   ├── useNotificationPolling.js
│   │   │   └── usePostActions.js
│   │   ├── services/              # 前端 API 请求封装
│   │   │   ├── adminService.js
│   │   │   ├── aiService.js
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   ├── commentService.js
│   │   │   ├── draftService.js
│   │   │   ├── eventService.js
│   │   │   ├── fortuneService.js
│   │   │   ├── notificationService.js
│   │   │   ├── postService.js
│   │   │   ├── reportService.js
│   │   │   ├── storageService.js
│   │   │   └── verifyService.js
│   │   ├── store/                 # Zustand 全局状态
│   │   │   ├── adminStore.js
│   │   │   ├── aiStore.js
│   │   │   ├── authStore.js
│   │   │   ├── bookmarkStore.js
│   │   │   ├── commentStore.js
│   │   │   ├── eventStore.js
│   │   │   ├── notificationStore.js
│   │   │   ├── postStore.js
│   │   │   └── uiStore.js
│   │   ├── test/                  # 测试初始化
│   │   │   └── setup.js
│   │   ├── utils/                 # 工具函数
│   │   │   ├── image.js
│   │   │   └── search.js
│   │   ├── App.jsx                # 前端主应用
│   │   ├── App.test.jsx
│   │   ├── main.jsx               # React 挂载入口
│   │   ├── tailwind.css           # 全局样式与设计 token
│   │   └── utils.js               # 通用前端工具
│   └── package.json
├── docs/
│   ├── superpowers/               # 过程性设计/规格文档
│   └── wiki/                      # 项目知识库
│       ├── architecture.md
│       ├── coding-standards.md
│       ├── collaboration-workflow.md
│       ├── conventions.md
│       ├── decisions/
│       ├── glossary.md
│       ├── landing-page.md
│       ├── setup.md
│       └── todo.md
├── openspec/                      # 变更提案、设计、任务记录
├── .github/                       # GitHub 配置
├── CLAUDE.md                      # 仓库协作说明
└── README.md
```

## 关键架构说明

### 前端

- 使用 `activePage + history.pushState/popstate` 实现轻量 SPA 路由，没有引入 React Router
- 页面状态以 Zustand 为核心
- 样式集中在 `frontend/src/tailwind.css`，组件内优先复用语义类
- 详情页、首页、AI 面板、通知弹窗等交互都依赖 store 和局部状态协同

### 后端

- 分层结构：`routes -> controllers -> services -> models`
- MongoDB 保存正式数据
- 正式内容以逻辑删除为主，草稿允许物理删除
- 登录态基于 `HTTP-only cookie`，并通过 `/api/auth/refresh` 做静默续期
- SSE 用于首页/详情页的帖子统计、评论和回复同步
- AI 相关逻辑集中在 `aiService`、人格配置和工具子模块

### 实时能力现状

- 已接入 SSE 的代码入口位于 `/api/stream` 与 `sseManager`
- 首页和详情页存在对 SSE 事件的消费逻辑
- 当前实时同步覆盖帖子点赞数、收藏数、评论数，以及评论/回复增删
- 通知中心当前不是 SSE，而是前端 `useNotificationPolling` 轮询刷新

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- MongoDB 6+

### 1. 启动后端

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

默认地址：`http://localhost:3001`

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：`http://localhost:5173`

说明：

- 前端所有业务请求默认走相对路径 `/api/...`
- 开发环境依赖 `frontend/vite.config.js` 中的 `/api -> http://localhost:3001` 代理
- 当前登录态是 `HTTP-only cookie`，不是 `localStorage + Bearer token`
- `accessToken` 默认 15 分钟，过期后前端会自动调用 `/api/auth/refresh`
- `refreshToken` 默认 7 天，并在刷新时轮换，属于滑动续期而不是“打开页面就强制重登”

## 常用命令

### 前端

```bash
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run preview
cd frontend && npm run lint
cd frontend && npm run lint:fix
cd frontend && npm run test
```

### 后端

```bash
cd backend && npm run dev
cd backend && npm run start
cd backend && npm run lint
cd backend && npm run lint:fix
cd backend && npm run test
cd backend && npm run seed:fortune
```

说明：

- 前端 `npm run test` 使用 Vitest
- 后端 `npm run test` 使用 Node 内置 test runner，当前覆盖认证 cookie / auth response / JWT 工具层
- 当前仓库没有完整 E2E 自动化链路，跨前后端联调仍以手工回归为主

## 关键环境变量

后端示例见 `backend/.env.example`。常用变量通常包括：

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/treehole

JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SAME_SITE=lax

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

LLM_API_KEY=
LLM_API_URL=
LLM_MODEL=

AI_WEB_SEARCH_BAIDU_API_KEY=
AI_WEB_SEARCH_BAIDU_URL=
AI_WEB_SEARCH_MAX_RESULTS=8

AI_TOOL_MAX_CALLS=3
AI_TOOL_TIMEOUT_MS=8000
AI_STREAM_IDLE_TIMEOUT_MS=30000
```

说明：

- `LLM_API_URL` / `LLM_MODEL` 使用兼容 OpenAI Chat Completions 的提供方即可
- 不配置联网搜索 key 时，AI 仍能聊天，但无法回答强时效问题
- 当前默认会话策略：
  - `accessToken` 15 分钟
  - `refreshToken` 7 天
  - 受保护接口 `401` 时前端会先尝试静默刷新并重试原请求
  - 刷新成功时后端会重新下发新的 `accessToken` 和 `refreshToken`

## 登录态与部署说明

- 登录态基于 `HTTP-only cookie`，前端 JS 不直接读取 token
- 后端会同时写入 `accessToken`、`refreshToken` 和一个非敏感的 `sessionHint` cookie；后者只用于前端判断是否值得尝试恢复会话
- 浏览器请求默认使用相对路径和同源 cookie，`SSE` 也走 `/api/stream`
- 如果生产环境不是同源反代，而是前后端分域直连，需要额外处理跨域 cookie；当前仓库默认没有把这条部署线路作为主路径维护
- 默认建议的 cookie 策略是 `httpOnly + sameSite=lax`，生产环境下 `secure=true`

## API 模块概览

后端当前主要 API 入口：

- `/api/auth`
- `/api/verify`
- `/api/password`
- `/api/posts`
- `/api/comments`
- `/api/likes`
- `/api/drafts`
- `/api/events`
- `/api/notifications`
- `/api/admin`
- `/api/fortune`
- `/api/ai`
- `/api/stream`

## 阅读说明

- 本 README 现在按“仓库中可确认存在的模块”来写，不再把未核实的业务链路写成“已实现功能”
- 如果 README 与代码不一致，以实际代码和 `docs/wiki/architecture.md` 为准

## 相关文档

- [CLAUDE.md](CLAUDE.md)
- [docs/wiki/architecture.md](docs/wiki/architecture.md)
- [docs/wiki/conventions.md](docs/wiki/conventions.md)
- [docs/wiki/coding-standards.md](docs/wiki/coding-standards.md)
- [frontend/README.md](frontend/README.md)

## 团队成员

- 王祎
- 王嘉乐
- 邱添
- 张浩宇
