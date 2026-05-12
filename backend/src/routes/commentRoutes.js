import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import auth from '../middlewares/auth.js';
import optionalAuth from '../middlewares/optionalAuth.js';

const router = Router();

router.post('/', auth, commentController.create);
router.get('/:postId', optionalAuth, commentController.list);
router.delete('/:commentId', auth, commentController.remove);
router.post('/:commentId/like', auth, commentController.like);
router.post('/:commentId/reply', auth, commentController.reply);
router.post('/:commentId/reply/:replyId/like', auth, commentController.likeReply);
router.delete('/:commentId/reply/:replyId', auth, commentController.removeReply);

export default router;
