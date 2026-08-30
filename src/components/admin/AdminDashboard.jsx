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
  LogOut
} from 'lucide-react';
import ImageUploadCropper from './ImageUploadCropper';
import MultiImageUploadCropper from './MultiImageUploadCropper';
import TemplateGalleryViewModal from './TemplateGalleryViewModal';

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
import { updateAdminMasterPin, getAdminUsersList, addNewAdminAccount } from '../../lib/authService';

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
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
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
      const [cats, cuts, sleeves, fabs, tpls, ords, settings, uList, showcase, admins] = await Promise.all([
        getCategories(),
        getCutTypes(),
        getSleeveTypes(),
        getFabricTypes(),
        getDesignTemplates(),
        getOrdersFromSupabase(),
        getStoreSettingsFromSupabase(),
        getUsersFromSupabase(),
        getShowcaseFeatureFromSupabase(),
        getAdminUsersList()
      ]);
      setCategories(cats);
      setCutTypes(cuts);
      setSleeveTypes(sleeves);
      setFabricTypes(fabs);
      setTemplates(tpls);
      setOrders(ords);
      if (settings) setStoreSettings(settings);
      setSystemUsers(uList || []);
      setAdminAccounts(admins || []);
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
        if (tplSubCat && !titles.includes(tplSubCat)) {
          titles.push(tplSubCat);
        }
        setDynamicSubCategories(titles);
        if (titles.length > 0 && !tplSubCat) {
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
    await fetchAllData();
    if (selectedParentCategory) {
      const subs = await getSubCategories(selectedParentCategory.id);
      setSubCategoryItems(subs || []);
    }
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 w-full">
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
                                ord.status?.includes('Ditolak') || ord.paymentStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : (ord.paymentStatus === 'paid' || ord.status?.includes('Lunas')
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300')
                              }`}>
                                {ord.status?.includes('Ditolak') || ord.paymentStatus === 'rejected'
                                  ? '✕ DITOLAK'
                                  : (ord.paymentStatus === 'paid' || ord.status?.includes('Lunas') ? '✓ LUNAS (CHIP)' : 'PENDING')}
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
                                <option value="Ditolak / Dibatalkan">Ditolak / Dibatalkan</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1">
                              <a
                                href={`/invoice?orderId=${ord.orderId || ord.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase transition-colors inline-block"
                              >
                                Invois / Job Sheet (PDF)
                              </a>
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
                                  const reason = prompt('Masukkan sebab pembatalan / reject pesanan ini:');
                                  if (reason !== null) {
                                    const newSt = 'Ditolak / Dibatalkan';
                                    setOrders(prev => prev.map(item => item.id === ord.id ? { ...item, status: newSt, paymentStatus: 'rejected' } : item));
                                    await updateOrderStatusInSupabase(ord.id, newSt, reason);
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold uppercase transition-colors"
                                title="Reject / Batal Pesanan Ini"
                              >
                                Reject
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

          {/* TAB 5: KATEGORI UTAMA */}
          {currentTab === 'categories' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kategori Utama (Main Categories)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uruskan kategori utama seperti Sublimasi, Custom Design, dan Aksesori Sukan.</p>
                </div>
                <button onClick={() => openAddModal('category')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Kategori</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GAMBAR COVER</th>
                      <th className="py-3 px-4">KOD</th>
                      <th className="py-3 px-4">NAMA KATEGORI</th>
                      <th className="py-3 px-4">DESKRIPSI</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada kategori terrekod. Tekan "+ Tambah Kategori" untuk cipta rekod baharu.
                        </td>
                      </tr>
                    ) : (
                      categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <img src={cat.thumbnail || PLACEHOLDER_IMAGE} alt={cat.title} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{cat.category_code || cat.code || 'CAT'}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{cat.title}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{cat.desc || cat.description}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => openEditModal('category', cat)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { setCategories(prev => prev.filter(c => c.id !== cat.id)); await deleteCategoryFromSupabase(cat.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md">
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

          {/* TAB 6: BAHAN KAIN */}
          {currentTab === 'fabrics' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Bahan Kain Sublimasi (Fabric Types)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Urus jenis fabric/kain seperti Mini Eyelet 150 GSM, Micro-Dryfit Pro, Pin Dot Fabric, dll.</p>
                </div>
                <button onClick={() => openAddModal('fabric')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Bahan Kain</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">NAMA BAHAN KAIN</th>
                      <th className="py-3 px-4">DESKRIPSI & SPESIFIKASI</th>
                      <th className="py-3 px-4">CAS TAMBAHAN</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {fabricTypes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada jenis kain terrekod. Tekan "+ Tambah Bahan Kain" untuk cipta rekod baharu.
                        </td>
                      </tr>
                    ) : (
                      fabricTypes.map(fab => (
                        <tr key={fab.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{fab.name}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{fab.desc || fab.description}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">+RM {Number(fab.addOnPrice ?? fab.add_on_price ?? 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => openEditModal('fabric', fab)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { setFabricTypes(prev => prev.filter(f => f.id !== fab.id)); await deleteFabricTypeFromSupabase(fab.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md">
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

          {/* TAB 7: TEMPLATE REKA BENTUK */}
          {currentTab === 'templates' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Template Reka Bentuk (Design Templates)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uruskan himpunan reka bentuk jersi sedia ada mengikut kod (cth: AG260001) dan kategori.</p>
                </div>
                <button onClick={() => openAddModal('template')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Template</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GAMBAR COVER (1:1)</th>
                      <th className="py-3 px-4">NAMA TEMPLATE / KOD</th>
                      <th className="py-3 px-4">KATEGORI</th>
                      <th className="py-3 px-4">HARGA ASAS (RM)</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {templates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada template terrekod. Tekan "+ Tambah Template" untuk cipta rekod baharu.
                        </td>
                      </tr>
                    ) : (
                      templates.map(tpl => (
                        <tr key={tpl.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <img src={tpl.thumbnail || PLACEHOLDER_IMAGE} alt={tpl.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{tpl.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{tpl.category || 'SUBLIMASI'}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">RM {Number(tpl.price || tpl.basePrice || 70).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => setViewingTemplate(tpl)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md" title="Pratonton Galeri Template">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal('template', tpl)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md" title="Edit Template">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                              if (window.confirm(`Adakah anda pasti untuk memadam Template "${tpl.name}"?`)) {
                                setTemplates(prev => prev.filter(t => t.id !== tpl.id));
                                await deleteDesignTemplateFromSupabase(tpl.id);
                              }
                            }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md" title="Padam Template">
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

          {/* TAB 8: PENGURUSAN AKAUN PENGGUNA */}
          {currentTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pengurusan Akaun Pengguna (Supabase DB)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Senarai akaun pengguna terdaftar di AYEZZ Global beserta peranan (Customer vs Admin).</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari Email / Nama Pengguna..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">NAMA PENGGUNA</th>
                      <th className="py-3 px-4">EMAIL</th>
                      <th className="py-3 px-4">NO TELEFON</th>
                      <th className="py-3 px-4">PERANAN (ROLE)</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {systemUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                          {isUsersLoading ? 'Memuatkan senarai pengguna...' : 'Belum ada rekod pengguna terdaftar dalam Supabase DB.'}
                        </td>
                      </tr>
                    ) : (
                      systemUsers
                        .filter(u => {
                          const q = userSearchQuery.toLowerCase();
                          if (!q) return true;
                          return (u.email || '').toLowerCase().includes(q) || (u.full_name || u.fullName || '').toLowerCase().includes(q);
                        })
                        .map(usr => (
                          <tr key={usr.id || usr.email} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{usr.full_name || usr.fullName || 'Pengguna AYEZZ'}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-700">{usr.email}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">{usr.phone || '-'}</td>
                            <td className="py-3.5 px-4 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${usr.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-700'}`}>
                                {usr.role || 'customer'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm(`Adakah anda pasti mahu memadam akaun ${usr.email}?`)) {
                                    setSystemUsers(prev => prev.filter(u => u.email !== usr.email));
                                    await deleteUserFromSupabase(usr.id || usr.email);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                title="Padam Pengguna"
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

          {/* TAB 9: BANNER SHOWCASE */}
          {currentTab === 'showcase' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pengurusan Banner Showcase (Lihat Lebih Dekat)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Urus maklumat banner promosi & gambar unggulan jersi sublimasi di Laman Utama.</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingShowcase(true);
                  await saveShowcaseFeatureToSupabase(showcaseFeature);
                  setIsSavingShowcase(false);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="space-y-4 max-w-2xl"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Tajuk Utama Showcase</label>
                  <input type="text" value={showcaseFeature.title || ''} onChange={(e) => setShowcaseFeature({ ...showcaseFeature, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none" required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sub-Tajuk / Penerangan Banner</label>
                  <textarea rows={3} value={showcaseFeature.subtitle || ''} onChange={(e) => setShowcaseFeature({ ...showcaseFeature, subtitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none resize-none" required />
                </div>

                <div>
                  <ImageUploadCropper
                    value={showcaseFeature.imageUrl || ''}
                    onChange={(croppedDataUrl) => setShowcaseFeature({ ...showcaseFeature, imageUrl: croppedDataUrl })}
                    label="Gambar Banner Showcase (16:9 HD)"
                  />
                </div>

                <div className="pt-3 flex items-center space-x-3">
                  <button type="submit" disabled={isSavingShowcase} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer">
                    {isSavingShowcase ? 'Menyimpan...' : 'Simpan Perubahan Banner'}
                  </button>
                  {saveSuccess && <span className="text-xs font-bold text-emerald-600 font-mono">✓ Tetapan Berjaya Disimpan!</span>}
                </div>
              </form>
            </div>
          )}

          {/* TAB 10: PENGURUSAN ADMIN */}
          {currentTab === 'admin_management' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pengurusan Akaun Admin & Kawalan Akses Portal</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uruskan senarai pentadbir (Admin) yang dibenarkan mengawal portal AYEZZ Global.</p>
                </div>
                <button
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>+ Tambah Admin Baharu</span>
                </button>
              </div>

              {/* ADMIN LIST TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">NAMA ADMIN</th>
                      <th className="py-3 px-4">EMAIL ADMIN</th>
                      <th className="py-3 px-4">NO TELEFON</th>
                      <th className="py-3 px-4">STATUS PERANAN</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {adminAccounts.map((adm, idx) => (
                      <tr key={adm.email || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {adm.fullName || 'Admin AYEZZ'}
                          {adm.isMaster && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-mono font-bold uppercase">Master</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{adm.email}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{adm.phone || '-'}</td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-200 rounded-full text-[10px] font-bold uppercase">
                            FULL ADMIN ACCESS
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!adm.isMaster && (
                            <button
                              onClick={async () => {
                                if (confirm(`Adakah anda pasti mahu memadam akaun admin ${adm.email}?`)) {
                                  setAdminAccounts(prev => prev.filter(a => a.email !== adm.email));
                                  await deleteUserFromSupabase(adm.email);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              title="Revoke Admin Status"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MASTER SECURITY PIN FORM */}
              <div className="max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 font-sans pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">TUKAR MASTER PIN (DESKTOP BACKUP)</span>
                  <p className="text-xs text-slate-500">PIN Sandaran tambahan untuk akses kecemasan Admin.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPinInput.length !== 4) {
                      setAdminPinNotice('PIN hendaklah tepat 4 digit nombor.');
                      return;
                    }
                    updateAdminMasterPin(adminPinInput);
                    setAdminPinNotice('PIN Master Keselamatan Admin berjaya dikemaskini!');
                    setAdminPinInput('');
                  }}
                  className="space-y-3 pt-2 border-t border-slate-200"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Tukar PIN Master (4 Digit)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="Contoh: 1234"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm font-black font-mono tracking-widest text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer">
                    Kemaskini PIN Master
                  </button>

                  {adminPinNotice && (
                    <p className="text-xs font-mono font-bold text-emerald-700 pt-1">{adminPinNotice}</p>
                  )}
                </form>
              </div>

              {/* MODAL: TAMBAH ADMIN BAHARU */}
              {isAddAdminModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
                  <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">+ AKSES PENTADBIR BAHARU</span>
                        <h3 className="text-lg font-black text-slate-900">Tambah Admin Baharu</h3>
                      </div>
                      <button onClick={() => setIsAddAdminModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newAdminEmail || !newAdminPass) return;
                        await addNewAdminAccount({
                          email: newAdminEmail,
                          password: newAdminPass,
                          fullName: newAdminName,
                          phone: newAdminPhone
                        });
                        const updatedList = await getAdminUsersList();
                        setAdminAccounts(updatedList || []);
                        setIsAddAdminModalOpen(false);
                        setNewAdminEmail('');
                        setNewAdminName('');
                        setNewAdminPhone('');
                        setNewAdminPass('');
                        alert(`Akaun Admin ${newAdminEmail} berjaya ditambahkan!`);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Penuh Admin</label>
                        <input
                          type="text"
                          required
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Contoh: Encik Farhan Admin"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Email Admin (Untuk Log Masuk)</label>
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="farhan@ayezz.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">No. Telefon Admin</label>
                        <input
                          type="text"
                          value={newAdminPhone}
                          onChange={(e) => setNewAdminPhone(e.target.value)}
                          placeholder="012-3456789"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kata Laluan (Password Admin)</label>
                        <input
                          type="password"
                          required
                          value={newAdminPass}
                          onChange={(e) => setNewAdminPass(e.target.value)}
                          placeholder="Masukkan kata laluan admin..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                        />
                      </div>

                      <div className="pt-2 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsAddAdminModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                          Batal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer">
                          Simpan Akaun Admin
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: TETAPAN KEDAI */}
          {currentTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Tetapan Kedai & Maklumat Kilang</h2>
                <p className="text-xs text-slate-500 mt-0.5">Urus maklumat rasmi perniagaan AYEZZ Global, WhatsApp hotline, dan gateway pembayaran.</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  await updateStoreSettingsInSupabase(storeSettings);
                  setIsLoading(false);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="space-y-4 max-w-xl"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Brand / Kedai</label>
                  <input type="text" value={storeSettings.storeName || 'AYEZZ GLOBAL'} onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 outline-none" required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">No. WhatsApp Hotline (Contoh: 601187818310)</label>
                  <input type="text" value={storeSettings.whatsappNumber || ''} onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 outline-none" required />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Simbol Mata Wang</label>
                  <input type="text" value={storeSettings.currencySymbol || 'RM'} onChange={(e) => setStoreSettings({ ...storeSettings, currencySymbol: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none" required />
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs font-mono text-emerald-900">
                  <span className="font-bold block">✓ CHIP PAYMENT GATEWAY STATUS: AKTIF</span>
                  <p className="text-[11px] text-emerald-700">Brand ID: 3f4c8590-5a15-4cfc-a1d0-ef79e0bf8eb7 • Gateway URL: gate.chip-in.asia</p>
                </div>

                <div className="pt-3 flex items-center space-x-3">
                  <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer">
                    Simpan Tetapan Kedai
                  </button>
                  {saveSuccess && <span className="text-xs font-bold text-emerald-600 font-mono">✓ Tetapan Berjaya Disimpan!</span>}
                </div>
              </form>
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
              {/* MODAL 1: KATEGORI UTAMA */}
              {modalType === 'category' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={catCover}
                      onChange={(croppedDataUrl) => setCatCover(croppedDataUrl)}
                      label="Gambar Cover Kategori (1:1)"
                      compact={true}
                    />
                  </div>
                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Kategori Utama</label>
                      <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Contoh: Sublimasi Sukan" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kod Kategori</label>
                      <input type="text" value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="Contoh: SUB-01" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: SUB-KATEGORI */}
              {modalType === 'subcategory' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={subCover}
                      onChange={(croppedDataUrl) => setSubCover(croppedDataUrl)}
                      label="Gambar Cover Sub-Kategori (1:1)"
                      compact={true}
                    />
                  </div>
                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Sub-Kategori</label>
                      <input type="text" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Contoh: Jersi Bola Sepak" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kod Sub-Kategori</label>
                      <input type="text" value={subCode} onChange={(e) => setSubCode(e.target.value)} placeholder="Contoh: FOOT-01" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 3: CUT / POTONGAN */}
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

              {/* MODAL 4: SLEEVE / LENGAN */}
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

              {/* MODAL 5: FABRIC / BAHAN KAIN */}
              {modalType === 'fabric' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={fabCover}
                      onChange={(croppedDataUrl) => setFabCover(croppedDataUrl)}
                      label="Gambar Sampel Kain (1:1)"
                      compact={true}
                    />
                  </div>
                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Bahan Kain</label>
                      <input type="text" value={fabName} onChange={(e) => setFabName(e.target.value)} placeholder="Contoh: Micro-Dryfit Pro 160 GSM" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Harga Asas (RM)</label>
                        <input type="number" value={fabPrice} onChange={(e) => setFabPrice(e.target.value)} placeholder="70" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Berat GSM Kain</label>
                        <input type="text" value={fabGsm} onChange={(e) => setFabGsm(e.target.value)} placeholder="150 GSM" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Gred / Tier Kain</label>
                      <select value={fabTier} onChange={(e) => setFabTier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none">
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Pro Match">Pro Match / Ultra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi & Kelebihan Kain</label>
                      <textarea
                        rows={3}
                        value={fabDesc}
                        onChange={(e) => setFabDesc(e.target.value)}
                        placeholder="Contoh: Kain sangat menyerap peluh, rasa lembut pada kulit, dan sesuai untuk perlawanan profesional."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 6: TEMPLATE REKA BENTUK */}
              {modalType === 'template' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Template Reka Bentuk</label>
                    <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Contoh: AG260003 - PRO MATCH JACKET" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori Utama</label>
                      <select value={tplCat} onChange={(e) => setTplCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none">
                        {categories.map(c => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sub-Kategori</label>
                      <select value={tplSubCat} onChange={(e) => setTplSubCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none">
                        {dynamicSubCategories.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Template</label>
                    <textarea
                      rows={3}
                      value={tplDesc}
                      onChange={(e) => setTplDesc(e.target.value)}
                      placeholder="Contoh: Design jersi sukan berona gelap dengan corak geometrik kontemporari."
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <MultiImageUploadCropper
                      images={tplImages}
                      onChange={(imgs) => setTplImages(imgs)}
                      maxImages={5}
                    />
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

      {/* TEMPLATE GALLERY VIEW MODAL */}
      {viewingTemplate && (
        <TemplateGalleryViewModal
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          allTemplates={templates}
          onSelectTemplate={(t) => setViewingTemplate(t)}
        />
      )}
    </div>
  );
}
