'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMAGE } from '../lib/supabaseService';

/**
 * TransparentImage Component (Progressive Image Loader with Auto Background Stripper)
 * Industry-standard progressive image loading with skeleton shimmer,
 * instant cached detection, and automatic real-time removal of solid white/light
 * rectangular background boxes so product images float 100% seamlessly!
 */
export default function TransparentImage({
  src,
  alt,
  className = '',
  style,
  onClick,
  draggable = false,
  onContextMenu,
  onDragStart,
  showSkeleton = true,
  autoStripBackground = true,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cleanedSrc, setCleanedSrc] = useState(null);
  const imgRef = useRef(null);

  // Target image URL fallback
  const rawTargetSrc = isError || !src ? PLACEHOLDER_IMAGE : src;
  const displaySrc = cleanedSrc || rawTargetSrc;

  // Real-time canvas solid background box stripper
  useEffect(() => {
    setCleanedSrc(null);

    if (!autoStripBackground || !src || src.startsWith('data:image/svg')) {
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (!isMounted) return;
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) return;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample 4 corner pixels
        const corners = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4
        ];

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (const idx of corners) {
          if (data[idx + 3] > 0) {
            rSum += data[idx];
            gSum += data[idx + 1];
            bSum += data[idx + 2];
            count++;
          }
        }

        if (count > 0) {
          const bgR = rSum / count;
          const bgG = gSum / count;
          const bgB = bSum / count;

          // Detect light / white solid background box
          const isLightBg = bgR > 215 && bgG > 215 && bgB > 215;

          if (isLightBg) {
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              if (a > 0) {
                const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
                if (dist < 32) {
                  if (dist < 15) {
                    data[i + 3] = 0; // Fully transparent
                  } else {
                    data[i + 3] = Math.round(((dist - 15) / 17) * a); // Smooth edge fade
                  }
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);
            const transparentUrl = canvas.toDataURL('image/png');
            if (isMounted) {
              setCleanedSrc(transparentUrl);
            }
          }
        }
      } catch (err) {
        // Cross-origin CORS fallback if image is on external domain without CORS headers
        if (isMounted) setCleanedSrc(null);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src, autoStripBackground]);

  // Instant Cache Check: If image is already downloaded in browser memory, show immediately
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src, cleanedSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent">
      {/* Sleek Skeleton Shimmer Placeholder while loading */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-neutral-200/60 dark:bg-neutral-800 animate-pulse z-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin opacity-40" />
        </div>
      )}

      {/* Progressive Image with Smooth Fade-in Reveal */}
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt || 'AYEZZ GLOBAL Image'}
        decoding="async"
        loading="eager"
        draggable={draggable}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsError(true);
          setIsLoaded(true);
        }}
        onContextMenu={onContextMenu || ((e) => e.preventDefault())}
        onDragStart={onDragStart || ((e) => e.preventDefault())}
        onClick={onClick}
        className={`transition-all duration-500 ease-out transform ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.98] blur-xs'
        } ${className}`}
        style={{
          backgroundColor: 'transparent',
          background: 'transparent',
          WebkitUserDrag: 'none',
          userSelect: 'none',
          ...style
        }}
        {...props}
      />
    </div>
  );
}
