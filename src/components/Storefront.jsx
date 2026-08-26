import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Grid, MessageCircle, ShoppingBag, Settings, Flame } from 'lucide-react';
import SubCatalogModal from './modals/SubCatalogModal';
import ProductOrderModal from './modals/ProductOrderModal';
import HeroCarousel from './HeroCarousel';
import { MAIN_CATALOGS, BRAND_PARTNERS, APPAREL_MODELS } from '../data/sublimationProducts';

export default function Storefront({ onOpenAdmin }) {
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [orderedProductList, setOrderedProductList] = useState([]);

  // Default featured product for direct order
  const featuredProduct = APPAREL_MODELS[0];

  // Combine all items for "Lihat Semua"
  const allItemsCatalog = {
    id: 'semua_kategori',
    title: 'Semua Katalog Sublimasi',
    subCategories: ['Semua', 'Jersi', 'Polo', 'Hoodie'],
    items: MAIN_CATALOGS.flatMap(cat => cat.items)
  };

  return (
    <div className="min-h-screen bg-[#F6F5F3] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white flex flex-col font-sans">
      {/* 1. SOPHISTICATED LUXURY BRAND NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Mark */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ GLOBAL Logo"
              className="h-7 w-auto"
            />
            <span className="text-[10px] font-mono text-[#1A1A1A] font-bold tracking-widest uppercase border border-[#E5E5E5] px-2 py-0.5 rounded-full bg-[#F6F5F3]">
              GLOBAL
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            <Link href="/new" className="hover:text-[#757575] transition-colors flex items-center space-x-1.5 text-amber-600 font-extrabold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Keluaran Terbaru</span>
            </Link>
            <a href="#katalog" className="hover:text-[#757575] transition-colors">Katalog</a>
            <a href="#teknologi" className="hover:text-[#757575] transition-colors">Teknologi</a>
            <a href="#mitra" className="hover:text-[#757575] transition-colors">Rakan Kongsi</a>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#757575] transition-colors flex items-center space-x-1 font-mono text-[11px]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          {/* Direct Order CTA Button */}
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

      {/* 2. REFINED HIGH-IMPACT HERO SECTION WITH DYNAMIC ROTATING DEPTH ZOOM CAROUSEL */}
      <section className="pt-16 pb-20 px-6 bg-[#F6F5F3] border-b border-[#E5E5E5] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Refined Headline */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-mono font-bold tracking-widest text-[#757575] uppercase">
              AYEZZ APPAREL // KILANG APPAREL HIGH-END
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.05]">
              Jersi Sublimasi <br />
              <span className="text-[#757575] font-semibold">Pakaian Kustom.</span>
            </h1>

            <p className="text-[#555555] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Kilang pengeluaran jersi sukan, esports, dan pakaian seragam komuniti cetakan penuh berpiawaian antarabangsa. Bebas reka bentuk 100%, tanpa pesanan minimum.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('katalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-3 active:scale-95 shadow-md"
              >
                <span>Pilih & Tempah Katalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

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

            {/* Technical Specs Bar */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E5E5E5] font-mono text-xs text-[#1A1A1A]">
              <div>
                <p className="font-bold uppercase">01 / MOQ</p>
                <p className="text-[11px] text-[#757575] font-normal">Tanpa Minimum (1 Helaian)</p>
              </div>
              <div>
                <p className="font-bold uppercase">02 / CETAKAN</p>
                <p className="text-[11px] text-[#757575] font-normal">Sublimasi HD Kalis Luntur</p>
              </div>
              <div>
                <p className="font-bold uppercase">03 / KAIN</p>
                <p className="text-[11px] text-[#757575] font-normal">Dri-Fit Microdot</p>
              </div>
            </div>
          </div>

          {/* Right Column: DYNAMIC 3-CARD ROTATING DEPTH ZOOM CAROUSEL */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <HeroCarousel
              onSelectProduct={(item) => setOrderedProduct(item)}
            />
          </div>

        </div>
      </section>

      {/* 3. REFINED BRAND PILLARS */}
      <section id="teknologi" className="py-20 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#757575] uppercase">// PERTUKANGAN & PIAWAIAN</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mt-1">Piawaian Kualiti Pengeluaran</h2>
            </div>
            <p className="text-xs text-[#757575] max-w-sm">Ketepatan tinggi pada setiap potongan kain dan ketahanan warna sublimasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 bg-[#F6F5F3] rounded-2xl border border-[#E5E5E5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#757575]">01 / MAKMAL CORAK</span>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Pola Potongan Tepat</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-normal">
                Pola baju ergonomik direka khas untuk keselesaan pergerakan fizikal atlet semasa aktiviti tinggi.
              </p>
            </div>

            <div className="p-6 bg-[#F6F5F3] rounded-2xl border border-[#E5E5E5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#757575]">02 / SUBLIMASI</span>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Pigmen Warna HD</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-normal">
                Penyerapan dakwat sublimasi secara langsung ke dalam gentian kain. Warna tajam dan dijamin tidak mengelupas.
              </p>
            </div>

            <div className="p-6 bg-[#F6F5F3] rounded-2xl border border-[#E5E5E5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#757575]">03 / DRI-FIT</span>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Kain Mesra Udara</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-normal">
                Bahan kain Microdot & Milano yang sejuk pada kulit serta menyerap peluh dengan pantas.
              </p>
            </div>

            <div className="p-6 bg-[#F6F5F3] rounded-2xl border border-[#E5E5E5] space-y-3">
              <span className="text-xs font-mono font-bold text-[#757575]">04 / JAMINAN</span>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Jaminan Tepat Masa</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-normal">
                Proses kawalan kualiti berlapis untuk menjamin hasil mengikut spesifikasi dan jadual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NIKE/KITH BRAND APPAREL CATEGORY GRID */}
      <section id="katalog" className="py-24 px-6 bg-[#F6F5F3] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#757575] uppercase">// MATRIKS KATALOG</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mt-1">Kategori Produk</h2>
            </div>

            <button
              onClick={() => setSelectedCatalog(allItemsCatalog)}
              className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#757575] flex items-center space-x-2 font-mono"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* NIKE/KITH CLEAN APPAREL CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {MAIN_CATALOGS.map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCatalog(cat)}
                className="group cursor-pointer space-y-3.5"
              >
                {/* Clean Uncut Photo Container */}
                <div className="w-full aspect-[4/3] bg-neutral-200 overflow-hidden rounded-2xl relative border border-[#E5E5E5]">
                  <img
                    src={cat.thumbnail}
                    alt={cat.title}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 img-crisp"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Clean Top-Left Index Tag */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="text-[10px] font-mono font-bold uppercase bg-[#111111] text-white px-3 py-1 rounded-full shadow-md">
                      0{idx + 1} // {cat.code}
                    </span>
                  </div>
                </div>

                {/* Refined Text & Action Row Underneath */}
                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#111111] uppercase tracking-tight group-hover:text-neutral-600 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-xs font-black text-[#111111]">RM 70.00</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-neutral-500 font-mono font-bold">{cat.itemCount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCatalog(cat);
                      }}
                      className="font-extrabold uppercase text-[#111111] group-hover:underline flex items-center space-x-1 text-xs"
                    >
                      <span>Lihat Katalog</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* End Card: "Lihat Semua" */}
            <div
              onClick={() => setSelectedCatalog(allItemsCatalog)}
              className="bg-[#111111] text-white rounded-2xl p-8 flex flex-col justify-between cursor-pointer hover:bg-neutral-800 transition-colors group aspect-[4/3]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[#757575]">// MATRIKS</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">Semua Katalog Sublimasi</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Terokai seluruh varian jersi bola sepak, futsal, basikal, esports, polo, dan hoodie.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest pt-4 border-t border-neutral-800">
                <span>Terokai Katalog Lengkap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUB-CATALOG EXPLORER MODAL */}
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

      {/* DIRECT PRODUCT ORDER FORM MODAL */}
      {orderedProduct && (
        <ProductOrderModal
          product={orderedProduct}
          allProducts={orderedProductList}
          onClose={() => setOrderedProduct(null)}
          onSelectProduct={(item) => setOrderedProduct(item)}
        />
      )}

      {/* 5. BRAND PARTNERS */}
      <section id="mitra" className="py-16 px-6 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#757575] uppercase">// KEPERCAYAAN KLIEN</span>
            <h3 className="text-sm font-extrabold text-[#1A1A1A] mt-0.5">Dipercayai Oleh 100+ Agensi & Pasukan</h3>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none py-2">
            {BRAND_PARTNERS.map((partner) => (
              <div
                key={partner}
                className="px-5 py-2.5 bg-[#F6F5F3] border border-[#E5E5E5] rounded-xl shrink-0"
              >
                <span className="text-xs font-mono font-bold text-[#1A1A1A]">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REFINED FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo/ayezz-logo-01.svg"
              alt="AYEZZ Logo"
              className="h-5 w-auto brightness-0 invert opacity-90"
            />
            <span className="font-bold text-slate-300">© 2026 AYEZZ GLOBAL — Studio Pakaian Sublimasi</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400 font-mono text-[11px]">
            <a href="#katalog" className="hover:text-white transition-colors">Katalog</a>
            <a href="#teknologi" className="hover:text-white transition-colors">Teknologi</a>
            <a href="#mitra" className="hover:text-white transition-colors">Rakan Kongsi</a>
            {onOpenAdmin && (
              <button onClick={onOpenAdmin} className="hover:text-white transition-colors underline">
                Panel Admin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
