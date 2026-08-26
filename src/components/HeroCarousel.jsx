'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDesignTemplates } from '../lib/supabaseService';
import TransparentImage from './TransparentImage';

export default function AutoBackgroundStrippedHeroCarousel({ onSelectProduct }) {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadLatestDesignTemplates() {
      try {
        const templatesData = await getDesignTemplates();
        if (Array.isArray(templatesData) && templatesData.length > 0) {
          const top4 = templatesData.slice(0, 4).map((tpl) => {
            const primaryImage = Array.isArray(tpl.images) && tpl.images.length > 0
              ? tpl.images[0]
              : (tpl.thumbnail || '/images/catalog/jersey-olahraga.jfif');
            return {
              ...tpl,
              image: primaryImage
            };
          });
          setItems(top4);
        }
      } catch (err) {
        console.warn('Error loading carousel templates:', err);
      }
    }
    loadLatestDesignTemplates();
  }, []);

  const carouselItems = items.length > 0 ? items : [
    {
      id: 'tpl_futsal_pro',
      name: 'Template Jersi Pro Match',
      image: '/images/catalog/jersey-olahraga.jfif'
    },
    {
      id: 'tpl_esports_cyber',
      name: 'Template Jersi Esports Quantum',
      image: '/images/catalog/esport.jfif'
    },
    {
      id: 'tpl_school_pro',
      name: 'Template Jersi Sekolah Pro',
      image: '/images/catalog/scholl.jfif'
    }
  ];

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none py-2 bg-transparent">
      {/* REAL-TIME CANVAS STRIPPED 100% TRANSPARENT PNG CAROUSEL */}
      <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center overflow-hidden bg-transparent">
        {carouselItems.map((item, index) => {
          const count = carouselItems.length;
          let offset = (index - activeIndex + count) % count;
          if (offset > count / 2) offset -= count;

          let positionClasses = '';
          if (offset === 0) {
            positionClasses = 'z-30 scale-100 translate-x-0 cursor-pointer pointer-events-auto';
          } else if (offset === -1 || (offset === count - 1 && count > 2)) {
            positionClasses = 'z-10 scale-75 -translate-x-[55%] cursor-pointer pointer-events-auto blur-[1px]';
          } else if (offset === 1) {
            positionClasses = 'z-10 scale-75 translate-x-[55%] cursor-pointer pointer-events-auto blur-[1px]';
          } else {
            positionClasses = 'z-0 scale-50 pointer-events-none hidden';
          }

          return (
            <div
              key={item.id + index}
              onClick={() => {
                if (offset === 0) {
                  if (onSelectProduct) onSelectProduct(item);
                } else {
                  setActiveIndex(index);
                }
              }}
              className={`absolute w-[260px] sm:w-[320px] h-[340px] sm:h-[380px] transition-all duration-700 ease-out flex items-center justify-center bg-transparent border-0 shadow-none outline-none ${positionClasses}`}
            >
              {/* TRANSPARENT IMAGE COMPONENT: AUTO STRIPS ALL WHITE BACKGROUND PIXELS */}
              <TransparentImage
                src={item.image}
                alt={item.name || 'Reka Bentuk PNG'}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 img-crisp bg-transparent border-0 shadow-none outline-none"
              />
            </div>
          );
        })}
      </div>

      {/* MINIMALIST CONTROL ARROWS & DOTS */}
      <div className="flex items-center space-x-4 z-40 mt-1">
        <button
          onClick={handlePrev}
          className="p-2 bg-white hover:bg-neutral-100 text-[#111111] border border-slate-200 rounded-full transition-all active:scale-95 shadow-none"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          {carouselItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-5 bg-[#111111]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 bg-white hover:bg-neutral-100 text-[#111111] border border-slate-200 rounded-full transition-all active:scale-95 shadow-none"
          title="Seterusnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
