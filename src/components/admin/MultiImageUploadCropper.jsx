'use client';

import React, { useState, useRef } from 'react';
import { Trash2, Plus, Star, Loader2 } from 'lucide-react';
import { uploadAndProcessImageServerSide, uploadDirectToSupabaseStorage } from '../../lib/imageService';

export default function MultiImageUploadCropper({ images = [], onChange, maxImages = 5 }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const safeImages = Array.isArray(images) ? images : [];

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    let updatedList = [...safeImages];

    for (const file of files) {
      if (updatedList.length >= maxImages) break;

      try {
        // Try server-side HD WebP Sharp processing with direct client fallback
        const res = await uploadAndProcessImageServerSide(file, { width: 1920, height: 1920 });
        if (res && res.url) {
          updatedList.push(res.url);
        }
      } catch (err) {
        console.warn('[MultiImageUpload] Upload error fallback:', err);
        try {
          const directUrl = await uploadDirectToSupabaseStorage(file, 'tpl');
          if (directUrl) updatedList.push(directUrl);
        } catch (stErr) {
          console.error('[MultiImageUpload] Direct upload failed, using DataURL fallback:', stErr);
          await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                updatedList.push(ev.target.result);
              }
              resolve();
            };
            reader.onerror = () => resolve();
            reader.readAsDataURL(file);
          });
        }
      }
    }

    onChange(updatedList.slice(0, maxImages));
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index) => {
    const updated = safeImages.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetMain = (index) => {
    if (index === 0 || index >= safeImages.length) return;
    const selected = safeImages[index];
    const rest = safeImages.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-2 text-xs font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Galeri Gambar Template ({safeImages.length}/{maxImages})
        </label>
        <span className="text-[10px] text-slate-400">Gambar pertama = Sampul Utama</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
        {safeImages.map((imgUrl, idx) => (
          <div
            key={`${imgUrl}-${idx}`}
            className={`relative rounded-xl overflow-hidden border group aspect-square bg-[#F5F5F7] flex items-center justify-center ${
              idx === 0 ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200'
            }`}
          >
            <img
              src={imgUrl}
              alt={`Gallery ${idx + 1}`}
              className="w-full h-full object-contain p-1"
            />

            {/* Badge Cover Utama */}
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center space-x-0.5 z-10">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>Utama</span>
              </span>
            )}

            {/* Action Buttons Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 p-1 z-20">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetMain(idx);
                  }}
                  className="p-1.5 bg-white text-slate-900 rounded-md text-[10px] font-bold shadow-xs hover:bg-amber-100 transition-colors"
                  title="Jadikan Sampul Utama"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="p-1.5 bg-white text-rose-600 rounded-md text-[10px] shadow-xs hover:bg-rose-50 transition-colors"
                title="Padam Gambar Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {safeImages.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl aspect-square bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-slate-900 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                <span className="text-[9px] font-semibold text-slate-600">Muat Naik...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-semibold">Tambah</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
