'use client';

import React, { useState, useEffect } from 'react';

// Global cache map to persist processed transparent images in JS memory across tab switches & re-renders
const transparentCache = new Map();

/**
 * TransparentImage Component
 * - Preserves transparent PNGs/SVGs instantly without flickering.
 * - Strips white background on legacy JPG/JFIF images and caches result permanently in memory.
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
  // Synchronous cache lookup prevents any flash/flicker on tab switch or re-render
  const [displaySrc, setDisplaySrc] = useState(() => {
    if (!src) return '';
    if (transparentCache.has(src)) return transparentCache.get(src);
    return src;
  });

  useEffect(() => {
    if (!src) return;

    // 1. If already cached, use cached transparent version immediately
    if (transparentCache.has(src)) {
      setDisplaySrc(transparentCache.get(src));
      return;
    }

    // 2. If SVG, cache directly
    const lowerSrc = typeof src === 'string' ? src.toLowerCase() : '';
    const isSvg = lowerSrc.includes('.svg') || lowerSrc.startsWith('data:image/svg+xml');

    if (isSvg) {
      transparentCache.set(src, src);
      setDisplaySrc(src);
      return;
    }

    let isSubscribed = true;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (!isSubscribed) return;
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx || !img.naturalWidth || !img.naturalHeight) {
            transparentCache.set(src, src);
            if (isSubscribed) setDisplaySrc(src);
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          let hasWhiteBg = false;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // If pixel is white/off-white (r,g,b > 240) and opaque
            if (r > 240 && g > 240 && b > 240 && a > 100) {
              data[i + 3] = 0; // Make transparent
              hasWhiteBg = true;
            }
          }

          if (hasWhiteBg) {
            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            transparentCache.set(src, dataUrl);
            if (isSubscribed) setDisplaySrc(dataUrl);
          } else {
            // Already transparent PNG! Cache original src
            transparentCache.set(src, src);
            if (isSubscribed) setDisplaySrc(src);
          }
        } catch (err) {
          transparentCache.set(src, src);
          if (isSubscribed) setDisplaySrc(src);
        }
      };

      img.onerror = () => {
        transparentCache.set(src, src);
        if (isSubscribed) setDisplaySrc(src);
      };

      img.src = src;
    } catch (e) {
      transparentCache.set(src, src);
      if (isSubscribed) setDisplaySrc(src);
    }

    return () => {
      isSubscribed = false;
    };
  }, [src]);

  return (
    <img
      src={displaySrc || src}
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
