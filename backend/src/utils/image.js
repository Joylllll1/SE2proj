import AppError from './AppError.js';

export const MAX_INLINE_IMAGE_BYTES = 3 * 1024 * 1024;

export function normalizeInlineImage(image, label = '图片') {
  if (image === undefined || image === null) {
    return '';
  }

  if (typeof image !== 'string') {
    throw new AppError(`${label}格式无效`, 400, 'INVALID_IMAGE');
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return '';
  }

  if (Buffer.byteLength(trimmed, 'utf8') > MAX_INLINE_IMAGE_BYTES) {
    throw new AppError(`${label}过大，请上传 3MB 以内图片`, 400, 'IMAGE_TOO_LARGE');
  }

  return trimmed;
}
