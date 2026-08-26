'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDesignTemplates } from '../lib/supabaseService';

export default function PureTransparentPNGCarousel({ onSelectProduct }) {
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
      {/* PURE TRANSPARENT PNG CAROUSEL CONTAINER (NO WHITE BOX, NO CARD BACKGROUND, NO BORDERS) */}
      <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center overflow-hidden bg-transparent">
        {carouselItems.map((item, index) => {
          const count = carouselItems.length;
          let offset = (index - activeIndex + count) % count;
          if (offset > count / 2) offset -= count;

          let positionClasses = '';
          if (offset === 0) {
            positionClasses = 'z-30 scale-100 opacity-100 translate-x-0 cursor-pointer';
          } else if (offset === -1 || (offset === count - 1 && count > 2)) {
            positionClasses = 'z-10 scale-75 opacity-30 -translate-x-[52%] cursor-pointer hover:opacity-60';
          } else if (offset === 1) {
            positionClasses = 'z-10 scale-75 opacity-30 translate-x-[52%] cursor-pointer hover:opacity-60';
          } else {
            positionClasses = 'z-0 scale-50 opacity-0 pointer-events-none';
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
              className={`absolute w-[260px] sm:w-[320px] h-[340px] sm:h-[380px] transition-all duration-700 ease-out bg-transparent flex items-center justify-center border-0 shadow-none outline-none ${positionClasses}`}
              style={{ backgroundColor: 'transparent', background: 'transparent' }}
            >
              {/* PURE TRANSPARENT PNG IMAGE ONLY (OBJECT-CONTAIN FOR FULL PNG TRANSPARENCY) */}
              <img
                src={item.image}
                alt={item.name || 'Reka Bentuk PNG'}
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-contain bg-transparent border-0 shadow-none outline-none transition-transform duration-500 hover:scale-105 img-crisp"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  backgroundColor: 'transparent',
                  background: 'transparent'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
          );
        })}
      </div>

      {/* MINIMALIST CONTROL BUTTONS & DOTS */}
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
