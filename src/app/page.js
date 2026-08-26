'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Flame,
  ArrowRight,
  Database,
  SlidersHorizontal,
  ChevronRight,
  X
} from 'lucide-react';
import SubCatalogModal from '../components/modals/SubCatalogModal';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import {
  getCategories,
  getDesignTemplates,
  getCutTypes,
  getFabricTypes
} from '../lib/supabaseService';
import { DESIGN_TEMPLATES, MAIN_CATALOGS } from '../data/sublimationProducts';

export default function CleanHomePage() {
  const [catalogs, setCatalogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);

  // Relational Category & Sub-Category Filter States
  const [selectedMasterCat, setSelectedMasterCat] = useState('Semua');
  const [selectedSubCat, setSelectedSubCat] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedCatalogModal, setSelectedCatalogModal] = useState(null);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [orderedProductList, setOrderedProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [cats, tpls, cuts, fabrics] = await Promise.all([
        getCategories(),
        getDesignTemplates(),
        getCutTypes(),
        getFabricTypes()
      ]);
      setCatalogs(Array.isArray(cats) && cats.length > 0 ? cats : MAIN_CATALOGS);
      setTemplates(Array.isArray(tpls) && tpls.length > 0 ? tpls : DESIGN_TEMPLATES);
      setCutTypes(cuts || []);
      setFabricTypes(fabrics || []);
    } catch (err) {
      console.warn('Error loading data:', err);
      setCatalogs(MAIN_CATALOGS);
      setTemplates(DESIGN_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Calculate Master Categories
  const masterCategoryList = ['Semua', ...new Set(templates.map((t) => t.category).filter(Boolean))];

  // Calculate Available Sub-Categories for Selected Master Category
  const availableSubCategories = React.useMemo(() => {
    if (selectedMasterCat === 'Semua') return [];
    
    // Find matching templates for this master category
    const matchingTemplates = templates.filter(
      (t) => t.category && t.category.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromTemplates = matchingTemplates.map((t) => t.subCategory).filter(Boolean);
    
    // Also check catalogs array for subCategories
    const matchingCatalog = catalogs.find(
      (c) => c.title && c.title.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromCatalog = matchingCatalog?.subCategories || [];

    const combined = [...new Set([...subsFromTemplates, ...subsFromCatalog])].filter(
      (s) => s !== 'Semua' && s !== 'All'
    );

    return combined.length > 0 ? ['Semua', ...combined] : [];
  }, [selectedMasterCat, templates, catalogs]);

  // Handle Master Category Change
  const handleMasterCatSelect = (cat) => {
    setSelectedMasterCat(cat);
    setSelectedSubCat('Semua'); // Reset sub-category filter when master category changes
  };

  // Filter templates dynamically by Master Category + Sub Category + Search Query
  const filteredTemplates = templates.filter((tpl) => {
    // 1. Master Category Filter
    if (selectedMasterCat !== 'Semua') {
      const matchesMaster = tpl.category && tpl.category.toLowerCase().includes(selectedMasterCat.toLowerCase());
      if (!matchesMaster) return false;
    }

    // 2. Sub Category Filter
    if (selectedSubCat !== 'Semua') {
      const matchesSub = tpl.subCategory && tpl.subCategory.toLowerCase().includes(selectedSubCat.toLowerCase());
      if (!matchesSub) return false;
    }

    // 3. Search Query
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

  const featuredProduct = templates[0] || {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    thumbnail: '/images/catalog/jersey-olahraga.jfif'
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white flex flex-col">
      {/* 1. TOP MINIMALIST ANNOUNCEMENT LINE */}
      <div className="bg-[#111111] text-white text-[11px] font-mono font-medium tracking-widest uppercase py-2 px-4 text-center flex items-center justify-center space-x-2">
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>AYEZZ GLOBAL — KATALOG SUBLIMASI CUSTOM FULL-PRINT • TANPA MINIMUM PESANAN</span>
      </div>

      {/* 2. ULTRA-CLEAN FRAMELESS HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-7 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#111111]">
            <a href="#katalog-desain" className="hover:text-slate-500 transition-colors">Katalog Desain</a>
            <Link href="/new" className="hover:text-slate-500 transition-colors flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>What's New</span>
            </Link>
            <a href="#kategori-master" className="hover:text-slate-500 transition-colors">Kategori</a>
            <Link href="/admin" className="hover:text-slate-500 transition-colors font-mono text-[11px] text-slate-500">
              [Panel Admin]
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setOrderedProduct(featuredProduct);
                setOrderedProductList(templates);
              }}
              className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Order Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE (CLEAN MINIMALIST LIGHT DESIGN) */}
      <section className="py-12 px-6 bg-[#FAFAFA] border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
              // STUDIO KATALOG SUBLIMASI 2026
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-[1.08] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-slate-400 font-bold">Kualiti Pengeluaran Kilang</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              Pilih katalog desain di bawah mengikut Kategori & Sub-Kategori pilihan anda. Kustomisasikan potongan kolar, jenis fabrik, dan jumlah saiz secara langsung.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#katalog-desain"
                className="px-7 py-3.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-2 active:scale-95 shadow-xs"
              >
                <span>Pilih Desain Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <HeroCarousel
              onSelectProduct={(item) => {
                setOrderedProduct(item);
                setOrderedProductList(templates);
              }}
            />
          </div>
        </div>
      </section>

      {/* 4. CLEAN FUNCTIONAL FILTER SYSTEM: MASTER CATEGORY + SUB-CATEGORY */}
      <section id="katalog-desain" className="py-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                // KATALOG DESAIN REKA BENTUK
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight mt-0.5">
                {selectedMasterCat === 'Semua' ? 'Semua Katalog Desain' : `Kategori: ${selectedMasterCat}`}
                {selectedSubCat !== 'Semua' && <span className="text-slate-400 font-normal text-lg"> ({selectedSubCat})</span>}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#111111] rounded-full text-xs font-medium text-[#111111] outline-none transition-all"
                />
              </div>

              <button
                onClick={loadAllData}
                className="p-2 bg-[#FAFAFA] hover:bg-slate-200 rounded-full border border-slate-200 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#111111] ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* LEVEL 1: MASTER CATEGORY FILTER TABS */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              1. PILIH KATEGORI UTAMA:
            </span>
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
              {masterCategoryList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleMasterCatSelect(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedMasterCat === cat
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-[#FAFAFA] text-slate-600 hover:bg-slate-200 hover:text-[#111111] border border-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL 2: DYNAMIC SUB-CATEGORY FILTER BAR (ONLY WHEN MASTER CATEGORY SELECTED) */}
          {availableSubCategories.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                2. PENAPIS SUB-KATEGORI ({selectedMasterCat.toUpperCase()}):
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
                {availableSubCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCat(sub)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 border ${
                      selectedSubCat === sub
                        ? 'bg-amber-400 text-black border-amber-400 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-black'
                    }`}
                  >
                    {sub === 'Semua' ? `Semua Sub-Kategori ${selectedMasterCat}` : sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE FILTER SUMMARY BADGES */}
          {(selectedMasterCat !== 'Semua' || selectedSubCat !== 'Semua' || searchQuery) && (
            <div className="flex items-center space-x-2 pt-2 text-xs">
              <span className="text-[11px] font-mono text-slate-400">Penapis Aktif:</span>
              {selectedMasterCat !== 'Semua' && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full font-mono text-[10px] font-bold">
                  {selectedMasterCat}
                </span>
              )}
              {selectedSubCat !== 'Semua' && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono text-[10px] font-bold">
                  Sub: {selectedSubCat}
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full font-mono text-[10px] font-bold">
                  Carian: "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedMasterCat('Semua');
                  setSelectedSubCat('Semua');
                  setSearchQuery('');
                }}
                className="text-[11px] font-mono text-slate-500 underline hover:text-black ml-2"
              >
                Reset Semua
              </button>
            </div>
          )}

          {/* 5. ULTRA-CLEAN FRAMELESS PRODUCT GRID */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-slate-400 font-bold">Memuatkan katalog...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="py-16 text-center bg-[#FAFAFA] rounded-xl border border-slate-100 p-8 space-y-3">
              <p className="text-sm font-bold text-[#111111]">Tiada Template Ditemui</p>
              <p className="text-xs text-slate-500">
                Tiada template yang sepadan dengan penapis "{selectedMasterCat}" / "{selectedSubCat}".
              </p>
              <button
                onClick={() => {
                  setSelectedMasterCat('Semua');
                  setSelectedSubCat('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#111111] text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Reset Penapis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pt-4">
              {filteredTemplates.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setOrderedProduct(item);
                    setOrderedProductList(filteredTemplates);
                  }}
                  className="group cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  {/* Clean Light-Grey Studio Stage Container (No Heavy Frames) */}
                  <div className="w-full aspect-square bg-[#F5F5F7] overflow-hidden rounded-xl relative flex items-center justify-center">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      decoding="async"
                      fetchPriority={idx < 4 ? 'high' : 'auto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 img-crisp"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* NEW TAG BADGE */}
                    {idx < 3 && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 bg-[#111111] text-white text-[9px] font-mono font-bold uppercase rounded-full">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Clean Minimalist Typography */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <span>{item.category || 'SUBLIMASI'}</span>
                      {item.subCategory && <span className="text-slate-600 font-semibold">{item.subCategory}</span>}
                    </div>

                    <h3 className="text-xs font-bold text-[#111111] group-hover:text-slate-600 transition-colors line-clamp-1 leading-tight">
                      {item.name}
                    </h3>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#111111]">RM 70.00+</span>
                      <span className="text-[11px] font-bold text-slate-900 group-hover:underline flex items-center space-x-1">
                        <span>Pilih</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. MASTER CATEGORIES REFERENCE GRID */}
      <section id="kategori-master" className="py-16 px-6 bg-[#FAFAFA] border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              // KATEGORI UTAMA SUBLIMASI
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight mt-0.5">
              Jelajah Mengikut Kategori Utama
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogs.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedMasterCat(cat.title);
                  setSelectedSubCat('Semua');
                  const targetEl = document.getElementById('katalog-desain');
                  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer space-y-3"
              >
                <div className="w-full aspect-square bg-slate-200 overflow-hidden rounded-xl relative">
                  <img
                    src={cat.thumbnail}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 img-crisp"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-tight group-hover:text-slate-600 transition-colors">
                    {cat.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{cat.subCategories?.length - 1 || 0} Sub-Kategori</span>
                    <span className="font-bold text-[#111111] group-hover:underline">Filter Desain →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALS */}
      {selectedCatalogModal && (
        <SubCatalogModal
          catalog={selectedCatalogModal}
          onClose={() => setSelectedCatalogModal(null)}
          onSelectProduct={(item, list) => {
            setSelectedCatalogModal(null);
            setOrderedProduct(item);
            setOrderedProductList(list || []);
          }}
        />
      )}

      {orderedProduct && (
        <ProductOrderModal
          product={orderedProduct}
          allProducts={orderedProductList.length > 0 ? orderedProductList : templates}
          onClose={() => setOrderedProduct(null)}
          onSelectProduct={(item) => setOrderedProduct(item)}
        />
      )}

      {/* CLEAN FOOTER */}
      <footer className="bg-[#111111] text-white py-10 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-medium text-slate-400">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/new" className="hover:text-white transition-colors">What's New</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Panel Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
