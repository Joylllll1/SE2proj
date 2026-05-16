const API_BASE = '/api/posts';

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

// Create a report for a post
export async function createReport(postId, reason) {
  return fetchWithAuth(`${API_BASE}/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
