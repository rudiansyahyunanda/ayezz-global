'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpRight
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

export default function LuxuryBrandHomePage() {
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

  // Master Categories List
  const masterCategoryList = useMemo(() => {
    const fromTemplates = templates.map((t) => t.category).filter(Boolean);
    const fromCatalogs = catalogs.map((c) => c.title).filter(Boolean);
    return ['Semua', ...new Set([...fromTemplates, ...fromCatalogs])];
  }, [templates, catalogs]);

  // Dynamic Sub-Categories
  const availableSubCategories = useMemo(() => {
    if (selectedMasterCat === 'Semua') return [];
    
    const matchingTemplates = templates.filter(
      (t) => t.category && t.category.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromTemplates = matchingTemplates.map((t) => t.subCategory).filter(Boolean);
    
    const matchingCatalog = catalogs.find(
      (c) => c.title && c.title.toLowerCase().includes(selectedMasterCat.toLowerCase())
    );
    const subsFromCatalog = matchingCatalog?.subCategories || [];

    const combined = [...new Set([...subsFromTemplates, ...subsFromCatalog])].filter(
      (s) => s && s !== 'Semua' && s !== 'All'
    );

    return combined.length > 0 ? ['Semua', ...combined] : [];
  }, [selectedMasterCat, templates, catalogs]);

  const handleMasterCatSelect = (catTitle) => {
    setSelectedMasterCat(catTitle);
    setSelectedSubCat('Semua');
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (selectedMasterCat !== 'Semua') {
        const matchesMaster = tpl.category && tpl.category.toLowerCase().includes(selectedMasterCat.toLowerCase());
        if (!matchesMaster) return false;
      }

      if (selectedSubCat !== 'Semua') {
        const matchesSub = tpl.subCategory && tpl.subCategory.toLowerCase().includes(selectedSubCat.toLowerCase());
        if (!matchesSub) return false;
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
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#111111] text-white text-[11px] font-mono tracking-widest uppercase py-2 px-4 text-center border-b border-neutral-800">
        AYEZZ GLOBAL — STUDIO KATALOG PAKAIAN SUBLIMASI CUSTOM FULL-PRINT
      </div>

      {/* 2. SOPHISTICATED BRAND NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#111111]">
            <a href="#kategori-visual" className="hover:text-neutral-500 transition-colors">Kategori Utama</a>
            <a href="#katalog-desain" className="hover:text-neutral-500 transition-colors">Katalog Desain</a>
            <Link href="/new" className="hover:text-neutral-500 transition-colors">What's New</Link>
            <Link href="/admin" className="hover:text-neutral-500 transition-colors font-mono text-[11px] text-neutral-400">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setOrderedProduct(featuredProduct);
                setOrderedProductList(templates);
              }}
              className="px-6 py-3 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Tempah Custom</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION */}
      <section className="py-16 px-6 bg-[#F8F8F8] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase block">
              KATALOG NAKAL KUALITI HIGH-PERFORMANCE
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.05] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-neutral-400 font-bold">Pengeluaran Kilang</span>
            </h1>

            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan buat tempahan terus ke WhatsApp.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <a
                href="#kategori-visual"
                className="px-8 py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all inline-flex items-center space-x-3 active:scale-95"
              >
                <span>Lihat Kategori Utama</span>
                <ArrowRight className="w-4 h-4 text-white" />
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

      {/* 4. VISUAL MASTER CATEGORY COVER CARDS GRID (SPECS / PACDORA STYLE) */}
      <section id="kategori-visual" className="py-16 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
            <div>
              <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                KOLEKSI KATEGORI UTAMA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight mt-1">
                Pilih Kategori Produk
              </h2>
            </div>

            <button
              onClick={loadAllData}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors"
              title="Refresh Database"
            >
              <RefreshCw className={`w-4 h-4 text-[#111111] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* VISUAL IMAGE COVER CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogs.map((cat) => {
              const isSelected = selectedMasterCat.toLowerCase() === cat.title?.toLowerCase();
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    handleMasterCatSelect(cat.title);
                    const targetEl = document.getElementById('katalog-desain');
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group cursor-pointer rounded-2xl overflow-hidden relative border transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[#111111] border-[#111111] scale-[1.01]' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {/* 1:1 Aspect Ratio Cover Container */}
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
                    
                    {/* Dark Gradient Overlay for Text Clarity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content Inside Image Card */}
                    <div className="absolute bottom-5 left-5 right-5 z-10 text-white flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 block">
                          {cat.code || 'SUBLIMASI'}
                        </span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-neutral-300 font-mono">
                          {cat.itemCount || 'Desain Tersedia'}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DESIGN TEMPLATES SHOWCASE GRID WITH CLEAN FILTER BAR */}
      <section id="katalog-desain" className="py-16 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                KATALOG REKA BENTUK DESAIN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight mt-0.5">
                {selectedMasterCat === 'Semua' ? 'Semua Katalog Desain' : selectedMasterCat}
                {selectedSubCat !== 'Semua' && <span className="text-neutral-400 font-normal"> — {selectedSubCat}</span>}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F8F8] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-full text-xs font-medium text-[#111111] outline-none transition-all"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 bg-white border border-neutral-200 rounded-md text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#111111] transition-colors"
              >
                <option value="terbaru">Terbaru</option>
                <option value="nama_asc">Nama (A-Z)</option>
                <option value="nama_desc">Nama (Z-A)</option>
              </select>
            </div>
          </div>

          {/* MASTER CATEGORY TAB BAR */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
            {masterCategoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleMasterCatSelect(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  selectedMasterCat === cat
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-[#F8F8F8] text-neutral-600 hover:bg-neutral-200 hover:text-[#111111]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* DYNAMIC SUB-CATEGORY FILTER BAR */}
          {availableSubCategories.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 border-t border-neutral-100 pt-4">
              {availableSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCat(sub)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 border ${
                    selectedSubCat === sub
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-black'
                  }`}
                >
                  {sub === 'Semua' ? `Semua ${selectedMasterCat}` : sub}
                </button>
              ))}
            </div>
          )}

          {/* PRODUCT CARDS SHOWCASE GRID */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-[#111111] animate-spin" />
              <p className="text-xs font-mono text-neutral-400 font-bold">Memuatkan katalog...</p>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="py-20 text-center bg-[#F8F8F8] rounded-2xl p-8 space-y-3 border border-neutral-200">
              <p className="text-sm font-bold text-[#111111]">Tiada Template Ditemui</p>
              <button
                onClick={() => {
                  setSelectedMasterCat('Semua');
                  setSelectedSubCat('Semua');
                  setSearchQuery('');
                }}
                className="px-5 py-2 bg-[#111111] text-white rounded-full text-xs font-bold transition-all"
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
                  className="group cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  {/* Clean Studio Background Container */}
                  <div className="w-full aspect-square bg-[#F5F5F7] overflow-hidden rounded-2xl relative flex items-center justify-center p-2">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      decoding="async"
                      fetchPriority={idx < 4 ? 'high' : 'auto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl img-crisp"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* NEW BADGE */}
                    {idx < 3 && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#111111] text-white text-[9px] font-mono font-bold uppercase rounded-full shadow-xs">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Clean Typography Below Image */}
                  <div className="space-y-1 px-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                      <span>{item.category || 'SUBLIMASI'}</span>
                      {item.subCategory && <span className="text-neutral-500 font-semibold">{item.subCategory}</span>}
                    </div>

                    <h3 className="text-xs font-bold text-[#111111] group-hover:text-neutral-600 transition-colors line-clamp-1 leading-snug">
                      {item.name}
                    </h3>

                    <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#111111]">RM 70.00+ / pcs</span>
                      <span className="text-[11px] font-bold text-neutral-900 group-hover:underline flex items-center space-x-1">
                        <span>Pilih & Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODALS INTEGRATION */}
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
      <footer className="bg-[#111111] text-white py-12 px-6 text-xs border-t border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-medium text-neutral-400">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-neutral-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/new" className="hover:text-white transition-colors">What's New</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
