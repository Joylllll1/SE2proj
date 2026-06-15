import { Router } from 'express';
import * as passwordController from '../controllers/passwordController.js';
import { authLimiter } from '../middlewares/securityPresets.js';

const router = Router();

router.post('/forgot', authLimiter, passwordController.forgot);
router.post('/reset', authLimiter, passwordController.reset);

export default router;
