import React from 'react';

export default function RatingDistribution({
  distribution = [],
  accent = 'blue',
  showPercent = true,
  className = '',
}) {
  const rows = distribution.length > 0
    ? distribution
    : [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 }));
  const fillClass = accent === 'red' ? 'bg-red' : 'bg-blue';

  return (
    <div className={`rating-distribution flex flex-col gap-1.5 flex-1 min-w-0 ${className}`.trim()}>
      {rows.map(({ star, percent }) => (
        <div key={star} className="rating-dist-row flex items-center gap-2 text-xs">
          <span className="rating-dist-label w-8 text-right text-text-3 font-medium shrink-0">{star}星</span>
          <div className="rating-dist-bar flex-1 h-1.5 rounded-full bg-surface-soft overflow-hidden">
            <div
              className={`rating-dist-fill h-full rounded-full transition-all duration-500 ease-out ${fillClass}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {showPercent && (
            <span className="rating-dist-percent w-12 text-right text-text-3 font-medium shrink-0">
              {percent.toFixed(percent % 1 === 0 ? 0 : 2)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
