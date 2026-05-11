const API_BASE = '';

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || '请求失败');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function fetchPosts(page = 1, query = '') {
  const params = new URLSearchParams({ page, limit: 20 });
  if (query) params.set('query', query);
  return request(`/api/posts?${params}`);
}

export async function fetchPostById(id) {
  return request(`/api/posts/${id}`);
}

export async function createPost(data) {
  return request('/api/posts', { method: 'POST', body: JSON.stringify(data) });
}

export async function deletePost(id) {
  return request(`/api/posts/${id}`, { method: 'DELETE' });
}

export async function toggleLike(id) {
  return request(`/api/posts/${id}/like`, { method: 'POST' });
}
