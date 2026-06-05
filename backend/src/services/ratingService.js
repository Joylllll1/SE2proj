import Rating from '../models/Rating.js';
import RatingComment from '../models/RatingComment.js';
import RatingTheme from '../models/RatingTheme.js';
import RatingTopic from '../models/RatingTopic.js';
import AppError from '../utils/AppError.js';
import { generateAnonId } from '../utils/anonymous.js';
import { normalizeInlineImages } from '../utils/image.js';
import { broadcast } from './sseManager.js';

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

function computeStats(ratings) {
  const totalCount = ratings.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalCount === 0) {
    return {
      averageScore: 0,
      totalCount: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 })),
    };
  }

  let sum = 0;
  for (const r of ratings) {
    sum += r.stars;
    distribution[r.stars] = (distribution[r.stars] || 0) + 1;
  }

  const averageScore = Math.round((sum / totalCount) * 2 * 10) / 10;

  return {
    averageScore,
    totalCount,
    distribution: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: distribution[star] || 0,
      percent: Math.round(((distribution[star] || 0) / totalCount) * 10000) / 100,
    })),
  };
}

async function getRatingsForTopic(topicId) {
  return Rating.find({ topicId }).lean();
}

async function getTopicStatsMap(topicIds) {
  if (topicIds.length === 0) return new Map();

  const aggregated = await Rating.aggregate([
    { $match: { topicId: { $in: topicIds } } },
    {
      $group: {
        _id: '$topicId',
        totalCount: { $sum: 1 },
        avgStars: { $avg: '$stars' },
      },
    },
  ]);

  return new Map(
    aggregated.map((item) => [
      item._id.toString(),
      {
        averageScore: Math.round(item.avgStars * 2 * 10) / 10,
        totalCount: item.totalCount,
      },
    ]),
  );
}

function sortTopicsByScore(topics) {
  return [...topics].sort((a, b) => {
    const scoreA = a.averageScore || 0;
    const scoreB = b.averageScore || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.title || '').localeCompare(b.title || '', 'zh-CN');
  });
}

function toTopicDto(topic, stats = { averageScore: 0, totalCount: 0 }, userId = null) {
  const images = Array.isArray(topic.images) ? topic.images : [];
  const tags = Array.isArray(topic.tags) ? topic.tags : [];

  return {
    id: topic._id.toString(),
    themeId: topic.themeId?.toString() || '',
    title: topic.title,
    description: topic.description || '',
    tags,
    images,
    image: images[0] || '',
    creatorUserId: topic.creatorUserId.toString(),
    time: formatRelativeTime(topic.createdAt),
    createdAt: topic.createdAt,
    averageScore: stats.averageScore,
    totalCount: stats.totalCount,
    likes: topic.likes || 0,
    isLiked: userId ? topic.likedBy?.some((id) => id.toString() === userId) : false,
  };
}

function toThemeDto(theme, { previewTopic = null, topicCount = 0, totalLikes = 0 } = {}) {
  return {
    id: theme._id.toString(),
    name: theme.name,
    description: theme.description || '',
    creatorUserId: theme.creatorUserId.toString(),
    time: formatRelativeTime(theme.createdAt),
    createdAt: theme.createdAt,
    topicCount,
    totalLikes,
    previewTopic,
  };
}

async function buildTopicDtosForThemes(themes, userId = null) {
  if (themes.length === 0) return new Map();

  const themeIds = themes.map((theme) => theme._id);
  const topics = await RatingTopic.find({ themeId: { $in: themeIds }, isDeleted: false }).lean();
  const statsMap = await getTopicStatsMap(topics.map((topic) => topic._id));

  const grouped = new Map();
  for (const topic of topics) {
    const themeKey = topic.themeId.toString();
    if (!grouped.has(themeKey)) grouped.set(themeKey, []);
    const stats = statsMap.get(topic._id.toString()) || { averageScore: 0, totalCount: 0 };
    grouped.get(themeKey).push(toTopicDto(topic, stats, userId));
  }

  const result = new Map();
  for (const theme of themes) {
    const themeKey = theme._id.toString();
    const sorted = sortTopicsByScore(grouped.get(themeKey) || []);
    const totalLikes = sorted.reduce((sum, topic) => sum + (topic.likes || 0), 0);
    result.set(themeKey, {
      topicCount: sorted.length,
      totalLikes,
      previewTopic: sorted[0] || null,
      topics: sorted,
    });
  }
  return result;
}

