import Draft from '../models/Draft.js';
import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

const MAX_DRAFTS = 10;

export const createDraft = async (userId, data) => {
  const count = await Draft.countDocuments({ ownerUserId: userId });
  if (count >= MAX_DRAFTS) {
    throw new AppError('草稿数量已达上限，请先删除部分草稿', 400, 'DRAFT_LIMIT_EXCEEDED');
  }
  const draft = await Draft.create({ ownerUserId: userId, ...data });
  return draft.toObject();
};

export const getDrafts = async (userId) => {
  const drafts = await Draft.find({ ownerUserId: userId })
    .sort({ updatedAt: -1 })
    .lean();
  return drafts.map((d) => ({
    ...d,
    id: d._id.toString(),
  }));
};

export const getDraftById = async (draftId, userId) => {
  const draft = await Draft.findOne({ _id: draftId, ownerUserId: userId }).lean();
  if (!draft) throw new AppError('草稿不存在', 404, 'DRAFT_NOT_FOUND');
  return {
    ...draft,
    id: draft._id.toString(),
  };
};

export const updateDraft = async (draftId, userId, data) => {
  const draft = await Draft.findOneAndUpdate(
    { _id: draftId, ownerUserId: userId },
    { ...data, updatedAt: new Date() },
    { new: true },
  ).lean();
  if (!draft) throw new AppError('草稿不存在', 404, 'DRAFT_NOT_FOUND');
  return {
    ...draft,
    id: draft._id.toString(),
  };
};

export const deleteDraft = async (draftId, userId) => {
  const result = await Draft.deleteOne({ _id: draftId, ownerUserId: userId });
  if (result.deletedCount === 0) {
    throw new AppError('草稿不存在', 404, 'DRAFT_NOT_FOUND');
  }
};

export const deleteDrafts = async (draftIds, userId) => {
  await Draft.deleteMany({ _id: { $in: draftIds }, ownerUserId: userId });
};

export const publishDraft = async (draftId, userId) => {
  const draft = await Draft.findOne({ _id: draftId, ownerUserId: userId });
  if (!draft) throw new AppError('草稿不存在', 404, 'DRAFT_NOT_FOUND');

  const post = await Post.create({
    ownerUserId: userId,
    title: draft.title || '无标题',
    content: draft.content || '',
    moodType: draft.moodType,
    mood: draft.mood,
    tags: draft.tags?.length > 0 ? draft.tags : ['树洞'],
    images: draft.image ? [draft.image] : [],
  });

  await Draft.deleteOne({ _id: draftId });

  return {
    ...post.toObject(),
    id: post._id.toString(),
    time: formatRelativeTime(post.createdAt),
    isLiked: false,
  };
};

// ─── Helpers ───

function formatRelativeTime(date) {
  if (!date) return '';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(date).toLocaleDateString('zh-CN');
}
