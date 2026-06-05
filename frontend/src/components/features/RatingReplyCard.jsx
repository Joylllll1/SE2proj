import React, { useState, useRef } from 'react';
import Icon from '../common/Icon';
import ReportModal from './ReportModal';
import TimeAgo from '../common/TimeAgo';
import { getDisplayName } from '../../utils';
import useRatingStore from '../../store/ratingStore';

const selectToggleReplyLike = (s) => s.toggleReplyLike;

export default function RatingReplyCard({ reply, topicId, onReply, onReport }) {
  const toggleReplyLike = useRatingStore(selectToggleReplyLike);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyInputRef = useRef(null);

  const replyName = getDisplayName(reply.ownerUserId, topicId);
  const parentAuthorName = getDisplayName(reply.parentAuthorId, topicId);

  const handleLike = () => {
    toggleReplyLike(reply.parentId, reply.id);
  };

  const handleReport = (targetId, reason) => {
    onReport?.(targetId, reason, 'rating_reply');
    setShowReportModal(false);
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setTimeout(() => replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleReplySubmit = async (content) => {
    await onReply(reply.parentId, content, reply.id);
    setShowReplyInput(false);
  };

  const isLongContent = (reply.parentContent || '').length > 60;
  const displayContent = expanded || !isLongContent
    ? reply.parentContent
    : `${reply.parentContent.slice(0, 60)}...`;

  return (
    <>
      <article className="rating-reply-card flex gap-[12px] max-sm:gap-2 relative">
        <div className="anon-avatar small grid w-[34px] h-[34px] max-sm:w-7 max-sm:h-7 flex-none place-items-center border border-line rounded-[8px] bg-surface-soft text-text-3">
          <Icon name="person" />
        </div>
        <div className="reply-body flex-1 p-4 max-sm:p-3 rounded-md border border-line-soft bg-surface">
          <div className="quoted-content p-2 mb-3 rounded-md bg-[#f5f5f5] border border-[#e0e0e0] text-text-2 text-sm">
            <div>
              <strong className="text-text text-sm">{parentAuthorName}</strong>
              <TimeAgo timeString={reply.parentTime} className="block mt-0.5 text-text-3 text-xs" />
            </div>
            <div className="mt-2">
              <span className={isLongContent && !expanded ? 'line-clamp-2' : ''}>{displayContent}</span>
              {isLongContent && (
                <button
                  type="button"
                  className="text-blue text-xs hover:underline ml-2"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? '[收起]' : '[展开]'}
                </button>
              )}
            </div>
          </div>

          <div className="reply-meta flex items-center justify-between gap-[8px] mb-2">
            <div>
              <strong className="text-sm">{replyName}</strong>
              <TimeAgo timeString={reply.createdAt} className="block mt-0.5 text-text-3 text-xs" />
            </div>
            {onReport && (
              <button
                className="flex-shrink-0 grid w-7 h-7 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors duration-150"
                onClick={() => setShowReportModal(true)}
                type="button"
                aria-label="举报"
              >
                <Icon name="report_problem" style={{ fontSize: '14px' }} />
              </button>
            )}
          </div>

          {reply.content && (
            <p className="my-[9px]">回复 {parentAuthorName}: {reply.content}</p>
          )}

          <div className="reply-actions flex gap-[14px] max-sm:gap-2 text-text-3 text-xs font-semibold">
            <button type="button" onClick={handleReplyClick}>回复</button>
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 transition-colors duration-150 ${reply.isLiked ? 'text-red' : 'hover:text-red'}`}
            >
              <Icon name={reply.isLiked ? 'favorite' : 'favorite_border'} /> {reply.likes || 0}
            </button>
          </div>

          {showReplyInput && (
            <RatingReplyInput
              ref={replyInputRef}
              replyToName={replyName}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyInput(false)}
            />
          )}
        </div>
      </article>

      {showReportModal && onReport && (
        <ReportModal
          targetId={reply.id}
          targetType="rating_reply"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </>
  );
}

const RatingReplyInput = React.forwardRef(({ replyToName, onSubmit, onCancel }, ref) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    ref.current?.focus();
  }, [ref]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={ref} className="reply-input mt-3 p-[14px] max-sm:p-3 rounded-md border border-blue bg-blue-soft">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-blue font-semibold">回复 {replyToName}</span>
        <button type="button" className="text-text-3 hover:text-text" onClick={onCancel}>取消</button>
      </div>
      <textarea
        className="w-full min-h-[60px] border border-line-soft rounded-md p-2 bg-white outline-0 resize-y text-text"
        placeholder={`回复 ${replyToName}...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button
          className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          type="button"
          disabled={!text.trim() || submitting}
        >
          发送回复
        </button>
      </div>
    </div>
  );
});

RatingReplyInput.displayName = 'RatingReplyInput';
