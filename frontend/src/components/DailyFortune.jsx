import { useState, useEffect } from 'react';
import Icon from './Icon';

// 运势等级配置 - 温暖色调
const FORTUNE_LEVELS = [
  { level: '大吉', color: 'var(--color-blue)', icon: 'stars', desc: '诸事顺遂，好运连连' },
  { level: '中吉', color: 'var(--color-teal)', icon: 'sentiment_very_satisfied', desc: '运势不错，继续保持' },
  { level: '小吉', color: 'var(--color-green)', icon: 'sentiment_satisfied', desc: '平稳向好，小有收获' },
  { level: '中平', color: 'var(--color-orange)', icon: 'sentiment_neutral', desc: '平淡无奇，顺其自然' },
  { level: '小凶', color: 'var(--color-purple)', icon: 'sentiment_dissatisfied', desc: '小心谨慎，避免冲动' },
  { level: '大凶', color: 'var(--color-blue-2)', icon: 'warning', desc: '韬光养晦，静待时机' },
];

// 宜忌选项库（新格式：activity + description）
const FORTUNE_ITEMS = {
  dos: [
    { activity: '晨跑锻炼', description: '清晨的空气最新鲜，跑完神清气爽' },
    { activity: '阅读经典', description: '沉浸书中的世界，让思绪慢慢沉淀' },
    { activity: '整理书桌', description: '整洁的环境让心情也变得清爽' },
    { activity: '学习烹饪', description: '自己做的饭菜，总是格外香' },
    { activity: '练习书法', description: '一笔一划间，心也慢慢静下来' },
    { activity: '早起早睡', description: '规律作息让你精力充沛' },
    { activity: '健身运动', description: '出汗的感觉真好，身体更轻松' },
    { activity: '听音乐', description: '优美的旋律让心情变得愉悦' },
    { activity: '写日记', description: '记录生活的点滴，留下美好回忆' },
    { activity: '做手工', description: '动手创造的乐趣，让生活更有趣' },
    { activity: '喝花茶', description: '淡淡的茶香，让人心情舒畅' },
    { activity: '散步', description: '慢下来，欣赏沿途的风景' },
    { activity: '看电影', description: '好电影能带来不一样的感动' },
    { activity: '和朋友聊天', description: '与好友畅聊，烦恼都烟消云散' },
    { activity: '整理房间', description: '整齐的空间，让人心旷神怡' },
    { activity: '学习新技能', description: '掌握新本领，让自己更优秀' },
    { activity: '种花养草', description: '看着植物成长，心情也变好了' },
    { activity: '做瑜伽', description: '舒展身体，让身心都放松' },
    { activity: '阅读新闻', description: '了解世界大事，开阔眼界' },
    { activity: '吃早餐', description: '美好的早晨从营养早餐开始' },
  ],
  donts: [
    { activity: '点外卖', description: '偶尔犒劳自己，外卖也很香' },
    { activity: '喝咖啡', description: '下午茶时光，一杯咖啡刚刚好' },
    { activity: '刷短视频', description: '轻松一下，刷几个有趣的视频' },
    { activity: '睡懒觉', description: '周末的早晨，多睡一会儿也无妨' },
    { activity: '玩游戏', description: '游戏也是一种放松方式，适度就好' },
    { activity: '吃甜食', description: '甜甜的美食让人心情变好' },
    { activity: '熬夜追剧', description: '剧情太精彩，但也要注意休息哦' },
    { activity: '购物', description: '买点喜欢的东西，让自己开心一下' },
    { activity: '吃夜宵', description: '饿了就吃点，别饿着肚子睡觉' },
    { activity: '赖床', description: '被窝很温暖，多躺一会儿也无妨' },
    { activity: '刷社交媒体', description: '看看朋友们都在做什么，也挺有趣' },
    { activity: '吃零食', description: '嘴馋的时候，吃点零食很正常' },
    { activity: '看漫画', description: '轻松的漫画，让人放松心情' },
    { activity: '听播客', description: '边听播客边做事，也是一种享受' },
    { activity: '点奶茶', description: '奶茶的快乐，懂的人都懂' },
    { activity: '逛购物网站', description: '看看有什么好东西，也是一种乐趣' },
    { activity: '吃火锅', description: '热气腾腾的火锅，让人胃口大开' },
    { activity: '看综艺', description: '搞笑综艺，让人开怀大笑' },
    { activity: '躺平', description: '偶尔什么都不想，就躺着放松一下' },
    { activity: '吃烧烤', description: '烧烤的香味，让人难以抗拒' },
  ],
};

// 基于日期和用户ID生成伪随机数
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return Math.abs(x - Math.floor(x));
}

