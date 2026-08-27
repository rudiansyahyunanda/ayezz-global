'use client';

import React from 'react';

/**
 * TransparentImage Component
 * Displays uploaded images directly using standard <img> tag
 * with zero real-time canvas overhead or base64 memory flickering.
 */
export default function TransparentImage({
  src,
  alt,
  className,
  style,
  onClick,
  draggable = false,
  onContextMenu,
  onDragStart,
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt || 'Product Image'}
      decoding="async"
      draggable={draggable}
      onContextMenu={onContextMenu || ((e) => e.preventDefault())}
      onDragStart={onDragStart || ((e) => e.preventDefault())}
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: 'transparent',
        background: 'transparent',
        WebkitUserDrag: 'none',
        userSelect: 'none',
        ...style
      }}
      {...props}
    />
  );
}
