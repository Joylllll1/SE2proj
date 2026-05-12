## 1. 后端数据模型

- [ ] 1.1 新建 FortuneItem 模型（`models/FortuneItem.js`）：字段 type/dos/donts、activity、description
- [ ] 1.2 新建 CheckIn 模型（`models/CheckIn.js`）：字段 userId、date、level、dos、donts，复合唯一索引 `{ userId, date }`
- [ ] 1.3 在 `backend/src/index.js` 中确保模型注册

## 2. 后端 API

- [ ] 2.1 创建 fortuneService.js：打卡逻辑（查/建 CheckIn）、运势生成（seededRandom + FortuneItem 选取）、连续天数计算
- [ ] 2.2 创建 fortuneController.js：checkin 处理器，调用 service 并组装响应
- [ ] 2.3 创建 fortuneRoutes.js：`POST /api/fortune/checkin`（挂 auth 中间件）
- [ ] 2.4 在 `backend/src/index.js` 注册 fortuneRoutes

## 3. 种子数据

- [ ] 3.1 创建 FortuneItem 种子数据 JSON 文件（宜约 1000 条、忌约 1000 条），按类别组织，忌类采用批评/后果+幽默风格
- [ ] 3.2 创建 seedFortune.js 脚本：清空集合 → 读取 JSON → 批量插入，支持 `--reset` 参数
- [ ] 3.3 在 `backend/package.json` 添加 `seed:fortune` 快捷命令

## 4. 前端对接

- [ ] 4.1 fortuneService.js：封装 `POST /api/fortune/checkin` 调用
- [ ] 4.2 重写 DailyFortune.jsx：移除硬编码 FORTUNE_ITEMS 和 localStorage 逻辑，改为调 API
- [ ] 4.3 验证：打卡 → 显示运势 → 刷新 → 数据不丢失 → 连续天数正确
