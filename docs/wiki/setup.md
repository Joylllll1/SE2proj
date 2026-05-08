# 环境搭建指南

## 前置要求

- Node.js >= 18
- npm（随 Node.js 安装）
- MongoDB（本地或远程实例，后端对接时再配置）

## 前端

```bash
cd frontend
npm install        # 安装依赖
npm run dev        # 启动开发服务器，默认 http://localhost:5173
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

前端使用 localStorage 做数据模拟，无需后端即可独立运行。所有数据以 `nju_*` 为 key 前缀存储在浏览器本地。

## 后端

```bash
cd backend
npm install        # 安装依赖
npm run dev        # 启动开发服务器（nodemon 热重载），默认 http://localhost:3000
npm run start      # 生产启动
```

后端 `src/` 目录尚未创建，当前只有 package.json 脚手架。

### 环境变量（后端）

在 `backend/` 下创建 `.env` 文件：

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/treehole
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

## 运行检查清单

- [x] 前端 `npm run dev` 启动成功 → 浏览器访问 http://localhost:5173
- [ ] 后端 `npm run dev` 启动成功 → 后端 `src/` 目录创建后配置
- [ ] MongoDB 连接正常 → 后端实现 API 后配置

## 常见问题

### 前端页面没有数据？

首次加载时 `App.jsx` 中的 seed 数据会自动写入 localStorage。如果 localStorage 被清空，刷新页面即可重新初始化。

### 前端修改后不热更新？

确认由 Vite 启动开发服务器（默认 5173 端口），非直接打开 HTML 文件。

### 后端报 ESM 相关错误？

确认 `backend/package.json` 包含 `"type": "module"`，后端使用 ES Module 规范（`import`/`export` 语法）。
