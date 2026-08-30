import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, MessageSquare, Plus, Minus, Calculator, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SIZE_CHART } from '../../data/sublimationProducts';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-slate-900 text-white rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">BORANG PESANAN</span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight truncate">{activeProduct.name}</h3>
            </div>
          </div>

          {/* NEXT / PREV CARD NAVIGATION BUTTONS IN HEADER */}
          <div className="flex items-center space-x-2 flex-nowrap shrink-0">
            {productList.length > 1 && (
              <div className="flex items-center space-x-1 border-r border-slate-200 pr-3 mr-1 flex-nowrap shrink-0">
                <button
                  type="button"
                  onClick={handlePrevProduct}
                  className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 rounded-lg transition-all inline-flex items-center justify-center text-xs font-bold space-x-1 whitespace-nowrap shrink-0"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline text-[11px] whitespace-nowrap">Sebelum</span>
                </button>

                <span className="text-[11px] font-mono font-extrabold text-slate-900 px-2 min-w-[42px] text-center whitespace-nowrap">
                  {currentIndex >= 0 ? currentIndex + 1 : 1}/{productList.length}
                </span>

                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 rounded-lg transition-all inline-flex items-center justify-center text-xs font-bold space-x-1 whitespace-nowrap shrink-0"
                  title="Seterusnya"
                >
                  <span className="hidden sm:inline text-[11px] whitespace-nowrap">Seterusnya</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors inline-flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendWhatsApp} className="p-4 sm:p-6 space-y-6 overflow-y-auto bg-white flex-1">
          {/* MULTI-PHOTO GALLERY PREVIEW CARD WITH OVERLAY NEXT CARD CONTROLS */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative group/card">
            <div className="flex flex-col items-center space-y-2 shrink-0 relative">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden group/img">
                <img
                  src={productGallery[activeImageIndex] || activeProduct.thumbnail}
                  alt={activeProduct.name}
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover rounded-2xl border border-slate-200 aspect-square shadow-2xs img-crisp"
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
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover/img:opacity-100 transition-all shadow-md shrink-0"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextProduct}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover/img:opacity-100 transition-all shadow-md shrink-0"
                      title="Seterusnya"
                    >
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </>
                )}
              </div>

              {/* GALLERY THUMBNAIL STRIP */}
              {productGallery.length > 1 && (
                <div className="flex items-center space-x-1.5 shrink-0">
                  {productGallery.map((gUrl, gIdx) => (
                    <button
                      type="button"
                      key={gIdx}
                      onClick={() => setActiveImageIndex(gIdx)}
                      className={`w-6 h-6 rounded-lg overflow-hidden border transition-all ${
                        activeImageIndex === gIdx ? 'border-slate-900 ring-2 ring-slate-900/20 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={gUrl} alt={`Thumb ${gIdx}`} decoding="async" className="w-full h-full object-cover img-crisp" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 truncate">{activeProduct.name}</h4>
                {productList.length > 1 && (
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0 ml-2 whitespace-nowrap">
                    {currentIndex >= 0 ? currentIndex + 1 : 1}/{productList.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">{activeProduct.description || 'Reka bentuk sublimasi berkualiti tinggi.'}</p>

              {/* NEXT / PREVIOUS CARD ACTION BANNER */}
              {productList.length > 1 && (
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleNextProduct}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-900 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 border border-slate-200 shadow-2xs whitespace-nowrap shrink-0"
                  >
                    <span className="whitespace-nowrap">Reka Seterusnya</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cut Selection with 1:1 Cover Images */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              1. Jenis Potongan / Kolar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cutTypes.map((cut) => (
                <button
                  type="button"
                  key={cut.id}
                  onClick={() => setSelectedCut(cut)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                    selectedCut?.id === cut.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={cut.thumbnail || PLACEHOLDER_IMAGE}
                    alt={cut.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200/80 shrink-0 aspect-square"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span className="truncate">{cut.name}</span>
                      <span className="text-[10px] font-mono font-black shrink-0 ml-1">
                        {cut.addOnPrice > 0 ? `+RM ${cut.addOnPrice}` : 'Standard'}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${selectedCut?.id === cut.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {cut.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Selection with 1:1 Cover Images & GSM */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              2. Jenis Kain Sublimasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fabricTypes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFabric(f)}
                  className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFabric?.id === f.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={f.thumbnail || PLACEHOLDER_IMAGE}
                    alt={f.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200/80 shrink-0 aspect-square"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] font-mono font-black shrink-0 ml-1">RM {f.basePrice}/pcs</span>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${selectedFabric?.id === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {f.gsm || '150 GSM'}
                      </span>
                      <span className={`text-[9px] font-semibold truncate ${selectedFabric?.id === f.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {f.tier}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Name & Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                3. Nama Cetakan (Sampel)
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Contoh: AYEZ"
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-slate-900 uppercase transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                4. Nombor Cetakan (Sampel)
              </label>
              <input
                type="text"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-slate-900 uppercase transition-all"
              />
            </div>
          </div>

          {/* Size Breakdown */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              5. Pecahan Saiz Pesanan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SIZE_CHART.map((size) => (
                <div key={size} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{size}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(size, -1)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-900 font-black inline-flex items-center justify-center text-sm shrink-0 active:scale-95 transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-900 w-6 text-center">
                      {quantities[size] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(size, 1)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-900 font-black inline-flex items-center justify-center text-sm shrink-0 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE CALCULATOR CARD */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Ringkasan Anggaran Harga</span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {selectedFabric?.name} + {selectedCut?.name} = <strong className="text-white">RM {unitPrice.toFixed(2)} / pcs</strong>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-[11px] text-slate-400 font-mono">Jumlah: {totalQty} pcs</div>
              <div className="text-2xl font-black text-white tabular-nums">RM {totalPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* STICKY SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md inline-flex items-center justify-center space-x-2 transition-all active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white shrink-0" />
              <span className="whitespace-nowrap">Hantar Pesanan Ke WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
