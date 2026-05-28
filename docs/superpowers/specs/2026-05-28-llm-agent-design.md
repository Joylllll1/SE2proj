# LLM Agent 模块 — 设计文档

日期: 2026-05-28
状态: 设计稿（待实现）

## 1. 概述

将现有 chat-ai 模块重构为 llm-agent，引入独立的 Python Agent 服务（OpenAI Agents SDK），在保留现有对话能力的基础上新增联网搜索、帖子搜索、内容总结等 Agent 能力。底层 LLM 继续使用 DeepSeek。

## 2. 架构

```
前端 (React AIPanel)
    ↓ POST /api/ai/chat (SSE 流式)
Node.js (Express) — 路由/认证/会话管理/数据查询
    ↓ HTTP (内部)
Python Agent 服务 (FastAPI + OpenAI Agents SDK)
    ├─ function_tool: web_search(query)
    ├─ function_tool: search_posts(query)
    ├─ function_tool: get_post(postId)
    ├─ function_tool: get_hot_topics()
    └─ LLM: DeepSeek (OpenAI 兼容接口)
```

### 职责划分

| 层 | 职责 | 不变/改动 |
|----|------|-----------|
| 前端 | 面板 UI、消息渲染、SSE 解析 | 改：支持 SSE 流式渲染 |
| Node.js | 认证、会话/消息 CRUD、数据查询 API、请求转发 | 改：aiService.js 转发到 Python 而非直接调 LLM |
| Python | Agent 编排、tool 执行、LLM 调用 | 新增 |

## 3. Python Agent 服务

### 3.1 目录结构

```
agent-service/
├── main.py                # FastAPI 入口 + SSE endpoint
├── agent.py               # Agent 定义、Runner、instructions
├── config.py              # 环境变量配置
├── tools/
│   ├── __init__.py
│   ├── web_search.py      # 联网搜索
│   ├── post_search.py     # 帖子搜索
│   ├── get_post.py        # 获取单帖 + 评论
│   └── hot_topics.py      # 热帖话题
├── models.py              # Pydantic 请求/响应模型
├── backend_client.py      # 与 Node.js 通信的 HTTP 客户端
└── requirements.txt
```

### 3.2 依赖

```
openai-agents>=0.1.0
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
httpx>=0.28.0
pydantic>=2.0.0
python-dotenv>=1.0.0
```

### 3.3 Agent 定义

```python
# agent.py (核心逻辑)

llm_model = OpenAIModel(
    model=config.LLM_MODEL,         # deepseek-chat
    base_url=config.LLM_BASE_URL,   # https://api.deepseek.com/v1
)

agent = Agent(
    name="树洞助手",
    instructions=f"""
你是 NJU 树洞的 AI 助手，帮助用户完成以下任务：
1. 日常对话交流
2. 联网搜索实时信息（自行判断是否需要）
3. 搜索站内帖子（自行判断是否需要）
4. 总结帖子内容和评论
5. 汇总站内热门话题

{persona_instructions}

回复语言：简体中文
回复风格：友好、温暖，字数适中
""",
    model=llm_model,
    tools=[web_search, search_posts, get_post, get_hot_topics],
)
```

### 3.4 Tool 定义

所有 tool 使用 `@function_tool` 装饰器，通过 `backend_client` 调用 Node.js 内部 API。

```python
# tools/web_search.py
@function_tool
async def web_search(query: str) -> str:
    """当你需要实时信息、最新新闻、或知识库之外的答案时，联网搜索"""
    # 调用 Tavily / SerpAPI / Bing Search API 等
    return search_results

# tools/post_search.py
@function_tool
async def search_posts(query: str) -> str:
    """搜索站内帖子内容，当用户询问特定话题的帖子时使用"""
    # 调 Node.js GET /api/posts/search?q={query}
    return posts_json

# tools/get_post.py
@function_tool
async def get_post(post_id: str) -> str:
    """获取指定帖子的内容和评论"""
    # 调 Node.js GET /api/posts/{postId}
    return post_with_comments_json

# tools/hot_topics.py
@function_tool
async def get_hot_topics() -> str:
    """获取当前热门帖子，用于回答"最近大家都在讨论什么"之类的问题"""
    # 调 Node.js GET /api/posts/hot
    return hot_posts_json
```

### 3.5 SSE 端点

