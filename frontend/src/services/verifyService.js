const API_BASE = '';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
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

export async function sendVerifyCode(email, type) {
  return request('/api/verify/send', {
    method: 'POST',
    body: JSON.stringify({ email, type }),
  });
}

export async function checkVerifyCode(email, code, type) {
  return request('/api/verify/check', {
    method: 'POST',
    body: JSON.stringify({ email, code, type }),
  });
}
