import React, { useState, useRef } from 'react';
import Icon from '../common/Icon';
import PostCard from '../common/PostCard';
import Comment from '../common/Comment';
import ReplyCard from '../common/ReplyCard';
import useCommentStore from '../../store/commentStore';
import { fileToOptimizedDataUrl } from '../../utils/image';

function DetailPage({ post, liked, bookmarked, onLike, onBookmark, onComment, onReply, onNavigate, onReport }) {
  const [commentSort, setCommentSort] = useState('time');
  const getFlatComments = useCommentStore((s) => s.getFlatComments);
  const primaryTag = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : '未分类';

  // 主评论输入框
  const [commentText, setCommentText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [commentImage, setCommentImage] = useState('');
  const commentFileRef = useRef(null);

  // 获取扁平化的评论列表
  const flatComments = getFlatComments(post.id);

  const sortedFlatComments = [...flatComments].sort((a, b) => {
    if (commentSort === 'likes') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const handleCommentSubmit = () => {
    if (!commentText.trim() && !commentImage) return;
    onComment(commentText.trim(), commentImage);
    setCommentText('');
    setCommentImage('');
  };

  const insertEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handleCommentImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileToOptimizedDataUrl(file)
      .then((url) => {
        setCommentImage(url);
      })
      .catch(() => {});

    e.target.value = '';
  };

  const EMOJI_LIST = ['😊', '😂', '🥺', '😭', '❤️', '👍', '🎉', '🤔', '💪', '✨', '🙏', '😅', '🥰', '😢', '😤', '🤝', '💯', '🔥', '👀', '💕'];

  return (
    <div className="detail-layout max-w-[1180px] mx-auto">
      <section className="detail-card p-[18px] rounded-lg border border-line-soft bg-surface shadow-sm">
        <div className="breadcrumb mb-[14px] text-text-3 text-[13px] font-semibold">
          <button className="breadcrumb-link px-0 py-0 border-0 bg-transparent text-text-3 text-inherit font-semibold cursor-pointer transition-colors duration-150 hover:text-blue" onClick={() => onNavigate('home')} type="button">动态首页</button>
          <span>/ {primaryTag} / 帖子详情</span>
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
          <div className="flex-1">
            <strong className="text-sm font-bold">帖主管理工具 (即将上线)</strong>
          </div>
        </div>
      </section>

      <section className="comments-section mt-7">
        <div className="section-head flex items-end justify-between gap-[18px] max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="eyebrow mb-[18px] text-blue text-xs font-bold tracking-widest uppercase">Discussion</p>
            <h2 className="m-0 text-xl tracking-tight">全部评论 ({flatComments.length})</h2>
          </div>
          <div className="tabs flex flex-wrap gap-2">
            {[
              ['time', '按时间'],
              ['likes', '按热度'],
            ].map(([key, label]) => (
              <button
                className={`rounded-full px-[14px] py-2 text-[13px] font-semibold transition-all duration-150 ${
                  commentSort === key
                    ? 'bg-blue-soft text-blue border border-blue'
                    : 'bg-white text-text-2 border border-line hover:border-[#b0c4de] hover:text-blue'
                }`}
                key={key}
                onClick={() => setCommentSort(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 主评论输入框 */}
        <div className="comment-input p-[14px] rounded-md border border-line-soft bg-surface">
          <textarea
            className="w-full min-h-[86px] border-0 outline-0 bg-transparent text-text resize-y"
            placeholder="发布你的神回复，或给楼主一点支持..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          {commentImage && (
            <div className="comment-image-preview relative mt-2.5">
              <img src={commentImage} alt="preview" className="max-w-[200px] max-h-[150px] rounded-md object-cover" />
              <button type="button" className="comment-image-remove absolute top-1.5 left-1.5 grid w-6 h-6 place-items-center px-0 py-0 border-0 rounded-full bg-black/60 text-white text-base cursor-pointer" onClick={() => setCommentImage('')}>&times;</button>
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
              <button type="button" className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-surface-soft hover:text-blue" onClick={() => setShowEmoji(!showEmoji)} aria-label="表情">
                <Icon name="sentiment_satisfied" />
              </button>
              <button type="button" className="toolbar-btn grid w-8 h-8 place-items-center px-0 py-0 border-0 rounded-md bg-transparent text-text-3 cursor-pointer transition-colors duration-150 hover:bg-surface-soft hover:text-blue" onClick={() => commentFileRef.current?.click()} aria-label="图片">
                <Icon name="image" />
              </button>
              <input ref={commentFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCommentImage} />
            </span>
            <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCommentSubmit} type="button" disabled={!commentText.trim() && !commentImage}>
              发表评论
            </button>
          </div>
        </div>

        {/* 扁平化的评论和回复列表 */}
        <div className="comment-list grid gap-3.5 mt-4">
          {sortedFlatComments.map((item) => {
            if (item.itemType === 'reply') {
              return (
                <ReplyCard
                  key={item.id || item._id}
                  reply={item}
                  postId={post.id}
                  onReply={onReply}
                  onReport={onReport}
                />
              );
            }
            return (
              <Comment
                key={item.id || item._id}
                comment={item}
                postId={post.id}
                onReply={onReply}
                onReport={onReport}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default DetailPage;
