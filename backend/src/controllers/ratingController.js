import * as ratingService from '../services/ratingService.js';
import * as adminService from '../services/adminService.js';
import AppError from '../utils/AppError.js';

async function submitReport(req, res, targetId, targetType) {
  const { reason } = req.body;
  const userId = req.user._id;

  if (!reason || !reason.trim()) {
    throw new AppError('请选择或输入举报原因', 400, 'MISSING_REASON');
  }

  try {
    const report = await adminService.createReport(targetId, targetType, reason, userId);
    res.status(201).json({ message: '举报已提交', report });
  } catch (err) {
    if (err.code === 'ALREADY_REPORTED') {
      throw new AppError(err.message, 400, 'ALREADY_REPORTED');
    }
    throw err;
  }
}

export const listThemes = async (req, res) => {
  const userId = req.user?._id?.toString();
  const { page = 1, limit = 20, query } = req.query;
  const result = await ratingService.listThemes({ page: +page, limit: +limit, query, userId });
  res.json(result);
};

export const listMyThemes = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await ratingService.listMyThemes(req.user._id.toString(), {
    page: +page,
    limit: +limit,
  });
  res.json(result);
};

export const createTheme = async (req, res) => {
  const theme = await ratingService.createTheme(req.user._id.toString(), req.body);
  res.status(201).json(theme);
};

export const getThemeDetail = async (req, res) => {
  const userId = req.user?._id?.toString();
  const result = await ratingService.getThemeDetail(req.params.themeId, userId);
  res.json(result);
};

export const deleteTheme = async (req, res) => {
  await ratingService.deleteTheme(req.user._id.toString(), req.params.themeId);
  res.status(204).send();
};

export const listTopics = async (req, res) => {
  const userId = req.user?._id?.toString();
  const { page = 1, limit = 20, query, themeId } = req.query;
  const result = await ratingService.listTopics({
    page: +page,
    limit: +limit,
    query,
    themeId,
    userId,
  });
  res.json(result);
};

export const listMyTopics = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await ratingService.listMyTopics(req.user._id.toString(), {
    page: +page,
    limit: +limit,
  });
  res.json(result);
};

export const createTopic = async (req, res) => {
  const topic = await ratingService.createTopic(req.user._id.toString(), req.body);
  res.status(201).json(topic);
};

export const getDetail = async (req, res) => {
  const userId = req.user?._id?.toString();
  const result = await ratingService.getTopicDetail(req.params.topicId, userId);
  res.json(result);
};

export const deleteTopic = async (req, res) => {
  await ratingService.deleteTopic(req.user._id.toString(), req.params.topicId);
  res.status(204).send();
};

export const toggleTopicLike = async (req, res) => {
  const result = await ratingService.toggleTopicLike(
    req.user._id.toString(),
    req.params.topicId,
  );
  res.json(result);
};

export const submitRating = async (req, res) => {
  const { stars } = req.body;
  const result = await ratingService.submitRating(
    req.user._id.toString(),
    req.params.topicId,
    stars,
  );
  res.json(result);
};

export const getComments = async (req, res) => {
  const userId = req.user?._id?.toString();
  const result = await ratingService.getRatingComments(req.params.topicId, userId);
  res.json(result);
};

export const createComment = async (req, res) => {
  const { content, stars } = req.body;
  const comment = await ratingService.createRatingComment(
    req.user._id.toString(),
    req.params.topicId,
    content,
    stars,
  );
  res.status(201).json(comment);
};

export const toggleLike = async (req, res) => {
  const result = await ratingService.toggleCommentLike(req.user._id.toString(), req.params.commentId);
  res.json(result);
};

export const addReply = async (req, res) => {
  const { content, replyToId } = req.body;
  const reply = await ratingService.addRatingReply(
    req.user._id.toString(),
    req.params.commentId,
    content,
    replyToId,
  );
  res.status(201).json(reply);
};

export const reportTheme = async (req, res) => {
  await submitReport(req, res, req.params.themeId, 'rating_theme');
};

export const reportTopic = async (req, res) => {
  await submitReport(req, res, req.params.topicId, 'rating_topic');
};

export const reportComment = async (req, res) => {
  const { targetType = 'rating_comment' } = req.body;
  if (targetType !== 'rating_comment' && targetType !== 'rating_reply') {
    throw new AppError('无效的举报类型', 400, 'INVALID_TARGET_TYPE');
  }
  await submitReport(req, res, req.params.commentId, targetType);
};
