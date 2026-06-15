import { Router } from 'express';
import * as verifyController from '../controllers/verifyController.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import {
  verifyCheckLimiter,
  verifySendCooldown,
  verifySendEmailLimiter,
  verifySendIpLimiter,
} from '../middlewares/securityPresets.js';

const router = Router();

router.post('/send', verifySendIpLimiter, verifySendEmailLimiter, verifySendCooldown, optionalAuth, verifyController.sendCode);
router.post('/check', verifyCheckLimiter, optionalAuth, verifyController.checkCode);

export default router;
