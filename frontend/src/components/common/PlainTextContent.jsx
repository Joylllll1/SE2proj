import React from 'react';

const PlainTextContent = React.forwardRef(function PlainTextContent({
  as: Component = 'p',
  className = '',
  content,
  children,
  ...props
}, ref) {
  const text = content ?? children;
  const classes = ['whitespace-pre-wrap break-words', className].filter(Boolean).join(' ');

  return (
    <Component ref={ref} className={classes} {...props}>
      {text}
    </Component>
  );
});

export default PlainTextContent;
