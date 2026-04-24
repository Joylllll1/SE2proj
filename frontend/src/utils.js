/* ─── helpers ─── */

function genId() {
  return 'P-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function formatCount(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value;
}

function formatEventTime(datetimeLocal) {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' });

  return `${month}.${day} ${weekday} ${hours}:${minutes}`;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/* ─── anonymity system ─── */

function getUserId() {
  let uid = localStorage.getItem('nju_user_id');
  if (!uid) {
    uid = 'U-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem('nju_user_id', uid);
  }
  return uid;
}

const CURRENT_USER_ID = getUserId();

const ADJECTIVES = [
  '迷路的', '快乐的', '安静的', '勇敢的', '温柔的', '好奇的', '自由的', '淡定的',
  '机智的', '慵懒的', '认真的', '调皮的', '执着的', '佛系的', '傲娇的', '呆萌的',
  '搞怪的', '沉稳的', '热情的', '文艺的', '害羞的', '酷酷的', '优雅的', '活泼的',
];

const ANIMALS = [
  '小蓝鲸', '小猫咪', '小熊猫', '小兔子', '小狐狸', '小企鹅', '小海豚', '小松鼠',
  '小考拉', '小浣熊', '小刺猬', '小鹿', '小海豹', '小水獭', '小猫头鹰', '小柴犬',
];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getDisplayName(userId, postId) {
  const h = hashCode(userId + ':' + postId);
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const animal = ANIMALS[(h >> 8) % ANIMALS.length];
  return adj + animal;
}

function getPostAuthorName(postId) {
  return getDisplayName(CURRENT_USER_ID, postId);
}

export {
  genId,
  formatCount,
  formatEventTime,
  loadJSON,
  saveJSON,
  getUserId,
  CURRENT_USER_ID,
  ADJECTIVES,
  ANIMALS,
  hashCode,
  getDisplayName,
  getPostAuthorName,
};