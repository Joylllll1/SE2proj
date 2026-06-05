import React, { useState } from 'react';
import Icon from '../common/Icon';
import TimeAgo from '../common/TimeAgo';
import ReportModal from './ReportModal';
import { StarRatingDisplay } from './StarRatingInput';
import { getDisplayName } from '../../utils';

function ReplyItem({ reply, topicId, onReply, onReport }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const displayName = getDisplayName(reply.ownerUserId, topicId);
  const parentName = reply.replyToId
    ? getDisplayName(reply.parentAuthorId, topicId)
    : null;

  const handleReport = (targetId, reason) => {
    onReport?.(targetId, reason, 'rating_reply');
    setShowReportModal(false);
  };

  return (
    <div className="rating-reply flex gap-2 mt-3 pl-2 border-l-2 border-line-soft">
      <div className="anon-avatar small grid w-7 h-7 flex-none place-items-center border border-line rounded-md bg-surface-soft text-text-3">
        <Icon name="person" style={{ fontSize: '14px' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-xs">{displayName}</strong>
          {parentName && (
            <span className="text-text-3 text-xs">回复 {parentName}</span>
          )}
          <TimeAgo timeString={reply.createdAt} className="text-text-3 text-[11px]" />
          {onReport && (
            <button
              type="button"
              className="grid w-6 h-6 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors"
              onClick={() => setShowReportModal(true)}
              aria-label="举报回复"
            >
              <Icon name="report_problem" style={{ fontSize: '12px' }} />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-text">{reply.content}</p>
        {onReply && (
          <button
            type="button"
            className="mt-1 text-xs text-text-3 hover:text-blue font-semibold"
            onClick={() => onReply(reply.id, displayName)}
          >
            回复
          </button>
        )}
      </div>

      {showReportModal && onReport && (
        <ReportModal
          targetId={reply.id}
          targetType="rating_reply"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
}

export default function RatingCommentCard({
  comment,
  topicId,
  onLike,
  onReply,
  onReport,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const displayName = getDisplayName(comment.ownerUserId, topicId);

  const handleReplyClick = (replyId = null, replyName = null) => {
    setReplyTo(replyId ? { id: replyId, name: replyName } : null);
    setShowReplyInput(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim(), replyTo?.id || null);
      setReplyText('');
      setShowReplyInput(false);
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = (targetId, reason) => {
    onReport?.(targetId, reason, 'rating_comment');
    setShowReportModal(false);
  };

  return (
    <article className="rating-comment-card rounded-xl border border-line bg-surface p-4 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex gap-3">
        <div className="anon-avatar grid w-10 h-10 flex-none place-items-center border border-line rounded-lg bg-surface-soft text-text-3">
          <Icon name="person" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-sm">{displayName}</strong>
                {comment.stars && <StarRatingDisplay stars={comment.stars} size="sm" />}
              </div>
              <TimeAgo timeString={comment.createdAt} className="block mt-0.5 text-text-3 text-xs" />
            </div>
            {onReport && (
              <button
                type="button"
                className="grid w-7 h-7 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors shrink-0"
                onClick={() => setShowReportModal(true)}
                aria-label="举报评论"
              >
                <Icon name="report_problem" style={{ fontSize: '16px' }} />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text">{comment.content}</p>
          <div className="flex items-center gap-4 mt-3">
            <button
              type="button"
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${comment.isLiked ? 'text-blue' : 'text-text-3 hover:text-blue'}`}
              onClick={() => onLike(comment.id)}
            >
              <Icon name="thumb_up" filled={comment.isLiked} style={{ fontSize: '16px' }} />
              <span>点亮 {comment.likes > 0 ? comment.likes : ''}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-text-3 hover:text-blue transition-colors"
              onClick={() => handleReplyClick()}
            >
              <Icon name="chat_bubble" style={{ fontSize: '16px' }} />
              <span>回复</span>
            </button>
          </div>

          {(comment.replies || []).map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              topicId={topicId}
              onReply={(id, name) => handleReplyClick(id, name)}
              onReport={onReport}
            />
          ))}

          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-blue"
                placeholder={replyTo ? `回复 ${replyTo.name}...` : '写下回复...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
              />
              <button
                type="button"
                className="px-3 py-2 text-xs font-bold text-white bg-blue rounded-lg hover:bg-blue-2 disabled:opacity-50"
                disabled={!replyText.trim() || submitting}
                onClick={handleSubmitReply}
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>

      {showReportModal && onReport && (
        <ReportModal
          targetId={comment.id}
          targetType="rating_comment"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </article>
  );
}
