'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Grid, MessageCircle, ShoppingBag, Database, RefreshCw } from 'lucide-react';
import SubCatalogModal from '../components/modals/SubCatalogModal';
import ProductOrderModal from '../components/modals/ProductOrderModal';
import HeroCarousel from '../components/HeroCarousel';
import {
  getCategories,
  getDesignTemplates
} from '../lib/supabaseService';

export default function HomePage() {
  const [catalogs, setCatalogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [orderedProductList, setOrderedProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, tpls] = await Promise.all([
        getCategories(),
        getDesignTemplates()
      ]);
      setCatalogs(cats);
      setTemplates(tpls);
    } catch (err) {
      console.warn('Error loading storefront data:', err);
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

  return (
    <div className="min-h-screen bg-[#F6F5F3] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-7 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            <a href="#katalog" className="hover:text-[#757575] transition-colors">Katalog</a>
            <a href="#teknologi" className="hover:text-[#757575] transition-colors">Teknologi</a>
            <a href="#mitra" className="hover:text-[#757575] transition-colors">Rakan Kongsi</a>
            <Link href="/admin" className="hover:text-[#757575] transition-colors flex items-center space-x-1 font-mono text-[11px] text-slate-600">
              <Database className="w-3.5 h-3.5" />
              <span>Panel Pentadbir</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setOrderedProduct(featuredProduct)}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Tempah Sekarang</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-16 pb-20 px-6 bg-[#F6F5F3] border-b border-[#E5E5E5] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-mono font-bold tracking-widest text-[#757575] uppercase">
              AYEZZ APPAREL // STUDIO SUBLIMASI
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.05]">
              Jersi Sublimasi <br />
              <span className="text-[#757575] font-semibold">Pakaian Kustom.</span>
            </h1>

            <p className="text-[#555555] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Kilang pengeluaran jersi sukan dan pakaian seragam berkualiti tinggi. Bebas reka bentuk 100%, tanpa pesanan minimum.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#katalog"
                className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-3 active:scale-95 shadow-md"
              >
                <span>Pilih Katalog</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/6287818310416"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E5E5E5] font-mono text-xs text-[#1A1A1A]">
              <div>
                <p className="font-bold uppercase">01 / CETAKAN</p>
                <p className="text-[11px] text-[#757575] font-normal">Sublimasi HD</p>
              </div>
              <div>
                <p className="font-bold uppercase">02 / KAIN</p>
                <p className="text-[11px] text-[#757575] font-normal">Dri-Fit Microdot</p>
              </div>
              <div>
                <p className="font-bold uppercase">03 / PESANAN</p>
                <p className="text-[11px] text-[#757575] font-normal">Tanpa Minimum</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <HeroCarousel onSelectProduct={(item) => setOrderedProduct(item)} />
          </div>
        </div>
      </section>

      {/* CATEGORY GRID (1:1 SQUARE ASPECT RATIO) */}
      <section id="katalog" className="py-24 px-6 bg-[#F6F5F3] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">// KATALOG UTAMA</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mt-1">Kategori Produk</h2>
            </div>

            <button onClick={loadData} className="p-2 bg-white rounded-full shadow-xs border border-[#E5E5E5]">
              <RefreshCw className={`w-4 h-4 text-[#1A1A1A] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

      {/* MODALS */}
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

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-5 w-auto brightness-0 invert opacity-90" />
            <span className="font-bold text-slate-300">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <Link href="/admin" className="text-slate-400 hover:text-white font-mono">
            Panel Pentadbir →
          </Link>
        </div>
      </footer>
    </div>
  );
}
