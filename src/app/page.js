'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Grid,
  MessageCircle,
  ShoppingBag,
  Database,
  RefreshCw,
  Sparkles,
  Flame,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Eye,
  Tag,
  Boxes
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

export default function HomePage() {
  const [catalogs, setCatalogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);

  // Active States
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [orderedProductList, setOrderedProductList] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
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
      console.warn('Error loading homepage data from Supabase:', err);
      setCatalogs(MAIN_CATALOGS);
      setTemplates(DESIGN_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter templates dynamically
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat =
      selectedCategoryFilter === 'Semua' ||
      (tpl.category && tpl.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      tpl.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryTabList = ['Semua', ...new Set(templates.map((t) => t.category).filter(Boolean))];

  const featuredProduct = templates[0] || {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    thumbnail: '/images/catalog/jersey-olahraga.jfif'
  };

  return (
    <div className="min-h-screen bg-[#F6F5F3] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white flex flex-col font-sans antialiased">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1A1A1A] text-white text-[11px] font-mono font-bold tracking-wider uppercase py-2 px-4 text-center border-b border-neutral-800 flex items-center justify-center space-x-2">
        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>AYEZZ GLOBAL — KILANG PENGLUARAN JERSI SUKAN & SERAGAM CUSTOM • BEBAS REKA BENTUK 100%</span>
      </div>

      {/* 2. SOPHISTICATED BRAND NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
            <span className="text-[10px] font-mono text-[#1A1A1A] font-extrabold tracking-widest uppercase border border-[#E5E5E5] px-2 py-0.5 rounded-full bg-[#F6F5F3]">
              STUDIO SUBLIMASI
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            <a href="#katalog-desain" className="hover:text-[#757575] transition-colors flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Katalog Desain</span>
            </a>
            <Link href="/new" className="hover:text-[#757575] transition-colors flex items-center space-x-1 text-amber-600 font-extrabold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Keluaran Terbaru</span>
            </Link>
            <a href="#kategori-utama" className="hover:text-[#757575] transition-colors">Kategori</a>
            <a href="#teknologi" className="hover:text-[#757575] transition-colors">Teknologi Kilang</a>
            <Link href="/admin" className="hover:text-[#757575] transition-colors flex items-center space-x-1 font-mono text-[11px] text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full bg-slate-50">
              <Database className="w-3.5 h-3.5 text-slate-900" />
              <span>Panel Admin</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setOrderedProduct(featuredProduct);
                setOrderedProductList(templates);
              }}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Pesan Custom Sekarang</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION WITH DYNAMIC CAROUSEL & LIVE STATS */}
      <section className="pt-12 pb-16 px-4 sm:px-6 bg-[#F6F5F3] border-b border-[#E5E5E5] overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-800 rounded-full text-xs font-mono font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Pusat Pengeluaran Sublimasi Full-Print • Standard Industri</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[1.04] uppercase">
              Reka Bentuk Jersi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] via-neutral-700 to-amber-600">
                Paling Menakjubkan
              </span>
            </h1>

            <p className="text-[#555555] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Pilih template jersi daripada katalog eksklusif kami, kustomisasi jenis kolar dan fabrik pilihan anda, dan hantar pesanan terus ke WhatsApp dengan sebut harga automatik.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#katalog-desain"
                className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-3 active:scale-95 shadow-md"
              >
                <span>Pilih Desain Untuk Diorder</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </a>

              <a
                href="https://wa.me/6287818310416"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-2 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>

            {/* Live Stats */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E5E5E5] font-mono text-xs text-[#1A1A1A]">
              <div>
                <p className="font-extrabold uppercase text-[#1A1A1A]">{templates.length}+ DESAIN</p>
                <p className="text-[11px] text-[#757575] font-normal">Sedia Diorder</p>
              </div>
              <div>
                <p className="font-extrabold uppercase text-[#1A1A1A]">100% SUBLIMASI</p>
                <p className="text-[11px] text-[#757575] font-normal">Cetakan HD Sharp</p>
              </div>
              <div>
                <p className="font-extrabold uppercase text-[#1A1A1A]">TANPA MINIMUM</p>
                <p className="text-[11px] text-[#757575] font-normal">Boleh Order 1 Pcs</p>
              </div>
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

      {/* 4. MAIN DESIGN CATALOG SHOWCASE GRID (STANDAR INDUSTRI: JELAJAH DESAIN & ORDER) */}
      <section id="katalog-desain" className="py-16 px-4 sm:px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>// KATALOG REKA BENTUK TERSEDIA</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] uppercase tracking-tight mt-1">
                Pilih Desain Untuk Diorder
              </h2>
              <p className="text-xs text-[#757575] font-normal mt-1">
                Klik mana-mana template di bawah untuk membuka configurator spesifikasi kustom & jumlah saiz.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadAllData}
                className="p-2.5 bg-[#F6F5F3] hover:bg-slate-200 rounded-full transition-all border border-[#E5E5E5]"
                title="Muat Semula Data Supabase"
              >
                <RefreshCw className={`w-4 h-4 text-[#1A1A1A] ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <span className="text-xs font-mono font-bold text-slate-600 bg-[#F6F5F3] px-3.5 py-2 rounded-full border border-[#E5E5E5]">
                {filteredTemplates.length} Template Ditemui
              </span>
            </div>
          </div>

          {/* Filter Pills & Search Bar Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 border-b border-slate-100">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
              {categoryTabList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedCategoryFilter === cat
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-[#F6F5F3] text-[#757575] hover:bg-slate-200 hover:text-[#1A1A1A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F6F5F3] border border-[#E5E5E5] focus:bg-white focus:border-[#1A1A1A] rounded-full text-xs font-bold text-[#1A1A1A] outline-none transition-all"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#1A1A1A] animate-spin" />
              <p className="text-xs font-mono text-slate-500 font-bold">Memuatkan katalog desain dari Supabase...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="py-16 text-center bg-[#F6F5F3] rounded-2xl border border-[#E5E5E5] p-8 space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">Tiada Template Ditemui</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tiada template yang sepadan dengan carian "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryFilter('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-xs font-bold hover:bg-[#333333] transition-all"
              >
                Reset Carian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
              {filteredTemplates.map((item, idx) => {
                const gallery = Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.thumbnail];
                const isNewBadge = idx < 3;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setOrderedProduct(item);
                      setOrderedProductList(filteredTemplates);
                    }}
                    className="brand-card rounded-2xl p-3.5 flex flex-col justify-between space-y-3.5 cursor-pointer group hover:shadow-xl transition-all duration-300 bg-white border border-[#E5E5E5]"
                  >
                    {/* Image Box */}
                    <div className="w-full aspect-square bg-[#F6F5F3] overflow-hidden rounded-xl relative group/img">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        decoding="async"
                        fetchPriority={idx < 4 ? 'high' : 'auto'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg img-crisp"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      {/* BADGES */}
                      {isNewBadge && (
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#1A1A1A] text-white text-[9px] font-extrabold uppercase rounded-full shadow-xs">
                          NEW RELEASE
                        </div>
                      )}

                      {gallery.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#1A1A1A] text-[9px] font-mono font-bold rounded-full border border-slate-200 shadow-xs">
                          {gallery.length} Sudut Foto
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">SUBLIMASI</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-[#1A1A1A] group-hover:text-[#757575] transition-colors leading-snug line-clamp-1 mt-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#757575] font-normal line-clamp-2 mt-1">
                          {item.description || 'Reka bentuk jersi sublimasi cetakan penuh berkualiti tinggi.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">HARGA ASAS</span>
                          <span className="text-xs font-mono font-black text-[#1A1A1A]">RM 70.00+ / pcs</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderedProduct(item);
                            setOrderedProductList(filteredTemplates);
                          }}
                          className="py-2 px-4 bg-[#1A1A1A] group-hover:bg-[#333333] text-white rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pilih & Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. MASTER CATEGORIES SECTION */}
      <section id="kategori-utama" className="py-20 px-4 sm:px-6 bg-[#F6F5F3] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">// KATALOG UTAMA</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mt-1">Kategori Produk Seragam</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogs.map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCatalog(cat)}
                className="group cursor-pointer space-y-3.5"
              >
                <div className="w-full aspect-square bg-neutral-200 overflow-hidden rounded-2xl relative border border-[#E5E5E5]">
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
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="text-[10px] font-mono font-bold uppercase bg-[#111111] text-white px-3 py-1 rounded-full shadow-md">
                      0{idx + 1} // {cat.code}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#111111] uppercase tracking-tight group-hover:text-neutral-600 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-900">RM 70.00+</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-neutral-500 font-mono font-bold">{cat.subCategories?.length - 1 || 0} Jenis</span>
                    <span className="font-extrabold uppercase text-[#111111] group-hover:underline flex items-center space-x-1 text-xs">
                      <span>Lihat Katalog</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FACTORY & TECHNICAL FEATURES SECTION */}
      <section id="teknologi" className="py-20 px-4 sm:px-6 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">// STANDARD KILANG & KUALITI</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Mengapa Memilih AYEZZ GLOBAL?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              Kami memproses pesanan pakaian anda di kilang pengeluaran sendiri dengan teknologi mesin cetakan sublimasi berkelajuan tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase">100% Cetakan Sublimasi HD</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Warna tidak akan pudar, merekah, atau bertukar kusam walaupun dicuci berulang kali.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase">Fabrik High-Performance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menggunakan fabrik Micro-Polyester, Interlock, dan Jacquard dengan keupayaan serapan peluh berteknologi pantas kering.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase">Tanpa Pesanan Minimum</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Boleh menempah dari 1 unit jersi hingga beribu-ribu pakaian seragam untuk kejohanan atau korporat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODALS INTEGRATION */}
      {selectedCatalog && (
        <SubCatalogModal
          catalog={selectedCatalog}
          onClose={() => setSelectedCatalog(null)}
          onSelectProduct={(item, list) => {
            setSelectedCatalog(null);
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

      {/* 8. FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-6 text-xs border-t border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-bold text-slate-300">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400 font-mono text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">Utama</Link>
            <Link href="/new" className="hover:text-white transition-colors">Katalog New</Link>
            <Link href="/admin" className="hover:text-white transition-colors underline">Panel Pentadbir</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
