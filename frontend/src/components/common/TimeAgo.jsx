import React, { useState, useEffect } from 'react';
import { formatTimeAgo } from '../../utils';

function TimeAgo({ timeString, className = '' }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(k => k + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span key={key} className={className}>
      {formatTimeAgo(timeString)}
    </span>
  );
}

export default TimeAgo;