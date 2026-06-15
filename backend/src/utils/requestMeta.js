export function getClientIp(req) {
  const trustProxy = process.env.TRUST_PROXY === 'true';
  const forwarded = trustProxy ? req.headers['x-forwarded-for'] : null;
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = typeof raw === 'string' ? raw.split(',')[0]?.trim() : '';
  return first || req.ip || req.socket?.remoteAddress || 'unknown';
}

export function parsePositiveInt(value, fallback, {
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
} = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}
