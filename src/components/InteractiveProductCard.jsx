'use client';

import React, { useState, useEffect } from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import TransparentImage from './TransparentImage';

export default function InteractiveProductCard({ item, onClick, isPriority }) {
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
      className="group cursor-pointer space-y-3 flex flex-col justify-between select-none"
    >
      {/* 1:1 Aspect Ratio Container with Smooth 3D Hover & Zoom */}
      <div className="w-full aspect-square bg-[#F5F5F7] overflow-hidden rounded-2xl relative flex items-center justify-center p-3 transition-all duration-500 hover:shadow-xl">
        
        {/* Animated Image with Zoom & Gentle 3D Flip */}
        <div className={`w-full h-full transition-transform duration-700 ease-out transform ${
          isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'
        }`}>
          <TransparentImage
            src={imageList[activeImgIdx]}
            alt={item.name}
            className="w-full h-full object-contain img-crisp"
          />
        </div>

        {/* Hover Action Badge "Pratonton Desain" */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-full py-2 bg-[#111111]/90 backdrop-blur-md text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Pratonton Desain</span>
          </div>
        </div>

        {/* Image Indicator Dots if multiple images */}
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

      {/* Clean Typography Below Image */}
      <div className="space-y-1 px-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
          <span>{item.category || 'SUBLIMASI'}</span>
          {item.subCategory && <span className="text-neutral-500 font-semibold">{item.subCategory}</span>}
        </div>

        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-tight group-hover:text-neutral-600 transition-colors line-clamp-1 leading-snug">
          {item.name}
        </h3>

        <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#111111]">RM 70.00+ / pcs</span>
          <span className="text-[11px] font-bold text-neutral-900 group-hover:underline flex items-center space-x-0.5">
            <span>Pratonton</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
