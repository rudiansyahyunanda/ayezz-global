'use client';

import React, { useRef } from 'react';
import { Upload, Trash2, Plus, Star } from 'lucide-react';
import { uploadAndProcessImageServerSide } from '../../lib/imageService';

export default function MultiImageUploadCropper({ images = [], onChange, maxImages = 5 }) {
  const fileInputRef = useRef(null);

  // Server-side Sharp processing for multi-image gallery uploads
  const processImageFile = async (file) => {
    if (!file) return;

    try {
      const res = await uploadAndProcessImageServerSide(file, { width: 1920, height: 1920 });
      if (res && res.url) {
        onChange((prevImages) => {
          const current = Array.isArray(prevImages) ? prevImages : images;
          return [...current, res.url].slice(0, maxImages);
        });
      }
    } catch (err) {
      console.warn('Server-side Sharp multi-image upload fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const localUrl = e.target.result;
        onChange((prevImages) => {
          const current = Array.isArray(prevImages) ? prevImages : images;
          return [...current, localUrl].slice(0, maxImages);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processImageFile(file));
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetMain = (index) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-2 text-xs font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Galeri Gambar Template ({images.length}/{maxImages})
        </label>
        <span className="text-[10px] text-slate-400">Gambar pertama = Sampul Utama (GIF / PNG / JPG / SVG)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, .gif, .svg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-4 gap-2">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`relative rounded-lg overflow-hidden border group aspect-square bg-slate-50 flex items-center justify-center ${
              idx === 0 ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200'
            }`}
          >
            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />

            {/* Badge Cover Utama */}
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center space-x-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>Utama</span>
              </span>
            )}

            {/* Action Buttons */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 p-1">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetMain(idx)}
                  className="p-1 bg-white text-slate-900 rounded-md text-[10px] font-bold shadow-xs hover:bg-amber-100 transition-colors"
                  title="Jadikan Utama"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 bg-white text-rose-600 rounded-md text-[10px] shadow-xs hover:bg-rose-50 transition-colors"
                title="Padam"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-300 rounded-lg aspect-square bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-slate-900 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Tambah</span>
          </button>
        )}
      </div>
    </div>
  );
}
