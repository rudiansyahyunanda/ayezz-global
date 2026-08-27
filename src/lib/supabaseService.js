import { supabase, isSupabaseConnected } from './supabaseClient';
import {
  MAIN_CATALOGS as INITIAL_CATALOGS,
  DESIGN_TEMPLATES as INITIAL_TEMPLATES,
  CUT_TYPES as INITIAL_CUTS,
  FABRIC_TYPES as INITIAL_FABRICS
} from '../data/sublimationProducts';

// ==========================================
// 1. KATEGORI UTAMA (Full CRUD with Cover Image)
// ==========================================
export async function getCategories() {
  if (!isSupabaseConnected) return INITIAL_CATALOGS;
  try {
    const { data: catData, error: catErr } = await supabase.from('categories').select('*').order('code', { ascending: true });
    
    // Priority 1: Use Supabase categories directly
    const categoriesSource = (catData && catData.length > 0) ? catData : INITIAL_CATALOGS;

    const { data: subData } = await supabase.from('sub_categories').select('*');
    const { data: templateData } = await supabase.from('design_templates').select('category');

    return categoriesSource.map(item => {
      const categorySubs = subData ? subData.filter(s => s.category_id === item.id || s.category_id === item.code) : [];
      let subCategoryTitles = categorySubs.map(s => s.title);
      
      if (item.subCategories && Array.isArray(item.subCategories)) {
        item.subCategories.forEach(sTitle => {
          if (!subCategoryTitles.includes(sTitle)) subCategoryTitles.push(sTitle);
        });
      }

      if (!subCategoryTitles.includes('Semua')) subCategoryTitles.unshift('Semua');

      const tplCount = templateData ? templateData.filter(t => t.category?.toLowerCase() === item.title?.toLowerCase()).length : 0;
      const countLabel = tplCount > 0 ? `${tplCount} Design` : `${Math.max(subCategoryTitles.length - 1, 0)} Sub-Kategori`;

      return {
        id: item.id,
        code: item.code || 'CAT',
        title: item.title,
        description: item.description || '',
        itemCount: countLabel,
        thumbnail: item.thumbnail || '/images/catalog/jersey-olahraga.jfif',
        subCategories: subCategoryTitles,
        rawSubCategories: categorySubs
      };
    });
  } catch (err) {
    console.warn('Supabase getCategories error:', err);
    return INITIAL_CATALOGS;
  }
}

export async function insertCategoryToSupabase(category) {
  if (!isSupabaseConnected) return;
  await supabase.from('categories').insert([{
    id: category.id,
    code: category.code,
    title: category.title,
    description: category.description || '',
    item_count: category.itemCount || '0 Jenis',
    thumbnail: category.thumbnail || '/images/catalog/jersey-olahraga.jfif'
  }]);
}

export async function updateCategoryInSupabase(categoryId, updatedCat) {
  if (!isSupabaseConnected) return;
  await supabase.from('categories').update({
    code: updatedCat.code,
    title: updatedCat.title,
    description: updatedCat.description,
    thumbnail: updatedCat.thumbnail
  }).eq('id', categoryId);
}

export async function deleteCategoryFromSupabase(categoryId) {
  if (!isSupabaseConnected) return;
  await supabase.from('categories').delete().eq('id', categoryId);
}

// ==========================================
// 1B. DEDICATED SUB-CATEGORIES (Full Datatable CRUD)
// ==========================================
export async function getSubCategories(categoryId) {
  if (!isSupabaseConnected) return [];
  try {
    const { data, error } = await supabase
      .from('sub_categories')
      .select('*')
      .eq('category_id', categoryId)
      .order('code', { ascending: true });
    if (error || !data) return [];
    return data.map(item => ({
      id: item.id,
      categoryId: item.category_id,
      code: item.code,
      title: item.title,
      description: item.description || '',
      thumbnail: item.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    }));
  } catch (err) {
    console.warn('Supabase getSubCategories error:', err);
    return [];
  }
}

export async function insertSubCategoryToSupabase(subCat) {
  if (!isSupabaseConnected) return;
  await supabase.from('sub_categories').insert([{
    id: subCat.id,
    category_id: subCat.categoryId,
    code: subCat.code,
    title: subCat.title,
    description: subCat.description || '',
    thumbnail: subCat.thumbnail || '/images/catalog/jersey-olahraga.jfif'
  }]);
}

