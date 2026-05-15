import React, { useState, useEffect } from 'react';
import PostCard from '../common/PostCard';
import EmptyState from '../common/EmptyState';
import { fetchLikes } from '../../services/postService';

function LikesPage({ posts: allPosts, likedPosts: allLikedPosts, onOpenPost, onLike, onReport }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [likesData, setLikesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLikes()
      .then((data) => {
        setLikesData(data);
      })
      .catch((e) => {
        console.error('fetchLikes error:', e);
        if (e.status === 401) {
          setError('请先登录');
        } else {
          setError(e.message || '加载失败，请稍后重试');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const likedPostIds = allLikedPosts || [];
  const posts = (allPosts || []).filter((p) => likedPostIds.includes(p.id));
  const comments = likesData?.comments || [];

  return (
    <div className="collection-page max-w-[1180px] mx-auto">
      <section className="collection-hero flex items-center justify-between gap-5 max-sm:grid max-sm:grid-cols-1">
        <div>
          <p className="eyebrow mb-[18px] text-blue text-xs font-bold tracking-widest uppercase">My Likes</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">我的喜爱</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">回顾你在树洞中点赞过的精彩内容。</p>
        </div>
      </section>

      <div className="category-row flex flex-wrap gap-3 my-[22px]">
        <button
          className={`tab-btn px-4 py-[10px] text-sm font-semibold rounded-full border transition-all duration-200 ${
            activeTab === 'posts'
              ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
              : 'bg-white text-text-2 border-line hover:border-blue/40 hover:text-blue'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          帖子
        </button>
        <button
          className={`tab-btn px-4 py-[10px] text-sm font-semibold rounded-full border transition-all duration-200 ${
            activeTab === 'comments'
              ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
              : 'bg-white text-text-2 border-line hover:border-blue/40 hover:text-blue'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          评论
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-text-3">加载中...</div>
      ) : error ? (
        <EmptyState title="加载失败" description={error} />
      ) : activeTab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState title="还没有赞过的帖子" />
        ) : (
          <section className="masonry-grid [column-count:2] [column-gap:18px] max-sm:[column-count:1]">
            {posts.map((post) => (
              <div key={post.id} className="inline-block w-full mb-[18px]">
                <PostCard
                  compact
                  post={post}
                  onOpen={() => onOpenPost(post)}
                  liked
                  onLike={() => onLike(post.id)}
                  onReport={onReport}
                />
              </div>
            ))}
          </section>
        )
      ) : (
        comments.length === 0 ? (
          <EmptyState title="还没有赞过的评论" />
        ) : (
          <section className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.item.id}
                className="comment-card p-4 border border-line rounded-xl bg-white hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onOpenPost({ id: comment.postId, highlightComment: comment.item.id })}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-text-3 font-medium">来自：{comment.postTitle}</span>
                </div>
                <p className="text-sm text-text-2 mb-2">
                  {comment.type === 'reply' ? '↳ ' : '💬 '}
                  {comment.item.content}
                </p>
                <div className="text-xs text-text-3">♥ {comment.item.likes}</div>
              </div>
            ))}
          </section>
        )
      )}
    </div>
  );
}

export default LikesPage;