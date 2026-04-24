import React, { useState } from 'react';
import Icon from './Icon';
import { getDisplayName, formatCount } from '../utils';

function PostCard({ post, onOpen, compact = false, liked, bookmarked, onLike, onBookmark, onReport }) {
  const [showReportMenu, setShowReportMenu] = useState(false);
  const authorName = getDisplayName(post.ownerUserId, post.id);
  return (
    <article className={`post-card ${compact ? 'compact' : ''} relative overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm transition-transform duration-150 hover:-translate-y-px hover:shadow-sm`}>
      <div className="block w-full p-[18px_20px_14px] cursor-pointer" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}>
        <div className="post-header flex items-start justify-between gap-3.5 mb-4">
          <div className="user-block flex items-center gap-[11px]">
            <div className="anon-avatar grid w-[38px] h-[38px] flex-none place-items-center border border-line rounded-[10px] bg-surface-soft text-text-3">
              <Icon name="person" />
            </div>
            <div>
              <strong className="block text-sm">{authorName}</strong>
              <span className="block mt-0.5 text-text-3 text-xs">{post.time} · {post.campus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`mood mood-${post.moodType} inline-flex items-center gap-[5px] w-fit rounded-full px-[10px] py-2 text-xs font-semibold leading-none border border-transparent`}>{post.mood}</span>
            {onReport && (
              <button
                className="flex-shrink-0 grid w-8 h-8 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors duration-150"
                onClick={(e) => { e.stopPropagation(); setShowReportMenu(!showReportMenu); }}
                type="button"
                aria-label="举报"
              >
                <Icon name="report_problem" />
              </button>
            )}
          </div>
        </div>
        <h3 className={`m-0 mb-2 leading-snug tracking-tight ${compact ? 'text-[19px]' : 'text-xl'}`}>{post.title}</h3>
        <p className="m-0 text-[15px] leading-relaxed text-[#344054]">{post.content}</p>
        {post.image && <img className="w-full max-h-80 mt-3.5 rounded-md object-cover" alt={post.title} src={post.image} />}
      </div>
      {/* Report dropdown */}
      {showReportMenu && (
        <div
          className="absolute right-5 top-14 z-10 w-56 p-2 border border-line rounded-md bg-white shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-3 py-2 text-xs font-semibold text-text-3">选择举报原因</p>
          {['辱骂/攻击', '敏感内容', '垃圾广告', '虚假信息', '其他'].map((reason) => (
            <button
              key={reason}
              className="w-full text-left px-3 py-2 border-0 rounded-md bg-transparent text-sm text-text-2 hover:bg-surface-soft hover:text-text transition-colors duration-150 cursor-pointer"
              onClick={() => { onReport(post.id, reason); setShowReportMenu(false); }}
              type="button"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
      <div className="post-footer flex items-center justify-between gap-3.5 px-5 py-[10px_20px_14px] border-t border-line-soft bg-[#fafbfc]">
        <div className="tag-row flex flex-wrap gap-2.5 text-text-3 text-xs font-semibold">
          {post.tags.map((tag) => (
            <span key={tag} className="text-blue">#{tag}</span>
          ))}
        </div>
        <div className="metrics flex flex-wrap gap-2.5 text-text-3 text-xs font-semibold">
          <span className={`metric-btn cursor-pointer transition-colors duration-150 hover:scale-108 ${liked ? 'active text-red' : ''}`} onClick={(e) => { e.stopPropagation(); onLike(); }}>
            <Icon name={liked ? 'favorite' : 'favorite_border'} /> {formatCount(post.likes)}
          </span>
          <span className="metric-btn cursor-pointer transition-transform duration-150 hover:scale-108" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            <Icon name="chat_bubble" /> {formatCount(post.comments)}
          </span>
          <span className={`metric-btn cursor-pointer transition-transform duration-150 hover:scale-108 ${bookmarked ? 'active text-blue' : ''}`} onClick={(e) => { e.stopPropagation(); onBookmark(); }}>
            <Icon name={bookmarked ? 'bookmark' : 'bookmark_border'} /> {formatCount(post.saves)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default PostCard;