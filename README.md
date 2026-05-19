# NJU树洞

> 面向南京大学师生的半匿名表达、互助交流与内容治理平台

## 项目概述

NJU树洞希望为校园用户提供一个更低压力、更有边界感的表达空间，用于情绪倾诉、日常分享、校内互助、问题求助与经验交流。

和传统社交平台相比，这个项目更关注三个问题：

- 熟人环境下"不想被看到，但又想说出来"的表达需求
- 匿名表达带来的安全感，与社区失控风险之间的平衡
- 面向校园场景的信息组织、反馈效率与基本治理能力

## 核心特性

### 帖子级匿名

- 同一用户在同一帖子中的匿名身份保持一致（如"温柔的小蓝鲸"）
- 不同帖子中的匿名身份彼此隔离，降低跨帖关联风险
- 后台保留受控映射关系用于审计与追责

### 低压力表达

- 匿名发帖、评论，无需担心身份暴露
- 草稿箱功能，随时保存未完成的帖子
- 收藏与点赞，轻量互动

### 内容治理

- 举报机制（帖子/评论）
- 管理员审核（举报处理、内容删除、用户禁言）
- 审计日志与身份追溯

### AI 聊天助手

- 内嵌 AI 面板，支持多轮对话与上下文记忆
- 会话管理：新建、切换、删除历史会话
- AI 人设自定义：角色、语气、自定义指令
- 消息操作：复制、重新生成

## 功能清单

| 模块 | 功能 | 状态 |
|------|------|------|
| 认证 | 注册 / 登录（NJU 邮箱验证） | ✅ |
| 认证 | 忘记密码 / 修改密码 | ✅ |
| 帖子 | 匿名发帖 / 多图上传 | ✅ |
| 帖子 | 浏览 / 搜索 / 详情 | ✅ |
| 互动 | 评论 / 回复 / 点赞 / 收藏 | ✅ |
| 草稿 | 草稿箱 / 编辑草稿 / 从草稿发布 | ✅ |
| 通知 | 系统通知 / 点赞通知 / 回复通知 | ✅ |
| 公告 | 校园公告 / 活动发布 / 活动报名 | ✅ |
| 管理 | 举报审核 / 禁言 / 审计日志 | ✅ |
| 设置 | 个人设置 / 通知偏好 | ✅ |
| AI | AI 聊天 / 会话管理 / 人设自定义 | ✅ |
| 每日运势 | 随机运势卡片 | ✅ |

## 技术栈

**前端**
- React 18 + Vite 5
- Tailwind CSS v4（自定义暖粉紫配色）
- Zustand（状态管理）
- ESLint

**后端**
- Node.js（ESM）+ Express 4
- MongoDB + Mongoose 8
- JWT + HTTP-only Cookie 认证
- nodemon

## 仓库结构

```text
SE2proj/
├── backend/                # 后端服务
│   └── src/
│       ├── config/         # 数据库配置
│       ├── controllers/    # 控制器层
│       ├── middlewares/     # 中间件（auth、errorHandler）
│       ├── models/         # Mongoose 模型
│       ├── routes/         # 路由定义
│       ├── services/       # 业务逻辑层
│       └── utils/          # 工具函数
├── frontend/               # 前端应用
│   └── src/
│       ├── components/     # React 组件
│       │   ├── pages/      # 页面组件
│       │   ├── features/   # 功能组件（AIPanel、PostCard 等）
│       │   ├── layout/     # 布局组件（Sidebar、TopBar）
│       │   └── common/     # 通用组件（Icon、Toast、Modal）
│       ├── hooks/          # 自定义 Hooks
│       ├── services/       # API 调用层
│       ├── store/          # Zustand 状态管理
│       └── utils.js        # 工具函数（匿名 ID 系统等）
├── docs/                   # 项目文档
│   └── wiki/               # 开发知识库
└── openspec/               # OpenSpec 变更管理
```

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6+
- npm 9+

### 后端配置

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入数据库连接、JWT 密钥、SMTP 配置、LLM API Key 等
npm install
npm run dev
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### 部署

```bash
# 后端使用 PM2
cd backend
pm2 start src/index.js --name treehole-api

# 前端构建
cd frontend
npm run build
# 将 dist/ 目录部署到 Nginx 或其他静态服务器
```

## 团队成员

王祎、王嘉乐、邱添、张浩宇