export async function updateSubCategoryInSupabase(subCatId, updatedSub) {
  if (!isSupabaseConnected) return;
  await supabase.from('sub_categories').update({
    code: updatedSub.code,
    title: updatedSub.title,
    description: updatedSub.description,
    thumbnail: updatedSub.thumbnail
  }).eq('id', subCatId);
}

export async function deleteSubCategoryFromSupabase(subCatId) {
  if (!isSupabaseConnected) return;
  await supabase.from('sub_categories').delete().eq('id', subCatId);
}

// ==========================================
// 2. JENIS POTONGAN / KOLAR (WITH 1:1 COVER THUMBNAIL)
// ==========================================
export async function getCutTypes() {
  if (!isSupabaseConnected) return INITIAL_CUTS;
  try {
    const { data, error } = await supabase.from('cut_types').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_CUTS;
    return data.map(item => ({
      id: item.id,
      name: item.name,
      addOnPrice: Number(item.add_on_price) || 0,
      desc: item.description || '',
      thumbnail: item.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    }));
  } catch (err) {
    console.warn('Supabase getCutTypes error:', err);
    return INITIAL_CUTS;
  }
}

export async function insertCutTypeToSupabase(cut) {
  if (!isSupabaseConnected || !cut) return;
  try {
    const payload = {
      id: cut.id || `cut_${Date.now()}`,
      name: cut.name,
      add_on_price: Number(cut.addOnPrice ?? cut.add_on_price ?? 0),
      description: cut.desc || cut.description || 'Potongan kustom',
      thumbnail: cut.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    };
    const { error } = await supabase.from('cut_types').insert([payload]);
    if (error) {
      console.error('Supabase insertCutType error:', error);
    } else {
      console.log('Supabase insertCutType succeeded:', payload.id);
    }
  } catch (err) {
    console.error('Supabase insertCutType exception:', err);
  }
}

export async function updateCutPriceInSupabase(cutId, newPrice) {
  if (!isSupabaseConnected || !cutId) return;
  try {
    const { error } = await supabase.from('cut_types').update({ add_on_price: Number(newPrice) || 0 }).eq('id', cutId);
    if (error) console.error('Supabase updateCutPrice error:', error);
  } catch (err) {
    console.error('Supabase updateCutPrice exception:', err);
  }
}

export async function updateCutTypeInSupabase(cutId, updatedCut) {
  if (!isSupabaseConnected) return;
  let targetId = cutId;
  let cutData = updatedCut;

  if (typeof cutId === 'object' && cutId !== null && !updatedCut) {
    cutData = cutId;
    targetId = cutId.id;
  }
  if (!targetId || !cutData) return;

  try {
    const payload = {
      name: cutData.name,
      add_on_price: Number(cutData.addOnPrice ?? cutData.add_on_price ?? 0),
      description: cutData.desc || cutData.description || '',
      thumbnail: cutData.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    };
    const { error } = await supabase.from('cut_types').update(payload).eq('id', targetId);
    if (error) {
      console.error('Supabase updateCutType error:', error);
    } else {
      console.log('Supabase updateCutType succeeded:', targetId);
    }
  } catch (err) {
    console.error('Supabase updateCutType exception:', err);
  }
}

export async function deleteCutTypeFromSupabase(cutId) {
  if (!isSupabaseConnected || !cutId) return;
  try {
    const { error } = await supabase.from('cut_types').delete().eq('id', cutId);
    if (error) console.error('Supabase deleteCutType error:', error);
  } catch (err) {
    console.error('Supabase deleteCutType exception:', err);
  }
}

// ==========================================
// 3. BAHAN KAIN SUBLIMASI
// ==========================================
export async function getFabricTypes() {
  if (!isSupabaseConnected) return INITIAL_FABRICS;
  try {
    const { data, error } = await supabase.from('fabric_types').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_FABRICS;
    return data.map(item => ({
      id: item.id,
      name: item.name,
      basePrice: Number(item.base_price ?? item.basePrice ?? 70),
      tier: item.tier || 'Premium',
      gsm: item.gsm || '150 GSM',
      features: item.features || 'Pantas Kering • Ringan',
      desc: item.description || item.desc || '',
      thumbnail: item.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    }));
  } catch (err) {
    console.warn('Supabase getFabricTypes error:', err);
    return INITIAL_FABRICS;
  }
}

