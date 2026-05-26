import React, { useCallback, useDeferredValue, useEffect, useState } from 'react';
import Icon from '../common/Icon';
import ConfirmLeaveDialog from '../common/ConfirmLeaveDialog';
import EmptyState from '../common/EmptyState';
import usePostStore from '../../store/postStore';
import useAuthStore from '../../store/authStore';
import { hasSearchQuery, matchPostQuery } from '../../utils/search';

function MyPostsPage({ onNavigate }) {
  const myPosts = usePostStore((s) => s.myPosts);
  const fetchMyPosts = usePostStore((s) => s.fetchMyPosts);
  const deletePost = usePostStore((s) => s.deletePost);
  const setSelectedPost = usePostStore((s) => s.setSelectedPost);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      await fetchMyPosts();
    } catch (error) {
      setLoadError(error?.message || '加载我的帖子失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [fetchMyPosts]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  const handleOpenPost = (post) => {
    setSelectedPost(post);
    onNavigate('detail', { selectedPost: post });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Keep dialog open so the user can retry or cancel.
    } finally {
      setDeleting(false);
    }
  };

  const searching = hasSearchQuery(deferredSearchQuery);
  const filteredPosts = myPosts.filter((post) => matchPostQuery(post, deferredSearchQuery));

  if (loading) {
    return (
      <div className="collection-page max-w-[1180px] mx-auto">
        <section className="grid place-items-center rounded-md border border-line bg-surface p-12 text-center text-text-2">
          正在加载你的帖子...
        </section>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="collection-page max-w-[1180px] mx-auto">
        <section className="grid gap-4 place-items-center rounded-md border border-line bg-surface p-12 text-center">
          <div>
            <h3 className="m-0 text-text">加载失败</h3>
            <p className="mt-2 mb-0 text-text-2">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={loadMyPosts}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-text-2 transition-colors duration-150 hover:text-text hover:border-blue/40"
          >
            重试
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="collection-page max-w-[1180px] mx-auto">
      <section className="collection-hero flex items-center justify-between gap-5 max-sm:grid max-sm:grid-cols-1">
        <div>
          <p className="eyebrow mb-[18px] text-blue text-xs font-bold tracking-widest uppercase">My Posts</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">我的帖子</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">管理你发布的所有帖子。</p>
        </div>
      </section>

      {myPosts.length === 0 ? (
        <EmptyState
          title="还没有发布过帖子"
          description="去首页发布你的第一篇帖子吧"
        />
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="search-box flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <Icon name="search" className="text-text-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索我的帖子：标题、正文、标签"
                className="w-full border-0 bg-transparent text-sm text-text outline-none"
              />
              {searching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="flex-shrink-0 text-xs font-semibold text-text-3 transition-colors duration-150 hover:text-text"
                >
                  清空
                </button>
              )}
            </div>
            <div className="mt-3 text-xs text-text-3">
              {searching ? `找到 ${filteredPosts.length} 篇匹配的帖子` : `共 ${myPosts.length} 篇帖子`}
            </div>
          </section>

          {filteredPosts.length === 0 ? (
            <section className="mt-6">
              <EmptyState
                title="没有找到匹配的帖子"
                description="换个关键词试试，比如标题、正文里的词或者标签。"
              />
            </section>
          ) : (
            <section className="grid gap-3 mt-6">
              {filteredPosts.map((post) => {
                const isOwner = currentUserId && post.ownerUserId === currentUserId;
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-line bg-surface backdrop-blur-sm shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenPost(post)}>
                      <div className="font-semibold text-text truncate">{post.title}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-text-3">
                        <span>{post.time}</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="favorite" style={{ fontSize: '14px' }} /> {post.likes || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="chat_bubble" style={{ fontSize: '14px' }} /> {post.comments || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="bookmark" style={{ fontSize: '14px' }} /> {post.saves || 0}
                        </span>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-line rounded-full bg-white text-text-2 text-xs font-semibold transition-all duration-150 hover:border-red/40 hover:text-red hover:bg-red-soft/50"
                        onClick={() => setDeleteTarget(post)}
                        type="button"
                      >
                        <Icon name="delete" style={{ fontSize: '15px' }} />
                        删除
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}

      <ConfirmLeaveDialog
        open={!!deleteTarget}
        title="删除帖子"
        description="确定要删除这篇帖子吗？此操作不可撤销。"
        confirmText={deleting ? '删除中...' : '确认删除'}
        cancelText="取消"
        mode="discard"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default MyPostsPage;
