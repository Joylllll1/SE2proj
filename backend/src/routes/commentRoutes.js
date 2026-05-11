import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, commentController.create);
router.get('/:postId', commentController.list);
router.delete('/:commentId', auth, commentController.remove);
router.post('/:commentId/like', auth, commentController.like);
router.post('/:commentId/reply', auth, commentController.reply);
router.delete('/:commentId/reply/:replyId', auth, commentController.removeReply);

export default router;
