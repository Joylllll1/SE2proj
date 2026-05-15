import React, { useState, useEffect } from 'react';
import PostCard from '../common/PostCard';
import EmptyState from '../common/EmptyState';
import Icon from '../common/Icon';
import { fetchLikes, toggleCommentLike, toggleReplyLike, toggleLike as toggleLikeApi } from '../../services/postService';

function LikesPage({ posts: allPosts, likedPosts: allLikedPosts, onOpenPost, onReport, onUnlikeConfirm }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [likesData, setLikesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUnlikes, setPendingUnlikes] = useState(new Set());
  const [commentLikes, setCommentLikes] = useState({});

  // 切出帖子 Tab 时批量提交取消点赞
  const submitPendingUnlikes = async () => {
    if (pendingUnlikes.size === 0) return;
    const unlikes = [...pendingUnlikes];
    // 先清空 UI 状态
    setPendingUnlikes(new Set());
    // 然后逐个提交
    for (const postId of unlikes) {
      try {
        await toggleLikeApi(postId);
      } catch (e) {
        console.error('Failed to unlike post:', postId, e);
        // 失败后恢复 UI 状态
        setPendingUnlikes((prev) => new Set([...prev, postId]));
      }
    }
  };

  // 离开页面时提交
  useEffect(() => {
    return () => {
      if (activeTab === 'posts' && pendingUnlikes.size > 0) {
        submitPendingUnlikes();
      }
    };
  }, [activeTab, pendingUnlikes]);

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

  const handleTabChange = async (newTab) => {
    if (activeTab === 'posts' && newTab !== 'posts') {
      await submitPendingUnlikes();
    }
    setActiveTab(newTab);
  };

  const handlePostUnlike = (postId) => {
    setPendingUnlikes((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId); // 再次点击恢复点赞
      } else {
        next.add(postId); // 取消点赞
      }
      return next;
    });
  };

  const handleCommentLike = async (comment) => {
    const commentId = comment.item?.id || comment.itemId;

    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    try {
      if (comment.type === 'reply') {
        await toggleReplyLike(comment.parentCommentId, commentId);
      } else {
        await toggleCommentLike(commentId);
      }
    } catch (e) {
      console.error('toggle comment like error:', e);
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: prev[commentId],
      }));
    }
  };

  const likedPostIds = allLikedPosts || [];
  const posts = (allPosts || []).filter((p) => likedPostIds.includes(p.id)).map((p) => ({
    ...p,
    likes: pendingUnlikes.has(p.id) ? p.likes - 1 : p.likes,
  }));
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
              ? 'bg-blue-soft text-blue border border-blue'
              : 'bg-white text-text-2 border border-line hover:border-[#b0c4de] hover:text-blue'
          }`}
          onClick={() => handleTabChange('posts')}
        >
          帖子
        </button>
        <button
          className={`tab-btn px-4 py-[10px] text-sm font-semibold rounded-full border transition-all duration-200 ${
            activeTab === 'comments'
              ? 'bg-blue-soft text-blue border border-blue'
              : 'bg-white text-text-2 border border-line hover:border-[#b0c4de] hover:text-blue'
          }`}
          onClick={() => handleTabChange('comments')}
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
            {posts.map((post) => {
              const isPendingUnlike = pendingUnlikes.has(post.id);
              return (
                <div key={post.id} className="inline-block w-full mb-[18px]">
                  <PostCard
                    compact
                    post={post}
                    onOpen={() => onOpenPost(post)}
                    liked={!isPendingUnlike}
                    onLike={() => handlePostUnlike(post.id)}
                    onReport={onReport}
                  />
                </div>
              );
            })}
          </section>
        )
      ) : (
        comments.length === 0 ? (
          <EmptyState title="还没有赞过的评论" />
        ) : (
          <section className="space-y-4">
            {comments.map((comment) => {
              const postId = comment.postId;
              const post = postId ? allPosts.find((p) => p.id === postId) : null;
              const commentId = comment.item?.id || comment.itemId;
              const isLiked = commentLikes[commentId] ?? comment.item?.isLiked ?? false;

              return (
                <div
                  key={comment.item?.id || Math.random()}
                  className="comment-card p-4 border border-line rounded-xl bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="text-xs text-text-3 font-medium cursor-pointer hover:text-blue"
                      onClick={() => post && onOpenPost(post)}
                    >
                      来自：{post?.title || comment.postTitle || '无标题'}
                    </span>
                  </div>
                  <p className="text-sm text-text-2 mb-2">
                    {comment.type === 'reply' ? '↳ ' : '💬 '}
                    {comment.item?.content || ''}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-3">
                    <button
                      type="button"
                      onClick={() => handleCommentLike(comment)}
                      className={`inline-flex items-center gap-1 transition-colors duration-150 ${isLiked ? 'text-red' : 'hover:text-red'}`}
                    >
                      <Icon name={isLiked ? 'favorite' : 'favorite_border'} />
                      {comment.item?.likes || 0}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )
      )}
    </div>
  );
}

export default LikesPage;