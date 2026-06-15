import test from 'node:test';
import assert from 'node:assert/strict';
import AppError from './AppError.js';
import { normalizeEmail, normalizePlainText, requireEnum } from './text.js';

test('normalizeEmail trims and lowercases email', () => {
  assert.equal(normalizeEmail('  Foo@NJU.edu.cn '), 'foo@nju.edu.cn');
});

test('normalizePlainText preserves newlines and collapses spaces', () => {
  assert.equal(
    normalizePlainText('  hello   world \n  line2\t\tline3  '),
    'hello world\nline2 line3',
  );
});

test('normalizePlainText rejects overly long content', () => {
  assert.throws(
    () => normalizePlainText('abcdef', { maxLength: 3 }),
    (error) => error instanceof AppError && error.errorCode === 'TEXT_TOO_LONG',
  );
});

test('requireEnum falls back or throws for invalid values', () => {
  assert.equal(requireEnum('hot', ['latest', 'hot'], { fallback: 'latest' }), 'hot');
  assert.equal(requireEnum('weird', ['latest', 'hot'], { fallback: 'latest' }), 'latest');
  assert.throws(
    () => requireEnum('weird', ['latest', 'hot']),
    (error) => error instanceof AppError && error.errorCode === 'INVALID_ENUM',
  );
});
