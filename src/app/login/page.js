'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginUser, signUpUser, getCurrentUser } from '../../lib/authService';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/katalog';
  const msgParam = searchParams.get('msg');

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        router.push(redirectUrl);
      }
    }
    checkAuth();
  }, [redirectUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        if (!fullName) {
          throw new Error('Sila masukkan nama penuh anda.');
        }
        await signUpUser(email, password, fullName);
      }

      // Successfully logged in / signed up -> redirect back to intended page
      router.push(redirectUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Ralat log masuk/pendaftaran. Sila semak emel dan kata laluan anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] font-sans antialiased flex flex-col justify-between select-none">
      {/* HEADER BAR */}
      <header className="w-full px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="h-6 w-auto transition-transform group-hover:scale-105" />
        </Link>
        <Link href={redirectUrl} className="text-xs font-bold text-neutral-500 hover:text-black flex items-center space-x-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </header>

      {/* CENTER LOGIN FORM CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-xl border border-neutral-200/80 space-y-8">
          
          {/* TITLE & NOTICE */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em] block">
              AKAUN PELANGGAN AYEZZ GLOBAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111]">
              {mode === 'login' ? 'Log Masuk Akaun' : 'Daftar Akaun Baharu'}
            </h1>
            <p className="text-xs text-neutral-500 font-normal">
              {msgParam === 'login_required'
                ? 'Sila log masuk atau mendaftar akaun untuk meneruskan tempahan custom jersi anda.'
                : mode === 'login'
                ? 'Masukkan emel dan kata laluan anda untuk akses spesifikasi tempahan.'
                : 'Cipta akaun baharu untuk menyimpan katalog dan spesifikasi tempahan.'}
            </p>
          </div>

          {/* DUAL MODE TABS: LOG MASUK / DAFTAR */}
          <div className="flex items-center p-1 bg-[#F5F5F7] rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-[#111111] shadow-2xs' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Log Masuk
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white text-[#111111] shadow-2xs' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Daftar Akaun
            </button>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM INPUTS */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  NAMA PENUH
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama penuh anda..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-2xl text-xs font-medium outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                ALAMAT EMEL
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-2xl text-xs font-medium outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                KATA LALUAN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#F5F5F7] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-2xl text-xs font-medium outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{mode === 'login' ? 'Log Masuk Sekarang' : 'Daftar Akaun Baharu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs font-mono text-neutral-400">
        © 2026 AYEZZ GLOBAL — Sistem Keselamatan Log Masuk Pelanggan
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-xs font-mono">
        Memuatkan Halaman Log Masuk...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