export async function insertFabricTypeToSupabase(fabric) {
  if (!isSupabaseConnected || !fabric) return;
  try {
    const payload = {
      id: fabric.id || `fab_${Date.now()}`,
      name: fabric.name,
      base_price: Number(fabric.basePrice ?? fabric.base_price ?? 70),
      tier: fabric.tier || 'Premium',
      gsm: fabric.gsm || '150 GSM',
      features: fabric.features || '',
      description: fabric.desc || fabric.description || 'Bahan kain sublimasi',
      thumbnail: fabric.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    };
    const { error } = await supabase.from('fabric_types').insert([payload]);
    if (error) {
      console.error('Supabase insertFabricType error:', error);
    } else {
      console.log('Supabase insertFabricType succeeded:', payload.id);
    }
  } catch (err) {
    console.error('Supabase insertFabricType exception:', err);
  }
}

export async function updateFabricPriceInSupabase(fabricId, newPrice) {
  if (!isSupabaseConnected || !fabricId) return;
  try {
    const { error } = await supabase.from('fabric_types').update({ base_price: Number(newPrice) || 70 }).eq('id', fabricId);
    if (error) console.error('Supabase updateFabricPrice error:', error);
  } catch (err) {
    console.error('Supabase updateFabricPrice exception:', err);
  }
}

export async function updateFabricTypeInSupabase(fabricId, updatedFabric) {
  if (!isSupabaseConnected) return;
  let targetId = fabricId;
  let fabData = updatedFabric;

  if (typeof fabricId === 'object' && fabricId !== null && !updatedFabric) {
    fabData = fabricId;
    targetId = fabricId.id;
  }
  if (!targetId || !fabData) return;

  try {
    const payload = {
      name: fabData.name,
      base_price: Number(fabData.basePrice ?? fabData.base_price ?? 70),
      tier: fabData.tier || 'Premium',
      gsm: fabData.gsm || '150 GSM',
      features: fabData.features || '',
      description: fabData.desc || fabData.description || '',
      thumbnail: fabData.thumbnail || '/images/catalog/jersey-olahraga.jfif'
    };
    const { error } = await supabase.from('fabric_types').update(payload).eq('id', targetId);
    if (error) {
      console.error('Supabase updateFabricType error:', error);
    } else {
      console.log('Supabase updateFabricType succeeded:', targetId);
    }
  } catch (err) {
    console.error('Supabase updateFabricType exception:', err);
  }
}

export async function deleteFabricTypeFromSupabase(fabricId) {
  if (!isSupabaseConnected || !fabricId) return;
  try {
    const { error } = await supabase.from('fabric_types').delete().eq('id', fabricId);
    if (error) console.error('Supabase deleteFabricType error:', error);
  } catch (err) {
    console.error('Supabase deleteFabricType exception:', err);
  }
}

// ==========================================
// 4. TEMPLATE REKA BENTUK (WITH MULTI-PHOTO GALLERY)
// ==========================================
export async function getDesignTemplates() {
  if (!isSupabaseConnected) return INITIAL_TEMPLATES;
  try {
    const { data, error } = await supabase.from('design_templates').select('*').order('created_at', { ascending: false });
    
    const templatesSource = (data && data.length > 0) ? data : INITIAL_TEMPLATES;

    return templatesSource.map(item => {
      const imgList = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : (item.thumbnail ? [item.thumbnail] : ['/images/catalog/jersey-olahraga.jfif']);
      return {
        id: item.id,
        name: item.name,
        category: item.category || 'Olahraga',
        subCategory: item.sub_category || item.subCategory || '',
        description: item.description || '',
        thumbnail: imgList[0],
        images: imgList
      };
    });
  } catch (err) {
    console.warn('Supabase getDesignTemplates error:', err);
    return INITIAL_TEMPLATES;
  }
}