// 获取今天的日期字符串
function getTodayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 获取星期几
function getWeekday() {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[new Date().getDay()];
}

// 生成今日运势
function generateDailyFortune(userId) {
  const today = getTodayDate();
  const dateNum = parseInt(today.replace(/-/g, '')) || 20250425;

  // 确保 userId 有效，否则使用默认值
  const userIdStr = userId || 'USER001';
  const userNum = parseInt(userIdStr.slice(-6)) || 123456;

  const seed = dateNum + userNum;

  // 运势等级 (0-5)
  const levelIndex = Math.floor(seededRandom(seed) * FORTUNE_LEVELS.length);

  // 确保索引在有效范围内
  const safeIndex = Math.max(0, Math.min(levelIndex, FORTUNE_LEVELS.length - 1));
  const fortune = FORTUNE_LEVELS[safeIndex];

  // 确保 fortune 有效
  if (!fortune) {
    console.error('Invalid fortune index:', levelIndex, 'safeIndex:', safeIndex);
    return FORTUNE_LEVELS[0]; // 返回默认运势
  }

  // 生成宜忌 (各2个)
  const goodCount = 2;
  const badCount = 2;

  const shuffledGood = [...FORTUNE_ITEMS.dos].sort(() => seededRandom(seed + 3) - 0.5);
  const shuffledBad = [...FORTUNE_ITEMS.donts].sort(() => seededRandom(seed + 4) - 0.5);

  return {
    level: fortune.level,
    color: fortune.color,
    icon: fortune.icon,
    desc: fortune.desc,
    good: shuffledGood.slice(0, goodCount),
    bad: shuffledBad.slice(0, badCount),
    date: today,
  };
}

