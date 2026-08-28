'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Palette,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Globe,
  Settings,
  RefreshCw,
  Sparkles,
  Shirt,
  Box,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  ListTree,
  Eye,
  Users,
  UserCheck,
  Shield,
  Search,
  Tv,
  Film,
  KeyRound,
  LogOut,
  Lock,
  Scissors
} from 'lucide-react';
import ImageUploadCropper from './ImageUploadCropper';
import MultiImageUploadCropper from './MultiImageUploadCropper';
import TemplateGalleryViewModal from './TemplateGalleryViewModal';
import {
  MAIN_CATALOGS as INITIAL_CATALOGS,
  DESIGN_TEMPLATES as INITIAL_TEMPLATES,
  CUT_TYPES as INITIAL_CUTS,
  FABRIC_TYPES as INITIAL_FABRICS
} from '../../data/sublimationProducts';
import {
  getCategories,
  insertCategoryToSupabase,
  updateCategoryInSupabase,
  deleteCategoryFromSupabase,
  getSubCategories,
  insertSubCategoryToSupabase,
  updateSubCategoryInSupabase,
  deleteSubCategoryFromSupabase,
  getCutTypes,
  insertCutTypeToSupabase,
  updateCutTypeInSupabase,
  deleteCutTypeFromSupabase,
  getSleeveTypes,
  insertSleeveTypeToSupabase,
  updateSleeveTypeInSupabase,
  deleteSleeveTypeFromSupabase,
  getFabricTypes,
  insertFabricTypeToSupabase,
  updateFabricTypeInSupabase,
  deleteFabricTypeFromSupabase,
  getDesignTemplates,
  insertDesignTemplateToSupabase,
  updateDesignTemplateInSupabase,
  deleteDesignTemplateFromSupabase,
  getOrdersFromSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  getStoreSettingsFromSupabase,
  updateStoreSettingsInSupabase,
  getUsersFromSupabase,
  deleteUserFromSupabase,
  updateUserRoleInSupabase,
  getShowcaseFeatureFromSupabase,
  saveShowcaseFeatureToSupabase,
  DEFAULT_SHOWCASE_FEATURE,
  PLACEHOLDER_IMAGE
} from '../../lib/supabaseService';
import { logoutAdmin, getAdminMasterPin, updateAdminMasterPin } from '../../lib/authService';

