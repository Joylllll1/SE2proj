import React, { useState, useRef } from 'react';
import Icon from './Icon';
import ReportModal from '../features/ReportModal';
import TimeAgo from './TimeAgo';
import { getDisplayName } from '../../utils';
import useCommentStore from '../../store/commentStore';

// ─── Stable store selectors ───
const selectToggleReplyLike = (s) => s.toggleReplyLike;

function ReplyCard({ reply, postId, onReply, onReport }) {
  const toggleReplyLike = useCommentStore(selectToggleReplyLike);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyInputRef = useRef(null);

  const replyName = reply.official ? '官方小助手' : getDisplayName(reply.ownerUserId, postId);
  const parentAuthorName = reply.parentOfficial ? '官方小助手' : getDisplayName(reply.parentAuthorId, postId);

  const handleLike = () => {
    const commentId = reply.parentId;
    const replyId = reply.id || reply._id;
    toggleReplyLike(commentId, replyId);
  };

  const handleReport = (targetId, reason) => {
    onReport(targetId, reason, 'reply');
    setShowReportModal(false);
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setTimeout(() => replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleReplySubmit = (content) => {
    const commentId = reply.parentId;
    const replyToId = reply.id || reply._id;
    onReply(commentId, content, replyToId);
    setShowReplyInput(false);
  };

  // 判断内容是否超过2行（简单判断：字符数超过60）
  const isLongContent = (reply.parentContent || '').length > 60;
  const displayContent = expanded || !isLongContent
    ? reply.parentContent
    : reply.parentContent.slice(0, 60) + '...';

  return (
    <>
      <article className="reply-card flex gap-[12px] relative">
        <div className="anon-avatar small grid w-[34px] h-[34px] flex-none place-items-center border border-line rounded-[8px] bg-surface-soft text-text-3">
          <Icon name={reply.official ? 'verified_user' : 'person'} />
        </div>
        <div className="reply-body flex-1 p-4 rounded-md border border-line-soft bg-surface">
          {/* 被回复内容引用 */}
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

          {/* 回复内容 */}
          <div className="reply-meta flex items-center justify-between gap-[8px] mb-2">
            <div className="flex items-center gap-[8px]">
              <div>
                <strong className="text-sm">{replyName}</strong>
                <TimeAgo timeString={reply.createdAt} className="block mt-0.5 text-text-3 text-xs" />
              </div>
              {reply.official && <span className="pill blue text-[10px] px-[2px_6px]">官方</span>}
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
          <p className="my-[9px]">回复 {parentAuthorName}: {reply.content}</p>
          <div className="reply-actions flex gap-[14px] text-text-3 text-xs font-semibold">
            <button type="button" onClick={handleReplyClick}>回复</button>
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 transition-colors duration-150 ${reply.isLiked ? 'text-red' : 'hover:text-red'}`}
            >
              <Icon name={reply.isLiked ? 'favorite' : 'favorite_border'} /> {reply.likes || 0}
            </button>
          </div>

          {/* 回复输入框 - 显示在回复卡片正下方 */}
          {showReplyInput && (
            <ReplyInput
              ref={replyInputRef}
              replyToName={replyName}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyInput(false)}
            />
          )}
        </div>
      </article>

      {showReportModal && (
        <ReportModal
          targetId={reply.id}
          targetType="reply"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </>
  );
}

// 回复输入框组件
const ReplyInput = React.forwardRef(({ replyToName, onSubmit, onCancel }, ref) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState('');
  const fileRef = useRef(null);

  React.useEffect(() => {
    ref.current?.focus();
  }, [ref]);

  const EMOJI_LIST = ['😊', '😂', '🥺', '😭', '❤️', '👍', '🎉', '🤔', '💪', '✨', '🙏', '😅', '🥰', '😢', '😤', '🤝', '💯', '🔥', '👀', '💕'];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && !image) return;
    let content = text.trim();
    if (image) {
      content += '\n[图片]';
    }
    onSubmit(content);
    setText('');
    setImage('');
  };

  return (
    <div ref={ref} className="reply-input mt-3 p-[14px] rounded-md border border-blue bg-blue-soft">
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
      {image && (
        <div className="comment-image-preview relative mt-2.5">
          <img src={image} alt="preview" className="max-w-[200px] max-h-[150px] rounded-md object-cover" />
          <button type="button" className="comment-image-remove absolute top-1.5 left-1.5 grid w-6 h-6 place-items-center px-0 py-0 border-0 rounded-full bg-black/60 text-white text-base cursor-pointer" onClick={() => setImage('')}>&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="flex gap-2">
          <button
            type="button"
            className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-white hover:text-blue"
            onClick={() => setShowEmoji(!showEmoji)}
            aria-label="表情"
          >
            <Icon name="sentiment_satisfied" />
          </button>
          <button
            type="button"
            className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-white hover:text-blue"
            onClick={() => fileRef.current?.click()}
            aria-label="图片"
          >
            <Icon name="image" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </div>
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
          disabled={!text.trim() && !image}
        >
          发送回复
        </button>
      </div>
    </div>
  );
});

ReplyInput.displayName = 'ReplyInput';

export default ReplyCard;