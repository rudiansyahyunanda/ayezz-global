'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMAGE } from '../lib/supabaseService';

/**
 * TransparentImage Component (Pure Progressive Image Loader)
 * Industry-standard progressive image loading with skeleton shimmer,
 * instant cached detection, and smooth opacity fade-in transition.
 * Preserves 100% original image pixels and source transparency.
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
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  // Target image URL fallback
  const targetSrc = isError || !src ? PLACEHOLDER_IMAGE : src;

  // Instant Cache Check: If image is already downloaded in browser memory, show immediately
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

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
        src={targetSrc}
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
