import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import ConfirmLeaveDialog from '../common/ConfirmLeaveDialog';
import EmptyState from '../common/EmptyState';
import usePostStore from '../../store/postStore';
import useAuthStore from '../../store/authStore';

function MyPostsPage({ onNavigate }) {
  const myPosts = usePostStore((s) => s.myPosts);
  const fetchMyPosts = usePostStore((s) => s.fetchMyPosts);
  const deletePost = usePostStore((s) => s.deletePost);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Silently fail — post remains in list
    } finally {
      setDeleting(false);
    }
  };

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
        <section className="grid gap-3 mt-6">
          {myPosts.map((post) => {
            const isOwner = currentUserId && post.ownerUserId === currentUserId;
            return (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-line bg-surface backdrop-blur-sm shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
              >
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onNavigate('detail', { selectedPost: post })}>
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
