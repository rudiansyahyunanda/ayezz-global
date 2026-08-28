'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, ArrowRight, AlertCircle, RefreshCw, Mail, Lock } from 'lucide-react';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { isAdminAuthenticated, loginAdminWithEmailPassword } from '../../lib/authService';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@ayezz.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const authStatus = isAdminAuthenticated();
    setIsAuthenticated(authStatus);
    setIsChecking(false);
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await loginAdminWithEmailPassword(adminEmail.trim(), adminPassword.trim());
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setErrorMessage(res.message || 'Email atau Kata Laluan Admin Tidak Sah');
      }
    } catch (err) {
      setErrorMessage('Ralat sambungan login admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 select-none">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  // If NOT Authenticated: Render Secure Email & Password Admin Portal Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4 selection:bg-white selection:text-black font-sans select-none">
        <div className="w-full max-w-md bg-[#131B2E] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* HEADER */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
                PORTAL KAWALAN ADMIN • AYEZZ GLOBAL
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Log Masuk Admin
              </h1>
              <p className="text-xs text-slate-400 font-normal">
                Sila masukkan Email & Kata Laluan Akaun Admin anda.
              </p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@ayezz.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-white rounded-xl text-sm font-mono text-white placeholder:text-slate-500 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Kata Laluan (Password) / Master PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Masukkan kata laluan admin..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-white rounded-xl text-sm font-mono text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Kredensial Master Lalai: admin@ayezz.com • Password: Adminayezz2026!
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Mengesahkan Portal...' : 'Pengesahan Admin'}</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
            >
              ← Kembali ke Laman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      onSwitchToStorefront={() => router.push('/')}
      onLogoutAdmin={() => {
        setIsAuthenticated(false);
      }}
    />
  );
}
