import React, { useState } from 'react';
import {
  Box,
  Layers,
  Sparkles,
  Sliders,
  Palette,
  Sun,
  Camera,
  FolderOpen,
  ArrowLeft,
  Check,
  Upload
} from 'lucide-react';
import Packaging3DCanvas from './3d/Packaging3DCanvas';
import Dieline2DCanvas from './dieline/Dieline2DCanvas';
import RenderStudioModal from './modals/RenderStudioModal';
import {
  PACKAGING_MODELS,
  PRESET_DESIGNS,
  LIGHTING_PRESETS,
  MATERIAL_TYPES
} from '../data/packagingTemplates';

export default function PacdoraStudio({ onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('models');
  const [viewMode, setViewMode] = useState('3d');
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('Custom Packaging #01');

  const [selectedModel, setSelectedModel] = useState(PACKAGING_MODELS[0]);
  const [dimensions, setDimensions] = useState({
    width: 80,
    height: 120,
    depth: 50,
    thickness: 1.5,
    flap: 20
  });

  const [foldProgress, setFoldProgress] = useState(100);

  const [activeFace, setActiveFace] = useState('front');
  const [colors, setColors] = useState({
    front: '#FFFFFF',
    back: '#FFFFFF',
    left: '#F8FAFC',
    right: '#F8FAFC',
    top: '#0F172A',
    bottom: '#F8FAFC'
  });

  const [uploadedArtworks, setUploadedArtworks] = useState({});
  const [artworkSettings, setArtworkSettings] = useState({
    scale: 0.6,
    posX: 0,
    posY: 0,
    rotation: 0
  });

  const [selectedMaterial, setSelectedMaterial] = useState('cardboard');
  const [selectedLighting, setSelectedLighting] = useState('neutral');
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraView, setCameraView] = useState('hero');

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setDimensions(model.defaultDims);
    setFoldProgress(100);
  };

  const handleDimensionChange = (key, val) => {
    setDimensions(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleFaceColorChange = (hex) => {
    setColors(prev => ({ ...prev, [activeFace]: hex }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedArtworks(prev => ({
          ...prev,
          [activeFace]: {
            img: img,
            src: event.target.result,
            scale: artworkSettings.scale,
            posX: artworkSettings.posX,
            posY: artworkSettings.posY,
            rotation: artworkSettings.rotation
          }
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleArtworkSettingChange = (key, value) => {
    const val = Number(value);
    setArtworkSettings(prev => {
      const updated = { ...prev, [key]: val };
      if (uploadedArtworks[activeFace]) {
        setUploadedArtworks(curr => ({
          ...curr,
          [activeFace]: {
            ...curr[activeFace],
            [key]: val
          }
        }));
      }
      return updated;
    });
  };

  const handleApplyPreset = (preset) => {
    const matchedModel = PACKAGING_MODELS.find(m => m.id === preset.modelId) || PACKAGING_MODELS[0];
    setSelectedModel(matchedModel);
    setDimensions(preset.dims);
    setColors(preset.colors);
    setSelectedMaterial(preset.material);
    setSelectedLighting(preset.lighting);
    setProjectName(preset.title);
    setFoldProgress(100);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#F8FAFC] text-slate-800 overflow-hidden select-none">
      {/* STUDIO TOP NAVIGATION HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between z-20 shadow-clean">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Landing</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* Logo & Project Title */}
          <div className="flex items-center space-x-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-clean">
              P
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded px-2 py-0.5 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* View Mode Switcher & Fold Slider */}
        <div className="flex items-center space-x-5">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-white text-slate-900 shadow-clean'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </button>

            <button
              onClick={() => setViewMode('dieline')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dieline'
                  ? 'bg-white text-slate-900 shadow-clean'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Dieline</span>
            </button>
          </div>

          {/* Fold / Unfold Interactive Slider */}
          {viewMode === '3d' && (
            <div className="hidden lg:flex items-center space-x-3 bg-white border border-slate-200 px-3.5 py-1 rounded-xl shadow-clean">
              <span className="text-[11px] font-semibold text-slate-500">Fold Box:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={foldProgress}
                onChange={(e) => setFoldProgress(Number(e.target.value))}
                className="w-28 h-1.5 accent-slate-900 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900 w-8">{foldProgress}%</span>
            </div>
          )}
        </div>

        {/* Export & Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRenderModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-clean transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Render HD</span>
          </button>
        </div>
      </header>

      {/* STUDIO MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TOOLBAR ICON NAV */}
        <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 space-y-3 z-10 shadow-clean">
          {[
            { id: 'models', label: 'Models', icon: Box },
            { id: 'dimensions', label: 'Params', icon: Sliders },
            { id: 'artwork', label: 'Artwork', icon: Palette },
            { id: 'materials', label: 'Finish', icon: Sparkles },
            { id: 'lighting', label: 'Studio', icon: Sun },
            { id: 'templates', label: 'Presets', icon: FolderOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-clean'
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

        {/* LEFT CONFIGURATION PANEL DRAWER */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-10">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              {activeTab} Controls
            </h2>
          </div>

          <div className="p-4 space-y-6 flex-1">
            {/* MODELS PANEL */}
            {activeTab === 'models' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Select packaging model:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {PACKAGING_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                        selectedModel.id === model.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-clean font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{model.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{model.name}</span>
                          {selectedModel.id === model.id && (
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{model.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DIMENSIONS PANEL */}
            {activeTab === 'dimensions' && (
              <div className="space-y-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">Active Model:</span>
                  <span className="font-bold text-slate-900">{selectedModel.name}</span>
                </div>

                {[
                  { key: 'width', label: 'Width (W)', min: 30, max: 300, unit: 'mm' },
                  { key: 'height', label: 'Height (H)', min: 30, max: 400, unit: 'mm' },
                  { key: 'depth', label: 'Depth (D)', min: 20, max: 250, unit: 'mm' },
                  { key: 'thickness', label: 'Paper Thickness', min: 0.5, max: 5, step: 0.1, unit: 'mm' },
                  { key: 'flap', label: 'Tuck Flap Size', min: 5, max: 40, unit: 'mm' }
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono text-blue-600 font-bold">
                        {dimensions[item.key]} {item.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step || 1}
                      value={dimensions[item.key]}
                      onChange={(e) => handleDimensionChange(item.key, e.target.value)}
                      className="w-full h-1.5 accent-slate-900 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ARTWORK & COLOR PANEL */}
            {activeTab === 'artwork' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Box Face
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['front', 'back', 'left', 'right', 'top', 'bottom'].map((face) => (
                      <button
                        key={face}
                        onClick={() => setActiveFace(face)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                          activeFace === face
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {face}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {activeFace.toUpperCase()} Face Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={colors[activeFace] || '#FFFFFF'}
                      onChange={(e) => handleFaceColorChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-300"
                    />
                    <input
                      type="text"
                      value={colors[activeFace] || '#FFFFFF'}
                      onChange={(e) => handleFaceColorChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 rounded-lg px-3 py-2 uppercase flex-1 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Upload Logo / Artwork onto {activeFace.toUpperCase()}
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl cursor-pointer bg-slate-50 transition-all group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-900 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Upload PNG or JPG</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Transparent logo recommended</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {uploadedArtworks[activeFace] && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900">Logo Transformation</div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Scale</span>
                        <span>{Math.round(artworkSettings.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.5"
                        step="0.05"
                        value={artworkSettings.scale}
                        onChange={(e) => handleArtworkSettingChange('scale', e.target.value)}
                        className="w-full h-1.5 accent-slate-900"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Position X</span>
                        <span>{artworkSettings.posX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={artworkSettings.posX}
                        onChange={(e) => handleArtworkSettingChange('posX', e.target.value)}
                        className="w-full h-1.5 accent-slate-900"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Position Y</span>
                        <span>{artworkSettings.posY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={artworkSettings.posY}
                        onChange={(e) => handleArtworkSettingChange('posY', e.target.value)}
                        className="w-full h-1.5 accent-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MATERIALS PANEL */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Select material finish:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {MATERIAL_TYPES.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMaterial === mat.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{mat.name}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-normal">
                        <span>Roughness: {mat.roughness}</span>
                        <span>Metalness: {mat.metalness}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LIGHTING & STUDIO PANEL */}
            {activeTab === 'lighting' && (
              <div className="space-y-5">
                <p className="text-xs text-slate-500 font-medium">Select studio environment:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {LIGHTING_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedLighting(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedLighting === preset.id
                          ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{preset.icon}</div>
                      <div className="text-xs font-bold">{preset.name}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-900">Camera Presets</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hero', label: 'Hero 3/4' },
                      { id: 'front', label: 'Front View' },
                      { id: 'top', label: 'Top View' },
                      { id: 'iso', label: 'Isometric' }
                    ].map((cam) => (
                      <button
                        key={cam.id}
                        onClick={() => setCameraView(cam.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
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

                <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">Auto-Rotate Turntable</span>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                      autoRotate ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        autoRotate ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* PRESETS PANEL */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">Load pre-designed packaging:</p>
                <div className="space-y-2.5">
                  {PRESET_DESIGNS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all flex items-center space-x-3 group"
                    >
                      <img
                        src={preset.thumbnail}
                        alt={preset.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                          <span>{preset.title}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            {preset.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{preset.modelName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER VIEWPORT AREA */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#F8FAFC]">
          {viewMode === '3d' ? (
            <Packaging3DCanvas
              modelType={selectedModel.id}
              dimensions={dimensions}
              foldProgress={foldProgress}
              colors={colors}
              materialType={selectedMaterial}
              lightingPreset={selectedLighting}
              uploadedArtworks={uploadedArtworks}
              autoRotate={autoRotate}
              cameraView={cameraView}
            />
          ) : (
            <Dieline2DCanvas
              modelType={selectedModel.id}
              dimensions={dimensions}
              colors={colors}
            />
          )}
        </main>
      </div>

      <RenderStudioModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        currentModelName={selectedModel.name}
      />
    </div>
  );
}