```python
# main.py
@app.post("/chat")
async def chat(request: ChatRequest, user: UserAuth):
    """接收用户消息，流式返回 Agent 回复"""
    
    async def event_stream():
        # 构建消息历史
        messages = build_messages(request.history)
        result = Runner.run_streamed(agent, input=messages, context=request.context)
        
        async for event in result.stream_events():
            if event.type == "raw_response_event" and event.data.type == "delta":
                yield f"data: {json.dumps({'type': 'token', 'content': event.data.delta})}\n\n"
            elif event.type == "tool_usage_event":
                yield f"data: {json.dumps({'type': 'tool_call', 'tool': event.tool_name, 'args': event.tool_args})}\n\n"
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

Agent 切换工具时前端可展示"正在搜索…"等中间状态，提升体验。

### 3.6 配置

```python
# config.py
LLM_API_KEY      # DeepSeek API key
LLM_MODEL        # deepseek-chat (默认)
LLM_BASE_URL     # https://api.deepseek.com/v1
SEARCH_API_KEY   # 搜索服务（Tavily/SerpAPI）API key
SEARCH_API_URL   # 搜索服务 URL
BACKEND_URL      # Node.js 内部地址，如 http://localhost:5000
BACKEND_API_KEY  # Node.js 内部鉴权 token
HOST             # 0.0.0.0 (默认)
PORT             # 8001 (默认)
```

## 4. Node.js 端改动

### 4.1 aiService.js — LLM 调用替换

当前：调用 DeepSeek API 并等待完整响应
改为：调用 Python Agent 服务并透传 SSE 流

```js
// aiService.js (核心改动)
async function sendMessage(user, sessionId, message) {
  const session = await findOrCreateSession(user, sessionId);
  const userMsg = await saveMessage(session._id, 'user', message);
  const history = await getContextMessages(session._id);

  // 转发到 Python Agent 服务
  const response = await fetch(`${AGENT_SERVICE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user._id,
      sessionId: session._id,
      message,
      history,
      persona: effectivePersona,
    }),
  });

  // 解析 SSE 流
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // 逐行解析 SSE data:
    // data: {"type":"token","content":"..."}
    for (const line of chunk.split('\n')) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'token') fullContent += event.content;
        // 推送到客户端 SSE
        res.write(`data: ${line.slice(6)}\n\n`);
      }
    }
  }

  const assistantMsg = await saveMessage(session._id, 'assistant', fullContent);
  return { session, userMessage: userMsg, assistantMessage: assistantMsg };
}
```

### 4.2 环境变量新增

```
AGENT_SERVICE_URL=http://localhost:8001
```

### 4.3 不变的部分

- 路由：`POST /api/ai/chat`、`GET /api/ai/sessions` 等均不变
- 模型：AISession、AIMessage、AIProfile、aiPersonaSchema 不变
- 认证中间件不变
- 前端 aiStore.js 保持大部分逻辑，仅 SSE 解析部分改动

### 4.4 新增内部 API（供 Agent tool 调用）

Agent 的 tool（search_posts、get_post 等）通过 `backend_client` 调用 Node.js 内部 API。新增以下后端端点（或复用现有端点加内部鉴权）：

| 方法 | 路径 | 用途 |
|------|------|------|
| `GET` | `/api/internal/posts/search?q=` | 帖子搜索 |
| `GET` | `/api/internal/posts/:id` | 获取单帖+评论 |
| `GET` | `/api/internal/posts/hot` | 获取热帖 |

这些端点使用内部 API Key 鉴权（header `X-Internal-Api-Key`），不走 JWT。

## 5. 前端改动

### 5.1 SSE 流式渲染

aiService.js 改为 SSE 接收方式：

```js
// aiService.js (前端)
async function sendMessage(sessionId, message, onToken, onToolCall) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.next();
    if (done) break;
    const text = decoder.decode(value);
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'token') onToken(event.content);
        if (event.type === 'tool_call') onToolCall(event);
      }
    }
  }
}
```

### 5.2 AIPanel 增量更新

- messages 数组中当前 AI 回复为临时对象，不断追加 content
- AI 回复完成后保存到 store
- 工具调用时显示"正在搜索…"等状态指示

### 5.3 命名

| 现在 | 改成 |
|------|------|
| "树洞 AI" | "树洞助手" |
| AIPanel | AgentPanel |
| aiStore | agentStore |

## 6. Agent 能力：触发规则

| 能力 | 触发方式 | 说明 |
|------|----------|------|
| 联网搜索 | Agent 自行判断 | 遇到知识盲区、实时性问题时自动触发 |
| 帖子搜索 | Agent 自行判断 | 用户提及站内内容、话题时触发 |
| 帖子总结 | Agent 自行判断 | 用户在帖子详情页询问时，配合 get_post tool 使用 |
| 热帖汇总 | Agent 自行判断 | 用户问"最近大家都在讨论什么"时触发 |
| 日常对话 | 默认 | 无工具调用，纯 LLM 回复 |

## 7. 边界情况

- **Python 服务不可用**：Node.js 检测到连接失败时返回友好错误"助手暂时离线，请稍后再试"
- **搜索无结果**：Agent 回复"没有找到相关信息"并建议其他查询方式
- **超时**：SSE 流 30 秒无响应则超时断开
- **用户取消**：前端 AbortController 断开 SSE → Node.js 转发中止 → Python 取消 Agent 运行
- **Persona 配置**：保留现有 persona 层级，转为 agent instructions 的一部分
