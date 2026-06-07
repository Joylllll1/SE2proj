import React from 'react';

function PlainTextContent({
  as: Component = 'p',
  className = '',
  content,
  children,
  ...props
}) {
  const text = content ?? children;
  const classes = ['whitespace-pre-wrap break-words', className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {text}
    </Component>
  );
}

export default PlainTextContent;
