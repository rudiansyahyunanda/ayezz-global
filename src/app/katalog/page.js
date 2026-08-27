'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  User
} from 'lucide-react';
import InteractiveProductCard from '../../components/InteractiveProductCard';
import ProductPreviewModal from '../../components/modals/ProductPreviewModal';
import MobileBottomNav from '../../components/MobileBottomNav';
import { getCurrentUser } from '../../lib/authService';
import {
  getDesignTemplates,
  getCategories,
  getCutTypes,
  getFabricTypes
} from '../../lib/supabaseService';
import {
  DESIGN_TEMPLATES,
  MAIN_CATALOGS,
  CUT_TYPES as FALLBACK_CUTS,
  FABRIC_TYPES as FALLBACK_FABRICS
} from '../../data/sublimationProducts';

function SpaciousCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategoryQuery = searchParams.get('category') || '';

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  
  // Single active category & sub-category states
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryQuery || 'Semua'
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [isScrolled, setIsScrolled] = useState(false);

  // Smooth Header Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Accordion States
  const [openSections, setOpenSections] = useState({
    kategori: true,
    potongan: true,
    fabrik: true,
    ukuran: true
  });

  // Modal State
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      try {
        const [fetchedTemplates, fetchedCategories, fetchedCuts, fetchedFabrics, usr] = await Promise.all([
          getDesignTemplates(),
          getCategories(),
          getCutTypes(),
          getFabricTypes(),
          getCurrentUser()
        ]);

        const finalTemplates = Array.isArray(fetchedTemplates) && fetchedTemplates.length > 0 ? fetchedTemplates : DESIGN_TEMPLATES;
        setTemplates(finalTemplates);
        setCategories(fetchedCategories || []);
        setCutTypes(fetchedCuts || FALLBACK_CUTS);
        setFabricTypes(fetchedFabrics || FALLBACK_FABRICS);
        setCurrentUser(usr);
      } catch (err) {
        console.error('Error loading catalog data from Supabase:', err);
        setTemplates(DESIGN_TEMPLATES);
        setCutTypes(FALLBACK_CUTS);
        setFabricTypes(FALLBACK_FABRICS);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllData();
  }, []);

  useEffect(() => {
    if (initialCategoryQuery) {
      setSelectedCategory(initialCategoryQuery);
      setSelectedSubCategory('Semua');
    }
  }, [initialCategoryQuery]);

  // Helper to find sub-categories dynamically from Supabase database categories & templates
  const getSubCategoriesForCategory = (catTitle) => {
    if (!catTitle || catTitle === 'Semua') return [];
    
    // Find category in loaded categories state (from Supabase)
    const catObj = categories.find(
      (c) => (c.title || '').toLowerCase() === catTitle.toLowerCase() ||
             (c.id || '').toLowerCase() === catTitle.toLowerCase() ||
             (c.code || '').toLowerCase() === catTitle.toLowerCase()
    );

    let list = [];
    if (catObj && Array.isArray(catObj.subCategories)) {
      list = catObj.subCategories.filter(s => s !== 'Semua');
    }

    // Also collect any subCategory values from loaded templates for this category
    templates.forEach((t) => {
      const tplCat = (t.category || '').toLowerCase();
      const selCat = catTitle.toLowerCase();
      const isMatch = tplCat === selCat || tplCat.includes(selCat) || selCat.includes(tplCat) ||
                      (selCat === 'olahraga' && tplCat === 'sukan') ||
                      (selCat === 'sukan' && tplCat === 'olahraga');
      if (isMatch && t.subCategory && !list.includes(t.subCategory)) {
        list.push(t.subCategory);
      }
    });

    const uniqueSubs = Array.from(new Set(list)).filter(Boolean);
    uniqueSubs.unshift('Semua');
    return uniqueSubs;
  };

  // Filter Templates
  const filteredTemplates = templates.filter((tpl) => {
    // 1. Main Category filter
    if (selectedCategory && selectedCategory !== 'Semua') {
      const tplCat = (tpl.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();
      const matchesCat = tplCat.includes(selCat) || selCat.includes(tplCat) ||
                         (selCat === 'olahraga' && tplCat === 'sukan') ||
                         (selCat === 'sukan' && tplCat === 'olahraga');
      if (!matchesCat) return false;
    }

    // 2. Sub-Category filter
    if (selectedSubCategory && selectedSubCategory !== 'Semua') {
      const tplSub = (tpl.subCategory || '').toLowerCase();
      const selSub = selectedSubCategory.toLowerCase();
      const matchesSub = tplSub.includes(selSub) || selSub.includes(tplSub);
      if (!matchesSub) return false;
    }

    // 3. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (tpl.name || '').toLowerCase().includes(q) ||
        (tpl.description || '').toLowerCase().includes(q) ||
        (tpl.category || '').toLowerCase().includes(q) ||
        (tpl.subCategory || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    const nameA = a?.name || '';
    const nameB = b?.name || '';
    if (sortBy === 'nama_asc') return nameA.localeCompare(nameB);
    if (sortBy === 'nama_desc') return nameB.localeCompare(nameA);
    return 0;
  });

  const categoryCounts = {};
  templates.forEach((t) => {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });

  const availableCategories = categories.length > 0
    ? categories.map((c) => c.title)
    : Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts)
    : ['Olahraga', 'E-Sport & Gaming', 'Sekolah & Kampus', 'Corporate & Instansi', 'Komunitas & Hobi', 'Fashion & Kasual'];

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col select-none">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#161617] text-[#E8E8ED] text-[11px] font-mono tracking-[0.18em] uppercase py-3 px-6 text-center border-b border-neutral-800 font-medium">
        AYEZZ GLOBAL — KATALOG REKA BENTUK SUBLIMASI CUSTOM 2026
      </div>

      {/* 2. SILKY SMOOTH GLASS NAVBAR (SMOOTH HEIGHT SHRINK & FROSTED GLASS TRANSITION ON SCROLL) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'h-16 bg-white/85 backdrop-blur-md border-b border-neutral-200/80 shadow-xs'
            : 'h-24 bg-white border-b border-neutral-100'
        }`}
      >
        <div className="w-full px-8 sm:px-12 h-full flex items-center justify-between transition-all duration-500">
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ Logo"
              className={`w-auto transition-all duration-500 group-hover:scale-[1.02] ${
                isScrolled ? 'h-5 sm:h-6' : 'h-6 sm:h-7'
              }`}
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111]">
            <Link href="/" className="hover:text-neutral-500 transition-colors">Utama</Link>
            <Link href="/katalog" className="text-[#111111] border-b-2 border-[#111111] pb-1 font-bold">Katalog Desain</Link>
            <Link href="/admin" className="hover:text-neutral-500 transition-colors font-mono text-[10px] text-neutral-400">Admin</Link>
          </nav>

          <div className="flex items-center space-x-5 text-[#111111]">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-4 bg-[#F5F5F7] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-full text-xs font-medium outline-none transition-all duration-500 ${
                  isScrolled ? 'w-40 lg:w-56 py-1.5' : 'w-48 lg:w-64 py-2'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 bg-[#111111] text-white hover:bg-neutral-800 font-bold text-[11px] uppercase tracking-widest rounded-full transition-all flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span className="line-clamp-1 max-w-[100px]">{currentUser.fullName || 'Dashboard'}</span>
              </Link>
            ) : (
              <Link
                href="/login?redirect=/katalog"
                className="px-3.5 py-1.5 bg-[#111111] text-white hover:bg-neutral-800 font-bold text-[11px] uppercase tracking-widest rounded-full transition-all"
              >
                Log Masuk
              </Link>
            )}

            <Link href="/admin" className="hover:text-neutral-600 transition-colors" title="Panel Admin">
              <Settings className="w-4 h-4 text-neutral-500" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. BREADCRUMB & HEADER BAR WITH SPACIOUS PADDING */}
      <div className="w-full px-8 sm:px-12 pt-8 pb-6">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-400 uppercase tracking-[0.15em] mb-4">
          <Link href="/" className="hover:text-[#111111]">UTAMA</Link>
          <span>/</span>
          <span className="font-bold text-[#111111]">
            {selectedCategory === 'Semua' ? 'KATALOG REKA BENTUK' : `KATALOG / ${selectedCategory.toUpperCase()}`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div className="flex items-baseline space-x-3">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#111111]">
              {selectedCategory === 'Semua' ? 'Katalog Desain' : selectedCategory}
            </h1>
            <span className="text-xs font-mono text-neutral-500 font-normal">
              [{sortedTemplates.length} Template]
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase">SUSUN:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#111111] transition-colors"
            >
              <option value="terbaru">Terbaru</option>
              <option value="nama_asc">Nama (A-Z)</option>
              <option value="nama_desc">Nama (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. SPACIOUS 2-COLUMN CATALOG CONTAINER WITH STICKY 2-PANEL NAVIGATION */}
      <div className="w-full px-8 sm:px-12 py-8 flex-1 flex flex-col md:flex-row items-start gap-10 lg:gap-14">
        
        {/* LEFT SIDEBAR PANEL (STICKY 2-PANEL NAVIGATION) */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-6 select-none border-b md:border-b-0 pb-6 md:pb-0 border-neutral-200 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto pr-2 scrollbar-none">
          
          {/* SECTION 1: KATEGORI UTAMA */}
          <div className="border-b border-neutral-200 pb-5">
            <div className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
              <span>KATEGORI UTAMA</span>
            </div>

            <div className="mt-3 space-y-1 text-xs font-medium">
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedSubCategory('Semua');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  selectedCategory === 'Semua'
                    ? 'bg-[#111111] text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#111111]'
                }`}
              >
                <span>Semua Kategori</span>
                <span className="text-[11px] font-mono opacity-80">({templates.length})</span>
              </button>

              {availableCategories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubCategory('Semua');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#111111] text-white font-bold shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#111111]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[11px] font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: SUB KATEGORI (MEMANPUNG SUB-KATEGORI KHAS UNTUK KATEGORI YANG DIPILIH) */}
          {selectedCategory !== 'Semua' && (
            <div className="border-b border-neutral-200 pb-5 animate-fadeIn">
              <div className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
                <span>SUB KATEGORI</span>
              </div>

              <div className="mt-3 space-y-1 text-xs font-medium">
                {getSubCategoriesForCategory(selectedCategory).map((sub) => {
                  const isSubSelected = selectedSubCategory.toLowerCase() === sub.toLowerCase();
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                        isSubSelected
                          ? 'bg-neutral-200 text-[#111111] font-bold'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#111111]'
                      }`}
                    >
                      <span>{sub}</span>
                      {isSubSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RESET BUTTON */}
          {(selectedCategory !== 'Semua' || selectedSubCategory !== 'Semua' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSelectedSubCategory('Semua');
                setSearchQuery('');
              }}
              className="w-full py-2.5 bg-[#F5F5F7] hover:bg-neutral-200 text-[#111111] text-xs font-bold rounded-xl transition-colors"
            >
              Reset Semua Penapis
            </button>
          )}
        </aside>

        {/* RIGHT MAIN PRODUCT GRID */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-neutral-400 font-bold">Memuatkan katalog...</p>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="py-24 text-center bg-[#F5F5F7] rounded-3xl border border-neutral-200 p-10 space-y-4">
              <p className="text-sm font-bold text-[#111111]">Tiada Produk Ditemui</p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedCuts([]);
                  setSelectedFabrics([]);
                  setSelectedSizes([]);
                  setSearchQuery('');
                }}
                className="px-5 py-2 bg-[#111111] text-white rounded-full text-xs font-bold transition-all"
              >
                Reset Penapis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-8">
              {sortedTemplates.map((item, idx) => (
                <InteractiveProductCard
                  key={item.id}
                  item={item}
                  isPriority={idx < 5}
                  onClick={() => setSelectedProduct(item)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* DESIGN PREVIEW MODAL WITH ORDER TOGGLE */}
      {selectedProduct && (
        <ProductPreviewModal
          product={selectedProduct}
          allProducts={sortedTemplates}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(item) => setSelectedProduct(item)}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-[#111111] text-white py-14 px-8 sm:px-12 text-xs border-t border-neutral-800 mt-16">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ Logo"
              className="h-5 w-auto brightness-0 invert opacity-90"
            />
            <span className="font-medium text-neutral-400">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-8 text-neutral-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/katalog" className="hover:text-white transition-colors">Katalog Desain</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Admin</Link>
          </div>
        </div>
      </footer>

      {/* MOBILE APP BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}

export default function FullWidthCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono">
        Memuatkan Katalog...
      </div>
    }>
      <SpaciousCatalogContent />
    </Suspense>
  );
}
