import React, { useState } from 'react';
import Icon from '../common/Icon';
import ClickableImage from '../common/ClickableImage';
import ReportModal from './ReportModal';
import RatingTopicLikeButton from './RatingTopicLikeButton';
import { getDisplayName } from '../../utils';

export default function RatingTopicCard({ item, onOpen, onToggleLike, onReport }) {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReport = (targetId, reason) => {
    onReport?.(targetId, reason);
    setShowReportModal(false);
  };
  return (
    <article className="rating-list-card flex h-full flex-col rounded-xl border border-line bg-surface overflow-hidden transition-all duration-200 hover:border-blue hover:shadow-md hover:-translate-y-0.5">
      <div
        className="flex flex-1 flex-col cursor-pointer text-left"
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpen(item.id);
        }}
      >
        <div className="rating-list-cover aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface-soft">
          {item.image ? (
            <ClickableImage
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
              images={item.images?.length ? item.images : [item.image]}
              imageIndex={0}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-text-3">
              <Icon name="image" style={{ fontSize: '28px' }} />
            </div>
          )}
        </div>

        <div className="rating-list-body flex flex-1 flex-col p-4 pb-3">
          <div className="rating-list-title-row flex items-start justify-between gap-3 min-h-[2.75rem]">
            <h2 className="font-bold text-sm line-clamp-2 flex-1 leading-snug">{item.title}</h2>
            <div className="rating-list-score shrink-0 min-w-[3.25rem] text-right">
              {item.totalCount > 0 ? (
                <span className="rating-score-badge text-xl font-extrabold text-blue leading-none">
                  {item.averageScore.toFixed(1)}
                </span>
              ) : (
                <span className="text-text-3 text-xs leading-none whitespace-nowrap">暂无评分</span>
              )}
            </div>
          </div>

          <p className="rating-list-desc mt-2 min-h-[2.5rem] text-text-2 text-xs leading-5 line-clamp-2">
            {item.description || '\u00A0'}
          </p>
        </div>
      </div>

      <div className="rating-list-footer px-4 pb-4 pt-0 mt-auto">
        <div className="flex items-center justify-between gap-2 text-text-3 text-xs min-h-[1.125rem]">
          <span className="line-clamp-1">
            {item.totalCount > 0 ? `${item.totalCount} 人评分` : '等你来评'}
            {item.creatorUserId ? ` · 帖主 ${getDisplayName(item.creatorUserId, item.id)}` : ''}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {onReport && (
              <button
                type="button"
                className="grid w-7 h-7 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                }}
                aria-label="举报评分帖"
              >
                <Icon name="report_problem" style={{ fontSize: '16px' }} />
              </button>
            )}
            <RatingTopicLikeButton
              topicId={item.id}
              likes={item.likes}
              isLiked={item.isLiked}
              onToggle={onToggleLike}
            />
            <button
              type="button"
              className="flex items-center gap-1 text-blue font-semibold"
              onClick={() => onOpen(item.id)}
            >
              进入
              <Icon name="chevron_right" style={{ fontSize: '16px' }} />
            </button>
          </div>
        </div>

        <div className="rating-list-tags mt-2 flex min-h-[1.375rem] flex-wrap items-start gap-1">
          {item.tags?.length > 0
            ? item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="pill text-[10px] px-2 py-0.5">{tag}</span>
              ))
            : null}
        </div>
      </div>

      {showReportModal && onReport && (
        <ReportModal
          targetId={item.id}
          targetType="rating_topic"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </article>
  );
}
