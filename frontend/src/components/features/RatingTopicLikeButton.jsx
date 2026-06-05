import React from 'react';
import Icon from '../common/Icon';
import { formatCount } from '../../utils';

export default function RatingTopicLikeButton({
  topicId,
  likes = 0,
  isLiked = false,
  onToggle,
  className = '',
  size = 'sm',
}) {
  const iconSize = size === 'lg' ? '20px' : '16px';

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    onToggle?.(topicId);
  };

  return (
    <button
      type="button"
      className={`rating-topic-like inline-flex items-center gap-1 font-semibold transition-colors ${isLiked ? 'text-red' : 'text-text-3 hover:text-red'} ${size === 'lg' ? 'text-sm' : 'text-xs'} ${className}`}
      aria-label={isLiked ? '取消喜爱' : '喜爱此评分帖'}
      aria-pressed={isLiked}
      onClick={handleClick}
    >
      <Icon
        name={isLiked ? 'favorite' : 'favorite_border'}
        filled={isLiked}
        style={{ fontSize: iconSize }}
      />
      {formatCount(likes)}
    </button>
  );
}
