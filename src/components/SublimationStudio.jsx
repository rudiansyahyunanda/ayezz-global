import React, { useState } from 'react';
import {
  Shirt,
  Layers,
  Palette,
  Type,
  Upload,
  Sparkles,
  ArrowLeft,
  Check,
  ShoppingBag
} from 'lucide-react';
import Sublimation3DCanvas from './3d/Sublimation3DCanvas';
import SublimationPatternCanvas from './dieline/SublimationPatternCanvas';
import OrderSummaryModal from './modals/OrderSummaryModal';
import { APPAREL_MODELS, FABRIC_TYPES } from '../data/sublimationProducts';

export default function SublimationStudio({ onBackToStorefront, initialModelId = 'jersey_futsal' }) {
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'colors' | 'player' | 'logo' | 'fabric'
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'pattern'
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('Jersi Kustom #01');

  const defaultModel = APPAREL_MODELS.find(m => m.id === initialModelId) || APPAREL_MODELS[0];
  const [selectedModel, setSelectedModel] = useState(defaultModel);

  const [colors, setColors] = useState(defaultModel.defaultColors);
  const [patternStyle, setPatternStyle] = useState('clean');

  const [playerName, setPlayerName] = useState('AYEZ');
  const [playerNumber, setPlayerNumber] = useState('10');

  const [teamLogo, setTeamLogo] = useState(null);
  const [sponsorLogo, setSponsorLogo] = useState(null);

  const [selectedFabric, setSelectedFabric] = useState(FABRIC_TYPES[0].name);
  const [cameraView, setCameraView] = useState('front');
  const [autoRotate] = useState(false);

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setColors(model.defaultColors);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (type === 'team') setTeamLogo({ img, src: event.target.result });
        if (type === 'sponsor') setSponsorLogo({ img, src: event.target.result });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#F8FAFC] text-slate-800 overflow-hidden select-none font-sans">
      {/* STUDIO TOP HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToStorefront}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Katalog</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center space-x-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center font-black text-white text-xs shadow-sm">
              A
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border border-transparent hover:border-slate-300 focus:border-[#111111] focus:bg-white rounded px-2 py-0.5 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-5">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Studio 3D</span>
            </button>

            <button
              onClick={() => setViewMode('pattern')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'pattern'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pola 2D Sublimasi</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <span>Anggaran Harga:</span>
            <span className="text-[#111111] font-extrabold text-sm">
              RM {selectedModel.price.toLocaleString('en-MY')} / pcs
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan Kustom</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT ICON SIDEBAR */}
        <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 space-y-3 z-10 shadow-sm">
          {[
            { id: 'model', label: 'Model', icon: Shirt },
            { id: 'colors', label: 'Warna', icon: Palette },
            { id: 'player', label: 'Nama/No', icon: Type },
            { id: 'logo', label: 'Logo', icon: Upload },
            { id: 'fabric', label: 'Kain', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-bold mt-1">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* LEFT DRAWER PANEL */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-10">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              Tetapan {activeTab.toUpperCase()}
            </h2>
          </div>

          <div className="p-4 space-y-6 flex-1">
            {/* MODEL PANEL */}
            {activeTab === 'model' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Pilih jenis produk sublimasi:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {APPAREL_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModel(m)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                        selectedModel.id === m.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-sm font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{m.name}</span>
                          {selectedModel.id === m.id && <Check className="w-3.5 h-3.5 text-[#111111]" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{m.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS PANEL */}
            {activeTab === 'colors' && (
              <div className="space-y-5">
                {[
                  { key: 'body', label: 'Warna Badan' },
                  { key: 'sleeves', label: 'Warna Lengan' },
                  { key: 'collar', label: 'Warna Kolar' },
                  { key: 'accents', label: 'Warna Jalur Aksen' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {item.label}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={colors[item.key] || '#0F172A'}
                        onChange={(e) => setColors(prev => ({ ...prev, [item.key]: e.target.value }))}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-300"
                      />
                      <input
                        type="text"
                        value={colors[item.key] || '#0F172A'}
                        onChange={(e) => setColors(prev => ({ ...prev, [item.key]: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-lg px-3 py-2 uppercase flex-1 font-semibold"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Corak Sublimasi Sisi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'clean', label: 'Clean Solid' },
                      { id: 'stripes', label: 'Side Stripe' },
                      { id: 'diagonal', label: 'Diagonal' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPatternStyle(p.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          patternStyle === p.id
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLAYER NAME & NUMBER PANEL */}
            {activeTab === 'player' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pemain (Belakang)
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={15}
                    placeholder="Contoh: AYEZ"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl px-3.5 py-2.5 uppercase outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombor Pemain
                  </label>
                  <input
                    type="text"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                    maxLength={3}
                    placeholder="Contoh: 10"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl px-3.5 py-2.5 uppercase outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-900">Sudut Pandangan Kamera</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'front', label: 'Depan' },
                      { id: 'back', label: 'Belakang' },
                      { id: 'side', label: 'Sisi' }
                    ].map((cam) => (
                      <button
                        key={cam.id}
                        onClick={() => setCameraView(cam.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          cameraView === cam.id
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {cam.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOGO UPLOAD PANEL */}
            {activeTab === 'logo' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Muat Naik Logo Pasukan (Dada Kiri)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl cursor-pointer bg-slate-50 transition-all group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-900 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Muat Naik Logo PNG</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'team')} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Muat Naik Logo Penaja (Dada Tengah)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl cursor-pointer bg-slate-50 transition-all group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-900 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Muat Naik Penaja PNG</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'sponsor')} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* FABRIC PANEL */}
            {activeTab === 'fabric' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Pilih jenis kain sublimasi:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {FABRIC_TYPES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFabric(f.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedFabric === f.name
                          ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>{f.name}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">{f.tier}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER VIEWPORT */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#F8FAFC]">
          {viewMode === '3d' ? (
            <Sublimation3DCanvas
              modelType={selectedModel.id}
              colors={colors}
              playerName={playerName}
              playerNumber={playerNumber}
              teamLogo={teamLogo}
              sponsorLogo={sponsorLogo}
              patternStyle={patternStyle}
              cameraView={cameraView}
              autoRotate={autoRotate}
            />
          ) : (
            <SublimationPatternCanvas
              modelName={selectedModel.name}
              colors={colors}
              playerName={playerName}
              playerNumber={playerNumber}
            />
          )}
        </main>
      </div>

      <OrderSummaryModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        selectedModel={selectedModel}
        colors={colors}
        playerName={playerName}
        playerNumber={playerNumber}
        selectedFabric={selectedFabric}
      />
    </div>
  );
}
