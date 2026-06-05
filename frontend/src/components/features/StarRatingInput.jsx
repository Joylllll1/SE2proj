import React, { useState } from 'react';
import Icon from '../common/Icon';

const STAR_ACCENT = {
  blue: { active: 'text-blue', inactive: 'text-line' },
  red: { active: 'text-red', inactive: 'text-red/30' },
};

export default function StarRatingInput({
  value = 0,
  onChange,
  disabled = false,
  size = 'lg',
  accent = 'blue',
}) {
  const [hover, setHover] = useState(0);

  const sizeClass = size === 'sm' ? 'rating-star-sm' : 'rating-star-lg';
  const tone = STAR_ACCENT[accent] || STAR_ACCENT.blue;

  const handleClick = (star) => {
    if (disabled || !onChange) return;
    onChange(star);
  };

  return (
    <div
      className={`rating-star-input flex items-center gap-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      role="group"
      aria-label="星级评分"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            className={`rating-star-btn ${sizeClass} border-0 bg-transparent p-0 cursor-pointer transition-transform duration-150 hover:scale-110`}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => handleClick(star)}
            aria-label={`${star} 星`}
          >
            <Icon
              name="star"
              solid={filled}
              className={filled ? tone.active : tone.inactive}
            />
          </button>
        );
      })}
    </div>
  );
}

export function StarRatingDisplay({ stars, size = 'sm', accent = 'blue' }) {
  if (!stars) return null;
  const sizeClass = size === 'sm' ? 'rating-star-sm' : 'rating-star-lg';
  const tone = STAR_ACCENT[accent] || STAR_ACCENT.blue;
  return (
    <div className="rating-star-display flex items-center gap-0.5" aria-label={`${stars} 星`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          solid={star <= stars}
          className={`${sizeClass} ${star <= stars ? tone.active : tone.inactive}`}
        />
      ))}
    </div>
  );
}
