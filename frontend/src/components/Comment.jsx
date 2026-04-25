import React, { useState } from 'react';
import Icon from './Icon';
import ReportModal from './ReportModal';
import { getDisplayName } from '../utils';

function Comment({ comment, postId, onReply, onReport }) {
  const [liked, setLiked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const displayName = comment.official ? '官方小助手' : getDisplayName(comment.userId, postId);

  const handleReport = (targetId, reason) => {
    onReport(targetId, reason);
    setShowReportModal(false);
  };

  return (
    <>
      <article className={`comment ${comment.official ? 'official' : ''} flex gap-[12px] relative`}>
        <div className="anon-avatar small grid w-[34px] h-[34px] flex-none place-items-center border border-line rounded-[8px] bg-surface-soft text-text-3">
          <Icon name={comment.official ? 'verified_user' : 'person'} />
        </div>
        <div className="comment-body flex-1 p-4 rounded-md border border-line-soft bg-surface">
          <div className="comment-meta flex items-center justify-between gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <strong>{displayName}</strong>
              <span className="comment-id text-xs font-semibold text-text-3">#{comment.id}</span>
              {comment.official && <span className="pill blue text-[10px] px-[2px_6px]">官方</span>}
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
          <p className="my-[9px]">{comment.content}</p>
          <div className="comment-actions flex gap-[14px] text-text-3 text-xs font-semibold">
            <span>{comment.time}</span>
            <button type="button" onClick={onReply}>回复</button>
            <button type="button" onClick={() => setLiked(!liked)}>
              <Icon name="thumb_up" /> {liked ? comment.likes + 1 : comment.likes}
            </button>
          </div>
          {comment.replies.length > 0 && (
            <div className="reply-list mt-[14px] pl-[14px] border-l-2 border-line">
              {comment.replies.map((reply) => {
                const replyName = getDisplayName(reply.userId, postId);
                return (
                  <div className="reply mb-3 last:mb-0" key={reply.id}>
                    <strong>{replyName} <span className="comment-id text-xs font-semibold text-text-3">#{reply.id}</span></strong>
                    <p className="my-[6px]">{reply.content}</p>
                    <span className="text-[13px] text-text-2">{reply.time} · {reply.likes} 赞</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {showReportModal && (
        <ReportModal
          targetId={comment.id}
          targetType="comment"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </>
  );
}

export default Comment;