export default function AdminDashboard({ onSwitchToStorefront, onLogoutAdmin }) {
  const [currentTab, setCurrentTab] = useState('overview');
  const [viewingTemplate, setViewingTemplate] = useState(null);

  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cutTypes, setCutTypes] = useState([]);
  const [sleeveTypes, setSleeveTypes] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [systemUsers, setSystemUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ storeName: 'AYEZZ GLOBAL', whatsappNumber: '6287818310416', currencySymbol: 'RM' });
  const [showcaseFeature, setShowcaseFeature] = useState(DEFAULT_SHOWCASE_FEATURE);
  const [isSavingShowcase, setIsSavingShowcase] = useState(false);

  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinNotice, setAdminPinNotice] = useState('');

  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [subCategoryItems, setSubCategoryItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchUsersData = async () => {
    setIsUsersLoading(true);
    try {
      const uList = await getUsersFromSupabase();
      setSystemUsers(uList || []);
    } catch (e) {
      console.warn('Error fetching users:', e);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [cats, cuts, sleeves, fabs, tpls, ords, settings, uList, showcase] = await Promise.all([
        getCategories(),
        getCutTypes(),
        getSleeveTypes(),
        getFabricTypes(),
        getDesignTemplates(),
        getOrdersFromSupabase(),
        getStoreSettingsFromSupabase(),
        getUsersFromSupabase(),
        getShowcaseFeatureFromSupabase()
      ]);
      setCategories(cats);
      setCutTypes(cuts);
      setSleeveTypes(sleeves);
      setFabricTypes(fabs);
      setTemplates(tpls);
      setOrders(ords);
      if (settings) setStoreSettings(settings);
      setSystemUsers(uList || []);
      if (showcase) setShowcaseFeature(showcase);
    } catch (err) {
      console.warn('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    async function loadSubs() {
      if (selectedParentCategory) {
        setIsLoading(true);
        const subs = await getSubCategories(selectedParentCategory.id);
        setSubCategoryItems(subs);
        setIsLoading(false);
      }
    }
    loadSubs();
  }, [selectedParentCategory]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catCover, setCatCover] = useState('');

  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subCover, setSubCover] = useState('');

  const [cutName, setCutName] = useState('');
  const [cutPrice, setCutPrice] = useState('');
  const [cutDesc, setCutDesc] = useState('');
  const [cutCover, setCutCover] = useState('');

  const [sleeveName, setSleeveName] = useState('');
  const [sleevePrice, setSleevePrice] = useState('');
  const [sleeveDesc, setSleeveDesc] = useState('');
  const [sleeveCover, setSleeveCover] = useState('');

  const [fabName, setFabName] = useState('');
  const [fabPrice, setFabPrice] = useState('');
  const [fabTier, setFabTier] = useState('Premium');
  const [fabGsm, setFabGsm] = useState('150 GSM');
  const [fabFeatures, setFabFeatures] = useState('');
  const [fabDesc, setFabDesc] = useState('');
  const [fabCover, setFabCover] = useState('');

  // TEMPLATE REKA BENTUK MULTI-PHOTO GALLERY INPUT STATES
  const [tplName, setTplName] = useState('');
  const [tplCat, setTplCat] = useState('Olahraga');
  const [tplSubCat, setTplSubCat] = useState('Sepak Bola');
  const [tplDesc, setTplDesc] = useState('');
  const [tplImages, setTplImages] = useState([]);
  const [dynamicSubCategories, setDynamicSubCategories] = useState([]);

  useEffect(() => {
    async function updateTemplateSubCategories() {
      const selectedCategoryObj = categories.find(c => c.title === tplCat);
      if (selectedCategoryObj) {
        const subs = await getSubCategories(selectedCategoryObj.id);
        const titles = subs.length > 0 ? subs.map(s => s.title) : (selectedCategoryObj.subCategories?.filter(s => s !== 'Semua') || []);
        setDynamicSubCategories(titles);
        if (titles.length > 0 && !titles.includes(tplSubCat)) {
          setTplSubCat(titles[0]);
        }
      }
    }
    updateTemplateSubCategories();
  }, [tplCat, categories]);

  const handleDeleteCategory = async (cat) => {
    const subs = await getSubCategories(cat.id);
    const totalSubCount = subs ? subs.length : (cat.subCategories ? cat.subCategories.length : 0);

    if (totalSubCount > 0) {
      alert(`⚠️ KATEGORI TIDAK BOLEH DIPADAM!\n\nKategori "${cat.title}" masih mempunyai ${totalSubCount} Sub-Kategori turunan.\n\nSila padam semua Sub-Kategori di dalamnya terlebih dahulu sebelum memadam kategori utama ini.`);
      return;
    }

    if (window.confirm(`Adakah anda pasti untuk memadam Kategori "${cat.title}"?`)) {
      const res = await deleteCategoryFromSupabase(cat.id);
      if (res && res.success === false) {
        alert(`⚠️ ${res.message || 'Gagal memadam kategori'}`);
        return;
      }
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    }
  };

  const openAddModal = (type) => {
    setModalMode('add');
    setModalType(type);
    setEditingId(null);
    setCatName(''); setCatCode(''); setCatCover('');
    setSubName(''); setSubCode(''); setSubCover('');
    setCutName(''); setCutPrice(''); setCutDesc(''); setCutCover('');
    setSleeveName(''); setSleevePrice(''); setSleeveDesc(''); setSleeveCover('');
    setFabName(''); setFabPrice(''); setFabTier('Premium'); setFabGsm('150 GSM'); setFabFeatures(''); setFabDesc(''); setFabCover('');
    setTplName(''); setTplCat(categories[0]?.title || 'Olahraga'); setTplSubCat(''); setTplDesc(''); setTplImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalMode('edit');
    setModalType(type);
    setEditingId(item.id);

    if (type === 'category') {
      setCatName(item.title); setCatCode(item.code); setCatCover(item.thumbnail || '');
    } else if (type === 'subcategory') {
      setSubName(item.title); setSubCode(item.code); setSubCover(item.thumbnail || '');
    } else if (type === 'cut') {
      setCutName(item.name); setCutPrice(item.addOnPrice ?? item.add_on_price ?? 0); setCutDesc(item.desc || item.description || ''); setCutCover(item.thumbnail || '');
    } else if (type === 'sleeve') {
      setSleeveName(item.name); setSleevePrice(item.addOnPrice ?? item.add_on_price ?? 0); setSleeveDesc(item.desc || item.description || ''); setSleeveCover(item.thumbnail || '');
    } else if (type === 'fabric') {
      setFabName(item.name); setFabPrice(item.basePrice ?? item.base_price ?? 70); setFabTier(item.tier || 'Premium'); setFabGsm(item.gsm || '150 GSM'); setFabFeatures(item.features || ''); setFabDesc(item.desc || item.description || ''); setFabCover(item.thumbnail || '');
    } else if (type === 'template') {
      setTplName(item.name); setTplCat(item.category || 'Olahraga'); setTplSubCat(item.subCategory || ''); setTplDesc(item.description || ''); setTplImages(Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.thumbnail || PLACEHOLDER_IMAGE]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'category') {
      if (!catName) return;
      const coverImg = catCover || PLACEHOLDER_IMAGE;

      if (modalMode === 'add') {
        const newCat = {
          id: `cat_${Date.now()}`,
          code: catCode || `0${categories.length + 1}`,
          title: catName,
          itemCount: '0 Jenis',
          thumbnail: coverImg
        };
        setCategories(prev => [...prev, newCat]);
        await insertCategoryToSupabase(newCat);
      } else {
        const updated = {
          code: catCode,
          title: catName,
          thumbnail: coverImg
        };
        setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
        await updateCategoryInSupabase(editingId, updated);
      }
    } else if (modalType === 'subcategory') {
      if (!subName || !selectedParentCategory) return;
      const coverImg = subCover || selectedParentCategory.thumbnail;

      if (modalMode === 'add') {
        const newSub = {
          id: `sub_${Date.now()}`,
          categoryId: selectedParentCategory.id,
          code: subCode || `0${subCategoryItems.length + 1}`,
          title: subName,
          thumbnail: coverImg
        };
        setSubCategoryItems(prev => [...prev, newSub]);
        await insertSubCategoryToSupabase(newSub);
      } else {
        const updated = {
          code: subCode,
          title: subName,
          thumbnail: coverImg
        };
        setSubCategoryItems(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s));
        await updateSubCategoryInSupabase(editingId, updated);
      }
    } else if (modalType === 'cut') {
      if (!cutName) return;
      const coverImg = cutCover || PLACEHOLDER_IMAGE;

      if (modalMode === 'add') {
        const newCut = { id: `cut_${Date.now()}`, name: cutName, addOnPrice: parseFloat(cutPrice) || 0, desc: cutDesc || 'Potongan kustom', thumbnail: coverImg };
        setCutTypes(prev => [...prev, newCut]);
        await insertCutTypeToSupabase(newCut);
      } else {
        const updated = { id: editingId, name: cutName, addOnPrice: parseFloat(cutPrice) || 0, desc: cutDesc, thumbnail: coverImg };
        setCutTypes(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
        await updateCutTypeInSupabase(editingId, updated);
      }
    } else if (modalType === 'sleeve') {
      if (!sleeveName) return;
      const coverImg = sleeveCover || PLACEHOLDER_IMAGE;

      if (modalMode === 'add') {
        const newSleeve = { id: `sleeve_${Date.now()}`, name: sleeveName, addOnPrice: parseFloat(sleevePrice) || 0, desc: sleeveDesc || 'Jenis lengan', thumbnail: coverImg };
        setSleeveTypes(prev => [...prev, newSleeve]);
        await insertSleeveTypeToSupabase(newSleeve);
      } else {
        const updated = { id: editingId, name: sleeveName, addOnPrice: parseFloat(sleevePrice) || 0, desc: sleeveDesc, thumbnail: coverImg };
        setSleeveTypes(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s));
        await updateSleeveTypeInSupabase(editingId, updated);
      }
    } else if (modalType === 'fabric') {
      if (!fabName) return;
      const coverImg = fabCover || PLACEHOLDER_IMAGE;

      if (modalMode === 'add') {
        const newFab = { id: `fab_${Date.now()}`, name: fabName, basePrice: parseFloat(fabPrice) || 70, tier: fabTier, gsm: fabGsm, features: fabFeatures, desc: fabDesc, thumbnail: coverImg };
        setFabricTypes(prev => [...prev, newFab]);
        await insertFabricTypeToSupabase(newFab);
      } else {
        const updated = { id: editingId, name: fabName, basePrice: parseFloat(fabPrice) || 70, tier: fabTier, gsm: fabGsm, features: fabFeatures, desc: fabDesc, thumbnail: coverImg };
        setFabricTypes(prev => prev.map(f => f.id === editingId ? { ...f, ...updated } : f));
        await updateFabricTypeInSupabase(editingId, updated);
      }
    } else if (modalType === 'template') {
      if (!tplName) return;
      const galleryImages = tplImages.length > 0 ? tplImages : [PLACEHOLDER_IMAGE];
      const primaryThumb = galleryImages[0];

      if (modalMode === 'add') {
        const newTpl = { id: `tpl_${Date.now()}`, name: tplName, category: tplCat, subCategory: tplSubCat, description: tplDesc, thumbnail: primaryThumb, images: galleryImages };
        setTemplates(prev => [...prev, newTpl]);
        await insertDesignTemplateToSupabase(newTpl);
      } else {
        const updated = { id: editingId, name: tplName, category: tplCat, subCategory: tplSubCat, description: tplDesc, thumbnail: primaryThumb, images: galleryImages };
        setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...updated } : t));
        await updateDesignTemplateInSupabase(editingId, updated);
      }
    }
    setIsModalOpen(false);
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    await updateStoreSettingsInSupabase(storeSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans antialiased text-slate-100 overflow-hidden select-none">
      {/* 1. FIXED LEFT SIDEBAR (260px) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ GLOBAL Logo" className="h-7 w-auto filter invert brightness-200" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">ADMIN</span>
          </div>

          <nav className="p-4 space-y-1 text-xs">
            <span className="px-3 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-2">PANEL UTAMA</span>

            <button
              onClick={() => { setCurrentTab('overview'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'overview' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard Utama</span>
            </button>
          </nav>

          <div className="px-4 py-2 space-y-1 text-xs">
            <span className="px-3 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-2">PENGURUSAN DATA</span>

            <button
              onClick={() => { setCurrentTab('categories'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'categories' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Box className="w-4 h-4 text-slate-400" />
              <span>Kategori Utama</span>
            </button>

            <button
              onClick={() => { setCurrentTab('cuts'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'cuts' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shirt className="w-4 h-4 text-slate-400" />
              <span>Jenis Potongan / Kolar</span>
            </button>

            <button
              onClick={() => { setCurrentTab('sleeves'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'sleeves' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Scissors className="w-4 h-4 text-slate-400" />
              <span>Jenis Lengan (Sleeve)</span>
            </button>

            <button
              onClick={() => { setCurrentTab('fabrics'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'fabrics' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Bahan & Kain</span>
            </button>

            <button
              onClick={() => { setCurrentTab('templates'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'templates' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4 text-slate-400" />
              <span>Template Reka Bentuk</span>
            </button>
          </div>

          <div className="p-4 space-y-1 text-xs">
            <span className="px-3 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-2">JUALAN & SISTEM</span>

            <button
              onClick={() => { setCurrentTab('orders'); setSelectedParentCategory(null); fetchAllData(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'orders' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Senarai Pesanan ({orders.length})</span>
            </button>

            <button
              onClick={() => { setCurrentTab('users'); setSelectedParentCategory(null); fetchUsersData(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'users' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Pengurusan Pengguna ({systemUsers.length})</span>
            </button>

            <button
              onClick={() => { setCurrentTab('showcase'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'showcase' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Tv className="w-4 h-4 text-slate-400" />
              <span>Lihat Lebih Dekat</span>
            </button>

            <button
              onClick={() => { setCurrentTab('admin_management'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'admin_management' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span>Pengurusan Admin</span>
            </button>

            <button
              onClick={() => { setCurrentTab('settings'); setSelectedParentCategory(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentTab === 'settings' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Tetapan Kedai</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-2">
          <button
            onClick={onSwitchToStorefront}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span>Lihat Laman Awam</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              if (onLogoutAdmin) onLogoutAdmin();
            }}
            className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-rose-500/30 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Keluar Admin</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ENTERPRISE CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between z-10 shrink-0 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            {selectedParentCategory ? (
              <div className="flex items-center space-x-2 font-semibold">
                <button onClick={() => setSelectedParentCategory(null)} className="text-slate-500 hover:text-slate-900 transition-colors">
                  Kategori Utama
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold">{selectedParentCategory.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Datatable Sub-Kategori</span>
              </div>
            ) : (
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                {currentTab === 'overview' && 'Dashboard Utama'}
                {currentTab === 'categories' && 'Pengurusan Kategori Utama'}
                {currentTab === 'cuts' && 'Jenis Potongan & Kolar'}
                {currentTab === 'sleeves' && 'Jenis Lengan (Sleeve)'}
                {currentTab === 'fabrics' && 'Bahan Kain Sublimasi'}
                {currentTab === 'templates' && 'Template Reka Bentuk'}
                {currentTab === 'orders' && 'Senarai Pesanan Pelanggan'}
                {currentTab === 'users' && 'Pengurusan Akaun Pengguna'}
                {currentTab === 'showcase' && 'Pengurusan Banner Showcase'}
                {currentTab === 'admin_management' && 'Pengurusan Admin & PIN Keselamatan'}
                {currentTab === 'settings' && 'Tetapan Kedai'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllData}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Kemaskini Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">KATEGORI UTAMA</span>
                    <Box className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-900 block">{categories.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">JENIS POTONGAN</span>
                    <Shirt className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-900 block">{cutTypes.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">JENIS LENGAN</span>
                    <Scissors className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-900 block">{sleeveTypes.length}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TEMPLATE REKA BENTUK</span>
                    <Palette className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-900 block">{templates.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JENIS POTONGAN */}
          {currentTab === 'cuts' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Jenis Potongan & Kolar</h2>
                <button onClick={() => openAddModal('cut')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Potongan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GAMBAR COVER (1:1)</th>
                      <th className="py-3 px-4">JENIS POTONGAN / KOLAR</th>
                      <th className="py-3 px-4">DESKRIPSI</th>
                      <th className="py-3 px-4">CAS TAMBAHAN</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {cutTypes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada jenis potongan terrekod. Tekan "+ Tambah Potongan" untuk cipta rekod baharu.
                        </td>
                      </tr>
                    ) : (
                      cutTypes.map(cut => (
                        <tr key={cut.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={cut.thumbnail || PLACEHOLDER_IMAGE}
                              alt={cut.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200/80 shadow-2xs"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{cut.name}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{cut.desc}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">+RM {Number(cut.addOnPrice ?? cut.add_on_price ?? 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => openEditModal('cut', cut)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { setCutTypes(prev => prev.filter(c => c.id !== cut.id)); await deleteCutTypeFromSupabase(cut.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3.5: JENIS LENGAN (SLEEVE TYPES) */}
          {currentTab === 'sleeves' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Jenis Lengan (Sleeve Types)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uruskan pilihan jenis lengan (Lengan Pendek, Lengan Panjang, Muslimah, Singlet) beserta harga tambahan.</p>
                </div>
                <button onClick={() => openAddModal('sleeve')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Jenis Lengan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GAMBAR COVER (1:1)</th>
                      <th className="py-3 px-4">NAMA JENIS LENGAN</th>
                      <th className="py-3 px-4">DESKRIPSI</th>
                      <th className="py-3 px-4">CAS TAMBAHAN</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {sleeveTypes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada jenis lengan terrekod. Tekan "+ Tambah Jenis Lengan" untuk cipta rekod baharu.
                        </td>
                      </tr>
                    ) : (
                      sleeveTypes.map(sleeve => (
                        <tr key={sleeve.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={sleeve.thumbnail || PLACEHOLDER_IMAGE}
                              alt={sleeve.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200/80 shadow-2xs"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{sleeve.name}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{sleeve.desc}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">+RM {Number(sleeve.addOnPrice ?? sleeve.add_on_price ?? 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => openEditModal('sleeve', sleeve)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { setSleeveTypes(prev => prev.filter(s => s.id !== sleeve.id)); await deleteSleeveTypeFromSupabase(sleeve.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS DATATABLE */}
          {currentTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Senarai Pesanan Pelanggan (Supabase DB)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Semua tempahan jersi kustom dari pelanggan beserta status bayaran CHIP-IN dan butiran pemain.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Cari ID Pesanan / Nama..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">KOD PESANAN</th>
                      <th className="py-3 px-4">PELANGGAN & TEL</th>
                      <th className="py-3 px-4">REKA BENTUK</th>
                      <th className="py-3 px-4">SPESIFIKASI</th>
                      <th className="py-3 px-4">JUMLAH (RM)</th>
                      <th className="py-3 px-4">BAYARAN (CHIP)</th>
                      <th className="py-3 px-4">STATUS KILANG</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada pesanan terrekod dalam Supabase DB.
                        </td>
                      </tr>
                    ) : (
                      orders
                        .filter(o => {
                          const q = orderSearchQuery.toLowerCase();
                          if (!q) return true;
                          return (
                            (o.orderId || o.id || '').toLowerCase().includes(q) ||
                            (o.client || '').toLowerCase().includes(q) ||
                            (o.userEmail || '').toLowerCase().includes(q) ||
                            (o.template || '').toLowerCase().includes(q)
                          );
                        })
                        .map(ord => (
                          <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              #{ord.orderId || ord.id}
                              <span className="text-[10px] font-mono text-slate-400 block font-normal">{ord.date}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{ord.client}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">{ord.customerPhone || ord.userEmail || '-'}</span>
                            </td>
                            <td className="py-3.5 px-4 font-extrabold uppercase text-slate-900">{ord.template}</td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                              {ord.cutType} • {ord.fabricMaterial}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              {ord.total}
                              <span className="text-[10px] text-slate-500 block font-mono font-normal">({ord.qty} pcs)</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                                ord.paymentStatus === 'paid' || ord.status?.includes('Lunas')
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {ord.paymentStatus === 'paid' || ord.status?.includes('Lunas') ? '✓ LUNAS (CHIP)' : 'PENDING'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={ord.status}
                                onChange={async (e) => {
                                  const newSt = e.target.value;
                                  setOrders(prev => prev.map(item => item.id === ord.id ? { ...item, status: newSt } : item));
                                  await updateOrderStatusInSupabase(ord.id, newSt);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-900 outline-none"
                              >
                                <option value="Pesanan Diterima">Pesanan Diterima</option>
                                <option value="Pesanan Diterima & Lunas">Pesanan Diterima & Lunas</option>
                                <option value="Dalam Cetakan Kilang">Dalam Cetakan Kilang</option>
                                <option value="Siap & Dihantar">Siap & Dihantar</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedOrderForDetail(ord);
                                  setIsOrderDetailOpen(true);
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold uppercase transition-colors"
                              >
                                Butiran
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Adakah anda pasti mahu memadam pesanan ini?')) {
                                    setOrders(prev => prev.filter(o => o.id !== ord.id));
                                    await deleteOrderFromSupabase(ord.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                title="Padam"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ORDER DETAIL MODAL */}
      {isOrderDetailOpen && selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
          <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">BUTIRAN PESANAN KILANG</span>
                <h3 className="text-lg font-black text-slate-900 font-mono">#{selectedOrderForDetail.orderId || selectedOrderForDetail.id}</h3>
              </div>
              <button onClick={() => setIsOrderDetailOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px]">MAKLUMAT PELANGGAN</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrderForDetail.client}</p>
                <p className="text-slate-600">Tel: {selectedOrderForDetail.customerPhone || '-'}</p>
                <p className="text-slate-600">Pasukan: {selectedOrderForDetail.teamName || '-'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px]">RINGKASAN HARGA & BAYARAN</span>
                <p className="font-black text-slate-900 text-base">{selectedOrderForDetail.total} ({selectedOrderForDetail.qty} pcs)</p>
                <p className="text-slate-600">Status Bayaran: <strong className="text-emerald-700">{selectedOrderForDetail.paymentStatus === 'paid' ? 'LUNAS (CHIP-IN)' : 'PENDING'}</strong></p>
                <p className="text-slate-600">Tarikh: {selectedOrderForDetail.date}</p>
              </div>
            </div>

            {/* PLAYER NAMES TABLE IF AVAILABLE */}
            {Array.isArray(selectedOrderForDetail.playerRows) && selectedOrderForDetail.playerRows.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">SENARAI NAMA & NOMBOR PEMAIN (MANUAL TABLE)</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 border-b border-slate-200 font-mono text-[10px] text-slate-600 uppercase">
                      <tr>
                        <th className="py-2 px-3">BIL</th>
                        <th className="py-2 px-3">NAMA PEMAIN</th>
                        <th className="py-2 px-3">NOMBOR BAJU</th>
                        <th className="py-2 px-3">SAIZ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedOrderForDetail.playerRows.map((p, idx) => (
                        <tr key={p.id || idx}>
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{p.name || '-'}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{p.number || '-'}</td>
                          <td className="py-2 px-3 text-slate-600">{p.size || 'L'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ATTACHMENTS / FILE LINKS */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-800">DOKUMEN & LOGO TERUNGGAH</h4>
              <div className="flex flex-wrap gap-3 text-xs font-mono">
                {selectedOrderForDetail.customLogoUrl && (
                  <a href={selectedOrderForDetail.customLogoUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg border border-slate-300 flex items-center space-x-1.5">
                    <span>🖼️ Logo Pasukan</span>
                  </a>
                )}
                {selectedOrderForDetail.sponsorLogoUrl && (
                  <a href={selectedOrderForDetail.sponsorLogoUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg border border-slate-300 flex items-center space-x-1.5">
                    <span>🖼️ Logo Sponsor</span>
                  </a>
                )}
                {selectedOrderForDetail.playerListFileUrl && (
                  <a href={selectedOrderForDetail.playerListFileUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg border border-slate-300 flex items-center space-x-1.5">
                    <span>📄 Fail Senarai Pemain</span>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsOrderDetailOpen(false)} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200/80 shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {modalMode === 'add' ? 'Tambah ' : 'Kemaskini '}
                {modalType === 'category' && 'Kategori Utama'}
                {modalType === 'subcategory' && `Sub-Kategori (${selectedParentCategory?.title})`}
                {modalType === 'cut' && 'Jenis Potongan / Kolar'}
                {modalType === 'sleeve' && 'Jenis Lengan (Sleeve)'}
                {modalType === 'fabric' && 'Bahan Kain Sublimasi'}
                {modalType === 'template' && 'Template Reka Bentuk'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {modalType === 'cut' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={cutCover}
                      onChange={(croppedDataUrl) => setCutCover(croppedDataUrl)}
                      label="Gambar Potongan / Kolar (1:1)"
                      compact={true}
                    />
                  </div>

                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Jenis Potongan / Kolar</label>
                      <input type="text" value={cutName} onChange={(e) => setCutName(e.target.value)} placeholder="Contoh: Roundneck (Leher Bulat)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Cas Tambahan (RM)</label>
                      <input type="number" value={cutPrice} onChange={(e) => setCutPrice(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Kolar / Potongan</label>
                      <textarea
                        rows={3}
                        value={cutDesc}
                        onChange={(e) => setCutDesc(e.target.value)}
                        placeholder="Contoh: Potongan kolar gaya leher bulat klasik untuk keselesaan aktiviti sukan."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'sleeve' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={sleeveCover}
                      onChange={(croppedDataUrl) => setSleeveCover(croppedDataUrl)}
                      label="Gambar Jenis Lengan (1:1)"
                      compact={true}
                    />
                  </div>

                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Jenis Lengan</label>
                      <input type="text" value={sleeveName} onChange={(e) => setSleeveName(e.target.value)} placeholder="Contoh: Lengan Panjang (Long Sleeve)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Cas Tambahan Lengan (RM)</label>
                      <input type="number" value={sleevePrice} onChange={(e) => setSleevePrice(e.target.value)} placeholder="5" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Jenis Lengan</label>
                      <textarea
                        rows={3}
                        value={sleeveDesc}
                        onChange={(e) => setSleeveDesc(e.target.value)}
                        placeholder="Contoh: Lengan panjang tambahan dengan kemasan cuff getah di pergelangan tangan."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
