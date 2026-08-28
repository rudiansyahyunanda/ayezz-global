import { supabase, isSupabaseConnected } from './supabaseClient';
import { uploadDirectToSupabaseStorage, deleteImageFromSupabaseStorage } from './imageService';
import {
  MAIN_CATALOGS as INITIAL_CATALOGS,
  DESIGN_TEMPLATES as INITIAL_TEMPLATES,
  CUT_TYPES as INITIAL_CUTS,
  FABRIC_TYPES as INITIAL_FABRICS
} from '../data/sublimationProducts';

export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F5F5F7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2386868B'%3EAYEZZ GLOBAL%3C/text%3E%3C/svg%3E";

/**
 * Automatically uploads Base64 / raw images to Supabase Storage Bucket ('ayezz-assets')
 * to ensure that stored DB URLs are ALWAYS real HTTPS Supabase Cloud URLs!
 */
export async function ensureSupabaseCloudImageUrl(imgUrl, hint = 'asset') {
  if (!imgUrl || typeof imgUrl !== 'string') return PLACEHOLDER_IMAGE;
  if (imgUrl.startsWith('data:image/')) {
    try {
      console.log(`[SupabaseService] Auto-uploading base64 image (${hint}) to Supabase Storage...`);
      const cloudUrl = await uploadDirectToSupabaseStorage(imgUrl, hint);
      if (cloudUrl) return cloudUrl;
    } catch (err) {
      console.warn('[SupabaseService] Auto-upload image to Supabase Storage failed:', err.message);
    }
  }
  return imgUrl;
}

// ==========================================
// 1. KATEGORI UTAMA (Full CRUD with Cover Image)
// ==========================================
export async function getCategories() {
  if (!isSupabaseConnected) return [];
  try {
    const { data: catData, error: catErr } = await supabase.from('categories').select('*').order('code', { ascending: true });
    
    if (catErr || !catData || catData.length === 0) return [];
    const categoriesSource = catData;

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
        thumbnail: item.thumbnail || PLACEHOLDER_IMAGE,
        subCategories: subCategoryTitles,
        rawSubCategories: categorySubs
      };
    });
  } catch (err) {
    console.warn('Supabase getCategories error:', err);
    return [];
  }
}

export async function insertCategoryToSupabase(category) {
  if (!isSupabaseConnected) return;
  const cloudCover = await ensureSupabaseCloudImageUrl(category.thumbnail, category.code || 'cat');
  await supabase.from('categories').insert([{
    id: category.id,
    code: category.code,
    title: category.title,
    description: category.description || '',
    item_count: category.itemCount || '0 Jenis',
    thumbnail: cloudCover || PLACEHOLDER_IMAGE
  }]);
}

export async function updateCategoryInSupabase(categoryId, updatedCat) {
  if (!isSupabaseConnected) return;
  const cloudCover = await ensureSupabaseCloudImageUrl(updatedCat.thumbnail, updatedCat.code || 'cat');
  await supabase.from('categories').update({
    code: updatedCat.code,
    title: updatedCat.title,
    description: updatedCat.description,
    thumbnail: cloudCover
  }).eq('id', categoryId);
}

export async function deleteCategoryFromSupabase(categoryId) {
  if (!isSupabaseConnected || !categoryId) return { success: false };
  try {
    // 1. Check if category still has child sub_categories
    const { data: subData } = await supabase
      .from('sub_categories')
      .select('id, title')
      .eq('category_id', categoryId);

    if (subData && subData.length > 0) {
      console.warn(`[DeleteBlocked] Category ${categoryId} has ${subData.length} child sub-categories.`);
      return {
        success: false,
        message: `Kategori tidak boleh dipadam kerana masih mempunyai ${subData.length} Sub-Kategori turunan. Sila padam semua Sub-Kategori turunan terlebih dahulu.`
      };
    }

    // 2. Fetch category thumbnail before deletion
    const { data: catData } = await supabase.from('categories').select('thumbnail').eq('id', categoryId).single();

    if (catData?.thumbnail) {
      await deleteImageFromSupabaseStorage(catData.thumbnail);
    }

    // 3. Delete category row from database
    const { error: delErr } = await supabase.from('categories').delete().eq('id', categoryId);
    if (delErr) {
      console.error('Supabase deleteCategory error:', delErr);
      return { success: false, message: delErr.message };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteCategoryFromSupabase exception:', err);
    return { success: false, message: err.message };
  }
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
      thumbnail: item.thumbnail || PLACEHOLDER_IMAGE
    }));
  } catch (err) {
    console.warn('Supabase getSubCategories error:', err);
    return [];
  }
}

