import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

function ClickableImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  images = null,
  imageIndex = 0,
  onClick,
}) {
  const [open, setOpen] = useState(false);
  const previewImages = Array.isArray(images) && images.length > 0 ? images : [src];

  const handleOpen = (event) => {
    event.stopPropagation();
    onClick?.(event);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={`group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left ${wrapperClassName}`.trim()}
        onClick={handleOpen}
        aria-label="查看图片"
      >
        <img
          src={src}
          alt={alt}
          className={`${className} transition-transform duration-200 group-hover:scale-[1.02]`.trim()}
        />
      </button>

      {open && (
        <ImageLightbox
          images={previewImages}
          initialIndex={imageIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default ClickableImage;
