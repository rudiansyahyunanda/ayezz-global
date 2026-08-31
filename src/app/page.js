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
import TransparentImage from '../components/TransparentImage';
import { getCurrentUser } from '../lib/authService';
import {
  getCategories,
  getDesignTemplates,
  getShowcaseFeatureFromSupabase,
  DEFAULT_SHOWCASE_FEATURE,
  getHeroSlidesFromSupabase,
  DEFAULT_HERO_SLIDES,
  PLACEHOLDER_IMAGE
} from '../lib/supabaseService';
import { MAIN_CATALOGS, DESIGN_TEMPLATES } from '../data/sublimationProducts';

export default function SmoothHeaderHomepage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showcaseFeature, setShowcaseFeature] = useState(DEFAULT_SHOWCASE_FEATURE);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const categoryScrollRef = useRef(null);
  const heroVideoRef = useRef(null);
  const slideStartTimeRef = useRef(Date.now());
  const pauseTimeRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);

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

  const nextHeroSlide = () => {
    setSlideProgress(0);
    elapsedBeforePauseRef.current = 0;
    slideStartTimeRef.current = Date.now();
    pauseTimeRef.current = 0;
    const activeCount = heroSlides.filter(s => s.is_active).length;
    setActiveHeroSlide((prev) => activeCount > 0 ? (prev + 1) % activeCount : 0);
  };

  const prevHeroSlide = () => {
    setSlideProgress(0);
    elapsedBeforePauseRef.current = 0;
    slideStartTimeRef.current = Date.now();
    pauseTimeRef.current = 0;
    const activeCount = heroSlides.filter(s => s.is_active).length;
    setActiveHeroSlide((prev) => (prev - 1 + activeCount) % activeCount);
  };

  // Hero Slideshow Timer Logic
  useEffect(() => {
    let rafId;
    const duration = 6000;
    const activeSlides = heroSlides.filter(s => s.is_active);
    const currentSlide = activeSlides[activeHeroSlide];

    if (!currentSlide) return;

    if (isHeroPaused) {
      if (heroVideoRef.current && currentSlide.slide_type === 'video') heroVideoRef.current.pause();
      if (pauseTimeRef.current === 0) {
        pauseTimeRef.current = Date.now();
      }
      return;
    } else {
      if (pauseTimeRef.current > 0) {
         elapsedBeforePauseRef.current += (Date.now() - pauseTimeRef.current);
         pauseTimeRef.current = 0;
      }
    }
    
    if (currentSlide.slide_type !== 'video') {
      const animate = () => {
        const now = Date.now();
        const elapsed = (now - slideStartTimeRef.current) - elapsedBeforePauseRef.current;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setSlideProgress(progress);
        
        if (elapsed >= duration) {
           nextHeroSlide();
        } else {
           rafId = requestAnimationFrame(animate);
        }
      };
      rafId = requestAnimationFrame(animate);
    } else if (currentSlide.slide_type === 'video') {
      if (heroVideoRef.current) {
        heroVideoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeHeroSlide, isHeroPaused, heroSlides]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, tpls, usr, showcase, slides] = await Promise.all([
        getCategories(),
        getDesignTemplates(),
        getCurrentUser(),
        getShowcaseFeatureFromSupabase(),
        getHeroSlidesFromSupabase()
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setCurrentUser(usr);
      setShowcaseFeature(showcase || DEFAULT_SHOWCASE_FEATURE);
      if (slides && slides.length > 0) {
        setHeroSlides(slides);
      }
    } catch (err) {
      console.warn('Error loading homepage data from Supabase:', err);
      setCategories([]);
      setTemplates([]);
      setShowcaseFeature(DEFAULT_SHOWCASE_FEATURE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const featuredProduct = templates[0] || null;

  const handleCategoryClick = (catTitle) => {
    router.push(`/katalog?category=${encodeURIComponent(catTitle)}`);
  };

  const activeSlideObj = heroSlides.filter(s => s.is_active).sort((a,b) => a.order_index - b.order_index)[activeHeroSlide];
  const isLightBg = activeSlideObj?.slide_type === 'carousel';

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
            : 'h-16 sm:h-20 bg-white border-b border-neutral-100'
          }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 h-full flex items-center justify-between transition-all duration-500">
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              style={{ height: isScrolled ? '24px' : '28px', width: 'auto' }}
              className="h-6 sm:h-7 w-auto transition-all duration-300 group-hover:scale-[1.02] block shrink-0 object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111]">
            <a href="#kategori-utama" className="hover:text-neutral-500 transition-colors">Kategori Utama</a>
            <Link href="/katalog" className="hover:text-neutral-500 transition-colors">Katalog Desain</Link>
            <a href="#teknologi" className="hover:text-neutral-500 transition-colors">Teknologi Kilang</a>
          </nav>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {currentUser ? (
              <div className="relative group">
                <Link
                  href="/dashboard"
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Dashboard Pengguna"
                >
                  <User className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#111111]" />
                </Link>
                {/* Hover Tooltip */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3">
                  <div className="text-xs sm:text-sm font-bold text-[#111111] line-clamp-1">{currentUser.fullName || 'Pengguna'}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-500 mt-1">Urus Profil & Tempahan</div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Link
                  href="/login"
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Log Masuk"
                >
                  <User className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#111111]" />
                </Link>
                {/* Hover Tooltip */}
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-200 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3 text-center">
                  <div className="text-xs sm:text-sm font-bold text-[#111111]">Log Masuk</div>
                  <div className="text-[10px] text-neutral-500 mt-1">Daftar / Log Masuk</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION (NIKE REPLICA DESIGN) */}
      <section className="relative w-full overflow-hidden bg-black h-[65vh] min-h-[550px] lg:min-h-[600px] lg:max-h-[850px] lg:h-[85vh] flex items-center">
        
        {/* Backgrounds */}
        {heroSlides.filter(s => s.is_active).sort((a, b) => a.order_index - b.order_index).map((slide, idx) => (
          slide.slide_type === 'video' ? (
            <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${activeHeroSlide === idx ? 'opacity-100' : 'opacity-0'}`}>
              <video 
                ref={activeHeroSlide === idx ? heroVideoRef : null}
                muted 
                playsInline
                onEnded={nextHeroSlide}
                onTimeUpdate={(e) => {
                  if (activeHeroSlide === idx) {
                    const progress = (e.target.currentTime / e.target.duration) * 100;
                    setSlideProgress(progress || 0);
                  }
                }}
                className="w-full h-full object-cover"
              >
                <source src={slide.media_url} type={slide.media_url.endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            </div>
          ) : slide.slide_type === 'image' ? (
            <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${activeHeroSlide === idx ? 'opacity-100' : 'opacity-0'}`}>
              <img src={slide.media_url} alt="Hero Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            </div>
          ) : slide.slide_type === 'carousel' ? (
            <div key={slide.id} className={`absolute inset-0 w-full h-full bg-[#F5F5F5] transition-opacity duration-1000 ease-in-out ${activeHeroSlide === idx ? 'opacity-100' : 'opacity-0'}`}></div>
          ) : null
        ))}
        
        {/* Content Container */}
        <div className="absolute inset-0 z-10 w-full max-w-[1920px] mx-auto flex flex-col justify-end lg:justify-end items-start lg:items-center pb-20 lg:pb-24 px-6 sm:px-12 lg:px-16">
          
          <div className="w-full flex flex-col items-start lg:items-center text-left lg:text-center">
            
            {/* Hero Carousel Container (Positioned ABOVE text per user request) */}
            <div className="w-full flex items-center justify-start lg:justify-center mb-4 sm:mb-8 lg:mb-12">
              {heroSlides.filter(s => s.is_active).sort((a, b) => a.order_index - b.order_index).map((slide, idx) => (
                slide.slide_type === 'carousel' ? (
                  <div key={`carousel-${slide.id}`} className={`relative w-full max-w-sm sm:max-w-md transition-all duration-1000 ease-out transform ${activeHeroSlide === idx ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none absolute'}`}>
                    <HeroCarousel />
                  </div>
                ) : null
              ))}
            </div>

            {/* Animated Text Container */}
            <div className="grid grid-cols-1 grid-rows-1 relative w-full lg:max-w-4xl mx-auto">
              
              {heroSlides.filter(s => s.is_active).sort((a, b) => a.order_index - b.order_index).map((slide, idx) => (
                <div key={`text-${slide.id}`} className={`col-start-1 row-start-1 space-y-1 sm:space-y-1.5 transition-all duration-1000 ease-out transform ${activeHeroSlide === idx ? 'translate-y-0 opacity-100 pointer-events-auto z-10' : 'translate-y-4 opacity-0 pointer-events-none z-0'}`}>
                  {/* EDITORIAL HEADLINE TYPOGRAPHY - Nike Futura ND */}
                  <h1 
                    className={`text-4xl sm:text-5xl lg:text-[4.5rem] tracking-normal leading-[0.95] uppercase mx-auto ${slide.slide_type === 'carousel' ? 'text-[#111111] [&_span]:!text-[#111111]' : 'text-white [&_span]:!text-white drop-shadow-sm'}`}
                    style={{ fontFamily: "'Nike Futura ND', Impact, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: slide.headline_html }}
                  />
                  {slide.description && (
                    <p 
                      className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-md lg:max-w-xl font-normal mx-auto line-clamp-2 lg:line-clamp-1 ${slide.slide_type === 'carousel' ? 'text-neutral-600' : 'text-white drop-shadow-md'}`}
                      style={{ fontFamily: "'Helvetica Now', 'Helvetica', 'Arial', sans-serif" }}
                    >
                      {slide.description}
                    </p>
                  )}
                </div>
              ))}
              
            </div>

            {/* NIKE STYLE BUTTONS */}
            <div className="pt-4 sm:pt-5 lg:pt-6 flex flex-row items-center justify-start lg:justify-center space-x-3 sm:space-x-4 w-full">
              <a
                href="#kategori-utama"
                className={`px-5 py-2.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm rounded-full transition-colors inline-flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${isLightBg ? 'bg-[#111111] text-white hover:bg-neutral-800' : 'bg-white hover:bg-neutral-200 text-[#111111]'}`}
              >
                <span>Shop Her Look</span>
              </a>

              <Link
                href="/katalog"
                className={`px-5 py-2.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm rounded-full transition-colors inline-flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${isLightBg ? 'bg-[#111111] text-white hover:bg-neutral-800' : 'bg-white hover:bg-neutral-200 text-[#111111]'}`}
              >
                <span>Katalog</span>
                <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLightBg ? 'text-white' : 'text-[#111111]'}`} fill="currentColor" />
              </Link>
            </div>
            
          </div>
          
        </div>

        {/* NIKE STYLE CONTROLS */}
        {/* Dots (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 sm:space-x-2">
          {heroSlides.filter(s => s.is_active).sort((a,b) => a.order_index - b.order_index).map((slide, idx) => (
            <button 
              key={`dot-${slide.id}`}
              onClick={() => {
                setSlideProgress(0);
                elapsedBeforePauseRef.current = 0;
                slideStartTimeRef.current = Date.now();
                pauseTimeRef.current = 0;
                setActiveHeroSlide(idx);
              }}
              className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 ${activeHeroSlide === idx ? (isLightBg ? 'bg-[#111111] scale-125' : 'bg-white scale-125') : (isLightBg ? 'bg-[#111111]/30 hover:bg-[#111111]/60' : 'bg-white/50 hover:bg-white/80')}`}
              aria-label={`Pergi ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause & Arrows (Bottom Right) */}
        <div className="absolute bottom-6 right-6 lg:right-12 z-40 flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={() => setIsHeroPaused(!isHeroPaused)}
            className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[1.5px] ${isLightBg ? 'border-[#111111]/20 text-[#111111] hover:bg-[#111111]/10' : 'border-white/20 text-white hover:bg-white/10'} flex items-center justify-center transition-colors`}
            aria-label={isHeroPaused ? 'Play' : 'Pause'}
          >
            {isHeroPaused ? (
               <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 translate-x-[1px] ${isLightBg ? 'text-[#111111]' : 'text-white'}`} fill="currentColor" />
            ) : (
               <div className="flex space-x-[2px]">
                 <div className={`w-[2px] h-[10px] sm:h-[12px] rounded-sm ${isLightBg ? 'bg-[#111111]' : 'bg-white'}`}></div>
                 <div className={`w-[2px] h-[10px] sm:h-[12px] rounded-sm ${isLightBg ? 'bg-[#111111]' : 'bg-white'}`}></div>
               </div>
            )}
            
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke={isLightBg ? "rgba(17,17,17,0.15)" : "rgba(255,255,255,0.2)"} strokeWidth="4" />
              <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke={isLightBg ? "#111111" : "#FFFFFF"} 
                strokeWidth="4" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 - (301.59 * slideProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-100 ease-linear"
              />
            </svg>
          </button>
          
          <button 
            onClick={prevHeroSlide} 
            className={`hidden lg:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-colors ${isLightBg ? 'bg-[#111111]/10 hover:bg-[#111111]/20 text-[#111111]' : 'bg-[#E5E5E5] hover:bg-white text-black'}`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 -translate-x-[1px]" />
          </button>
          
          <button 
            onClick={nextHeroSlide} 
            className={`hidden lg:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-colors ${isLightBg ? 'bg-[#111111]/10 hover:bg-[#111111]/20 text-[#111111]' : 'bg-[#E5E5E5] hover:bg-white text-black'}`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 translate-x-[1px]" />
          </button>
        </div>

      </section>

      {/* 4. MASTER CATEGORIES SHOWCASE CAROUSEL */}
      <section id="kategori-utama" className="py-14 sm:py-24 px-4 sm:px-8 lg:px-16 2xl:px-24 bg-white border-b border-neutral-200/60 select-none w-full">
        <div className="w-full max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
          
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
            <div className="flex space-x-4 sm:space-x-6 overflow-hidden py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[280px] sm:w-[325px] space-y-4 animate-pulse select-none">
                  <div className="w-full aspect-[4/4.5] sm:aspect-square bg-neutral-200/80 rounded-[28px] sm:rounded-[32px] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin opacity-30" />
                  </div>
                  <div className="space-y-2 flex flex-col items-center pt-2">
                    <div className="h-4 bg-neutral-200/90 rounded-md w-1/2" />
                    <div className="h-3 bg-neutral-200/70 rounded-md w-3/4" />
                  </div>
                </div>
              ))}
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
                    className="group shrink-0 w-[280px] sm:w-[325px] snap-start cursor-pointer flex flex-col items-center select-none"
                  >
                    {/* APPLE SQUIRCLE CARD CONTAINER (FRAMELESS / BORDERLESS FULL EDGE-TO-EDGE IMAGE) */}
                    <div className="w-full aspect-[4/4.5] sm:aspect-square rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F5F5F7] relative flex items-center justify-center p-0 shadow-xs hover:shadow-md transition-all duration-500 border-none">
                      <TransparentImage
                        src={cat.thumbnail || PLACEHOLDER_IMAGE}
                        alt={cat.title}
                        className="w-full h-full object-cover rounded-[28px] sm:rounded-[32px] transition-transform duration-700 ease-out group-hover:scale-[1.05] img-crisp"
                      />
                    </div>

                    {/* APPLE STYLE SWATCH DOTS */}
                    <div className="flex items-center justify-center space-x-1.5 my-3">
                      <span className={`w-2.5 h-2.5 rounded-full transition-all ${idx % 3 === 0 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                      <span className={`w-2.5 h-2.5 rounded-full transition-all ${idx % 3 === 1 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                      <span className={`w-2.5 h-2.5 rounded-full transition-all ${idx % 3 === 2 ? 'bg-[#1D1D1F]' : 'bg-neutral-300'}`} />
                    </div>

                    {/* APPLE TYPOGRAPHY BELOW CARD */}
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1D1D1F] text-center tracking-tight group-hover:text-[#0066CC] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#86868B] font-normal text-center max-w-[240px] leading-relaxed mt-1 mb-4 line-clamp-2">
                      {cat.description || cat.itemCount || 'Reka bentuk sublimasi berkualiti tinggi dengan kustomisasi bebas.'}
                    </p>

                    {/* APPLE ACTION BUTTON (CLEAN SINGLE PRIMARY BLUE CAPSULE) */}
                    <div className="mt-auto pt-1 pb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(cat.title);
                        }}
                        className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-full transition-all shadow-2xs"
                      >
                        Selengkapnya
                      </button>
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
              <TransparentImage
                src={showcaseFeature.coverImage || PLACEHOLDER_IMAGE}
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
