import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';
import { notifyLike } from './notificationService.js';

function toPostDto(post, userId) {
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
    images: Array.isArray(post.images) ? post.images : [],
    id: post._id.toString(),
    time: formatRelativeTime(post.createdAt),
    likes: post.likes || 0,
    comments: post.comments || 0,
    saves: post.saves || 0,
    isLiked: userId ? post.likedBy?.some((id) => id.toString() === userId) : false,
    isSaved: userId ? post.savedBy?.some((id) => id.toString() === userId) : false,
  };
}

export const createPost = async (userId, data) => {
  const post = await Post.create({ ownerUserId: userId, ...data });
  return toPostDto(post.toObject(), userId);
};

export const getPosts = async ({ page = 1, limit = 20, query, userId } = {}) => {
  const filter = { isDeleted: false };
  if (query && query.trim()) {
    filter.$text = { $search: query.trim() };
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  const postsWithLikeStatus = posts.map((p) => toPostDto(p, userId));

  return {
    posts: postsWithLikeStatus,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPostById = async (postId, userId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false }).lean();
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');

  return toPostDto(post, userId);
};

export const deletePost = async (userId, postId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');
  if (post.ownerUserId.toString() !== userId) {
    throw new AppError('无权删除此帖子', 403, 'FORBIDDEN');
  }
  post.isDeleted = true;
  await post.save();
};

export const toggleLike = async (userId, postId) => {
  const unlikedPost = await Post.findOneAndUpdate(
    { _id: postId, isDeleted: false, likedBy: userId },
    { $pull: { likedBy: userId }, $inc: { likes: -1 } },
    { new: true }
  ).lean();

  if (unlikedPost) {
    return { liked: false, likes: Math.max(0, unlikedPost.likes || 0) };
  }

  const likedPost = await Post.findOneAndUpdate(
    { _id: postId, isDeleted: false, likedBy: { $ne: userId } },
    { $addToSet: { likedBy: userId }, $inc: { likes: 1 } },
    { new: true }
  ).lean();

  if (likedPost) {
    if (likedPost.ownerUserId.toString() !== userId) {
      notifyLike(likedPost.ownerUserId, likedPost.title, postId).catch(() => {});
    }
    return { liked: true, likes: likedPost.likes || 0 };
  }

  const post = await Post.findOne({ _id: postId, isDeleted: false }).lean();
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');

  return {
    liked: post.likedBy?.some((id) => id.toString() === userId) || false,
    likes: post.likes || 0,
  };
};

export const toggleSave = async (userId, postId) => {
  const unsavedPost = await Post.findOneAndUpdate(
    { _id: postId, isDeleted: false, savedBy: userId },
    { $pull: { savedBy: userId }, $inc: { saves: -1 } },
    { new: true }
  ).lean();

  if (unsavedPost) {
    return { saved: false, saves: Math.max(0, unsavedPost.saves || 0) };
  }

  const savedPost = await Post.findOneAndUpdate(
    { _id: postId, isDeleted: false, savedBy: { $ne: userId } },
    { $addToSet: { savedBy: userId }, $inc: { saves: 1 } },
    { new: true }
  ).lean();

  if (savedPost) {
    return { saved: true, saves: savedPost.saves || 0 };
  }

  const post = await Post.findOne({ _id: postId, isDeleted: false }).lean();
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');

  return {
    saved: post.savedBy?.some((id) => id.toString() === userId) || false,
    saves: post.saves || 0,
  };
};

export const getSavedPosts = async (userId) => {
  const posts = await Post.find({ isDeleted: false, savedBy: userId })
    .sort({ updatedAt: -1 })
    .lean();

  return posts.map((p) => ({
    ...toPostDto(p, userId),
    isSaved: true,
  }));
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
