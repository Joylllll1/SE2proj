import { Router } from 'express';
import auth from '../middlewares/auth.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import checkBan from '../middlewares/checkBan.js';
import * as ratingController from '../controllers/ratingController.js';

const router = Router();

router.get('/themes', optionalAuth, ratingController.listThemes);
router.get('/themes/mine', auth, ratingController.listMyThemes);
router.post('/themes', auth, checkBan, ratingController.createTheme);
router.get('/themes/:themeId', optionalAuth, ratingController.getThemeDetail);
router.delete('/themes/:themeId', auth, ratingController.deleteTheme);

router.get('/topics', optionalAuth, ratingController.listTopics);
router.get('/topics/mine', auth, ratingController.listMyTopics);
router.post('/topics', auth, checkBan, ratingController.createTopic);
router.get('/topics/:topicId', optionalAuth, ratingController.getDetail);
router.delete('/topics/:topicId', auth, ratingController.deleteTopic);
router.post('/topics/:topicId/like', auth, ratingController.toggleTopicLike);
router.post('/topics/:topicId', auth, checkBan, ratingController.submitRating);
router.get('/topics/:topicId/comments', optionalAuth, ratingController.getComments);
router.post('/topics/:topicId/comments', auth, checkBan, ratingController.createComment);
router.post('/comments/:commentId/like', auth, ratingController.toggleLike);
router.post('/comments/:commentId/reply', auth, checkBan, ratingController.addReply);
router.post('/themes/:themeId/report', auth, ratingController.reportTheme);
router.post('/topics/:topicId/report', auth, ratingController.reportTopic);
router.post('/comments/:commentId/report', auth, ratingController.reportComment);

export default router;
