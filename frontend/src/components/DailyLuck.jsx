import React from 'react';
import Icon from './Icon';

const topics = [
  ['今年毕业生就业去向', '1.2w 讨论', 86],
  ['仙林六食堂新菜测评', '8.5k 讨论', 64],
  ['杜厦图书馆空调好冷', '4.2k 讨论', 45],
  ['毕业晚会招募志愿者', '2.1k 讨论', 28],
];

function DailyLuck() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const luckWords = ['大吉', '中吉', '小吉', '吉'];
  const luckIdx = today.getDate() % luckWords.length;

  return (
    <section className="luck-card rounded-md p-4 text-white bg-gradient-to-br from-[#0f3d6e] to-[#1a6dd4] shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <strong>每日运势</strong>
        <span className="text-xs opacity-78">{dateStr}</span>
      </div>
      <strong className="block mt-[18px] mb-2 text-[38px] tracking-[0.16em] text-center">{luckWords[luckIdx]}</strong>
      <p className="m-0 text-[13px] leading-relaxed text-white/78 text-center">宜：复习、勇敢提问、早睡。忌：把所有压力都留到深夜。</p>
    </section>
  );
}

function TrendingTopics() {
  return (
    <section className="topic-card rounded-md p-4 border border-line-soft bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <strong>热门话题</strong>
        <Icon name="local_fire_department" />
      </div>
      {topics.map(([name, count, progress]) => (
        <a className="topic-row relative grid grid-cols-1fr_auto gap-1.5 mt-4 pb-3 text-sm font-bold text-inherit no-underline" href={`#${name}`} key={name}>
          <span>#{name}#</span>
          <small className="text-text-3 text-[11px]">{count}</small>
          <i style={{ width: `${progress}%` }} />
        </a>
      ))}
    </section>
  );
}

export { DailyLuck, TrendingTopics };