async function findActiveTheme(themeId) {
  const theme = await RatingTheme.findOne({ _id: themeId, isDeleted: false }).lean();
  if (!theme) throw new AppError('评分主题不存在', 404, 'RATING_THEME_NOT_FOUND');
  return theme;
}

async function findActiveTopic(topicId) {
  const topic = await RatingTopic.findOne({ _id: topicId, isDeleted: false }).lean();
  if (!topic) throw new AppError('评分帖不存在', 404, 'RATING_TOPIC_NOT_FOUND');
  return topic;
}

export async function listThemes({ page = 1, limit = 20, query, userId = null } = {}) {
  const filter = { isDeleted: false };
  if (query?.trim()) {
    filter.$text = { $search: query.trim() };
  }

  const skip = (page - 1) * limit;
  const [themes, total] = await Promise.all([
    RatingTheme.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RatingTheme.countDocuments(filter),
  ]);

  const topicMeta = await buildTopicDtosForThemes(themes, userId);
  const items = themes.map((theme) => {
    const meta = topicMeta.get(theme._id.toString()) || { topicCount: 0, previewTopic: null, totalLikes: 0 };
    return toThemeDto(theme, meta);
  });

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function listMyThemes(userId, { page = 1, limit = 20 } = {}) {
  const filter = { isDeleted: false, creatorUserId: userId };

  const skip = (page - 1) * limit;
  const [themes, total] = await Promise.all([
    RatingTheme.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RatingTheme.countDocuments(filter),
  ]);

  const topicMeta = await buildTopicDtosForThemes(themes, userId);
  const items = themes.map((theme) => {
    const meta = topicMeta.get(theme._id.toString()) || { topicCount: 0, previewTopic: null, totalLikes: 0 };
    return toThemeDto(theme, meta);
  });

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function createTheme(userId, data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';

  if (!name) {
    throw new AppError('请填写主题名称', 400, 'RATING_THEME_NAME_REQUIRED');
  }

  const theme = await RatingTheme.create({
    creatorUserId: userId,
    name,
    description,
  });

  return toThemeDto(theme.toObject(), { topicCount: 0, previewTopic: null, totalLikes: 0 });
}

export async function getThemeDetail(themeId, userId) {
  const theme = await findActiveTheme(themeId);
  const topicMeta = await buildTopicDtosForThemes([theme], userId);
  const meta = topicMeta.get(theme._id.toString()) || { topicCount: 0, previewTopic: null, topics: [] };

  return {
    theme: toThemeDto(theme, meta),
    topics: meta.topics || [],
  };
}

export async function deleteTheme(userId, themeId) {
  const theme = await RatingTheme.findOne({ _id: themeId, isDeleted: false });
  if (!theme) throw new AppError('评分主题不存在', 404, 'RATING_THEME_NOT_FOUND');
  if (theme.creatorUserId.toString() !== userId) {
    throw new AppError('无权删除此主题', 403, 'FORBIDDEN');
  }

  theme.isDeleted = true;
  await theme.save();

  await RatingTopic.updateMany({ themeId, isDeleted: false }, { isDeleted: true });

  try {
    broadcast('rating-theme-deleted', { themeId: themeId.toString() });
  } catch {
    // non-critical
  }
}

export async function listTopics({ page = 1, limit = 20, query, themeId, userId = null } = {}) {
  const filter = { isDeleted: false };
  if (themeId) {
    filter.themeId = themeId;
  }
  if (query?.trim()) {
    filter.$text = { $search: query.trim() };
  }

  const skip = (page - 1) * limit;
  const [topics, total] = await Promise.all([
    RatingTopic.find(filter).lean(),
    RatingTopic.countDocuments(filter),
  ]);

  const topicIds = topics.map((t) => t._id);
  const statsMap = await getTopicStatsMap(topicIds);

  const items = sortTopicsByScore(
    topics.map((topic) => {
      const stats = statsMap.get(topic._id.toString()) || { averageScore: 0, totalCount: 0 };
      return toTopicDto(topic, stats, userId);
    }),
  ).slice(skip, skip + limit);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function listMyTopics(userId, { page = 1, limit = 20 } = {}) {
  const filter = { isDeleted: false, creatorUserId: userId };

  const topics = await RatingTopic.find(filter).lean();
  const statsMap = await getTopicStatsMap(topics.map((topic) => topic._id));
  const sorted = sortTopicsByScore(
    topics.map((topic) => {
      const stats = statsMap.get(topic._id.toString()) || { averageScore: 0, totalCount: 0 };
      return toTopicDto(topic, stats, userId);
    }),
  );

  const skip = (page - 1) * limit;
  const items = sorted.slice(skip, skip + limit);

  return {
    items,
    total: sorted.length,
    page,
    totalPages: Math.ceil(sorted.length / limit) || 1,
  };
}

export async function toggleTopicLike(userId, topicId) {
  const unlikedTopic = await RatingTopic.findOneAndUpdate(
    { _id: topicId, isDeleted: false, likedBy: userId },
    { $pull: { likedBy: userId }, $inc: { likes: -1 } },
    { new: true },
  ).lean();

  if (unlikedTopic) {
    return { liked: false, likes: Math.max(0, unlikedTopic.likes || 0), isLiked: false };
  }

  const likedTopic = await RatingTopic.findOneAndUpdate(
    { _id: topicId, isDeleted: false, likedBy: { $ne: userId } },
    { $addToSet: { likedBy: userId }, $inc: { likes: 1 } },
    { new: true },
  ).lean();

  if (likedTopic) {
    return { liked: true, likes: likedTopic.likes || 0, isLiked: true };
  }

  const topic = await RatingTopic.findOne({ _id: topicId, isDeleted: false }).lean();
  if (!topic) throw new AppError('评分帖不存在', 404, 'RATING_TOPIC_NOT_FOUND');

  const isLiked = topic.likedBy?.some((id) => id.toString() === userId) || false;
  return {
    liked: isLiked,
    likes: topic.likes || 0,
    isLiked,
  };
}

export async function createTopic(userId, data) {
  const themeId = data.themeId;
  if (!themeId) {
    throw new AppError('请指定所属主题', 400, 'RATING_THEME_REQUIRED');
  }

  await findActiveTheme(themeId);

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => tag?.trim()).filter(Boolean)
    : [];

  if (!title) {
    throw new AppError('请填写评分帖标题', 400, 'RATING_TOPIC_TITLE_REQUIRED');
  }

  const sourceImages = Array.isArray(data.images)
    ? data.images
    : data.image
      ? [data.image]
      : [];

  const images = normalizeInlineImages(sourceImages, {
    label: '评分帖图片',
    maxCount: 3,
  });

  const topic = await RatingTopic.create({
    themeId,
    creatorUserId: userId,
    title,
    description,
    tags,
    images,
  });

  return toTopicDto(topic.toObject(), { averageScore: 0, totalCount: 0 }, userId);
}

export async function deleteTopic(userId, topicId) {
  const topic = await RatingTopic.findOne({ _id: topicId, isDeleted: false });
  if (!topic) throw new AppError('评分帖不存在', 404, 'RATING_TOPIC_NOT_FOUND');
  if (topic.creatorUserId.toString() !== userId) {
    throw new AppError('无权删除此评分帖', 403, 'FORBIDDEN');
  }

  topic.isDeleted = true;
  await topic.save();

  try {
    broadcast('rating-topic-deleted', { topicId: topicId.toString() });
  } catch {
    // non-critical
  }
}

export async function getTopicDetail(topicId, userId) {
  const topic = await findActiveTopic(topicId);

  const ratings = await getRatingsForTopic(topicId);
  const stats = computeStats(ratings);

  let userRating = null;
  if (userId) {
    const existing = ratings.find((r) => r.userId.toString() === userId);
    if (existing) {
      userRating = { stars: existing.stars, updatedAt: existing.updatedAt };
    }
  }

  const tags = Array.isArray(topic.tags) ? topic.tags : [];
  const theme = topic.themeId
    ? await RatingTheme.findOne({ _id: topic.themeId, isDeleted: false }).lean()
    : null;

  return {
    topic: toTopicDto(topic, stats, userId),
    theme: theme
      ? { id: theme._id.toString(), name: theme.name }
      : null,
    stats,
    userRating,
    relatedTags: tags.map((tag) => ({ label: tag, count: 1 })),
  };
}

export async function submitRating(userId, topicId, stars) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new AppError('评分需在 1-5 星之间', 400, 'INVALID_RATING');
  }

  await findActiveTopic(topicId);

  const existing = await Rating.findOne({ topicId, userId });
  if (existing) {
    throw new AppError('您已提交评分，无法修改', 409, 'RATING_ALREADY_SUBMITTED');
  }

  const anonId = generateAnonId(userId, topicId);
  await Rating.create({ topicId, userId, stars, anonId });

  const ratings = await getRatingsForTopic(topicId);
  const stats = computeStats(ratings);

  try {
    broadcast('rating-updated', { topicId: topicId.toString(), stats });
  } catch {
    // non-critical
  }

  return { stats, userRating: { stars } };
}

