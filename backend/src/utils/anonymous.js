/**
 * 帖子级匿名 ID 生成（与前端 utils.js hashCode 算法一致）
 * 用于评分映射与防刷，不对外暴露 userId
 */
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateAnonId(userId, postId) {
  const h = hashCode(`${userId}:${postId}`);
  return `anon_${h.toString(36)}`;
}
