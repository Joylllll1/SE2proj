import AppError from './AppError.js';

export const MAX_INLINE_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_INLINE_IMAGE_COUNT = 9;
export const MAX_INLINE_IMAGES_TOTAL_BYTES = 8 * 1024 * 1024;

const INLINE_IMAGE_DATA_URL_RE = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([a-z0-9+/=\s]+)$/i;

function getDecodedBase64Bytes(base64Payload = '') {
  const normalized = base64Payload.replace(/\s+/g, '');
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

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

  const match = trimmed.match(INLINE_IMAGE_DATA_URL_RE);
  if (!match) {
    throw new AppError(`${label}格式无效`, 400, 'INVALID_IMAGE');
  }

  const decodedBytes = getDecodedBase64Bytes(match[2] || '');
  if (decodedBytes <= 0 || decodedBytes > MAX_INLINE_IMAGE_BYTES) {
    throw new AppError(`${label}过大，请上传 3MB 以内图片`, 400, 'IMAGE_TOO_LARGE');
  }

  return trimmed;
}

export function normalizeInlineImages(images, options = {}) {
  const {
    label = '图片',
    maxCount = MAX_INLINE_IMAGE_COUNT,
    maxTotalBytes = MAX_INLINE_IMAGES_TOTAL_BYTES,
  } = options;

  if (!Array.isArray(images)) {
    throw new AppError(`${label}格式无效`, 400, 'INVALID_IMAGE');
  }

  const normalizedImages = images
    .map((image) => normalizeInlineImage(image, label))
    .filter(Boolean);

  if (normalizedImages.length > maxCount) {
    throw new AppError(`${label}最多上传 ${maxCount} 张`, 400, 'IMAGE_LIMIT_EXCEEDED');
  }

  const totalBytes = normalizedImages.reduce(
    (sum, image) => {
      const match = image.match(INLINE_IMAGE_DATA_URL_RE);
      return sum + getDecodedBase64Bytes(match?.[2] || '');
    },
    0,
  );

  if (totalBytes > maxTotalBytes) {
    throw new AppError(
      `${label}总大小过大，请控制在 ${Math.floor(maxTotalBytes / (1024 * 1024))}MB 以内`,
      400,
      'IMAGE_TOTAL_TOO_LARGE',
    );
  }

  return normalizedImages;
}
