import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import ReportModal from '../features/ReportModal';
import RatingTopicCard from '../features/RatingTopicCard';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';
import * as reportService from '../../services/reportService';

function getThemeIdFromUrl() {
  const match = window.location.pathname.match(/^\/rating\/themes\/([^/]+)/);
  const id = match ? match[1] : null;
  return id === 'compose' ? null : id;
}

export default function RatingThemePage({ themeId: propThemeId }) {
  const themeId = propThemeId || getThemeIdFromUrl();
  const themeDetail = useRatingStore((s) => s.themeDetail);
  const themeTopics = useRatingStore((s) => s.themeTopics);
  const themeDetailLoading = useRatingStore((s) => s.themeDetailLoading);
  const fetchThemeDetail = useRatingStore((s) => s.fetchThemeDetail);
  const toggleTopicLike = useRatingStore((s) => s.toggleTopicLike);
  const clearThemeDetail = useRatingStore((s) => s.clearThemeDetail);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);

  const [loadError, setLoadError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const loadTheme = useCallback(async () => {
    if (!themeId) return;
    setLoadError('');
    try {
      await fetchThemeDetail(themeId);
    } catch (err) {
      setLoadError(err?.message || '加载主题失败');
    }
  }, [themeId, fetchThemeDetail]);

  useEffect(() => {
    loadTheme();
    return () => clearThemeDetail();
  }, [loadTheme, clearThemeDetail]);

  const openTopic = (topicId) => {
    navigate('rating-detail', { topicId, themeId });
  };

  const handleToggleLike = async (topicId) => {
    try {
      await toggleTopicLike(topicId);
    } catch (error) {
      showToast(error?.message || '操作失败，请稍后重试');
    }
  };

  const handleReportTheme = async (targetId, reason) => {
    try {
      await reportService.createRatingReport(targetId, reason, 'rating_theme');
      showToast('举报已提交');
      setShowReportModal(false);
    } catch (err) {
      showToast(err.message || '举报失败');
    }
  };

  const handleReportTopic = async (targetId, reason) => {
    try {
      await reportService.createRatingReport(targetId, reason, 'rating_topic');
      showToast('举报已提交');
    } catch (err) {
      showToast(err.message || '举报失败');
    }
  };

  if (!themeId) {
    return (
      <EmptyState
        title="未找到主题"
        description="请从评分列表选择一个主题"
        actionLabel="返回列表"
        onAction={() => navigate('rating')}
      />
    );
  }

  if (themeDetailLoading && !themeDetail) {
    return <div className="rating-loading grid place-items-center py-20 text-text-3 text-sm">加载中...</div>;
  }

  if (loadError || !themeDetail) {
    return (
      <EmptyState
        title="加载失败"
        description={loadError || '主题不存在或已被删除'}
        actionLabel="返回列表"
        onAction={() => navigate('rating')}
      />
    );
  }

  return (
    <div className="rating-theme-page collection-page">
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
          <div className="flex items-start gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{themeDetail.name}</h1>
            <button
              type="button"
              className="grid w-8 h-8 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors shrink-0"
              onClick={() => setShowReportModal(true)}
              aria-label="举报主题"
            >
              <Icon name="report_problem" style={{ fontSize: '18px' }} />
            </button>
          </div>
          {themeDetail.description && (
            <p className="mt-1 text-text-2 text-sm">{themeDetail.description}</p>
          )}
          <p className="mt-1 text-text-3 text-xs">
            共 {themeDetail.topicCount} 个评分帖 · 按评分降序排列，同分按标题排序
          </p>
        </div>
        <button
          type="button"
          className="primary-button flex items-center gap-2 px-5 py-2.5 text-sm shrink-0"
          onClick={() => navigate('rating-compose', { themeId })}
        >
          <Icon name="add" style={{ fontSize: '18px' }} />
          创建评分帖
        </button>
      </header>

      {themeTopics.length === 0 ? (
        <EmptyState
          title="该主题下还没有评分帖"
          description="成为第一个在此主题下创建评分帖的人吧"
          actionLabel="创建评分帖"
          onAction={() => navigate('rating-compose', { themeId })}
        />
      ) : (
        <div className="rating-list grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {themeTopics.map((item) => (
            <RatingTopicCard
              key={item.id}
              item={item}
              onOpen={openTopic}
              onToggleLike={handleToggleLike}
              onReport={handleReportTopic}
            />
          ))}
        </div>
      )}

      {showReportModal && (
        <ReportModal
          targetId={themeId}
          targetType="rating_theme"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportTheme}
        />
      )}
    </div>
  );
}
