import React, { useState } from 'react';
import Icon from './Icon';

function TrendingPage({ onOpenPost }) {
  const [category, setCategory] = useState('全部');
  const trendingPosts = [
    { id: 'T-001', tag: '期末周碎碎念', count: '1.2w 讨论', heat: 95, description: '期末复习的压力与吐槽，大家互帮互助一起扛过去。' },
    { id: 'T-002', tag: '仙林六食堂新菜', count: '8.5k 讨论', heat: 78, description: '六食堂新品测评，到底值不值得排队？' },
    { id: 'T-003', tag: '杜厦图书馆攻略', count: '4.2k 讨论', heat: 62, description: '各楼层环境、插座、WiFi 实况分享。' },
    { id: 'T-004', tag: '毕业晚会志愿者招募', count: '2.1k 讨论', heat: 45, description: '毕业晚会需要你的力量，快来报名！' },
    { id: 'T-005', tag: '南大星空摄影', count: '3.8k 讨论', heat: 55, description: '在校园里捕捉最美的夜空。' },
    { id: 'T-006', tag: '考研经验分享', count: '6.7k 讨论', heat: 72, description: '上岸学长学姐的经验帖合集。' },
  ];

  const categories = ['全部', '校园生活', '学习交流', '情感树洞', '求职实习', '兴趣圈子'];

  return (
    <div className="trending-page max-w-[1180px] mx-auto">
      <section className="section-head large flex items-center justify-between gap-[18px]">
        <div>
          <p className="eyebrow mb-6 text-blue text-xs font-bold tracking-widest uppercase">Trending Topics</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">热门话题</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">发现南大树洞中最受关注的讨论话题。</p>
        </div>
      </section>
      <div className="category-row flex flex-wrap gap-2 my-[22px]">
        {categories.map((cat) => (
          <button className={`border border-line rounded-full bg-white text-text-2 font-semibold shadow-xs px-4 py-[10px] text-sm transition-colors duration-150 hover:border-[#b0c4de] hover:text-blue ${category === cat ? 'active text-white border-[#1d1d1f] bg-[#1d1d1f]' : ''}`} key={cat} onClick={() => setCategory(cat)} type="button">
            {cat}
          </button>
        ))}
      </div>
      <section className="trending-grid grid grid-cols-3 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-1">
        {trendingPosts.map((topic) => (
          <article className="trending-card p-5 border border-line-soft rounded-md bg-surface shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md" key={topic.id}>
            <div className="trending-header flex items-center justify-between mb-3">
              <span className="trending-rank grid w-8 h-8 place-items-center rounded-lg bg-surface-soft text-text text-sm font-bold">#{topic.id.split('-')[1]}</span>
              <span className="trending-heat inline-flex items-center gap-1 text-orange text-[13px] font-bold"><Icon name="local_fire_department" /> {topic.heat}&deg;</span>
            </div>
            <h3 className="m-0 mb-2 text-xl tracking-tight text-text">#{topic.tag}#</h3>
            <p className="m-0 text-text-2 text-sm leading-relaxed">{topic.description}</p>
            <footer className="flex items-center justify-between gap-3 mt-4 pt-[14px] border-t border-line-soft">
              <span className="text-text-3 text-[13px] font-semibold">{topic.count}</span>
              <button type="button" className="border-0 rounded-full px-[14px] py-2 text-blue bg-blue-soft text-[13px] font-bold cursor-pointer">参与讨论</button>
            </footer>
            <div className="trending-bar overflow-hidden h-1 mt-[14px] rounded-full bg-surface-soft">
              <i className="block h-full rounded-full bg-gradient-to-r from-blue to-orange" style={{ width: `${topic.heat}%` }} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default TrendingPage;