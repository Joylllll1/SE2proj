import { request } from './apiClient.js';

export const sendMessage = async (sessionId, message, options = {}) => {
  const data = await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
    ...options,
  });
  return data;
};

export const getSessions = async () => {
  const data = await request('/api/ai/sessions');
  return data.data.sessions;
};

export const getSession = async (sessionId) => {
  const data = await request(`/api/ai/sessions/${sessionId}`);
  return data.data;
};

export const createSession = async () => {
  const data = await request('/api/ai/sessions', {
    method: 'POST',
  });
  return data.data.session;
};

export const deleteSession = async (sessionId) => {
  await request(`/api/ai/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  return { success: true };
};

export const regenerateMessage = async (sessionId, options = {}) => {
  const data = await request(`/api/ai/sessions/${sessionId}/regenerate`, {
    method: 'POST',
    ...options,
  });
  return data.data;
};

export const getProfile = async () => {
  const data = await request('/api/ai/profile');
  return data.data;
};

export const updateProfile = async (persona) => {
  const data = await request('/api/ai/profile', {
    method: 'PUT',
    body: JSON.stringify({ persona }),
  });
  return data.data;
};

export const getSessionPersona = async (sessionId) => {
  const data = await request(`/api/ai/sessions/${sessionId}/persona`);
  return data.data;
};

export const updateSessionPersona = async (sessionId, persona) => {
  const data = await request(`/api/ai/sessions/${sessionId}/persona`, {
    method: 'PUT',
    body: JSON.stringify({ persona }),
  });
  return data.data;
};

export async function sendMessageStream(sessionId, message, { signal, onToken, onToolCall, onToolResult, onDone, onError } = {}) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: '请求失败' }));
    onError?.(err.message || '请求失败');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        switch (data.type) {
          case 'token': onToken?.(data.content); break;
          case 'tool_call': onToolCall?.(data.tool, data.args); break;
          case 'tool_result': onToolResult?.(data.tool); break;
          case 'done': onDone?.(); break;
          case 'error': onError?.(data.message); break;
        }
      } catch { /* skip malformed */ }
    }
  }
}

export async function regenerateMessageStream(sessionId, { signal, onToken, onToolCall, onToolResult, onDone, onError } = {}) {
  const response = await fetch(`/api/ai/sessions/${sessionId}/regenerate`, { method: 'POST', signal });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: '请求失败' }));
    onError?.(err.message || '请求失败');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        switch (data.type) {
          case 'token': onToken?.(data.content); break;
          case 'tool_call': onToolCall?.(data.tool, data.args); break;
          case 'tool_result': onToolResult?.(data.tool); break;
          case 'done': onDone?.(); break;
          case 'error': onError?.(data.message); break;
        }
      } catch { /* skip */ }
    }
  }
}