export async function insertDesignTemplateToSupabase(template) {
  if (!isSupabaseConnected || !template) return;
  const imgList = Array.isArray(template?.images) && template.images.length > 0
    ? template.images
    : (template?.thumbnail ? [template.thumbnail] : ['/images/catalog/jersey-olahraga.jfif']);
  
  const payloadWithImages = {
    id: template.id,
    name: template.name,
    category: template.category,
    sub_category: template.subCategory || '',
    description: template.description || '',
    thumbnail: imgList[0] || '/images/catalog/jersey-olahraga.jfif',
    images: imgList
  };

  try {
    const { error } = await supabase.from('design_templates').insert([payloadWithImages]);
    if (error) {
      console.warn('Supabase insertDesignTemplate error with images column:', error);
      // Fallback: If 'images' column is missing in Supabase schema cache (PGRST204), insert without 'images'
      if (error.code === 'PGRST204' || (error.message && error.message.includes('images'))) {
        console.info('Retrying insertDesignTemplate without images column fallback...');
        const { images, ...payloadWithoutImages } = payloadWithImages;
        const { error: fallbackErr } = await supabase.from('design_templates').insert([payloadWithoutImages]);
        if (fallbackErr) {
          console.error('Supabase insertDesignTemplate fallback failed:', fallbackErr);
        } else {
          console.log('Supabase insertDesignTemplate succeeded with fallback payload.');
        }
      }
    } else {
      console.log('Supabase insertDesignTemplate succeeded.');
    }
  } catch (err) {
    console.error('Supabase insertDesignTemplate exception:', err);
  }
}

export async function updateDesignTemplateInSupabase(templateId, updatedTpl) {
  if (!isSupabaseConnected) return;

  let targetId = templateId;
  let tplData = updatedTpl;

  // Support single argument invocation if template object contains id
  if (typeof templateId === 'object' && templateId !== null && !updatedTpl) {
    tplData = templateId;
    targetId = templateId.id;
  }

  if (!targetId || !tplData) return;

  const imgList = Array.isArray(tplData?.images) && tplData.images.length > 0
    ? tplData.images
    : (tplData?.thumbnail ? [tplData.thumbnail] : ['/images/catalog/jersey-olahraga.jfif']);

  const payloadWithImages = {
    name: tplData.name,
    category: tplData.category,
    sub_category: tplData.subCategory || '',
    description: tplData.description || '',
    thumbnail: imgList[0] || '/images/catalog/jersey-olahraga.jfif',
    images: imgList
  };

  try {
    const { error } = await supabase.from('design_templates').update(payloadWithImages).eq('id', targetId);
    if (error) {
      console.warn('Supabase updateDesignTemplate error with images column:', error);
      if (error.code === 'PGRST204' || (error.message && error.message.includes('images'))) {
        console.info('Retrying updateDesignTemplate without images column fallback...');
        const { images, ...payloadWithoutImages } = payloadWithImages;
        const { error: fallbackErr } = await supabase.from('design_templates').update(payloadWithoutImages).eq('id', targetId);
        if (fallbackErr) {
          console.error('Supabase updateDesignTemplate fallback failed:', fallbackErr);
        } else {
          console.log('Supabase updateDesignTemplate succeeded with fallback payload.');
        }
      }
    } else {
      console.log('Supabase updateDesignTemplate succeeded.');
    }
  } catch (err) {
    console.error('Supabase updateDesignTemplate exception:', err);
  }
}

export async function deleteDesignTemplateFromSupabase(templateId) {
  if (!isSupabaseConnected) return;
  try {
    const { error } = await supabase.from('design_templates').delete().eq('id', templateId);
    if (error) console.error('Supabase deleteDesignTemplate error:', error);
  } catch (err) {
    console.error('Supabase deleteDesignTemplate exception:', err);
  }
}

// ==========================================
// 5. REKOD PESANAN
// ==========================================
export async function getOrdersFromSupabase() {
  if (!isSupabaseConnected) return [];
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(item => ({
      id: item.id,
      userEmail: item.user_email || '',
      client: item.client_name,
      template: item.template_name || 'Template Reka Bentuk',
      cutType: item.cut_type || 'Standard',
      fabricMaterial: item.fabric_material || 'Dry-Fit',
      sizeBreakdown: item.size_breakdown || {},
      qty: item.total_qty || 1,
      unitPrice: item.unit_price || 70,
      totalPrice: item.total_price || 70,
      total: `RM ${Number(item.total_price || 0).toFixed(2)}`,
      date: new Date(item.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: item.status || 'Pesanan Diterima'
    }));
  } catch (err) {
    console.warn('Supabase getOrdersFromSupabase error:', err);
    return [];
  }
}

