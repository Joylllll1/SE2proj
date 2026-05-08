import { storageService } from './storageService';

const STORAGE_KEY = 'nju_reports';

const SEED_REPORTS = [
  { id: '#R10283', type: '辱骂/攻击', source: '举报人: 用户1922', time: '3分钟前', risk: 'medium', content: '这学期的期末考也太离谱了吧，出题完全不考虑学生实际复习节奏。' },
  { id: '#R10279', type: '敏感内容', source: '系统自动拦截', time: '12分钟前', risk: 'high', content: '[该内容包含高敏词，已由 AI 初筛隐藏，请管理员人工复核。]' },
  { id: '#R10275', type: '垃圾广告', source: '举报人: 用户0032', time: '45分钟前', risk: 'low', content: '诚招打字员，时间自由，日入过百，加群了解。' },
];

export async function getReports() {
  return storageService.load(STORAGE_KEY, SEED_REPORTS);
}

export async function persistReports(reports) {
  return storageService.save(STORAGE_KEY, reports);
}

export async function createReport(postId, reason, source) {
  const reports = await getReports();
  const newReport = {
    id: '#R' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    type: reason,
    source: source || '举报人: 用户' + (source || '0000'),
    time: '刚刚',
    risk: 'medium',
    postId,
    content: `帖子 ${postId} 被举报，原因：${reason}`,
  };
  const updated = [newReport, ...reports];
  await persistReports(updated);
  return newReport;
}

export async function dismissReport(reportId) {
  const reports = await getReports();
  const updated = reports.filter((r) => r.id !== reportId);
  await persistReports(updated);
}
