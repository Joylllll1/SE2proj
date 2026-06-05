import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import StarRatingInput, { StarRatingDisplay } from '../features/StarRatingInput';
import RatingTopicImageStack from '../features/RatingTopicImageStack';
import Modal from '../common/Modal';
import RatingDistribution from '../features/RatingDistribution';
import RatingCommentCard from '../features/RatingCommentCard';
import RatingTopicLikeButton from '../features/RatingTopicLikeButton';
import ReportModal from '../features/ReportModal';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';
import { getDisplayName } from '../../utils';
import * as reportService from '../../services/reportService';
function getTopicIdFromUrl() {
  const match = window.location.pathname.match(/^\/rating\/topics\/([^/]+)/);
  return match ? match[1] : null;
}

export default function RatingDetailPage({ topicId: propTopicId, themeId: propThemeId }) {
  const topicId = propTopicId || getTopicIdFromUrl();
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);

  const detail = useRatingStore((s) => s.detail);
  const detailTheme = useRatingStore((s) => s.detailTheme);
  const stats = useRatingStore((s) => s.stats);
  const userRating = useRatingStore((s) => s.userRating);
  const relatedTags = useRatingStore((s) => s.relatedTags);
  const comments = useRatingStore((s) => s.comments);
  const commentsTotal = useRatingStore((s) => s.commentsTotal);
  const detailLoading = useRatingStore((s) => s.detailLoading);
  const submittingRating = useRatingStore((s) => s.submittingRating);
  const submittingComment = useRatingStore((s) => s.submittingComment);
  const fetchDetail = useRatingStore((s) => s.fetchDetail);
  const submitRating = useRatingStore((s) => s.submitRating);
  const addComment = useRatingStore((s) => s.addComment);
  const toggleCommentLike = useRatingStore((s) => s.toggleCommentLike);
  const addReply = useRatingStore((s) => s.addReply);
  const toggleTopicLike = useRatingStore((s) => s.toggleTopicLike);
  const clearDetail = useRatingStore((s) => s.clearDetail);

  const [commentText, setCommentText] = useState('');
  const [loadError, setLoadError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStars, setPendingStars] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!topicId) return;
    setLoadError('');
    try {
      await fetchDetail(topicId);
    } catch (err) {
      setLoadError(err?.message || '加载评分详情失败');
    }
  }, [topicId, fetchDetail]);

  useEffect(() => {
    loadDetail();
    return () => clearDetail();
  }, [loadDetail, clearDetail]);

  const handleStarSelect = (stars) => {
    if (userRating) return;
    setPendingStars(stars);
    setConfirmOpen(true);
  };

  const handleConfirmRating = async () => {
    if (!pendingStars) return;
    try {
      await submitRating(topicId, pendingStars);
      setConfirmOpen(false);
      setPendingStars(0);
      showToast('评分成功');
    } catch (err) {
      showToast(err?.message || '评分失败');
    }
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setPendingStars(0);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    try {
      await addComment(topicId, commentText.trim());
      setCommentText('');
      showToast('评论已发布');
    } catch (err) {
      showToast(err?.message || '评论失败');
    }
  };

  const handleReply = async (commentId, content, replyToId) => {
    try {
      await addReply(commentId, content, replyToId);
      showToast('回复成功');
    } catch (err) {
      showToast(err?.message || '回复失败');
    }
  };

  const handleToggleLike = async (topicId) => {
    try {
      await toggleTopicLike(topicId);
    } catch (err) {
      showToast(err?.message || '操作失败，请稍后重试');
    }
  };

  const handleReportTopic = async (targetId, reason) => {
    try {
      await reportService.createRatingReport(targetId, reason, 'rating_topic');
      showToast('举报已提交');
      setShowReportModal(false);
    } catch (err) {
      showToast(err.message || '举报失败');
    }
  };

  const handleReportComment = async (targetId, reason, targetType) => {
    try {
      await reportService.createRatingReport(targetId, reason, targetType);
      showToast('举报已提交');
    } catch (err) {
      showToast(err.message || '举报失败');
    }
  };

  if (!topicId) {
    return (
      <EmptyState
        title="未找到评分帖"
        description="请从树洞评分列表选择或创建评分帖"
        actionLabel="返回列表"
        onAction={() => navigate('rating')}
      />
    );
  }

  if (detailLoading && !detail) {
    return <div className="rating-loading grid place-items-center py-20 text-text-3 text-sm">加载中...</div>;
  }

  if (loadError || !detail) {
    return (
      <EmptyState
        title="加载失败"
        description={loadError || '评分帖不存在或已被删除'}
        actionLabel="返回列表"
        onAction={() => navigate('rating')}
      />
    );
  }

  const topicImages = Array.isArray(detail.images) && detail.images.length > 0
    ? detail.images
    : detail.image
      ? [detail.image]
      : [];
  const creatorAnonName = detail.creatorUserId
    ? getDisplayName(detail.creatorUserId, topicId)
    : '匿名用户';
  const avatarLabel = creatorAnonName.charAt(0) || '匿';
  const subtitle = `帖主 ${creatorAnonName} · ${detail.time}`;
  const backThemeId = propThemeId || detail?.themeId || detailTheme?.id;

  const handleBack = () => {
    if (backThemeId) {
      navigate('rating-theme-detail', { themeId: backThemeId });
      return;
    }
    navigate('rating');
  };

  return (
    <div className="rating-detail-page">
      <button
        type="button"
        className="rating-back-btn flex items-center gap-1 mb-4 text-text-2 text-sm font-semibold hover:text-blue transition-colors"
        onClick={handleBack}
      >
        <Icon name="arrow_back" style={{ fontSize: '18px' }} />
        {backThemeId && detailTheme?.name ? `返回「${detailTheme.name}」` : '返回列表'}
      </button>

      <div className="rating-detail-layout flex gap-6 max-lg:flex-col">
        <div className="rating-detail-main flex-1 min-w-0">
          <section className="rating-summary-card rounded-2xl border border-line bg-surface p-5 sm:p-6 mb-6">
            {topicImages.length > 0 && (
              <RatingTopicImageStack images={topicImages} title={detail.title} />
            )}
            <div className="rating-summary-inner flex flex-col sm:flex-row gap-6">
              <div className="rating-subject flex items-center gap-4 sm:w-[220px] shrink-0">
                <div className="rating-subject-avatar grid w-16 h-16 place-items-center rounded-full bg-blue-soft border border-line text-blue text-2xl font-bold overflow-hidden shrink-0">
                  {topicImages[0] ? (
                    <img src={topicImages[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    avatarLabel
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="font-bold text-base line-clamp-2 flex-1">{detail.title}</h1>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="grid w-8 h-8 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors"
                        onClick={() => setShowReportModal(true)}
                        aria-label="举报评分帖"
                      >
                        <Icon name="report_problem" style={{ fontSize: '18px' }} />
                      </button>
                      <RatingTopicLikeButton
                        topicId={topicId}
                        likes={detail.likes}
                        isLiked={detail.isLiked}
                        onToggle={handleToggleLike}
                        size="lg"
                      />
                    </div>
                  </div>
                  <p className="text-text-3 text-xs mt-1">{subtitle}</p>
                </div>
              </div>

              <div className="rating-score-block flex flex-col items-center justify-center shrink-0 sm:px-4">
                <span className="rating-score-number text-5xl font-extrabold text-blue leading-none">
                  {stats?.totalCount > 0 ? stats.averageScore.toFixed(1) : '—'}
                </span>
                <span className="text-text-3 text-xs mt-2 font-medium">
                  {stats?.totalCount > 0 ? `${stats.totalCount} 人评分` : '暂无评分'}
                </span>
              </div>

              <RatingDistribution distribution={stats?.distribution} />

              <div className="rating-input-block flex flex-col items-center justify-center shrink-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-line-soft pt-4 sm:pt-0 sm:pl-6">
                {userRating ? (
                  <>
                    <p className="text-sm font-bold mb-2">你的评分</p>
                    <StarRatingDisplay stars={userRating.stars} size="lg" />
                    <p className="text-text-3 text-[11px] mt-2 text-center">提交后不可修改</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold mb-2">立即评分</p>
                    <StarRatingInput
                      value={0}
                      onChange={handleStarSelect}
                      disabled={submittingRating}
                    />
                    <p className="text-text-3 text-[11px] mt-2 text-center">点击星星并确认提交</p>
                  </>
                )}
              </div>
            </div>
            {detail.description && (
              <p className="mt-4 pt-4 border-t border-line-soft text-sm text-text-2 leading-relaxed">
                {detail.description}
              </p>
            )}
          </section>

          <section className="rating-comments-section">
            <h2 className="text-lg font-bold mb-4">
              评论
              <span className="text-text-3 font-medium ml-1">/ {commentsTotal}</span>
            </h2>

            <div className="rating-comment-input sticky bottom-20 lg:bottom-4 z-10 flex gap-3 p-3 mb-5 rounded-xl border border-line bg-surface shadow-sm">
              <div className="anon-avatar small grid w-9 h-9 flex-none place-items-center border border-line rounded-lg bg-surface-soft text-text-3">
                <Icon name="person" style={{ fontSize: '18px' }} />
              </div>
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-blue"
                placeholder="写下你的想法..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                type="button"
                className="primary-button shrink-0 px-4 py-2 text-sm disabled:opacity-50"
                disabled={!commentText.trim() || submittingComment}
                onClick={handleSubmitComment}
              >
                发布
              </button>
            </div>

            {comments.length === 0 ? (
              <p className="text-text-3 text-sm text-center py-8">还没有评论，来做第一个吧</p>
            ) : (
              <div className="rating-comments-list grid gap-4">
                {comments.map((comment) => (
                  <RatingCommentCard
                    key={comment.id}
                    comment={comment}
                    topicId={topicId}
                    onLike={toggleCommentLike}
                    onReply={handleReply}
                    onReport={handleReportComment}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="rating-sidebar w-full lg:w-[240px] shrink-0">
          <div className="rating-tags-card rounded-xl border border-line bg-surface p-4 sticky top-20">
            <h3 className="text-sm font-bold mb-3">评分相关标签</h3>
            {relatedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {relatedTags.map((tag) => (
                  <span key={tag.label} className="pill blue text-xs px-3 py-1">
                    # {tag.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-3 text-xs">暂无相关标签</p>
            )}
          </div>
        </aside>
      </div>

      {showReportModal && (
        <ReportModal
          targetId={topicId}
          targetType="rating_topic"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportTopic}
        />
      )}

      <Modal isOpen={confirmOpen} onClose={handleCancelConfirm} ariaLabel="确认评分">
        <div className="p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">确认提交评分？</h2>
          <p className="text-text-2 text-sm leading-relaxed mb-4">
            你选择了 <strong className="text-blue">{pendingStars} 星</strong>。
            评分提交后将<strong>无法修改</strong>，请确认后再提交。
          </p>
          <div className="flex justify-center mb-5">
            <StarRatingDisplay stars={pendingStars} size="lg" />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-text-2 rounded-full border border-line hover:bg-surface-soft"
              onClick={handleCancelConfirm}
              disabled={submittingRating}
            >
              取消
            </button>
            <button
              type="button"
              className="primary-button px-5 py-2 text-sm disabled:opacity-50"
              onClick={handleConfirmRating}
              disabled={submittingRating}
            >
              {submittingRating ? '提交中…' : '确认提交'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
