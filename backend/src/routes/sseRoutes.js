import { Router } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import * as sseManager from '../services/sseManager.js';
import { extractAccessToken } from '../utils/authCookies.js';
import { getClientIp } from '../utils/requestMeta.js';

const router = Router();

router.get('/', async (req, res) => {
  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError('未提供认证凭证', 401, 'NO_TOKEN');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token 已过期', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('无效的认证凭证', 401, 'INVALID_TOKEN');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('用户不存在', 401, 'USER_NOT_FOUND');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const userId = user._id.toString();
  const clientIp = getClientIp(req);

  if (!sseManager.canAcceptConnection(userId, clientIp)) {
    throw new AppError('实时连接过多，请关闭多余页面后重试', 429, 'SSE_TOO_MANY_CONNECTIONS');
  }

  const client = sseManager.addClient(userId, clientIp, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseManager.removeClient(userId, client);
  });
});

export default router;
