import { createCooldownMiddleware, createRateLimitMiddleware } from './rateLimit.js';
import { getClientIp } from '../utils/requestMeta.js';
import { normalizeEmail } from '../utils/text.js';

function emailFromBody(req) {
  return normalizeEmail(req.body?.email);
}

function userIdFromReq(req) {
  return req.user?.id || req.user?._id?.toString() || 'anonymous';
}

export const authLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  maxHits: 10,
  blockMs: 10 * 60 * 1000,
  keyGenerator: (req) => `${getClientIp(req)}:auth`,
  message: '登录或注册过于频繁，请稍后再试',
  errorCode: 'AUTH_RATE_LIMITED',
});

export const refreshLimiter = createRateLimitMiddleware({
  windowMs: 5 * 60 * 1000,
  maxHits: 30,
  blockMs: 5 * 60 * 1000,
  keyGenerator: (req) => `${getClientIp(req)}:refresh`,
  message: '会话刷新过于频繁，请稍后再试',
  errorCode: 'REFRESH_RATE_LIMITED',
});

export const verifySendIpLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  maxHits: 8,
  blockMs: 15 * 60 * 1000,
  keyGenerator: (req) => `${getClientIp(req)}:verify-send`,
  message: '验证码发送过于频繁，请稍后再试',
  errorCode: 'VERIFY_SEND_RATE_LIMITED',
});

export const verifySendEmailLimiter = createRateLimitMiddleware({
  windowMs: 30 * 60 * 1000,
  maxHits: 3,
  blockMs: 30 * 60 * 1000,
  keyGenerator: (req) => `${emailFromBody(req) || 'unknown'}:${req.body?.type || 'unknown'}:verify-send`,
  message: '该邮箱短时间内发送次数过多，请稍后再试',
  errorCode: 'VERIFY_EMAIL_RATE_LIMITED',
});

export const verifySendCooldown = createCooldownMiddleware({
  cooldownMs: 60 * 1000,
  keyGenerator: (req) => `${emailFromBody(req) || 'unknown'}:${req.body?.type || 'unknown'}:verify-cooldown`,
  message: '验证码刚发送过，请稍后再试',
  errorCode: 'VERIFY_COOLDOWN_ACTIVE',
});

export const verifyCheckLimiter = createRateLimitMiddleware({
  windowMs: 10 * 60 * 1000,
  maxHits: 12,
  blockMs: 15 * 60 * 1000,
  keyGenerator: (req) => `${getClientIp(req)}:${emailFromBody(req) || 'unknown'}:${req.body?.type || 'unknown'}:verify-check`,
  message: '验证码校验过于频繁，请稍后再试',
  errorCode: 'VERIFY_CHECK_RATE_LIMITED',
});

export const contentMutationLimiter = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  maxHits: 12,
  blockMs: 2 * 60 * 1000,
  keyGenerator: (req) => `${userIdFromReq(req)}:content-mutation`,
  message: '操作过于频繁，请稍后再试',
  errorCode: 'CONTENT_RATE_LIMITED',
});

export const aiLimiter = createRateLimitMiddleware({
  windowMs: 5 * 60 * 1000,
  maxHits: 20,
  blockMs: 10 * 60 * 1000,
  keyGenerator: (req) => `${userIdFromReq(req)}:ai`,
  message: 'AI 请求过于频繁，请稍后再试',
  errorCode: 'AI_RATE_LIMITED',
});

export const adminLimiter = createRateLimitMiddleware({
  windowMs: 5 * 60 * 1000,
  maxHits: 120,
  blockMs: 5 * 60 * 1000,
  keyGenerator: (req) => `${userIdFromReq(req)}:admin`,
  message: '管理操作过于频繁，请稍后再试',
  errorCode: 'ADMIN_RATE_LIMITED',
});
