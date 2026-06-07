# NJU树洞

> 面向南京大学校园场景的半匿名表达、互助交流与内容治理平台，围绕“前台匿名展示、后台可治理追责”的原则构建。

## 一、功能特性

| 模块 | 能力 |
|------|------|
| `🔐 认证 / 用户` | 邮箱注册登录、验证码校验、忘记密码、修改密码、个人资料编辑 |
| `📝 内容社区` | 匿名发帖、帖子详情、评论、回复、删除、举报 |
| `❤️ 点赞 / 收藏` | 帖子点赞、评论点赞、回复点赞、收藏夹管理、收藏关系落库 |
| `📂 个人内容` | 草稿箱、我的帖子、我的喜欢、我的收藏 |
| `📣 校园公告` | 公告流展示、活动申请提交、我的申请记录、管理员审核活动 |
| `🔔 通知中心` | 站内通知列表、未读数、单条已读、全部已读、点击跳转 |
| `🤖 AI 助手` | 多会话聊天、流式回复、停止生成、重新生成、人格设置；可结合当前帖子详情页上下文总结帖子与评论区、查看站内热点、联网搜索实时信息，并抓取网页正文做二次核实 |
| `🛡️ 管理后台` | 举报处理、删帖删评、封禁 / 解禁、审计日志、活动审核 |
| `⚡ 实时能力` | 基于 SSE 的新帖、删帖、帖子统计、评论 / 回复变更同步 |
| `🎨 体验细节` | 桌面 / 移动端布局、图片灯箱、离开确认、Toast、首页搜索与后端分页排序 |

## 二、技术栈

| 层次 | 选型 |
|------|------|
| 前端 | React 18 · Vite 5 · Tailwind CSS v4 · Zustand 5 · GSAP |
| 后端 | Node.js ESM · Express 4 · MongoDB · Mongoose 8 |
| 鉴权 | JWT + HTTP-only Cookie（`accessToken` / `refreshToken`） |
| 实时通信 | SSE（Server-Sent Events） |
| 邮件能力 | Nodemailer |
| AI | OpenAI 兼容 Chat Completions 接口 · DeepSeek 等可替换模型 · 后端 tool call + SSE 流式输出 |
| 测试 | Vitest · Testing Library · Node `--test` |
| 工程化 | ESLint · GitHub Actions（当前为结构检查） |

## 三、系统架构

### 3.1 整体形态

当前仓库采用前后端分层架构：

- `frontend/`：React 单页应用
- `backend/`：Express + MongoDB API 服务
- 浏览器侧登录态已经收口为 `same-origin + cookie` 模式
- 开发环境通过 Vite 代理把 `/api` 转发到 `http://localhost:3001`
- 生产环境建议由 Nginx 或同类反向代理把前端静态资源与 `/api` 挂在同一 origin

### 3.2 后端模块

```text
backend/src
├── config/         数据库连接与基础配置
├── controllers/    路由入口、参数处理、响应组织
├── middlewares/    鉴权、权限、封禁校验、错误处理
├── models/         Mongoose 模型
├── routes/         API 路由注册
├── scripts/        种子数据与初始化脚本
├── services/       核心业务逻辑、AI 子模块、SSE 管理
└── utils/          JWT、cookie、图片校验、错误封装等通用工具
```

### 3.3 前端模块

```text
frontend/src
├── components/
│   ├── common/     通用组件
│   ├── features/   AI、举报、运势、轮播等功能组件
│   ├── layout/     顶栏、侧栏、移动端导航
│   └── pages/      页面级组件
├── hooks/          逻辑封装
├── services/       API 请求层
├── store/          Zustand 全局状态
├── test/           测试初始化
└── utils/          搜索、图片等工具函数
```

### 3.4 当前关键约束

- 登录态不再依赖 `localStorage token`，而是使用 HTTP-only cookie
- `accessToken` 默认 `15m`，`refreshToken` 默认 `7d`
- 受保护请求命中 `401` 时，前端会尝试静默刷新并重放一次原请求
- 首页已经切为后端分页、后端搜索、后端排序，并支持“加载更多”
- 首页和帖子详情页的部分状态依赖 SSE 实时同步
- 通知中心当前仍是轮询，不是 SSE
- 图片当前仍以 base64 Data URL 形式随 JSON 传输，体积控制已做，但资源治理仍有后续优化空间

## 四、快速上手

### 4.1 前置依赖

- Node.js `>= 18`
- npm
- MongoDB

### 4.2 配置后端环境变量

先根据模板创建配置文件：

