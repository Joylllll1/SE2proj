import React, { useState, useRef } from 'react';
import Icon from './Icon';
import PostCard from './PostCard';
import Comment from './Comment';
import { getDisplayName } from '../utils';

function DetailPage({ post, comments, liked, bookmarked, onLike, onBookmark, onComment, onNavigate, onReport }) {
  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState('time');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const commentFileRef = useRef(null);

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'likes') return b.likes - a.likes;
    return 0;
  });

  const handleSubmit = () => {
    if (!commentText.trim() && !commentImage) return;
    let finalContent = commentText.trim();
    if (commentImage) {
      finalContent += '\n[图片]';
    }
    onComment(finalContent);
    setCommentText('');
    setCommentImage('');
    setReplyingTo(null);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCommentText(val);
    // detect @ mention
    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || val[lastAtIndex - 1] === ' ')) {
      const query = val.slice(lastAtIndex + 1);
      if (query.length > 0 && !query.includes(' ')) {
        setMentionQuery(query);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name) => {
    const lastAtIndex = commentText.lastIndexOf('@');
    const before = commentText.slice(0, lastAtIndex);
    setCommentText(before + '@' + name + ' ');
    setShowMentions(false);
  };

  const insertEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handleCommentImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCommentImage(url);
    }
  };

  // build mention suggestions from comment authors in this thread
  const mentionSuggestions = [...new Set(comments.map((c) => getDisplayName(c.userId, post.id)))];

  const EMOJI_LIST = ['😊', '😂', '🥺', '😭', '❤️', '👍', '🎉', '🤔', '💪', '✨', '🙏', '😅', '🥰', '😢', '😤', '🤝', '💯', '🔥', '👀', '💕'];

  return (
    <div className="detail-layout max-w-[1180px] mx-auto">
      <section className="detail-card p-[18px] rounded-lg border border-line-soft bg-surface shadow-sm">
        <div className="breadcrumb mb-[14px] text-text-3 text-[13px] font-semibold">
          <button className="breadcrumb-link px-0 py-0 border-0 bg-transparent text-text-3 text-inherit font-semibold cursor-pointer transition-colors duration-150 hover:text-blue" onClick={() => onNavigate('home')} type="button">动态首页</button>
          <span>/ {post.tags[0]} / 帖子详情</span>
        </div>
        <div className="detail-heading flex items-end justify-between gap-[18px] mb-4 max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="eyebrow mb-[14px] text-blue text-xs font-bold tracking-widest uppercase">Thread Detail</p>
            <h1 className="m-0 text-[clamp(30px,4vw,40px)] tracking-tight">讨论详情</h1>
          </div>
          <div className="detail-summary flex flex-wrap gap-2 p-[10px_12px] rounded-sm border border-line bg-white/80 shadow-xs">
            <span className="text-text-2 text-xs font-bold">匿名连续讨论</span>
            <span className="text-text-2 text-xs font-bold">支持帖主管理评论</span>
          </div>
        </div>
        <PostCard
          post={post}
          onOpen={() => undefined}
          liked={liked}
          bookmarked={bookmarked}
          onLike={onLike}
          onBookmark={onBookmark}
          onReport={onReport}
        />
        <div className="owner-tools flex items-center gap-3 mt-4 p-3 rounded-md bg-surface-tint">
          <Icon name="shield_person" />
          <div className="grid flex-1 gap-0.5">
            <strong className="text-sm font-bold">帖主管理工具</strong>
            <span className="text-text-2 text-[13px]">你可以修改分类、置顶优质评论或删除不当回复。</span>
          </div>
          <button type="button">修改分类</button>
          <button type="button">置顶评论</button>
        </div>
      </section>
      <section className="comments-section mt-7">
        <div className="section-head flex items-end justify-between gap-[18px] max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="eyebrow mb-[18px] text-blue text-xs font-bold tracking-widest uppercase">Discussion</p>
            <h2 className="m-0 text-xl tracking-tight">全部评论 ({comments.length})</h2>
          </div>
          <div className="tabs flex flex-wrap gap-2">
            {[
              ['time', '按时间'],
              ['likes', '按热度'],
            ].map(([key, label]) => (
              <button
                className={`border border-line rounded-full bg-white text-text-2 font-semibold shadow-xs px-[14px] py-2 text-[13px] transition-colors duration-150 hover:border-[#b0c4de] hover:text-blue ${commentSort === key ? 'active text-white border-[#1d1d1f] bg-[#1d1d1f]' : ''}`}
                key={key}
                onClick={() => setCommentSort(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="comment-input p-[14px] rounded-md border border-line-soft bg-surface">
          <textarea
            className="w-full min-h-[86px] border-0 outline-0 bg-transparent text-text resize-y"
            placeholder={replyingTo ? `回复 ${replyingTo}...` : '发布你的神回复，或给楼主一点支持...'}
            value={commentText}
            onChange={handleTextChange}
          />
          {commentImage && (
            <div className="comment-image-preview relative mt-2.5">
              <img src={commentImage} alt="preview" className="max-w-[200px] max-h-[150px] rounded-md object-cover" />
              <button type="button" className="comment-image-remove absolute top-1.5 left-1.5 grid w-6 h-6 place-items-center px-0 py-0 border-0 rounded-full bg-black/60 text-white text-base cursor-pointer" onClick={() => setCommentImage('')}>&times;</button>
            </div>
          )}
          {showMentions && (
            <div className="mention-dropdown flex flex-col gap-0.5 p-1.5 border border-line rounded-sm bg-white shadow-sm mb-2.5 max-h-[200px] overflow-y-auto">
              {mentionSuggestions
                .filter((n) => n.toLowerCase().includes(mentionQuery.toLowerCase()))
                .slice(0, 5)
                .map((name) => (
                  <button key={name} className="mention-item px-3 py-2 border-0 rounded-md bg-transparent text-text text-sm font-bold text-left cursor-pointer transition-colors duration-150 hover:bg-blue-soft hover:text-blue" onClick={() => insertMention(name)} type="button">@{name}</button>
                ))}
            </div>
          )}
          {showEmoji && (
            <div className="emoji-picker flex flex-wrap gap-1 p-2.5 border border-line rounded-sm bg-white shadow-sm mb-2.5">
              {EMOJI_LIST.map((emoji) => (
                <button key={emoji} className="emoji-item w-8 h-8 grid place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-lg cursor-pointer transition-colors duration-150 hover:bg-surface-soft" onClick={() => insertEmoji(emoji)} type="button">{emoji}</button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-line-soft">
            <span className="comment-toolbar flex gap-2">
              <button type="button" className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-surface-soft hover:text-blue" onClick={() => { setShowEmoji(!showEmoji); setShowMentions(false); }} aria-label="表情">
                <Icon name="sentiment_satisfied" />
              </button>
              <button type="button" className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-surface-soft hover:text-blue" onClick={() => commentFileRef.current?.click()} aria-label="图片">
                <Icon name="image" />
              </button>
              <input ref={commentFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCommentImage} />
              <button type="button" className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-surface-soft hover:text-blue" onClick={() => { setCommentText((prev) => prev + '@'); setShowMentions(false); }} aria-label="@提及">
                <Icon name="alternate_email" />
              </button>
            </span>
            <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmit} type="button" disabled={!commentText.trim() && !commentImage}>
              发表评论
            </button>
          </div>
        </div>
        <div className="comment-list grid gap-3.5 mt-4">
          {sortedComments.map((comment) => (
            <Comment key={comment.id} comment={comment} postId={post.id} onReply={() => setReplyingTo(getDisplayName(comment.userId, post.id))} onReport={onReport} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default DetailPage;