'use client';

import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../../lib/supabaseService';

const { X, ChevronLeft, ChevronRight, Play, Pause, ArrowLeft, ArrowRight } = LucideIcons;

export default function TemplateGalleryViewModal({ template: initialTemplate, onClose, allTemplates = [], onSelectTemplate }) {
  const [currentTemplate, setCurrentTemplate] = useState(initialTemplate);
  const [templateList, setTemplateList] = useState(allTemplates);

  useEffect(() => {
    setCurrentTemplate(initialTemplate);
    setActiveIndex(0);
  }, [initialTemplate]);

  useEffect(() => {
    if (Array.isArray(allTemplates) && allTemplates.length > 0) {
      setTemplateList(allTemplates);
    }
  }, [allTemplates]);

  const activeTemplate = currentTemplate || initialTemplate;
  if (!activeTemplate) return null;

  const galleryImages = Array.isArray(activeTemplate.images) && activeTemplate.images.length > 0
    ? activeTemplate.images
    : [activeTemplate.thumbnail || PLACEHOLDER_IMAGE];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentIndex = templateList.findIndex(t => t.id === activeTemplate.id || t.name === activeTemplate.name);

  const handlePrevTemplate = () => {
    if (templateList.length <= 1) return;
    const prevIdx = currentIndex <= 0 ? templateList.length - 1 : currentIndex - 1;
    const nextTpl = templateList[prevIdx];
    setCurrentTemplate(nextTpl);
    setActiveIndex(0);
    if (onSelectTemplate) onSelectTemplate(nextTpl);
  };

  const handleNextTemplate = () => {
    if (templateList.length <= 1) return;
    const nextIdx = (currentIndex + 1) % templateList.length;
    const nextTpl = templateList[nextIdx];
    setCurrentTemplate(nextTpl);
    setActiveIndex(0);
    if (onSelectTemplate) onSelectTemplate(nextTpl);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && galleryImages.length <= 1) handlePrevTemplate();
      if (e.key === 'ArrowRight' && galleryImages.length <= 1) handleNextTemplate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, templateList, galleryImages.length]);

  // Auto-play 3D spin cycle every 4.5 seconds
  useEffect(() => {
    if (galleryImages.length <= 1 || !isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [galleryImages.length, isPlaying]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in font-sans">
      {/* KEYFRAME ANIMATION FOR GENTLE BREATHING ZOOM IN / OUT TO ORIGINAL */}
      <style>{`
        @keyframes gentleBreathingZoom {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(0deg) scale(1.06);
          }
          100% {
            transform: rotateY(0deg) scale(1);
          }
        }

        .animate-gentle-zoom {
          animation: gentleBreathingZoom 4s ease-in-out infinite;
        }
      `}</style>

      {/* LIGHT GREY MODAL CONTAINER */}
      <div className="relative w-full max-w-lg bg-[#F1F5F9] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* LIGHT GREY HEADER */}
        <div className="px-6 py-4 flex items-center justify-between bg-[#F1F5F9] text-slate-900 z-20">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-extrabold tracking-tight uppercase text-slate-900 truncate">{activeTemplate.name}</h3>
            <span className="text-[11px] text-slate-500 font-semibold">{activeTemplate.category} {activeTemplate.subCategory ? `• ${activeTemplate.subCategory}` : ''}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* NEXT CARD NAVIGATION BUTTONS */}
            {templateList.length > 1 && (
              <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl">
                <button
                  onClick={handlePrevTemplate}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Template Reka Bentuk Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-700 px-1">
                  {currentIndex >= 0 ? currentIndex + 1 : 1}/{templateList.length}
                </span>
                <button
                  onClick={handleNextTemplate}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Template Reka Bentuk Seterusnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* SUBTLE PLAY/PAUSE TOGGLE */}
            {galleryImages.length > 1 && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors"
                title={isPlaying ? 'Jeda Slaid (Pause)' : 'Mainkan Slaid (Play)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-full transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* IMAGE STAGE AREA WITH STATIC SOLID WHITE BACKGROUND (#FFFFFF) */}
        <div className="relative w-full aspect-square bg-white overflow-hidden group flex items-center justify-center p-0">
          {/* STATIC SOLID WHITE BACKGROUND LAYER - 100% FIXED */}
          <div className="absolute inset-0 bg-white z-0 pointer-events-none" />

          {galleryImages.map((src, index) => {
            const isActive = index === activeIndex;
            if (!isActive) return null;

            return (
              <div
                key={`${src}-${index}`}
                className="absolute inset-0 w-full h-full select-none flex items-center justify-center z-10 p-4 animate-fade-in"
              >
                <div className="w-full h-full flex items-center justify-center animate-gentle-zoom">
                  <img
                    src={src}
                    alt={`${activeTemplate.name} ${index + 1}`}
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-contain pointer-events-auto img-crisp"
                  />
                </div>
              </div>
            );
          })}

          {/* DISCRETE NAVIGATION ARROWS FOR MULTI-PHOTO GALLERY */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="Foto Seterusnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* MINIMALIST DOT INDICATORS */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center space-x-1.5">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeIndex === idx ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-400 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
