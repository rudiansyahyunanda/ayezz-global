'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  SlidersHorizontal,
  X,
  RefreshCw,
  Sliders,
  ChevronRight,
  Flame,
  User,
  Heart,
  Settings
} from 'lucide-react';
import ProductOrderModal from '../../components/modals/ProductOrderModal';
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

export default function SpecsStyleCatalogPage() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCuts, setSelectedCuts] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

  // Accordion Expand/Collapse States
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
        console.error('Error loading catalog data:', err);
        setTemplates(DESIGN_TEMPLATES);
        setCutTypes(FALLBACK_CUTS);
        setFabricTypes(FALLBACK_FABRICS);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllData();
  }, []);

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

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    // Category Filter
    if (selectedCategories.length > 0) {
      const matchesCat = selectedCategories.some((cat) =>
        tpl.category?.toLowerCase().includes(cat.toLowerCase())
      );
      if (!matchesCat) return false;
    }

    // Search Filter
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

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'nama_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'nama_desc') return b.name.localeCompare(a.name);
    return 0; // Default terbaru
  });

  // Calculate category counts
  const categoryCounts = {};
  templates.forEach((t) => {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });

  const availableCategories = Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts)
    : ['Olahraga', 'E-Sport & Gaming', 'Sekolah & Kampus', 'Corporate & Instansi', 'Komunitas & Hobi', 'Fashion & Kasual'];

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased flex flex-col select-none">
      {/* 1. TOP ANNOUNCEMENT DISCOUNT BAR */}
      <div className="bg-[#1A1A1A] text-white text-[11px] font-bold tracking-wider uppercase py-2 px-4 text-center border-b border-neutral-800">
        PERCUMA CONSULTATION REKA BENTUK & BEBAS CAS SETUP 100% • KATALOG KATALOG REKA TEMPLATE SUBLIMASI 2026
      </div>

      {/* 2. SPECS-STYLE CLEAN WHITE HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ Logo"
              className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            <Link href="/new" className="text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1 font-black flex items-center space-x-1">
              <span>NEW</span>
            </Link>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">OLAHRAGA</a>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">FUTSAL & BOLA</a>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">E-SPORTS</a>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">SEKOLAH & KAMPUS</a>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">CORPORATE</a>
            <a href="/#katalog" className="hover:text-[#757575] transition-colors">FASHION</a>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-5 text-[#1A1A1A]">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 lg:w-48 pl-8 pr-3 py-1.5 bg-[#F6F5F3] border border-[#E5E5E5] focus:bg-white focus:border-[#1A1A1A] rounded-full text-xs font-medium outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <Link href="/admin" className="hover:text-slate-600 transition-colors" title="Panel Admin">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. BREADCRUMB & PAGE HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 w-full">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#757575] uppercase tracking-wider mb-3">
          <Link href="/" className="hover:text-[#1A1A1A]">HOME</Link>
          <span>/</span>
          <span className="font-extrabold text-[#1A1A1A]">NEW</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-baseline space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1A1A1A]">New</h1>
            <span className="text-xs font-mono text-[#757575] font-normal">
              [{sortedTemplates.length} Katalog Template Tersedia]
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-[#757575] uppercase">SUSUN:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer hover:border-[#1A1A1A] transition-colors"
            >
              <option value="terbaru">Terbaru</option>
              <option value="nama_asc">Nama (A-Z)</option>
              <option value="nama_desc">Nama (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN CATALOG CONTAINER (SIDEBAR + PRODUCT GRID) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col md:flex-row items-start gap-8">
        
        {/* LEFT SIDEBAR FILTERS (SPECS.ID ACCORDION DESIGN) */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 select-none border-b md:border-b-0 pb-6 md:pb-0 border-[#E5E5E5]">
          
          {/* ACCORDION 1: KATEGORI */}
          <div className="border-b border-[#E5E5E5] pb-5">
            <button
              onClick={() => toggleSection('kategori')}
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]"
            >
              <span>KATEGORI</span>
              {openSections.kategori ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.kategori && (
              <div className="mt-3 space-y-2 text-xs font-medium text-[#757575]">
                {availableCategories.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center justify-between cursor-pointer hover:text-[#1A1A1A] transition-colors py-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategoryFilter(cat)}
                          className="w-3.5 h-3.5 accent-[#1A1A1A] rounded cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#1A1A1A]' : ''}>{cat}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACCORDION 2: JENIS POTONGAN / KOLAR */}
          <div className="border-b border-[#E5E5E5] pb-5">
            <button
              onClick={() => toggleSection('potongan')}
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]"
            >
              <span>JENIS POTONGAN / KOLAR</span>
              {openSections.potongan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.potongan && (
              <div className="mt-3 space-y-2 text-xs font-medium text-[#757575]">
                {cutTypes.map((cut) => {
                  const isChecked = selectedCuts.includes(cut.name);
                  return (
                    <label
                      key={cut.id || cut.name}
                      className="flex items-center space-x-2 cursor-pointer hover:text-[#1A1A1A] transition-colors py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCutFilter(cut.name)}
                        className="w-3.5 h-3.5 accent-[#1A1A1A] rounded cursor-pointer"
                      />
                      <span className={isChecked ? 'font-bold text-[#1A1A1A]' : ''}>{cut.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACCORDION 3: JENIS KAIN / FABRIK */}
          <div className="border-b border-[#E5E5E5] pb-5">
            <button
              onClick={() => toggleSection('fabrik')}
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]"
            >
              <span>JENIS KAIN / FABRIK</span>
              {openSections.fabrik ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.fabrik && (
              <div className="mt-3 space-y-2 text-xs font-medium text-[#757575]">
                {fabricTypes.map((fab) => {
                  const isChecked = selectedFabrics.includes(fab.name);
                  return (
                    <label
                      key={fab.id || fab.name}
                      className="flex items-center space-x-2 cursor-pointer hover:text-[#1A1A1A] transition-colors py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFabricFilter(fab.name)}
                        className="w-3.5 h-3.5 accent-[#1A1A1A] rounded cursor-pointer"
                      />
                      <span className={isChecked ? 'font-bold text-[#1A1A1A]' : ''}>{fab.name}</span>
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
              className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]"
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
                      className={`py-2 text-[11px] font-mono font-bold rounded border transition-all ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RESET FILTERS BUTTON */}
          {(selectedCategories.length > 0 || selectedCuts.length > 0 || selectedFabrics.length > 0 || selectedSizes.length > 0 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedCuts([]);
                setSelectedFabrics([]);
                setSelectedSizes([]);
                setSearchQuery('');
              }}
              className="w-full py-2 bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A] text-xs font-bold rounded-md transition-colors"
            >
              Reset Semua Penapis
            </button>
          )}
        </aside>

        {/* RIGHT MAIN CATALOG GRID (SPECS.ID CLEAN 4-COLUMN DESIGN) */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#1A1A1A] animate-spin" />
              <p className="text-xs font-mono text-slate-500 font-bold">Memuatkan katalog produk dari Supabase...</p>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="py-20 text-center bg-[#F8F8F8] rounded-xl border border-[#E5E5E5] p-8 space-y-3">
              <p className="text-sm font-bold text-[#1A1A1A]">Tiada Produk Ditemui</p>
              <p className="text-xs text-[#757575]">Sila padam beberapa kriteria penapis untuk melihat lebih banyak produk katalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemplates.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="group cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  {/* Clean Light-Grey Studio Stage Image Box (Specs.id Style) */}
                  <div className="w-full aspect-square bg-[#F3F3F3] overflow-hidden rounded-sm relative flex items-center justify-center p-3">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      decoding="async"
                      fetchPriority={idx < 4 ? 'high' : 'auto'}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 img-crisp"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Minimalist Specs-Style Typography */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#757575] uppercase tracking-widest block">
                      {item.category || 'AYEZZ SUBLIMATION'}
                    </span>
                    <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-tight group-hover:text-slate-600 transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs font-mono font-normal text-[#757575]">
                      RM 70.00+ / pcs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 5. PRODUCT DETAIL & CUSTOM SPECIFICATION ORDER MODAL */}
      {selectedProduct && (
        <ProductOrderModal
          product={selectedProduct}
          allProducts={sortedTemplates}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(item) => setSelectedProduct(item)}
        />
      )}

      {/* 6. CLEAN FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-10 px-6 text-xs border-t border-neutral-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ Logo"
              className="h-5 w-auto brightness-0 invert opacity-90"
            />
            <span className="font-bold text-slate-300">© 2026 AYEZZ GLOBAL — Studio Katalog Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/new" className="hover:text-white transition-colors">Katalog New</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Panel Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
