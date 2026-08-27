'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  Settings,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Save,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { getCurrentUser, logoutUser, updateUserProfile } from '../../lib/authService';
import { getUserOrdersFromSupabase } from '../../lib/supabaseService';
import MobileBottomNav from '../../components/MobileBottomNav';

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'
  const [statusFilter, setStatusFilter] = useState('all');

  // Profile Edit Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Selected Order Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login?redirect=/dashboard&msg=login_required');
        return;
      }

      setUser(currentUser);
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');

      // Load user orders from database
      const userOrders = await getUserOrdersFromSupabase(currentUser.email);
      setOrders(userOrders);
      setLoading(false);
    }
    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const updated = await updateUserProfile({
        fullName,
        phone,
        address
      });
      if (updated) {
        setUser(updated);
        setSaveSuccessMsg('Profil berjaya dikemaskini dalam pangkalan data!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai') || s.includes('siap')) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>SIAP & SELESAI</span>
        </span>
      );
    }
    if (s.includes('dihantar') || s.includes('proses')) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
          <span>DALAM PROSES CETAKAN</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
        <Package className="w-3 h-3 text-neutral-500" />
        <span>PESANAN DITERIMA</span>
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'process') return o.status.toLowerCase().includes('proses');
    if (statusFilter === 'completed') return o.status.toLowerCase().includes('selesai') || o.status.toLowerCase().includes('siap');
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
        <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
          MEMUATKAN PANEL DASHBOARD...
        </p>
      </div>
    );
  }

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email ? user.email.slice(0, 2).toUpperCase() : 'AG';

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col select-none">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 h-20 px-8 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <img
            src="/logo/ayezz-logo-01.svg"
            alt="AYEZZ GLOBAL Logo"
            className="h-6 w-auto transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/katalog"
            className="text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-colors hidden sm:block"
          >
            Katalog Desain
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Keluar</span>
          </button>
        </div>
      </header>

      {/* 2. USER HERO HEADER */}
      <section className="bg-[#111111] text-white py-12 px-8 sm:px-12 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl font-black font-mono text-white shadow-inner">
              {avatarInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {user?.fullName || 'Pengguna AYEZZ'}
                </h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>AKAUN TERBUKTI SAH</span>
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 flex items-center space-x-3">
                <span>{user?.email}</span>
                {user?.phone && <span>• {user.phone}</span>}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl">
            <div className="text-center px-4 border-r border-neutral-800">
              <span className="text-2xl font-black font-mono text-white">{orders.length}</span>
              <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest pt-0.5">
                JUMLAH TEMPAHAN
              </p>
            </div>

            <div className="text-center px-4">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {orders.filter((o) => o.status.toLowerCase().includes('selesai')).length}
              </span>
              <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest pt-0.5">
                TEMPAHAN SELESAI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-8 sm:px-12 py-10 flex-1 space-y-8">
        {/* TAB SWITCHER */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                activeTab === 'orders'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Pesanan Saya ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Tetapan Profil</span>
            </button>
          </div>

          <Link
            href="/katalog"
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold uppercase tracking-widest rounded-full transition-all hidden sm:flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tempah Desain Baru</span>
          </Link>
        </div>

        {/* TAB 1: PESANAN SAYA */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Status Filter */}
            {orders.length > 0 && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-neutral-400 font-bold uppercase tracking-wider pr-2">PENAPIS:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Semua ({orders.length})
                </button>
                <button
                  onClick={() => setStatusFilter('process')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'process' ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Dalam Proses
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'completed' ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Siap & Selesai
                </button>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="py-20 text-center bg-[#F5F5F7] rounded-3xl border border-neutral-200/80 p-10 space-y-4 max-w-md mx-auto">
                <Package className="w-12 h-12 text-neutral-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase text-[#111111]">Tiada Pesanan Dijumpai</h3>
                  <p className="text-xs text-neutral-500 font-normal">
                    Anda belum membuat sebarang tempahan jersi kustom. Jelajah katalog dan pilih reka bentuk jersi pilihan anda sekarang.
                  </p>
                </div>
                <Link
                  href="/katalog"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#111111] text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all pt-2"
                >
                  <span>Jelajah Katalog Sekarang →</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-black text-[#111111] bg-neutral-100 px-3 py-1 rounded-lg">
                          #{order.id}
                        </span>
                        <span className="text-xs font-mono text-neutral-400 font-medium">
                          {order.date}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>

                      <div>
                        <h3 className="text-lg font-black uppercase text-[#111111] tracking-tight">
                          {order.template}
                        </h3>
                        <p className="text-xs text-neutral-500 font-mono pt-1">
                          Potongan: <strong className="text-neutral-800">{order.cutType}</strong> • Fabrik: <strong className="text-neutral-800">{order.fabricMaterial}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                          JUMLAH / KUANTITI
                        </span>
                        <span className="text-lg font-black font-mono text-[#111111]">
                          {order.total} <span className="text-xs font-normal text-neutral-500">({order.qty} Unit)</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-[#111111] text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <span>Butiran Spesifikasi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TETAPAN PROFIL */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-[#F5F5F7] border border-neutral-200/80 rounded-3xl p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-[#111111]">Kemaskini Maklumat Profil</h3>
              <p className="text-xs text-neutral-500 font-normal">
                Maklumat ini digunakan untuk penghantaran resit tempahan dan alamat penghantaran pesanan jersi anda.
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  NAMA PENUH
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Muhammad Ali"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  ALAMAT EMEL (HANYA BACAAN)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-neutral-200/60 border border-neutral-300/80 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-neutral-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  NOMBOR TELEFON / WHATSAPP
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: +60123456789"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  ALAMAT PENGHANTARAN PESANAN
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat penuh rumah / premis untuk penghantaran..."
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Simpan Kemaskini Profil</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* 4. ORDER SPECIFICATION MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-neutral-200">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                RESIT SPESIFIKASI PESANAN
              </span>
              <h3 className="text-xl font-black uppercase text-[#111111]">
                #{selectedOrder.id}
              </h3>
            </div>

            <div className="space-y-3 bg-[#F5F5F7] p-4 rounded-2xl border border-neutral-200/80 text-xs font-mono">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Reka Bentuk:</span>
                <span className="font-bold text-[#111111]">{selectedOrder.template}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Jenis Potongan / Kolar:</span>
                <span className="font-bold text-[#111111]">{selectedOrder.cutType}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Jenis Fabrik Sublimasi:</span>
                <span className="font-bold text-[#111111]">{selectedOrder.fabricMaterial}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Tarikh Pesanan:</span>
                <span className="font-bold text-[#111111]">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status Semasa:</span>
                <span className="font-bold text-emerald-700">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Size Matrix Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                PECAHAN SAIZ PESANAN (SIZE BREAKDOWN)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {Object.entries(selectedOrder.sizeBreakdown || {}).length > 0 ? (
                  Object.entries(selectedOrder.sizeBreakdown).map(([sz, qty]) => (
                    <div key={sz} className="bg-neutral-100 p-2.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold block">{sz}</span>
                      <span className="text-sm font-black text-[#111111]">{qty} Unit</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-3 bg-neutral-100 text-neutral-500 rounded-xl text-xs">
                    Saiz Standard (1 Unit)
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-widest block">
                  JUMLAH KESELURUHAN
                </span>
                <span className="text-xl font-black font-mono text-[#111111]">
                  {selectedOrder.total}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold uppercase tracking-widest"
              >
                Tutup Resit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#111111] text-white py-6 border-t border-neutral-900 mt-auto pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="font-mono text-neutral-400 text-[10px] tracking-widest uppercase">
            © 2026 AYEZZ GLOBAL — HAK CIPTA TERELIHARA
          </span>
          <div className="flex items-center space-x-6 text-neutral-400 font-mono text-[10px]">
            <Link href="/katalog" className="hover:text-white transition-colors">KATALOG</Link>
            <Link href="/login" className="hover:text-white transition-colors">AKAUN</Link>
          </div>
        </div>
      </footer>

      {/* MOBILE APP BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav currentUser={user} />
    </div>
  );
}
