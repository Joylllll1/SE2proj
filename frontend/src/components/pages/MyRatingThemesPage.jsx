import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import ConfirmLeaveDialog from '../common/ConfirmLeaveDialog';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';

export default function MyRatingThemesPage() {
  const myThemes = useRatingStore((s) => s.myThemes);
  const myThemesLoading = useRatingStore((s) => s.myThemesLoading);
  const fetchMyThemes = useRatingStore((s) => s.fetchMyThemes);
  const deleteTheme = useRatingStore((s) => s.deleteTheme);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);

  const [loadError, setLoadError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMyThemes = useCallback(async () => {
    setLoadError('');
    try {
      await fetchMyThemes();
    } catch (error) {
      setLoadError(error?.message || '加载我的主题失败，请稍后重试');
    }
  }, [fetchMyThemes]);

  useEffect(() => {
    loadMyThemes();
  }, [loadMyThemes]);

  const openTheme = (themeId) => {
    navigate('rating-theme-detail', { themeId });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTheme(deleteTarget.id);
      setDeleteTarget(null);
      showToast('主题已删除');
    } catch (error) {
      showToast(error?.message || '删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (myThemesLoading && myThemes.length === 0) {
      return (
        <section className="grid place-items-center rounded-xl border border-line bg-surface p-12 text-center text-text-2 text-sm">
          正在加载你的主题...
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
            onClick={loadMyThemes}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-text-2 transition-colors duration-150 hover:text-text hover:border-blue/40"
          >
            重试
          </button>
        </section>
      );
    }

    if (myThemes.length === 0) {
      return (
        <EmptyState
          title="还没有创建过主题"
          description="创建评分主题后，可在主题内添加具体评分帖"
          actionLabel="创建主题"
          onAction={() => navigate('rating-theme-compose')}
        />
      );
    }

    return (
      <section className="grid gap-3 mt-6">
        {myThemes.map((theme) => {
          const preview = theme.previewTopic;
          return (
            <div
              key={theme.id}
              className="rating-mine-item min-w-0 flex items-center gap-4 p-4 rounded-xl border border-line bg-surface shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md hover:border-blue/30"
            >
              {preview?.image ? (
                <button
                  type="button"
                  className="rating-mine-thumb shrink-0 h-16 w-24 overflow-hidden rounded-lg bg-surface-soft"
                  onClick={() => openTheme(theme.id)}
                >
                  <img src={preview.image} alt={preview.title} className="h-full w-full object-cover" />
                </button>
              ) : (
                <button
                  type="button"
                  className="rating-mine-thumb shrink-0 grid h-16 w-24 place-items-center rounded-lg bg-surface-soft text-text-3"
                  onClick={() => openTheme(theme.id)}
                >
                  <Icon name="folder" style={{ fontSize: '24px' }} />
                </button>
              )}

              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => openTheme(theme.id)}
              >
                <div className="font-semibold text-text truncate">{theme.name}</div>
                {preview ? (
                  <p className="mt-1 mb-0 text-text-2 text-xs line-clamp-1">
                    榜首：{preview.title}
                    {preview.totalCount > 0 ? ` · 均分 ${preview.averageScore.toFixed(1)}` : ''}
                  </p>
                ) : (
                  <p className="mt-1 mb-0 text-text-2 text-xs line-clamp-1">
                    {theme.description || '暂无评分帖'}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-text-3">
                  <span>{theme.time}</span>
                  <span>{theme.topicCount} 个评分帖</span>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-blue transition-colors hover:text-blue/80"
                  onClick={() => openTheme(theme.id)}
                >
                  进入
                  <Icon name="chevron_right" style={{ fontSize: '16px' }} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-text-3 transition-all duration-150 hover:border-red/40 hover:bg-red-soft/50 hover:text-red"
                  aria-label={`删除主题 ${theme.name}`}
                  onClick={() => setDeleteTarget(theme)}
                >
                  <Icon name="close" style={{ fontSize: '18px' }} />
                </button>
              </div>
            </div>
          );
        })}
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
          <h1 className="text-2xl font-bold tracking-tight">我的主题</h1>
          <p className="mt-1 text-text-2 text-sm">管理你创建的评分主题，进入主题后可查看或管理评分帖</p>
        </div>
        <button
          type="button"
          className="primary-button flex items-center gap-2 px-5 py-2.5 text-sm shrink-0"
          onClick={() => navigate('rating-theme-compose')}
        >
          <Icon name="add" style={{ fontSize: '18px' }} />
          创建主题
        </button>
      </header>

      {renderContent()}

      <ConfirmLeaveDialog
        open={!!deleteTarget}
        title="删除主题"
        description={deleteTarget ? `确定要删除「${deleteTarget.name}」及其下全部评分帖吗？此操作不可撤销。` : ''}
        confirmText={deleting ? '删除中...' : '确认删除'}
        cancelText="取消"
        mode="discard"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