export async function insertSubCategoryToSupabase(subCat) {
  if (!isSupabaseConnected) return;
  const cloudCover = await ensureSupabaseCloudImageUrl(subCat.thumbnail, subCat.code || 'sub');
  await supabase.from('sub_categories').insert([{
    id: subCat.id,
    category_id: subCat.categoryId,
    code: subCat.code,
    title: subCat.title,
    description: subCat.description || '',
    thumbnail: cloudCover || PLACEHOLDER_IMAGE
  }]);
}

export async function updateSubCategoryInSupabase(subCatId, updatedSub) {
  if (!isSupabaseConnected) return;
  const cloudCover = await ensureSupabaseCloudImageUrl(updatedSub.thumbnail, updatedSub.code || 'sub');
  await supabase.from('sub_categories').update({
    code: updatedSub.code,
    title: updatedSub.title,
    description: updatedSub.description,
    thumbnail: cloudCover
  }).eq('id', subCatId);
}

export async function deleteSubCategoryFromSupabase(subCatId) {
  if (!isSupabaseConnected || !subCatId) return;
  try {
    const { data } = await supabase.from('sub_categories').select('thumbnail').eq('id', subCatId).single();
    if (data?.thumbnail) {
      await deleteImageFromSupabaseStorage(data.thumbnail);
    }
    await supabase.from('sub_categories').delete().eq('id', subCatId);
  } catch (err) {
    console.error('deleteSubCategoryFromSupabase exception:', err);
  }
}

// ==========================================
// 2. JENIS POTONGAN / KOLAR (WITH 1:1 COVER THUMBNAIL)
// ==========================================
export async function getCutTypes() {
  if (!isSupabaseConnected) return [];
  try {
    const { data, error } = await supabase.from('cut_types').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return [];
    return data.map(item => ({
      id: item.id,
      name: item.name,
      addOnPrice: Number(item.add_on_price) || 0,
      desc: item.description || '',
      thumbnail: item.thumbnail || PLACEHOLDER_IMAGE
    }));
  } catch (err) {
    console.warn('Supabase getCutTypes error:', err);
    return [];
  }
}

