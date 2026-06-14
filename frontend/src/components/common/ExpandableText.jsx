import React, { useEffect, useRef, useState } from 'react';
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
  forceShowToggle = null,
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [hasMeasuredOverflow, setHasMeasuredOverflow] = useState(false);
  const contentRef = useRef(null);
  const heuristicCollapsible = shouldEnableCollapse(content, charThreshold, lineThreshold);

  useEffect(() => {
    setExpanded(false);
    setHasOverflow(false);
    setHasMeasuredOverflow(false);
  }, [content]);

  useEffect(() => {
    if (!heuristicCollapsible) {
      setHasOverflow(false);
      return;
    }

    const element = contentRef.current;
    if (!element) {
      setHasOverflow(false);
      return;
    }

    const measureOverflow = () => {
      const overflowY = element.scrollHeight - element.clientHeight > 1;
      const overflowX = element.scrollWidth - element.clientWidth > 1;
      const nextOverflow = overflowY || overflowX;
      setHasOverflow(nextOverflow);
      if (nextOverflow) {
        setHasMeasuredOverflow(true);
      }
    };

    measureOverflow();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', measureOverflow);
      return () => window.removeEventListener('resize', measureOverflow);
    }

    return undefined;
  }, [heuristicCollapsible, content, collapsedLinesClass]);

  const isCollapsible = forceShowToggle ?? (heuristicCollapsible && (hasOverflow || (expanded && hasMeasuredOverflow)));
  const textClassName = [className, isCollapsible && !expanded ? collapsedLinesClass : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <PlainTextContent ref={contentRef} as={as} className={textClassName} content={content} />
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
