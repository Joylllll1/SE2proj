import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import auth from '../middlewares/auth.js';
import { authLimiter, refreshLimiter } from '../middlewares/securityPresets.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', authLimiter, auth, authController.changePassword);

export default router;
