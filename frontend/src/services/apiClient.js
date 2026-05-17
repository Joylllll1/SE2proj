const API_BASE = '';
import useAuthStore from '../store/authStore';

export async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const data = await res.json().catch(() => null);

  // 401 + 有 token = token 过期/无效，清除状态并抛错
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
    const error = new Error(data?.error || '登录已过期，请重新登录');
    error.status = 401;
    error.data = data;
    window.location.assign('/');
    throw error;
  }

  if (!res.ok) {
    const error = new Error(data?.error || '请求失败');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export default request;
