'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  User,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Save,
  RefreshCw,
  X,
  Printer,
  Download,
  Menu,
  ArrowRight,
  Sparkles,
  Star,
  Upload,
  Send,
  Sliders,
  Layers,
  CreditCard,
  Globe
} from 'lucide-react';

import { getCurrentUser, logoutUser, updateUserProfile } from '../../lib/authService';
import {
  getUserOrdersFromSupabase,
  getCutTypes,
  getFabricTypes,
  getDesignTemplates,
  saveOrderToSupabase,
  PLACEHOLDER_IMAGE
} from '../../lib/supabaseService';

import {
  CUT_TYPES as FALLBACK_CUTS,
  FABRIC_TYPES as FALLBACK_FABRICS
} from '../../data/sublimationProducts';

import { uploadDirectToSupabaseStorage } from '../../lib/imageService';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cutTypes, setCutTypes] = useState(FALLBACK_CUTS);
  const [fabricTypes, setFabricTypes] = useState(FALLBACK_FABRICS);
  const [loading, setLoading] = useState(true);

  // 2-Panel Sidebar Navigation state: 'overview' | 'new-order' | 'orders' | 'invoices' | 'profile'
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Search states for Orders & Invoices
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Selected Order for Detail Modal Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Selected Order for Invoice Modal Viewer
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // ----------------------------------------------------
  // PROFILE EDIT FORM STATE
  // ----------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // ----------------------------------------------------
  // NEW ORDER CONFIGURATOR STATE (FORM PESANAN)
  // ----------------------------------------------------
  const [orderTemplateName, setOrderTemplateName] = useState('');
  const [orderCategory, setOrderCategory] = useState('SUBLIMASI');
  const [orderSubCategory, setOrderSubCategory] = useState('');
  const [selectedCut, setSelectedCut] = useState(FALLBACK_CUTS[0]);
  const [selectedFabric, setSelectedFabric] = useState(FALLBACK_FABRICS[0]);

  const [sizeQuantities, setSizeQuantities] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 0,
    '3XL': 0
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    teamName: '',
    notes: ''
  });

  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // ----------------------------------------------------
  // INITIAL DATA LOADING & AUTH CHECK
  // ----------------------------------------------------
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

      setCustomerInfo((prev) => ({
        ...prev,
        name: currentUser.fullName || '',
        phone: currentUser.phone || ''
      }));

      // Load User Orders, Cut Types, Fabric Types, Design Templates
      const [userOrders, cuts, fabrics, tpls] = await Promise.all([
        getUserOrdersFromSupabase(currentUser.email),
        getCutTypes(),
        getFabricTypes(),
        getDesignTemplates()
      ]);

      setOrders(userOrders || []);
      if (cuts && cuts.length > 0) {
        setCutTypes(cuts);
        setSelectedCut(cuts[0]);
      }
      if (fabrics && fabrics.length > 0) {
        setFabricTypes(fabrics);
        setSelectedFabric(fabrics[0]);
      }
      if (tpls && tpls.length > 0) {
        setTemplates(tpls);
        setOrderTemplateName(tpls[0].name);
        setOrderCategory(tpls[0].category || 'SUBLIMASI');
        setOrderSubCategory(tpls[0].subCategory || '');
      } else {
        setOrderTemplateName('Template Jersi Pro Match');
      }

      // Check URL search params for tab and template auto-fill (e.g. from Catalog redirect!)
      const tabParam = searchParams.get('tab');
      const tplParam = searchParams.get('templateName');
      const catParam = searchParams.get('cat');

      if (tabParam) setActiveTab(tabParam);
      if (tplParam) setOrderTemplateName(tplParam);
      if (catParam) setOrderCategory(catParam);

      setLoading(false);
    }
    initDashboard();
  }, [router, searchParams]);

  // ----------------------------------------------------
  // LOGOUT HANDLER
  // ----------------------------------------------------
  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  // ----------------------------------------------------
  // PROFILE UPDATE HANDLER
  // ----------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const updated = await updateUserProfile({
        fullName,
        phone,
        address
      });
      if (updated) {
        setUser(updated);
        setProfileSuccessMsg('Profil dan alamat anda berjaya dikemaskini!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ----------------------------------------------------
  // LOGO UPLOAD HANDLER FOR NEW ORDER FORM
  // ----------------------------------------------------
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const cloudUrl = await uploadDirectToSupabaseStorage(file, 'logo');
      if (cloudUrl) {
        setCustomLogoUrl(cloudUrl);
      }
    } catch (err) {
      console.warn('Logo upload fallback error:', err);
      const reader = new FileReader();
      reader.onload = (ev) => setCustomLogoUrl(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // ----------------------------------------------------
  // SIZE QUANTITY CALCULATIONS & NEW ORDER SUBMISSION
  // ----------------------------------------------------
  const updateSizeQty = (sz, delta) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sz]: Math.max(0, (prev[sz] || 0) + delta)
    }));
  };

  const totalQuantity = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const basePricePerPcs = Number(selectedFabric?.basePrice ?? selectedFabric?.base_price ?? 70);
  const cutAddOn = Number(selectedCut?.addOnPrice ?? selectedCut?.add_on_price ?? 0);
  const pricePerPcs = basePricePerPcs + cutAddOn;
  const totalPrice = totalQuantity * pricePerPcs;

  const handleCreateNewOrder = async (e) => {
    e.preventDefault();
    if (totalQuantity <= 0) {
      alert('Sila masukkan sekurang-kurangnya 1 saiz kuantiti pesanan.');
      return;
    }

    setIsSubmittingOrder(true);
    const generatedOrderId = 'AYZ-' + Math.floor(100000 + Math.random() * 900000);

    const orderPayload = {
      order_id: generatedOrderId,
      userEmail: user?.email || '',
      userId: user?.id || '',
      templateName: orderTemplateName || 'Template Reka Bentuk',
      product_name: orderTemplateName || 'Template Reka Bentuk',
      category: orderCategory || 'SUBLIMASI',
      sub_category: orderSubCategory || '',
      cutType: selectedCut?.name || '',
      collar_cut: selectedCut?.name || '',
      fabricMaterial: selectedFabric?.name || '',
      fabric_type: selectedFabric?.name || '',
      sizeBreakdown: sizeQuantities,
      totalQty: totalQuantity,
      total_qty: totalQuantity,
      unitPrice: pricePerPcs,
      totalPrice: totalPrice,
      total_price: totalPrice,
      clientName: customerInfo.name || user?.fullName || 'Pelanggan Sistem',
      customer_phone: customerInfo.phone || user?.phone || '',
      team_name: customerInfo.teamName || '-',
      notes: customerInfo.notes || '',
      custom_logo_url: customLogoUrl || '',
      status: 'Pesanan Diterima',
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    try {
      await saveOrderToSupabase(orderPayload);
      const updatedUserOrders = await getUserOrdersFromSupabase(user?.email);
      setOrders(updatedUserOrders || []);
      setOrderSuccessData(orderPayload);
    } catch (err) {
      console.warn('Error saving new order to DB:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const resetOrderForm = () => {
    setOrderSuccessData(null);
    setSizeQuantities({ S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 });
    setCustomLogoUrl('');
    setCustomerInfo({
      name: user?.fullName || '',
      phone: user?.phone || '',
      teamName: '',
      notes: ''
    });
    setActiveTab('orders');
  };

  // ----------------------------------------------------
  // FILTERED ORDERS & INVOICES
  // ----------------------------------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.template && o.template.toLowerCase().includes(q)) ||
        (o.status && o.status.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const s = (o.status || '').toLowerCase();
      if (orderStatusFilter === 'all') return true;
      if (orderStatusFilter === 'process') return s.includes('proses') || s.includes('diterima');
      if (orderStatusFilter === 'completed') return s.includes('selesai') || s.includes('siap');
      return true;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('selesai') || s.includes('siap')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>SIAP & SELESAI</span>
        </span>
      );
    }
    if (s.includes('proses') || s.includes('cetakan') || s.includes('hantar')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
          <span>DALAM PROSES</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
        <Package className="w-3 h-3 text-slate-500" />
        <span>PESANAN DITERIMA</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          MEMUATKAN PANEL PENGGUNA AYEZZ...
        </p>
      </div>
    );
  }

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email ? user.email.slice(0, 2).toUpperCase() : 'AG';

  return (
    <div className="flex h-screen bg-slate-900 font-sans antialiased text-slate-100 overflow-hidden select-none">

      {/* ========================================================================= */}
      {/* 1. PANEL 1: LEFT SIDEBAR NAVIGATION (260px FIXED WIDTH LIKE ADMIN PANEL) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* BRAND LOGO & PANEL TITLE HEADER */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo/ayezz-logo-01.svg"
                alt="AYEZZ GLOBAL Logo"
                className="h-7 w-auto filter invert brightness-200"
              />
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* USER PROFILE CARD */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black font-mono text-amber-400 shrink-0 shadow-inner">
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-tight truncate">
                {user?.fullName || 'Pengguna AYEZZ'}
              </h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION BUTTONS */}
          <nav className="p-4 space-y-1 text-xs">
            <span className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
              PANEL UTAMA PENGGUNA
            </span>

            <button
              onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard Utama</span>
            </button>

            <button
              onClick={() => { setActiveTab('new-order'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'new-order'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Buat Pesanan Baru</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'orders'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Sejarah Pesanan</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('invoices'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'invoices'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Invois & Resit</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Tetapan Profil</span>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER BUTTONS */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-2">
          <Link
            href="/katalog"
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-slate-700 active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span>Lihat Laman Awam</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-rose-500/30 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. PANEL 2: MAIN ENTERPRISE CONTENT VIEWPORT (MATCHES ADMIN DASHBOARD) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] text-slate-900">

        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between z-10 shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {activeTab === 'overview' && 'Dashboard Utama Pengguna'}
                {activeTab === 'new-order' && 'Borang Tempahan Jersi Custom'}
                {activeTab === 'orders' && 'Sejarah Pesanan Pengguna'}
                {activeTab === 'invoices' && 'Invois & Resit Rasmi Kilang'}
                {activeTab === 'profile' && 'Tetapan Profil & Alamat Akaun'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                AYEZZ GLOBAL — Panel Pengurusan Pelanggan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('new-order')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tempahan Baru</span>
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* WELCOME BANNER */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>PANEL KAWALAN PELANGGAN</span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white pt-1">
                    Selamat Datang, {user?.fullName || 'Pengguna AYEZZ'}!
                  </h1>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">
                    Uruskan tempahan jersi kustom sublimasi anda, pantau status pengeluaran kilang, muat turun resit invois, dan buat tempahan baru secara langsung di sini.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('new-order')}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 shrink-0 relative z-10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buat Tempahan Jersi Baru →</span>
                </button>
              </div>

              {/* METRICS SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      JUMLAH PESANAN
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black font-mono text-slate-900">{orders.length}</span>
                    <span className="text-xs text-slate-500 font-semibold">Rekod</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      DALAM PROSES
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black font-mono text-amber-600">
                      {orders.filter((o) => (o.status || '').toLowerCase().includes('proses') || (o.status || '').toLowerCase().includes('diterima')).length}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Aktif</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      SIAP & SELESAI
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black font-mono text-emerald-600">
                      {orders.filter((o) => (o.status || '').toLowerCase().includes('selesai') || (o.status || '').toLowerCase().includes('siap')).length}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Pesanan</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      JUMLAH PERBELANJAAN
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      RM {orders.reduce((acc, curr) => acc + (Number(curr.totalPrice ?? curr.total_price) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pesanan Terkini</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Senarai tempahan terkini anda yang diproses di kilang</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-slate-900 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Lihat Semua Pesanan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">Belum ada pesanan direkodkan.</p>
                    <button
                      onClick={() => setActiveTab('new-order')}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Buat Tempahan Pertama
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                          <th className="pb-3 px-3">KOD PESANAN</th>
                          <th className="pb-3 px-3">TEMPLATE REKA BENTUK</th>
                          <th className="pb-3 px-3">TARIKH</th>
                          <th className="pb-3 px-3">KUANTITI</th>
                          <th className="pb-3 px-3">JUMLAH (RM)</th>
                          <th className="pb-3 px-3">STATUS</th>
                          <th className="pb-3 px-3 text-right">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">#{ord.id}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-900">{ord.template}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">{ord.date}</td>
                            <td className="py-3.5 px-3 font-mono">{ord.qty} pcs</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{ord.total}</td>
                            <td className="py-3.5 px-3">{getStatusBadge(ord.status)}</td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Butiran
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUAT PESANAN BARU */}
          {activeTab === 'new-order' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {orderSuccessData ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                      PESANAN BERJAYA DISIMPAN KE SISTEM
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 pt-2">
                      Resit Pesanan #{orderSuccessData.order_id}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-lg mx-auto">
                      Tempahan jersi sublimasi anda telah berjaya dihantar ke pangkalan data kilang AYEZZ GLOBAL.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3 max-w-md mx-auto text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Reka Bentuk:</span>
                      <span className="font-bold text-slate-900">{orderSuccessData.templateName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Potongan Kolar:</span>
                      <span className="font-bold text-slate-900">{orderSuccessData.cutType}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Fabrik:</span>
                      <span className="font-bold text-slate-900">{orderSuccessData.fabricMaterial}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Jumlah Kuantiti:</span>
                      <span className="font-bold text-slate-900">{orderSuccessData.totalQty} pcs</span>
                    </div>
                    <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                      <span>JUMLAH ANGGARAN:</span>
                      <span className="text-emerald-700">RM {Number(orderSuccessData.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={resetOrderForm}
                      className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Lihat Senarai Pesanan Saya →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateNewOrder} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-8">
                  <div className="border-b border-slate-100 pb-5">
                    <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest block">
                      BORANG TEMPAHAN JERSI CUSTOM
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 pt-1">
                      Konfigurasi Spesifikasi Pesanan
                    </h2>
                  </div>

                  {/* 1. PILIH TEMPLATE REKA BENTUK */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                      1. TEMPLATE REKA BENTUK
                    </label>
                    {templates.length > 0 ? (
                      <select
                        value={orderTemplateName}
                        onChange={(e) => {
                          setOrderTemplateName(e.target.value);
                          const t = templates.find((tpl) => tpl.name === e.target.value);
                          if (t) {
                            setOrderCategory(t.category || 'SUBLIMASI');
                            setOrderSubCategory(t.subCategory || '');
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                      >
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.name}>
                            {tpl.name} ({tpl.category} {tpl.subCategory ? `• ${tpl.subCategory}` : ''})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={orderTemplateName}
                        onChange={(e) => setOrderTemplateName(e.target.value)}
                        placeholder="Nama template reka bentuk..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                      />
                    )}
                  </div>

                  {/* 2. SELEKSI JENIS POTONGAN / KOLAR */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                      2. PILIH JENIS POTONGAN / KOLAR:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cutTypes.map((cut) => {
                        const isSelected = selectedCut.id === cut.id;
                        const addOn = Number(cut.addOnPrice ?? cut.add_on_price ?? 0);
                        return (
                          <div
                            key={cut.id}
                            onClick={() => setSelectedCut(cut)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase block line-clamp-1">{cut.name}</span>
                            <span className="text-[10px] font-mono opacity-80 block pt-1">
                              {addOn > 0 ? `+RM ${addOn}.00` : 'FREE / STANDARD'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. SELEKSI BAHAN KAIN SUBLIMASI */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                      3. PILIH JENIS KAIN / FABRIK:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {fabricTypes.map((fab) => {
                        const isSelected = selectedFabric.id === fab.id;
                        const baseP = Number(fab.basePrice ?? fab.base_price ?? 70);
                        return (
                          <div
                            key={fab.id}
                            onClick={() => setSelectedFabric(fab)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase block line-clamp-1">{fab.name}</span>
                            <span className="text-[10px] font-mono opacity-80 block pt-1">
                              RM {baseP}.00 / pcs
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. MATRIKS KUANTITI SAIZ */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                      4. MASUKKAN KUANTITI SAIZ:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {Object.keys(sizeQuantities).map((sz) => (
                        <div key={sz} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                          <span className="text-xs font-mono font-bold text-slate-700 block">{sz}</span>
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateSizeQty(sz, -1)}
                              className="w-6 h-6 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-200 active:scale-95 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold w-5 text-slate-900">{sizeQuantities[sz]}</span>
                            <button
                              type="button"
                              onClick={() => updateSizeQty(sz, 1)}
                              className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. MAKLUMAT MAKLUMAT KUSTOMISASI & MUAT NAIK LOGO */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                      5. MAKLUMAT PELANGGAN & LOGO PASUKAN:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA PELANGGAN</label>
                        <input
                          type="text"
                          required
                          placeholder="Nama penuh..."
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NO. TELEFON / WHATSAPP</label>
                        <input
                          type="text"
                          required
                          placeholder="011-XXXXXXX"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA PASUKAN / KELAB</label>
                        <input
                          type="text"
                          placeholder="Contoh: FC Harimau"
                          value={customerInfo.teamName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, teamName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>
                    </div>

                    {/* LOGO UPLOAD INPUT */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        {customLogoUrl ? (
                          <img src={customLogoUrl} alt="Custom Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                            <Upload className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Muat Naik Logo Pasukan / Sponsor (Opsional)</span>
                          <span className="text-[10px] text-slate-500 block">Format PNG / JPG / SVG / WebP</span>
                        </div>
                      </div>

                      <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                        {isUploadingLogo ? 'Memuat Naik...' : customLogoUrl ? 'Tukar Logo' : 'Pilih Fail Logo'}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NOTA TAMBAHAN REKA BENTUK</label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Cetak nama pemain di belakang baju, nombor di dada kanan..."
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 resize-none"
                      />
                    </div>
                  </div>

                  {/* LIVE PRICE SUMMARY & SUBMIT BUTTON */}
                  <div className="p-6 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest">RINGKASAN ANGGARAN ANGGARAN</span>
                      <div className="flex items-baseline space-x-2 pt-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">RM {totalPrice.toFixed(2)}</span>
                        <span className="text-xs font-mono text-slate-400">({totalQuantity} pcs x RM {pricePerPcs})</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOrder || totalQuantity <= 0}
                      className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isSubmittingOrder ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-slate-950" />
                          <span>Hantar Tempahan Ke Sistem →</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SEJARAH PESANAN */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                {/* SEARCH & FILTERS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari Kod Pesanan / Template..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua ({orders.length})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('process')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'process' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dalam Proses
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Siap & Selesai
                    </button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900 uppercase">Tiada Pesanan Dijumpai</h3>
                    <p className="text-xs text-slate-500">Anda belum membuat sebarang tempahan jersi kustom.</p>
                    <button
                      onClick={() => setActiveTab('new-order')}
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Buat Tempahan Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                              #{ord.id}
                            </span>
                            <span className="text-xs font-mono text-slate-500 font-medium">
                              {ord.date}
                            </span>
                            {getStatusBadge(ord.status)}
                          </div>

                          <div>
                            <h3 className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                              {ord.template}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono pt-0.5">
                              Kolar: <strong className="text-slate-800">{ord.cutType}</strong> • Kain: <strong className="text-slate-800">{ord.fabricMaterial}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                              JUMLAH / KUANTITI
                            </span>
                            <span className="text-lg font-black font-mono text-slate-900">
                              {ord.total} <span className="text-xs font-normal text-slate-500">({ord.qty} pcs)</span>
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Spesifikasi</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INVOIS & RESIT */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 uppercase">Invois & Resit Rasmi</h3>
                    <p className="text-xs text-slate-500 font-medium pt-0.5">Muat turun invois tempahan jersi kustom untuk urusan pembayaran kilang</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900 uppercase">Tiada Invois Dikeluarkan</h3>
                    <p className="text-xs text-slate-500">Invois rasmi akan dikeluarkan secara otomatis setelah anda membuat tempahan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                          <th className="pb-3 px-3">NO. INVOIS</th>
                          <th className="pb-3 px-3">KOD PESANAN</th>
                          <th className="pb-3 px-3">REKA BENTUK</th>
                          <th className="pb-3 px-3">TARIKH</th>
                          <th className="pb-3 px-3">JUMLAH (RM)</th>
                          <th className="pb-3 px-3">STATUS BAYARAN</th>
                          <th className="pb-3 px-3 text-right">CETAK / RESIT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">INV-{ord.id}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">#{ord.id}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-900">{ord.template}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">{ord.date}</td>
                            <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">{ord.total}</td>
                            <td className="py-3.5 px-3">
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold uppercase">
                                DITERIMA / LUNAS
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedInvoice(ord)}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>Lihat Invois</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TETAPAN PROFIL */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xs space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-extrabold uppercase text-slate-900">Kemaskini Profil & Alamat</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Maklumat profil ini digunakan untuk surat-menyurat invois dan alamat penghantaran barang.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    NAMA PENUH
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Muhammad Ali"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    ALAMAT EMEL (TERBUNGKUS SAH)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    NOMBOR TELEFON / WHATSAPP
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: +60123456789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    ALAMAT PENGHANTARAN PESANAN
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masukkan alamat penuh rumah / premis untuk penghantaran..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSavingProfile ? (
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

        </div>
      </main>

      {/* ORDER SPECIFICATION MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 font-sans">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                RESIT SPESIFIKASI PESANAN
              </span>
              <h3 className="text-xl font-extrabold uppercase text-slate-900">
                #{selectedOrder.id}
              </h3>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Reka Bentuk:</span>
                <span className="font-bold text-slate-900">{selectedOrder.template}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Jenis Potongan / Kolar:</span>
                <span className="font-bold text-slate-900">{selectedOrder.cutType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Jenis Fabrik Sublimasi:</span>
                <span className="font-bold text-slate-900">{selectedOrder.fabricMaterial}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tarikh Pesanan:</span>
                <span className="font-bold text-slate-900">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Semasa:</span>
                <span className="font-bold text-emerald-700">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Size Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                PECAHAN SAIZ PESANAN (SIZE BREAKDOWN)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                {Object.entries(selectedOrder.sizeBreakdown || {}).length > 0 ? (
                  Object.entries(selectedOrder.sizeBreakdown).map(([sz, qty]) => (
                    <div key={sz} className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">{sz}</span>
                      <span className="text-xs font-black text-slate-900">{qty} pcs</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-6 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs">
                    Saiz Standard ({selectedOrder.qty || 1} pcs)
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">
                  JUMLAH ANGGARAN
                </span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {selectedOrder.total}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Tutup Spesifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE & RECEIPT PRINTABLE MODAL VIEWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative border border-slate-200 font-sans max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors print:hidden cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            {/* INVOICE BRAND HEADER */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div>
                <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ GLOBAL" className="h-7 w-auto mb-2" />
                <p className="text-[10px] font-mono text-slate-500 uppercase">KILANG SUBLIMASI HIGH-PERFORMANCE</p>
                <p className="text-[10px] font-mono text-slate-500">AYEZZ GLOBAL SDN BHD • MALAYSIA</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-xs font-mono font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  INVOIS RASMI KILANG
                </span>
                <h2 className="text-xl font-mono font-black text-slate-900 pt-1">INV-{selectedInvoice.id}</h2>
                <p className="text-[10px] font-mono text-slate-500">TARIKH: {selectedInvoice.date}</p>
              </div>
            </div>

            {/* CLIENT & ORDER DETAILS */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-1">DIBILKAN KEPADA:</span>
                <p className="font-extrabold text-slate-900">{selectedInvoice.clientName || user?.fullName}</p>
                <p className="text-slate-600">{selectedInvoice.customer_phone || user?.phone || '-'}</p>
                <p className="text-slate-600">{user?.email}</p>
              </div>

              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase block mb-1">STATUS PEMBAYARAN:</span>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px] mb-1">
                  LUNAS / DEPOSIT SAH
                </span>
                <p className="text-slate-600">PASUKAN: {selectedInvoice.team_name || '-'}</p>
              </div>
            </div>

            {/* INVOICE ITEMIZED TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                    <th className="p-3">PERIHAL ITEM SPESIFIKASI</th>
                    <th className="p-3 text-center">KUANTITI</th>
                    <th className="p-3 text-right">HARGA UNIT</th>
                    <th className="p-3 text-right">JUMLAH (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  <tr>
                    <td className="p-3">
                      <strong className="text-slate-900 block">{selectedInvoice.template}</strong>
                      <span className="text-[10px] text-slate-500 block">Kolar: {selectedInvoice.cutType} • Fabrik: {selectedInvoice.fabricMaterial}</span>
                    </td>
                    <td className="p-3 text-center font-bold">{selectedInvoice.qty} pcs</td>
                    <td className="p-3 text-right font-bold">RM {(Number(selectedInvoice.totalPrice ?? selectedInvoice.total_price) / Math.max(selectedInvoice.qty || 1, 1)).toFixed(2)}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">{selectedInvoice.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TOTAL FOOTER */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-xs font-mono text-slate-500">
                <span>Terima kasih kerana memilih pengeluaran kilang AYEZZ GLOBAL.</span>
              </div>

              <div className="flex items-center space-x-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          MEMUATKAN PANEL PENGGUNA AYEZZ...
        </p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
