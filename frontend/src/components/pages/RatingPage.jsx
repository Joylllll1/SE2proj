import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import ReportModal from '../features/ReportModal';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';
import { formatCount } from '../../utils';
import * as reportService from '../../services/reportService';

export default function RatingPage() {
  const themes = useRatingStore((s) => s.themes);
  const listLoading = useRatingStore((s) => s.listLoading);
  const fetchThemes = useRatingStore((s) => s.fetchThemes);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const openTheme = (themeId) => {
    navigate('rating-theme-detail', { themeId });
  };

  const handleReport = async (targetId, reason) => {
    try {
      await reportService.createRatingReport(targetId, reason, 'rating_theme');
      showToast('举报已提交');
      setReportTarget(null);
    } catch (err) {
      showToast(err.message || '举报失败');
    }
  };

  return (
    <div className="rating-page collection-page">
      <header className="collection-hero mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">树洞评分</h1>
          <p className="mt-1 text-text-2 text-sm">浏览评分主题，进入主题后创建或查看具体评分帖</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-text-2 transition-all duration-150 hover:border-blue/40 hover:text-text"
            onClick={() => navigate('rating-my-themes')}
          >
            <Icon name="folder" style={{ fontSize: '18px' }} />
            我的主题
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-text-2 transition-all duration-150 hover:border-blue/40 hover:text-text"
            onClick={() => navigate('rating-mine')}
          >
            <Icon name="description" style={{ fontSize: '18px' }} />
            我的评分帖
          </button>
          <button
            type="button"
            className="primary-button flex items-center gap-2 px-5 py-2.5 text-sm shrink-0"
            onClick={() => navigate('rating-theme-compose')}
          >
            <Icon name="add" style={{ fontSize: '18px' }} />
            创建主题
          </button>
        </div>
      </header>

      {listLoading && themes.length === 0 ? (
        <div className="rating-loading grid place-items-center py-20 text-text-3 text-sm">加载中...</div>
      ) : themes.length === 0 ? (
        <EmptyState
          title="还没有评分主题"
          description="先创建一个主题，再在其中添加具体评分帖"
          actionLabel="创建主题"
          onAction={() => navigate('rating-theme-compose')}
        />
      ) : (
        <div className="rating-list grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {themes.map((theme) => {
            const preview = theme.previewTopic;
            return (
              <article
                key={theme.id}
                className="rating-theme-card flex h-full flex-col rounded-xl border border-line bg-surface overflow-hidden transition-all duration-200 hover:border-blue hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-left"
                role="button"
                tabIndex={0}
                onClick={() => openTheme(theme.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openTheme(theme.id);
                }}
              >
                <div className="rating-list-cover aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface-soft">
                  {preview?.image ? (
                    <img src={preview.image} alt={preview.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-text-3">
                      <Icon name="folder" style={{ fontSize: '32px' }} />
                    </div>
                  )}
                </div>

                <div className="rating-list-body flex flex-1 flex-col p-4">
                  <h2 className="font-bold text-base line-clamp-2 min-h-[2.75rem] leading-snug text-text">
                    {theme.name}
                  </h2>

                  {preview ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-text line-clamp-1">{preview.title}</p>
                      <p className="rating-list-desc mt-1 min-h-[2.5rem] text-text-2 text-xs leading-5 line-clamp-2">
                        {preview.description || '\u00A0'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 min-h-[2.5rem] text-text-2 text-xs leading-5">
                      {theme.description || '该主题下还没有评分帖，点击进入后创建第一个吧'}
                    </p>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="grid w-7 h-7 place-items-center border-0 rounded-full bg-transparent text-text-3 hover:bg-black/5 hover:text-text transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportTarget({ id: theme.id, type: 'rating_theme' });
                        }}
                        aria-label="举报主题"
                      >
                        <Icon name="report_problem" style={{ fontSize: '16px' }} />
                      </button>
                      <span className="rating-theme-stat inline-flex h-6 w-[4.5rem] items-center justify-center gap-1 rounded-full bg-red-soft/60 text-[10px] font-bold leading-none text-red">
                        <Icon name="favorite" solid style={{ fontSize: '12px' }} />
                        {formatCount(theme.totalLikes || 0)}
                      </span>
                      <span className="rating-theme-stat inline-flex h-6 w-[4.5rem] items-center justify-center rounded-full bg-blue-soft text-[10px] font-bold leading-none text-blue">
                        {theme.topicCount} 帖
                      </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-blue font-semibold">
                      进入主题
                      <Icon name="chevron_right" style={{ fontSize: '16px' }} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reportTarget && (
        <ReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
}
