import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

export default function InteractiveLogo({ onTriggerStudio }) {
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'morph' | 'launch' | 'return'

  const handleLogoClick = () => {
    if (animPhase !== 'idle') return;
    triggerRocketSequence();
  };

  const triggerRocketSequence = () => {
    // 1. Morph to Rocket
    setAnimPhase('morph');

    // 2. Launch Upward
    setTimeout(() => {
      setAnimPhase('launch');
    }, 600);

    // 3. Glide back in from bottom
    setTimeout(() => {
      setAnimPhase('return');
    }, 1800);

    // 4. Return to Idle Logo
    setTimeout(() => {
      setAnimPhase('idle');
    }, 2500);
  };

  // Auto trigger rocket launch every 10 seconds for subtle wow effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (animPhase === 'idle') {
        triggerRocketSequence();
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [animPhase]);

  return (
    <div
      onClick={handleLogoClick}
      className="relative flex items-center space-x-3 cursor-pointer group select-none py-1 px-2 rounded-xl hover:bg-slate-900/60 transition-colors"
      title="Klik logo untuk peluncuran roket 3D!"
    >
      {/* LOGO ICON / ROCKET MORPH CONTAINER */}
      <div className="relative w-9 h-9 flex items-center justify-center">
        {/* Glow Aura Spot under Logo */}
        <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md group-hover:bg-sky-400/40 transition-all" />

        {/* LOGO STATE 1: Official SVG Logo Icon */}
        <div
          className={`absolute transition-all duration-500 ease-out flex items-center justify-center ${
            animPhase === 'idle'
              ? 'opacity-100 scale-100 rotate-0'
              : animPhase === 'morph'
              ? 'opacity-0 scale-50 -rotate-45'
              : 'opacity-0 scale-0'
          }`}
        >
          <img
            src="/logo/ayezz-logo-01.svg"
            alt="AYEZZ Logo"
            className="h-7 w-auto brightness-0 invert filter drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />
        </div>

        {/* LOGO STATE 2 & 3: Rocket Morphing & Blast-Off Launch */}
        <div
          className={`absolute text-sky-400 transition-all duration-700 ease-in-out flex flex-col items-center justify-center ${
            animPhase === 'morph'
              ? 'opacity-100 scale-110 rotate-0 translate-y-0'
              : animPhase === 'launch'
              ? 'opacity-0 scale-125 -translate-y-24 rotate-12'
              : animPhase === 'return'
              ? 'opacity-100 scale-90 translate-y-6 rotate-0'
              : 'opacity-0 scale-0'
          }`}
        >
          <Rocket className="w-6 h-6 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-pulse" />

          {/* Plasma Rocket Flame Thrust Sparks */}
          {(animPhase === 'morph' || animPhase === 'launch') && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-1.5 h-4 bg-gradient-to-t from-transparent via-cyan-400 to-sky-300 rounded-full animate-ping" />
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* TEXT BRAND MARK */}
      <div className="flex flex-col">
        <span className="text-base font-black tracking-tight text-white leading-none flex items-center space-x-1">
          <span>AYEZ</span>
          <span className="text-[#38BDF8] font-normal text-xs">Apparel</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mt-0.5">
          {animPhase === 'launch' ? '🚀 ROCKET LAUNCH!' : 'Galaxy Tech Studio'}
        </span>
      </div>
    </div>
  );
}
