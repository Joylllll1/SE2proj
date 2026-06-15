import { Router } from 'express';
import auth from '../middlewares/auth.js';
import * as bookmarkController from '../controllers/bookmarkController.js';
import { contentMutationLimiter } from '../middlewares/securityPresets.js';

const router = Router();

router.use(auth);

router.get('/', bookmarkController.getBookmarks);
router.post('/migrate', contentMutationLimiter, bookmarkController.migrateBookmarks);
router.post('/folders', contentMutationLimiter, bookmarkController.createFolder);
router.put('/folders/:folderId', contentMutationLimiter, bookmarkController.renameFolder);
router.delete('/folders/:folderId', contentMutationLimiter, bookmarkController.deleteFolder);
router.post('/:postId', contentMutationLimiter, bookmarkController.saveBookmark);
router.delete('/:postId', contentMutationLimiter, bookmarkController.removeBookmark);

export default router;
