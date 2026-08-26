'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Database,
  SlidersHorizontal,
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

export default function RombakTotalHomePage() {
  const [catalogs, setCatalogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);

  // Category & Sub-Category Selection States
  const [selectedMasterCat, setSelectedMasterCat] = useState('Semua');
  const [selectedSubCat, setSelectedSubCat] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

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

  // 1. MASTER CATEGORIES LIST (FROM SUPABASE & CATALOGS)
  const masterCategoryList = useMemo(() => {
    const fromTemplates = templates.map((t) => t.category).filter(Boolean);
    const fromCatalogs = catalogs.map((c) => c.title).filter(Boolean);
    return ['Semua', ...new Set([...fromTemplates, ...fromCatalogs])];
  }, [templates, catalogs]);

  // 2. DYNAMIC SUB-CATEGORIES FOR SELECTED MASTER CATEGORY
  const availableSubCategories = useMemo(() => {
    if (selectedMasterCat === 'Semua') return [];
    
    // Find matching templates for this master category
    const matchingTemplates = templates.filter(
      (t) => t.category && t.category.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromTemplates = matchingTemplates.map((t) => t.subCategory).filter(Boolean);
    
    // Check matching master catalog
    const matchingCatalog = catalogs.find(
      (c) => c.title && c.title.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromCatalog = matchingCatalog?.subCategories || [];

    const combined = [...new Set([...subsFromTemplates, ...subsFromCatalog])].filter(
      (s) => s && s !== 'Semua' && s !== 'All'
    );

    return combined.length > 0 ? ['Semua', ...combined] : [];
  }, [selectedMasterCat, templates, catalogs]);

  // Handle Master Category Change
  const handleMasterCatSelect = (catTitle) => {
    setSelectedMasterCat(catTitle);
    setSelectedSubCat('Semua');
  };

  // 3. FILTER TEMPLATES DYNAMICALLY
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Filter Master Category
      if (selectedMasterCat !== 'Semua') {
        const matchesMaster = tpl.category && tpl.category.toLowerCase().includes(selectedMasterCat.toLowerCase());
        if (!matchesMaster) return false;
      }

      // Filter Sub Category
      if (selectedSubCat !== 'Semua') {
        const matchesSub = tpl.subCategory && tpl.subCategory.toLowerCase().includes(selectedSubCat.toLowerCase());
        if (!matchesSub) return false;
      }

      // Filter Search Query
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
  }, [templates, selectedMasterCat, selectedSubCat, searchQuery]);

  // Sort Templates
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      if (sortBy === 'nama_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'nama_desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [filteredTemplates, sortBy]);

  const featuredProduct = templates[0] || {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    thumbnail: '/images/catalog/jersey-olahraga.jfif'
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white flex flex-col">
      {/* 1. TOP ANNOUNCEMENT LINE */}
      <div className="bg-[#111111] text-white text-[11px] font-mono tracking-widest uppercase py-2 px-4 text-center">
        AYEZZ GLOBAL — KATALOG REKA TEMPLATE SUBLIMASI CUSTOM FULL-PRINT
      </div>

      {/* 2. MINIMALIST BRAND NAVBAR */}
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
            <a href="#kategori-step" className="hover:text-slate-500 transition-colors">1. Kategori</a>
            <a href="#katalog-desain-step" className="hover:text-slate-500 transition-colors">2. Katalog Desain</a>
            <Link href="/admin" className="hover:text-slate-500 transition-colors font-mono text-[11px] text-slate-400">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setOrderedProduct(featuredProduct);
                setOrderedProductList(templates);
              }}
              className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all active:scale-95 flex items-center space-x-2"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Order Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION */}
      <section className="py-14 px-6 bg-[#FAFAFA] border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
              STUDIO SUBLIMASI 2026
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-tight uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-slate-400 font-bold">Pakaian Custom</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              Pilih Kategori & Sub-Kategori pilihan anda, jelajah katalog desain, dan kustomisasikan spesifikasi potongan kolar, jenis fabrik, serta jumlah saiz secara langsung.
            </p>

            <div className="pt-2">
              <a
                href="#kategori-step"
                className="px-7 py-3.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-2 active:scale-95"
              >
                <span>Mula Pilih Kategori</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
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

      {/* 4. STEP 1: PILIH KATEGORI UTAMA & SUB-KATEGORI (100% SUPABASE INTEGRATED) */}
      <section id="kategori-step" className="py-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                LANGKAH 1
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
                Pilih Kategori Utama
              </h2>
            </div>

            <button
              onClick={loadAllData}
              className="p-2 bg-[#FAFAFA] hover:bg-slate-200 rounded-full border border-slate-200 transition-colors self-start md:self-auto"
              title="Refresh Data Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#111111] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* MASTER CATEGORY GRID CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {masterCategoryList.map((catTitle) => {
              const isSelected = selectedMasterCat === catTitle;
              const matchingCatObj = catalogs.find((c) => c.title?.toLowerCase() === catTitle.toLowerCase());
              
              return (
                <button
                  key={catTitle}
                  onClick={() => {
                    handleMasterCatSelect(catTitle);
                    const el = document.getElementById('katalog-desain-step');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs scale-[1.02]'
                      : 'bg-[#FAFAFA] text-[#111111] border-slate-200 hover:border-[#111111] hover:bg-white'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                    {matchingCatObj?.code || 'CAT'}
                  </span>
                  <span className="text-xs font-black uppercase tracking-tight line-clamp-1">
                    {catTitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STEP 1B: DYNAMIC SUB-CATEGORY FILTER BAR */}
          {availableSubCategories.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                PILIH SUB-KATEGORI ({selectedMasterCat.toUpperCase()}):
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
                {availableSubCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCat(sub)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 border ${
                      selectedSubCat === sub
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-black'
                    }`}
                  >
                    {sub === 'Semua' ? `Semua ${selectedMasterCat}` : sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. STEP 2: KATALOG REKA BENTUK (DESAIN GRID) */}
      <section id="katalog-desain-step" className="py-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                LANGKAH 2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
                Katalog Desain {selectedMasterCat !== 'Semua' ? `— ${selectedMasterCat}` : ''}
                {selectedSubCat !== 'Semua' && <span className="text-slate-400 font-normal"> ({selectedSubCat})</span>}
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

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#111111] transition-colors"
              >
                <option value="terbaru">Terbaru</option>
                <option value="nama_asc">Nama (A-Z)</option>
                <option value="nama_desc">Nama (Z-A)</option>
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER SUMMARY */}
          {(selectedMasterCat !== 'Semua' || selectedSubCat !== 'Semua' || searchQuery) && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[11px] font-mono text-slate-400">Penapis:</span>
              {selectedMasterCat !== 'Semua' && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full font-mono text-[10px] font-bold">
                  {selectedMasterCat}
                </span>
              )}
              {selectedSubCat !== 'Semua' && (
                <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-full font-mono text-[10px] font-bold">
                  Sub: {selectedSubCat}
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full font-mono text-[10px] font-bold">
                  "{searchQuery}"
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
                Reset
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-slate-400">Memuatkan data dari Supabase...</p>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="py-16 text-center bg-[#FAFAFA] rounded-xl p-8 space-y-3">
              <p className="text-sm font-bold text-[#111111]">Tiada Template Ditemui</p>
              <button
                onClick={() => {
                  setSelectedMasterCat('Semua');
                  setSelectedSubCat('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#111111] text-white rounded-full text-xs font-bold transition-all"
              >
                Reset Penapis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pt-2">
              {sortedTemplates.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setOrderedProduct(item);
                    setOrderedProductList(sortedTemplates);
                  }}
                  className="group cursor-pointer space-y-2.5 flex flex-col justify-between"
                >
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
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <span>{item.category || 'SUBLIMASI'}</span>
                      {item.subCategory && <span className="text-slate-500 font-semibold">{item.subCategory}</span>}
                    </div>

                    <h3 className="text-xs font-bold text-[#111111] group-hover:text-slate-600 transition-colors line-clamp-1 leading-tight">
                      {item.name}
                    </h3>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#111111]">RM 70.00+</span>
                      <span className="text-[11px] font-bold text-slate-900 group-hover:underline flex items-center space-x-0.5">
                        <span>Pilih & Order</span>
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
            <Link href="/admin" className="hover:text-white transition-colors underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
