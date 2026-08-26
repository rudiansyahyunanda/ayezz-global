import React, { useRef } from 'react';
import { Download, Layers } from 'lucide-react';

export default function Dieline2DCanvas({
  modelType = 'tuck_box',
  dimensions = { width: 80, height: 120, depth: 50, thickness: 1.5, flap: 20 },
  colors = {}
}) {
  const svgRef = useRef(null);

  const W = Number(dimensions.width) || 80;
  const H = Number(dimensions.height) || 120;
  const D = Number(dimensions.depth) || 50;
  const F = Number(dimensions.flap) || 20;

  const totalWidth = (W * 2) + (D * 2) + 60;
  const totalHeight = H + (D * 2) + (F * 2) + 60;
  const startX = 30 + D;
  const startY = 30 + D + F;

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Pacdora_Dieline_${modelType}_${W}x${H}x${D}mm.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Clean Dieline Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-clean">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>2D Engineering Blueprint Dieline</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Scale 1:1 Manufacturing Ready
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Cut Line
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed border-rose-500 inline-block" /> Crease Line
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-0.5 bg-emerald-600 border-b border-dotted border-emerald-600 inline-block" /> Bleed Line
            </span>
          </div>

          <button
            onClick={handleExportSVG}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-clean transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vector SVG</span>
          </button>
        </div>
      </div>

      {/* SVG Viewport */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="bg-white p-6 rounded-2xl shadow-clean-lg border border-slate-200">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="max-w-full max-h-[70vh]"
            style={{ minWidth: '520px' }}
          >
            <rect width="100%" height="100%" fill="#FFFFFF" rx="8" />

            <g transform="translate(0, 0)">
              {/* Back Panel */}
              <rect
                x={startX}
                y={startY}
                width={W}
                height={H}
                fill="#F8FAFC"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX + W / 2} y={startY + H / 2} fill="#1E293B" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                BACK ({W} x {H})
              </text>

              {/* Right Panel */}
              <rect
                x={startX + W}
                y={startY}
                width={D}
                height={H}
                fill="#F1F5F9"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX + W + D / 2} y={startY + H / 2} fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                RIGHT ({D} x {H})
              </text>

              {/* Front Panel */}
              <rect
                x={startX + W + D}
                y={startY}
                width={W}
                height={H}
                fill="#F8FAFC"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX + W + D + W / 2} y={startY + H / 2} fill="#1E293B" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                FRONT ({W} x {H})
              </text>

              {/* Left Panel */}
              <rect
                x={startX - D}
                y={startY}
                width={D}
                height={H}
                fill="#F1F5F9"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX - D / 2} y={startY + H / 2} fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                LEFT ({D} x {H})
              </text>

              {/* Top Lid Flap */}
              <rect
                x={startX + W + D}
                y={startY - D}
                width={W}
                height={D}
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <path
                d={`M ${startX + W + D} ${startY - D} L ${startX + W + D + 10} ${startY - D - F} L ${startX + W + D + W - 10} ${startY - D - F} L ${startX + W + D + W} ${startY - D}`}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX + W + D + W / 2} y={startY - D / 2} fill="#2563EB" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                TOP LID ({W} x {D})
              </text>

              {/* Bottom Lid Flap */}
              <rect
                x={startX + W + D}
                y={startY + H}
                width={W}
                height={D}
                fill="#F1F5F9"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <path
                d={`M ${startX + W + D} ${startY + H + D} L ${startX + W + D + 10} ${startY + H + D + F} L ${startX + W + D + W - 10} ${startY + H + D + F} L ${startX + W + D + W} ${startY + H + D}`}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.8"
              />
              <text x={startX + W + D + W / 2} y={startY + H + D / 2} fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                BOTTOM LID
              </text>

              {/* Glue Tab */}
              <polygon
                points={`${startX - D},${startY} ${startX - D - 15},${startY + 10} ${startX - D - 15},${startY + H - 10} ${startX - D},${startY + H}`}
                fill="#FEF2F2"
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Crease Lines */}
              <line x1={startX} y1={startY} x2={startX} y2={startY + H} stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="5,4" />
              <line x1={startX + W} y1={startY} x2={startX + W} y2={startY + H} stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="5,4" />
              <line x1={startX + W + D} y1={startY} x2={startX + W + D} y2={startY + H} stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="5,4" />
              <line x1={startX + W + D} y1={startY} x2={startX + W + D + W} y2={startY} stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="5,4" />
              <line x1={startX + W + D} y1={startY + H} x2={startX + W + D + W} y2={startY + H} stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="5,4" />

              {/* Bleed Line */}
              <rect
                x={startX - D - 20}
                y={startY - D - F - 10}
                width={totalWidth - 40}
                height={totalHeight - 40}
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Dimension Text */}
              <text x={startX + W / 2} y={startY - 15} fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="600">
                W = {W} mm
              </text>
              <text x={startX + W + D + W + 15} y={startY + H / 2} fill="#64748B" fontSize="11" textAnchor="start" dominantBaseline="middle" fontWeight="600">
                H = {H} mm
              </text>
              <text x={startX + W + D / 2} y={startY - 15} fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="600">
                D = {D} mm
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
