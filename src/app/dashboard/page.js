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
  ChevronLeft,
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
  Globe,
  Palette,
  Image as ImageIcon,
  HelpCircle,
  Check,
  Scissors,
  Trash2,
  Shirt
} from 'lucide-react';

import { getCurrentUser, logoutUser, updateUserProfile } from '../../lib/authService';
import {
  getUserOrdersFromSupabase,
  getCategories,
  getSubCategories,
  getCutTypes,
  getSleeveTypes,
  getFabricTypes,
  getDesignTemplates,
  saveOrderToSupabase,
  FALLBACK_SLEEVE_TYPES,
  PLACEHOLDER_IMAGE
} from '../../lib/supabaseService';

import {
  CUT_TYPES as FALLBACK_CUTS,
  FABRIC_TYPES as FALLBACK_FABRICS
} from '../../data/sublimationProducts';

import { uploadDirectToSupabaseStorage } from '../../lib/imageService';

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const KIDS_SIZES = ['KIDS-22', 'KIDS-24', 'KIDS-26', 'KIDS-28', 'KIDS-30', 'KIDS-32'];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [cutTypes, setCutTypes] = useState(FALLBACK_CUTS);
  const [sleeveTypes, setSleeveTypes] = useState(FALLBACK_SLEEVE_TYPES);
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
  // NEW ORDER MULTI-STEP WIZARD CONFIGURATOR STATE
  // ----------------------------------------------------
  // Step 1 (Design) | Step 2 (Potongan, Lengan & Saiz) | Step 3 (Fabrik Sublimasi) | Step 4 (Maklumat & Tempahan)
  const [orderStep, setOrderStep] = useState(1);

  // SECTION 1: TEMPLATE & CUSTOM DESIGN MODE STATES
  const [isCustomDesign, setIsCustomDesign] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');

  // Custom Design Reference Upload & Notes
  const [customDesignRefUrl, setCustomDesignRefUrl] = useState('');
  const [isUploadingRefImage, setIsUploadingRefImage] = useState(false);
  const [customDesignNotes, setCustomDesignNotes] = useState('');

  const [orderTemplateName, setOrderTemplateName] = useState('');
  const [orderCategory, setOrderCategory] = useState('SUBLIMASI');
  const [orderSubCategory, setOrderSubCategory] = useState('');
  const [selectedFabric, setSelectedFabric] = useState(FALLBACK_FABRICS[0]);

  // SECTION 2 & 3: MULTI-CUT & SLEEVE GROUPS WITH SIZES
  const [cutGroups, setCutGroups] = useState([
    {
      id: 'group_1',
      cut: FALLBACK_CUTS[0],
      sleeve: FALLBACK_SLEEVE_TYPES[0],
      sizes: {
        XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0,
        'KIDS-22': 0, 'KIDS-24': 0, 'KIDS-26': 0, 'KIDS-28': 0, 'KIDS-30': 0, 'KIDS-32': 0
      }
    }
  ]);

  // Modals for Cut & Size Selection (Sleeve uses simple inline pills!)
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [activeGroupIdForCut, setActiveGroupIdForCut] = useState(null);

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [activeGroupIdForSize, setActiveGroupIdForSize] = useState(null);
  const [sizeModalTab, setSizeModalTab] = useState('dewasa'); // 'dewasa' | 'kids'

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
  // INITIAL DATA LOADING FROM SUPABASE DATABASE
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

      // Load User Orders, Cut Types, Sleeve Types, Fabric Types, Design Templates, Categories & Subcategories directly from Supabase DB
      const [userOrders, cuts, sleeves, fabrics, tpls, cats, subs] = await Promise.all([
        getUserOrdersFromSupabase(currentUser.email),
        getCutTypes(),
        getSleeveTypes(),
        getFabricTypes(),
        getDesignTemplates(),
        getCategories(),
        getSubCategories()
      ]);

      setOrders(userOrders || []);
      if (cats && cats.length > 0) setCategories(cats);
      if (subs && subs.length > 0) setSubCategories(subs);

      let loadedCuts = FALLBACK_CUTS;
      if (cuts && cuts.length > 0) {
        setCutTypes(cuts);
        loadedCuts = cuts;
      }

      let loadedSleeves = FALLBACK_SLEEVE_TYPES;
      if (sleeves && sleeves.length > 0) {
        setSleeveTypes(sleeves);
        loadedSleeves = sleeves;
      }

      setCutGroups([
        {
          id: 'group_1',
          cut: loadedCuts[0],
          sleeve: loadedSleeves[0],
          sizes: {
            XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0,
            'KIDS-22': 0, 'KIDS-24': 0, 'KIDS-26': 0, 'KIDS-28': 0, 'KIDS-30': 0, 'KIDS-32': 0
          }
        }
      ]);

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

  // Selected template object for live thumbnail preview
  const selectedTemplateObj = useMemo(() => {
    return templates.find((t) => t.name === orderTemplateName) || templates[0];
  }, [templates, orderTemplateName]);

  // Filtered Templates for Selection Modal
  const filteredModalTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const q = templateSearchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        (tpl.category || '').toLowerCase().includes(q) ||
        (tpl.subCategory || '').toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (templateCategoryFilter === 'all') return true;
      return (tpl.category || '').toLowerCase() === templateCategoryFilter.toLowerCase();
    });
  }, [templates, templateSearchQuery, templateCategoryFilter]);

  // ----------------------------------------------------
  // MULTI-CUT GROUPS HANDLERS
  // ----------------------------------------------------
  const addCutGroup = () => {
    const nextId = `group_${Date.now()}`;
    setCutGroups((prev) => [
      ...prev,
      {
        id: nextId,
        cut: cutTypes[0] || FALLBACK_CUTS[0],
        sleeve: sleeveTypes[0] || FALLBACK_SLEEVE_TYPES[0],
        sizes: {
          XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0,
          'KIDS-22': 0, 'KIDS-24': 0, 'KIDS-26': 0, 'KIDS-28': 0, 'KIDS-30': 0, 'KIDS-32': 0
        }
      }
    ]);
  };

  const removeCutGroup = (groupId) => {
    if (cutGroups.length <= 1) {
      alert('Anda mesti mempunyai sekurang-kurangnya 1 kumpulan potongan.');
      return;
    }
    setCutGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const updateGroupSleeve = (groupId, newSleeve) => {
    setCutGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, sleeve: newSleeve } : g))
    );
  };

  const updateGroupSizeQty = (groupId, sizeKey, delta) => {
    setCutGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const currentVal = g.sizes[sizeKey] || 0;
        const newVal = Math.max(0, currentVal + delta);
        return {
          ...g,
          sizes: {
            ...g.sizes,
            [sizeKey]: newVal
          }
        };
      })
    );
  };

  // Dynamic Price & Quantity Calculations across groups
  const basePricePerPcs = Number(selectedFabric?.basePrice ?? selectedFabric?.base_price ?? 70);

  const groupCalculations = useMemo(() => {
    let totalQty = 0;
    let totalPrice = 0;

    const groupDetails = cutGroups.map((group) => {
      const gQty = Object.values(group.sizes || {}).reduce((a, b) => a + Number(b || 0), 0);
      const cutAddOn = Number(group.cut?.addOnPrice ?? group.cut?.add_on_price ?? 0);
      const sleeveAddOn = Number(group.sleeve?.addOnPrice ?? group.sleeve?.add_on_price ?? 0);
      const groupUnitPrice = basePricePerPcs + cutAddOn + sleeveAddOn;
      const groupSubtotal = gQty * groupUnitPrice;

      totalQty += gQty;
      totalPrice += groupSubtotal;

      return {
        ...group,
        qty: gQty,
        unitPrice: groupUnitPrice,
        subtotal: groupSubtotal
      };
    });

    return {
      totalQty,
      totalPrice,
      groupDetails
    };
  }, [cutGroups, selectedFabric]);

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
  // LOGO & REFERENCE IMAGE UPLOAD HANDLERS
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

  const handleRefImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRefImage(true);
    try {
      const cloudUrl = await uploadDirectToSupabaseStorage(file, 'ref_design');
      if (cloudUrl) {
        setCustomDesignRefUrl(cloudUrl);
      }
    } catch (err) {
      console.warn('Ref image upload fallback error:', err);
      const reader = new FileReader();
      reader.onload = (ev) => setCustomDesignRefUrl(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingRefImage(false);
    }
  };

  // ----------------------------------------------------
  // CREATE NEW ORDER SUBMISSION
  // ----------------------------------------------------
  const handleCreateNewOrder = async (e) => {
    e.preventDefault();
    if (groupCalculations.totalQty <= 0) {
      alert('Sila masukkan sekurang-kurangnya 1 saiz kuantiti pesanan pada kumpulan potongan anda.');
      return;
    }

    setIsSubmittingOrder(true);
    const generatedOrderId = 'AYZ-' + Math.floor(100000 + Math.random() * 900000);

    const finalTemplateTitle = isCustomDesign
      ? `Reka Bentuk Kustom ${orderTemplateName ? `- Base: ${orderTemplateName}` : ''}`
      : (orderTemplateName || 'Template Reka Bentuk');

    const cutTypesSummary = cutGroups
      .map((g) => `${g.cut.name} (${g.sleeve.name})`)
      .join(' + ');

    const orderPayload = {
      order_id: generatedOrderId,
      userEmail: user?.email || '',
      userId: user?.id || '',
      templateName: finalTemplateTitle,
      product_name: finalTemplateTitle,
      category: orderCategory || 'SUBLIMASI',
      sub_category: orderSubCategory || '',
      cutType: cutTypesSummary,
      collar_cut: cutTypesSummary,
      fabricMaterial: selectedFabric?.name || '',
      fabric_type: selectedFabric?.name || '',
      cutGroups: groupCalculations.groupDetails,
      totalQty: groupCalculations.totalQty,
      total_qty: groupCalculations.totalQty,
      unitPrice: basePricePerPcs,
      totalPrice: groupCalculations.totalPrice,
      total_price: groupCalculations.totalPrice,
      clientName: customerInfo.name || user?.fullName || 'Pelanggan Sistem',
      customer_phone: customerInfo.phone || user?.phone || '',
      team_name: customerInfo.teamName || '-',
      notes: `${isCustomDesign ? `[KUSTOM DESIGN] ${customDesignNotes} ` : ''}${customerInfo.notes || ''}`.trim(),
      custom_logo_url: customLogoUrl || '',
      custom_design_ref_url: customDesignRefUrl || '',
      is_custom_design: isCustomDesign,
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
    setCustomLogoUrl('');
    setCustomDesignRefUrl('');
    setCustomDesignNotes('');
    setOrderStep(1);
    setCutGroups([
      {
        id: 'group_1',
        cut: cutTypes[0] || FALLBACK_CUTS[0],
        sleeve: sleeveTypes[0] || FALLBACK_SLEEVE_TYPES[0],
        sizes: {
          XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0,
          'KIDS-22': 0, 'KIDS-24': 0, 'KIDS-26': 0, 'KIDS-28': 0, 'KIDS-30': 0, 'KIDS-32': 0
        }
      }
    ]);
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
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <Clock className="w-3 h-3 text-slate-600 animate-spin" />
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
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
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
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black font-mono text-white shrink-0 shadow-inner">
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
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-white'
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
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-white'
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
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Sejarah Pesanan</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('invoices'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                activeTab === 'invoices'
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-white'
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
                  ? 'bg-slate-800 text-white font-extrabold shadow-xs border-l-4 border-white'
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
      {/* 2. PANEL 2: MAIN ENTERPRISE CONTENT VIEWPORT (FULL-WIDTH 100% CANVAS) */}
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
                {activeTab === 'new-order' && 'Borang Tempahan Jersi Custom (Konfigurasi Multi-Step)'}
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
              <Plus className="w-4 h-4 text-white" />
              <span>Tempahan Baru</span>
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY (100% FULL WIDTH NO GAP) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 w-full">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* WELCOME BANNER (MONOCHROME BRAND STYLE) */}
              <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-slate-300" />
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
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 shrink-0 relative z-10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
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
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-700" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black font-mono text-slate-900">
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
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
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

          {/* TAB 2: BUAT PESANAN BARU (INDUSTRY STANDARD MULTI-STEP WIZARD CONFIGURATOR) */}
          {activeTab === 'new-order' && (
            <div className="w-full space-y-8">
              {/* MULTI-STEP WIZARD PROGRESS STEPPER BAR */}
              <div className="w-full bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* STEP 1 */}
                  <button
                    type="button"
                    onClick={() => setOrderStep(1)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      orderStep === 1
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : orderStep > 1
                        ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      orderStep === 1 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      1
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase block opacity-70">LANGKAH 1</span>
                      <span className="text-xs font-extrabold uppercase block truncate">Reka Bentuk</span>
                    </div>
                  </button>

                  {/* STEP 2 */}
                  <button
                    type="button"
                    onClick={() => setOrderStep(2)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      orderStep === 2
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : orderStep > 2
                        ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      orderStep === 2 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      2
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase block opacity-70">LANGKAH 2</span>
                      <span className="text-xs font-extrabold uppercase block truncate">Potongan, Lengan & Saiz</span>
                    </div>
                  </button>

                  {/* STEP 3 */}
                  <button
                    type="button"
                    onClick={() => setOrderStep(3)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      orderStep === 3
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : orderStep > 3
                        ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      orderStep === 3 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      3
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase block opacity-70">LANGKAH 3</span>
                      <span className="text-xs font-extrabold uppercase block truncate">Fabrik Sublimasi</span>
                    </div>
                  </button>

                  {/* STEP 4 */}
                  <button
                    type="button"
                    onClick={() => setOrderStep(4)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      orderStep === 4
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      orderStep === 4 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      4
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase block opacity-70">LANGKAH 4</span>
                      <span className="text-xs font-extrabold uppercase block truncate">Maklumat & Tempahan</span>
                    </div>
                  </button>

                </div>
              </div>

              {orderSuccessData ? (
                /* ORDER SUCCESS RECEIPT CONFIRMATION BANNER */
                <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md text-center space-y-6 max-w-2xl mx-auto">
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
                      <span className="text-slate-500">Spesifikasi Potongan:</span>
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
                      <span className="text-slate-900">RM {Number(orderSuccessData.totalPrice).toFixed(2)}</span>
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
                /* MULTI-STEP CONFIGURATOR CONTENT */
                <form onSubmit={handleCreateNewOrder} className="w-full space-y-8">
                  
                  {/* ========================================================== */}
                  {/* LANGKAH 1: REKA BENTUK (DESIGN TEMPLATE / CUSTOM DESIGN) */}
                  {/* ========================================================== */}
                  {orderStep === 1 && (
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-extrabold uppercase text-slate-900">LANGKAH 1: PILIH REKA BENTUK JERSI</h3>
                          <p className="text-xs text-slate-500">Pilih dari galeri template pangkalan data atau muat naik reka bentuk kustom anda sendiri.</p>
                        </div>

                        {/* TOGGLE SWITCH CUSTOM DESIGN */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setIsCustomDesign(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                              !isCustomDesign
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Palette className="w-3.5 h-3.5" />
                            <span>Template Sedia Ada</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsCustomDesign(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                              isCustomDesign
                                ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span>Custom Design</span>
                          </button>
                        </div>
                      </div>

                      {/* MODE A: STANDARD TEMPLATE SELECTOR */}
                      {!isCustomDesign && (
                        <div className="space-y-4">
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-5">
                              <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                {selectedTemplateObj ? (
                                  <img
                                    src={Array.isArray(selectedTemplateObj.images) && selectedTemplateObj.images.length > 0 ? selectedTemplateObj.images[0] : (selectedTemplateObj.thumbnail || PLACEHOLDER_IMAGE)}
                                    alt={selectedTemplateObj.name}
                                    className="w-full h-full object-contain img-crisp"
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">Tiada Gambar</span>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">TEMPLATE DIPILIH</span>
                                <h4 className="text-lg font-black uppercase text-slate-900">{orderTemplateName}</h4>
                                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                                  <span className="px-2.5 py-0.5 bg-slate-200 rounded font-bold text-slate-800">{orderCategory}</span>
                                  {orderSubCategory && <span className="px-2.5 py-0.5 bg-slate-200 rounded text-slate-700">• {orderSubCategory}</span>}
                                </div>
                              </div>
                            </div>

                            {/* BUTTON OPEN TEMPLATE SELECTION MODAL */}
                            <button
                              type="button"
                              onClick={() => setIsTemplateModalOpen(true)}
                              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
                            >
                              <Layers className="w-4 h-4 text-white" />
                              <span>Tukar Template Reka Bentuk</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MODE B: CUSTOM DESIGN CONFIGURATOR */}
                      {isCustomDesign && (
                        <div className="space-y-5 p-6 bg-slate-50 border border-slate-200/80 rounded-2xl">
                          <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-200 pb-3">
                            <Sparkles className="w-4 h-4 text-slate-700" />
                            <span className="text-xs font-bold uppercase tracking-wider">MOD REKA BENTUK KUSTOM (CUSTOM DESIGN)</span>
                          </div>

                          {/* UPLOAD REFERENSI DESAIN */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              1. MUAT NAIK GAMBAR REFERENSI DESAIN (LAKARAN / SKETCH)
                            </label>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {customDesignRefUrl ? (
                                  <img src={customDesignRefUrl} alt="Ref Design" className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <span className="text-xs font-bold text-slate-900 block">Fail Referensi Reka Bentuk</span>
                                  <span className="text-[10px] text-slate-500 block">Muat naik gambar lakaran / rujukan warna</span>
                                </div>
                              </div>

                              <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                {isUploadingRefImage ? 'Memuat Naik...' : customDesignRefUrl ? 'Tukar Referensi' : 'Muat Naik Referensi'}
                                <input type="file" accept="image/*" onChange={handleRefImageUpload} className="hidden" />
                              </label>
                            </div>
                          </div>

                          {/* PILIHAN REFERENSI DARI TEMPLATE YANG ADA */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              2. PILIH TEMPLATE SEDIA ADA SEBAGAI REFERENSI (OPSIONAL)
                            </label>
                            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-800">
                                {orderTemplateName ? `Inspirasi: ${orderTemplateName}` : 'Pilih Template Sebagai Asas Inspirasi'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsTemplateModalOpen(true)}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                Pilih Template Inspirasi
                              </button>
                            </div>
                          </div>

                          {/* CATATAN / NOTE CUSTOM DESIGN */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              3. CATATAN REKA BENTUK KUSTOM
                            </label>
                            <textarea
                              rows={3}
                              value={customDesignNotes}
                              onChange={(e) => setCustomDesignNotes(e.target.value)}
                              placeholder="Jelaskan secara teliti perubahan warna, corak badan, garisan bahu, atau gabungan gaya yang diinginkan..."
                              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 transition-all resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* STEP 1 NAVIGATION BUTTON */}
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setOrderStep(2)}
                          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                        >
                          <span>Seterusnya: Potongan, Lengan & Saiz →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* LANGKAH 2: POTONGAN, LENGAN & SAIZ (COMBINED IN 1 GROUP CARD!) */}
                  {/* ========================================================== */}
                  {orderStep === 2 && (
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 w-full">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-extrabold uppercase text-slate-900">LANGKAH 2: POTONGAN KOLAR, LENGAN & SAIZ</h3>
                          <p className="text-xs text-slate-500">
                            Setiap kumpulan mengandungi pilihan potongan kolar, jenis lengan, dan matriks saiz. Anda boleh menambah beberapa kumpulan potongan.
                          </p>
                        </div>

                        <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          JUMLAH KESELURUHAN: {groupCalculations.totalQty} pcs
                        </span>
                      </div>

                      {/* LIST OF COMBINED CUT GROUPS */}
                      <div className="space-y-6">
                        {groupCalculations.groupDetails.map((group, idx) => {
                          const activeCutName = group.cut?.name || 'Pilih Potongan Kolar';
                          const activeSleeveName = group.sleeve?.name || 'Pilih Jenis Lengan';
                          const activeCutImg = group.cut?.thumbnail || PLACEHOLDER_IMAGE;

                          const sizeEntries = Object.entries(group.sizes || {}).filter(([_, q]) => Number(q) > 0);

                          return (
                            <div
                              key={group.id}
                              className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-5 relative shadow-2xs"
                            >
                              {/* GROUP HEADER */}
                              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-mono font-extrabold text-slate-900 uppercase">
                                    KUMPULAN #{idx + 1}: {activeCutName} • {activeSleeveName}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                                    Subtotal Kumpulan: {group.qty} pcs
                                  </span>

                                  {cutGroups.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeCutGroup(group.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                      title="Padam Kumpulan Ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 1. POTONGAN KOLAR + 2. SIMPLER INLINE SLEEVE SELECTION */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                                
                                {/* POTONGAN KOLAR BOX */}
                                <div className="md:col-span-5 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                                    1. POTONGAN KOLAR
                                  </span>

                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={activeCutImg}
                                      alt={activeCutName}
                                      className="w-14 h-14 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-extrabold uppercase text-slate-900 truncate">{activeCutName}</h4>
                                      <p className="text-[10px] text-slate-500 line-clamp-1">{group.cut?.desc || '-'}</p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveGroupIdForCut(group.id);
                                      setIsCutModalOpen(true);
                                    }}
                                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                  >
                                    Tukar Potongan Kolar
                                  </button>
                                </div>

                                {/* SIMPLER INLINE SLEEVE PILLS SELECTOR (NO MODAL NEEDED!) */}
                                <div className="md:col-span-7 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                                    2. JENIS LENGAN (SLEEVE)
                                  </span>

                                  <div className="flex flex-wrap gap-2">
                                    {sleeveTypes.map((sleeve) => {
                                      const isSelected = group.sleeve?.id === sleeve.id;
                                      const addOn = Number(sleeve.addOnPrice ?? sleeve.add_on_price ?? 0);
                                      return (
                                        <button
                                          key={sleeve.id}
                                          type="button"
                                          onClick={() => updateGroupSleeve(group.id, sleeve)}
                                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                                            isSelected
                                              ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>{sleeve.name}</span>
                                          {addOn > 0 && (
                                            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                                              isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                              +RM {addOn}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                              </div>

                              {/* 3. SIZE MATRIX SUMMARY & MODAL BUTTON */}
                              <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                                    3. MATRIKS SAIZ & KUANTITI KUMPULAN
                                  </span>

                                  {sizeEntries.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                      {sizeEntries.map(([sz, q]) => (
                                        <span key={sz} className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-lg text-xs font-mono font-bold border border-slate-200">
                                          {sz}: <strong className="text-slate-900 font-extrabold">{q}</strong>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-mono italic block">
                                      Belum ada saiz dimasukkan. Sila tekan butang di sebelah kanan untuk menetapkan saiz.
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveGroupIdForSize(group.id);
                                    setIsSizeModalOpen(true);
                                  }}
                                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                                >
                                  Tetapkan Saiz (Dewasa / Kanak-Kanak) →
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {/* BUTTON ADD NEW CUT GROUP */}
                      <button
                        type="button"
                        onClick={addCutGroup}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-dashed border-slate-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                      >
                        <Plus className="w-4 h-4 text-slate-900" />
                        <span>+ Tambah Kumpulan Potongan Baru</span>
                      </button>

                      {/* STEP 2 NAVIGATION BUTTONS */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setOrderStep(1)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          ← Kembali Ke Reka Bentuk
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderStep(3)}
                          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                        >
                          <span>Seterusnya: Fabrik Sublimasi →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* LANGKAH 3: FABRIK SUBLIMASI (FABRIC MATERIAL SELECTION) */}
                  {/* ========================================================== */}
                  {orderStep === 3 && (
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 w-full">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-extrabold uppercase text-slate-900">LANGKAH 3: PILIH BAHAN KAIN / FABRIK SUBLIMASI</h3>
                          <p className="text-xs text-slate-500">Pilih gred dan tekstur kain sublimasi berprestasi tinggi untuk tempahan anda.</p>
                        </div>
                      </div>

                      {/* FABRIC MATERIAL SELECTION GRID */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {fabricTypes.map((fab) => {
                            const isSelected = selectedFabric.id === fab.id;
                            const baseP = Number(fab.basePrice ?? fab.base_price ?? 70);
                            return (
                              <div
                                key={fab.id}
                                onClick={() => setSelectedFabric(fab)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${
                                  isSelected
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute top-3 right-3 bg-white text-slate-900 p-1 rounded-full shadow-xs">
                                    <Check className="w-3.5 h-3.5 text-slate-900" />
                                  </span>
                                )}

                                <div className="space-y-1">
                                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {fab.gsm || '150 GSM'} • {fab.tier || 'PREMIUM'}
                                  </span>
                                  <h4 className="text-sm font-extrabold uppercase line-clamp-1">{fab.name}</h4>
                                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {fab.desc || fab.description || 'Kain sublimasi berkualiti tinggi'}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between">
                                  <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>HARGA ASAS:</span>
                                  <span className="text-sm font-mono font-black">
                                    RM {baseP}.00 / pcs
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* STEP 3 NAVIGATION BUTTONS */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setOrderStep(2)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          ← Kembali Ke Potongan, Lengan & Saiz
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderStep(4)}
                          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                        >
                          <span>Seterusnya: Maklumat & Tempahan →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* LANGKAH 4: MAKLUMAT & TEMPAHAN (DETAILS & SUBMIT) */}
                  {/* ========================================================== */}
                  {orderStep === 4 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                      
                      {/* LEFT 7 COLS: CUSTOMER & LOGO DETAILS */}
                      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-extrabold uppercase text-slate-900">LANGKAH 4: MAKLUMAT TEMPAHAN & LOGO</h3>
                          <p className="text-xs text-slate-500">Isi nama pelanggan, nombor telefon, nama pasukan, dan muat naik logo pasukan.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA PELANGGAN</label>
                            <input
                              type="text"
                              required
                              placeholder="Nama penuh..."
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
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
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA PASUKAN / KELAB</label>
                            <input
                              type="text"
                              placeholder="Contoh: FC Harimau"
                              value={customerInfo.teamName}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, teamName: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                            />
                          </div>

                          {/* LOGO UPLOAD INPUT */}
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-600 block">LOGO PASUKAN / SPONSOR</span>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {customLogoUrl ? (
                                  <img src={customLogoUrl} alt="Custom Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                                    <Upload className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="text-xs text-slate-600 font-semibold truncate max-w-[160px]">
                                  {customLogoUrl ? 'Logo Terunggah' : 'Format PNG / JPG'}
                                </span>
                              </div>

                              <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                {isUploadingLogo ? 'Muat Naik...' : customLogoUrl ? 'Tukar Logo' : 'Pilih Logo'}
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NOTA TAMBAHAN REKA BENTUK</label>
                            <textarea
                              rows={2}
                              placeholder="Contoh: Nama pemain di belakang baju..."
                              value={customerInfo.notes}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 resize-none"
                            />
                          </div>
                        </div>

                        {/* STEP 4 BACK BUTTON */}
                        <div className="pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setOrderStep(3)}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            ← Kembali Ke Fabrik Sublimasi
                          </button>
                        </div>
                      </div>

                      {/* RIGHT 5 COLS: STICKY FINAL SUMMARY BAR & SUBMIT BUTTON */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-5 sticky top-20 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest border-b border-slate-800 pb-2">
                            RINGKASAN ANGGARAN HARGA KILANG
                          </span>

                          <div className="space-y-2.5 text-xs font-mono text-slate-300">
                            <div className="flex justify-between">
                              <span>Harga Asas Fabrik ({selectedFabric?.name}):</span>
                              <span>RM {basePricePerPcs.toFixed(2)}</span>
                            </div>

                            {groupCalculations.groupDetails.map((gd, i) => (
                              <div key={gd.id} className="flex justify-between text-[11px] text-slate-400">
                                <span>Kumpulan #{i + 1} ({gd.cut?.name} • {gd.qty} pcs):</span>
                                <span>RM {gd.subtotal.toFixed(2)}</span>
                              </div>
                            ))}

                            <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                              <span>Jumlah Kuantiti:</span>
                              <span>{groupCalculations.totalQty} pcs</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-3">
                            <span className="text-[10px] font-mono text-slate-400 block">JUMLAH KESELURUHAN ({groupCalculations.totalQty} pcs):</span>
                            <span className="text-3xl font-black font-mono text-white block pt-0.5">
                              RM {groupCalculations.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingOrder || groupCalculations.totalQty <= 0}
                            className="w-full py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border border-slate-200"
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
                      </div>

                    </div>
                  )}

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
                              Potongan: <strong className="text-slate-800">{ord.cutType}</strong> • Kain: <strong className="text-slate-800">{ord.fabricMaterial}</strong>
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
                                <Printer className="w-3.5 h-3.5 text-white" />
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

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE TEMPLATE SELECTION MODAL DRAWER */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">PILIH TEMPLATE REKA BENTUK</h3>
                <p className="text-xs text-slate-500 font-medium">Pilih template dari galeri pangkalan data untuk pesanan anda</p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 shrink-0">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama template / kategori..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex items-center space-x-2 text-xs font-mono overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                      templateCategoryFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTemplateCategoryFilter(c.title)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        templateCategoryFilter.toLowerCase() === (c.title || '').toLowerCase()
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredModalTemplates.map((tpl) => {
                const img = Array.isArray(tpl.images) && tpl.images.length > 0 ? tpl.images[0] : (tpl.thumbnail || PLACEHOLDER_IMAGE);
                const isSelected = orderTemplateName === tpl.name;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setOrderTemplateName(tpl.name);
                      setOrderCategory(tpl.category || 'SUBLIMASI');
                      setOrderSubCategory(tpl.subCategory || '');
                      setIsTemplateModalOpen(false);
                    }}
                    className={`p-3 bg-white border rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-between group space-y-2 relative ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/30 shadow-md bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-slate-900 text-white p-1 rounded-full z-10 shadow-xs">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}

                    <div className="w-full aspect-square bg-[#F5F5F7] rounded-xl overflow-hidden p-2 flex items-center justify-center">
                      <img src={img} alt={tpl.name} className="w-full h-full object-contain img-crisp group-hover:scale-105 transition-transform" />
                    </div>

                    <div className="text-center space-y-0.5 w-full">
                      <h4 className="text-xs font-extrabold uppercase text-slate-900 truncate">{tpl.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 font-semibold block truncate">
                        {tpl.category} {tpl.subCategory ? `• ${tpl.subCategory}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE COLLAR CUT SELECTION MODAL DRAWER */}
      {/* ========================================================================= */}
      {isCutModalOpen && activeGroupIdForCut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">PILIH JENIS POTONGAN / KOLAR</h3>
                <p className="text-xs text-slate-500 font-medium">Pilih jenis gaya kolar jersi bersama gambar ilustrasi lengkap</p>
              </div>
              <button
                onClick={() => setIsCutModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 pr-1">
              {cutTypes.map((cut) => {
                const addOn = Number(cut.addOnPrice ?? cut.add_on_price ?? 0);
                const activeGroupObj = cutGroups.find((g) => g.id === activeGroupIdForCut);
                const isSelected = activeGroupObj?.cut?.id === cut.id;

                return (
                  <div
                    key={cut.id}
                    onClick={() => {
                      setCutGroups((prev) =>
                        prev.map((g) => (g.id === activeGroupIdForCut ? { ...g, cut } : g))
                      );
                      setIsCutModalOpen(false);
                    }}
                    className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/30 shadow-md bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-slate-900 text-white p-1 rounded-full z-10 shadow-xs">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}

                    <div className="w-full aspect-square bg-[#F5F5F7] rounded-xl overflow-hidden p-3 flex items-center justify-center">
                      <img
                        src={cut.thumbnail || PLACEHOLDER_IMAGE}
                        alt={cut.name}
                        className="w-full h-full object-contain img-crisp group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase text-slate-900 line-clamp-1">{cut.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{cut.desc || cut.description || '-'}</p>
                      <span className="text-[10px] font-mono font-bold text-slate-900 block pt-1">
                        {addOn > 0 ? `+RM ${addOn}.00` : 'STANDARD / FREE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsCutModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SIZE & QUANTITY SELECTION MODAL DRAWER (DEWASA & KIDS) */}
      {/* ========================================================================= */}
      {isSizeModalOpen && activeGroupIdForSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">TETAPKAN KUANTITI SAIZ</h3>
                <p className="text-xs text-slate-500 font-medium">Masukkan kuantiti bilangan baju mengikut saiz Dewasa atau Kanak-Kanak</p>
              </div>
              <button
                onClick={() => setIsSizeModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: DEWASA vs KIDS */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSizeModalTab('dewasa')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  sizeModalTab === 'dewasa' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SAIZ DEWASA (ADULT: XS - 5XL)
              </button>
              <button
                type="button"
                onClick={() => setSizeModalTab('kids')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  sizeModalTab === 'kids' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SAIZ KANAK-KANAK (KIDS: 22 - 32)
              </button>
            </div>

            {/* SIZE MATRIX INPUT GRID */}
            <div className="flex-1 overflow-y-auto pr-1">
              {sizeModalTab === 'dewasa' ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                  {ADULT_SIZES.map((sz) => {
                    const activeGroupObj = cutGroups.find((g) => g.id === activeGroupIdForSize);
                    const currentQty = activeGroupObj?.sizes?.[sz] || 0;

                    return (
                      <div key={sz} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                        <span className="text-xs font-mono font-bold text-slate-800 block">{sz}</span>
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateGroupSizeQty(activeGroupIdForSize, sz, -1)}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-200 active:scale-95 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-sm font-mono font-black text-slate-900 w-6">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => updateGroupSizeQty(activeGroupIdForSize, sz, 1)}
                            className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                  {KIDS_SIZES.map((sz) => {
                    const activeGroupObj = cutGroups.find((g) => g.id === activeGroupIdForSize);
                    const currentQty = activeGroupObj?.sizes?.[sz] || 0;

                    return (
                      <div key={sz} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                        <span className="text-xs font-mono font-bold text-slate-800 block">{sz}</span>
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateGroupSizeQty(activeGroupIdForSize, sz, -1)}
                            className="w-7 h-7 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-200 active:scale-95 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-sm font-mono font-black text-slate-900 w-6">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => updateGroupSizeQty(activeGroupIdForSize, sz, 1)}
                            className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-bold text-slate-700">
                JUMLAH KUMPULAN: {Object.values(cutGroups.find((g) => g.id === activeGroupIdForSize)?.sizes || {}).reduce((a, b) => a + Number(b || 0), 0)} pcs
              </span>

              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SPECIFICATION MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
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
                <span className="text-xs font-mono font-black uppercase text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
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
                  <Printer className="w-4 h-4 text-white" />
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
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          MEMUATKAN PANEL PENGGUNA AYEZZ...
        </p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
