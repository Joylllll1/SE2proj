import { Router } from 'express';
import auth from '../middlewares/auth.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import checkBan from '../middlewares/checkBan.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import * as ratingController from '../controllers/ratingController.js';

const router = Router();

router.get('/themes', optionalAuth, ratingController.listThemes);
router.get('/themes/mine', auth, ratingController.listMyThemes);
router.post('/themes', auth, checkBan, ratingController.createTheme);
router.get('/themes/:themeId', optionalAuth, validateObjectId('themeId'), ratingController.getThemeDetail);
router.delete('/themes/:themeId', auth, validateObjectId('themeId'), ratingController.deleteTheme);

router.get('/topics', optionalAuth, ratingController.listTopics);
router.get('/topics/mine', auth, ratingController.listMyTopics);
router.post('/topics', auth, checkBan, ratingController.createTopic);
router.get('/topics/:topicId', optionalAuth, validateObjectId('topicId'), ratingController.getDetail);
router.delete('/topics/:topicId', auth, validateObjectId('topicId'), ratingController.deleteTopic);
router.post('/topics/:topicId/like', auth, validateObjectId('topicId'), ratingController.toggleTopicLike);
router.post('/topics/:topicId', auth, checkBan, validateObjectId('topicId'), ratingController.submitRating);
router.get('/topics/:topicId/comments', optionalAuth, validateObjectId('topicId'), ratingController.getComments);
router.post('/topics/:topicId/comments', auth, checkBan, validateObjectId('topicId'), ratingController.createComment);
router.post('/comments/:commentId/like', auth, validateObjectId('commentId'), ratingController.toggleLike);
router.post('/comments/:commentId/reply', auth, checkBan, validateObjectId('commentId'), ratingController.addReply);
router.post(
  '/comments/:commentId/replies/:replyId/like',
  auth,
  validateObjectId('commentId', 'replyId'),
  ratingController.toggleReplyLike,
);
router.post('/themes/:themeId/report', auth, validateObjectId('themeId'), ratingController.reportTheme);
router.post('/topics/:topicId/report', auth, validateObjectId('topicId'), ratingController.reportTopic);
router.post('/comments/:commentId/report', auth, validateObjectId('commentId'), ratingController.reportComment);

export default router;
