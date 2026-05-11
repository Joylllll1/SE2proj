import { Router } from 'express';
import * as postController from '../controllers/postController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, postController.create);
router.get('/', postController.list);
router.get('/:id', postController.getById);
router.delete('/:id', auth, postController.remove);
router.post('/:id/like', auth, postController.like);

export default router;
