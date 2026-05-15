import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

export const createPost = async (userId, data) => {
  const post = await Post.create({ ownerUserId: userId, ...data });
  return {
    ...post.toObject(),
    id: post._id.toString(),
    time: formatRelativeTime(post.createdAt),
    isLiked: false,
  };
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

  const postsWithLikeStatus = posts.map((p) => ({
    ...p,
    id: p._id.toString(),
    time: formatRelativeTime(p.createdAt),
    likes: p.likes || 0,
    saves: p.saves || 0,
    isLiked: userId ? p.likedBy?.some((id) => id.toString() === userId) : false,
    isSaved: userId ? p.savedBy?.some((id) => id.toString() === userId) : false,
  }));

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

  return {
    ...post,
    id: post._id.toString(),
    time: formatRelativeTime(post.createdAt),
    likes: post.likes || 0,
    saves: post.saves || 0,
    isLiked: userId ? post.likedBy?.some((id) => id.toString() === userId) : false,
    isSaved: userId ? post.savedBy?.some((id) => id.toString() === userId) : false,
  };
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
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');

  const idx = post.likedBy.findIndex((id) => id.toString() === userId);
  if (idx > -1) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userId);
    post.likes += 1;
  }
  await post.save();
  return { liked: idx === -1, likes: post.likes };
};

export const toggleSave = async (userId, postId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw new AppError('帖子不存在', 404, 'POST_NOT_FOUND');

  const idx = post.savedBy.findIndex((id) => id.toString() === userId);
  if (idx > -1) {
    post.savedBy.splice(idx, 1);
    post.saves = Math.max(0, post.saves - 1);
  } else {
    post.savedBy.push(userId);
    post.saves += 1;
  }
  await post.save();
  return { saved: idx === -1, saves: post.saves };
};

export const getSavedPosts = async (userId) => {
  const posts = await Post.find({ isDeleted: false, savedBy: userId })
    .sort({ updatedAt: -1 })
    .lean();

  return posts.map((p) => ({
    ...p,
    id: p._id.toString(),
    time: formatRelativeTime(p.createdAt),
    likes: p.likes || 0,
    saves: p.saves || 0,
    isLiked: userId ? p.likedBy?.some((id) => id.toString() === userId) : false,
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
