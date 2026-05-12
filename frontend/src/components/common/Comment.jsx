import React, { useState, useRef } from 'react';
import Icon from './Icon';
import ReportModal from '../features/ReportModal';
import { getDisplayName, formatTimeAgo } from '../../utils';
import useCommentStore from '../../store/commentStore';

// ─── Stable store selectors ───
const selectToggleLike = (s) => s.toggleLike;

function Comment({ comment, postId, onReply, onReport }) {
  const toggleLike = useCommentStore(selectToggleLike);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyInputRef = useRef(null);

  const displayName = comment.official ? '官方小助手' : getDisplayName(comment.ownerUserId, postId);

  const handleLike = () => {
    toggleLike(comment.id || comment._id);
  };

  const handleReport = (targetId, reason) => {
    onReport(targetId, reason);
    setShowReportModal(false);
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setTimeout(() => replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleReplySubmit = (content) => {
    onReply(comment.id || comment._id, content);
    setShowReplyInput(false);
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
              <div>
                <strong className="text-sm">{displayName}</strong>
                <span className="block mt-0.5 text-text-3 text-xs">{formatTimeAgo(comment.createdAt)}</span>
              </div>
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
            <button type="button" onClick={handleReplyClick}>回复</button>
            <button type="button" onClick={handleLike} className={`inline-flex items-center gap-1 transition-colors duration-150 ${comment.isLiked ? 'text-red' : 'hover:text-red'}`}>
              <Icon name="thumb_up" /> {comment.likes}
            </button>
          </div>

          {/* 评论下方的回复输入框 */}
          {showReplyInput && (
            <CommentReplyInput
              ref={replyInputRef}
              replyToName={displayName}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyInput(false)}
            />
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

// 评论下方的回复输入框
const CommentReplyInput = React.forwardRef(({ replyToName, onSubmit, onCancel }, ref) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  React.useEffect(() => {
    ref.current?.focus();
  }, [ref]);

  const EMOJI_LIST = ['😊', '😂', '🥺', '😭', '❤️', '👍', '🎉', '🤔', '💪', '✨', '🙏', '😅', '🥰', '😢', '😤', '🤝', '💯', '🔥', '👀', '💕'];

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div ref={ref} className="comment-reply-input mt-3 p-[14px] rounded-md border border-blue bg-blue-soft">
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
      <div className="flex items-center justify-between gap-4 mt-2">
        <button
          type="button"
          className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-white hover:text-blue"
          onClick={() => setShowEmoji(!showEmoji)}
          aria-label="表情"
        >
          <Icon name="sentiment_satisfied" />
        </button>
        {showEmoji && (
          <div className="emoji-picker absolute mt-8 flex flex-wrap gap-1 p-2.5 border border-line rounded-sm bg-white shadow-sm z-10">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                className="emoji-item w-8 h-8 grid place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-lg cursor-pointer transition-colors duration-150 hover:bg-surface-soft"
                onClick={() => {
                  setText((prev) => prev + emoji);
                  setShowEmoji(false);
                }}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <button
          className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          type="button"
          disabled={!text.trim()}
        >
          发送回复
        </button>
      </div>
    </div>
  );
});

CommentReplyInput.displayName = 'CommentReplyInput';

export default Comment;