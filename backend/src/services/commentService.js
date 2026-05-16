import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

export const createComment = async (userId, postId, content, official = false) => {
  const comment = await Comment.create({
    postId,
    ownerUserId: userId,
    content,
    official,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

  return {
    ...comment.toObject(),
    id: comment._id.toString(),
    time: formatRelativeTime(comment.createdAt),
  };
};

export const addReply = async (userId, commentId, content, official = false, replyToId = null) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  // 如果 replyToId 存在，验证被回复的回复是否存在
  if (replyToId) {
    const parentReply = comment.replies.id(replyToId);
    if (!parentReply || parentReply.isDeleted) throw new AppError('被回复的回复不存在', 404, 'REPLY_NOT_FOUND');
  }

  const reply = { ownerUserId: userId, content, official, likes: 0, likedBy: [], replyToId };
  comment.replies.push(reply);
  await comment.save();

  await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: 1 } });

  const savedReply = comment.replies[comment.replies.length - 1];
  return {
    id: savedReply._id.toString(),
    ownerUserId: savedReply.ownerUserId.toString(),
    content: savedReply.content,
    official: savedReply.official,
    likes: savedReply.likes || 0,
    likedBy: [],
    replyToId: savedReply.replyToId ? savedReply.replyToId.toString() : null,
    createdAt: savedReply.createdAt,
    time: formatRelativeTime(savedReply.createdAt),
    isLiked: false,
  };
};

export const getComments = async (postId, userId) => {
  const comments = await Comment.find({ postId, isDeleted: false })
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((c) => ({
    ...c,
    id: c._id.toString(),
    time: formatRelativeTime(c.createdAt),
    replies: (c.replies || [])
      .filter((r) => !r.isDeleted)
      .map((r) => ({
        ...r,
        id: r._id.toString(),
        ownerUserId: typeof r.ownerUserId === 'object' ? r.ownerUserId.toString() : r.ownerUserId,
        replyToId: r.replyToId ? (typeof r.replyToId === 'object' ? r.replyToId.toString() : r.replyToId) : null,
        time: formatRelativeTime(r.createdAt),
        isLiked: userId ? r.likedBy?.some((id) => id.toString() === userId) : false,
      })),
    isLiked: userId ? c.likedBy?.some((id) => id.toString() === userId) : false,
  }));
};

export const deleteComment = async (userId, commentId) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');
  if (comment.ownerUserId.toString() !== userId) {
    throw new AppError('无权删除此评论', 403, 'FORBIDDEN');
  }

  comment.isDeleted = true;
  await comment.save();

  const hiddenReplyCount = (comment.replies || []).filter((reply) => !reply.isDeleted).length;
  await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -(1 + hiddenReplyCount) } });
};

export const deleteReply = async (userId, commentId, replyId) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  const reply = comment.replies.id(replyId);
  if (!reply || reply.isDeleted) throw new AppError('回复不存在', 404, 'REPLY_NOT_FOUND');
  if (reply.ownerUserId.toString() !== userId) {
    throw new AppError('无权删除此回复', 403, 'FORBIDDEN');
  }

  reply.isDeleted = true;
  await comment.save();

  await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } });
};

export const toggleLike = async (userId, commentId) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  const isLiked = comment.likedBy.some((id) => id.toString() === userId);

  // 使用原子操作更新，避免版本冲突
  if (isLiked) {
    await Comment.updateOne(
      { _id: commentId },
      { $pull: { likedBy: userId }, $inc: { likes: -1 } }
    );
  } else {
    await Comment.updateOne(
      { _id: commentId },
      { $addToSet: { likedBy: userId }, $inc: { likes: 1 } }
    );
  }

  return { liked: !isLiked, likes: isLiked ? comment.likes - 1 : comment.likes + 1 };
};

export const toggleReplyLike = async (userId, commentId, replyId) => {
  // 先检查评论是否存在
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new AppError('评论不存在', 404, 'COMMENT_NOT_FOUND');

  const reply = comment.replies.id(replyId);
  if (!reply || reply.isDeleted) throw new AppError('回复不存在', 404, 'REPLY_NOT_FOUND');

  const isLiked = reply.likedBy.some((id) => id.toString() === userId);

  // 使用原子操作更新，避免版本冲突
  if (isLiked) {
    await Comment.updateOne(
      { _id: commentId, 'replies._id': replyId },
      {
        $pull: { 'replies.$.likedBy': userId },
        $inc: { 'replies.$.likes': -1 }
      }
    );
  } else {
    await Comment.updateOne(
      { _id: commentId, 'replies._id': replyId },
      {
        $addToSet: { 'replies.$.likedBy': userId },
        $inc: { 'replies.$.likes': 1 }
      }
    );
  }

  return { liked: !isLiked, likes: isLiked ? reply.likes - 1 : reply.likes + 1 };
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
