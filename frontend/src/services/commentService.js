const API_BASE = '';

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
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

export async function createComment(postId, content, official = false) {
  return request('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ postId, content, official }),
  });
}

export async function getComments(postId) {
  return request(`/api/comments/${postId}`);
}

export async function deleteComment(commentId) {
  return request(`/api/comments/${commentId}`, { method: 'DELETE' });
}

export async function toggleLike(commentId) {
  return request(`/api/comments/${commentId}/like`, { method: 'POST' });
}

export async function addReply(commentId, content, official = false) {
  return request(`/api/comments/${commentId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content, official }),
  });
}

export async function toggleReplyLike(commentId, replyId) {
  return request(`/api/comments/${commentId}/reply/${replyId}/like`, { method: 'POST' });
}
