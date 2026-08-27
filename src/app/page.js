'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Printer,
  Zap,
  PackageCheck,
  CheckCircle2,
  ShieldCheck,
  Clock,
  User
} from 'lucide-react';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import MobileBottomNav from '../components/MobileBottomNav';
import { getCurrentUser } from '../lib/authService';
import {
  getCategories,
  getDesignTemplates
} from '../lib/supabaseService';
import { MAIN_CATALOGS, DESIGN_TEMPLATES } from '../data/sublimationProducts';

export default function SmoothHeaderHomepage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTempahCustomClick = async () => {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent('/katalog')}&msg=login_required`;
      return;
    }
    setOrderedProduct(featuredProduct);
  };

  // Smooth Header Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, tpls, usr] = await Promise.all([
        getCategories(),
        getDesignTemplates(),
        getCurrentUser()
      ]);
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : MAIN_CATALOGS);
      setTemplates(Array.isArray(tpls) && tpls.length > 0 ? tpls : DESIGN_TEMPLATES);
      setCurrentUser(usr);
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
      <div className="bg-[#161617] text-[#E8E8ED] text-[11px] font-mono tracking-[0.18em] uppercase py-2.5 px-6 text-center border-b border-neutral-800 font-medium">
        AYEZZ GLOBAL — KILANG PENGLUARAN JERSI SUKAN & SERAGAM CUSTOM • BEBAS REKA BENTUK 100%
      </div>

      {/* 2. SILKY SMOOTH GLASS NAVBAR */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${isScrolled
            ? 'h-16 bg-white/85 backdrop-blur-md border-b border-neutral-200/80 shadow-xs'
            : 'h-24 bg-white border-b border-neutral-100'
          }`}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-12 h-full flex items-center justify-between transition-all duration-500">
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className={`w-auto transition-all duration-500 group-hover:scale-[1.02] ${isScrolled ? 'h-5 sm:h-6' : 'h-6 sm:h-7'
                }`}
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

          <div className="flex items-center space-x-3 sm:space-x-4">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-bold text-[11px] uppercase tracking-[0.12em] rounded-full transition-all flex items-center space-x-1.5 border border-neutral-200"
              >
                <User className="w-3.5 h-3.5 text-[#111111]" />
                <span className="line-clamp-1 max-w-[110px]">{currentUser.fullName || 'Dashboard'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-[#111111] hover:text-neutral-500 font-bold text-[11px] uppercase tracking-[0.12em] transition-colors hidden sm:block"
              >
                Log Masuk
              </Link>
            )}

            <button
              onClick={handleTempahCustomClick}
              className={`bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[11px] uppercase tracking-[0.12em] rounded-full transition-all duration-500 active:scale-[0.98] flex items-center space-x-2 shadow-2xs ${isScrolled ? 'px-5 py-2' : 'px-6 py-2.5'
                }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Tempah Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION */}
      <section className="py-24 sm:py-32 px-8 sm:px-12 bg-[#EFEFF4] border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-300 shadow-2xs text-[10px] font-mono font-bold tracking-widest text-neutral-600 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
              <span>STUDIO SUBLIMASI HIGH-PERFORMANCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#111111] tracking-tight leading-[1.04] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-neutral-500 font-bold">Pakaian Custom</span>
            </h1>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan proses tempahan terus secara dalam talian menerusi sistem aplikasi ini.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#kategori-utama"
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2.5 active:scale-[0.98] shadow-2xs whitespace-nowrap"
              >
                <span>Lihat Kategori Utama</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </a>

              <Link
                href="/katalog"
                className="px-6 sm:px-7 py-3.5 sm:py-4 bg-white border border-neutral-300 hover:border-[#111111] text-[#111111] font-bold text-[11px] sm:text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2 active:scale-[0.98] whitespace-nowrap"
              >
                <span>Semua Katalog</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* 4. MASTER CATEGORIES SHOWCASE CAROUSEL (NIKE / APPLE MINIMALIST CLEAN SWIPE) */}
      <section id="kategori-utama" className="py-20 sm:py-28 px-6 sm:px-12 bg-white border-b border-neutral-200/60 select-none">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* TITLE HEADER & CIRCULAR SWIPE NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Kategori Pilihan
              </h2>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => scrollCategories('left')}
                className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-neutral-200 text-[#111111] flex items-center justify-center transition-all active:scale-95 border border-neutral-200/60 shadow-2xs"
                aria-label="Scroll ke kiri"
                title="Scroll ke kiri"
              >
                <ChevronLeft className="w-5 h-5 text-[#111111]" />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-neutral-200 text-[#111111] flex items-center justify-center transition-all active:scale-95 border border-neutral-200/60 shadow-2xs"
                aria-label="Scroll ke kanan"
                title="Scroll ke kanan"
              >
                <ChevronRight className="w-5 h-5 text-[#111111]" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Memuatkan Kategori...</span>
            </div>
          ) : (
            /* HORIZONTAL SWIPE CAROUSEL */
            <div
              ref={categoryScrollRef}
              className="flex space-x-5 sm:space-x-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4 pt-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id || cat.code}
                  onClick={() => handleCategoryClick(cat.title)}
                  className="group shrink-0 w-[270px] sm:w-[350px] lg:w-[380px] snap-start cursor-pointer space-y-3"
                >
                  {/* CLEAN TALL RECTANGULAR IMAGE CONTAINER */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F5F5F7] border border-neutral-200/60 shadow-xs">
                    <img
                      src={cat.thumbnail || '/images/catalog/jersey-olahraga.jfif'}
                      alt={cat.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 img-crisp"
                    />
                  </div>

                  {/* MINIMALIST TEXT BELOW IMAGE */}
                  <div className="pt-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight group-hover:underline">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      {cat.itemCount || 'Desain Sublimasi Custom'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FACTORY & TECHNICAL FEATURES SECTION (PURE APPLE MONOCHROME MINIMALIST) */}
      <section id="teknologi" className="py-28 sm:py-36 px-8 sm:px-12 bg-[#000000] text-white border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* SECTION HEADER */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.25em] bg-neutral-900 px-4 py-1.5 rounded-full border border-neutral-800 inline-block">
              STANDARD KILANG & KUALITI INDUSTRI
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Mengapa Memilih <br className="hidden sm:inline" />
              AYEZZ GLOBAL?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal max-w-xl mx-auto">
              Kami memproses pesanan pakaian anda di kilang pengeluaran sendiri dengan teknologi mesin cetakan sublimasi berkelajuan tinggi berpiawaian antarabangsa.
            </p>
          </div>

          {/* 3 MONOCHROME APPLE GLASS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

            {/* CARD 1 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-8 sm:p-10 rounded-3xl space-y-6 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <Printer className="w-5 h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  01 / HD PRINT
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  100% Cetakan Sublimasi HD
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Warna pigmen meresap 100% terus ke dalam serat kain. Tidak akan pudar, merekah, atau bertukar kusam walaupun dicuci berulang kali.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-800/60 flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Teknologi Ink Japan High-Definition</span>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-8 sm:p-10 rounded-3xl space-y-6 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <Zap className="w-5 h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  02 / MATERIAL
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Fabrik High-Performance
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Menggunakan fabrik Micro-Polyester, Interlock, dan Jacquard dengan keupayaan serapan peluh berteknologi pantas kering.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-800/60 flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Selesai & Sejuk Untuk Sukan Pro</span>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-8 sm:p-10 rounded-3xl space-y-6 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  03 / FLEKSIBEL
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Tanpa Pesanan Minimum
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Boleh menempah dari 1 unit jersi hingga beribu-ribu pakaian seragam untuk kejohanan, kelab sukan, mahupun tempahan korporat.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-800/60 flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>MOQ 0 Unit • Bebas Kustomisasi</span>
              </div>
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

      {/* FOOTER */}
      <footer className="bg-[#000000] text-white py-16 px-8 sm:px-12 text-xs border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-6 w-auto brightness-0 invert" />
            <span className="text-neutral-500 font-mono">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-mono text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">Utama</a>
            <Link href="/katalog" className="hover:text-white transition-colors">Katalog Desain</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      {/* 8. NATIVE MOBILE APP BOTTOM NAVIGATION BAR */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
