const API_BASE = '';
import useAuthStore from '../store/authStore';

export async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 401 + 有 token = token 过期/无效，清除状态跳转到 landing
  if (res.status === 401 && token) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    window.location.href = '/';
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || '请求失败');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export default request;
