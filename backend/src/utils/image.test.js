import test from 'node:test';
import assert from 'node:assert/strict';
import AppError from './AppError.js';
import { normalizeInlineImage, normalizeInlineImages } from './image.js';

const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0pR9sAAAAASUVORK5CYII=';
const tinySvg = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';

test('normalizeInlineImage accepts supported image data urls', () => {
  assert.equal(normalizeInlineImage(tinyPng), tinyPng);
});

test('normalizeInlineImage rejects unsupported svg images', () => {
  assert.throws(
    () => normalizeInlineImage(tinySvg),
    (error) => error instanceof AppError && error.errorCode === 'INVALID_IMAGE',
  );
});

test('normalizeInlineImages enforces image count limit', () => {
  assert.throws(
    () => normalizeInlineImages(new Array(10).fill(tinyPng)),
    (error) => error instanceof AppError && error.errorCode === 'IMAGE_LIMIT_EXCEEDED',
  );
});
