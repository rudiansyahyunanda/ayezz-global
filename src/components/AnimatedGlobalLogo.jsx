import React from 'react';
import { Globe } from 'lucide-react';

export default function AnimatedGlobalLogo() {
  return (
    <div className="flex items-center space-x-3.5 group cursor-pointer select-none">
      {/* Official AYEZZ Vector SVG Logo */}
      <img
        src="/logo/ayezz-logo-01.svg"
        alt="AYEZZ Logo"
        className="h-7 sm:h-8 w-auto brightness-0 invert filter drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform duration-300"
      />

      {/* Separator Divider */}
      <span className="h-5 w-px bg-slate-800/80" />

      {/* Animated GLOBAL Badge Capsule */}
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/30 group-hover:border-sky-400 transition-all shadow-lg shadow-sky-500/10 backdrop-blur-md">
        {/* Revolving Wireframe Globe Icon */}
        <Globe className="w-3.5 h-3.5 text-[#38BDF8] animate-spin-slow" />

        {/* Animated GLOBAL Text with Pulsing Telemetry Dot */}
        <span className="text-[11px] font-black font-mono tracking-[0.25em] text-white group-hover:text-[#38BDF8] transition-colors flex items-center">
          <span>GLOBAL</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping ml-1.5 inline-block" />
        </span>
      </div>
    </div>
  );
}
