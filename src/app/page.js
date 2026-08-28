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
  User,
  Play,
  Film,
  X
} from 'lucide-react';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import MobileBottomNav from '../components/MobileBottomNav';
import { getCurrentUser } from '../lib/authService';
import {
  getCategories,
  getDesignTemplates,
  getShowcaseFeatureFromSupabase,
  DEFAULT_SHOWCASE_FEATURE
} from '../lib/supabaseService';
import { MAIN_CATALOGS, DESIGN_TEMPLATES } from '../data/sublimationProducts';

export default function SmoothHeaderHomepage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showcaseFeature, setShowcaseFeature] = useState(DEFAULT_SHOWCASE_FEATURE);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
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
      const [cats, tpls, usr, showcase] = await Promise.all([
        getCategories(),
        getDesignTemplates(),
        getCurrentUser(),
        getShowcaseFeatureFromSupabase()
      ]);
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : MAIN_CATALOGS);
      setTemplates(Array.isArray(tpls) && tpls.length > 0 ? tpls : DESIGN_TEMPLATES);
      setCurrentUser(usr);
      setShowcaseFeature(showcase || DEFAULT_SHOWCASE_FEATURE);
    } catch (err) {
      console.warn('Error loading homepage data from Supabase:', err);
      setCategories(MAIN_CATALOGS);
      setTemplates(DESIGN_TEMPLATES);
      setShowcaseFeature(DEFAULT_SHOWCASE_FEATURE);
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
      <div className="bg-[#161617] text-[#E8E8ED] text-[9px] sm:text-[11px] font-mono tracking-[0.1em] sm:tracking-[0.18em] uppercase py-1.5 sm:py-2.5 px-3 sm:px-6 text-center border-b border-neutral-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
        AYEZZ GLOBAL • KILANG PENGLUARAN JERSI SUKAN & SERAGAM CUSTOM
      </div>

      {/* 2. SILKY SMOOTH GLASS NAVBAR */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${isScrolled
            ? 'h-14 sm:h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs'
            : 'h-16 sm:h-24 bg-white border-b border-neutral-100'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-full flex items-center justify-between transition-all duration-500">
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className={`w-auto transition-all duration-500 group-hover:scale-[1.02] ${isScrolled ? 'h-5 sm:h-6' : 'h-5.5 sm:h-7'
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

          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.12em] rounded-full transition-all flex items-center space-x-1.5 shadow-2xs"
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                <span className="line-clamp-1 max-w-[90px] sm:max-w-[110px]">{currentUser.fullName || 'Dashboard'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.12em] rounded-full transition-all shadow-2xs"
              >
                Log Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION (EDITORIAL SPORTSWEAR AESTHETIC) */}
      <section className="py-8 sm:py-32 px-4 sm:px-12 bg-[#F6F6F9] sm:bg-[#EFEFF4] border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-8 text-left">
            
            {/* MINIMALIST TELEMETRY BADGE */}
            <div className="inline-flex items-center space-x-2 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-ping" />
              <span>[ KILANG SUBLIMASI HIGH-PERFORMANCE ]</span>
            </div>

            {/* EDITORIAL HEADLINE TYPOGRAPHY */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-[#111111] tracking-tight leading-[1.05] uppercase">
              REKA BENTUK JERSI <br />
              <span className="text-neutral-400 font-extrabold tracking-normal">PAKAIAN CUSTOM</span>
            </h1>

            <p className="text-neutral-600 text-xs sm:text-base leading-relaxed max-w-lg font-normal">
              Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan proses tempahan terus secara dalam talian.
            </p>

            {/* SIDE-BY-SIDE COMPACT CTA BUTTONS */}
            <div className="pt-2 flex items-center space-x-2.5 sm:space-x-4">
              <a
                href="#kategori-utama"
                className="px-5 py-3 sm:px-8 sm:py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2 active:scale-[0.98] shadow-sm whitespace-nowrap"
              >
                <span>Kategori Utama</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </a>

              <Link
                href="/katalog"
                className="px-4 py-3 sm:px-7 sm:py-4 bg-white border border-neutral-300 hover:border-[#111111] text-[#111111] font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center justify-center active:scale-[0.98] whitespace-nowrap"
              >
                <span>Semua Katalog</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center pt-2 sm:pt-0">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* 4. MASTER CATEGORIES SHOWCASE CAROUSEL (1:1 APPLE STORE STOREFRONT DESIGN SYSTEM) */}
      <section id="kategori-utama" className="py-14 sm:py-24 px-4 sm:px-12 bg-[#F5F5F7]/70 border-b border-neutral-200/60 select-none">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* APPLE STORE HEADER BAR */}
          <div className="flex items-end justify-between border-b border-neutral-200/40 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                Jelajahi Kategori.
              </h2>
            </div>

            <Link
              href="/katalog"
              className="text-[#0066CC] hover:underline text-xs sm:text-sm font-normal flex items-center space-x-1 transition-colors"
            >
              <span>Bandingkan semua katalog</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#0066CC]" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Memuatkan Kategori...</span>
            </div>
          ) : (
            <>
              {/* APPLE HORIZONTAL STOREFRONT CAROUSEL */}
              <div
                ref={categoryScrollRef}
                className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4 pt-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id || cat.code || idx}
                    onClick={() => handleCategoryClick(cat.title)}
                    className="group shrink-0 w-[240px] sm:w-[290px] snap-start cursor-pointer flex flex-col items-center select-none"
                  >
                    {/* APPLE SQUIRCLE CARD CONTAINER (rounded-[28px]) */}
                    <div className="w-full aspect-[4/3] sm:aspect-square rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white relative flex items-center justify-center p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-500 border border-neutral-200/50">
                      <img
                        src={cat.thumbnail || '/images/catalog/jersey-olahraga.jfif'}
                        alt={cat.title}
                        className="w-full h-full object-cover rounded-[16px] sm:rounded-[20px] transition-transform duration-700 ease-out group-hover:scale-[1.04] img-crisp"
                      />
                    </div>

                    {/* APPLE STYLE SWATCH DOTS */}
                    <div className="flex items-center justify-center space-x-1.5 my-2.5">
                      <span className={`w-2 h-2 rounded-full transition-all ${idx % 3 === 0 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                      <span className={`w-2 h-2 rounded-full transition-all ${idx % 3 === 1 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                      <span className={`w-2 h-2 rounded-full transition-all ${idx % 3 === 2 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                    </div>

                    {/* APPLE TYPOGRAPHY BELOW CARD */}
                    <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] text-center tracking-tight group-hover:text-[#0066CC] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#86868B] font-normal text-center max-w-[220px] leading-relaxed mt-0.5 mb-3 line-clamp-2">
                      {cat.description || cat.itemCount || 'Reka bentuk sublimasi berkualiti tinggi dengan kustomisasi bebas.'}
                    </p>

                    {/* APPLE ACTION BUTTON & BLUE LINK ROW */}
                    <div className="flex items-center space-x-3 mt-auto pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(cat.title);
                        }}
                        className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-medium text-xs px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
                      >
                        Selengkapnya
                      </button>

                      <span className="text-[#0066CC] hover:underline text-xs font-normal flex items-center space-x-0.5">
                        <span>Tempah</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* APPLE BOTTOM RIGHT CIRCULAR SWIPE ARROWS */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => scrollCategories('left')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8E8ED]/80 hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-all active:scale-95 shadow-2xs border border-neutral-300/40"
                  aria-label="Sebelumnya"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-[#1D1D1F]" />
                </button>
                <button
                  onClick={() => scrollCategories('right')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8E8ED]/80 hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-all active:scale-95 shadow-2xs border border-neutral-300/40"
                  aria-label="Seterusnya"
                  title="Seterusnya"
                >
                  <ChevronRight className="w-4 h-4 text-[#1D1D1F]" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4.5. APPLE "LIHAT LEBIH DEKAT." FEATURE SHOWCASE BANNER (1:1 APPLE STORE SYSTEM) */}
      {showcaseFeature && showcaseFeature.isActive && (
        <section className="py-12 sm:py-20 px-4 sm:px-12 bg-[#F5F5F7]/40 border-b border-neutral-200/60 select-none">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2.5xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
              {showcaseFeature.sectionTitle || 'Lihat lebih dekat.'}
            </h2>

            {/* APPLE 1:1 BANNER CARD (rounded-[32px]) */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[320px] sm:min-h-[420px] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#111111] shadow-md flex items-center justify-center p-6 sm:p-12 border border-neutral-200/50 group">
              {/* Cover Background Image */}
              <img
                src={showcaseFeature.coverImage || '/images/catalog/jersey-olahraga.jfif'}
                alt={showcaseFeature.headline || 'Showcase'}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03] opacity-75"
              />

              {/* Dark Ambient Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

              {/* Content Overlay */}
              <div className="relative z-10 max-w-xl text-center flex flex-col items-center space-y-3 sm:space-y-5">
                <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  {showcaseFeature.headline}
                </h3>
                
                {showcaseFeature.subHeadline && (
                  <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-md line-clamp-3">
                    {showcaseFeature.subHeadline}
                  </p>
                )}

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-6 py-3 sm:px-7 sm:py-3.5 bg-[#1D1D1F]/90 hover:bg-black text-white font-medium text-xs sm:text-sm rounded-full transition-all active:scale-95 shadow-md flex items-center space-x-2.5 border border-white/20 backdrop-blur-md cursor-pointer mt-2"
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>{showcaseFeature.buttonText || 'Tonton video'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIDEO / SHOWCASE MODAL */}
      {isVideoModalOpen && showcaseFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          <div className="bg-[#111111] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-neutral-800 flex flex-col">
            <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest truncate pr-2">
                {showcaseFeature.headline}
              </span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              {showcaseFeature.videoUrl && showcaseFeature.videoUrl.includes('embed') ? (
                <iframe
                  src={showcaseFeature.videoUrl}
                  title="Showcase Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md">
                  <Film className="w-12 h-12 text-neutral-400 mx-auto" />
                  <h4 className="text-base font-bold text-white uppercase">{showcaseFeature.headline}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{showcaseFeature.subHeadline}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FACTORY & TECHNICAL FEATURES SECTION (PURE APPLE MONOCHROME MINIMALIST) */}
      <section id="teknologi" className="py-16 sm:py-36 px-4 sm:px-12 bg-[#000000] text-white border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">

          {/* SECTION HEADER */}
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em] bg-neutral-900 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-neutral-800 inline-block">
              STANDARD KILANG & KUALITI INDUSTRI
            </span>
            <h2 className="text-2.5xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Mengapa Memilih <br className="hidden sm:inline" />
              AYEZZ GLOBAL?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal max-w-xl mx-auto">
              Kami memproses pesanan pakaian anda di kilang pengeluaran sendiri dengan teknologi mesin cetakan sublimasi berkelajuan tinggi berpiawaian antarabangsa.
            </p>
          </div>

          {/* 3 MONOCHROME APPLE GLASS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">

            {/* CARD 1 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-5 sm:p-10 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  01 / HD PRINT
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  100% Cetakan Sublimasi HD
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Warna pigmen meresap 100% terus ke dalam serat kain. Tidak akan pudar, merekah, atau bertukar kusam walaupun dicuci berulang kali.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/60 flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Teknologi Ink Japan High-Definition</span>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-5 sm:p-10 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  02 / MATERIAL
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Fabrik High-Performance
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Menggunakan fabrik Micro-Polyester, Interlock, dan Jacquard dengan keupayaan serapan peluh berteknologi pantas kering.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/60 flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Selesai & Sejuk Untuk Sukan Pro</span>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#111113] border border-neutral-800/80 hover:border-neutral-600 p-5 sm:p-10 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-200" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  03 / FLEKSIBEL
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Tanpa Pesanan Minimum
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Boleh menempah dari 1 unit jersi hingga beribu-ribu pakaian seragam untuk kejohanan, kelab sukan, mahupun tempahan korporat.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/60 flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono text-neutral-400">
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
      </footer>

      {/* 8. NATIVE MOBILE APP BOTTOM NAVIGATION BAR */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