```bash
cp backend/.env.example backend/.env
```

至少需要确认这些字段：

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/treehole
JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me-too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

可选能力：

- SMTP：邮箱验证码与邮件通知
- `LLM_API_KEY` / `LLM_API_URL` / `LLM_MODEL`：AI 助手
- `ADMIN_CONTACT_QQ`：管理端对外联系信息

### 4.3 启动后端

```bash
cd backend
npm install
npm run dev
```

默认地址：

- API: `http://localhost:3001`
- 健康检查: `http://localhost:3001/api/health`

### 4.4 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：

- Web: `http://localhost:5173`

开发环境下，前端会自动把 `/api/*` 请求代理到 `http://localhost:3001`。

### 4.5 可选种子数据

创建演示用户：

```bash
cd backend
node src/scripts/seedUsers.js
```

脚本会创建：

- 管理员：`admin@nju.edu.cn / 12345678`
- 普通用户：`test@nju.edu.cn / 12345678`

初始化每日运势数据：

```bash
cd backend
npm run seed:fortune
```

### 4.6 本地调试说明

- 若未配置 SMTP，验证码会打印在后端控制台日志中
- 若前端打开了但接口全是 `401` 或无数据，先检查后端、MongoDB 和 `backend/.env`
- 若把前端页面和后端 API 分到不同 origin，又没有额外补 cookie 跨域配置，登录态会失效

## 五、配置文件与运行约定

| 文件 | 用途 | 是否入库 |
|------|------|----------|
| `backend/.env.example` | 后端环境变量模板 | `是` |
| `backend/.env` | 本地真实环境变量 | `否` |
| `frontend/vite.config.js` | 前端开发代理与测试配置 | `是` |
| `docs/wiki/setup.md` | 更详细的环境搭建说明 | `是` |
| `docs/wiki/architecture.md` | 架构与设计约束说明 | `是` |

## 六、项目结构

```text
SE2proj/
├── backend/                      # Express 后端
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   └── tools/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/                     # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── test/
│   │   └── utils/
│   └── package.json
├── docs/
│   ├── superpowers/              # 需求 / 方案 / 变更工作流文档
│   └── wiki/                     # 项目 wiki、约定、架构、待办
├── .github/workflows/ci.yml
└── README.md
```

## 七、测试与 CI

### 7.1 本地测试命令

前端：

```bash
cd frontend
npm run test
npm run lint
npm run build
```

后端：

```bash
cd backend
npm run test
npm run lint
```

### 7.2 当前测试现状

- 前端已经有 Vitest + Testing Library 测试，覆盖 `App`、部分页面、`store`、`apiClient` 等关键逻辑
- 后端已经有 Node 原生测试，主要覆盖 JWT / cookie / 鉴权响应等工具层
- 当前还没有完整的后端接口集成测试和端到端 E2E 测试

### 7.3 CI 现状

当前仓库的 GitHub Actions 还比较基础：

- 触发条件：`push / PR` 到 `main` 或 `dev`
- 当前内容：检查基础目录结构是否存在

这意味着：

- 本地测试仍然是质量保障主力
- 后续如果继续完善工程化，最值的是把前后端测试和 lint 正式接入 CI

## 八、文档索引

| 文档 | 说明 |
|------|------|
| `docs/wiki/setup.md` | 环境搭建与常见问题 |
| `docs/wiki/architecture.md` | 当前架构、SSE、登录态与约束 |
| `docs/wiki/coding-standards.md` | 编码规范 |
| `docs/wiki/conventions.md` | 项目约定 |
| `docs/wiki/collaboration-workflow.md` | 协作流程 |
| `docs/wiki/todo.md` | 已确认但未排期的后续事项 |
| `docs/wiki/decisions/` | 架构决策记录 |

## 九、当前状态说明

这个仓库当前不是“纯静态页面展示”，而是一套已经可以跑通核心链路的校园社区系统，现状大致如下：

- 已完成 cookie 化登录态与静默刷新
- 已完成收藏后端落库
- 已完成首页后端分页 / 搜索 / 排序
- 已完成帖子统计、评论 / 回复的 SSE 实时同步
- 已补齐一批前端与后端工具层测试

同时也保留了一些明确的后续项：

- 通知尚未改为 SSE
- 图片仍以内联 base64 传输
- 安全防滥用措施还需要继续补强，例如验证码限流、上传配额、CORS / 安全头收口

如果你要继续看实现细节，优先从 [docs/wiki/architecture.md](docs/wiki/architecture.md) 和 [docs/wiki/setup.md](docs/wiki/setup.md) 开始。
