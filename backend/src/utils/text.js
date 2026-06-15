import AppError from './AppError.js';

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function normalizePlainText(value, {
  maxLength,
  preserveNewlines = true,
  trim = true,
} = {}) {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string') {
    throw new AppError('文本格式无效', 400, 'INVALID_TEXT');
  }

  let normalized = value.replace(/\r\n?/g, '\n');
  normalized = preserveNewlines
    ? normalized.replace(/[^\S\n]+/g, ' ')
    : normalized.replace(/\s+/g, ' ');
  if (preserveNewlines) {
    normalized = normalized.replace(/ *\n */g, '\n');
  }

  if (trim) {
    normalized = normalized.trim();
  }

  if (Number.isFinite(maxLength) && normalized.length > maxLength) {
    throw new AppError(`内容过长，请控制在 ${maxLength} 字以内`, 400, 'TEXT_TOO_LONG');
  }

  return normalized;
}

export function requireEnum(value, allowedValues, {
  fallback,
  message = '参数无效',
  errorCode = 'INVALID_ENUM',
} = {}) {
  const normalized = typeof value === 'string' ? value.trim() : value;
  if (allowedValues.includes(normalized)) {
    return normalized;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new AppError(message, 400, errorCode);
}

export function ensureNonEmpty(value, {
  message,
  errorCode,
} = {}) {
  if (!value) {
    throw new AppError(message || '内容不能为空', 400, errorCode || 'EMPTY_TEXT');
  }
  return value;
}
