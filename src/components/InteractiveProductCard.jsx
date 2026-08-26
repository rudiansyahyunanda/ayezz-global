'use client';

import React, { useState, useEffect } from 'react';
import TransparentImage from './TransparentImage';

export default function CleanPricelessProductCard({ item, onClick, isPriority }) {
  const imageList = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : (item.thumbnail ? [item.thumbnail] : ['/images/catalog/jersey-olahraga.jfif']);

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
      className="group cursor-pointer space-y-2 flex flex-col justify-between select-none"
    >
      {/* 1:1 Aspect Ratio Container with Smooth 3D Hover & Zoom (Zero Tacky Buttons / Overlays) */}
      <div className="w-full aspect-square bg-[#F5F5F7] overflow-hidden rounded-2xl relative flex items-center justify-center p-3 transition-all duration-500 hover:shadow-lg">
        
        {/* Animated Image with Smooth Zoom Scale & Subtle Tilt */}
        <div className={`w-full h-full transition-transform duration-700 ease-out transform ${
          isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'
        }`}>
          <TransparentImage
            src={imageList[activeImgIdx]}
            alt={item.name}
            className="w-full h-full object-contain img-crisp"
          />
        </div>

        {/* Minimalist Image Indicator Dots if multiple images */}
        {imageList.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 z-10 bg-black/20 backdrop-blur-xs px-2 py-1 rounded-full">
            {imageList.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImgIdx === i ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clean Minimalist Typography (Category & Name Only — Zero Prices, Zero Buttons) */}
      <div className="space-y-0.5 px-1 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
          <span>{item.category || 'SUBLIMASI'}</span>
          {item.subCategory && <span className="text-neutral-500 font-semibold">{item.subCategory}</span>}
        </div>

        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-tight group-hover:text-neutral-600 transition-colors line-clamp-1 leading-snug">
          {item.name}
        </h3>
      </div>
    </div>
  );
}
