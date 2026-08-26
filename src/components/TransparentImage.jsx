'use client';

import React, { useState, useEffect } from 'react';

/**
 * TransparentImage Component
 * Automatically processes any image (JPG, JFIF, PNG with white background)
 * and strips away white/off-white background pixels (RGB > 240) in real-time
 * via offscreen Canvas, returning a 100% pure transparent image!
 */
export default function TransparentImage({ src, alt, className, style, onClick }) {
  const [transparentSrc, setTransparentSrc] = useState(src);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Reset when src changes
    setTransparentSrc(src);
    setProcessed(false);

    // Create an offscreen image to test and process
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Loop through all pixels and convert white/off-white to transparent
        let modified = false;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Threshold for white/near-white pixels (RGB > 240)
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Set Alpha channel to 0 (Transparent)
            modified = true;
          }
        }

        if (modified) {
          ctx.putImageData(imgData, 0, 0);
          setTransparentSrc(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        // Fallback to original src if CORS blocks canvas read
        console.warn('TransparentImage canvas processing bypassed:', err);
        setTransparentSrc(src);
      } finally {
        setProcessed(true);
      }
    };

    img.onerror = () => {
      setTransparentSrc(src);
      setProcessed(true);
    };
  }, [src]);

  return (
    <img
      src={transparentSrc}
      alt={alt || 'Product Image'}
      decoding="async"
      fetchPriority="high"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
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
