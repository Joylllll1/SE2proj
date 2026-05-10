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

export async function register(email, password) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data; // { user, accessToken, refreshToken }
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data; // { user, accessToken, refreshToken }
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function refreshToken() {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) throw new Error('No refresh token');

  const data = await request('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
  return data; // { accessToken, refreshToken }
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}
