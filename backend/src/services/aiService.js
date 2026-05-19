import AISession from '../models/AISession.js';
import AIMessage from '../models/AIMessage.js';
import AppError from '../utils/AppError.js';
import { buildSystemPrompt } from './aiPromptBuilder.js';
import { resolveEffectivePersona } from './aiPersonaService.js';

const MAX_CONTEXT_MESSAGES = 20; // 保留最近 20 条消息作为上下文
const MAX_SESSION_TITLE_LENGTH = 20;
const DEFAULT_LLM_ERROR_MESSAGE = '服务暂时不可用，请稍后再试';

function getLLMConfig() {
  return {
    apiUrl: process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'deepseek-chat',
  };
}

// 生成会话标题（基于首条消息）
function generateSessionTitle(content) {
  const trimmed = content.trim();
  if (trimmed.length <= MAX_SESSION_TITLE_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_SESSION_TITLE_LENGTH - 3)}...`;
}

function serializeSession(session, effectivePersona) {
  const rawPersona = session?.aiPersona
    ? typeof session.aiPersona.toObject === 'function'
      ? session.aiPersona.toObject()
      : session.aiPersona
    : null;

  return {
    _id: session._id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    aiPersona: rawPersona,
    effectivePersona,
  };
}

// 调用 LLM API
async function callLLM(messages, signal) {
  const { apiUrl, apiKey, model } = getLLMConfig();

  if (!apiKey) {
    throw new AppError('AI 服务未配置', 500, 'AI_NOT_CONFIGURED');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    await response.json().catch(() => ({}));
    throw new AppError(DEFAULT_LLM_ERROR_MESSAGE, 502, 'LLM_API_ERROR');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// 发送消息并获取 AI 回复
export const sendMessage = async (userId, sessionId, content, options = {}) => {
  // 获取或创建会话
  let session;
  if (sessionId) {
    session = await AISession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new AppError('会话不存在', 404, 'SESSION_NOT_FOUND');
    }
  } else {
    // 自动创建新会话
    session = await AISession.create({
      user: userId,
      title: generateSessionTitle(content),
    });
  }

  // 更新会话标题（如果是第一条消息且标题是默认值）
  if (session.title === '新会话') {
    const messageCount = await AIMessage.countDocuments({ session: session._id });
    if (messageCount === 0) {
      session.title = generateSessionTitle(content);
      await session.save();
    }
  }

  // 保存用户消息
  const userMessage = await AIMessage.create({
    session: session._id,
    role: 'user',
    content,
  });

  // 获取历史消息作为上下文
  const historyMessages = await AIMessage.find({ session: session._id })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_MESSAGES)
    .lean();

  // 按时间顺序排列
  historyMessages.reverse();

  // 构建 LLM 消息格式
  const effectivePersona = await resolveEffectivePersona(userId, session);
  const llmMessages = [
    { role: 'system', content: buildSystemPrompt(effectivePersona) },
    ...historyMessages.map(m => ({ role: m.role, content: m.content })),
  ];

  // 调用 LLM
  let aiContent;
  try {
    aiContent = await callLLM(llmMessages, options.signal);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('AI 生成已中断', 499, 'LLM_ABORTED');
    }

    if (error.isOperational) {
      throw new AppError(error.message, error.statusCode, error.errorCode, {
        session: serializeSession(session, effectivePersona),
        savedMessage: {
          _id: userMessage._id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        },
      });
    }
    throw error;
  }

  // 保存 AI 回复
  const aiMessage = await AIMessage.create({
    session: session._id,
    role: 'assistant',
    content: aiContent,
  });

  // 更新会话更新时间
  session.updatedAt = new Date();
  await session.save();

  return {
    session: serializeSession(session, effectivePersona),
    userMessage: {
      _id: userMessage._id,
      role: userMessage.role,
      content: userMessage.content,
      createdAt: userMessage.createdAt,
    },
    assistantMessage: {
      _id: aiMessage._id,
      role: aiMessage.role,
      content: aiMessage.content,
      createdAt: aiMessage.createdAt,
    },
  };
};

// 重新生成最后一条 AI 回复
export const regenerateMessage = async (userId, sessionId, options = {}) => {
  const session = await AISession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    throw new AppError('会话不存在', 404, 'SESSION_NOT_FOUND');
  }

  // 获取最后一条 AI 消息
  const lastMessage = await AIMessage.findOne({
    session: session._id,
    role: 'assistant',
  }).sort({ createdAt: -1 });

  if (!lastMessage) {
    throw new AppError('没有可重新生成的消息', 400, 'NO_MESSAGE_TO_REGENERATE');
  }

  // 获取历史消息（不包括最后一条 AI 消息）
  const historyMessages = await AIMessage.find({
    session: session._id,
    _id: { $ne: lastMessage._id },
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_MESSAGES)
    .lean();

  historyMessages.reverse();

  // 构建 LLM 消息格式
  const effectivePersona = await resolveEffectivePersona(userId, session);
  const llmMessages = [
    { role: 'system', content: buildSystemPrompt(effectivePersona) },
    ...historyMessages.map(m => ({ role: m.role, content: m.content })),
  ];

  // 调用 LLM
  let aiContent;
  try {
    aiContent = await callLLM(llmMessages, options.signal);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('AI 生成已中断', 499, 'LLM_ABORTED');
    }
    throw error;
  }

  // 更新 AI 消息
  lastMessage.content = aiContent;
  lastMessage.createdAt = new Date();
  await lastMessage.save();
  session.updatedAt = new Date();
  await session.save();

  return {
    session: serializeSession(session, effectivePersona),
    message: {
      _id: lastMessage._id,
      role: lastMessage.role,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
    },
  };
};

// 获取用户的所有会话
export const getSessions = async (userId) => {
  const sessions = await AISession.find({ user: userId })
    .sort({ updatedAt: -1 })
    .lean();

  return sessions.map(s => ({
    _id: s._id,
    title: s.title,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    hasPersonaOverride: Boolean(s.aiPersona && Object.keys(s.aiPersona).length > 0),
  }));
};

// 获取会话详情（含消息历史）
export const getSession = async (userId, sessionId) => {
  const session = await AISession.findOne({ _id: sessionId, user: userId }).lean();
  if (!session) {
    throw new AppError('会话不存在', 404, 'SESSION_NOT_FOUND');
  }

  const messages = await AIMessage.find({ session: sessionId })
    .sort({ createdAt: 1 })
    .lean();
  const effectivePersona = await resolveEffectivePersona(userId, session);

  return {
    session: serializeSession(session, effectivePersona),
    messages: messages.map(m => ({
      _id: m._id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  };
};

// 创建新会话
export const createSession = async (userId) => {
  const session = await AISession.create({
    user: userId,
    title: '新会话',
  });
  const effectivePersona = await resolveEffectivePersona(userId, session);

  return {
    session: serializeSession(session, effectivePersona),
  };
};

// 删除会话
export const deleteSession = async (userId, sessionId) => {
  const session = await AISession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    throw new AppError('会话不存在', 404, 'SESSION_NOT_FOUND');
  }

  // 删除会话及其所有消息
  await AIMessage.deleteMany({ session: sessionId });
  await AISession.deleteOne({ _id: sessionId });

  return { success: true };
};
