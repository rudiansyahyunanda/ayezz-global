import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Scissors,
  Layers,
  Palette,
  ShoppingBag,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Globe,
  RefreshCw,
  X,
  Save,
  Check,
  ChevronRight,
  ArrowLeft,
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
  Lock
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
  DEFAULT_SHOWCASE_FEATURE
} from '../../lib/supabaseService';
import { logoutAdmin, getAdminMasterPin, updateAdminMasterPin } from '../../lib/authService';

export default function AdminDashboard({ onSwitchToStorefront, onLogoutAdmin }) {
  const [currentTab, setCurrentTab] = useState('overview');
  const [viewingTemplate, setViewingTemplate] = useState(null);

  const [categories, setCategories] = useState(INITIAL_CATALOGS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [cutTypes, setCutTypes] = useState(INITIAL_CUTS);
  const [fabricTypes, setFabricTypes] = useState(INITIAL_FABRICS);
  const [orders, setOrders] = useState([]);
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
      const [cats, cuts, fabs, tpls, ords, settings, uList, showcase] = await Promise.all([
        getCategories(),
        getCutTypes(),
        getFabricTypes(),
        getDesignTemplates(),
        getOrdersFromSupabase(),
        getStoreSettingsFromSupabase(),
        getUsersFromSupabase(),
        getShowcaseFeatureFromSupabase()
      ]);
      setCategories(cats);
      setCutTypes(cuts);
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
      } else {
        setDynamicSubCategories([]);
      }
    }
    updateTemplateSubCategories();
  }, [tplCat, categories]);

  const openEditModal = (type, item) => {
    setModalMode('edit');
    setModalType(type);
    setEditingId(item.id);

    if (type === 'category') {
      setCatName(item.title);
      setCatCode(item.code);
      setCatCover(item.thumbnail || '');
    } else if (type === 'subcategory') {
      setSubName(item.title);
      setSubCode(item.code);
      setSubCover(item.thumbnail || '');
    } else if (type === 'cut') {
      setCutName(item.name);
      setCutPrice((item.addOnPrice ?? item.add_on_price ?? 0).toString());
      setCutDesc(item.desc || item.description || '');
      setCutCover(item.thumbnail || '');
    } else if (type === 'fabric') {
      setFabName(item.name);
      setFabPrice((item.basePrice ?? item.base_price ?? 70).toString());
      setFabTier(item.tier || 'Premium');
      setFabGsm(item.gsm || '150 GSM');
      setFabFeatures(item.features || '');
      setFabDesc(item.desc || item.description || '');
      setFabCover(item.thumbnail || '');
    } else if (type === 'template') {
      setTplName(item.name);
      setTplCat(item.category || (categories[0]?.title || 'Olahraga'));
      setTplSubCat(item.subCategory || '');
      setTplDesc(item.description || '');
      const existingImgs = Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.thumbnail ? [item.thumbnail] : []);
      setTplImages(existingImgs);
    }
    setIsModalOpen(true);
  };

  const openAddModal = (type) => {
    setModalMode('add');
    setModalType(type);
    setEditingId(null);
    setCatName(''); setCatCode(''); setCatCover('');
    setSubName(''); setSubCode(''); setSubCover('');
    setCutName(''); setCutPrice(''); setCutDesc(''); setCutCover('');
    setFabName(''); setFabPrice(''); setFabTier('Premium'); setFabGsm('150 GSM'); setFabFeatures(''); setFabDesc(''); setFabCover('');
    setTplName(''); setTplCat(categories[0]?.title || 'Olahraga'); setTplSubCat(''); setTplDesc(''); setTplImages([]);
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
        const updated = { name: cutName, addOnPrice: parseFloat(cutPrice) || 0, desc: cutDesc || 'Potongan kustom', thumbnail: coverImg };
        setCutTypes(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
        await updateCutTypeInSupabase(editingId, updated);
      }
    } else if (modalType === 'fabric') {
      if (!fabName) return;
      const coverImg = fabCover || PLACEHOLDER_IMAGE;

      if (modalMode === 'add') {
        const newFab = {
          id: `fab_${Date.now()}`,
          name: fabName,
          basePrice: parseFloat(fabPrice) || 70,
          tier: fabTier,
          gsm: fabGsm || '150 GSM',
          features: fabFeatures,
          desc: fabDesc || 'Bahan kustom',
          thumbnail: coverImg
        };
        setFabricTypes(prev => [...prev, newFab]);
        await insertFabricTypeToSupabase(newFab);
      } else {
        const updated = {
          name: fabName,
          basePrice: parseFloat(fabPrice) || 70,
          tier: fabTier,
          gsm: fabGsm || '150 GSM',
          features: fabFeatures,
          desc: fabDesc || 'Bahan kain sublimasi',
          thumbnail: coverImg
        };
        setFabricTypes(prev => prev.map(f => f.id === editingId ? { ...f, ...updated } : f));
        await updateFabricTypeInSupabase(editingId, updated);
      }
    } else if (modalType === 'template') {
      if (!tplName) return;
      const finalImgs = tplImages.length > 0 ? tplImages : [PLACEHOLDER_IMAGE];
      if (modalMode === 'add') {
        const newTpl = {
          id: `tpl_${Date.now()}`,
          name: tplName,
          category: tplCat,
          subCategory: tplSubCat,
          description: tplDesc,
          thumbnail: finalImgs[0],
          images: finalImgs
        };
        setTemplates(prev => [newTpl, ...prev]);
        await insertDesignTemplateToSupabase(newTpl);
      } else {
        const updated = {
          name: tplName,
          category: tplCat,
          subCategory: tplSubCat,
          description: tplDesc,
          thumbnail: finalImgs[0],
          images: finalImgs
        };
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
    <div className="w-screen h-screen flex bg-[#F9FAFB] text-[#0F172A] font-sans overflow-hidden select-none antialiased">
      {/* 1. ENTERPRISE MINIMALIST SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between shrink-0 z-30 shadow-xl border-r border-slate-800">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-xs shrink-0">
              <img src="/logo/ayezz-logo-01.svg" alt="AYEZZ Logo" className="w-full h-full object-contain" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold tracking-wider uppercase block leading-tight text-white truncate">AYEZZ GLOBAL</span>
              <span className="text-[11px] font-medium text-slate-400 block">Console Pentadbir</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 text-xs font-medium">
            <div className="space-y-1">
              <button
                onClick={() => { setCurrentTab('overview'); setSelectedParentCategory(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentTab === 'overview' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard Utama</span>
              </button>
            </div>

            <div className="space-y-1">
              <span className="px-3 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block mb-2">PRODUK & INOVASI</span>

              <button
                onClick={() => { setCurrentTab('categories'); setSelectedParentCategory(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentTab === 'categories' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FolderTree className="w-4 h-4 text-slate-400" />
                <span>Kategori Utama</span>
              </button>

              <button
                onClick={() => { setCurrentTab('cuts'); setSelectedParentCategory(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  currentTab === 'cuts' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Scissors className="w-4 h-4 text-slate-400" />
                <span>Jenis Potongan</span>
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

            <div className="space-y-1">
              <span className="px-3 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block mb-2">JUALAN & SISTEM</span>

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
        </div>
      </aside>

      {/* 2. MAIN ENTERPRISE CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB]">
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
                {currentTab === 'fabrics' && 'Bahan Kain Sublimasi'}
                {currentTab === 'templates' && 'Template Reka Bentuk'}
                {currentTab === 'studio3d' && 'Studio Mockup 3D (Ujicoba Tekstur Automatik)'}
                {currentTab === 'orders' && 'Senarai Pesanan Pelanggan'}
                {currentTab === 'showcase' && 'Pengurusan Banner Showcase "Lihat Lebih Dekat"'}
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

        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategori Utama</span>
                  <div className="text-2xl font-bold text-[#0F172A]">{categories.length}</div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jenis Potongan</span>
                  <div className="text-2xl font-bold text-[#0F172A]">{cutTypes.length}</div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bahan Kain</span>
                  <div className="text-2xl font-bold text-[#0F172A]">{fabricTypes.length}</div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Pesanan</span>
                  <div className="text-2xl font-bold text-[#0F172A]">{orders.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KATEGORI UTAMA & SUB-KATEGORI DRILL-DOWN DATATABLE */}
          {currentTab === 'categories' && (
            <>
              {!selectedParentCategory && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Senarai Kategori Utama</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Tekan ikon <ListTree className="w-3 h-3 inline text-slate-600" /> pada baris kategori untuk menguruskan submenu Sub-Kategori.</p>
                    </div>
                    <button
                      onClick={() => openAddModal('category')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> <span>Tambah Kategori</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">COVER IMAGE (1:1)</th>
                          <th className="py-3 px-4">KOD</th>
                          <th className="py-3 px-4">NAMA KATEGORI UTAMA</th>
                          <th className="py-3 px-4">BIL. SUB-KATEGORI</th>
                          <th className="py-3 px-4 text-right">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {categories.map(cat => (
                          <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={cat.thumbnail || PLACEHOLDER_IMAGE}
                                alt={cat.title}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200/80 shadow-2xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{cat.code}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">
                              <button
                                onClick={() => setSelectedParentCategory(cat)}
                                className="hover:underline hover:text-slate-600 transition-all text-left"
                              >
                                {cat.title}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <button
                                onClick={() => setSelectedParentCategory(cat)}
                                className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-md text-xs font-semibold text-slate-800 inline-flex items-center space-x-1.5 transition-colors"
                              >
                                <ListTree className="w-3.5 h-3.5 text-slate-600" />
                                <span>{cat.itemCount || '0 Jenis'}</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1">
                              <button
                                onClick={() => setSelectedParentCategory(cat)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold inline-flex items-center space-x-1 transition-colors mr-1"
                                title="Urus Sub-Kategori"
                              >
                                <ListTree className="w-3.5 h-3.5" />
                                <span>Sub-Kategori</span>
                              </button>
                              <button onClick={() => openEditModal('category', cat)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini Kategori">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={async () => { setCategories(prev => prev.filter(c => c.id !== cat.id)); await deleteCategoryFromSupabase(cat.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam Kategori">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedParentCategory && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedParentCategory(null)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                      </button>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                          Datatable Sub-Kategori: {selectedParentCategory.title}
                        </h2>
                        <p className="text-xs text-slate-500">Urus submenu sub-kategori khas untuk kategori induk ini.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddModal('subcategory')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> <span>Tambah Sub-Kategori</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">COVER IMAGE (1:1)</th>
                          <th className="py-3 px-4">KOD</th>
                          <th className="py-3 px-4">NAMA SUB-KATEGORI</th>
                          <th className="py-3 px-4">KATEGORI INDUK</th>
                          <th className="py-3 px-4 text-right">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {subCategoryItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs">
                              Belum ada sub-kategori untuk kategori ini. Tekan "Tambah Sub-Kategori" untuk cipta rekod baharu.
                            </td>
                          </tr>
                        ) : (
                          subCategoryItems.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <img
                                  src={sub.thumbnail || selectedParentCategory.thumbnail}
                                  alt={sub.title}
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200/80 shadow-2xs"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = PLACEHOLDER_IMAGE;
                                  }}
                                />
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{sub.code}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">{sub.title}</td>
                              <td className="py-3.5 px-4 text-slate-600">
                                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-800">
                                  {selectedParentCategory.title}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1">
                                <button onClick={() => openEditModal('subcategory', sub)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini Sub-Kategori">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={async () => { setSubCategoryItems(prev => prev.filter(s => s.id !== sub.id)); await deleteSubCategoryFromSupabase(sub.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam Sub-Kategori">
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
            </>
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
                    {cutTypes.map(cut => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BAHAN KAIN SUBLIMASI */}
          {currentTab === 'fabrics' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Bahan Kain Sublimasi</h2>
                <button onClick={() => openAddModal('fabric')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Kain</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GAMBAR (1:1)</th>
                      <th className="py-3 px-4">NAMA KAIN & GRED</th>
                      <th className="py-3 px-4">GRAMASI (GSM)</th>
                      <th className="py-3 px-4">HARGA ASAS</th>
                      <th className="py-3 px-4">CIRI-CIRI & DESKRIPSI</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {fabricTypes.map(fab => (
                      <tr key={fab.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={fab.thumbnail || PLACEHOLDER_IMAGE}
                            alt={fab.name}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200/80 shadow-2xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">
                          <div>{fab.name}</div>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-700 mt-1 inline-block">{fab.tier}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[11px]">{fab.gsm || '150 GSM'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">RM {Number(fab.basePrice ?? fab.base_price ?? 70).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                          {fab.features && <div className="text-[10px] font-semibold text-slate-900 mb-0.5">{fab.features}</div>}
                          <div className="text-slate-500 text-[11px]">{fab.desc}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button onClick={() => openEditModal('fabric', fab)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={async () => { setFabricTypes(prev => prev.filter(f => f.id !== fab.id)); await deleteFabricTypeFromSupabase(fab.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TEMPLATE REKA BENTUK */}
          {currentTab === 'templates' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Template Reka Bentuk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Sokongan muat naik pelbagai foto galeri (Front, Back, Detail Views).</p>
                </div>
                <button onClick={() => openAddModal('template')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> <span>Tambah Template</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">GALERI IMAGINASI (1:1)</th>
                      <th className="py-3 px-4">NAMA TEMPLATE</th>
                      <th className="py-3 px-4">KATEGORI UTAMA</th>
                      <th className="py-3 px-4">SUB-KATEGORI</th>
                      <th className="py-3 px-4">DESKRIPSI</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {templates.map(tpl => {
                      const tplGallery = Array.isArray(tpl.images) && tpl.images.length > 0 ? tpl.images : [tpl.thumbnail];
                      return (
                        <tr key={tpl.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <img
                                src={tplGallery[0] || PLACEHOLDER_IMAGE}
                                alt={tpl.name}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs aspect-square"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                              {tplGallery.length > 1 && (
                                <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700">
                                  +{tplGallery.length - 1} foto
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">{tpl.name}</td>
                          <td className="py-3.5 px-4 text-slate-900 font-bold">{tpl.category}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-800">
                              {tpl.subCategory || 'Umum'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-xs">{tpl.description || '-'}</td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button onClick={() => setViewingTemplate(tpl)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Galeri (Zoom In/Out)">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal('template', tpl)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Kemaskini">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { setTemplates(prev => prev.filter(t => t.id !== tpl.id)); await deleteDesignTemplateFromSupabase(tpl.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Padam">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SENARAI PESANAN */}
          {currentTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Senarai Pesanan Pelanggan</h2>
                <button onClick={fetchAllData} className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Kemaskini</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">PELANGGAN</th>
                      <th className="py-3 px-4">TEMPLATE</th>
                      <th className="py-3 px-4">POTONGAN & KAIN</th>
                      <th className="py-3 px-4">KUANTITI</th>
                      <th className="py-3 px-4">JUMLAH</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Belum ada pesanan terrekod.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{ord.client}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 uppercase">{ord.template}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {ord.cutType} • {ord.fabricMaterial}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{ord.qty} pcs</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{ord.total}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={ord.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: newStatus } : o));
                                await updateOrderStatusInSupabase(ord.id, newStatus);
                              }}
                              className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-900 rounded-md text-xs font-medium outline-none cursor-pointer focus:ring-1 focus:ring-slate-900"
                            >
                              <option value="Menunggu WhatsApp">Menunggu WhatsApp</option>
                              <option value="Dalam Proses">Dalam Proses</option>
                              <option value="Selesai">Selesai</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={async () => {
                                setOrders(prev => prev.filter(o => o.id !== ord.id));
                                await deleteOrderFromSupabase(ord.id);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                              title="Padam Pesanan"
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

          {/* TAB 7: PENGURUSAN PENGGUNA (USERS MANAGEMENT) */}
          {currentTab === 'users' && (
            <div className="space-y-6 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <div>
                  <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">Pengurusan Pengguna Berdaftar</h2>
                  <p className="text-xs text-slate-500 font-normal pt-0.5">
                    Senarai semua pelanggan dan pentadbir yang terrekod dalam pangkalan data Supabase.
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase block text-[9px]">JUMLAH PENGGUNA</span>
                    <span className="text-slate-900 font-black text-sm">{systemUsers.length} Orang</span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="relative w-72">
                    <input
                      type="text"
                      placeholder="Cari mengikut nama atau emel..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-900"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <button
                    onClick={fetchUsersData}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} />
                    <span>Muat Semula Senarai</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">PENGGUNA</th>
                        <th className="py-3 px-4">HUBUNGI / ALAMAT</th>
                        <th className="py-3 px-4">TARIKH DAFTAR</th>
                        <th className="py-3 px-4">JUMLAH TEMPAHAN</th>
                        <th className="py-3 px-4">PERANAN</th>
                        <th className="py-3 px-4 text-right">TINDAKAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {systemUsers.filter(u => 
                        !userSearchQuery.trim() || 
                        u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-mono text-xs">
                            Tiada pengguna ditemui.
                          </td>
                        </tr>
                      ) : (
                        systemUsers.filter(u => 
                          !userSearchQuery.trim() || 
                          u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                        ).map((usr) => {
                          const userOrdersCount = orders.filter(o => o.userEmail === usr.email).length;
                          return (
                            <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
                                    {usr.fullName ? usr.fullName.slice(0, 2).toUpperCase() : 'US'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block leading-snug">{usr.fullName}</span>
                                    <span className="text-[11px] font-mono text-slate-400 block">{usr.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                                <div>{usr.phone !== '-' ? usr.phone : 'Tiada No. Tel'}</div>
                                <div className="text-slate-400 truncate max-w-[180px]">{usr.address !== '-' ? usr.address : 'Tiada Alamat'}</div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-slate-600">{usr.date}</td>

                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                                  {userOrdersCount} Pesanan
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <select
                                  value={usr.role}
                                  onChange={async (e) => {
                                    const newRole = e.target.value;
                                    setSystemUsers(prev => prev.map(u => u.id === usr.id ? { ...u, role: newRole } : u));
                                    await updateUserRoleInSupabase(usr.id, newRole);
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                                    usr.role === 'admin'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  <option value="customer">Pelanggan</option>
                                  <option value="admin">Pentadbir Admin</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={async () => {
                                    if (confirm(`Adakah anda pasti mahu memadam pengguna ${usr.fullName} (${usr.email})?`)) {
                                      setSystemUsers(prev => prev.filter(u => u.id !== usr.id));
                                      await deleteUserFromSupabase(usr.id);
                                    }
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Padam Pengguna"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LIHAT LEBIH DEKAT (FEATURE SHOWCASE BANNER MANAGER) */}
          {currentTab === 'showcase' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-4xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pengurusan Banner Showcase "Lihat Lebih Dekat"</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Selaraskan gambar cover, teks tajuk, tombol video, dan pautan video pada seksyen khas Apple Storefront di laman utama.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-600">Status Seksyen:</span>
                  <button
                    type="button"
                    onClick={() => setShowcaseFeature({ ...showcaseFeature, isActive: !showcaseFeature.isActive })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      showcaseFeature.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {showcaseFeature.isActive ? 'Aktif' : 'Nyahaktif'}
                  </button>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingShowcase(true);
                  try {
                    await saveShowcaseFeatureToSupabase(showcaseFeature);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  } catch (err) {
                    console.error('Error saving showcase feature:', err);
                  } finally {
                    setIsSavingShowcase(false);
                  }
                }}
                className="space-y-5"
              >
                {/* 1. COVER IMAGE UPLOAD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Gambar Cover Banner (High Resolution)</label>
                  <ImageUploadCropper
                    value={showcaseFeature.coverImage}
                    onChange={(imgUrl) => setShowcaseFeature({ ...showcaseFeature, coverImage: imgUrl })}
                    label="Pilih Gambar Cover Banner (Landscape 16:9 / 21:9)"
                  />
                </div>

                {/* 2. TAJUK SEKSYEN & HEADLINE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Tajuk Seksyen Utama</label>
                    <input
                      type="text"
                      required
                      value={showcaseFeature.sectionTitle}
                      onChange={(e) => setShowcaseFeature({ ...showcaseFeature, sectionTitle: e.target.value })}
                      placeholder="Contoh: Lihat lebih dekat."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Headline Banner</label>
                    <input
                      type="text"
                      required
                      value={showcaseFeature.headline}
                      onChange={(e) => setShowcaseFeature({ ...showcaseFeature, headline: e.target.value })}
                      placeholder="Contoh: Tur Terpandu Kilang Sublimasi AYEZZ GLOBAL"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* 3. SUB-HEADLINE DESCRIPTION */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Sub-Headline / Penerangan</label>
                  <textarea
                    rows={3}
                    value={showcaseFeature.subHeadline}
                    onChange={(e) => setShowcaseFeature({ ...showcaseFeature, subHeadline: e.target.value })}
                    placeholder="Penerangan ringkas mengenai video atau showcase..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                {/* 4. BUTTON LABEL & VIDEO LINK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Teks Tombol Aksi</label>
                    <input
                      type="text"
                      required
                      value={showcaseFeature.buttonText}
                      onChange={(e) => setShowcaseFeature({ ...showcaseFeature, buttonText: e.target.value })}
                      placeholder="Contoh: Tonton video"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Pautan Video (YouTube Embed / MP4 URL)</label>
                    <input
                      type="text"
                      value={showcaseFeature.videoUrl}
                      onChange={(e) => setShowcaseFeature({ ...showcaseFeature, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {saveSuccess ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Tetapan Showcase Berjaya Disimpan!</span>
                    </span>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isSavingShowcase}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>{isSavingShowcase ? 'Menyimpan...' : 'Simpan Tetapan Showcase'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 10: PENGURUSAN ADMIN */}
          {currentTab === 'admin_management' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs max-w-2xl space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pengurusan Admin & Kunci Keselamatan</h3>
                  <p className="text-xs text-slate-500">Urus PIN Master Admin dan kemaskini akses keselamatan panel admin.</p>
                </div>
              </div>

              {adminPinNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{adminPinNotice}</span>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!adminPinInput.trim()) return;
                const ok = updateAdminMasterPin(adminPinInput.trim());
                if (ok) {
                  setAdminPinNotice('PIN Master Admin Berjaya Dikemaskini!');
                  setAdminPinInput('');
                  setTimeout(() => setAdminPinNotice(''), 4000);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    PIN Master Admin Semasa / Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="Masukkan PIN Baru (Contoh: AYEZZ2026)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl text-xs font-mono text-slate-900 outline-none transition-all"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    PIN Semasa Aktif: <span className="font-bold text-slate-700">{getAdminMasterPin()}</span>
                  </span>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Kemaskini PIN Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      if (onLogoutAdmin) onLogoutAdmin();
                    }}
                    className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl transition-all border border-rose-200 flex items-center space-x-2 cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Keluar Admin</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: TETAPAN KEDAI */}
          {currentTab === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-xl space-y-5 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Tetapan Kedai</h2>

                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Disimpan!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Syarikat / Kedai</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombor WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={storeSettings.whatsappNumber}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Mata Wang</label>
                  <input
                    type="text"
                    value={storeSettings.currencySymbol}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, currencySymbol: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Tetapan</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* DYNAMIC MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200/80 shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {modalMode === 'add' ? 'Tambah ' : 'Kemaskini '}
                {modalType === 'category' && 'Kategori Utama'}
                {modalType === 'subcategory' && `Sub-Kategori (${selectedParentCategory?.title})`}
                {modalType === 'cut' && 'Jenis Potongan / Kolar'}
                {modalType === 'fabric' && 'Bahan Kain Sublimasi'}
                {modalType === 'template' && 'Template Reka Bentuk'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {modalType === 'category' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={catCover}
                      onChange={(croppedDataUrl) => setCatCover(croppedDataUrl)}
                      label="Gambar Cover (1:1)"
                      compact={true}
                    />
                  </div>

                  <div className="col-span-7 space-y-3.5">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kod</label>
                        <input type="text" value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="01" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none font-mono transition-all" required />
                      </div>
                      <div className="col-span-8">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Kategori Utama</label>
                        <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Contoh: Olahraga" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kod</label>
                        <input type="text" value={subCode} onChange={(e) => setSubCode(e.target.value)} placeholder="01" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none font-mono transition-all" required />
                      </div>
                      <div className="col-span-8">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Sub-Kategori</label>
                        <input type="text" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Contoh: Sepak Bola" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori Induk</label>
                      <input
                        type="text"
                        value={selectedParentCategory?.title || ''}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                      <input type="text" value={cutName} onChange={(e) => setCutName(e.target.value)} placeholder="Contoh: Roundneck (Leher Bulat)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Cas Tambahan (RM)</label>
                      <input type="number" value={cutPrice} onChange={(e) => setCutPrice(e.target.value)} placeholder="15" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Kolar / Potongan</label>
                      <textarea
                        rows={3}
                        value={cutDesc}
                        onChange={(e) => setCutDesc(e.target.value)}
                        placeholder="Contoh: Potongan kolar gaya leher bulat klasik untuk keselesaan aktiviti sukan."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'fabric' && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-5 h-full">
                    <ImageUploadCropper
                      value={fabCover}
                      onChange={(croppedDataUrl) => setFabCover(croppedDataUrl)}
                      label="Gambar Tekstur Kain (1:1)"
                      compact={true}
                    />
                  </div>

                  <div className="col-span-7 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Kain Sublimasi</label>
                      <input type="text" value={fabName} onChange={(e) => setFabName(e.target.value)} placeholder="Contoh: Dry-Fit Microdot" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Harga Asas (RM)</label>
                        <input type="number" value={fabPrice} onChange={(e) => setFabPrice(e.target.value)} placeholder="70" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" required />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Gramasi (GSM)</label>
                        <input type="text" value={fabGsm} onChange={(e) => setFabGsm(e.target.value)} placeholder="150 GSM" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all font-mono" required />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Gred (Tier)</label>
                        <input type="text" value={fabTier} onChange={(e) => setFabTier(e.target.value)} placeholder="Piawaian" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Ciri-Ciri Utama</label>
                      <input type="text" value={fabFeatures} onChange={(e) => setFabFeatures(e.target.value)} placeholder="Contoh: Pantas Kering • Ringan • Anti-Bakteria" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Kain</label>
                      <textarea
                        rows={2}
                        value={fabDesc}
                        onChange={(e) => setFabDesc(e.target.value)}
                        placeholder="Contoh: Peredaran udara maksimum dengan liang microdot halus untuk keselesaan aktiviti harian."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL TYPE: TEMPLATE REKA BENTUK (WITH CLEAN MULTI-PHOTO GALLERY MANAGER & DYNAMIC SELECTS) */}
              {modalType === 'template' && (
                <div className="space-y-4">
                  <MultiImageUploadCropper
                    images={tplImages}
                    onChange={(updatedList) => setTplImages(updatedList)}
                    maxImages={5}
                  />

                  <div className="grid grid-cols-12 gap-3 pt-2">
                    <div className="col-span-12">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Template Reka Bentuk</label>
                      <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Contoh: Template Jersi Pro Match" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all" required />
                    </div>

                    <div className="col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori Utama</label>
                      <select
                        value={tplCat}
                        onChange={(e) => setTplCat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.title}>
                            {cat.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sub-Kategori</label>
                      <select
                        value={tplSubCat}
                        onChange={(e) => setTplSubCat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                      >
                        {dynamicSubCategories.length === 0 ? (
                          <option value="">-- Tiada Sub-Kategori --</option>
                        ) : (
                          dynamicSubCategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-span-12">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Deskripsi Template</label>
                      <textarea
                        rows={2}
                        value={tplDesc}
                        onChange={(e) => setTplDesc(e.target.value)}
                        placeholder="Contoh: Reka bentuk jersi sublimasi corak geometri moden berprestasi tinggi."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS FOOTER */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs active:scale-95 transition-all"
                >
                  {modalMode === 'add' ? 'Simpan' : 'Kemaskini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE GALLERY VIEW MODAL WITH ZOOM TRANSITIONS */}
      {viewingTemplate && (
        <TemplateGalleryViewModal
          template={viewingTemplate}
          allTemplates={templates}
          onClose={() => setViewingTemplate(null)}
          onSelectTemplate={(tpl) => setViewingTemplate(tpl)}
        />
      )}
    </div>
  );
}
