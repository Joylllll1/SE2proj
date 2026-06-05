import { request } from './apiClient';

export async function fetchThemes(page = 1, limit = 20, query = '') {
  const q = query ? `&query=${encodeURIComponent(query)}` : '';
  return request(`/api/ratings/themes?page=${page}&limit=${limit}${q}`);
}

export async function fetchMyThemes(page = 1, limit = 20) {
  return request(`/api/ratings/themes/mine?page=${page}&limit=${limit}`);
}

export async function createTheme(payload) {
  return request('/api/ratings/themes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchThemeDetail(themeId) {
  return request(`/api/ratings/themes/${themeId}`);
}

export async function deleteTheme(themeId) {
  return request(`/api/ratings/themes/${themeId}`, { method: 'DELETE' });
}

export async function fetchTopics(page = 1, limit = 20, query = '', themeId = '') {
  const params = new URLSearchParams({ page, limit });
  if (query) params.set('query', query);
  if (themeId) params.set('themeId', themeId);
  return request(`/api/ratings/topics?${params}`);
}

export async function fetchMyTopics(page = 1, limit = 20) {
  return request(`/api/ratings/topics/mine?page=${page}&limit=${limit}`);
}

export async function createTopic(payload) {
  return request('/api/ratings/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchRatingDetail(topicId) {
  return request(`/api/ratings/topics/${topicId}`);
}

export async function deleteTopic(topicId) {
  return request(`/api/ratings/topics/${topicId}`, { method: 'DELETE' });
}

export async function toggleTopicLike(topicId) {
  return request(`/api/ratings/topics/${topicId}/like`, { method: 'POST' });
}

export async function submitRating(topicId, stars) {
  return request(`/api/ratings/topics/${topicId}`, {
    method: 'POST',
    body: JSON.stringify({ stars }),
  });
}

export async function fetchRatingComments(topicId) {
  return request(`/api/ratings/topics/${topicId}/comments`);
}

export async function createRatingComment(topicId, content, stars = null) {
  return request(`/api/ratings/topics/${topicId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, stars }),
  });
}

export async function toggleRatingCommentLike(commentId) {
  return request(`/api/ratings/comments/${commentId}/like`, { method: 'POST' });
}

export async function addRatingReply(commentId, content, replyToId = null) {
  return request(`/api/ratings/comments/${commentId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content, replyToId }),
  });
}

export async function toggleRatingReplyLike(commentId, replyId) {
  return request(`/api/ratings/comments/${commentId}/replies/${replyId}/like`, { method: 'POST' });
}
