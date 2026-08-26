import React, { useState } from 'react';
import {
  Box,
  Layers,
  Sparkles,
  ArrowRight,
  Camera,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import Packaging3DCanvas from './3d/Packaging3DCanvas';
import { PRESET_DESIGNS } from '../data/packagingTemplates';

export default function LandingPage({ onLaunchStudio }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Box', 'Cosmetics', 'Beverage', 'E-Commerce', 'Luxury'];

  const filteredPresets = activeCategory === 'All'
    ? PRESET_DESIGNS
    : PRESET_DESIGNS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col font-sans">
      {/* TOP NAVIGATION HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-clean">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-base shadow-clean">
              P
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Pacdora <span className="text-xs font-semibold text-slate-500 ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">3D Packaging</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#dielines" className="hover:text-slate-900 transition-colors">Dieline Generator</a>
            <a href="#templates" className="hover:text-slate-900 transition-colors">Mockup Gallery</a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onLaunchStudio}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-clean transition-all active:scale-95"
            >
              <span>Launch 3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Next-Gen Packaging Design & Dieline Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Packaging design, <br />
              <span className="text-blue-600">dielines & 3D renders</span> <br />
              made effortless.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              An all-in-one web tool to generate precision dielines, preview 3D folded mockups in real-time WebGL, apply realistic materials, and render 4K visuals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onLaunchStudio}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-clean flex items-center justify-center space-x-2.5 transition-all text-sm active:scale-95"
              >
                <span>Start Designing Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#templates"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all text-sm shadow-clean"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Browse Mockups</span>
              </a>
            </div>

            {/* Clean Stats */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center sm:text-left">
              <div>
                <div className="text-2xl font-bold text-slate-900">50,000+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Ready Dielines</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">10M+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">3D Renders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">99.9%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Manufacturing Precision</div>
              </div>
            </div>
          </div>

          {/* Right Live 3D Interactive Card Showcase */}
          <div className="lg:col-span-6">
            <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-clean-xl relative overflow-hidden">
              <div className="h-[430px] rounded-2xl overflow-hidden bg-[#F8FAFC]">
                <Packaging3DCanvas
                  modelType="tuck_box"
                  dimensions={{ width: 80, height: 130, depth: 55 }}
                  foldProgress={100}
                  colors={{ front: '#FFFFFF', back: '#FFFFFF', left: '#F8FAFC', right: '#F8FAFC', top: '#0F172A', bottom: '#F8FAFC' }}
                  materialType="glossy"
                  lightingPreset="neutral"
                  autoRotate={true}
                />
              </div>

              {/* Floating Pill Info */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 flex items-center justify-between shadow-clean-md">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Interactive Real-Time 3D WebGL
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Drag canvas to rotate • Scroll to zoom</div>
                </div>

                <button
                  onClick={onLaunchStudio}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-clean transition-all"
                >
                  Edit in Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Core Workflow</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Modern Packaging Tools for Creators</h3>
            <p className="text-slate-500 text-sm">
              Replace slow back-and-forth mockups. Create 2D structural blueprints, fold them into 3D, and generate production renders instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-clean">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">1. Parametric 2D Dielines</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enter custom dimensions in millimeters to generate print-ready structural dielines with cut, crease, and bleed line specs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-clean">
                <Box className="w-5 h-5 text-slate-900" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">2. 3D WebGL Studio</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Apply colors and upload brand logos. Move the fold slider (0-100%) to watch 2D sheets dynamically fold into 3D boxes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-clean">
                <Camera className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">3. 4K Raytrace Render Export</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Simulate matte paper, kraft cardboard, glossy plastic, and metallic foil sheen. Export studio renders in 4K PNG format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATE GALLERY */}
      <section id="templates" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Template Gallery</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Packaging Models & Presets</h3>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-clean">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-clean'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={onLaunchStudio}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-clean hover:shadow-clean-lg transition-all cursor-pointer group overflow-hidden flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={preset.thumbnail}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-800 rounded-md border border-slate-200">
                    {preset.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{preset.modelName}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Open in Studio</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-xs font-medium">
          <div className="flex items-center space-x-2.5">
            <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-xs">
              P
            </span>
            <span className="text-sm font-bold text-slate-900">Pacdora 3D</span>
          </div>

          <div>
            © 2026 Pacdora 3D Packaging Design Platform. Clean Minimalist Architecture.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
