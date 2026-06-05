import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import ConfirmLeaveDialog from '../common/ConfirmLeaveDialog';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';

export default function MyRatingTopicsPage() {
  const myTopics = useRatingStore((s) => s.myTopics);
  const myTopicsLoading = useRatingStore((s) => s.myTopicsLoading);
  const themeDeletedAt = useRatingStore((s) => s.themeDeletedAt);
  const fetchMyTopics = useRatingStore((s) => s.fetchMyTopics);
  const deleteTopic = useRatingStore((s) => s.deleteTopic);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);

  const [loadError, setLoadError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMyTopics = useCallback(async () => {
    setLoadError('');
    try {
      await fetchMyTopics();
    } catch (error) {
      setLoadError(error?.message || '加载我的评分帖失败，请稍后重试');
    }
  }, [fetchMyTopics]);

  useEffect(() => {
    loadMyTopics();
  }, [loadMyTopics, themeDeletedAt]);

  const openTopic = (topic) => {
    navigate('rating-detail', { topicId: topic.id, themeId: topic.themeId });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTopic(deleteTarget.id);
      setDeleteTarget(null);
      showToast('评分帖已删除');
    } catch (error) {
      showToast(error?.message || '删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (myTopicsLoading && myTopics.length === 0) {
      return (
        <section className="grid place-items-center rounded-xl border border-line bg-surface p-12 text-center text-text-2 text-sm">
          正在加载你的评分帖...
        </section>
      );
    }

    if (loadError) {
      return (
        <section className="grid gap-4 place-items-center rounded-xl border border-line bg-surface p-12 text-center">
          <div>
            <h3 className="m-0 text-text">加载失败</h3>
            <p className="mt-2 mb-0 text-text-2">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={loadMyTopics}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-text-2 transition-colors duration-150 hover:text-text hover:border-blue/40"
          >
            重试
          </button>
        </section>
      );
    }

    if (myTopics.length === 0) {
      return (
        <EmptyState
          title="还没有创建过评分帖"
          description="进入某个主题后，可以创建属于你的评分帖"
          actionLabel="浏览主题"
          onAction={() => navigate('rating')}
        />
      );
    }

    return (
      <section className="grid gap-3 mt-6">
        {myTopics.map((topic) => (
          <div
            key={topic.id}
            className="rating-mine-item min-w-0 flex items-center gap-4 p-4 rounded-xl border border-line bg-surface shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md hover:border-blue/30"
          >
            {topic.image ? (
              <button
                type="button"
                className="rating-mine-thumb shrink-0 h-16 w-24 overflow-hidden rounded-lg bg-surface-soft"
                onClick={() => openTopic(topic)}
              >
                <img src={topic.image} alt={topic.title} className="h-full w-full object-cover" />
              </button>
            ) : (
              <button
                type="button"
                className="rating-mine-thumb shrink-0 grid h-16 w-24 place-items-center rounded-lg bg-surface-soft text-text-3"
                onClick={() => openTopic(topic)}
              >
                <Icon name="image" style={{ fontSize: '24px' }} />
              </button>
            )}

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => openTopic(topic)}
            >
              <div className="font-semibold text-text truncate">{topic.title}</div>
              <p className="mt-1 mb-0 text-text-2 text-xs line-clamp-1">
                {topic.description || '暂无描述'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-text-3">
                <span>{topic.time}</span>
                {topic.totalCount > 0 ? (
                  <span>{topic.totalCount} 人评分 · 均分 {topic.averageScore.toFixed(1)}</span>
                ) : (
                  <span>暂无评分</span>
                )}
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-blue transition-colors hover:text-blue/80"
                onClick={() => openTopic(topic)}
              >
                进入
                <Icon name="chevron_right" style={{ fontSize: '16px' }} />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-text-3 transition-all duration-150 hover:border-red/40 hover:bg-red-soft/50 hover:text-red"
                aria-label={`删除评分帖 ${topic.title}`}
                onClick={() => setDeleteTarget(topic)}
              >
                <Icon name="close" style={{ fontSize: '18px' }} />
              </button>
            </div>
          </div>
        ))}
      </section>
    );
  };

  return (
    <div className="rating-mine-page collection-page max-w-[1180px] mx-auto">
      <header className="collection-hero mb-6">
        <div>
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-1 text-text-2 text-sm transition-colors hover:text-blue"
            onClick={() => navigate('rating')}
          >
            <Icon name="arrow_back" style={{ fontSize: '18px' }} />
            返回主题列表
          </button>
          <h1 className="text-2xl font-bold tracking-tight">我的评分帖</h1>
          <p className="mt-1 text-text-2 text-sm">管理你创建的评分帖，可进入详情或删除</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-text-2 transition-all duration-150 hover:border-blue/40 hover:text-text shrink-0"
          onClick={() => navigate('rating')}
        >
          <Icon name="dynamic_feed" style={{ fontSize: '18px' }} />
          浏览主题
        </button>
      </header>

      {renderContent()}

      <ConfirmLeaveDialog
        open={!!deleteTarget}
        title="删除评分帖"
        description={deleteTarget ? `确定要删除「${deleteTarget.title}」吗？此操作不可撤销。` : ''}
        confirmText={deleting ? '删除中...' : '确认删除'}
        cancelText="取消"
        mode="discard"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
