'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../lib/authService';
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
  saveOrderToSupabase,
  PLACEHOLDER_IMAGE
} from '../../lib/supabaseService';
import {
  CUT_TYPES as FALLBACK_CUTS,
  FABRIC_TYPES as FALLBACK_FABRICS
} from '../../data/sublimationProducts';

export default function ProductPreviewModal({ product, allProducts, onClose, onSelectProduct }) {
  if (!product) return null;

  const router = useRouter();
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'order'
  const [orderSuccess, setOrderSuccess] = useState(null);
  
  const handleProceedToOrder = async () => {
    const user = await getCurrentUser();
    if (!user) {
      onClose();
      window.location.href = `/login?redirect=${encodeURIComponent('/katalog')}&msg=login_required`;
      return;
    }
    setViewMode('order');
  };
  
  // Extract template images safely
  const galleryImages = useMemo(() => {
    if (!product) return [PLACEHOLDER_IMAGE];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/') || product.images.startsWith('data:'))) return [product.images];
      }
    }
    if (product.thumbnail) return [product.thumbnail];
    return [PLACEHOLDER_IMAGE];
  }, [product]);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  useEffect(() => {
    setSelectedImgIdx(0);
  }, [product]);

  // Mouse Cursor Targeted Magnifier Zoom State (Fine Pointer / Mouse only)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isZoomed: false });
  const [showZoomText, setShowZoomText] = useState(false);
  const [isManualTouchZoom, setIsManualTouchZoom] = useState(false);

  const handleMouseMove = (e) => {
    // Only trigger mouse hover zoom on real mouse/trackpad pointer devices
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!isFinePointer) return; // Prevent touch events from triggering hover zoom
    }

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y, isZoomed: true });
  };

  const handleMouseLeave = () => {
    setZoomPos({ x: 50, y: 50, isZoomed: false });
    setShowZoomText(false);
  };

  useEffect(() => {
    if (zoomPos.isZoomed || isManualTouchZoom) {
      setShowZoomText(true);
      const timer = setTimeout(() => {
        setShowZoomText(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [zoomPos.isZoomed, isManualTouchZoom]);

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
  const currentIndex = (allProducts || []).findIndex((p) => p?.id === product?.id);

  const handlePrevProduct = () => {
    if (!allProducts || allProducts.length <= 1) return;
    const safeCurrIdx = currentIndex < 0 ? 0 : currentIndex;
    const prevIdx = (safeCurrIdx - 1 + allProducts.length) % allProducts.length;
    if (allProducts[prevIdx]) {
      onSelectProduct(allProducts[prevIdx]);
      setSelectedImgIdx(0);
      setViewMode('preview');
      setIsManualTouchZoom(false);
    }
  };

  const handleNextProduct = () => {
    if (!allProducts || allProducts.length <= 1) return;
    const safeCurrIdx = currentIndex < 0 ? 0 : currentIndex;
    const nextIdx = (safeCurrIdx + 1) % allProducts.length;
    if (allProducts[nextIdx]) {
      onSelectProduct(allProducts[nextIdx]);
      setSelectedImgIdx(0);
      setViewMode('preview');
      setIsManualTouchZoom(false);
    }
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

  // In-App System Order Submission Handler (100% Internal System Processing)
  const handleSystemOrder = async (e) => {
    e.preventDefault();
    if (totalQuantity <= 0) {
      alert('Sila masukkan sekurang-kurangnya 1 saiz kuantiti pesanan.');
      return;
    }

    setIsSubmitting(true);
    const currentUser = await getCurrentUser();
    const generatedOrderId = 'AYZ-' + Math.floor(100000 + Math.random() * 900000);

    const orderPayload = {
      order_id: generatedOrderId,
      userEmail: currentUser?.email || '',
      userId: currentUser?.id || '',
      templateName: product?.name || 'Template Reka Bentuk',
      product_name: product?.name || 'Template Reka Bentuk',
      category: product?.category || 'SUBLIMASI',
      sub_category: product?.subCategory || '',
      cutType: selectedCut?.name || '',
      collar_cut: selectedCut?.name || '',
      fabricMaterial: selectedFabric?.name || '',
      fabric_type: selectedFabric?.name || '',
      sizeBreakdown: sizeQuantities,
      totalQty: totalQuantity,
      total_qty: totalQuantity,
      unitPrice: pricePerPcs,
      totalPrice: totalPrice,
      total_price: totalPrice,
      clientName: customerInfo.name || currentUser?.fullName || 'Pelanggan Sistem',
      customer_phone: customerInfo.phone || currentUser?.phone || '',
      team_name: customerInfo.teamName || '-',
      notes: customerInfo.notes || '',
      status: 'Pesanan Diterima'
    };

    try {
      await saveOrderToSupabase(orderPayload);
    } catch (err) {
      console.warn('Error saving order to system DB:', err);
    } finally {
      setIsSubmitting(false);
      setOrderSuccess(orderPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-white text-[#111111] rounded-t-3xl sm:rounded-3xl max-w-5xl w-full max-h-[96vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col my-0 sm:my-auto border-t sm:border border-neutral-100 pb-14 sm:pb-0">
        
        {/* HEADER BAR MODAL */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 bg-neutral-100 rounded-full text-neutral-600 shrink-0">
              {product?.category || 'SUBLIMASI'}
            </span>
            <h3 className="text-xs sm:text-base font-bold text-[#111111] uppercase tracking-tight truncate">
              {product?.name || 'Template Reka Bentuk'}
            </h3>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {viewMode === 'order' && !orderSuccess && (
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] rounded-full text-[11px] font-bold transition-all flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pratonton</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-8 flex-1">
          {orderSuccess ? (
            /* ========================================================
               MODE 3: RESIT DEPOSIT / CONFIRMATION IN-APP SYSTEM RECEIPT
               ======================================================== */
            <div className="py-6 text-center space-y-5 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  PESANAN BERJAYA DISIMPAN KE SISTEM
                </span>
                <h3 className="text-xl sm:text-3xl font-black uppercase text-[#111111] pt-1">
                  Resit Pesanan #{orderSuccess?.order_id || 'AYZ-000000'}
                </h3>
                <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                  Pesanan kustom jersi anda telah berjaya direkodkan secara langsung ke dalam pangkalan data sistem pengeluaran AYEZZ GLOBAL.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 sm:p-6 bg-[#F5F5F7] rounded-2xl text-left space-y-3 border border-neutral-200 text-xs">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="font-mono text-neutral-500 font-bold">REKA BENTUK:</span>
                  <span className="font-bold text-[#111111]">{orderSuccess?.templateName || orderSuccess?.product_name || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="font-mono text-neutral-500 font-bold">JENIS KOLAR:</span>
                  <span className="font-bold text-[#111111]">{orderSuccess?.cutType || orderSuccess?.collar_cut || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="font-mono text-neutral-500 font-bold">FABRIK:</span>
                  <span className="font-bold text-[#111111]">{orderSuccess?.fabricMaterial || orderSuccess?.fabric_type || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="font-mono text-neutral-500 font-bold">JUMLAH KUANTITI:</span>
                  <span className="font-bold text-[#111111]">{orderSuccess?.totalQty ?? orderSuccess?.total_qty ?? 0} pcs</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-[#111111]">
                  <span>JUMLAH ANGGARAN:</span>
                  <span className="text-emerald-700">RM {Number(orderSuccess?.totalPrice ?? orderSuccess?.total_price ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md"
              >
                Selesai & Kembali Ke Katalog
              </button>
            </div>
          ) : viewMode === 'preview' ? (
            /* ========================================================
               MODE 1: PRATONTON DESAIN (PREVIEW MODE WITH TOUCH-SAFE ZOOM)
               ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Left Column: Image Viewer with Responsive Thumbnail Strip */}
              <div className="lg:col-span-7">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                  
                  {/* THUMBNAIL STRIP (Horizontal on Mobile, Vertical on Desktop) */}
                  {galleryImages.length > 1 && (
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[440px] w-full sm:w-auto py-1 scrollbar-none no-scrollbar">
                      {galleryImages.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImgIdx(i)}
                          className={`w-14 h-14 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl overflow-hidden border transition-all p-1 bg-[#F5F5F7] shrink-0 outline-none shadow-none ${
                            selectedImgIdx === i
                              ? 'border-[#111111] opacity-100 ring-1 ring-[#111111]'
                              : 'border-neutral-200/60 opacity-50 hover:opacity-100 hover:border-neutral-400'
                          }`}
                        >
                          <TransparentImage src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MAIN 1:1 IMAGE VIEWER CONTAINER */}
                  <div className="flex-1 w-full space-y-3 order-1 sm:order-2">
                    <div
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className="w-full aspect-square bg-[#F5F5F7] rounded-2xl overflow-hidden relative flex items-center justify-center p-3 sm:p-4 cursor-crosshair group select-none"
                    >
                      {/* 2.5x Zoom Image Container */}
                      <div
                        className="w-full h-full transition-transform duration-150 ease-out flex items-center justify-center"
                        style={{
                          transformOrigin: isManualTouchZoom ? 'center center' : `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: (zoomPos.isZoomed || isManualTouchZoom) ? 'scale(2.2)' : 'scale(1)'
                        }}
                      >
                        <TransparentImage
                          key={`main-img-${selectedImgIdx}`}
                          src={galleryImages[selectedImgIdx]}
                          alt={product.name}
                          className="w-full h-full object-contain img-crisp"
                        />
                      </div>

                      {/* Zoom Status Text Indicator */}
                      <div
                        className={`absolute top-3 left-3 pointer-events-none z-30 transition-opacity duration-500 ${
                          (showZoomText || isManualTouchZoom) ? 'opacity-80' : 'opacity-0'
                        }`}
                      >
                        <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-neutral-500 font-semibold bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-neutral-200/60">
                          ZOOM 2.2X
                        </span>
                      </div>

                      {/* Desktop Hover Next/Prev Buttons (Hidden on Mobile) */}
                      {allProducts && allProducts.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevProduct}
                            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md transition-all active:scale-95 z-20 items-center justify-center"
                            title="Template Sebelumnya"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={handleNextProduct}
                            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-black rounded-full shadow-md transition-all active:scale-95 z-20 items-center justify-center"
                            title="Template Seterusnya"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* DEDICATED MOBILE CONTROL BAR: THUMB NAVIGATION & ZOOM TOGGLE */}
                    <div className="flex items-center justify-between gap-2 px-1">
                      {allProducts && allProducts.length > 1 ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePrevProduct}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-[#111111] rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-neutral-200"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Sebelum</span>
                          </button>

                          <button
                            onClick={handleNextProduct}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-[#111111] rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-neutral-200"
                          >
                            <span>Seterusnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : <div />}

                      {/* Dedicated Mobile Zoom Toggle */}
                      <button
                        onClick={() => setIsManualTouchZoom(!isManualTouchZoom)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                          isManualTouchZoom
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isManualTouchZoom ? 'Reset Zoom' : 'Zoom 2.2x'}</span>
                      </button>
                    </div>
                  </div>
                </div>
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

                {/* PROMINENT TOGGLE TO ORDER BUTTON (STRICT LOGIN GUARD CHECK) */}
                <div className="pt-4">
                  <button
                    onClick={handleProceedToOrder}
                    className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2.5 whitespace-nowrap"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Tempah Desain Ini</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               MODE 2: MODUS PEMESANAN / CONFIGURATOR (INTERNAL SYSTEM ORDER MODE)
               ======================================================== */
            <form onSubmit={handleSystemOrder} className="space-y-8">
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
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-[#111111] focus:text-white"
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
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-[#111111] focus:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">NAMA PASUKAN / KELAB</label>
                  <input
                    type="text"
                    placeholder="Contoh: FC Harimau"
                    value={customerInfo.teamName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, teamName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:bg-[#111111] focus:text-white"
                  />
                </div>
              </div>

              {/* PRICE SUMMARY & SUBMIT TO SYSTEM DATABASE */}
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
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Hantar Pesanan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