function toCommentDto(comment, userId) {
  const id = comment._id.toString();
  const topicId = comment.topicId.toString();

  return {
    id,
    topicId,
    ownerUserId: comment.ownerUserId.toString(),
    stars: comment.stars,
    content: comment.content,
    likes: comment.likes || 0,
    isLiked: userId ? comment.likedBy?.some((uid) => uid.toString() === userId) : false,
    time: formatRelativeTime(comment.createdAt),
    createdAt: comment.createdAt,
    replies: (comment.replies || [])
      .filter((r) => !r.isDeleted)
      .map((reply) => ({
        id: reply._id.toString(),
        ownerUserId: reply.ownerUserId.toString(),
        parentAuthorId: comment.ownerUserId.toString(),
        content: reply.content,
        likes: reply.likes || 0,
        isLiked: userId ? reply.likedBy?.some((uid) => uid.toString() === userId) : false,
        replyToId: reply.replyToId?.toString() || null,
        time: formatRelativeTime(reply.createdAt),
        createdAt: reply.createdAt,
      })),
  };
}

export async function getRatingComments(topicId, userId) {
  await findActiveTopic(topicId);

  const comments = await RatingComment.find({ topicId, isDeleted: false })
    .sort({ likes: -1, createdAt: -1 })
    .lean();

  return {
    comments: comments.map((c) => toCommentDto(c, userId)),
    total: comments.length,
  };
}

