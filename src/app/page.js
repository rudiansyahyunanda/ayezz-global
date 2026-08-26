'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import {
  getCategories,
  getDesignTemplates
} from '../lib/supabaseService';
import { MAIN_CATALOGS, DESIGN_TEMPLATES } from '../data/sublimationProducts';

export default function SpaciousLuxuryHomepage() {
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
      {/* 1. TOP ANNOUNCEMENT BAR (ELEGANT OFF-BLACK STRIP WITH AMPLE ROOM) */}
      <div className="bg-[#161617] text-[#E8E8ED] text-[11px] font-mono tracking-[0.18em] uppercase py-3 px-6 text-center border-b border-neutral-800 font-medium">
        AYEZZ GLOBAL — KILANG PENGLUARAN JERSI SUKAN & SERAGAM CUSTOM • BEBAS REKA BENTUK 100%
      </div>

      {/* 2. PROPORTIONAL SPACIOUS NAVBAR (96px HEIGHT, SLIM SLEEK LOGO) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-6 sm:h-7 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111]">
            <a href="#kategori-utama" className="hover:text-neutral-500 transition-colors">Kategori Utama</a>
            <Link href="/katalog" className="hover:text-neutral-500 transition-colors">Katalog Desain</Link>
            <a href="#teknologi" className="hover:text-neutral-500 transition-colors">Teknologi Kilang</a>
            <Link href="/admin" className="hover:text-neutral-500 transition-colors font-mono text-[10px] text-neutral-400">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setOrderedProduct(featuredProduct)}
              className="px-6 py-2.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[11px] uppercase tracking-[0.12em] rounded-full transition-all active:scale-[0.98] flex items-center space-x-2 shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Tempah Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION (RICH DISTINCT GREY BACKDROP #EFEFF4 FOR HIGH CONTRAST) */}
      <section className="py-24 sm:py-32 px-8 sm:px-12 bg-[#EFEFF4] border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-6 space-y-7 text-left">
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-500 uppercase block">
              STUDIO SUBLIMASI HIGH-PERFORMANCE
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#111111] tracking-tight leading-[1.04] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-neutral-500 font-bold">Pakaian Custom</span>
            </h1>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan buat tempahan terus ke WhatsApp.
            </p>

            <div className="pt-3 flex items-center space-x-4">
              <a
                href="#kategori-utama"
                className="px-8 py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-3 active:scale-[0.98] shadow-2xs"
              >
                <span>Lihat Kategori Utama</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </a>

              <Link
                href="/katalog"
                className="px-7 py-4 bg-white border border-neutral-300 hover:border-[#111111] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2 active:scale-[0.98]"
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

      {/* 4. MASTER CATEGORIES SHOWCASE GRID (PURE CRISP WHITE #FFFFFF WITH GENEROUS SPACIOUS ROOM) */}
      <section id="kategori-utama" className="py-28 sm:py-36 px-8 sm:px-12 bg-white border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="flex items-end justify-between border-b border-neutral-200 pb-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em] block">
                PILIH KATEGORI UNTUK MELIHAT DESAIN
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] uppercase tracking-tight">
                Koleksi Kategori Utama
              </h2>
            </div>

            <button
              onClick={loadData}
              className="p-3 bg-[#F5F5F7] hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors"
              title="Refresh Database"
            >
              <RefreshCw className={`w-4 h-4 text-[#111111] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* VISUAL IMAGE COVER CARDS GRID (SPACIOUS 4:3 RATIO CARDS) */}
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-neutral-400 font-bold">Memuatkan kategori dari Supabase...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.title)}
                  className="group cursor-pointer rounded-3xl overflow-hidden relative border border-neutral-200 hover:border-neutral-400 transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="w-full aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                    <img
                      src={cat.thumbnail}
                      alt={cat.title}
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 opacity-95 img-crisp"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 z-10 text-white flex items-end justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-neutral-300 block">
                          {cat.code || 'SUBLIMASI'}
                        </span>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-neutral-300 font-mono">
                          {cat.itemCount || 'Pilih Desain'}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
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

      {/* 5. FACTORY & TECHNICAL FEATURES SECTION (OBSIDIAN DARK #0A0A0C WITH SPACIOUS PADDING) */}
      <section id="teknologi" className="py-28 sm:py-36 px-8 sm:px-12 bg-[#0A0A0C] text-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-[0.2em]">STANDARD KILANG & KUALITI</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Mengapa Memilih AYEZZ GLOBAL?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              Kami memproses pesanan pakaian anda di kilang pengeluaran sendiri dengan teknologi mesin cetakan sublimasi berkelajuan tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="bg-[#141417] border border-neutral-800/80 p-10 rounded-3xl space-y-5 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">100% Cetakan Sublimasi HD</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Warna tidak akan pudar, merekah, atau bertukar kusam walaupun dicuci berulang kali.
              </p>
            </div>

            <div className="bg-[#141417] border border-neutral-800/80 p-10 rounded-3xl space-y-5 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Fabrik High-Performance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menggunakan fabrik Micro-Polyester, Interlock, dan Jacquard dengan keupayaan serapan peluh berteknologi pantas kering.
              </p>
            </div>

            <div className="bg-[#141417] border border-neutral-800/80 p-10 rounded-3xl space-y-5 hover:border-neutral-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Tanpa Pesanan Minimum</h3>
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

      {/* LUXURY FOOTER */}
      <footer className="bg-[#0A0A0C] text-white py-16 px-8 sm:px-12 text-xs border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-medium text-neutral-500">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-8 text-neutral-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/katalog" className="hover:text-white transition-colors">Katalog Desain</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
