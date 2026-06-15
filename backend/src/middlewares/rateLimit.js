import AppError from '../utils/AppError.js';
import { getClientIp } from '../utils/requestMeta.js';
import { createInMemoryCooldownTracker, createInMemoryRateLimiter } from '../utils/requestGuard.js';

function setRetryAfter(res, retryAfterMs) {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  res.setHeader('Retry-After', String(seconds));
}

export function createRateLimitMiddleware({
  windowMs,
  maxHits,
  blockMs = 0,
  keyGenerator = (req) => getClientIp(req),
  message = '请求过于频繁，请稍后再试',
  errorCode = 'RATE_LIMITED',
} = {}) {
  const limiter = createInMemoryRateLimiter({ windowMs, maxHits, blockMs });

  return (req, res, next) => {
    const result = limiter.consume(keyGenerator(req));
    if (!result.allowed) {
      setRetryAfter(res, result.retryAfterMs);
      throw new AppError(message, 429, errorCode);
    }
    next();
  };
}

export function createCooldownMiddleware({
  cooldownMs,
  keyGenerator = (req) => getClientIp(req),
  message = '操作过于频繁，请稍后再试',
  errorCode = 'COOLDOWN_ACTIVE',
} = {}) {
  const tracker = createInMemoryCooldownTracker({ cooldownMs });

  return (req, res, next) => {
    const result = tracker.consume(keyGenerator(req));
    if (!result.allowed) {
      setRetryAfter(res, result.retryAfterMs);
      throw new AppError(message, 429, errorCode);
    }
    next();
  };
}
