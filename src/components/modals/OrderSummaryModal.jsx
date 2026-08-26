import React, { useState } from 'react';
import { X, ShoppingBag, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SIZE_CHART } from '../../data/sublimationProducts';

export default function OrderSummaryModal({ isOpen, onClose, selectedModel, colors, playerName, playerNumber, selectedFabric }) {
  const [quantities, setQuantities] = useState({
    S: 2,
    M: 5,
    L: 5,
    XL: 2
  });

  if (!isOpen) return null;

  const totalQty = Object.values(quantities).reduce((acc, curr) => acc + curr, 0);

  // Price tier calculation
  let unitPrice = selectedModel?.price || 70000;
  if (totalQty >= 20) unitPrice -= 10000;
  else if (totalQty >= 10) unitPrice -= 5000;

  const totalPrice = totalQty * unitPrice;

  const handleQtyChange = (size, delta) => {
    setQuantities(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSendWhatsApp = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    const sizeSummary = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `${s}: ${q}pcs`)
      .join(', ');

    const message = `Salam AYEZZ Sublimation, saya ingin membuat pesanan Pakaian Kustom:
- *Model*: ${selectedModel?.name}
- *Kain*: ${selectedFabric}
- *Nama/No. Sampel*: ${playerName} #${playerNumber}
- *Pecahan Saiz*: ${sizeSummary}
- *Jumlah Kuantiti*: ${totalQty} pcs
- *Anggaran Keseluruhan*: RM ${totalPrice.toLocaleString('en-MY')}

Sila maklumkan langkah seterusnya. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/6287818310416?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#F6F5F3]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Ringkasan Pesanan Kustom</h3>
              <p className="text-xs text-[#757575]">{selectedModel?.name} • {selectedFabric}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#757575] hover:text-[#1A1A1A] rounded-lg hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#F6F5F3] overflow-y-auto max-h-[75vh]">
          {/* Spec Summary */}
          <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] space-y-2 text-xs">
            <div className="font-bold text-[#1A1A1A] flex justify-between border-b border-[#E5E5E5] pb-2">
              <span>Spesifikasi Kustom:</span>
              <span className="text-[#1A1A1A] font-extrabold">{playerName} #{playerNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[#757575] pt-1">
              <div>Warna Badan: <span className="font-mono font-bold text-[#1A1A1A]">{colors.body}</span></div>
              <div>Warna Lengan: <span className="font-mono font-bold text-[#1A1A1A]">{colors.sleeves}</span></div>
            </div>
          </div>

          {/* Size Breakdown */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Pecahan Saiz (Size Breakdown)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIZE_CHART.map((size) => (
                <div key={size} className="p-2.5 bg-white rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A]">{size}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleQtyChange(size, -1)}
                      className="w-5 h-5 rounded bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A] font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-[#1A1A1A] w-5 text-center">
                      {quantities[size] || 0}
                    </span>
                    <button
                      onClick={() => handleQtyChange(size, 1)}
                      className="w-5 h-5 rounded bg-[#F6F5F3] hover:bg-slate-200 text-[#1A1A1A] font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Price Calculation */}
          <div className="p-4 bg-white rounded-xl border border-[#E5E5E5] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#757575]">Jumlah Keseluruhan: <span className="font-bold text-[#1A1A1A]">{totalQty} Helaian</span></div>
              <div className="text-[11px] text-[#757575]">Harga Sehelaian: RM {unitPrice.toLocaleString('en-MY')} / pcs</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#757575] font-medium">Anggaran Keseluruhan</div>
              <div className="text-xl font-extrabold text-[#1A1A1A]">RM {totalPrice.toLocaleString('en-MY')}</div>
            </div>
          </div>

          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 px-4 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Hantar Pesanan Menerusi WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
