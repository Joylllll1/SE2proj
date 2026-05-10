import { Router } from 'express';
import * as verifyController from '../controllers/verifyController.js';

const router = Router();

router.post('/send', verifyController.sendCode);
router.post('/check', verifyController.checkCode);

export default router;
