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
  ChevronDown,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Save,
  RefreshCw,
  X,
  Printer,
  Download,
  CreditCard,
  Menu,
  ArrowRight,
  Sparkles,
  Star,
  Upload,
  Send,
  Sliders,
  Layers,
  Globe,
  Palette,
  Image as ImageIcon,
  HelpCircle,
  Check,
  Scissors,
  Trash2,
  Shirt,
  Info,
  CheckSquare,
  FileSpreadsheet,
  Edit3,
  Ruler,
  PlusCircle,
  MinusCircle,
  ChevronUp
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
const KIDS_SIZES = ['22', '24', '26', '28', '30', '32'];
const ALL_SIZES = [...ADULT_SIZES, ...KIDS_SIZES];

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
  // Step 1 (Reka Bentuk) | Step 2 (Potongan & Saiz) | Step 3 (Fabrik) | Step 4 (Pengesahan)
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

  // Feature Options Checkboxes (Default FALSE per user directive!)
  const [hasPlayerNames, setHasPlayerNames] = useState(false);
  const [hasTeamLogo, setHasTeamLogo] = useState(false);
  const [hasSponsorLogo, setHasSponsorLogo] = useState(false);

  // PLAYER NAMES & NUMBERS MODE ('manual' | 'upload')
  const [playerInputMode, setPlayerInputMode] = useState('manual');
  const [playerRows, setPlayerRows] = useState([
    { id: '1', name: '', number: '', size: 'M' },
    { id: '2', name: '', number: '', size: 'L' },
    { id: '3', name: '', number: '', size: 'XL' }
  ]);
  const [playerListFileUrl, setPlayerListFileUrl] = useState('');
  const [isUploadingPlayerListFile, setIsUploadingPlayerListFile] = useState(false);

  // SPONSOR LOGO STATE
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState('');
  const [isUploadingSponsorLogo, setIsUploadingSponsorLogo] = useState(false);

  const [orderTemplateName, setOrderTemplateName] = useState('');
  const [orderCategory, setOrderCategory] = useState('SUBLIMASI');
  const [orderSubCategory, setOrderSubCategory] = useState('');
  const [selectedFabric, setSelectedFabric] = useState(FALLBACK_FABRICS[0]);

  // SECTION 2 & 3: MULTI-CUT & SLEEVE GROUPS WITH SIZES
  // Start empty — user must tap "+ Tambah Potongan Baru" to add their first group
  const [cutGroups, setCutGroups] = useState([]);

  // Collar Cut Selection Modal & Sleeve Selection Modal
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [activeGroupIdForCut, setActiveGroupIdForCut] = useState(null);

  const [isSleeveModalOpen, setIsSleeveModalOpen] = useState(false);
  const [activeGroupIdForSleeve, setActiveGroupIdForSleeve] = useState(null);

  // Mobile Size Bottom Sheet Modal (legacy, kept for safety)
  const [isMobileSizeModalOpen, setIsMobileSizeModalOpen] = useState(false);
  const [activeGroupIdForSize, setActiveGroupIdForSize] = useState(null);
  const [isAdultAccordionOpen, setIsAdultAccordionOpen] = useState(true);
  const [isKidsAccordionOpen, setIsKidsAccordionOpen] = useState(false);
  // Segmented Control per group: 'adult' | 'kids'
  const [sizeSegmentTabs, setSizeSegmentTabs] = useState({});

  // ── GROUP CONFIG BOTTOM SHEET ──
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
  // null = add new, string = editing existing group id
  const [sheetGroupId, setSheetGroupId] = useState(null);
  // Draft state inside the sheet
  const [sheetDraft, setSheetDraft] = useState({ cut: null, sleeve: null, sizes: {}, sizeTab: 'adult' });
  // Accordion expand state for each section inside the sheet
  const [sheetCutOpen, setSheetCutOpen] = useState(true);   // Section 1: always open initially
  const [sheetSleeveOpen, setSheetSleeveOpen] = useState(false); // Section 2: unlocks after cut chosen

  // Helper: open sheet in ADD mode
  const openSheetAdd = () => {
    setSheetDraft({ cut: null, sleeve: null, sizes: {}, sizeTab: 'adult' });
    setSheetGroupId(null);
    setSheetCutOpen(true);
    setSheetSleeveOpen(false);
    setIsGroupSheetOpen(true);
  };

  // Helper: open sheet in EDIT mode
  const openSheetEdit = (group) => {
    setSheetDraft({
      cut: group.cut,
      sleeve: group.sleeve,
      sizes: { ...(group.sizes || {}) },
      sizeTab: 'adult'
    });
    setSheetGroupId(group.id);
    // In edit mode: both sections start collapsed so user sees the summary first
    setSheetCutOpen(false);
    setSheetSleeveOpen(false);
    setIsGroupSheetOpen(true);
  };

  // Helper: save sheet draft back to cutGroups
  const saveSheet = () => {
    if (sheetGroupId) {
      // Edit existing group
      setCutGroups(prev => prev.map(g => g.id === sheetGroupId
        ? { ...g, cut: sheetDraft.cut, sleeve: sheetDraft.sleeve, sizes: sheetDraft.sizes }
        : g
      ));
    } else {
      // Add new group
      const newId = 'group_' + Date.now();
      setCutGroups(prev => [...prev, {
        id: newId,
        cut: sheetDraft.cut,
        sleeve: sheetDraft.sleeve,
        sizes: sheetDraft.sizes
      }]);
    }
    setIsGroupSheetOpen(false);
  };

  // Helper: update size qty inside sheet draft
  const setSheetSize = (sz, val) => {
    setSheetDraft(prev => ({ ...prev, sizes: { ...prev.sizes, [sz]: Math.max(0, val) } }));
  };

  // Derived: total qty inside sheet draft
  const sheetDraftQty = Object.values(sheetDraft.sizes).reduce((s, v) => s + Number(v || 0), 0);
  const sheetAdultQty = ADULT_SIZES.reduce((s, sz) => s + Number(sheetDraft.sizes[sz] || 0), 0);
  const sheetKidsQty  = KIDS_SIZES.reduce((s, sz) => s + Number(sheetDraft.sizes[sz] || 0), 0);
  const sheetActiveSizes = sheetDraft.sizeTab === 'adult' ? ADULT_SIZES : KIDS_SIZES;

  // Customer & Shipping Info
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
  const [paidSuccessOrderData, setPaidSuccessOrderData] = useState(null);
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);

  // ----------------------------------------------------
  // INITIAL DATA LOADING FROM SUPABASE DATABASE
  // ----------------------------------------------------
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        let currentUser = await getCurrentUser();

        // Check URL search params for tab, status, and payment callback
        const tabParam = searchParams.get('tab');
        const tplParam = searchParams.get('templateName');
        const catParam = searchParams.get('cat');
        const statusParam = searchParams.get('status');
        const orderIdParam = searchParams.get('orderId');

        // If returned from Payment Gateway or order URL, create seamless session if currentUser is missing
        if (!currentUser) {
          if (statusParam || orderIdParam || tabParam) {
            currentUser = {
              id: 'guest_' + Date.now(),
              email: 'pelanggan@ayezz.com',
              fullName: 'Pelanggan AYEZZ',
              phone: '',
              isGuest: true
            };
            if (typeof window !== 'undefined') {
              localStorage.setItem('ayezz_user_session', JSON.stringify(currentUser));
            }
          } else {
            router.push('/login?redirect=/dashboard&msg=login_required');
            return;
          }
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

        // Keep cutGroups empty — user will add groups manually
        setCutGroups([]);

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

        if (tabParam) setActiveTab(tabParam);
        if (tplParam) setOrderTemplateName(tplParam);
        if (catParam) setOrderCategory(catParam);

        if (statusParam === 'paid' || statusParam === 'simulated_paid') {
          if (orderIdParam) {
            await updateOrderStatusInSupabase(orderIdParam, 'Pesanan Diterima & Lunas');
            // Refresh orders after status update
            const refreshedOrders = await getUserOrdersFromSupabase(currentUser.email);
            setOrders(refreshedOrders || []);
            const paidOrd = (refreshedOrders || []).find(o => o.orderId === orderIdParam || o.id === orderIdParam) || { orderId: orderIdParam };
            setPaidSuccessOrderData(paidOrd);
            setIsPaymentSuccessModalOpen(true);
          }
          setActiveTab('orders');
        }
      } catch (err) {
        console.error('Error initializing dashboard:', err);
      } finally {
        setLoading(false);
      }
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
  // DYNAMIC PLAYER ROWS HANDLERS
  // ----------------------------------------------------
  const addPlayerRow = () => {
    setPlayerRows((prev) => [
      ...prev,
      { id: String(Date.now()), name: '', number: '', size: 'L' }
    ]);
  };

  const removePlayerRow = (id) => {
    if (playerRows.length <= 1) {
      setPlayerRows([{ id: '1', name: '', number: '', size: 'M' }]);
      return;
    }
    setPlayerRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updatePlayerRow = (id, field, value) => {
    setPlayerRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

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
          '22': 0, '24': 0, '26': 0, '28': 0, '30': 0, '32': 0
        }
      }
    ]);
  };

  const removeCutGroup = (groupId) => {
    setCutGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const setGroupSizeQtyDirect = (groupId, sizeKey, rawVal) => {
    const numVal = Math.max(0, parseInt(rawVal, 10) || 0);
    setCutGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          sizes: {
            ...g.sizes,
            [sizeKey]: numVal
          }
        };
      })
    );
  };

  const setGroupCutDirect = (groupId, cutObj) => {
    setCutGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, cut: cutObj } : g))
    );
  };

  const setGroupSleeveDirect = (groupId, sleeveObj) => {
    setCutGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, sleeve: sleeveObj } : g))
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
  // LOGO & FILE UPLOAD HANDLERS
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

  const handleSponsorLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSponsorLogo(true);
    try {
      const cloudUrl = await uploadDirectToSupabaseStorage(file, 'sponsor_logo');
      if (cloudUrl) {
        setSponsorLogoUrl(cloudUrl);
      }
    } catch (err) {
      console.warn('Sponsor logo upload fallback error:', err);
      const reader = new FileReader();
      reader.onload = (ev) => setSponsorLogoUrl(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingSponsorLogo(false);
    }
  };

  const handlePlayerListFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPlayerListFile(true);
    try {
      const cloudUrl = await uploadDirectToSupabaseStorage(file, 'player_list');
      if (cloudUrl) {
        setPlayerListFileUrl(cloudUrl);
      }
    } catch (err) {
      console.warn('Player list upload fallback error:', err);
      const reader = new FileReader();
      reader.onload = (ev) => setPlayerListFileUrl(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPlayerListFile(false);
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
      alert('Sila masukkan sekurang-kurangnya 1 kuantiti saiz baju.');
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

    const featuresList = [];
    if (hasPlayerNames) {
      if (playerInputMode === 'manual') {
        const validPlayers = playerRows.filter((r) => r.name.trim() || r.number.trim());
        featuresList.push(`Nama & Nombor Pemain (${validPlayers.length} orang manual)`);
      } else {
        featuresList.push('Nama & Nombor Pemain (Fail Diumuat Naik)');
      }
    }
    if (hasTeamLogo) featuresList.push('Logo Pasukan');
    if (hasSponsorLogo) featuresList.push('Logo Sponsor');

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
      notes: `${featuresList.length > 0 ? `[CIRI: ${featuresList.join(', ')}] ` : ''}${isCustomDesign ? `[KUSTOM DESIGN] ${customDesignNotes} ` : ''}${customerInfo.notes || ''}`.trim(),
      custom_logo_url: customLogoUrl || '',
      sponsor_logo_url: sponsorLogoUrl || '',
      player_list_file_url: playerListFileUrl || '',
      player_rows: hasPlayerNames && playerInputMode === 'manual' ? playerRows : [],
      custom_design_ref_url: customDesignRefUrl || '',
      is_custom_design: isCustomDesign,
      status: 'Pesanan Diterima',
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    try {
      await saveOrderToSupabase(orderPayload);
      const updatedUserOrders = await getUserOrdersFromSupabase(user?.email);
      setOrders(updatedUserOrders || []);

      // Initiate CHIP (chip-in.asia) Payment Gateway Checkout
      const chipRes = await fetch('/api/chip-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: generatedOrderId,
          amount: groupCalculations.totalPrice,
          clientName: orderPayload.clientName,
          clientPhone: orderPayload.customer_phone,
          clientEmail: user?.email || '',
          templateName: finalTemplateTitle
        })
      });

      const chipData = await chipRes.json();

      if (chipData.success && chipData.checkoutUrl) {
        if (chipData.isSimulation) {
          alert(`[CHIP Payment Mode Info]\n\n${chipData.message}\n\nTekan OK untuk meneruskan simulasi pembayaran.`);
        }
        window.location.href = chipData.checkoutUrl;
      } else {
        alert(chipData.message || 'Gagal menyambung ke CHIP Payment Gateway. Sila cuba lagi.');
        setOrderSuccessData(orderPayload);
      }
    } catch (err) {
      console.warn('Error saving new order to DB:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const resetOrderForm = () => {
    setOrderSuccessData(null);
    setCustomLogoUrl('');
    setSponsorLogoUrl('');
    setPlayerListFileUrl('');
    setCustomDesignRefUrl('');
    setCustomDesignNotes('');
    setHasPlayerNames(false);
    setHasTeamLogo(false);
    setHasSponsorLogo(false);
    setPlayerInputMode('manual');
    setPlayerRows([
      { id: '1', name: '', number: '', size: 'M' },
      { id: '2', name: '', number: '', size: 'L' },
      { id: '3', name: '', number: '', size: 'XL' }
    ]);
    setOrderStep(1);
    setCutGroups([
      {
        id: 'group_1',
        cut: cutTypes[0] || FALLBACK_CUTS[0],
        sleeve: sleeveTypes[0] || FALLBACK_SLEEVE_TYPES[0],
        sizes: {
          XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0,
          '22': 0, '24': 0, '26': 0, '28': 0, '30': 0, '32': 0
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
    if (s.includes('ditolak') || s.includes('batal') || s.includes('reject')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <X className="w-3 h-3 text-rose-600" />
          <span>DITOLAK / DIBATALKAN</span>
        </span>
      );
    }
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
      {/* 2. PANEL 2: MAIN ENTERPRISE CONTENT VIEWPORT (100% FULL-WIDTH CANVAS) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFD] text-slate-900">

        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between z-10 shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl shrink-0"
            >
              <Menu className="w-5 h-5 shrink-0" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                {activeTab === 'overview' && 'Dashboard Pengguna'}
                {activeTab === 'new-order' && 'Konfigurator Tempahan'}
                {activeTab === 'orders' && 'Sejarah Pesanan'}
                {activeTab === 'invoices' && 'Invois & Resit'}
                {activeTab === 'profile' && 'Tetapan Profil'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                AYEZZ GLOBAL — Panel Pengurusan Pelanggan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('new-order')}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Tempahan Baru</span>
              <span className="sm:hidden whitespace-nowrap">Baru</span>
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 w-full">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* WELCOME BANNER */}
              <div className="bg-slate-800 text-white p-8 rounded-2xl border border-slate-700 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-700 text-slate-200 border border-slate-600 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
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
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2 shrink-0 relative z-10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-900" />
                  <span>Buat Tempahan Jersi Baru</span>
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
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
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

          {/* TAB 2: BUAT PESANAN BARU (LIGHTER SOFT GREY THEME CONFIGURATOR) */}
          {activeTab === 'new-order' && (
            <div className="w-full space-y-6 pb-20 md:pb-0">
              
              {/* MINIMALIST NATIVE PROGRESS STEPPER */}
              <div className="w-full bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  
                  {/* STEP 1 BADGE */}
                  <div
                    onClick={() => setOrderStep(1)}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black transition-all ${
                      orderStep === 1
                        ? 'bg-slate-900 text-white shadow-xs'
                        : orderStep > 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <Shirt className="w-4 h-4 shrink-0" />
                    </div>
                    <div className={orderStep === 1 ? 'block' : 'hidden sm:block'}>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">01</span>
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        Jersey
                      </span>
                    </div>
                  </div>

                  <div className={`flex-1 h-0.5 mx-2 sm:mx-6 ${orderStep > 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  {/* STEP 2 BADGE */}
                  <div
                    onClick={() => setOrderStep(2)}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black transition-all ${
                      orderStep === 2
                        ? 'bg-slate-900 text-white shadow-xs'
                        : orderStep > 2
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <Scissors className="w-4 h-4 shrink-0" />
                    </div>
                    <div className={orderStep === 2 ? 'block' : 'hidden sm:block'}>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">02</span>
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        Specs
                      </span>
                    </div>
                  </div>

                  <div className={`flex-1 h-0.5 mx-2 sm:mx-6 ${orderStep > 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  {/* STEP 3 BADGE */}
                  <div
                    onClick={() => setOrderStep(3)}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black transition-all ${
                      orderStep === 3
                        ? 'bg-slate-900 text-white shadow-xs'
                        : orderStep > 3
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <Layers className="w-4 h-4 shrink-0" />
                    </div>
                    <div className={orderStep === 3 ? 'block' : 'hidden sm:block'}>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">03</span>
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        Fabric
                      </span>
                    </div>
                  </div>

                  <div className={`flex-1 h-0.5 mx-2 sm:mx-6 ${orderStep > 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  {/* STEP 4 BADGE */}
                  <div
                    onClick={() => setOrderStep(4)}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black transition-all ${
                      orderStep === 4
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                    <div className={orderStep === 4 ? 'block' : 'hidden sm:block'}>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">04</span>
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        Checkout
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {orderSuccessData ? (
                /* ORDER SUCCESS CONFIRMATION BANNER */
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-6 max-w-2xl mx-auto">
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

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 max-w-md mx-auto text-xs font-mono">
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
                      className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-300 shadow-2xs cursor-pointer"
                    >
                      Lihat Senarai Pesanan Saya →
                    </button>
                  </div>
                </div>
              ) : (
                /* MAIN WIZARD FULL WIDTH CANVAS FOR STEPS 1-3, 2-COLS ONLY FOR STEP 4 */
                <form id="order-wizard-form" onSubmit={handleCreateNewOrder} className="w-full space-y-6">
                  
                  {orderStep < 4 ? (
                    /* STEPS 1, 2 & 3: 100% FULL-WIDTH SPACIOUS CANVAS (NO RIGHT SUMMARY CARD CLUTTER!) */
                    <div className="w-full space-y-6">

                      {/* ========================================================== */}
                      {/* LANGKAH 1: REKA BENTUK (LARGE IMAGE SHOWCASE + DYNAMIC CHECKBOXES & LOGO/NAMES UPLOADS) */}
                      {/* ========================================================== */}
                      {orderStep === 1 && (
                        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs space-y-6 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">LANGKAH 1 DARI 4</span>
                              <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 pt-0.5">Order Jersey & Ciri Khas</h3>
                            </div>

                            {/* SEGMENTED CONTROL TOGGLE */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                              <button
                                type="button"
                                onClick={() => setIsCustomDesign(false)}
                                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
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
                                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                                  isCustomDesign
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                <span>Custom Design</span>
                              </button>
                            </div>
                          </div>

                          {!isCustomDesign ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                              {/* LARGE 1:1 HIGH-RES PREVIEW CARD */}
                              <div className="md:col-span-5 p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-4">
                                <div className="w-full aspect-square max-w-[280px] bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-center shadow-xs overflow-hidden">
                                  {selectedTemplateObj ? (
                                    <img
                                      src={Array.isArray(selectedTemplateObj.images) && selectedTemplateObj.images.length > 0 ? selectedTemplateObj.images[0] : (selectedTemplateObj.thumbnail || PLACEHOLDER_IMAGE)}
                                      alt={selectedTemplateObj.name}
                                      className="w-full h-full object-contain img-crisp hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-400 font-mono">Tiada Gambar</span>
                                  )}
                                </div>

                                <div className="text-center space-y-1">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">PREVIEW TEMPLATE</span>
                                  <h4 className="text-base font-black uppercase text-slate-900">{orderTemplateName}</h4>
                                  <div className="flex items-center justify-center space-x-2 text-xs font-mono text-slate-500 pt-0.5">
                                    <span className="px-2.5 py-0.5 bg-slate-200 rounded font-bold text-slate-800">{orderCategory}</span>
                                    {orderSubCategory && <span className="px-2.5 py-0.5 bg-slate-200 rounded text-slate-700">• {orderSubCategory}</span>}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setIsTemplateModalOpen(true)}
                                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                                >
                                  Tukar Template Reka Bentuk →
                                </button>
                              </div>

                              {/* SPECIFICATION OPTIONS & NATIVE TOGGLE SWITCHES */}
                              <div className="md:col-span-7 space-y-6">
                                <div className="space-y-3">
                                  <label className="text-xs font-extrabold text-slate-900 uppercase block">
                                    Pilihan Ciri Tambahan Jersi:
                                  </label>

                                  <div className="space-y-2.5">
                                    {/* TOGGLE 1: NAMA & NOMBOR PEMAIN */}
                                    <div
                                      onClick={() => setHasPlayerNames(!hasPlayerNames)}
                                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        hasPlayerNames
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-xl ${hasPlayerNames ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                                          <User className="w-4 h-4 shrink-0" />
                                        </div>
                                        <div>
                                          <span className="text-xs font-extrabold block">Nama & Nombor Pemain</span>
                                          <span className={`text-[10px] block ${hasPlayerNames ? 'text-slate-300' : 'text-slate-500'}`}>Cetakan nama & no. baju individu</span>
                                        </div>
                                      </div>

                                      {/* Switch Toggle Knob */}
                                      <div className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${hasPlayerNames ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${hasPlayerNames ? 'translate-x-5' : 'translate-x-0'}`} />
                                      </div>
                                    </div>

                                    {/* TOGGLE 2: LOGO PASUKAN */}
                                    <div
                                      onClick={() => setHasTeamLogo(!hasTeamLogo)}
                                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        hasTeamLogo
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-xl ${hasTeamLogo ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                                          <ShieldCheck className="w-4 h-4 shrink-0" />
                                        </div>
                                        <div>
                                          <span className="text-xs font-extrabold block">Logo Pasukan (Crest)</span>
                                          <span className={`text-[10px] block ${hasTeamLogo ? 'text-slate-300' : 'text-slate-500'}`}>Muat naik & cetak logo kelab di dada</span>
                                        </div>
                                      </div>

                                      {/* Switch Toggle Knob */}
                                      <div className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${hasTeamLogo ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${hasTeamLogo ? 'translate-x-5' : 'translate-x-0'}`} />
                                      </div>
                                    </div>

                                    {/* TOGGLE 3: LOGO SPONSOR */}
                                    <div
                                      onClick={() => setHasSponsorLogo(!hasSponsorLogo)}
                                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                        hasSponsorLogo
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-xl ${hasSponsorLogo ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                                          <Sparkles className="w-4 h-4 shrink-0" />
                                        </div>
                                        <div>
                                          <span className="text-xs font-extrabold block">Logo Penaja / Sponsor</span>
                                          <span className={`text-[10px] block ${hasSponsorLogo ? 'text-slate-300' : 'text-slate-500'}`}>Cetakan penaja tambahan jersi</span>
                                        </div>
                                      </div>

                                      {/* Switch Toggle Knob */}
                                      <div className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${hasSponsorLogo ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${hasSponsorLogo ? 'translate-x-5' : 'translate-x-0'}`} />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* CONDITIONAL SECTION 1: LOGO PASUKAN UPLOAD */}
                                {hasTeamLogo && (
                                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <span className="text-xs font-extrabold text-slate-900 uppercase block">
                                      MUAT NAIK LOGO PASUKAN (TEAM LOGO)
                                    </span>
                                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                                      <div className="flex items-center space-x-3">
                                        {customLogoUrl ? (
                                          <img src={customLogoUrl} alt="Team Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200" />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                            <Upload className="w-5 h-5" />
                                          </div>
                                        )}
                                        <div>
                                          <span className="text-xs font-bold text-slate-900 block">Logo Pasukan (PNG / JPG)</span>
                                          <span className="text-[10px] text-slate-500 block">Muat naik logo beresolusi tinggi</span>
                                        </div>
                                      </div>

                                      <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                        {isUploadingLogo ? 'Muat Naik...' : customLogoUrl ? 'Tukar Logo' : 'Muat Naik Logo'}
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                      </label>
                                    </div>
                                  </div>
                                )}

                                {/* CONDITIONAL SECTION 2: LOGO SPONSOR UPLOAD */}
                                {hasSponsorLogo && (
                                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <span className="text-xs font-extrabold text-slate-900 uppercase block">
                                      MUAT NAIK LOGO SPONSOR (SPONSOR LOGO)
                                    </span>
                                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                                      <div className="flex items-center space-x-3">
                                        {sponsorLogoUrl ? (
                                          <img src={sponsorLogoUrl} alt="Sponsor Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200" />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                            <Upload className="w-5 h-5" />
                                          </div>
                                        )}
                                        <div>
                                          <span className="text-xs font-bold text-slate-900 block">Logo Sponsor (PNG / JPG)</span>
                                          <span className="text-[10px] text-slate-500 block">Muat naik logo penaja jersi</span>
                                        </div>
                                      </div>

                                      <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                        {isUploadingSponsorLogo ? 'Muat Naik...' : sponsorLogoUrl ? 'Tukar Logo' : 'Muat Naik Logo'}
                                        <input type="file" accept="image/*" onChange={handleSponsorLogoUpload} className="hidden" />
                                      </label>
                                    </div>
                                  </div>
                                )}

                                {/* CONDITIONAL SECTION 3: NAMA & NOMBOR PEMAIN (INPUT MANUAL vs UPLOAD FILE) */}
                                {hasPlayerNames && (
                                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                                      <div>
                                        <span className="text-xs font-extrabold text-slate-900 uppercase block">
                                          SENARAI NAMA & NOMBOR PEMAIN
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">Pilih kaedah memasukkan nama dan nombor pemain</span>
                                      </div>

                                      {/* MODE TOGGLE SWITCH */}
                                      <div className="flex items-center bg-slate-200 p-1 rounded-xl shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => setPlayerInputMode('manual')}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                                            playerInputMode === 'manual'
                                              ? 'bg-slate-800 text-white shadow-xs'
                                              : 'text-slate-700 hover:text-slate-900'
                                          }`}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                          <span>Input Manual</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setPlayerInputMode('upload')}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                                            playerInputMode === 'upload'
                                              ? 'bg-slate-800 text-white shadow-xs'
                                              : 'text-slate-700 hover:text-slate-900'
                                          }`}
                                        >
                                          <FileSpreadsheet className="w-3.5 h-3.5" />
                                          <span>Muat Naik Fail</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* MODE 1: INPUT MANUAL DYNAMIC TABLE & MOBILE CARDS */}
                                    {playerInputMode === 'manual' ? (
                                      <div className="space-y-3">
                                        {/* MOBILE RESPONSIVE VERTICAL CARDS FOR PLAYER INPUT (MD:HIDDEN) */}
                                        <div className="space-y-2 md:hidden">
                                          {playerRows.map((row, idx) => (
                                            <div key={row.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative shadow-2xs">
                                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                                <span className="text-[11px] font-mono font-extrabold text-slate-900">
                                                  Pemain #{idx + 1}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => removePlayerRow(row.id)}
                                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                  title="Padam Pemain"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                </button>
                                              </div>

                                              <div className="space-y-2">
                                                <div>
                                                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Nama Pemain</label>
                                                  <input
                                                    type="text"
                                                    placeholder="Contoh: MUHAMMAD ALI"
                                                    value={row.name}
                                                    onChange={(e) => updatePlayerRow(row.id, 'name', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 uppercase"
                                                  />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                  <div>
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">No. Baju</label>
                                                    <input
                                                      type="text"
                                                      placeholder="10"
                                                      value={row.number}
                                                      onChange={(e) => updatePlayerRow(row.id, 'number', e.target.value)}
                                                      className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                                                    />
                                                  </div>

                                                  <div>
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Saiz Jersi</label>
                                                    <select
                                                      value={row.size}
                                                      onChange={(e) => updatePlayerRow(row.id, 'size', e.target.value)}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white cursor-pointer"
                                                    >
                                                      {ALL_SIZES.map((sz) => (
                                                        <option key={sz} value={sz}>{sz}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}

                                          <button
                                            type="button"
                                            onClick={addPlayerRow}
                                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center space-x-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                                          >
                                            <Plus className="w-4 h-4 text-white shrink-0" />
                                            <span className="whitespace-nowrap">Tambah Pemain Baru</span>
                                          </button>
                                        </div>

                                        {/* DESKTOP TABLE (HIDDEN ON MOBILE) */}
                                        <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl bg-white">
                                          <table className="w-full text-left text-xs">
                                            <thead>
                                              <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-600 uppercase">
                                                <th className="py-2.5 px-3 text-center w-12">BIL</th>
                                                <th className="py-2.5 px-3">NAMA PEMAIN</th>
                                                <th className="py-2.5 px-3 w-28">NOMBOR BAJU</th>
                                                <th className="py-2.5 px-3 w-28">SAIZ</th>
                                                <th className="py-2.5 px-3 text-center w-12">PADAM</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                                              {playerRows.map((row, idx) => (
                                                <tr key={row.id} className="hover:bg-slate-50">
                                                  <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                                  <td className="py-2 px-3">
                                                    <input
                                                      type="text"
                                                      placeholder="Contoh: MUHAMMAD ALI"
                                                      value={row.name}
                                                      onChange={(e) => updatePlayerRow(row.id, 'name', e.target.value)}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-400 uppercase"
                                                    />
                                                  </td>
                                                  <td className="py-2 px-3">
                                                    <input
                                                      type="text"
                                                      placeholder="10"
                                                      value={row.number}
                                                      onChange={(e) => updatePlayerRow(row.id, 'number', e.target.value)}
                                                      className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                                                    />
                                                  </td>
                                                  <td className="py-2 px-3">
                                                    <select
                                                      value={row.size}
                                                      onChange={(e) => updatePlayerRow(row.id, 'size', e.target.value)}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 outline-none focus:bg-white cursor-pointer"
                                                    >
                                                      {ALL_SIZES.map((sz) => (
                                                        <option key={sz} value={sz}>{sz}</option>
                                                      ))}
                                                    </select>
                                                  </td>
                                                  <td className="py-2 px-3 text-center">
                                                    <button
                                                      type="button"
                                                      onClick={() => removePlayerRow(row.id)}
                                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                      title="Padam Baris"
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={addPlayerRow}
                                          className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-300 inline-flex items-center justify-center space-x-2 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                                        >
                                          <Plus className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                                          <span className="whitespace-nowrap">Tambah Pemain</span>
                                        </button>
                                      </div>
                                    ) : (
                                      /* MODE 2: UPLOAD EXCEL / PDF / IMAGE FILE */
                                      <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          {playerListFileUrl ? (
                                            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                                              <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                          ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                              <FileSpreadsheet className="w-6 h-6" />
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-xs font-bold text-slate-900 block">Fail Senarai Pemain (Excel / PDF / Gambar)</span>
                                            <span className="text-[10px] text-slate-500 block">Muat naik dokumentasi senarai nama & saiz</span>
                                          </div>
                                        </div>

                                        <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                          {isUploadingPlayerListFile ? 'Muat Naik...' : playerListFileUrl ? 'Tukar Fail' : 'Muat Naik Fail'}
                                          <input type="file" accept=".xlsx,.xls,.pdf,image/*" onChange={handlePlayerListFileUpload} className="hidden" />
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-800 uppercase block">
                                    4. CATATAN TAMBAHAN REKA BENTUK
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={customDesignNotes}
                                    onChange={(e) => setCustomDesignNotes(e.target.value)}
                                    placeholder="Jelaskan secara teliti jika ada permintaan khas warna, corak badan, atau garisan bahu..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition-all resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="p-6 bg-[#FAFBFD] border border-slate-200/80 rounded-2xl space-y-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-800 uppercase block">
                                    1. MUAT NAIK GAMBAR REFERENSI DESAIN KUSTOM (SKETSA / FOTO)
                                  </label>
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {customDesignRefUrl ? (
                                        <img src={customDesignRefUrl} alt="Ref Design" className="w-14 h-14 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200" />
                                      ) : (
                                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                          <ImageIcon className="w-6 h-6" />
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-xs font-bold text-slate-900 block">Fail Referensi Reka Bentuk Kustom</span>
                                        <span className="text-[10px] text-slate-500 block">Muat naik gambar lakaran / rujukan warna khas</span>
                                      </div>
                                    </div>

                                    <label className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0">
                                      {isUploadingRefImage ? 'Memuat Naik...' : customDesignRefUrl ? 'Tukar Referensi' : 'Muat Naik Referensi'}
                                      <input type="file" accept="image/*" onChange={handleRefImageUpload} className="hidden" />
                                    </label>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-800 uppercase block">
                                    2. CATATAN REKA BENTUK KUSTOM TELITI
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={customDesignNotes}
                                    onChange={(e) => setCustomDesignNotes(e.target.value)}
                                    placeholder="Jelaskan secara teliti perubahan warna, corak badan, garisan bahu, atau gabungan gaya yang diinginkan..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 transition-all resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 1 FOOTER NAV */}
                          <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setOrderStep(2)}
                              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center space-x-2 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                            >
                              <span>Teruskan</span>
                              <ChevronRight className="w-4 h-4 text-white shrink-0" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ========================================================== */}
                      {/* LANGKAH 2: SUMMARY LIST + BOTTOM SHEET ARCHITECTURE        */}
                      {/* ========================================================== */}
                      {orderStep === 2 && (
                        <div className="w-full font-sans">

                          {/* ── STEP HEADER ── */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-widest">Langkah 2 dari 4</p>
                              <h3 className="text-base font-bold text-[#111827] mt-0.5">Potongan, Lengan &amp; Saiz</h3>
                            </div>
                            <span className="text-xs font-semibold text-[#8E8E93] tabular-nums">{groupCalculations.totalQty} pcs</span>
                          </div>

                          {/* ── COMPACT SUMMARY LIST ── */}
                          <div className="space-y-2 mb-4">
                            {groupCalculations.groupDetails.length === 0 ? (
                              /* Empty state */
                              <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-3">
                                  <Shirt className="w-6 h-6 text-[#AEAEAE]" />
                                </div>
                                <p className="text-[13px] font-semibold text-[#374151]">Belum ada potongan ditambah</p>
                                <p className="text-[11px] text-[#9CA3AF] mt-1">Klik butang di bawah untuk mula konfigurasi</p>
                              </div>
                            ) : (
                              groupCalculations.groupDetails.map((group, idx) => (
                                <div
                                  key={group.id}
                                  className="flex items-center justify-between px-4 py-3.5 bg-white rounded-2xl border border-[#E5E7EB]"
                                >
                                  {/* Left: number badge + summary text */}
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <span className="w-7 h-7 rounded-full bg-[#111827] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#111827] truncate">
                                        {group.cut?.name || '—'} · {group.sleeve?.name || '—'}
                                      </p>
                                      <p className="text-[11px] text-[#8E8E93] mt-0.5">
                                        {group.qty > 0 ? `${group.qty} pcs` : 'Belum ada saiz'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Edit + Delete */}
                                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                                    <button
                                      type="button"
                                      onClick={() => openSheetEdit(group)}
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8E8E93] hover:text-[#111827] hover:bg-[#F2F2F7] transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeCutGroup(group.id)}
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8E8E93] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Padam"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* ── + TAMBAH POTONGAN BARU ── */}
                          <button
                            type="button"
                            onClick={openSheetAdd}
                            className="w-full py-3.5 rounded-2xl bg-white border border-dashed border-[#D1D5DB] text-[#111827] text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                          >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Tambah Potongan Baru</span>
                          </button>

                          {/* ── DESKTOP FOOTER NAV (hidden on mobile) ── */}
                          <div className="pt-5 border-t border-[#E5E7EB] mt-5 hidden md:flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setOrderStep(1)}
                              className="px-5 py-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#111827] font-semibold text-sm rounded-xl transition-all cursor-pointer"
                            >
                              Kembali
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderStep(3)}
                              className="px-6 py-2.5 bg-[#111827] hover:bg-black text-white font-semibold text-sm rounded-xl transition-all inline-flex items-center space-x-2 cursor-pointer"
                            >
                              <span>Teruskan</span>
                              <ChevronRight className="w-4 h-4 shrink-0" />
                            </button>
                          </div>

                          {/* ================================================================ */}
                          {/* iOS-STYLE BOTTOM SHEET — GROUP CONFIG DRAWER                    */}
                          {/* ================================================================ */}
                          {isGroupSheetOpen && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
                                onClick={() => setIsGroupSheetOpen(false)}
                              />

                              {/* Sheet panel — slides up from bottom */}
                              <div
                                className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
                                style={{ maxHeight: '92vh' }}
                              >
                                {/* ── SHEET HANDLE & HEADER ── */}
                                <div className="px-5 pt-3 pb-4 border-b border-[#F2F2F2] flex items-center justify-between shrink-0">
                                  <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1 bg-[#D1D5DB] rounded-full" />
                                  <div className="pt-3">
                                    <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-widest">
                                      {sheetGroupId ? 'Edit Kumpulan' : 'Potongan Baru'}
                                    </p>
                                    <h4 className="text-base font-bold text-[#111827] mt-0.5">
                                      Kolar · Lengan · Saiz
                                    </h4>
                                  </div>
                                  <div className="flex items-center space-x-3 pt-3">
                                    {sheetDraftQty > 0 && (
                                      <span className="text-xs font-semibold text-[#8E8E93] tabular-nums">{sheetDraftQty} pcs</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setIsGroupSheetOpen(false)}
                                      className="w-7 h-7 rounded-full bg-[#F2F2F2] flex items-center justify-center cursor-pointer hover:bg-[#E5E5E5] transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5 text-[#6B7280]" />
                                    </button>
                                  </div>
                                </div>

                                {/* ── SHEET SCROLLABLE BODY ── */}
                                <div className="overflow-y-auto flex-1 overscroll-contain">

                                  {/* ─────────────────────────────────────────────── */}
                                  {/* SECTION A: PILIH KOLAR                          */}
                                  {/* ─────────────────────────────────────────────── */}
                                  <div className="border-b border-[#F2F2F2]">
                                    {/* Section header row — always visible, clickable to toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setSheetCutOpen(o => !o)}
                                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer active:bg-[#FAFAFA] transition-colors"
                                    >
                                      <div className="flex items-center space-x-2.5">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          sheetDraft.cut ? 'bg-[#111827] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'
                                        }`}>1</span>
                                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">Potongan Kolar</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {/* Selected name preview (shown when collapsed) */}
                                        {sheetDraft.cut && !sheetCutOpen && (
                                          <span className="text-sm font-semibold text-[#111827]">{sheetDraft.cut.name}</span>
                                        )}
                                        {/* Arrow icon: down when collapsed, up when open */}
                                        {sheetCutOpen
                                          ? <ChevronUp className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                          : <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                        }
                                      </div>
                                    </button>

                                    {/* GRID — shown only when sheetCutOpen */}
                                    {sheetCutOpen && (
                                      <div className="px-5 pb-5">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2.5 gap-y-4">
                                          {cutTypes.map((cut) => {
                                            const isSelected = sheetDraft.cut?.id === cut.id;
                                            const addOn = Number(cut.addOnPrice ?? cut.add_on_price ?? 0);
                                            return (
                                              <button
                                                key={cut.id}
                                                type="button"
                                                onClick={() => {
                                                  setSheetDraft(prev => ({ ...prev, cut, sleeve: null }));
                                                  setSheetCutOpen(false);   // collapse section A
                                                  setSheetSleeveOpen(true); // auto-open section B
                                                }}
                                                className="flex flex-col items-center text-center cursor-pointer select-none active:scale-95 transition-transform"
                                              >
                                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F7F8F9] mb-2">
                                                  <img
                                                    src={cut.thumbnail || PLACEHOLDER_IMAGE}
                                                    alt={cut.name}
                                                    className="w-full h-full object-contain p-2.5"
                                                  />
                                                  {sheetDraft.cut && !isSelected && (
                                                    <div className="absolute inset-0 bg-white/60 rounded-2xl" />
                                                  )}
                                                  {isSelected && (
                                                    <div className="absolute inset-0 rounded-2xl ring-2 ring-[#111827] ring-inset flex items-end justify-end p-1.5">
                                                      <span className="w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                                <p className={`text-[11px] leading-snug line-clamp-2 transition-all ${
                                                  isSelected ? 'font-bold text-[#111827]' : 'font-medium text-[#6B7280]'
                                                }`}>
                                                  {cut.name}
                                                </p>
                                                <p className="text-[10px] text-[#9CA3AF] mt-0.5 tabular-nums">
                                                  {addOn > 0 ? `+RM ${addOn}` : 'Standard'}
                                                </p>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* ─────────────────────────────────────────────── */}
                                  {/* SECTION B: PILIH LENGAN (unlocked after Kolar)  */}
                                  {/* ─────────────────────────────────────────────── */}
                                  <div className={`border-b border-[#F2F2F2] transition-opacity ${
                                    !sheetDraft.cut ? 'opacity-40 pointer-events-none' : ''
                                  }`}>
                                    <button
                                      type="button"
                                      onClick={() => sheetDraft.cut && setSheetSleeveOpen(o => !o)}
                                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer active:bg-[#FAFAFA] transition-colors disabled:cursor-default"
                                    >
                                      <div className="flex items-center space-x-2.5">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          sheetDraft.sleeve ? 'bg-[#111827] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'
                                        }`}>2</span>
                                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">Jenis Lengan</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {sheetDraft.sleeve && !sheetSleeveOpen && (
                                          <span className="text-sm font-semibold text-[#111827]">{sheetDraft.sleeve.name}</span>
                                        )}
                                        {sheetDraft.cut && (
                                          sheetSleeveOpen
                                            ? <ChevronUp className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                            : <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                        )}
                                      </div>
                                    </button>

                                    {sheetDraft.cut && sheetSleeveOpen && (
                                      <div className="px-5 pb-5">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2.5 gap-y-4">
                                          {sleeveTypes.map((slv) => {
                                            const isSelected = sheetDraft.sleeve?.id === slv.id;
                                            const addOn = Number(slv.addOnPrice ?? slv.add_on_price ?? 0);
                                            return (
                                              <button
                                                key={slv.id}
                                                type="button"
                                                onClick={() => {
                                                  setSheetDraft(prev => ({ ...prev, sleeve: slv }));
                                                  setSheetSleeveOpen(false); // collapse section B
                                                }}
                                                className="flex flex-col items-center text-center cursor-pointer select-none active:scale-95 transition-transform"
                                              >
                                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F7F8F9] mb-2">
                                                  <img
                                                    src={slv.thumbnail || PLACEHOLDER_IMAGE}
                                                    alt={slv.name}
                                                    className="w-full h-full object-contain p-2.5"
                                                  />
                                                  {sheetDraft.sleeve && !isSelected && (
                                                    <div className="absolute inset-0 bg-white/60 rounded-2xl" />
                                                  )}
                                                  {isSelected && (
                                                    <div className="absolute inset-0 rounded-2xl ring-2 ring-[#111827] ring-inset flex items-end justify-end p-1.5">
                                                      <span className="w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                                <p className={`text-[11px] leading-snug line-clamp-2 transition-all ${
                                                  isSelected ? 'font-bold text-[#111827]' : 'font-medium text-[#6B7280]'
                                                }`}>
                                                  {slv.name}
                                                </p>
                                                <p className="text-[10px] text-[#9CA3AF] mt-0.5 tabular-nums">
                                                  {addOn > 0 ? `+RM ${addOn}` : 'Standard'}
                                                </p>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* ─────────────────────────────────────────────── */}
                                  {/* SECTION C: SAIZ & KUANTITI                      */}
                                  {/* ─────────────────────────────────────────────── */}
                                  <div className={`transition-all ${!(sheetDraft.cut && sheetDraft.sleeve) ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <div className="px-5 py-4 flex items-center space-x-2.5">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                        sheetDraftQty > 0 ? 'bg-[#111827] text-white' : 'bg-[#F2F2F7] text-[#8E8E93]'
                                      }`}>3</span>
                                      <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">Saiz &amp; Kuantiti</span>
                                      {sheetDraftQty > 0 && (
                                        <span className="ml-auto text-sm font-semibold text-[#111827] tabular-nums">{sheetDraftQty} pcs</span>
                                      )}
                                    </div>

                                    {sheetDraft.cut && sheetDraft.sleeve && (
                                      <div className="px-5 pb-6">
                                        {/* Segmented Control */}
                                        <div className="flex bg-[#F2F2F7] rounded-xl p-[3px] mb-4">
                                          {[
                                            { key: 'adult', label: `Dewasa${sheetAdultQty > 0 ? ` · ${sheetAdultQty}` : ''}` },
                                            { key: 'kids',  label: `Kanak-kanak${sheetKidsQty > 0 ? ` · ${sheetKidsQty}` : ''}` }
                                          ].map(({ key, label }) => (
                                            <button
                                              key={key}
                                              type="button"
                                              onClick={() => setSheetDraft(prev => ({ ...prev, sizeTab: key }))}
                                              className={`flex-1 py-2 rounded-[9px] text-[12px] font-medium transition-all duration-150 cursor-pointer ${
                                                sheetDraft.sizeTab === key
                                                  ? 'bg-white text-[#111827] font-semibold shadow-sm'
                                                  : 'text-[#8E8E93]'
                                              }`}
                                            >
                                              {label}
                                            </button>
                                          ))}
                                        </div>

                                        {/* Size rows — Lucide icon steppers */}
                                        <div className="divide-y divide-[#F5F5F5]">
                                          {sheetActiveSizes.map((sz) => {
                                            const q = Number(sheetDraft.sizes[sz] || 0);
                                            return (
                                              <div key={sz} className="flex items-center justify-between py-3.5">
                                                {/* Size label */}
                                                <span className={`text-[15px] w-12 tabular-nums ${
                                                  q > 0 ? 'font-semibold text-[#111827]' : 'font-normal text-[#AEAEAE]'
                                                }`}>
                                                  {sz}
                                                </span>

                                                {/* Lucide MinusCircle · count · PlusCircle */}
                                                <div className="flex items-center space-x-3">
                                                  <button
                                                    type="button"
                                                    disabled={q <= 0}
                                                    onClick={() => setSheetSize(sz, q - 1)}
                                                    className="cursor-pointer disabled:cursor-not-allowed active:scale-90 transition-transform"
                                                  >
                                                    <MinusCircle
                                                      className={`w-7 h-7 transition-colors ${
                                                        q <= 0 ? 'text-[#E5E7EB]' : 'text-[#374151] hover:text-[#111827]'
                                                      }`}
                                                      strokeWidth={1.5}
                                                    />
                                                  </button>
                                                  <span className={`w-7 text-center text-[15px] tabular-nums ${
                                                    q > 0 ? 'font-semibold text-[#111827]' : 'text-[#D4D4D4]'
                                                  }`}>
                                                    {q}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => setSheetSize(sz, q + 1)}
                                                    className="cursor-pointer active:scale-90 transition-transform"
                                                  >
                                                    <PlusCircle
                                                      className="w-7 h-7 text-[#374151] hover:text-[#111827] transition-colors"
                                                      strokeWidth={1.5}
                                                    />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Bottom padding */}
                                  <div className="h-6" />
                                </div>

                                {/* ── SHEET FOOTER: SIMPAN BUTTON ── */}
                                <div className="px-5 pb-8 pt-4 border-t border-[#F2F2F2] shrink-0">
                                  <button
                                    type="button"
                                    onClick={saveSheet}
                                    disabled={!sheetDraft.cut || !sheetDraft.sleeve}
                                    className="w-full py-4 rounded-2xl bg-[#111827] disabled:bg-[#D1D5DB] text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed transition-colors active:scale-[0.99]"
                                  >
                                    <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                                    <span>
                                      {sheetGroupId ? 'Simpan Perubahan' : 'Tambah Kumpulan'}
                                      {sheetDraftQty > 0 ? ` · ${sheetDraftQty} pcs` : ''}
                                    </span>
                                  </button>
                                  {(!sheetDraft.cut || !sheetDraft.sleeve) && (
                                    <p className="text-center text-[11px] text-[#9CA3AF] mt-2">
                                      Pilih Kolar &amp; Lengan untuk meneruskan
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                        </div>
                      )}

                      {/* ========================================================== */}

                      {/* LANGKAH 3: FABRIK SUBLIMASI (VISUAL FABRIC CARDS GRID - DIRECTIVE 6) */}
                      {/* ========================================================== */}
                      {orderStep === 3 && (
                        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs space-y-6 w-full">
                          <div className="border-b border-slate-100 pb-4">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">LANGKAH 3 DARI 4</span>
                            <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 pt-0.5">PILIH BAHAN KAIN / FABRIK SUBLIMASI</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                            {fabricTypes.map((fab) => {
                              const isSelected = selectedFabric.id === fab.id;
                              const baseP = Number(fab.basePrice ?? fab.base_price ?? 70);
                              const gsm = fab.gsm || '150 GSM';
                              return (
                                <div
                                  key={fab.id}
                                  onClick={() => setSelectedFabric(fab)}
                                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 relative ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400'
                                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                                      isSelected ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                      {gsm}
                                    </span>
                                    {isSelected && (
                                      <span className="bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold uppercase tracking-tight">{fab.name}</h4>
                                    <p className={`text-xs font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                      Kain Sublimasi High-Performance
                                    </p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-200/40 flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold">Harga Asas:</span>
                                    <span className="text-base font-black">RM {baseP}.00 / pcs</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* STEP 3 FOOTER NAV */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setOrderStep(2)}
                              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Kembali
                            </button>

                            <button
                              type="button"
                              onClick={() => setOrderStep(4)}
                              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center space-x-2 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                            >
                              <span>Teruskan</span>
                              <ChevronRight className="w-4 h-4 text-white shrink-0" />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* ========================================================== */
                    /* LANGKAH 4: PENGESAHAN & SEBUT HARGA FINAL (2-COLUMN SPLIT WITH LIVE SUMMARY TICKET!) */
                    /* ========================================================== */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                      
                      {/* LEFT 7 COLS: CLIENT INFO & FINAL CHECKLIST */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">LANGKAH 4 DARI 4</span>
                            <h3 className="text-lg font-black uppercase text-slate-900 pt-0.5">MAKLUMAT PELANGGAN & PENGESAHAN</h3>
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
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-400"
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
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA PASUKAN / KELAB</label>
                              <input
                                type="text"
                                placeholder="Contoh: FC Harimau"
                                value={customerInfo.teamName}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, teamName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                              />
                            </div>

                            {/* CONFIRMATION BADGE */}
                            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs font-mono text-emerald-900 space-y-1">
                              <div className="flex items-center space-x-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>SPESIFIKASI & LOGO BERJAYA DIKONFIGURASIKAN</span>
                              </div>
                              <p className="text-[10px] text-emerald-700 font-sans">
                                Reka bentuk, logo, dan pilihan cetakan pemain telah direkodkan dari Langkah 1. Sila masukkan maklumat perhubungan di atas untuk menghantar tempahan ke kilang.
                              </p>
                            </div>
                          </div>

                          {/* STEP 4 FOOTER NAV */}
                          <div className="pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setOrderStep(3)}
                              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                              ← Kembali Ke Step 3
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT 5 COLS: FINAL FACTORY ORDER SUMMARY TICKET */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#F3F5F8] text-slate-900 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5 sticky top-20 border border-slate-200/90">
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                              RINGKASAN SEBUT HARGA KILANG
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                              LIVE ESTIMATE
                            </span>
                          </div>

                          {/* TEMPLATE SUMMARY */}
                          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/80">
                            <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-200">
                              <img
                                src={Array.isArray(selectedTemplateObj?.images) && selectedTemplateObj?.images.length > 0 ? selectedTemplateObj.images[0] : (selectedTemplateObj?.thumbnail || PLACEHOLDER_IMAGE)}
                                alt={orderTemplateName}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">REKA BENTUK</span>
                              <h5 className="font-black uppercase text-slate-900 truncate">{isCustomDesign ? 'Custom Design' : orderTemplateName}</h5>
                            </div>
                          </div>

                          {/* PRICE BREAKDOWN */}
                          <div className="space-y-2.5 text-xs font-mono text-slate-700">
                            <div className="flex justify-between">
                              <span>Kain ({selectedFabric?.name}):</span>
                              <span className="font-bold text-slate-900">RM {basePricePerPcs.toFixed(2)}</span>
                            </div>

                            {groupCalculations.groupDetails.map((gd, i) => (
                              <div key={gd.id} className="flex justify-between text-[11px] text-slate-600">
                                <span className="truncate max-w-[170px]">Kumpulan #{i + 1} ({gd.cut?.name}):</span>
                                <span className="font-bold text-slate-900">{gd.qty} pcs • RM {gd.subtotal.toFixed(2)}</span>
                              </div>
                            ))}

                            <div className="flex justify-between border-t border-slate-200/80 pt-2 font-extrabold text-slate-900">
                              <span>Jumlah Kuantiti:</span>
                              <span>{groupCalculations.totalQty} pcs</span>
                            </div>
                          </div>

                          {/* TOTAL PRICE */}
                          <div className="border-t border-slate-200/80 pt-3">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">JUMLAH KESELURUHAN ({groupCalculations.totalQty} pcs):</span>
                            <span className="text-3xl font-black font-mono text-slate-900 block pt-0.5">
                              RM {groupCalculations.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* SUBMIT BUTTON */}
                          <button
                            type="submit"
                            disabled={isSubmittingOrder || groupCalculations.totalQty <= 0}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingOrder ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 text-white shrink-0" />
                                <span className="whitespace-nowrap">Bayar Tempahan</span>
                              </>
                            )}
                          </button>

                        </div>
                      </div>

                    </div>
                  )}

                </form>
              )}

              {/* FIXED NATIVE MOBILE BOTTOM NAVIGATION BAR (RULE 3 & 5) */}
              {!orderSuccessData && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 sm:p-4 shadow-xl md:hidden font-sans">
                  <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                    {/* Total Price Summary */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-widest block">ANGGARAN HARGA</span>
                      <div className="flex items-baseline space-x-1 truncate">
                        <span className="text-base font-black text-[#111827] truncate">RM {groupCalculations.totalPrice.toFixed(2)}</span>
                        <span className="text-[10px] font-mono text-[#6B7280] font-bold">({groupCalculations.totalQty} pcs)</span>
                      </div>
                    </div>

                    {/* Nav Controls Pair */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {orderStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setOrderStep(orderStep - 1)}
                          className="px-3.5 py-2.5 bg-[#F7F9FA] hover:bg-slate-200 text-[#111827] font-extrabold text-xs rounded-xl transition-all border border-[#E5E7EB] active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          ← Kembali
                        </button>
                      )}

                      {orderStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setOrderStep(orderStep + 1)}
                          className="px-4 py-2.5 bg-[#1A1F2B] hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Teruskan: {orderStep === 1 ? 'Specs' : orderStep === 2 ? 'Fabrik' : 'Checkout'}</span>
                          <ChevronRight className="w-4 h-4 text-white shrink-0" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          form="order-wizard-form"
                          disabled={isSubmittingOrder || groupCalculations.totalQty <= 0}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <span>Bayar Tempahan</span>
                          <ChevronRight className="w-4 h-4 text-white shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'all' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua ({orders.length})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('process')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'process' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dalam Proses
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === 'completed' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Siap & Selesai
                    </button>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('ayezz_user_orders');
                        }
                        setOrders([]);
                      }}
                      className="px-3 py-1.5 rounded-xl font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 cursor-pointer text-xs"
                      title="Kosongkan Rekod Ujian Dalam Pelayar Browser"
                    >
                      Kosongkan Rekod Ujian
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
                      className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
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

                          <Link
                            href={`/invoice?orderId=${ord.orderId || ord.id}`}
                            target="_blank"
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-white" />
                            <span>Invois & Job Sheet</span>
                          </Link>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 cursor-pointer"
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
                                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-900" />
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-900" />
                      <span>Simpan Kemaskini Profil</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* TEMPLATE SELECTION MODAL DRAWER */}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex items-center space-x-2 text-xs font-mono overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                      templateCategoryFilter === 'all' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                          ? 'bg-slate-200 text-slate-900 border border-slate-300'
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
                        ? 'border-slate-400 ring-2 ring-slate-300 shadow-md bg-slate-50'
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
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLAR CUT SELECTION MODAL DRAWER */}
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
                      // CHAINING WORKFLOW: AUTOMATICALLY OPEN SLEEVE SELECTION MODAL NEXT!
                      setActiveGroupIdForSleeve(activeGroupIdForCut);
                      setIsSleeveModalOpen(true);
                    }}
                    className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'border-slate-400 ring-2 ring-slate-300 shadow-md bg-slate-50'
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
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLEEVE SELECTION MODAL DRAWER (LIST VIEW FORMAT) */}
      {isSleeveModalOpen && activeGroupIdForSleeve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">PILIH JENIS LENGAN (SLEEVE)</h3>
                <p className="text-xs text-slate-500 font-medium">Sila pilih gaya lengan pilihan anda daripada senarai di bawah</p>
              </div>
              <button
                onClick={() => setIsSleeveModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sleeveTypes.map((sleeve) => {
                const addOn = Number(sleeve.addOnPrice ?? sleeve.add_on_price ?? 0);
                const activeGroupObj = cutGroups.find((g) => g.id === activeGroupIdForSleeve);
                const isSelected = activeGroupObj?.sleeve?.id === sleeve.id;

                return (
                  <div
                    key={sleeve.id}
                    onClick={() => {
                      setCutGroups((prev) =>
                        prev.map((g) => (g.id === activeGroupIdForSleeve ? { ...g, sleeve } : g))
                      );
                      setIsSleeveModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between space-x-4 group ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 border-slate-400 shadow-md ring-2 ring-slate-300'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <img
                        src={sleeve.thumbnail || PLACEHOLDER_IMAGE}
                        alt={sleeve.name}
                        className="w-14 h-14 object-contain bg-slate-100 rounded-xl p-1.5 border border-slate-200/80 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-xs font-extrabold uppercase line-clamp-1">{sleeve.name}</h4>
                        <p className="text-[10px] line-clamp-1 text-slate-500">
                          {sleeve.desc || sleeve.description || 'Gaya lengan sublimasi standard'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black block text-slate-900">
                        {addOn > 0 ? `+RM ${addOn}.00` : 'STANDARD / FREE'}
                      </span>
                      <span className="text-[10px] font-mono block pt-0.5 text-slate-500">
                        {isSelected ? 'DIPILIH ✓' : 'PILIH →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsSleeveModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Tutup Modal
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
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
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
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-900" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS CELEBRATION MODAL */}
      {isPaymentSuccessModalOpen && paidSuccessOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans select-none">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
            
            {/* AMBIENT GLOW */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* SUCCESS ICON */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 shrink-0">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                ✓ PEMBAYARAN DITERIMA & LUNAS
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                Pembayaran Berjaya!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tempahan anda #{paidSuccessOrderData.orderId || paidSuccessOrderData.id} telah disahkan dan rekod cetakan dihantar ke kilang AYEZZ Global.
              </p>
            </div>

            {/* SUMMARY BOX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Kod Pesanan:</span>
                <span className="font-bold text-slate-900">#{paidSuccessOrderData.orderId || paidSuccessOrderData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Dibayar:</span>
                <span className="font-extrabold text-emerald-700">{paidSuccessOrderData.total || `RM ${paidSuccessOrderData.totalPrice || 0}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-900">CHIP Collect (MYR)</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setIsPaymentSuccessModalOpen(false);
                  router.push(`/invoice?orderId=${paidSuccessOrderData.orderId || paidSuccessOrderData.id}`);
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Lihat Invois & Job Sheet (PDF) →</span>
              </button>

              <button
                onClick={() => setIsPaymentSuccessModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Tutup & Kembali Ke Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE SIZE BOTTOM SHEET MODAL (APPLE-STYLE STEPPER & ACCORDION) */}
      {isMobileSizeModalOpen && activeGroupIdForSize && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">SAIZ & KUANTITI</span>
                <h3 className="text-sm font-black uppercase text-slate-900">Tetapkan Kuantiti Saiz</h3>
              </div>
              <button
                onClick={() => setIsMobileSizeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            {/* ACCORDION CONTAINER */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* ACCORDION SECTION 1: SAIZ DEWASA (ADULT) */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsAdultAccordionOpen(!isAdultAccordionOpen)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-900 uppercase">1. Saiz Dewasa (Adult)</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {ADULT_SIZES.reduce((sum, sz) => sum + Number(cutGroups.find(g => g.id === activeGroupIdForSize)?.sizes?.[sz] || 0), 0)} pcs
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isAdultAccordionOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isAdultAccordionOpen && (
                  <div className="divide-y divide-slate-100 p-2 sm:p-3">
                    {ADULT_SIZES.map((sz) => {
                      const currentGroup = cutGroups.find(g => g.id === activeGroupIdForSize);
                      const q = Number(currentGroup?.sizes?.[sz] || 0);
                      return (
                        <div key={sz} className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                          <span className="text-sm font-black text-slate-900">{sz}</span>

                          {/* APPLE-STYLE STEPPER CONTROLS */}
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              disabled={q <= 0}
                              onClick={() => setGroupSizeQtyDirect(activeGroupIdForSize, sz, Math.max(0, q - 1))}
                              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-sm flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:bg-slate-50 cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center text-xs font-mono font-black ${q > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => setGroupSizeQtyDirect(activeGroupIdForSize, sz, q + 1)}
                              className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center active:scale-95 shadow-2xs cursor-pointer"
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

              {/* ACCORDION SECTION 2: SAIZ KANAK-KANAK (KIDS) */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsKidsAccordionOpen(!isKidsAccordionOpen)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-900 uppercase">2. Saiz Kanak-Kanak (Kids)</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {KIDS_SIZES.reduce((sum, sz) => sum + Number(cutGroups.find(g => g.id === activeGroupIdForSize)?.sizes?.[sz] || 0), 0)} pcs
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isKidsAccordionOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isKidsAccordionOpen && (
                  <div className="divide-y divide-slate-100 p-2 sm:p-3">
                    {KIDS_SIZES.map((sz) => {
                      const currentGroup = cutGroups.find(g => g.id === activeGroupIdForSize);
                      const q = Number(currentGroup?.sizes?.[sz] || 0);
                      return (
                        <div key={sz} className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                          <span className="text-sm font-black text-slate-900">Saiz {sz}</span>

                          {/* APPLE-STYLE STEPPER CONTROLS */}
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              disabled={q <= 0}
                              onClick={() => setGroupSizeQtyDirect(activeGroupIdForSize, sz, Math.max(0, q - 1))}
                              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-sm flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:bg-slate-50 cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center text-xs font-mono font-black ${q > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => setGroupSizeQtyDirect(activeGroupIdForSize, sz, q + 1)}
                              className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center active:scale-95 shadow-2xs cursor-pointer"
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

            </div>

            {/* MODAL FOOTER DONE BUTTON */}
            <div className="pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setIsMobileSizeModalOpen(false)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md cursor-pointer"
              >
                Selesai & Simpan Saiz
              </button>
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
