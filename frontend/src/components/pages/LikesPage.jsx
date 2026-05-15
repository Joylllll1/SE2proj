import React, { useState, useEffect, useRef } from 'react';
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
  const [pendingCommentUnlikes, setPendingCommentUnlikes] = useState(new Set());
  const pendingUnlikesRef = useRef(pendingUnlikes);
  const pendingCommentUnlikesRef = useRef(pendingCommentUnlikes);

  // 保持 ref 同步
  useEffect(() => {
    pendingUnlikesRef.current = pendingUnlikes;
  }, [pendingUnlikes]);

  useEffect(() => {
    pendingCommentUnlikesRef.current = pendingCommentUnlikes;
  }, [pendingCommentUnlikes]);

  // 提交帖子取消点赞（带重试）
  const submitPendingUnlikes = async (unlikes, retries = 2) => {
    if (!unlikes || unlikes.length === 0) return;
    const toSubmit = [...unlikes];
    // 清空状态
    setPendingUnlikes(new Set());
    for (const postId of toSubmit) {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          await toggleLikeApi(postId);
          if (onUnlikeConfirm) {
            onUnlikeConfirm(postId);
          }
          lastError = null;
          break;
        } catch (e) {
          console.error('Retry unlike post:', postId, i, e);
          lastError = e;
        }
      }
      if (lastError) {
        console.error('Failed to unlike post after retries:', postId, lastError);
      }
    }
  };

  // 提交评论取消点赞（带重试）
  const submitPendingCommentUnlikes = async (unlikes, commentsData, retries = 2) => {
    if (!unlikes || unlikes.length === 0) return;
    console.log('[SubmitCommentUnlikes] Starting with:', unlikes, 'commentsData:', commentsData?.length);
    setPendingCommentUnlikes(new Set());
    for (const commentKey of unlikes) {
      const comment = commentsData?.find((c) => `${c.type}-${c.item?.id}` === commentKey);
      console.log('[SubmitCommentUnlikes] Processing:', commentKey, 'found:', !!comment);
      if (!comment) continue;
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          if (comment.type === 'reply') {
            console.log('[SubmitCommentUnlikes] Calling toggleReplyLike:', comment.parentCommentId, comment.item?.id);
            await toggleReplyLike(comment.parentCommentId, comment.item?.id);
          } else {
            console.log('[SubmitCommentUnlikes] Calling toggleCommentLike:', comment.item?.id);
            await toggleCommentLike(comment.item?.id);
          }
          lastError = null;
          break;
        } catch (e) {
          console.error('Retry unlike comment:', commentKey, i, e);
          lastError = e;
        }
      }
      if (lastError) {
        console.error('Failed to unlike comment after retries:', commentKey, lastError);
      }
    }
  };

  // 刷新/关闭页面时同步提交
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('accessToken');

      // 提交帖子取消点赞
      const postUnlikes = [...pendingUnlikesRef.current];
      if (postUnlikes.length > 0) {
        for (const postId of postUnlikes) {
          fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            keepalive: true
          }).catch(() => {});
        }
      }

      // 提交评论取消点赞
      const commentUnlikes = [...pendingCommentUnlikesRef.current];
      if (commentUnlikes.length > 0 && likesData?.comments) {
        for (const commentKey of commentUnlikes) {
          const comment = likesData.comments.find((c) => `${c.type}-${c.item?.id}` === commentKey);
          if (!comment) continue;
          const url = comment.type === 'reply'
            ? `/api/comments/${comment.parentCommentId}/reply/${comment.item?.id}/like`
            : `/api/comments/${comment.item?.id}/like`;
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            keepalive: true
          }).catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [likesData]);

  // 离开组件时提交（根据当前 Tab）
  useEffect(() => {
    return () => {
      if (activeTab === 'posts' && pendingUnlikesRef.current.size > 0) {
        submitPendingUnlikes([...pendingUnlikesRef.current]);
      }
      if (activeTab === 'comments' && pendingCommentUnlikesRef.current.size > 0 && likesData?.comments) {
        submitPendingCommentUnlikes([...pendingCommentUnlikesRef.current], likesData.comments);
      }
    };
  }, [activeTab, likesData]);

  const handleTabChange = (newTab) => {
    // 切出当前 Tab 时提交
    if (activeTab === 'posts' && pendingUnlikes.size > 0) {
      console.log('[TabChange] Submitting post unlikes:', [...pendingUnlikes]);
      submitPendingUnlikes([...pendingUnlikes]);
    }
    if (activeTab === 'comments' && pendingCommentUnlikes.size > 0 && likesData?.comments) {
      console.log('[TabChange] Submitting comment unlikes:', [...pendingCommentUnlikes]);
      submitPendingCommentUnlikes([...pendingCommentUnlikes], likesData.comments);
    }
    setActiveTab(newTab);
  };

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

  const handlePostUnlike = (postId) => {
    setPendingUnlikes((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleCommentUnlike = (comment) => {
    const commentKey = `${comment.type}-${comment.item?.id}`;
    setPendingCommentUnlikes((prev) => {
      const next = new Set(prev);
      if (next.has(commentKey)) {
        next.delete(commentKey);
      } else {
        next.add(commentKey);
      }
      return next;
    });
  };

  const likedPostIds = allLikedPosts || [];
  const posts = (allPosts || []).filter((p) => likedPostIds.includes(p.id)).map((p) => ({
    ...p,
    likes: pendingUnlikes.has(p.id) ? p.likes - 1 : p.likes,
  }));
  const comments = (likesData?.comments || []).map((c) => {
    const commentKey = `${c.type}-${c.item?.id}`;
    const isPendingUnlike = pendingCommentUnlikes.has(commentKey);
    return {
      ...c,
      item: {
        ...c.item,
        likes: isPendingUnlike ? (c.item?.likes || 1) - 1 : c.item?.likes,
        isLiked: !isPendingUnlike,
      },
    };
  });

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
              const isLiked = comment.item?.isLiked ?? false;

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
                      onClick={() => handleCommentUnlike(comment)}
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