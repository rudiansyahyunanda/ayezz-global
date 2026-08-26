'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Send,
  ArrowRight
} from 'lucide-react';
import TransparentImage from '../TransparentImage';
import {
  getCutTypes,
  getFabricTypes,
  saveOrderToSupabase
} from '../../lib/supabaseService';
import {
  CUT_TYPES as FALLBACK_CUTS,
  FABRIC_TYPES as FALLBACK_FABRICS
} from '../../data/sublimationProducts';

export default function ProductPreviewModal({ product, allProducts, onClose, onSelectProduct }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'order'
  
  // Gallery images
  const galleryImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : (product?.thumbnail ? [product.thumbnail] : ['/images/catalog/jersey-olahraga.jfif']);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Mouse Cursor Targeted Magnifier Zoom State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isZoomed: false });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y, isZoomed: true });
  };

  const handleMouseLeave = () => {
    setZoomPos({ x: 50, y: 50, isZoomed: false });
  };

  // DB Data for Order Mode
  const [cutTypes, setCutTypes] = useState(FALLBACK_CUTS);
  const [fabricTypes, setFabricTypes] = useState(FALLBACK_FABRICS);
  
  const [selectedCut, setSelectedCut] = useState(FALLBACK_CUTS[0]);
  const [selectedFabric, setSelectedFabric] = useState(FALLBACK_FABRICS[0]);
  
  const [sizeQuantities, setSizeQuantities] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 0,
    '3XL': 0
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    teamName: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    async function loadConfigData() {
      const [cuts, fabrics] = await Promise.all([
        getCutTypes(),
        getFabricTypes()
      ]);
      if (cuts && cuts.length > 0) {
        setCutTypes(cuts);
        setSelectedCut(cuts[0]);
      }
      if (fabrics && fabrics.length > 0) {
        setFabricTypes(fabrics);
        setSelectedFabric(fabrics[0]);
      }
    }
    loadConfigData();
  }, []);

  // Card Switcher (Next / Prev template)
  const currentIndex = (allProducts || []).findIndex((p) => p.id === product?.id);

  const handlePrevProduct = () => {
    if (!allProducts || allProducts.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allProducts.length) % allProducts.length;
    onSelectProduct(allProducts[prevIdx]);
    setSelectedImgIdx(0);
    setViewMode('preview');
  };

  const handleNextProduct = () => {
    if (!allProducts || allProducts.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allProducts.length;
    onSelectProduct(allProducts[nextIdx]);
    setSelectedImgIdx(0);
    setViewMode('preview');
  };

  // Size matrix counter
  const updateSizeQty = (sz, delta) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sz]: Math.max(0, (prev[sz] || 0) + delta)
    }));
  };

  const totalQuantity = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const basePricePerPcs = Number(selectedFabric?.basePrice ?? selectedFabric?.base_price ?? 70);
  const cutAddOn = Number(selectedCut?.addOnPrice ?? selectedCut?.add_on_price ?? 0);
  const pricePerPcs = basePricePerPcs + cutAddOn;
  const totalPrice = totalQuantity * pricePerPcs;

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    if (totalQuantity <= 0) {
      alert('Sila masukkan sekurang-kurangnya 1 saiz kuantiti pesanan.');
      return;
    }

    setIsSubmitting(true);

    const sizeSummary = Object.entries(sizeQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([sz, qty]) => `${sz}: ${qty} pcs`)
      .join(', ');

    const orderPayload = {
      product_name: product.name,
      category: product.category || 'SUBLIMASI',
      sub_category: product.subCategory || '',
      collar_cut: selectedCut.name,
      fabric_type: selectedFabric.name,
      size_breakdown: sizeQuantities,
      total_qty: totalQuantity,
      price_per_pcs: pricePerPcs,
      total_price: totalPrice,
      customer_name: customerInfo.name || 'Pelanggan Web',
      customer_phone: customerInfo.phone || '',
      team_name: customerInfo.teamName || '-',
      notes: customerInfo.notes || '',
      status: 'pending'
    };

    try {
      await saveOrderToSupabase(orderPayload);
    } catch (err) {
      console.warn('Error saving order:', err);
    }

    const waText = `Salam Admin AYEZZ GLOBAL! Saya ingin membuat pesanan custom jersi:

📌 *PRODUCT:* ${product.name}
🏷️ *KATEGORI:* ${product.category || 'SUBLIMASI'} (${product.subCategory || '-'})
✂️ *JENIS KOLAR:* ${selectedCut.name} (+RM ${cutAddOn})
🧵 *FABRIK:* ${selectedFabric.name} (RM ${basePricePerPcs}/pcs)
📊 *PECAHAN SAIZ:* ${sizeSummary}
📦 *JUMLAH KUANTITI:* ${totalQuantity} pcs
💰 *ANGGARAN HARGA:* RM ${totalPrice.toFixed(2)} (RM ${pricePerPcs}/pcs)

👤 *NAMA:* ${customerInfo.name || '-'}
🏢 *PASUKAN/SAMPEL:* ${customerInfo.teamName || '-'}
📞 *NO TEL:* ${customerInfo.phone || '-'}
📝 *NOTA:* ${customerInfo.notes || '-'}`;

    const waUrl = `https://wa.me/601112345678?text=${encodeURIComponent(waText)}`;
    setIsSubmitting(false);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-white text-[#111111] rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col my-auto border border-neutral-100">
        
        {/* HEADER BAR MODAL */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-neutral-100 rounded-full text-neutral-600">
              {product.category || 'SUBLIMASI'}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#111111] uppercase tracking-tight line-clamp-1">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* TOGGLE BUTTON PREVIEW VS ORDER */}
            <button
              onClick={() => setViewMode(viewMode === 'preview' ? 'order' : 'preview')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
                viewMode === 'preview'
                  ? 'bg-[#111111] text-white hover:bg-neutral-800 shadow-sm'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
              }`}
            >
              {viewMode === 'preview' ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Tempah Desain Ini →</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>← Lihat Pratonton</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 sm:p-8 flex-1">
          {viewMode === 'preview' ? (
            /* ========================================================
               MODE 1: PRATONTON DESAIN (PREVIEW MODE WITH TARGETED CURSOR ZOOM)
               ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Image Viewer with Targeted Cursor Magnifier */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="w-full aspect-square bg-[#F5F5F7] rounded-2xl overflow-hidden relative flex items-center justify-center p-4 cursor-crosshair group select-none"
                >
                  {/* 2.5x Zoom Image Container Centered on Cursor Position */}
                  <div
                    className="w-full h-full transition-transform duration-150 ease-out flex items-center justify-center"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: zoomPos.isZoomed ? 'scale(2.5)' : 'scale(1)'
                    }}
                  >
                    <TransparentImage
                      src={galleryImages[selectedImgIdx]}
                      alt={product.name}
                      className="w-full h-full object-contain img-crisp"
                    />
                  </div>

                  {/* Zoom Badge Indicator */}
                  {zoomPos.isZoomed && (
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1 rounded-full pointer-events-none z-30 flex items-center space-x-1.5 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>ZOOM 2.5X</span>
                    </div>
                  )}

                  {/* Template Switcher Buttons */}
                  {allProducts && allProducts.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevProduct}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md transition-all active:scale-95 z-20"
                        title="Template Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleNextProduct}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md transition-all active:scale-95 z-20"
                        title="Template Seterusnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails list if multiple images */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center space-x-3 overflow-x-auto py-1">
                    {galleryImages.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImgIdx(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-1 bg-[#F5F5F7] ${
                          selectedImgIdx === i ? 'border-[#111111] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <TransparentImage src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Design Details & Specification Highlights */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <span>{product.category || 'SUBLIMASI'}</span>
                    {product.subCategory && <span>/ {product.subCategory}</span>}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111]">
                    {product.name}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {product.description || 'Reka bentuk jersi sublimasi custom full-print berkualiti tinggi standard kilang pengeluaran AYEZZ GLOBAL. Warna tajam, tahan lama, dan tidak pudar.'}
                </p>

                {/* Technical Features Highlights */}
                <div className="space-y-3 pt-4 border-t border-neutral-100 text-xs">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-neutral-700">Cetakan Sublimasi Full-Print High-Definition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-neutral-700">Pilihan Kolar & Fabrik Custom Boleh Diubah</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-neutral-700">Penghantaran Pantas Kilang Seluruh Malaysia</span>
                  </div>
                </div>

                {/* PROMINENT TOGGLE TO ORDER BUTTON */}
                <div className="pt-4">
                  <button
                    onClick={() => setViewMode('order')}
                    className="w-full py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-3"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Konfigurasi & Tempah Desain Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               MODE 2: MODUS PEMESANAN / CONFIGURATOR (ORDER MODE)
               ======================================================== */
            <form onSubmit={handleWhatsAppOrder} className="space-y-8">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                    MODUS KONFIGURASI SPESIFIKASI
                  </span>
                  <h3 className="text-xl font-black uppercase text-[#111111]">
                    Spesifikasi & Pesanan Custom
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="text-xs font-bold text-neutral-600 hover:text-black underline flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Kembali ke Pratonton</span>
                </button>
              </div>

              {/* 1. SELEKSI KOLAR / CUT TYPE */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                  1. PILIH JENIS POTONGAN / KOLAR:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cutTypes.map((cut) => {
                    const isSelected = selectedCut.id === cut.id;
                    const addOn = Number(cut.addOnPrice ?? cut.add_on_price ?? 0);
                    return (
                      <div
                        key={cut.id}
                        onClick={() => setSelectedCut(cut)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                            : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase block line-clamp-1">{cut.name}</span>
                        <span className="text-[10px] font-mono opacity-80 block">
                          {addOn > 0 ? `+RM ${addOn}.00` : 'FREE'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELEKSI FABRIK / FABRIC TYPE */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                  2. PILIH JENIS KAIN / FABRIK:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fabricTypes.map((fab) => {
                    const isSelected = selectedFabric.id === fab.id;
                    const baseP = Number(fab.basePrice ?? fab.base_price ?? 70);
                    return (
                      <div
                        key={fab.id}
                        onClick={() => setSelectedFabric(fab)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                            : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase block line-clamp-1">{fab.name}</span>
                        <span className="text-[10px] font-mono opacity-80 block">RM {baseP}.00 / pcs</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. PECAHAN SAIZ QUANTITY MATRIX */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                  3. MASUKKAN KUANTITI SAIZ:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {Object.keys(sizeQuantities).map((sz) => (
                    <div key={sz} className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-center space-y-2">
                      <span className="text-xs font-mono font-bold block">{sz}</span>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateSizeQty(sz, -1)}
                          className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-xs font-bold hover:bg-neutral-200"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold w-5">{sizeQuantities[sz]}</span>
                        <button
                          type="button"
                          onClick={() => updateSizeQty(sz, 1)}
                          className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-neutral-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. MAKLUMAT PELANGGAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">NAMA PELANGGAN</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama penuh..."
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">NO. TELEFON</label>
                  <input
                    type="text"
                    required
                    placeholder="011-XXXXXXX"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">NAMA PASUKAN / KELAB</label>
                  <input
                    type="text"
                    placeholder="Contoh: FC Harimau"
                    value={customerInfo.teamName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, teamName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* PRICE SUMMARY & SUBMIT TO WHATSAPP */}
              <div className="p-5 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">RINGKASAN ANGGARAN</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black">RM {totalPrice.toFixed(2)}</span>
                    <span className="text-xs font-mono text-neutral-400">({totalQuantity} pcs x RM {pricePerPcs})</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || totalQuantity <= 0}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Hantar Pesanan Ke WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
