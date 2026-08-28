'use client';

import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Crop as CropIcon, Trash2, RefreshCw } from 'lucide-react';
import { uploadAndProcessImageServerSide } from '../../lib/imageService';

export default function ImageUploadCropper({ value, onChange, label = "Gambar Cover (1:1 Square)", compact = false }) {
  const [preview, setPreview] = useState(value || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Server-side Sharp processing (Resize proportional, WebP conversion, Alpha channel PNG transparency preservation)
  const processImageFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      // Send file to server API for Sharp WebP HD compression (max 1920px Full HD)
      const res = await uploadAndProcessImageServerSide(file, { width: 1920, height: 1920 });
      if (res && res.url) {
        setPreview(res.url);
        onChange(res.url);
      }
    } catch (err) {
      console.warn('Server-side Sharp upload warning, falling back to local dataURL preview:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const localDataUrl = e.target.result;
        setPreview(localDataUrl);
        onChange(localDataUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-xs font-sans h-full flex flex-col justify-between">
      {label && <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, .gif, .svg"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group shadow-xs aspect-square max-h-48 w-full bg-slate-50 flex items-center justify-center p-2">
          <img
            src={preview}
            alt="Preview 1:1"
            className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              <CropIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Ganti</span>
            </button>
            <button
              type="button"
              onClick={() => { setPreview(''); onChange(''); }}
              className="p-1.5 bg-white text-rose-600 rounded-lg text-xs shadow-sm hover:bg-rose-50 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 text-center flex-1 min-h-[140px] aspect-square p-4 ${
            dragActive
              ? 'border-slate-900 bg-slate-100 text-slate-900'
              : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 text-slate-600'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2 font-medium text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
              <span>Memproses Gambar / SVG...</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600">
                <UploadIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs">Muat Naik Gambar (1:1)</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">SVG, PNG, JPG, WEBP</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