// 计算连续打卡天数
function calculateStreak(checkInHistory) {
  if (!checkInHistory || checkInHistory.length === 0) return 0;

  const sortedDates = [...checkInHistory].sort().reverse();
  const today = getTodayDate();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 如果今天没打卡，从昨天开始计算
  let startDate = sortedDates[0] === today ? today : yesterday;
  let streak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (sortedDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function DailyFortune({ userId = 'USER001', showToast }) {
  const [fortune, setFortune] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fortuneRevealed, setFortuneRevealed] = useState(false);

  // 从 localStorage 加载打卡数据
  useEffect(() => {
    const storageKey = `fortune_${userId}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const today = getTodayDate();
    const lastCheckIn = savedData.lastCheckIn;

    // 检查今天是否已打卡
    const checkedToday = lastCheckIn === today;
    setHasCheckedIn(checkedToday);

    // 计算连续打卡天数
    const history = savedData.checkInHistory || [];
    const streakCount = calculateStreak(checkedToday ? [...history, today] : history);
    setStreak(streakCount);

    // 只有今天已打卡才生成并显示运势
    if (checkedToday) {
      const dailyFortune = generateDailyFortune(userId);

      // 确保fortune有效
      if (!dailyFortune || !dailyFortune.level) {
        console.error('Failed to generate fortune:', dailyFortune);
        return;
      }

      setFortune(dailyFortune);
      setFortuneRevealed(true);
    }
  }, [userId]);

  // 处理打卡
  const handleCheckIn = () => {
    if (hasCheckedIn) return;

    setIsAnimating(true);

    // 更新 localStorage
    const storageKey = `fortune_${userId}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const history = savedData.checkInHistory || [];
    const today = getTodayDate();

    // 生成今日运势
    const dailyFortune = generateDailyFortune(userId);
    if (!dailyFortune || !dailyFortune.level) {
      console.error('Failed to generate fortune:', dailyFortune);
      return;
    }

    const newData = {
      lastCheckIn: today,
      checkInHistory: [...history, today],
    };

    localStorage.setItem(storageKey, JSON.stringify(newData));

    // 更新状态
    setFortune(dailyFortune);
    setFortuneRevealed(true);
    setHasCheckedIn(true);
    setStreak(streak + 1);

    // 显示提示
    setTimeout(() => {
      setIsAnimating(false);
      showToast(`🎉 打卡成功！你已连续打卡 ${streak + 1} 天`);
    }, 600);
  };

  // 打卡前状态：优雅的日期展示
  if (!fortuneRevealed) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = getWeekday();

    return (
      <>
        <div className="daily-fortune-card overflow-hidden rounded-2xl border border-line-soft bg-surface backdrop-blur-md shadow-sm">
          <div className="relative p-8">
            {/* 日期展示 - 居中、优雅 */}
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-widest text-text-3 uppercase mb-3">
                {weekday}
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl font-black tracking-tight" style={{ color: 'var(--color-blue)' }}>
                  {day}
                </span>
                <span className="text-xl font-medium text-text-2">
                  {month}月
                </span>
              </div>
              <p className="text-sm text-text-3">
                点击打卡，开启今日运势
              </p>
            </div>

            {/* 打卡按钮 */}
            <button
              className={`w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 ${
                hasCheckedIn
                  ? 'bg-surface-soft text-text-3 cursor-not-allowed'
                  : 'text-white shadow-sm hover:shadow-md hover:-translate-y-px'
              } ${isAnimating ? 'scale-95' : ''}`}
              style={
                !hasCheckedIn
                  ? { background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-2) 100%)' }
                  : undefined
              }
              onClick={handleCheckIn}
              disabled={hasCheckedIn}
              type="button"
            >
              {hasCheckedIn ? '今日已打卡' : '立即打卡'}
            </button>

            {streak > 0 && (
              <p className="mt-4 text-center text-xs text-text-3">
                已连续打卡 <span className="font-bold" style={{ color: 'var(--color-blue)' }}>{streak}</span> 天
              </p>
            )}

            {/* 隐藏的重置按钮（测试用 - 仅在开发时可见） */}
            <button
              className="absolute bottom-2 right-2 w-6 h-6 rounded-full opacity-0 hover:opacity-30 text-[10px] text-text-3 bg-transparent hover:bg-gray-200 transition-opacity"
              onClick={() => {
                Object.keys(localStorage).filter(key => key.includes('fortune')).forEach(key => localStorage.removeItem(key));
                location.reload();
              }}
              type="button"
              title="重置打卡数据"
            />
          </div>
        </div>
      </>
    );
  }

  // 打卡后状态：显示完整运势
  if (!fortune) return null;

  return (
    <>
    <div className="daily-fortune-card overflow-hidden rounded-2xl border border-line-soft bg-surface backdrop-blur-md shadow-sm">
      <div className="relative p-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="grid w-9 h-9 place-items-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-2) 100%)' }}>
              <Icon name="auto_awesome" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">每日运势</h3>
              <p className="text-xs text-text-3">{fortune.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>
                <Icon name="local_fire_department" className="text-sm" />
                <span>{streak}天</span>
              </div>
            )}
          </div>
        </div>

        {/* 运势等级 - 简洁优雅 */}
        <div className="mb-6 text-center py-5 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--color-surface-tint) 0%, var(--color-surface-soft) 100%)', border: '1px solid var(--color-line-soft)' }}>
          <div className="text-3xl font-black mb-1.5" style={{ color: fortune.color }}>
            {fortune.level}
          </div>
          <p className="text-sm text-text-2">{fortune.desc}</p>
        </div>

        {/* 宜忌 - 使用温暖色调，简洁布局 */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* 宜 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="check_circle" className="text-base" style={{ color: 'var(--color-green)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-green)' }}>宜</span>
            </div>
            <div className="space-y-2">
              {fortune.good.map((item, index) => (
                <div
                  key={index}
                  className="px-3 py-2.5 rounded-lg bg-white/60 border border-line-soft"
                >
                  <div className="text-sm font-bold text-text mb-0.5">{item.activity}</div>
                  <div className="text-xs text-text-2 leading-relaxed">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 忌 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Icon name="cancel" className="text-base" style={{ color: 'var(--color-purple)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-purple)' }}>忌</span>
            </div>
            <div className="space-y-2">
              {fortune.bad.map((item, index) => (
                <div
                  key={index}
                  className="px-3 py-2.5 rounded-lg bg-white/60 border border-line-soft"
                >
                  <div className="text-sm font-bold text-text mb-0.5">{item.activity}</div>
                  <div className="text-xs text-text-2 leading-relaxed">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 已打卡状态 */}
        <div className="pt-4 border-t border-line-soft text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-soft text-text-3 text-sm">
            <Icon name="check_circle" className="text-base" style={{ color: 'var(--color-green)' }} />
            今日已打卡
          </div>
        </div>

        {/* 隐藏的重置按钮（测试用 - 仅在开发时可见） */}
        <button
          className="absolute bottom-2 right-2 w-6 h-6 rounded-full opacity-0 hover:opacity-30 text-[10px] text-text-3 bg-transparent hover:bg-gray-200 transition-opacity"
          onClick={() => {
            Object.keys(localStorage).filter(key => key.includes('fortune')).forEach(key => localStorage.removeItem(key));
            location.reload();
          }}
          type="button"
          title="重置打卡数据"
        />
      </div>
    </div>
  </>
  );
}

export default DailyFortune;
