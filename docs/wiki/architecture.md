# 架构设计

## 整体架构

渐进式分层架构（ADR-001），前后端分离部署。

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (反向代理)                    │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │   Frontend    │       │   Backend     │
        │   (静态资源)  │       │   (Express)   │
        └───────────────┘       └───────────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                │    Redis      │ │   MongoDB     │ │   OSS/本地    │
                │   (缓存)      │ │   (数据库)    │ │   (文件存储)  │
                └───────────────┘ └───────────────┘ └───────────────┘
```

## 模块划分

### 后端模块

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| Auth | 注册、登录、登出、Token 管理 | authRoutes.js, authController.js, authService.js |
| Post | 帖子增删改查、点赞、收藏 | postRoutes.js, postController.js, postService.js |
| Draft | 草稿保存、编辑、发布、删除 | draftRoutes.js, draftController.js, draftService.js |
| Comment | 评论增删、点赞、嵌套回复 | commentRoutes.js, commentController.js, commentService.js |
| Search | 全文搜索、标签筛选 | searchRoutes.js, searchController.js, searchService.js |
| Report | 举报创建与处理 | reportRoutes.js, reportController.js, reportService.js |
| Admin | 用户管理、匿名追溯、公告、审计日志 | adminRoutes.js, adminController.js, adminService.js |
| **Anonymous Service** | 匿名 ID 生成、验证、追溯（核心独立模块） | anonymousService.js, AnonymousMapping.js |
| Moderation | 内容审核、举报处理逻辑 | moderationService.js |
| AI | 内容摘要、违规初筛（可选） | aiService.js |
| Fortune | 每日运势、抽签（可选） | fortuneRoutes.js, fortuneService.js |

### 前端模块

| 层级 | 职责 | 关键文件 |
|------|------|----------|
| Pages | 页面级组件 | components/pages/ |
| Features | 功能组件（post/comment/daily/report/ai） | components/features/ |
| Layout | 布局组件（Header/Sidebar/MainLayout） | components/layout/ |
| Common | 通用组件（Button/Modal/Toast/Card） | components/common/ |
| Hooks | 逻辑封装 | hooks/useAuth.js, usePosts.js, useComments.js, useAnonymous.js |
| Store | Zustand 全局状态 | store/authStore.js, postStore.js, draftStore.js, commentStore.js, uiStore.js |
| Services | API 调用 | services/authService.js, postService.js, ... |

## 核心数据流

### 发帖流程（展示匿名服务的核心位置）

```
用户点击发帖 → PostController.create()
  → PostService.create()
    → AnonymousService.generateId(userId, postId)  ← 生成匿名 ID
    → PostModel.create()                            ← 存储帖子
    → AnonymousMappingModel.create()                ← 加密存储映射
    → Redis.set(anon_cache_key, anonId)             ← 缓存匿名 ID
  → 返回帖子 ID + 匿名 ID
```

### 评论流程

```
用户点击评论 → CommentController.create()
  → CommentService.create()
    → AnonymousService.getDisplayId(userId, postId)  ← 获取/生成匿名 ID
    → CommentModel.create()
  → 返回评论 ID + 匿名 ID
```

### 管理员追溯流程

```
管理员查看举报 → AdminController.traceAnonymous()
  → AdminService.traceAnonymous()
    → AnonymousService.trace(anonId)     ← 追溯真实身份
    → AuditLogModel.create()             ← 记录审计日志（必须）
  → 返回用户 ID + 帖子 ID
```

## 架构原则

1. **渐进式改进**：在现有代码基础上完善分层，不推倒重来（ADR-001）
2. **匿名逻辑独立**：所有匿名操作必须通过 AnonymousService，不可跨模块直连（ADR-002）
3. **服务层为核心**：业务逻辑集中在 Service，Controller 只做参数校验和响应组装
4. **逻辑删除优先**：正式内容（帖子、评论）使用逻辑删除，草稿可物理删除
5. **审计可追溯**：管理员操作必须记录审计日志，确保"对内可治理"可验证
6. **缓存加速**：匿名 ID 映射、热门帖子、JWT 黑名单走 Redis 缓存

## 不采用的方案及原因

| 方案 | 不采用原因 |
|------|-----------|
| 微服务 | 过度设计，4 人团队单项目 |
| Next.js 全栈 | 约束已指定 Vite + Express 分离 |
| 纯 MVC | 匿名映射逻辑复杂，需要独立 Service 层 |
| Redux | 对项目规模过重，Zustand 更合适（ADR-003） |

## 当前实现状态

> ⚠️ 以上架构是**目标架构**。当前代码处于逐步演进的早期阶段，实现与文档存在差距。

### 前端现状（与目标架构的差距）

| 层面 | 目标（文档） | 当前实际 |
|------|-------------|----------|
| 状态管理 | Zustand Store（5 个 store） | `App.jsx` 中所有状态通过 `useState` + `useEffect` + `localStorage` |
| Hooks | `useAuth.js`, `usePosts.js` 等 | 尚未创建，逻辑在组件内 |
| Services | Axios API 封装 | 尚未创建，使用 localStorage 作为数据层 |
| 组件分层 | Pages / Features / Layout / Common | 所有组件平铺在 `components/` 下 |
| 路由 | React Router | 通过 `activePage` 字符串变量条件渲染 |

### 后端现状

- `backend/package.json` 已配置，依赖（Express, Mongoose, dotenv, cors 等）已声明
- `backend/src/` 目录尚未创建，routes/controllers/services/models/middlewares/utils 均不存在
- 无数据库连接、无中间件、无接口

### 迁移计划（按优先级）

1. 安装 zustand 依赖 → 创建 store 目录和 uiStore（toast、loading 等轻量状态）
2. 创建 services 层封装 localStorage 读写（后续替换为 Axios 调用）
3. 创建 hooks 层将组件业务逻辑提取出来
4. 重构 App.jsx：将帖子、评论、收藏等状态拆分到对应 store
5. 后端实现时先创建项目骨架（入口、中间件、路由注册），再按模块迭代
