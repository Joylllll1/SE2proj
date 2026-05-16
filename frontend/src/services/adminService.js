const API_BASE = '/api/admin';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Reports
export const getReports = () => fetchWithAuth(`${API_BASE}/reports`);

export const dismissReport = (reportId) =>
  fetchWithAuth(`${API_BASE}/reports/${reportId}/dismiss`, { method: 'POST' });

// Posts/Comments
export const tracePost = (targetId, targetType, reason) => {
  const endpoint = targetType === 'comment' || targetType === 'reply'
    ? `${API_BASE}/comments/${targetId}/trace`
    : `${API_BASE}/posts/${targetId}/trace`;
  return fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify({ reason, targetType }),
  });
};

export const deletePost = (postId, reason) =>
  fetchWithAuth(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });

// Users
export const banUser = (userId, { days, reason, relatedPostId }) =>
  fetchWithAuth(`${API_BASE}/users/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ days, reason, relatedPostId }),
  });

// Bans
export const getBans = (includeInactive = false) =>
  fetchWithAuth(`${API_BASE}/bans?includeInactive=${includeInactive}`);

export const unbanUser = (banId, reason) =>
  fetchWithAuth(`${API_BASE}/bans/${banId}/unban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

// Audit Logs
export const getAuditLogs = (action, limit) => {
  const params = new URLSearchParams();
  if (action) params.append('action', action);
  if (limit) params.append('limit', limit);
  return fetchWithAuth(`${API_BASE}/audit-logs?${params}`);
};