export async function insertCutTypeToSupabase(cut) {
  if (!isSupabaseConnected || !cut) return;
  try {
    const cloudCover = await ensureSupabaseCloudImageUrl(cut.thumbnail, cut.name || 'cut');
    const payload = {
      id: cut.id || `cut_${Date.now()}`,
      name: cut.name,
      add_on_price: Number(cut.addOnPrice ?? cut.add_on_price ?? 0),
      description: cut.desc || cut.description || 'Potongan kustom',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
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
    const cloudCover = await ensureSupabaseCloudImageUrl(cutData.thumbnail, cutData.name || 'cut');
    const payload = {
      name: cutData.name,
      add_on_price: Number(cutData.addOnPrice ?? cutData.add_on_price ?? 0),
      description: cutData.desc || cutData.description || '',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
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
    const { data } = await supabase.from('cut_types').select('thumbnail').eq('id', cutId).single();
    if (data?.thumbnail) {
      await deleteImageFromSupabaseStorage(data.thumbnail);
    }
    const { error } = await supabase.from('cut_types').delete().eq('id', cutId);
    if (error) console.error('Supabase deleteCutType error:', error);
  } catch (err) {
    console.error('Supabase deleteCutType exception:', err);
  }
}

// ==========================================
// 2.5 JENIS LENGAN / SLEEVE TYPES
// ==========================================
export const FALLBACK_SLEEVE_TYPES = [
  { id: 'sleeve_short', name: 'Lengan Pendek (Short Sleeve)', addOnPrice: 0, desc: 'Potongan standard lengan pendek', thumbnail: PLACEHOLDER_IMAGE },
  { id: 'sleeve_long', name: 'Lengan Panjang (Long Sleeve)', addOnPrice: 5, desc: 'Lengan panjang dengan kemasan cuff', thumbnail: PLACEHOLDER_IMAGE },
  { id: 'sleeve_muslimah', name: 'Potongan Muslimah (Long & Labuh)', addOnPrice: 8, desc: 'Lengan panjang & labuh belakang', thumbnail: PLACEHOLDER_IMAGE },
  { id: 'sleeve_sleeveless', name: 'Tanpa Lengan (Sleeveless / Singlet)', addOnPrice: 0, desc: 'Potongan tanpa lengan', thumbnail: PLACEHOLDER_IMAGE }
];

export async function getSleeveTypes() {
  if (!isSupabaseConnected) return FALLBACK_SLEEVE_TYPES;
  try {
    const { data, error } = await supabase.from('sleeve_types').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_SLEEVE_TYPES;
    return data.map(item => ({
      id: item.id,
      name: item.name,
      addOnPrice: Number(item.add_on_price) || 0,
      desc: item.description || '',
      thumbnail: item.thumbnail || PLACEHOLDER_IMAGE
    }));
  } catch (err) {
    console.warn('Supabase getSleeveTypes error:', err);
    return FALLBACK_SLEEVE_TYPES;
  }
}

export async function insertSleeveTypeToSupabase(sleeve) {
  if (!isSupabaseConnected || !sleeve) return;
  try {
    const cloudCover = await ensureSupabaseCloudImageUrl(sleeve.thumbnail, sleeve.name || 'sleeve');
    const payload = {
      id: sleeve.id || `sleeve_${Date.now()}`,
      name: sleeve.name,
      add_on_price: Number(sleeve.addOnPrice ?? sleeve.add_on_price ?? 0),
      description: sleeve.desc || sleeve.description || 'Jenis lengan kustom',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
    };
    const { error } = await supabase.from('sleeve_types').insert([payload]);
    if (error) {
      console.error('Supabase insertSleeveType error:', error);
    } else {
      console.log('Supabase insertSleeveType succeeded:', payload.id);
    }
  } catch (err) {
    console.error('Supabase insertSleeveType exception:', err);
  }
}

export async function updateSleeveTypeInSupabase(sleeveId, updatedSleeve) {
  if (!isSupabaseConnected || !sleeveId) return;
  try {
    const cloudCover = await ensureSupabaseCloudImageUrl(updatedSleeve.thumbnail, updatedSleeve.name || 'sleeve');
    const payload = {
      name: updatedSleeve.name,
      add_on_price: Number(updatedSleeve.addOnPrice ?? updatedSleeve.add_on_price ?? 0),
      description: updatedSleeve.desc || updatedSleeve.description || '',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
    };
    const { error } = await supabase.from('sleeve_types').update(payload).eq('id', sleeveId);
    if (error) console.error('Supabase updateSleeveType error:', error);
  } catch (err) {
    console.error('Supabase updateSleeveType exception:', err);
  }
}

export async function deleteSleeveTypeFromSupabase(sleeveId) {
  if (!isSupabaseConnected || !sleeveId) return;
  try {
    const { error } = await supabase.from('sleeve_types').delete().eq('id', sleeveId);
    if (error) console.error('Supabase deleteSleeveType error:', error);
  } catch (err) {
    console.error('Supabase deleteSleeveType exception:', err);
  }
}

// ==========================================
// 3. BAHAN KAIN SUBLIMASI
// ==========================================
export async function getFabricTypes() {
  if (!isSupabaseConnected) return [];
  try {
    const { data, error } = await supabase.from('fabric_types').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return [];
    return data.map(item => ({
      id: item.id,
      name: item.name,
      basePrice: Number(item.base_price ?? item.basePrice ?? 70),
      tier: item.tier || 'Premium',
      gsm: item.gsm || '150 GSM',
      features: item.features || 'Pantas Kering • Ringan',
      desc: item.description || item.desc || '',
      thumbnail: item.thumbnail || PLACEHOLDER_IMAGE
    }));
  } catch (err) {
    console.warn('Supabase getFabricTypes error:', err);
    return [];
  }
}

export async function insertFabricTypeToSupabase(fabric) {
  if (!isSupabaseConnected || !fabric) return;
  try {
    const cloudCover = await ensureSupabaseCloudImageUrl(fabric.thumbnail, fabric.name || 'fab');
    const payload = {
      id: fabric.id || `fab_${Date.now()}`,
      name: fabric.name,
      base_price: Number(fabric.basePrice ?? fabric.base_price ?? 70),
      tier: fabric.tier || 'Premium',
      gsm: fabric.gsm || '150 GSM',
      features: fabric.features || '',
      description: fabric.desc || fabric.description || 'Bahan kain sublimasi',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
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
    const cloudCover = await ensureSupabaseCloudImageUrl(fabData.thumbnail, fabData.name || 'fab');
    const payload = {
      name: fabData.name,
      base_price: Number(fabData.basePrice ?? fabData.base_price ?? 70),
      tier: fabData.tier || 'Premium',
      gsm: fabData.gsm || '150 GSM',
      features: fabData.features || '',
      description: fabData.desc || fabData.description || '',
      thumbnail: cloudCover || PLACEHOLDER_IMAGE
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
    const { data } = await supabase.from('fabric_types').select('thumbnail').eq('id', fabricId).single();
    if (data?.thumbnail) {
      await deleteImageFromSupabaseStorage(data.thumbnail);
    }
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
  if (!isSupabaseConnected) return [];
  try {
    const { data, error } = await supabase.from('design_templates').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(item => {
      const imgList = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : (item.thumbnail ? [item.thumbnail] : [PLACEHOLDER_IMAGE]);
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
    return [];
  }
}

export async function insertDesignTemplateToSupabase(template) {
  if (!isSupabaseConnected || !template) return;
  const rawList = Array.isArray(template?.images) && template.images.length > 0
    ? template.images
    : (template?.thumbnail ? [template.thumbnail] : [PLACEHOLDER_IMAGE]);
  
  const cloudList = [];
  for (let i = 0; i < rawList.length; i++) {
    const cloudUrl = await ensureSupabaseCloudImageUrl(rawList[i], `${template.name || 'tpl'}_${i + 1}`);
    cloudList.push(cloudUrl);
  }
  
  const payloadWithImages = {
    id: template.id,
    name: template.name,
    category: template.category,
    sub_category: template.subCategory || '',
    description: template.description || '',
    thumbnail: cloudList[0] || PLACEHOLDER_IMAGE,
    images: cloudList
  };

  try {
    const { error } = await supabase.from('design_templates').insert([payloadWithImages]);
    if (error) {
      console.warn('Supabase insertDesignTemplate error with images column:', error);
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

  if (typeof templateId === 'object' && templateId !== null && !updatedTpl) {
    tplData = templateId;
    targetId = templateId.id;
  }

  if (!targetId || !tplData) return;

  const rawList = Array.isArray(tplData?.images) && tplData.images.length > 0
    ? tplData.images
    : (tplData?.thumbnail ? [tplData.thumbnail] : [PLACEHOLDER_IMAGE]);

  const cloudList = [];
  for (let i = 0; i < rawList.length; i++) {
    const cloudUrl = await ensureSupabaseCloudImageUrl(rawList[i], `${tplData.name || 'tpl'}_${i + 1}`);
    cloudList.push(cloudUrl);
  }

  const payloadWithImages = {
    name: tplData.name,
    category: tplData.category,
    sub_category: tplData.subCategory || '',
    description: tplData.description || '',
    thumbnail: cloudList[0] || PLACEHOLDER_IMAGE,
    images: cloudList
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
  if (!isSupabaseConnected || !templateId) return;
  try {
    const { data } = await supabase.from('design_templates').select('thumbnail, images').eq('id', templateId).single();
    const imagesToDelete = [];
    if (data?.thumbnail) imagesToDelete.push(data.thumbnail);
    if (Array.isArray(data?.images)) {
      data.images.forEach(img => {
        if (img) imagesToDelete.push(img);
      });
    }
    if (imagesToDelete.length > 0) {
      await deleteImageFromSupabaseStorage(imagesToDelete);
    }
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
      orderId: item.order_id || item.id,
      userEmail: item.user_email || '',
      client: item.client_name,
      customerPhone: item.customer_phone || '',
      teamName: item.team_name || '',
      template: item.template_name || 'Template Reka Bentuk',
      cutType: item.cut_type || 'Standard',
      fabricMaterial: item.fabric_material || 'Dry-Fit',
      cutGroups: item.cut_groups || [],
      playerRows: item.player_rows || [],
      customLogoUrl: item.custom_logo_url || '',
      sponsorLogoUrl: item.sponsor_logo_url || '',
      playerListFileUrl: item.player_list_file_url || '',
      customDesignRefUrl: item.custom_design_ref_url || '',
      notes: item.notes || '',
      sizeBreakdown: item.size_breakdown || {},
      qty: item.total_qty || 1,
      unitPrice: item.unit_price || 70,
      totalPrice: item.total_price || 70,
      total: `RM ${Number(item.total_price || 0).toFixed(2)}`,
      paymentStatus: item.payment_status || 'pending',
      paymentId: item.payment_id || item.chip_purchase_id || '',
      date: new Date(item.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
          orderId: item.order_id || item.id,
          userEmail: item.user_email || userEmail,
          client: item.client_name,
          customerPhone: item.customer_phone || '',
          teamName: item.team_name || '',
          template: item.template_name || 'Template Reka Bentuk',
          cutType: item.cut_type || 'Standard',
          fabricMaterial: item.fabric_material || 'Dry-Fit',
          cutGroups: item.cut_groups || [],
          playerRows: item.player_rows || [],
          customLogoUrl: item.custom_logo_url || '',
          sponsorLogoUrl: item.sponsor_logo_url || '',
          playerListFileUrl: item.player_list_file_url || '',
          customDesignRefUrl: item.custom_design_ref_url || '',
          notes: item.notes || '',
          sizeBreakdown: item.size_breakdown || {},
          qty: item.total_qty || 1,
          unitPrice: item.unit_price || 70,
          totalPrice: item.total_price || 70,
          total: `RM ${Number(item.total_price || 0).toFixed(2)}`,
          paymentStatus: item.payment_status || 'pending',
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
  const generatedOrderId = orderData.orderId || `AYZ-${Math.floor(100000 + Math.random() * 900000)}`;

  const payload = {
    order_id: generatedOrderId,
    user_email: orderData.userEmail || orderData.email || '',
    user_id: orderData.userId || '',
    client_name: orderData.clientName || 'Pelanggan Sistem',
    customer_phone: orderData.customerPhone || '',
    team_name: orderData.teamName || '',
    template_name: orderData.templateName || 'Template Reka Bentuk',
    cut_type: orderData.cutType || 'Standard',
    fabric_material: orderData.fabricMaterial || 'Dry-Fit',
    cut_groups: orderData.cutGroups || [],
    player_rows: orderData.playerRows || [],
    custom_logo_url: orderData.customLogoUrl || '',
    sponsor_logo_url: orderData.sponsorLogoUrl || '',
    player_list_file_url: orderData.playerListFileUrl || '',
    custom_design_ref_url: orderData.customDesignRefUrl || '',
    notes: orderData.notes || '',
    size_breakdown: orderData.sizeBreakdown || {},
    total_qty: Number(orderData.totalQty || 1),
    unit_price: Number(orderData.unitPrice || 70),
    total_price: Number(orderData.totalPrice || 70),
    payment_status: orderData.paymentStatus || 'pending',
    status: orderData.status || 'Menunggu Pembayaran'
  };

  // Auto-sync user to public.users table in Supabase
  if (payload.user_email) {
    try {
      await supabase.from('users').upsert([{
        email: payload.user_email,
        full_name: payload.client_name,
        phone: payload.customer_phone,
        role: 'customer'
      }], { onConflict: 'email' });
    } catch (e) {
      console.warn('Auto sync user to DB warning:', e);
    }
  }

  // Save to local storage cache as fallback
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      const newLocalOrder = {
        id: generatedOrderId,
        orderId: generatedOrderId,
        userEmail: payload.user_email,
        client: payload.client_name,
        customerPhone: payload.customer_phone,
        teamName: payload.team_name,
        template: payload.template_name,
        cutType: payload.cut_type,
        fabricMaterial: payload.fabric_material,
        cutGroups: payload.cut_groups,
        playerRows: payload.player_rows,
        customLogoUrl: payload.custom_logo_url,
        sponsorLogoUrl: payload.sponsor_logo_url,
        playerListFileUrl: payload.player_list_file_url,
        customDesignRefUrl: payload.custom_design_ref_url,
        notes: payload.notes,
        sizeBreakdown: payload.size_breakdown,
        qty: payload.total_qty,
        unitPrice: payload.unit_price,
        totalPrice: payload.total_price,
        total: `RM ${Number(payload.total_price || 0).toFixed(2)}`,
        paymentStatus: payload.payment_status,
        date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: payload.status
      };
      localStorage.setItem('ayezz_user_orders', JSON.stringify([newLocalOrder, ...existing]));
    } catch (e) {}
  }

  if (!isSupabaseConnected) return { success: true, orderId: generatedOrderId };

  try {
    const { data, error } = await supabase.from('orders').insert([payload]).select('id, order_id').single();
    if (error) {
      console.warn('Supabase insert order warning (retrying simple payload):', error.message);
      // Fallback if rich columns aren't created yet in DB: insert essential columns
      const simplePayload = {
        order_id: generatedOrderId,
        user_email: payload.user_email,
        client_name: payload.client_name,
        template_name: payload.template_name,
        cut_type: payload.cut_type,
        fabric_material: payload.fabric_material,
        total_qty: payload.total_qty,
        unit_price: payload.unit_price,
        total_price: payload.total_price,
        status: payload.status
      };
      await supabase.from('orders').insert([simplePayload]);
    }
    return { success: true, orderId: generatedOrderId };
  } catch (err) {
    console.error('Error saving order to Supabase:', err);
    return { success: true, orderId: generatedOrderId };
  }
}

export async function updateOrderStatusInSupabase(orderId, newStatus, rejectReason = '') {
  const isRejected = newStatus.toLowerCase().includes('ditolak') || newStatus.toLowerCase().includes('batal');
  const updatePayload = {
    status: newStatus,
    ...(isRejected ? { payment_status: 'rejected' } : {})
  };

  // Also update local storage cache
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      const updated = existing.map(item => {
        if (item.id === orderId || item.orderId === orderId) {
          return { ...item, status: newStatus, ...(isRejected ? { paymentStatus: 'rejected' } : {}) };
        }
        return item;
      });
      localStorage.setItem('ayezz_user_orders', JSON.stringify(updated));
    } catch (e) {}
  }

  if (!isSupabaseConnected || !orderId) return;

  try {
    await supabase.from('orders').update(updatePayload).eq('id', orderId);
    await supabase.from('orders').update(updatePayload).eq('order_id', orderId);
  } catch (err) {
    console.error('Error updating order status in Supabase:', err);
  }
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

// ==========================================
// 7. PENGURUSAN PENGGUNA (USERS MANAGEMENT)
// ==========================================
export async function getUsersFromSupabase() {
  const usersMap = new Map();

  if (isSupabaseConnected) {
    try {
      // 1. Fetch from public.users table
      const { data: dbUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbUsers && Array.isArray(dbUsers)) {
        dbUsers.forEach(item => {
          if (item.email) {
            usersMap.set(item.email.toLowerCase(), {
              id: item.id,
              email: item.email,
              fullName: item.full_name || item.email.split('@')[0],
              phone: item.phone || '-',
              address: item.address || '-',
              role: item.role || 'customer',
              date: new Date(item.created_at || Date.now()).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
            });
          }
        });
      }

      // 2. Cross-check with public.orders table for any user emails
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('user_email, client_name, customer_phone, created_at')
        .not('user_email', 'is', null);

      if (dbOrders && Array.isArray(dbOrders)) {
        dbOrders.forEach(ord => {
          if (ord.user_email && !usersMap.has(ord.user_email.toLowerCase())) {
            usersMap.set(ord.user_email.toLowerCase(), {
              id: `usr_${Math.random().toString(36).substr(2, 9)}`,
              email: ord.user_email,
              fullName: ord.client_name || ord.user_email.split('@')[0],
              phone: ord.customer_phone || '-',
              address: '-',
              role: 'customer',
              date: new Date(ord.created_at || Date.now()).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
            });
          }
        });
      }
    } catch (err) {
      console.warn('Supabase getUsersFromSupabase error:', err);
    }
  }

  // 3. Fallback to local session if present
  if (typeof window !== 'undefined') {
    try {
      const localUser = JSON.parse(localStorage.getItem('ayezz_user_session') || 'null');
      if (localUser && localUser.email && !usersMap.has(localUser.email.toLowerCase())) {
        usersMap.set(localUser.email.toLowerCase(), {
          id: localUser.id || 'usr_1',
          email: localUser.email,
          fullName: localUser.fullName || localUser.email.split('@')[0],
          phone: localUser.phone || '-',
          address: localUser.address || '-',
          role: 'customer',
          date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
        });
      }
    } catch (e) {}
  }

  return Array.from(usersMap.values());
}

export async function deleteUserFromSupabase(userId) {
  if (!isSupabaseConnected || !userId) return;
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch (err) {
    console.error('Error deleting user from Supabase:', err);
  }
}

export async function updateUserRoleInSupabase(userId, newRole) {
  if (!isSupabaseConnected || !userId) return;
  try {
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
  } catch (err) {
    console.error('Error updating user role in Supabase:', err);
  }
}

// ==========================================
// 7. SHOWCASE FEATURE (Apple "Lihat lebih dekat." Banner Manager)
// ==========================================
export const DEFAULT_SHOWCASE_FEATURE = {
  id: 'showcase_default',
  sectionTitle: 'Koleksi Produk Utama',
  headline: 'Pengeluaran Cetakan Sublimasi AYEZZ GLOBAL',
  subHeadline: 'Pilihan seragam custom berkualiti standard kilang.',
  coverImage: PLACEHOLDER_IMAGE,
  buttonText: 'Tonton Video',
  videoUrl: '',
  isActive: false
};

export async function getShowcaseFeatureFromSupabase() {
  if (!isSupabaseConnected) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ayezz_showcase_feature');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_SHOWCASE_FEATURE;
  }

  try {
    const { data } = await supabase.from('showcase_feature').select('*').limit(1).maybeSingle();
    if (data) {
      return {
        id: data.id || 'showcase_default',
        sectionTitle: data.section_title || data.sectionTitle || DEFAULT_SHOWCASE_FEATURE.sectionTitle,
        headline: data.headline || DEFAULT_SHOWCASE_FEATURE.headline,
        subHeadline: data.sub_headline || data.subHeadline || DEFAULT_SHOWCASE_FEATURE.subHeadline,
        coverImage: data.cover_image || data.coverImage || DEFAULT_SHOWCASE_FEATURE.coverImage,
        buttonText: data.button_text || data.buttonText || DEFAULT_SHOWCASE_FEATURE.buttonText,
        videoUrl: data.video_url || data.videoUrl || DEFAULT_SHOWCASE_FEATURE.videoUrl,
        isActive: data.is_active !== undefined ? data.is_active : true
      };
    }
  } catch (err) {
    console.warn('Supabase getShowcaseFeature error:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ayezz_showcase_feature');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
  }
  return DEFAULT_SHOWCASE_FEATURE;
}

export async function saveShowcaseFeatureToSupabase(payload) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ayezz_showcase_feature', JSON.stringify(payload));
    } catch (e) {}
  }

  if (!isSupabaseConnected) return payload;

  try {
    const dbPayload = {
      id: payload.id || 'showcase_default',
      section_title: payload.sectionTitle,
      headline: payload.headline,
      sub_headline: payload.subHeadline,
      cover_image: payload.coverImage,
      button_text: payload.buttonText,
      video_url: payload.videoUrl,
      is_active: payload.isActive,
      updated_at: new Date().toISOString()
    };
    await supabase.from('showcase_feature').upsert([dbPayload], { onConflict: 'id' });
  } catch (err) {
    console.warn('Error saving showcase feature to Supabase:', err);
  }
  return payload;
}
