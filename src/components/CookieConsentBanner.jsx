'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ayezz_cookie_consent');
      if (!consent) {
        // Delay showing banner slightly for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('ayezz_cookie_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('ayezz_cookie_consent', 'declined');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Notis Kuki"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 max-w-md bg-[#161617] text-[#E8E8ED] p-4 sm:p-5 rounded-2xl shadow-2xl border border-neutral-800 space-y-3 font-sans animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-white shrink-0" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Dasar Kuki & Privasi</h4>
        </div>

        <button
          onClick={handleDecline}
          className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors shrink-0"
          title="Tutup"
        >
          <X className="w-4 h-4 shrink-0" />
        </button>
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
        Kami menggunakan kuki untuk mengoptimumkan navigasi, menganalisis statistik trafik, dan menyimpan spesifikasi tempahan anda.
      </p>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="whitespace-nowrap">Tetapan</span>
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-[#111111] rounded-xl text-xs font-bold transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
        >
          <span className="whitespace-nowrap">Setuju & Teruskan</span>
        </button>
      </div>
    </aside>
  );
}
