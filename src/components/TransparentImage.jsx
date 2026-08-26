'use client';

import React, { useState, useEffect } from 'react';

/**
 * TransparentImage Component
 * Automatically processes any image (JPG, JFIF, PNG with white background)
 * and strips away white/off-white background pixels (RGB > 240) in real-time
 * via offscreen Canvas, returning a 100% pure transparent image!
 */
export default function TransparentImage({
  src,
  alt,
  className,
  style,
  onClick,
  draggable = false,
  onContextMenu,
  onDragStart
}) {
  const [transparentSrc, setTransparentSrc] = useState(src);

  useEffect(() => {
    if (!src) return;

    setTransparentSrc(src);
    let isSubscribed = true;

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        if (!isSubscribed) return;
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx || !img.naturalWidth || !img.naturalHeight) {
            if (isSubscribed) setTransparentSrc(src);
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          let modified = false;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 240 && g > 240 && b > 240) {
              data[i + 3] = 0;
              modified = true;
            }
          }

          if (modified) {
            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            if (isSubscribed) setTransparentSrc(dataUrl);
          }
        } catch (err) {
          if (isSubscribed) setTransparentSrc(src);
        }
      };

      img.onerror = () => {
        if (isSubscribed) setTransparentSrc(src);
      };

      img.src = src;
    } catch (e) {
      if (isSubscribed) setTransparentSrc(src);
    }

    return () => {
      isSubscribed = false;
    };
  }, [src]);

  return (
    <img
      src={transparentSrc || src}
      alt={alt || 'Product Image'}
      decoding="async"
      fetchPriority="high"
      draggable={draggable}
      onContextMenu={onContextMenu || ((e) => e.preventDefault())}
      onDragStart={onDragStart || ((e) => e.preventDefault())}
      onClick={onClick}
      className={className}
      style={{
        imageRendering: '-webkit-optimize-contrast',
        backgroundColor: 'transparent',
        background: 'transparent',
        WebkitUserDrag: 'none',
        userSelect: 'none',
        ...style
      }}
    />
  );
}
