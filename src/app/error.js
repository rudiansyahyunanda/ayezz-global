'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
          AYEZZ GLOBAL SISTEM
        </span>
        <h2 className="text-2xl font-black uppercase text-[#111111]">
          Katalog Memuatkan Sesi
        </h2>
        <p className="text-xs text-neutral-500 font-normal">
          Terdapat sedikit kelewatan dalam penyegaran sesi. Sila tekan butang muat semula di bawah.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#111111] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all"
        >
          Muat Semula
        </button>

        <Link
          href="/"
          className="px-6 py-3 bg-neutral-100 text-[#111111] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all"
        >
          Ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}
