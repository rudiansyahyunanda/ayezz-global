import React, { useRef } from 'react';
import { Download, Printer, Layers } from 'lucide-react';

export default function SublimationPatternCanvas({
  modelName = 'Jersey Futsal',
  colors = { body: '#0F172A', sleeves: '#2563EB', collar: '#0F172A', accents: '#10B981' },
  playerName = 'AYEZ',
  playerNumber = '10'
}) {
  const svgRef = useRef(null);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Pola_Sublimasi_${modelName}_${playerName}_${playerNumber}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-clean">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Pola Layout Cetak Sublimasi (Heat Press Ready)</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Bleed Sublimasi 1.5 cm
          </span>
        </div>

        <button
          onClick={handleExportSVG}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-clean transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Pola SVG / PDF</span>
        </button>
      </div>

      {/* SVG Pattern Viewport */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="bg-white p-6 rounded-2xl shadow-clean-lg border border-slate-200">
          <svg
            ref={svgRef}
            viewBox="0 0 900 650"
            className="max-w-full max-h-[70vh]"
            style={{ minWidth: '550px' }}
          >
            <rect width="100%" height="100%" fill="#FFFFFF" rx="8" />

            {/* Front Panel Pattern */}
            <g transform="translate(60, 40)">
              <rect x="0" y="0" width="280" height="420" rx="20" fill={colors.body || '#0F172A'} stroke="#2563EB" strokeWidth="2" />
              {/* Chest Text */}
              <text x="140" y="160" fill="#FFFFFF" fontSize="20" fontWeight="800" textAnchor="middle">
                AYEZ SUBLIMATION
              </text>
              <text x="140" y="190" fill={colors.accents || '#10B981'} fontSize="12" fontWeight="bold" textAnchor="middle">
                CUSTOM ATHLETICS
              </text>
              <text x="140" y="445" fill="#64748B" fontSize="12" fontWeight="bold" textAnchor="middle">
                PANEL DEPAN (FRONT)
              </text>
            </g>

            {/* Back Panel Pattern */}
            <g transform="translate(380, 40)">
              <rect x="0" y="0" width="280" height="420" rx="20" fill={colors.body || '#0F172A'} stroke="#2563EB" strokeWidth="2" />
              {/* Player Name */}
              <text x="140" y="120" fill="#FFFFFF" fontSize="24" fontWeight="800" textAnchor="middle">
                {(playerName || 'AYEZ').toUpperCase()}
              </text>
              {/* Player Number */}
              <text x="140" y="270" fill={colors.accents || '#10B981'} fontSize="110" fontWeight="900" textAnchor="middle">
                {playerNumber || '10'}
              </text>
              <text x="140" y="445" fill="#64748B" fontSize="12" fontWeight="bold" textAnchor="middle">
                PANEL BELAKANG (BACK)
              </text>
            </g>

            {/* Left Sleeve Pattern */}
            <g transform="translate(700, 40)">
              <rect x="0" y="0" width="140" height="200" rx="15" fill={colors.sleeves || '#2563EB'} stroke="#2563EB" strokeWidth="2" />
              <rect x="0" y="170" width="140" height="30" fill={colors.accents || '#10B981'} />
              <text x="70" y="225" fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle">
                LENGAN KIRI
              </text>
            </g>

            {/* Right Sleeve Pattern */}
            <g transform="translate(700, 260)">
              <rect x="0" y="0" width="140" height="200" rx="15" fill={colors.sleeves || '#2563EB'} stroke="#2563EB" strokeWidth="2" />
              <rect x="0" y="170" width="140" height="30" fill={colors.accents || '#10B981'} />
              <text x="70" y="225" fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle">
                LENGAN KANAN
              </text>
            </g>

            {/* Collar Pattern */}
            <g transform="translate(60, 520)">
              <rect x="0" y="0" width="600" height="40" rx="8" fill={colors.collar || '#0F172A'} stroke="#0F172A" strokeWidth="1.5" />
              <text x="300" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                KERAH LEHER (COLLAR RING)
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