export async function getUserOrdersFromSupabase(userEmail) {
  if (!userEmail) return [];
  
  if (isSupabaseConnected) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          userEmail: item.user_email || userEmail,
          client: item.client_name,
          template: item.template_name || 'Template Reka Bentuk',
          cutType: item.cut_type || 'Standard',
          fabricMaterial: item.fabric_material || 'Dry-Fit',
          sizeBreakdown: item.size_breakdown || {},
          qty: item.total_qty || 1,
          unitPrice: item.unit_price || 70,
          totalPrice: item.total_price || 70,
          total: `RM ${Number(item.total_price || 0).toFixed(2)}`,
          date: new Date(item.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: item.status || 'Pesanan Diterima'
        }));
      }
    } catch (err) {
      console.warn('Supabase getUserOrders error:', err);
    }
  }

  // Fallback to checking local storage orders
  if (typeof window !== 'undefined') {
    try {
      const localOrders = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      return localOrders.filter(o => o.userEmail === userEmail);
    } catch (e) {
      return [];
    }
  }

  return [];
}

export async function saveOrderToSupabase(orderData) {
  const payload = {
    user_email: orderData.userEmail || orderData.email || '',
    user_id: orderData.userId || '',
    client_name: orderData.clientName || 'Pelanggan Sistem',
    template_name: orderData.templateName,
    cut_type: orderData.cutType,
    fabric_material: orderData.fabricMaterial,
    size_breakdown: orderData.sizeBreakdown,
    total_qty: orderData.totalQty,
    unit_price: orderData.unitPrice,
    total_price: orderData.totalPrice,
    status: 'Pesanan Diterima'
  };

  // Save to local storage cache as fallback
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      const newLocalOrder = {
        id: `AYZ-${Math.floor(100000 + Math.random() * 900000)}`,
        userEmail: payload.user_email,
        client: payload.client_name,
        template: payload.template_name,
        cutType: payload.cut_type,
        fabricMaterial: payload.fabric_material,
        sizeBreakdown: payload.size_breakdown,
        qty: payload.total_qty,
        unitPrice: payload.unit_price,
        totalPrice: payload.total_price,
        total: `RM ${Number(payload.total_price || 0).toFixed(2)}`,
        date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pesanan Diterima'
      };
      localStorage.setItem('ayezz_user_orders', JSON.stringify([newLocalOrder, ...existing]));
    } catch (e) {}
  }

  if (!isSupabaseConnected) return;

  try {
    const { error } = await supabase.from('orders').insert([payload]);
    if (error) {
      // Fallback: If user_email column is missing in schema cache, retry without user_email
      const { user_email, user_id, ...fallbackPayload } = payload;
      await supabase.from('orders').insert([fallbackPayload]);
    }
  } catch (err) {
    console.error('Error saving order to Supabase:', err);
  }
}

export async function updateOrderStatusInSupabase(orderId, newStatus) {
  if (!isSupabaseConnected) return;
  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
}

export async function deleteOrderFromSupabase(orderId) {
  if (!isSupabaseConnected) return;
  await supabase.from('orders').delete().eq('id', orderId);
}

// ==========================================
// 6. TETAPAN KEDAI
// ==========================================
export async function getStoreSettingsFromSupabase() {
  if (!isSupabaseConnected) return { storeName: 'AYEZZ GLOBAL', whatsappNumber: '6287818310416', currencySymbol: 'RM' };
  try {
    const { data } = await supabase.from('store_settings').select('*').limit(1).single();
    if (!data) return { storeName: 'AYEZZ GLOBAL', whatsappNumber: '6287818310416', currencySymbol: 'RM' };
    return {
      storeName: data.store_name,
      whatsappNumber: data.whatsapp_number,
      currencySymbol: data.currency_symbol,
      minOrderQty: data.min_order_qty
    };
  } catch (err) {
    return { storeName: 'AYEZZ GLOBAL', whatsappNumber: '6287818310416', currencySymbol: 'RM' };
  }
}

export async function updateStoreSettingsInSupabase(settings) {
  if (!isSupabaseConnected) return;
  await supabase.from('store_settings').upsert({
    id: 'default_settings',
    store_name: settings.storeName,
    whatsapp_number: settings.whatsappNumber,
    currency_symbol: settings.currencySymbol,
    updated_at: new Date()
  });
}
