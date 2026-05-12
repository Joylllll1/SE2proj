import React, { useState, useEffect } from 'react';
import { formatTimeAgo } from '../../utils';

function TimeAgo({ timeString, className = '' }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {formatTimeAgo(timeString)}
    </span>
  );
}

export default TimeAgo;