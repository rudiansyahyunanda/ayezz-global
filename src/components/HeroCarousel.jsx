import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { getDesignTemplates } from '../lib/supabaseService';

export default function HeroCarousel({ onSelectProduct }) {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load Real-time Templates from Supabase Database
  useEffect(() => {
    async function loadHeroTemplates() {
      const templatesData = await getDesignTemplates();
      if (templatesData && templatesData.length > 0) {
        const formatted = templatesData.slice(0, 4).map((tpl, i) => ({
          ...tpl,
          title: tpl.name,
          categoryTag: (tpl.category || 'SUBLIMATION').toUpperCase(),
          image: tpl.thumbnail || '/images/catalog/jersey-olahraga.jfif',
          priceText: 'RM 70.00 / pcs'
        }));
        setItems(formatted);
      }
    }
    loadHeroTemplates();
  }, []);

  const carouselItems = items.length > 0 ? items : [
    {
      id: 'tpl_futsal_pro',
      name: 'Template Jersi Pro Match',
      title: 'Template Jersi Pro Match',
      categoryTag: 'FOOTBALL & FUTSAL',
      image: '/images/catalog/jersey-olahraga.jfif',
      priceText: 'RM 70.00 / pcs'
    },
    {
      id: 'tpl_esports_cyber',
      name: 'Template Jersi Esports Quantum',
      title: 'Template Jersi Esports Quantum',
      categoryTag: 'ESPORT & GAMING',
      image: '/images/catalog/esport.jfif',
      priceText: 'RM 85.00 / pcs'
    },
    {
      id: 'tpl_school_pro',
      name: 'Template Jersi Sekolah & Kampus',
      title: 'Template Jersi Sekolah & Kampus Pro',
      categoryTag: 'SEKOLAH & KAMPUS',
      image: '/images/catalog/scholl.jfif',
      priceText: 'RM 70.00 / pcs'
    }
  ];

  // Auto-rotate every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none py-4">
      {/* 3-CARD ROTATING DEPTH CAROUSEL (Small -> BIG -> Small) */}
      <div className="relative w-full h-[460px] flex items-center justify-center overflow-hidden">
        {carouselItems.map((item, index) => {
          const count = carouselItems.length;
          let offset = (index - activeIndex + count) % count;
          if (offset > count / 2) offset -= count;

          let positionClasses = '';
          if (offset === 0) {
            positionClasses = 'z-30 scale-100 opacity-100 translate-x-0 shadow-2xl border-2 border-[#1A1A1A]';
          } else if (offset === -1 || (offset === count - 1 && count > 2)) {
            positionClasses = 'z-10 scale-75 opacity-40 -translate-x-[55%] cursor-pointer hover:opacity-75 blur-[1px] hover:blur-0';
          } else if (offset === 1) {
            positionClasses = 'z-10 scale-75 opacity-40 translate-x-[55%] cursor-pointer hover:opacity-75 blur-[1px] hover:blur-0';
          } else {
            positionClasses = 'z-0 scale-50 opacity-0 pointer-events-none';
          }

          return (
            <div
              key={item.id + index}
              onClick={() => {
                if (offset !== 0) setActiveIndex(index);
              }}
              className={`absolute w-[300px] sm:w-[360px] h-[400px] rounded-3xl bg-white p-3 transition-all duration-700 ease-out flex flex-col justify-between ${positionClasses}`}
            >
              {/* Product Image */}
              <div className="w-full h-full rounded-2xl overflow-hidden relative group">
                <img
                  src={item.image}
                  alt={item.title}
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105 img-crisp"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-mono font-black uppercase bg-[#1A1A1A] text-white px-3 py-1 rounded-full shadow-sm">
                    {item.categoryTag}
                  </span>
                </div>

                {/* Bottom Overlay Glass Bar (Center Card Only) */}
                {offset === 0 && (
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-white/90 backdrop-blur-md rounded-xl border border-white/80 flex items-center justify-between shadow-lg animate-fade-in">
                    <div>
                      <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-tight leading-tight">{item.title}</h4>
                      <p className="text-[11px] font-mono text-emerald-700 font-bold">{item.priceText}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(item);
                      }}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Tempah</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTROLS & INDICATOR DOTS */}
      <div className="flex items-center space-x-4 mt-2 z-40">
        <button
          onClick={handlePrev}
          className="p-2 bg-white hover:bg-slate-100 text-[#1A1A1A] border border-[#E5E5E5] rounded-full shadow-sm transition-all active:scale-95"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          {carouselItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-6 bg-[#1A1A1A]' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 bg-white hover:bg-slate-100 text-[#1A1A1A] border border-[#E5E5E5] rounded-full shadow-sm transition-all active:scale-95"
          title="Seterusnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
