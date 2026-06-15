function pruneStore(store, now = Date.now()) {
  for (const [key, entry] of store.entries()) {
    if (typeof entry === 'number') {
      if (entry <= now) {
        store.delete(key);
      }
      continue;
    }

    const resetAt = entry?.resetAt || 0;
    const blockedUntil = entry?.blockedUntil || 0;
    if (resetAt <= now && blockedUntil <= now) {
      store.delete(key);
    }
  }
}

export function createInMemoryRateLimiter({
  windowMs,
  maxHits,
  blockMs = 0,
} = {}) {
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error('windowMs must be a positive number');
  }
  if (!Number.isFinite(maxHits) || maxHits <= 0) {
    throw new Error('maxHits must be a positive number');
  }

  const store = new Map();

  return {
    get(key) {
      const now = Date.now();
      pruneStore(store, now);

      const normalizedKey = String(key || 'anonymous');
      const current = store.get(normalizedKey);
      if (!current) {
        return {
          blocked: false,
          count: 0,
          retryAfterMs: 0,
        };
      }

      if (current.blockedUntil && current.blockedUntil > now) {
        return {
          blocked: true,
          count: current.count,
          retryAfterMs: current.blockedUntil - now,
        };
      }

      return {
        blocked: false,
        count: current.count,
        retryAfterMs: Math.max(0, current.resetAt - now),
      };
    },
    consume(key) {
      const now = Date.now();
      pruneStore(store, now);

      const normalizedKey = String(key || 'anonymous');
      const current = store.get(normalizedKey);

      if (current?.blockedUntil && current.blockedUntil > now) {
        return {
          allowed: false,
          retryAfterMs: current.blockedUntil - now,
          remaining: 0,
        };
      }

      if (!current || current.resetAt <= now) {
        store.set(normalizedKey, {
          count: 1,
          resetAt: now + windowMs,
          blockedUntil: 0,
        });
        return {
          allowed: true,
          retryAfterMs: windowMs,
          remaining: Math.max(0, maxHits - 1),
        };
      }

      current.count += 1;

      if (current.count > maxHits) {
        current.blockedUntil = now + Math.max(blockMs, current.resetAt - now);
        return {
          allowed: false,
          retryAfterMs: current.blockedUntil - now,
          remaining: 0,
        };
      }

      return {
        allowed: true,
        retryAfterMs: current.resetAt - now,
        remaining: Math.max(0, maxHits - current.count),
      };
    },
    reset(key) {
      store.delete(String(key || 'anonymous'));
    },
  };
}

export function createInMemoryCooldownTracker({
  cooldownMs,
} = {}) {
  if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) {
    throw new Error('cooldownMs must be a positive number');
  }

  const store = new Map();

  return {
    consume(key) {
      const now = Date.now();
      pruneStore(store, now);

      const normalizedKey = String(key || 'anonymous');
      const existingUntil = store.get(normalizedKey) || 0;
      if (existingUntil > now) {
        return {
          allowed: false,
          retryAfterMs: existingUntil - now,
        };
      }

      store.set(normalizedKey, now + cooldownMs);
      return {
        allowed: true,
        retryAfterMs: cooldownMs,
      };
    },
    reset(key) {
      store.delete(String(key || 'anonymous'));
    },
  };
}
