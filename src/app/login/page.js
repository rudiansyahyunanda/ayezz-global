'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';
import { loginUser, signUpUser, getCurrentUser, loginAdminWithEmailPassword } from '../../lib/authService';
import MobileBottomNav from '../../components/MobileBottomNav';

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

  // Gmail Fast Login Modal State
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [gmailLoading, setGmailLoading] = useState(false);

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
        // Check if email is admin email
        if (email.trim().toLowerCase() === 'admin@ayezz.com' || email.trim().toLowerCase() === 'shahrirwan93@gmail.com') {
          const res = await loginAdminWithEmailPassword(email, password || 'Ayezz');
          if (res.success) {
            router.push('/admin');
            return;
          }
        }
        await loginUser(email, password);
      } else {
        if (!fullName) {
          throw new Error('Sila masukkan nama penuh anda.');
        }
        await signUpUser(email, password, fullName);
      }

      router.push(redirectUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Ralat log masuk/pendaftaran. Sila semak emel dan kata laluan anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailSubmit = async (e) => {
    e.preventDefault();
    if (!gmailInput || !gmailInput.includes('@')) {
      alert('Sila masukkan alamat emel Gmail yang sah.');
      return;
    }
    setGmailLoading(true);
    try {
      const cleanG = gmailInput.trim().toLowerCase();
      // Check if this Gmail belongs to an Admin
      if (cleanG === 'shahrirwan93@gmail.com' || cleanG === 'admin@ayezz.com') {
        const res = await loginAdminWithEmailPassword(cleanG, 'Ayezz');
        if (res.success) {
          router.push('/admin');
          return;
        }
      }
      await loginUser(cleanG, 'gmail_oauth_pass');
      setIsGmailModalOpen(false);
      router.push(redirectUrl);
    } catch (err) {
      alert('Ralat log masuk Gmail: ' + (err.message || 'Sila cuba lagi.'));
    } finally {
      setGmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] font-sans antialiased flex flex-col justify-between select-none relative">
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
                  placeholder="nama@email.com"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-[0.99] shadow-xs"
            >
              <span>{mode === 'login' ? 'Log Masuk Akaun' : 'Daftar Akaun Baharu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* OAUTH SOCIAL LOGINS */}
          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
              ATAU TERUSKAN DENGAN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsGmailModalOpen(true)}
              className="py-3 px-4 bg-[#F5F5F7] hover:bg-neutral-200 border border-neutral-200 text-[#111111] text-xs font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGmailModalOpen(true)}
              className="py-3 px-4 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xs active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.97-14.57-6.3-3.23-2.76-7.14-7.46-11.75-14.09-6.39-9.23-11.66-19.8-15.82-31.72-4.16-11.92-6.24-23.36-6.24-34.33 0-14.28 3.52-25.86 10.57-34.73 7.04-8.88 15.88-13.37 26.53-13.48 4.7 0 9.77 1.15 15.22 3.44 5.45 2.3 9.4 3.44 11.84 3.44 2.17 0 6.06-1.15 11.66-3.44 5.61-2.29 10.37-3.38 14.29-3.28 12.02.47 21.6 4.9 28.74 13.29-10.74 6.47-16.01 15.42-15.81 26.85.2 11.43 5.76 20.67 16.68 27.72-3.41 9.87-8.15 19.38-14.23 28.53zM119.22 31.09c0-7.07 2.53-13.88 7.59-20.43 5.06-6.55 11.53-10.39 19.4-11.52.28 1.4.42 2.76.42 4.08 0 7.21-2.6 14.16-7.8 20.85-5.2 6.69-11.71 10.54-19.53 11.55-.07-1.12-.08-2.63-.08-4.53z"/>
              </svg>
              <span>Apple ID</span>
            </button>
          </div>
        </div>
      </main>

      {/* GMAIL FAST LOGIN MODAL */}
      {isGmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Log Masuk Google / Gmail</h3>
                  <p className="text-[11px] text-neutral-500 font-medium">Lanjutan akses pantas pelanggan AYEZZ Global</p>
                </div>
              </div>
              <button
                onClick={() => setIsGmailModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  ALAMAT EMEL GMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-neutral-200 focus:bg-white focus:border-[#111111] rounded-2xl text-xs font-semibold outline-none transition-all text-[#111111]"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>E-mel Gmail anda akan diselaraskan serta-merta dengan sistem tempahan jersi AYEZZ.</span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGmailModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={gmailLoading}
                  className="flex-1 py-3 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-colors shadow-xs"
                >
                  {gmailLoading ? 'Memuatkan...' : 'Teruskan Log Masuk →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs font-mono text-neutral-400 pb-20 md:pb-6">
        © 2026 AYEZZ GLOBAL — Sistem Keselamatan Log Masuk Pelanggan
      </footer>

      {/* MOBILE APP BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav />
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
