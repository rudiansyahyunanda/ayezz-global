import React, { useState } from 'react';
import { X, Camera, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PLACEHOLDER_IMAGE } from '../../lib/supabaseService';

export default function RenderStudioModal({ isOpen, onClose, onCaptureRender, currentModelName = 'Straight Tuck Box' }) {
  const [resolution, setResolution] = useState('1080p');
  const [backdrop, setBackdrop] = useState('light');
  const [isRendering, setIsRendering] = useState(false);
  const [renderedImage, setRenderedImage] = useState(null);

  if (!isOpen) return null;

  const handleGenerateRender = () => {
    setIsRendering(true);
    setTimeout(() => {
      if (onCaptureRender) {
        const imgData = onCaptureRender(resolution, backdrop);
        setRenderedImage(imgData || PLACEHOLDER_IMAGE);
      } else {
        setRenderedImage(PLACEHOLDER_IMAGE);
      }
      setIsRendering(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 1000);
  };

  const handleDownload = () => {
    if (!renderedImage) return;
    const a = document.createElement('a');
    a.href = renderedImage;
    a.download = `Pacdora_Render_${resolution}_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-clean-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">HD Studio Render Export</h3>
              <p className="text-xs text-slate-500">Capture production-ready 3D mockup renders</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Resolution Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setResolution('1080p')}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                    resolution === '1080p'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div>1080p Full HD</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">1920 x 1080 px</div>
                </button>

                <button
                  onClick={() => setResolution('4K')}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                    resolution === '4K'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>4K Ultra HD</span>
                    <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded">PRO</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">3840 x 2160 px</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Studio Backdrop
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'light', label: 'Studio Clean White', color: 'bg-white border-slate-300' },
                  { id: 'slate', label: 'Minimalist Gray', color: 'bg-slate-200' },
                  { id: 'transparent', label: 'Transparent PNG', color: 'bg-slate-800' },
                  { id: 'dark', label: 'Dark Charcoal', color: 'bg-slate-950' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBackdrop(item.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                      backdrop === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateRender}
              disabled={isRendering}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-clean flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isRendering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Raytracing Render...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Generate High-Res Render</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 min-h-[240px] relative">
            {renderedImage ? (
              <div className="w-full flex flex-col items-center">
                <img
                  src={renderedImage}
                  alt="3D Render"
                  className="max-h-[190px] object-contain rounded-lg border border-slate-200 shadow-clean"
                />
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 shadow-clean"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image (PNG)</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <ImageIcon className="w-10 h-10 stroke-[1.2] mx-auto text-slate-300" />
                <p className="text-xs font-medium">Click "Generate" to preview image render</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
