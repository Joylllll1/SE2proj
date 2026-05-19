import { request } from './apiClient.js';

export const sendMessage = async (sessionId, message) => {
  const data = await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
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

export const regenerateMessage = async (sessionId) => {
  const data = await request(`/api/ai/sessions/${sessionId}/regenerate`, {
    method: 'POST',
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
