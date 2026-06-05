import React from 'react';
import ClickableImage from '../common/ClickableImage';

const STACK_OFFSET_X = 28;
const STACK_OFFSET_Y = 10;

export default function RatingTopicImageStack({ images = [], title = '' }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (safeImages.length === 0) return null;

  const stackWidth = Math.min(520, 280 + (safeImages.length - 1) * STACK_OFFSET_X);

  return (
    <div
      className="rating-topic-image-stack relative mx-auto mb-5"
      style={{
        width: `${stackWidth}px`,
        maxWidth: '100%',
        height: `${200 + (safeImages.length - 1) * STACK_OFFSET_Y}px`,
      }}
    >
      {safeImages.map((src, index) => {
        const isTop = index === safeImages.length - 1;
        return (
          <div
            key={`${src.slice(0, 24)}-${index}`}
            className="rating-topic-image-stack-item absolute overflow-hidden rounded-xl border-[3px] border-white shadow-[0_10px_28px_rgba(76,54,61,0.14)] bg-white"
            style={{
              left: index * STACK_OFFSET_X,
              top: index * STACK_OFFSET_Y,
              width: `calc(100% - ${(safeImages.length - 1) * STACK_OFFSET_X}px)`,
              height: 200,
              zIndex: index + 1,
            }}
          >
            {index > 0 && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[42px]"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 42%, rgba(255,255,255,0) 100%)',
                  boxShadow: 'inset 6px 0 12px -6px rgba(255,255,255,0.95)',
                }}
                aria-hidden
              />
            )}
            {index < safeImages.length - 1 && (
              <div
                className="pointer-events-none absolute inset-y-3 right-0 z-10 w-[3px] rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                aria-hidden
              />
            )}
            <ClickableImage
              src={src}
              alt={title ? `${title} 图片 ${index + 1}` : `图片 ${index + 1}`}
              className="h-full w-full object-cover"
              wrapperClassName="block h-full w-full"
              images={safeImages}
              imageIndex={index}
            />
            {isTop && safeImages.length > 1 && (
              <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                {safeImages.length} 张
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
