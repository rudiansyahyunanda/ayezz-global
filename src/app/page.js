'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import {
  getCategories,
  getDesignTemplates
} from '../lib/supabaseService';
import { MAIN_CATALOGS, DESIGN_TEMPLATES } from '../data/sublimationProducts';

export default function CleanHomepagePortal() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, tpls] = await Promise.all([
        getCategories(),
        getDesignTemplates()
      ]);
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : MAIN_CATALOGS);
      setTemplates(Array.isArray(tpls) && tpls.length > 0 ? tpls : DESIGN_TEMPLATES);
    } catch (err) {
      console.warn('Error loading homepage data from Supabase:', err);
      setCategories(MAIN_CATALOGS);
      setTemplates(DESIGN_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const featuredProduct = templates[0] || {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    thumbnail: '/images/catalog/jersey-olahraga.jfif'
  };

  const handleCategoryClick = (catTitle) => {
    router.push(`/katalog?category=${encodeURIComponent(catTitle)}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white flex flex-col">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#111111] text-white text-[11px] font-mono tracking-widest uppercase py-2 px-4 text-center">
        AYEZZ GLOBAL — KILANG PENGLUARAN JERSI SUKAN & SERAGAM CUSTOM • BEBAS REKA BENTUK 100%
      </div>

      {/* 2. MINIMALIST BRAND NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#111111]">
            <a href="#kategori-utama" className="hover:text-neutral-500 transition-colors">Kategori Utama</a>
            <Link href="/katalog" className="hover:text-neutral-500 transition-colors">Katalog Desain</Link>
            <a href="#teknologi" className="hover:text-neutral-500 transition-colors">Teknologi Kilang</a>
            <Link href="/admin" className="hover:text-neutral-500 transition-colors font-mono text-[11px] text-neutral-400">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setOrderedProduct(featuredProduct)}
              className="px-6 py-3 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Tempah Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION */}
      <section className="py-16 px-6 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase block">
              STUDIO SUBLIMASI HIGH-PERFORMANCE
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.05] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-neutral-400 font-bold">Pakaian Custom</span>
            </h1>

            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan buat tempahan terus ke WhatsApp.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <a
                href="#kategori-utama"
                className="px-8 py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-3 active:scale-95"
              >
                <span>Lihat Kategori Utama</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </a>

              <Link
                href="/katalog"
                className="px-7 py-4 bg-white border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2"
              >
                <span>Semua Katalog</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <HeroCarousel
              onSelectProduct={(item) => setOrderedProduct(item)}
            />
          </div>
        </div>
      </section>

      {/* 4. MASTER CATEGORIES SHOWCASE GRID (FETCHED 100% FROM SUPABASE) */}
      <section id="kategori-utama" className="py-20 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
            <div>
              <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                PILIH KATEGORI UNTUK MELIHAT DESAIN
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight mt-1">
                Koleksi Kategori Utama
              </h2>
            </div>

            <button
              onClick={loadData}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors"
              title="Refresh Database"
            >
              <RefreshCw className={`w-4 h-4 text-[#111111] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* VISUAL IMAGE COVER CARDS GRID */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-neutral-400 font-bold">Memuatkan kategori dari Supabase...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.title)}
                  className="group cursor-pointer rounded-2xl overflow-hidden relative border border-neutral-200 hover:border-neutral-400 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-full aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                    <img
                      src={cat.thumbnail}
                      alt={cat.title}
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 img-crisp"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 z-10 text-white flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 block">
                          {cat.code || 'SUBLIMASI'}
                        </span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-neutral-300 font-mono">
                          {cat.itemCount || 'Pilih Desain'}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FACTORY & TECHNICAL FEATURES SECTION */}
      <section id="teknologi" className="py-20 px-6 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">STANDARD KILANG & KUALITI</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Mengapa Memilih AYEZZ GLOBAL?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              Kami memproses pesanan pakaian anda di kilang pengeluaran sendiri dengan teknologi mesin cetakan sublimasi berkelajuan tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-mono font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-white uppercase">100% Cetakan Sublimasi HD</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Warna tidak akan pudar, merekah, atau bertukar kusam walaupun dicuci berulang kali.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-mono font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-white uppercase">Fabrik High-Performance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menggunakan fabrik Micro-Polyester, Interlock, dan Jacquard dengan keupayaan serapan peluh berteknologi pantas kering.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-mono font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-white uppercase">Tanpa Pesanan Minimum</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Boleh menempah dari 1 unit jersi hingga beribu-ribu pakaian seragam untuk kejohanan atau korporat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {orderedProduct && (
        <ProductOrderModal
          product={orderedProduct}
          allProducts={templates}
          onClose={() => setOrderedProduct(null)}
          onSelectProduct={(item) => setOrderedProduct(item)}
        />
      )}

      {/* CLEAN FOOTER */}
      <footer className="bg-[#111111] text-white py-12 px-6 text-xs border-t border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-medium text-neutral-400">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-neutral-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/katalog" className="hover:text-white transition-colors">Katalog Desain</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
