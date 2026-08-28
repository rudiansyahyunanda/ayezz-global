import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, MessageSquare, Plus, Minus, Calculator, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SIZE_CHART, FABRIC_TYPES as FALLBACK_FABRICS, CUT_TYPES as FALLBACK_CUTS, DESIGN_TEMPLATES } from '../../data/sublimationProducts';
import { getCutTypes, getFabricTypes, saveOrderToSupabase, getDesignTemplates, PLACEHOLDER_IMAGE } from '../../lib/supabaseService';

export default function ProductOrderModal({ product: initialProduct, onClose, allProducts = [], onSelectProduct }) {
  if (!initialProduct) return null;

  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [productList, setProductList] = useState(Array.isArray(allProducts) && allProducts.length > 0 ? allProducts : []);

  const [cutTypes, setCutTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedCut, setSelectedCut] = useState(null);
  const [selectedColor, setSelectedColor] = useState('Kustom (Mengikut Reka Bentuk Template)');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Sync initial product change
  useEffect(() => {
    setCurrentProduct(initialProduct);
    setActiveImageIndex(0);
  }, [initialProduct]);

  // Load dynamically available products if list is empty
  useEffect(() => {
    async function loadTemplatesAndOptions() {
      const [cuts, fabrics, templates] = await Promise.all([
        getCutTypes(),
        getFabricTypes(),
        getDesignTemplates()
      ]);
      setCutTypes(cuts);
      setFabricTypes(fabrics);
      if (cuts.length > 0) setSelectedCut(cuts[0]);
      if (fabrics.length > 0) setSelectedFabric(fabrics[0]);
      if (Array.isArray(allProducts) && allProducts.length > 0) {
        setProductList(allProducts);
      } else if (Array.isArray(templates) && templates.length > 0) {
        setProductList(templates);
      }
    }
    loadTemplatesAndOptions();
  }, [allProducts]);

  const activeProduct = currentProduct || initialProduct;
  if (!activeProduct) return null;

  // MULTI-PHOTO GALLERY INTERACTIVE STATE
  const productGallery = Array.isArray(activeProduct?.images) && activeProduct.images.length > 0
    ? activeProduct.images
    : (activeProduct?.thumbnail ? [activeProduct.thumbnail] : []);

  // Card navigation index
  const currentIndex = (Array.isArray(productList) ? productList : []).findIndex(p => (p?.id && activeProduct?.id && p.id === activeProduct.id) || (p?.name && activeProduct?.name && p.name === activeProduct.name));

  const handlePrevProduct = () => {
    if (productList.length <= 1) return;
    const prevIdx = currentIndex <= 0 ? productList.length - 1 : currentIndex - 1;
    const nextProd = productList[prevIdx];
    setCurrentProduct(nextProd);
    setActiveImageIndex(0);
    if (onSelectProduct) onSelectProduct(nextProd);
  };

  const handleNextProduct = () => {
    if (productList.length <= 1) return;
    const nextIdx = (currentIndex + 1) % productList.length;
    const nextProd = productList[nextIdx];
    setCurrentProduct(nextProd);
    setActiveImageIndex(0);
    if (onSelectProduct) onSelectProduct(nextProd);
  };

  // Keyboard left/right arrow shortcuts for card navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevProduct();
      if (e.key === 'ArrowRight') handleNextProduct();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, productList]);

  const [quantities, setQuantities] = useState({
    S: 2,
    M: 5,
    L: 5,
    XL: 2
  });

  const totalQty = Object.values(quantities).reduce((acc, curr) => acc + curr, 0);

  let unitPrice = (selectedFabric?.basePrice || 70) + (selectedCut?.addOnPrice || 0);
  if (totalQty >= 20) unitPrice -= 10;
  else if (totalQty >= 10) unitPrice -= 5;

  const totalPrice = totalQty * unitPrice;

  const handleQtyChange = (size, delta) => {
    setQuantities(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const sizeSummary = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}: ${q}pcs`)
      .join(', ');

    const nameNumStr = playerName || playerNumber ? `${playerName || '-'} #${playerNumber || '-'}` : 'Bebas / Mengikut Senarai';

    await saveOrderToSupabase({
      clientName: playerName || 'Pelanggan WhatsApp',
      templateName: activeProduct.name,
      cutType: selectedCut?.name,
      fabricMaterial: selectedFabric?.name,
      sizeBreakdown: quantities,
      totalQty: totalQty,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    });

    const message = `Salam AYEZZ Sublimation, saya ingin membuat pesanan daripada Template Reka Bentuk:
- *Template Reka Bentuk*: ${activeProduct.name}
- *Jenis Potongan / Kolar*: ${selectedCut?.name} (+RM ${selectedCut?.addOnPrice})
- *Jenis Kain*: ${selectedFabric?.name} (${selectedFabric?.gsm || '150 GSM'} - RM ${selectedFabric?.basePrice}/pcs)
- *Warna*: ${selectedColor}
- *Cetakan Nama/No*: ${nameNumStr}
- *Pecahan Saiz*: ${sizeSummary}
- *Jumlah Kuantiti*: ${totalQty} pcs
- *Harga Sehelaian*: RM ${unitPrice.toFixed(2)}
- *Anggaran Keseluruhan*: RM ${totalPrice.toFixed(2)}

Sila maklumkan sebut harga rasmi dan langkah pembayaran. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/6287818310416?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F6F5F3] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-[#757575] tracking-widest uppercase">// BORANG PESANAN</span>
              <h3 className="text-base font-extrabold text-[#1A1A1A] leading-tight truncate">{activeProduct.name}</h3>
            </div>
          </div>

          {/* NEXT / PREV CARD NAVIGATION BUTTONS IN HEADER */}
          <div className="flex items-center space-x-2">
            {productList.length > 1 && (
              <div className="flex items-center space-x-1 border-r border-[#E5E5E5] pr-3 mr-1">
                <button
                  type="button"
                  onClick={handlePrevProduct}
                  className="p-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg transition-all flex items-center text-xs font-bold space-x-1 shadow-2xs"
                  title="Template Reka Bentuk Sebelumnya (Tekan Panah Kiri)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Sebelum</span>
                </button>

                <span className="text-[11px] font-mono font-extrabold text-[#1A1A1A] px-2 min-w-[42px] text-center">
                  {currentIndex >= 0 ? currentIndex + 1 : 1}/{productList.length}
                </span>

                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="p-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-lg transition-all flex items-center text-xs font-bold space-x-1 shadow-2xs"
                  title="Template Reka Bentuk Seterusnya (Tekan Panah Kanan)"
                >
                  <span className="hidden sm:inline text-[11px]">Reka Seterusnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#757575] hover:text-[#1A1A1A] hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendWhatsApp} className="p-6 space-y-6 overflow-y-auto bg-[#F6F5F3]">
          {/* MULTI-PHOTO GALLERY PREVIEW CARD WITH OVERLAY NEXT CARD CONTROLS */}
          <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center gap-4 relative group/card">
            <div className="flex flex-col items-center space-y-2 shrink-0 relative">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden group/img">
                <img
                  src={productGallery[activeImageIndex] || activeProduct.thumbnail}
                  alt={activeProduct.name}
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover rounded-xl border border-[#E5E5E5] aspect-square shadow-2xs img-crisp"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />

                {/* FLOATING QUICK SWITCH CARD ARROWS ON IMAGE */}
                {productList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevProduct}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all shadow-md"
                      title="Reka Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextProduct}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all shadow-md"
                      title="Reka Seterusnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* GALLERY THUMBNAIL STRIP */}
              {productGallery.length > 1 && (
                <div className="flex items-center space-x-1.5">
                  {productGallery.map((gUrl, gIdx) => (
                    <button
                      type="button"
                      key={gIdx}
                      onClick={() => setActiveImageIndex(gIdx)}
                      className={`w-5 h-5 rounded-md overflow-hidden border transition-all ${
                        activeImageIndex === gIdx ? 'border-[#1A1A1A] ring-2 ring-[#1A1A1A]/20 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={gUrl} alt={`Thumb ${gIdx}`} decoding="async" className="w-full h-full object-cover img-crisp" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#1A1A1A] truncate">{activeProduct.name}</h4>
                {productList.length > 1 && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0 ml-2">
                    Katalog {currentIndex >= 0 ? currentIndex + 1 : 1} daripada {productList.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#757575] font-normal">{activeProduct.description || 'Reka bentuk sublimasi berkualiti tinggi.'}</p>
              {productGallery.length > 1 && (
                <span className="inline-block text-[10px] font-semibold text-slate-500 font-mono mt-0.5">
                  {productGallery.length} Sudut Pandangan Foto Disediakan
                </span>
              )}

              {/* NEXT / PREVIOUS CARD ACTION BANNER */}
              {productList.length > 1 && (
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleNextProduct}
                    className="px-3 py-1 bg-slate-100 hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 border border-slate-200 shadow-2xs"
                  >
                    <span>Lihat Reka Seterusnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cut Selection with 1:1 Cover Images */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              1. Jenis Potongan / Kolar (Bergambar 1:1)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cutTypes.map((cut) => (
                <button
                  type="button"
                  key={cut.id}
                  onClick={() => setSelectedCut(cut)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-3 ${
                    selectedCut?.id === cut.id
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm font-bold'
                      : 'border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={cut.thumbnail || PLACEHOLDER_IMAGE}
                    alt={cut.name}
                    className="w-12 h-12 object-cover rounded-lg border border-[#E5E5E5] shrink-0 aspect-square"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span className="truncate">{cut.name}</span>
                      <span className="text-[10px] font-mono font-black shrink-0 ml-1">
                        {cut.addOnPrice > 0 ? `+RM ${cut.addOnPrice}` : 'Standard'}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${selectedCut?.id === cut.id ? 'text-slate-300' : 'text-[#757575]'}`}>
                      {cut.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Selection with 1:1 Cover Images & GSM */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              2. Jenis Fabric Sublimasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fabricTypes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFabric(f)}
                  className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all ${
                    selectedFabric?.id === f.id
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xs'
                      : 'border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#757575]'
                  }`}
                >
                  <img
                    src={f.thumbnail || PLACEHOLDER_IMAGE}
                    alt={f.name}
                    className="w-12 h-12 object-cover rounded-lg border border-[#E5E5E5] shrink-0 aspect-square"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] font-mono font-black shrink-0 ml-1">RM {f.basePrice}/pcs</span>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${selectedFabric?.id === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        {f.gsm || '150 GSM'}
                      </span>
                      <span className={`text-[9px] font-semibold truncate ${selectedFabric?.id === f.id ? 'text-slate-300' : 'text-[#757575]'}`}>
                        {f.tier}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${selectedFabric?.id === f.id ? 'text-slate-300' : 'text-[#757575]'}`}>
                      {f.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Name & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                3. Nama Sampel
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Contoh: AYEZ"
                className="w-full bg-white border border-[#E5E5E5] text-xs font-bold text-[#1A1A1A] rounded-xl px-4 py-2.5 outline-none focus:border-[#1A1A1A] uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                4. Nombor Sampel
              </label>
              <input
                type="text"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full bg-white border border-[#E5E5E5] text-xs font-bold text-[#1A1A1A] rounded-xl px-4 py-2.5 outline-none focus:border-[#1A1A1A] uppercase"
              />
            </div>
          </div>

          {/* Size Breakdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              5. Pecahan Saiz Pesanan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIZE_CHART.map((size) => (
                <div key={size} className="p-2.5 bg-white rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A]">{size}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(size, -1)}
                      className="w-5 h-5 rounded bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A] font-bold flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#1A1A1A] w-5 text-center">
                      {quantities[size] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(size, 1)}
                      className="w-5 h-5 rounded bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A] font-bold flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE CALCULATOR CARD */}
          <div className="p-5 bg-white rounded-xl border border-[#1A1A1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#1A1A1A]" />
                <span className="text-xs font-bold uppercase text-[#1A1A1A]">Anggaran Pengiraan Harga</span>
              </div>
              <p className="text-xs text-[#757575] font-mono">
                {selectedFabric?.name} ({selectedFabric?.gsm || '150 GSM'} - RM {selectedFabric?.basePrice}) + {selectedCut?.name} (+RM {selectedCut?.addOnPrice}) = <strong className="text-[#1A1A1A]">RM {unitPrice.toFixed(2)} / pcs</strong>
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#757575] font-mono">Kuantiti: {totalQty} pcs</div>
              <div className="text-2xl font-black text-[#1A1A1A]">RM {totalPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-[#1A1A1A] hover:bg-[#333333] text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Hantar Pesanan Menerusi WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
