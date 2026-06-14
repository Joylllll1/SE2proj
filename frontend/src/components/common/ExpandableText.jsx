import React, { useState } from 'react';
import PlainTextContent from './PlainTextContent';

function shouldEnableCollapse(content, charThreshold, lineThreshold) {
  const text = typeof content === 'string' ? content.trim() : '';

  if (!text) {
    return false;
  }

  const lineCount = text.split(/\r?\n/).length;
  return text.length > charThreshold || lineCount > lineThreshold;
}

function ExpandableText({
  as = 'p',
  className = '',
  content,
  collapsedLinesClass = 'line-clamp-5',
  charThreshold = 180,
  lineThreshold = 5,
  expandLabel = '展开',
  collapseLabel = '收起',
  buttonClassName = 'mt-2 inline-flex text-xs font-semibold text-blue hover:underline',
}) {
  const [expanded, setExpanded] = useState(false);
  const isCollapsible = shouldEnableCollapse(content, charThreshold, lineThreshold);
  const textClassName = [className, isCollapsible && !expanded ? collapsedLinesClass : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <PlainTextContent as={as} className={textClassName} content={content} />
      {isCollapsible && (
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
}

export default ExpandableText;
