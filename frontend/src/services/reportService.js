import { request } from './apiClient';

const POST_API_BASE = '/api/posts';
const RATING_API_BASE = '/api/ratings';

// Create a report for a post, comment, or reply
export async function createReport(targetId, reason, targetType = 'post') {
  return request(`${POST_API_BASE}/${targetId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, targetType }),
  });
}

export async function createRatingReport(targetId, reason, targetType) {
  let endpoint;
  if (targetType === 'rating_theme') {
    endpoint = `${RATING_API_BASE}/themes/${targetId}/report`;
  } else if (targetType === 'rating_topic') {
    endpoint = `${RATING_API_BASE}/topics/${targetId}/report`;
  } else {
    endpoint = `${RATING_API_BASE}/comments/${targetId}/report`;
  }

  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ reason, targetType }),
  });
}
