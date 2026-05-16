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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Create a report for a post, comment, or reply
export async function createReport(targetId, reason, targetType = 'post') {
  return fetchWithAuth(`${API_BASE}/${targetId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, targetType }),
  });
}
