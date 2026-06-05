import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import StarRatingInput, { StarRatingDisplay } from '../features/StarRatingInput';
import Modal from '../common/Modal';
import RatingDistribution from '../features/RatingDistribution';
import RatingCommentCard from '../features/RatingCommentCard';
import RatingReplyCard from '../features/RatingReplyCard';
import RatingTopicLikeButton from '../features/RatingTopicLikeButton';
import ReportModal from '../features/ReportModal';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';
import { getDisplayName } from '../../utils';
import { flattenRatingComments } from '../../utils/ratingComments';
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

  const flatComments = useMemo(() => flattenRatingComments(comments), [comments]);

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
    setPendingStars(stars);
    setConfirmOpen(true);
  };

  const handleConfirmRating = async () => {
    if (!pendingStars) return;
    try {
      await submitRating(topicId, pendingStars);
      setConfirmOpen(false);
      setPendingStars(0);
      showToast(userRating ? '评分已更新' : '评分成功');
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
          <section className="rating-summary-card rounded-2xl border border-line bg-surface overflow-hidden mb-6">
            <div className="rating-detail-top flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                <div className="rating-detail-thumb grid w-[72px] h-[72px] shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-soft text-red text-2xl font-bold">
                  {topicImages[0] ? (
                    <img src={topicImages[0]} alt={detail.title} className="h-full w-full object-cover" />
                  ) : (
                    avatarLabel
                  )}
                </div>

                <div className="rating-detail-score shrink-0">
                  <span className="rating-score-number block text-4xl font-extrabold leading-none text-red sm:text-[2.75rem]">
                    {stats?.totalCount > 0 ? stats.averageScore.toFixed(1) : '—'}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-text-3">
                    {stats?.totalCount > 0 ? `${stats.totalCount}人评分` : '暂无评分'}
                  </span>
                </div>

                <RatingDistribution
                  distribution={stats?.distribution}
                  accent="red"
                  showPercent={false}
                  className="max-w-[220px]"
                />
              </div>

              <div className="hidden lg:block w-px self-stretch bg-line-soft shrink-0" />

              <div className="rating-input-block flex flex-col items-center justify-center shrink-0 border-t border-line-soft pt-4 lg:min-w-[148px] lg:border-t-0 lg:pt-0">
                <p className="mb-2 text-sm font-bold">你的评分</p>
                <StarRatingInput
                  value={userRating?.stars ?? 0}
                  onChange={handleStarSelect}
                  disabled={submittingRating}
                  accent="red"
                />
                <p className="mt-2 text-center text-[11px] text-text-3">点击星星可修改评分</p>
              </div>
            </div>

            <div className="rating-detail-bottom flex items-end justify-between gap-4 border-t border-line-soft px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h1 className="font-bold text-base text-text">{detail.title}</h1>
                <p className="mt-1 text-xs text-text-3">{subtitle}</p>
                {detail.description && (
                  <p className="mt-2 text-sm leading-relaxed text-text-2">{detail.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="grid w-8 h-8 place-items-center border-0 rounded-full bg-transparent text-text-3 transition-colors hover:bg-black/5 hover:text-text"
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
                {flatComments.map((item) =>
                  item.itemType === 'comment' ? (
                    <RatingCommentCard
                      key={item.id}
                      comment={item}
                      topicId={topicId}
                      onLike={toggleCommentLike}
                      onReply={handleReply}
                      onReport={handleReportComment}
                    />
                  ) : (
                    <RatingReplyCard
                      key={item.id}
                      reply={item}
                      topicId={topicId}
                      onReply={handleReply}
                      onReport={handleReportComment}
                    />
                  ),
                )}
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
          <h2 className="text-xl font-bold mb-2">是否确定评分？</h2>
          <p className="text-text-2 text-sm leading-relaxed mb-4">
            你选择了 <strong className="text-red">{pendingStars} 星</strong>，确认后将{userRating ? '更新' : '提交'}你的评分。
          </p>
          <div className="flex justify-center mb-5">
            <StarRatingDisplay stars={pendingStars} size="lg" accent="red" />
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
              {submittingRating ? '提交中…' : '确定'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