export async function createRatingComment(userId, topicId, content, stars = null) {
  const trimmed = typeof content === 'string' ? content.trim() : '';
  if (!trimmed) throw new AppError('请输入评论内容', 400, 'COMMENT_CONTENT_REQUIRED');

  await findActiveTopic(topicId);

  const anonId = generateAnonId(userId, topicId);

  let normalizedStars = null;
  if (stars != null) {
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new AppError('星级需在 1-5 之间', 400, 'INVALID_RATING');
    }
    normalizedStars = stars;
  } else {
    const userRating = await Rating.findOne({ topicId, userId }).lean();
    normalizedStars = userRating?.stars ?? null;
  }

  const comment = await RatingComment.create({
    topicId,
    ownerUserId: userId,
    anonId,
    content: trimmed,
    stars: normalizedStars,
  });

  return toCommentDto(comment.toObject(), userId);
}

export async function toggleCommentLike(userId, commentId) {
  const comment = await RatingComment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  const liked = comment.likedBy.some((id) => id.toString() === userId);
  if (liked) {
    comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId);
    comment.likes = Math.max(0, (comment.likes || 0) - 1);
  } else {
    comment.likedBy.push(userId);
    comment.likes = (comment.likes || 0) + 1;
  }
  await comment.save();

  return { likes: comment.likes, isLiked: !liked };
}

export async function addRatingReply(userId, commentId, content, replyToId = null) {
  const trimmed = typeof content === 'string' ? content.trim() : '';
  if (!trimmed) throw new AppError('请输入回复内容', 400, 'REPLY_CONTENT_REQUIRED');

  const comment = await RatingComment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  const anonId = generateAnonId(userId, comment.topicId.toString());

  const reply = {
    ownerUserId: userId,
    anonId,
    content: trimmed,
    replyToId: replyToId || null,
  };

  comment.replies.push(reply);
  await comment.save();

  const savedReply = comment.replies[comment.replies.length - 1];
  return {
    id: savedReply._id.toString(),
    ownerUserId: userId,
    parentAuthorId: comment.ownerUserId.toString(),
    content: savedReply.content,
    likes: 0,
    isLiked: false,
    replyToId: replyToId?.toString() || null,
    time: formatRelativeTime(savedReply.createdAt),
    createdAt: savedReply.createdAt,
  };
}
