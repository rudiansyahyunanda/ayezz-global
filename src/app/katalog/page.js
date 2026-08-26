'use client';

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
  SlidersHorizontal
} from 'lucide-react';
import InteractiveProductCard from '../../components/InteractiveProductCard';
import ProductPreviewModal from '../../components/modals/ProductPreviewModal';
import {
  getDesignTemplates,
  getCategories,
  getCutTypes,
  getFabricTypes
} from '../../lib/supabaseService';
import {
  DESIGN_TEMPLATES,
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
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategoryQuery ? [initialCategoryQuery] : []
  );
  const [selectedCuts, setSelectedCuts] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      try {
        const [fetchedTemplates, fetchedCategories, fetchedCuts, fetchedFabrics] = await Promise.all([
          getDesignTemplates(),
          getCategories(),
          getCutTypes(),
          getFabricTypes()
        ]);

        const finalTemplates = Array.isArray(fetchedTemplates) && fetchedTemplates.length > 0 ? fetchedTemplates : DESIGN_TEMPLATES;
        setTemplates(finalTemplates);
        setCategories(fetchedCategories || []);
        setCutTypes(fetchedCuts || FALLBACK_CUTS);
        setFabricTypes(fetchedFabrics || FALLBACK_FABRICS);
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
      setSelectedCategories([initialCategoryQuery]);
    }
  }, [initialCategoryQuery]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategoryFilter = (catTitle) => {
    setSelectedCategories((prev) =>
      prev.includes(catTitle) ? prev.filter((c) => c !== catTitle) : [...prev, catTitle]
    );
  };

  const toggleCutFilter = (cutName) => {
    setSelectedCuts((prev) =>
      prev.includes(cutName) ? prev.filter((c) => c !== cutName) : [...prev, cutName]
    );
  };

  const toggleFabricFilter = (fabName) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabName) ? prev.filter((f) => f !== fabName) : [...prev, fabName]
    );
  };

  const toggleSizeFilter = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Filter Templates
  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategories.length > 0) {
      const matchesCat = selectedCategories.some((cat) =>
        tpl.category?.toLowerCase().includes(cat.toLowerCase())
      );
      if (!matchesCat) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tpl.name?.toLowerCase().includes(q) ||
        tpl.description?.toLowerCase().includes(q) ||
        tpl.category?.toLowerCase().includes(q) ||
        tpl.subCategory?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'nama_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'nama_desc') return b.name.localeCompare(a.name);
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
          <span className="font-bold text-[#111111]">KATALOG REKA BENTUK</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div className="flex items-baseline space-x-3">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#111111]">Katalog Desain</h1>
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

      {/* 4. SPACIOUS 2-COLUMN CATALOG CONTAINER */}
      <div className="w-full px-8 sm:px-12 py-8 flex-1 flex flex-col md:flex-row items-start gap-12">
        
        {/* LEFT SIDEBAR ACCORDION FILTERS */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 select-none border-b md:border-b-0 pb-6 md:pb-0 border-neutral-200">
          
          {/* ACCORDION 1: KATEGORI UTAMA */}
          <div className="border-b border-neutral-200 pb-5">
            <button
              onClick={() => toggleSection('kategori')}
              className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]"
            >
              <span>KATEGORI UTAMA</span>
              {openSections.kategori ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.kategori && (
              <div className="mt-3 space-y-2 text-xs font-medium text-neutral-600">
                {availableCategories.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center justify-between cursor-pointer hover:text-[#111111] transition-colors py-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategoryFilter(cat)}
                          className="w-3.5 h-3.5 accent-[#111111] rounded cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#111111]' : ''}>{cat}</span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACCORDION 2: JENIS POTONGAN / KOLAR */}
          <div className="border-b border-neutral-200 pb-5">
            <button
              onClick={() => toggleSection('potongan')}
              className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]"
            >
              <span>JENIS POTONGAN / KOLAR</span>
              {openSections.potongan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.potongan && (
              <div className="mt-3 space-y-2 text-xs font-medium text-neutral-600">
                {cutTypes.map((cut) => {
                  const isChecked = selectedCuts.includes(cut.name);
                  return (
                    <label
                      key={cut.id || cut.name}
                      className="flex items-center space-x-2 cursor-pointer hover:text-[#111111] transition-colors py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCutFilter(cut.name)}
                        className="w-3.5 h-3.5 accent-[#111111] rounded cursor-pointer"
                      />
                      <span className={isChecked ? 'font-bold text-[#111111]' : ''}>{cut.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACCORDION 3: JENIS KAIN / FABRIK */}
          <div className="border-b border-neutral-200 pb-5">
            <button
              onClick={() => toggleSection('fabrik')}
              className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]"
            >
              <span>JENIS KAIN / FABRIK</span>
              {openSections.fabrik ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.fabrik && (
              <div className="mt-3 space-y-2 text-xs font-medium text-neutral-600">
                {fabricTypes.map((fab) => {
                  const isChecked = selectedFabrics.includes(fab.name);
                  return (
                    <label
                      key={fab.id || fab.name}
                      className="flex items-center space-x-2 cursor-pointer hover:text-[#111111] transition-colors py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFabricFilter(fab.name)}
                        className="w-3.5 h-3.5 accent-[#111111] rounded cursor-pointer"
                      />
                      <span className={isChecked ? 'font-bold text-[#111111]' : ''}>{fab.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACCORDION 4: UKURAN SAIZ */}
          <div className="pb-5">
            <button
              onClick={() => toggleSection('ukuran')}
              className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#111111]"
            >
              <span>UKURAN SAIZ</span>
              {openSections.ukuran ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.ukuran && (
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {sizesList.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSizeFilter(sz)}
                      className={`py-2 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#111111] border-neutral-200 hover:border-[#111111]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {(selectedCategories.length > 0 || selectedCuts.length > 0 || selectedFabrics.length > 0 || selectedSizes.length > 0 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedCuts([]);
                setSelectedFabrics([]);
                setSelectedSizes([]);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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
