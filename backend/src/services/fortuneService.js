import CheckIn from '../models/CheckIn.js';
import FortuneItem from '../models/FortuneItem.js';

const FORTUNE_LEVELS = ['大吉', '中吉', '小吉', '中平', '小凶', '大凶'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return Math.abs(x - Math.floor(x));
}

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pickRandom(arr, count, seed) {
  const shuffled = [...arr].sort(() => seededRandom(seed) - 0.5);
  return shuffled.slice(0, count);
}

async function calcStreak(userId) {
  const records = await CheckIn.find({ userId }).sort({ date: -1 }).lean();
  if (!records.length) return 0;

  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const startDate = records[0].date === today ? today : yesterday;

  let streak = 0;
  for (let i = 0; i < records.length; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (records.some((r) => r.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const checkin = async (userId) => {
  const today = getToday();

  // 已打卡？直接返回
  const existing = await CheckIn.findOne({ userId, date: today }).lean();
  if (existing) {
    const streak = await calcStreak(userId);
    return { checkedIn: false, ...existing, streak };
  }

  // 运势等级
  const dateNum = parseInt(today.replace(/-/g, ''));
  const userNum = parseInt((userId || '').slice(-6)) || 0;
  const seed = dateNum + userNum;
  const levelIndex = Math.floor(seededRandom(seed) * FORTUNE_LEVELS.length);
  const level = FORTUNE_LEVELS[levelIndex];

  // 选取宜忌
  const allDos = await FortuneItem.find({ type: 'dos' }).lean();
  const allDonts = await FortuneItem.find({ type: 'donts' }).lean();
  const dos = pickRandom(allDos, 2, seed + 3);
  const donts = pickRandom(allDonts, 2, seed + 4);

  // 创建打卡记录
  await CheckIn.create({ userId, date: today, level, dos, donts });

  const streak = await calcStreak(userId);

  return { checkedIn: true, date: today, level, dos, donts, streak };
};

export const getStatus = async (userId) => {
  const today = getToday();
  const existing = await CheckIn.findOne({ userId, date: today }).lean();
  const streak = await calcStreak(userId);

  if (existing) {
    return { checkedIn: true, ...existing, streak };
  }
  return { checkedIn: false, streak };
};
