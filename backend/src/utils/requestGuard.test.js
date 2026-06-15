import test from 'node:test';
import assert from 'node:assert/strict';
import { createInMemoryCooldownTracker, createInMemoryRateLimiter } from './requestGuard.js';

test('rate limiter blocks after max hits and resets after reset()', () => {
  const limiter = createInMemoryRateLimiter({
    windowMs: 60_000,
    maxHits: 2,
    blockMs: 60_000,
  });

  assert.equal(limiter.consume('ip-1').allowed, true);
  assert.equal(limiter.consume('ip-1').allowed, true);

  const blocked = limiter.consume('ip-1');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);

  limiter.reset('ip-1');
  assert.equal(limiter.consume('ip-1').allowed, true);
});

test('rate limiter get() reports blocked state without consuming a hit', () => {
  const limiter = createInMemoryRateLimiter({
    windowMs: 60_000,
    maxHits: 1,
    blockMs: 60_000,
  });

  assert.equal(limiter.get('ip-2').blocked, false);
  assert.equal(limiter.consume('ip-2').allowed, true);
  assert.equal(limiter.get('ip-2').blocked, false);
  assert.equal(limiter.consume('ip-2').allowed, false);
  assert.equal(limiter.get('ip-2').blocked, true);
});

test('cooldown tracker rejects repeated requests during cooldown', () => {
  const tracker = createInMemoryCooldownTracker({
    cooldownMs: 60_000,
  });

  assert.equal(tracker.consume('mail-1').allowed, true);
  const blocked = tracker.consume('mail-1');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);

  tracker.reset('mail-1');
  assert.equal(tracker.consume('mail-1').allowed, true);
});
