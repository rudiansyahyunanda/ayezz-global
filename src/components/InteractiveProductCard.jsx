'use client';

import React, { useState, useEffect } from 'react';
import TransparentImage from './TransparentImage';
import { PLACEHOLDER_IMAGE } from '../lib/supabaseService';

export default function CleanPricelessProductCard({ item, onClick, isPriority }) {
  const imageList = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : (item.thumbnail ? [item.thumbnail] : [PLACEHOLDER_IMAGE]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide/flip images when mouse is hovered
  useEffect(() => {
    if (!isHovered || imageList.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % imageList.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, imageList.length]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImgIdx(0);
      }}
      className="group cursor-pointer space-y-1.5 sm:space-y-2 flex flex-col justify-between select-none"
    >
      {/* 1:1 Aspect Ratio Container with Smooth 3D Hover & Zoom */}
      <div className="w-full aspect-square bg-[#F5F5F7] overflow-hidden rounded-xl sm:rounded-2xl relative flex items-center justify-center p-2 sm:p-3 transition-all duration-500 hover:shadow-lg">
        
        {/* Animated Image with Smooth Zoom Scale */}
        <div className={`w-full h-full transition-transform duration-500 ease-out transform ${
          isHovered ? 'scale-105 sm:scale-110' : 'scale-100'
        }`}>
          <TransparentImage
            src={imageList[activeImgIdx]}
            alt={item.name}
            className="w-full h-full object-contain img-crisp"
          />
        </div>

        {/* Minimalist Image Indicator Dots if multiple images */}
        {imageList.length > 1 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center space-x-1 z-10 bg-black/20 backdrop-blur-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
            {imageList.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all ${
                  activeImgIdx === i ? 'bg-white w-2.5 sm:w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clean Minimalist Typography */}
      <div className="space-y-0.5 px-0.5 pt-0.5">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
          <span className="truncate max-w-[100px] sm:max-w-none">{item.category || 'SUBLIMASI'}</span>
          {item.subCategory && <span className="text-neutral-500 font-semibold truncate max-w-[80px] sm:max-w-none hidden sm:inline">{item.subCategory}</span>}
        </div>

        <h3 className="text-[11px] sm:text-xs font-bold text-[#111111] uppercase tracking-tight group-hover:text-neutral-600 transition-colors line-clamp-1 leading-tight">
          {item.name}
        </h3>
      </div>
    </div>
  );
}
