import React, { useState } from 'react';
import Icon from './Icon';
import HeroCarousel from './HeroCarousel';
import PostCard from './PostCard';
import EmptyState from './EmptyState';
import DailyFortune from './DailyFortune';
import { TrendingTopics } from './DailyLuck';

function HomePage({ posts: visiblePosts, query, onOpenPost, onNavigate, likedPosts, bookmarks, onLike, onBookmark, onReport, carouselItems = [], onCarouselItemClick, showToast, userId }) {
  const [sort, setSort] = useState('latest');

  const sorted = [...visiblePosts].sort((a, b) => {
    if (sort === 'likes') return b.likes - a.likes;
    return 0; // latest = insertion order
  });

  return (
    <div className="home-grid grid grid-cols-[minmax(0,1fr)_320px] gap-5 max-w-[1380px] mx-auto max-lg:grid-cols-1">
      <section className="min-w-0">
        <HeroCarousel onNavigate={onNavigate} carouselItems={carouselItems} onCarouselItemClick={onCarouselItemClick} />
        <div className="overview-strip grid grid-cols-3 gap-3.5 mt-[18px] max-lg:grid-cols-1">
          <article className="overview-card p-4 rounded-md border border-line bg-white/80 shadow-xs">
            <span className="overview-label inline-block mb-1.5 text-blue text-[11px] font-bold tracking-widest uppercase">匿名表达</span>
            <strong className="block text-[17px] tracking-tight">同帖稳定身份</strong>
            <p className="mt-1.5 mb-0 text-text-2 text-[13px] leading-relaxed">减少熟人压力，同时保留讨论连续性。</p>
          </article>
          <article className="overview-card p-4 rounded-md border border-line bg-white/80 shadow-xs">
            <span className="overview-label inline-block mb-1.5 text-blue text-[11px] font-bold tracking-widest uppercase">内容组织</span>
            <strong className="block text-[17px] tracking-tight">标签、搜索、收藏</strong>
            <p className="mt-1.5 mb-0 text-text-2 text-[13px] leading-relaxed">用更低成本找到真正相关的内容和情绪。</p>
          </article>
          <article className="overview-card p-4 rounded-md border border-line bg-white/80 shadow-xs">
            <span className="overview-label inline-block mb-1.5 text-blue text-[11px] font-bold tracking-widest uppercase">社区治理</span>
            <strong className="block text-[17px] tracking-tight">举报与后台追责</strong>
            <p className="mt-1.5 mb-0 text-text-2 text-[13px] leading-relaxed">匿名不等于失控，平台仍然可治理、可审计。</p>
          </article>
        </div>
        <div className="section-head flex items-end justify-between gap-[18px] mt-[30px] mb-[18px] max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="eyebrow mb-1.5 text-blue text-xs font-bold tracking-widest uppercase">Anonymous Feed</p>
            <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">全站动态</h1>
          </div>
          <div className="tabs flex flex-wrap gap-2 max-sm:w-full" aria-label="动态排序">
            {[
              ['latest', '最新发布'],
              ['likes', '高赞共鸣'],
              ['topics', '话题聚焦'],
            ].map(([key, label]) => (
              <button
                className={`border border-line rounded-full bg-white text-text-2 font-semibold shadow-xs px-[14px] py-2 text-[13px] transition-colors duration-150 hover:border-[#b0c4de] hover:text-blue ${sort === key ? 'active text-white border-[#1d1d1f] bg-[#1d1d1f]' : ''} max-sm:flex-1`}
                key={key}
                onClick={() => setSort(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {query && (
          <p className="result-hint mb-[14px] text-text-2 text-sm">
            搜索 &quot;{query}&quot; 找到 {visiblePosts.length} 条相关树洞。
          </p>
        )}
        <div className="post-list grid gap-4">
          {sorted.length > 0 ? (
            sorted.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpen={() => onOpenPost(post)}
                liked={likedPosts.includes(post.id)}
                bookmarked={bookmarks.includes(post.id)}
                onLike={() => onLike(post.id)}
                onBookmark={() => onBookmark(post.id)}
                onReport={onReport}
              />
            ))
          ) : (
            <EmptyState title="树洞里暂时没有找到相关话题" description="换一个关键词，或者去发布第一条相关动态。" />
          )}
        </div>
      </section>
      <aside className="right-rail sticky top-[80px] grid self-start gap-4 max-lg:static max-lg:grid-cols-3 max-sm:grid-cols-1">
        <DailyFortune userId={userId} showToast={showToast} />
        <TrendingTopics />
      </aside>
    </div>
  );
}

export default HomePage;