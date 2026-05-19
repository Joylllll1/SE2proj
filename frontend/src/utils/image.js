export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      reject(new Error('读取图片失败'));
    };
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('读取图片失败'));
    image.src = source;
  });
}

export async function fileToOptimizedDataUrl(file, options = {}) {
  const {
    maxDimension = 1600,
    quality = 0.82,
  } = options;

  if (!file?.type?.startsWith('image/')) {
    return fileToDataUrl(file);
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(sourceUrl);
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return fileToDataUrl(file);
    }

    ctx.drawImage(image, 0, 0, width, height);
    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return canvas.toDataURL(mimeType, quality);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export const MAX_POST_IMAGES = 9;

export function getImageGridLayout(count) {
  if (count <= 1) {
    return {
      gridClass: 'grid-cols-1',
      itemClass: 'aspect-[4/3]',
    };
  }

  if (count === 2 || count === 4) {
    return {
      gridClass: 'grid-cols-2',
      itemClass: 'aspect-square',
    };
  }

  return {
    gridClass: 'grid-cols-3',
    itemClass: 'aspect-square',
  };
}
