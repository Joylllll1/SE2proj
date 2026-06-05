import { describe, expect, it } from 'vitest';
import { isValidObjectId } from './validateObjectId.js';
import AppError from '../utils/AppError.js';
import validateObjectId from './validateObjectId.js';

describe('isValidObjectId', () => {
  it('accepts valid 24-char hex ids', () => {
    expect(isValidObjectId('6a2236234b3788249a9cffe0')).toBe(true);
  });

  it('rejects invalid ids', () => {
    expect(isValidObjectId('invalid-id')).toBe(false);
    expect(isValidObjectId('123')).toBe(false);
    expect(isValidObjectId('')).toBe(false);
  });
});

describe('validateObjectId middleware', () => {
  it('throws 404 AppError for invalid topicId', () => {
    const middleware = validateObjectId('topicId');
    const req = { params: { topicId: 'not-valid' } };
    const next = () => {};

    expect(() => middleware(req, {}, next)).toThrow(AppError);
    try {
      middleware(req, {}, next);
    } catch (error) {
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
    }
  });

  it('calls next for valid topicId', () => {
    const middleware = validateObjectId('topicId');
    const req = { params: { topicId: '6a2236234b3788249a9cffe0' } };
    let called = false;
    middleware(req, {}, () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});
