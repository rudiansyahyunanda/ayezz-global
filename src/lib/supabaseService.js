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
    let query = supabase.from('sub_categories').select('*');
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    const { data, error } = await query.order('code', { ascending: true });
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
  if (!isSupabaseConnected || !template) return { success: false };
  const rawList = Array.isArray(template?.images) && template.images.length > 0
    ? template.images
    : (template?.thumbnail ? [template.thumbnail] : [PLACEHOLDER_IMAGE]);
  
  const cloudList = [];
  for (let i = 0; i < rawList.length; i++) {
    const cloudUrl = await ensureSupabaseCloudImageUrl(rawList[i], `${template.name || 'tpl'}_${i + 1}`);
    cloudList.push(cloudUrl);
  }
  
  const payloadWithImages = {
    id: template.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: template.name,
    category: template.category || 'SUBLIMASI',
    sub_category: template.subCategory || '',
    description: template.description || '',
    thumbnail: cloudList[0] || PLACEHOLDER_IMAGE,
    images: cloudList
  };

  try {
    const { error } = await supabase.from('design_templates').upsert([payloadWithImages], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase insertDesignTemplate error with images column:', error);
      if (error.code === 'PGRST204' || (error.message && error.message.includes('images'))) {
        const { images, ...payloadWithoutImages } = payloadWithImages;
        const { error: fallbackErr } = await supabase.from('design_templates').upsert([payloadWithoutImages], { onConflict: 'id' });
        if (fallbackErr) {
          console.error('Supabase insertDesignTemplate fallback failed:', fallbackErr);
          return { success: false, error: fallbackErr.message };
        }
      } else {
        return { success: false, error: error.message };
      }
    }
    return { success: true, payload: payloadWithImages };
  } catch (err) {
    console.error('Supabase insertDesignTemplate exception:', err);
    return { success: false, error: err.message };
  }
}

export async function updateDesignTemplateInSupabase(templateId, updatedTpl) {
  if (!isSupabaseConnected) return { success: false };

  let targetId = templateId;
  let tplData = updatedTpl;

  if (typeof templateId === 'object' && templateId !== null && !updatedTpl) {
    tplData = templateId;
    targetId = templateId.id;
  }

  if (!targetId || !tplData) return { success: false };

  const rawList = Array.isArray(tplData?.images) && tplData.images.length > 0
    ? tplData.images
    : (tplData?.thumbnail ? [tplData.thumbnail] : [PLACEHOLDER_IMAGE]);

  const cloudList = [];
  for (let i = 0; i < rawList.length; i++) {
    const cloudUrl = await ensureSupabaseCloudImageUrl(rawList[i], `${tplData.name || 'tpl'}_${i + 1}`);
    cloudList.push(cloudUrl);
  }

  const payloadWithImages = {
    id: targetId,
    name: tplData.name,
    category: tplData.category || 'SUBLIMASI',
    sub_category: tplData.subCategory || '',
    description: tplData.description || '',
    thumbnail: cloudList[0] || PLACEHOLDER_IMAGE,
    images: cloudList
  };

  try {
    const { error } = await supabase.from('design_templates').upsert([payloadWithImages], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase updateDesignTemplate error with images column:', error);
      if (error.code === 'PGRST204' || (error.message && error.message.includes('images'))) {
        const { images, ...payloadWithoutImages } = payloadWithImages;
        const { error: fallbackErr } = await supabase.from('design_templates').upsert([payloadWithoutImages], { onConflict: 'id' });
        if (fallbackErr) {
          console.error('Supabase updateDesignTemplate fallback failed:', fallbackErr);
          return { success: false, error: fallbackErr.message };
        }
      } else {
        return { success: false, error: error.message };
      }
    }
    return { success: true, payload: payloadWithImages };
  } catch (err) {
    console.error('Supabase updateDesignTemplate exception:', err);
    return { success: false, error: err.message };
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
      date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-MY'),
      status: item.status || 'Pesanan Diterima'
    }));
  } catch (err) {
    console.warn('Supabase getOrdersFromSupabase error:', err);
    return [];
  }
}

export async function getUserOrdersFromSupabase(userEmail) {
  if (isSupabaseConnected) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (userEmail && userEmail !== 'pelanggan@ayezz.com') {
        query = query.eq('user_email', userEmail);
      }
      const { data, error } = await query;
      
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          orderId: item.id,
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
          notes: item.notes || '',
          sizeBreakdown: item.size_breakdown || {},
          qty: item.total_qty || 1,
          unitPrice: item.unit_price || 70,
          totalPrice: item.total_price || 70,
          total: `RM ${Number(item.total_price || 0).toFixed(2)}`,
          paymentStatus: (item.status || '').includes('Lunas') ? 'paid' : 'pending',
          date: new Date(item.created_at || Date.now()).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: item.status || 'Pesanan Diterima'
        }));
      }
    } catch (err) {
      console.warn('Supabase getUserOrders error:', err);
    }
  }

  // Fallback checking local storage
  if (typeof window !== 'undefined') {
    try {
      const localOrders = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      if (userEmail && userEmail !== 'pelanggan@ayezz.com') {
        return localOrders.filter(o => o.userEmail === userEmail || !o.userEmail);
      }
      return localOrders;
    } catch (e) {
      return [];
    }
  }

  return [];
}


export async function saveOrderToSupabase(orderData) {
  const generatedOrderId = orderData.orderId || orderData.id || orderData.order_id || `AYZ-${Math.floor(100000 + Math.random() * 900000)}`;
  const userEmail = orderData.userEmail || orderData.user_email || orderData.email || '';
  const clientName = orderData.clientName || orderData.client_name || orderData.client || 'Pelanggan Sistem';
  const customerPhone = orderData.customerPhone || orderData.customer_phone || '';
  const teamName = orderData.teamName || orderData.team_name || '';

  // 1. Auto-upload base64 logo images directly to Supabase Cloud Storage
  let cloudCustomLogo = orderData.customLogoUrl || orderData.custom_logo_url || '';
  if (cloudCustomLogo && cloudCustomLogo.startsWith('data:image/')) {
    cloudCustomLogo = await ensureSupabaseCloudImageUrl(cloudCustomLogo, `logo_pasukan_${generatedOrderId}`);
  }

  let cloudSponsorLogo = orderData.sponsorLogoUrl || orderData.sponsor_logo_url || '';
  if (cloudSponsorLogo && cloudSponsorLogo.startsWith('data:image/')) {
    cloudSponsorLogo = await ensureSupabaseCloudImageUrl(cloudSponsorLogo, `logo_sponsor_${generatedOrderId}`);
  }

  let cloudCustomLogo2 = orderData.customLogoUrl2 || orderData.custom_logo_url_2 || '';
  if (cloudCustomLogo2 && cloudCustomLogo2.startsWith('data:image/')) {
    cloudCustomLogo2 = await ensureSupabaseCloudImageUrl(cloudCustomLogo2, `logo_pasukan_2_${generatedOrderId}`);
  }

  let cloudDesignRef = orderData.customDesignRefUrl || orderData.custom_design_ref_url || '';
  if (cloudDesignRef && cloudDesignRef.startsWith('data:image/')) {
    cloudDesignRef = await ensureSupabaseCloudImageUrl(cloudDesignRef, `design_ref_${generatedOrderId}`);
  }

  let cloudPlayerFile = orderData.playerListFileUrl || orderData.player_list_file_url || '';

  // 2. Build rich size breakdown object that ALWAYS stores all metadata safely inside DB
  const rawSizeObj = orderData.sizeBreakdown || orderData.size_breakdown || {};
  let sizePayload = typeof rawSizeObj === 'object' && rawSizeObj !== null ? { ...rawSizeObj } : {};
  if (typeof rawSizeObj === 'string') {
    try { sizePayload = JSON.parse(rawSizeObj); } catch (e) {}
  }

  // Attach metadata keys to size_breakdown payload (prefixed with _)
  sizePayload._custom_logo_url = cloudCustomLogo;
  sizePayload._custom_logo_url_2 = cloudCustomLogo2;
  sizePayload._sponsor_logo_url = cloudSponsorLogo;
  sizePayload._custom_design_ref_url = cloudDesignRef;
  sizePayload._player_list_file_url = cloudPlayerFile;
  sizePayload._team_name = teamName;
  sizePayload._customer_phone = customerPhone;
  sizePayload._player_rows = orderData.playerRows || orderData.player_rows || [];
  sizePayload._notes = orderData.notes || '';
  sizePayload._has_pants = orderData.has_pants || false;
  sizePayload._pants_sync_mode = orderData.pants_sync_mode || '';
  sizePayload._team_logo_placement = orderData.team_logo_placement || '';
  sizePayload._pants_logo_placement = orderData.pants_logo_placement || '';
  sizePayload._player_list_sync_mode = orderData.player_list_sync_mode || '';

  // Essential payload using EXACT Supabase DB columns
  const essentialPayload = {
    id: generatedOrderId,
    user_email: userEmail,
    client_name: clientName,
    template_name: orderData.templateName || orderData.template || 'Template Reka Bentuk',
    cut_type: orderData.cutType || orderData.cut_type || 'Standard',
    fabric_material: orderData.fabricMaterial || orderData.fabric_material || 'Dry-Fit',
    size_breakdown: sizePayload,
    total_qty: Number(orderData.totalQty || orderData.total_qty || orderData.qty || 1),
    unit_price: Number(orderData.unitPrice || orderData.unit_price || 70),
    total_price: Number(orderData.totalPrice || orderData.total_price || 70),
    status: orderData.status || 'Pesanan Diterima'
  };

  // Full rich payload (if extra columns exist)
  const fullPayload = {
    ...essentialPayload,
    team_name: teamName,
    customer_phone: customerPhone,
    notes: orderData.notes || '',
    cut_groups: orderData.cutGroups || orderData.cut_groups || [],
    player_rows: orderData.playerRows || orderData.player_rows || [],
    custom_logo_url: cloudCustomLogo,
    sponsor_logo_url: cloudSponsorLogo,
    player_list_file_url: cloudPlayerFile
  };

  // Auto-sync user profile to public.users table
  if (userEmail) {
    try {
      await supabase.from('users').upsert([{
        email: userEmail,
        full_name: clientName,
        phone: customerPhone,
        role: 'customer'
      }], { onConflict: 'email' });
    } catch (e) {
      console.warn('Auto sync user to DB notice:', e);
    }
  }

  // Save local storage fallback
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ayezz_last_order_id', generatedOrderId);
      const existing = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      const newLocalOrder = {
        id: generatedOrderId,
        orderId: generatedOrderId,
        userEmail: userEmail,
        client: clientName,
        customerPhone: customerPhone,
        teamName: teamName,
        template: essentialPayload.template_name,
        cutType: essentialPayload.cut_type,
        fabricMaterial: essentialPayload.fabric_material,
        cutGroups: fullPayload.cut_groups,
        playerRows: fullPayload.player_rows,
        customLogoUrl: cloudCustomLogo,
        sponsorLogoUrl: cloudSponsorLogo,
        playerListFileUrl: cloudPlayerFile,
        notes: fullPayload.notes,
        sizeBreakdown: sizePayload,
        qty: essentialPayload.total_qty,
        unitPrice: essentialPayload.unit_price,
        totalPrice: essentialPayload.total_price,
        total: `RM ${Number(essentialPayload.total_price || 0).toFixed(2)}`,
        date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: essentialPayload.status
      };
      localStorage.setItem('ayezz_user_orders', JSON.stringify([newLocalOrder, ...existing.filter(o => o.id !== generatedOrderId)]));
    } catch (e) {}
  }

  if (!isSupabaseConnected) return { success: true, orderId: generatedOrderId };

  try {
    const { error: fullErr } = await supabase.from('orders').upsert([fullPayload], { onConflict: 'id' });
    if (fullErr) {
      console.warn('Full payload insert notice, trying essential payload:', fullErr.message);
      await supabase.from('orders').upsert([essentialPayload], { onConflict: 'id' });
    }
    return { success: true, orderId: generatedOrderId };
  } catch (err) {
    console.error('Error saving order to Supabase:', err);
    return { success: true, orderId: generatedOrderId };
  }
}

export async function updateOrderStatusInSupabase(orderId, newStatus) {
  if (!orderId) return;

  // Update local storage cache
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ayezz_user_orders') || '[]');
      const updated = existing.map(item => {
        if (item.id === orderId || item.orderId === orderId) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem('ayezz_user_orders', JSON.stringify(updated));
    } catch (e) {}
  }

  if (!isSupabaseConnected) return;

  try {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
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

// ==========================================
// 8. HERO SLIDES MANAGER
// ==========================================
export const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero_1',
    is_active: true,
    order_index: 0,
    slide_type: 'carousel',
    media_url: '',
    badge_text: 'KILANG SUBLIMASI HIGH-PERFORMANCE',
    headline_html: 'REKA BENTUK JERSI <br class="hidden sm:block" />\n<span class="text-neutral-400 font-extrabold tracking-normal">PAKAIAN CUSTOM</span>',
    description: 'Pilih daripada koleksi visual kategori di bawah. Pilih desain jersi, kustomisasikan jenis kolar dan kain sublimasi, dan proses tempahan terus secara dalam talian.'
  },
  {
    id: 'hero_2',
    is_active: true,
    order_index: 1,
    slide_type: 'video',
    media_url: '/hero-1.webm',
    badge_text: 'KUALITI PREMIUM ANTARABANGSA',
    headline_html: 'EVOLUSI <br class="hidden sm:block" />\n<span class="text-neutral-500 font-extrabold tracking-normal">PEMBUATAN JERSI</span>',
    description: 'Kami membawa evolusi dalam pembuatan jersi dengan kualiti cetakan dan fabrik bertaraf antarabangsa. Saksikan proses kilang kami yang berteknologi tinggi.'
  }
];

export async function getHeroSlidesFromSupabase() {
  if (!isSupabaseConnected) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ayezz_hero_slides');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_HERO_SLIDES;
  }
  try {
    const { data, error } = await supabase.from('hero_slides').select('*').order('order_index', { ascending: true });
    if (error || !data || data.length === 0) {
       return DEFAULT_HERO_SLIDES;
    }
    return data;
  } catch (err) {
    console.warn('Supabase getHeroSlides error:', err);
    return DEFAULT_HERO_SLIDES;
  }
}

export async function saveHeroSlideToSupabase(slide) {
  if (typeof window !== 'undefined' && !isSupabaseConnected) {
    try {
      const stored = localStorage.getItem('ayezz_hero_slides');
      let slides = stored ? JSON.parse(stored) : DEFAULT_HERO_SLIDES;
      const idx = slides.findIndex(s => s.id === slide.id);
      if (idx >= 0) slides[idx] = slide;
      else slides.push(slide);
      localStorage.setItem('ayezz_hero_slides', JSON.stringify(slides));
    } catch(e) {}
    return slide;
  }
  
  let mediaUrl = slide.media_url;
  if (mediaUrl && mediaUrl.startsWith('data:')) {
    mediaUrl = await ensureSupabaseCloudImageUrl(mediaUrl, `hero_${Date.now()}`);
  }

  const payload = {
    id: slide.id || `hero_${Date.now()}`,
    is_active: slide.is_active !== undefined ? slide.is_active : true,
    order_index: slide.order_index || 0,
    slide_type: slide.slide_type || 'video',
    media_url: mediaUrl,
    badge_text: slide.badge_text || '',
    headline_html: slide.headline_html || '',
    description: slide.description || '',
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('hero_slides').upsert([payload], { onConflict: 'id' });
    if (error) console.error('saveHeroSlideToSupabase error:', error);
    return payload;
  } catch (err) {
    console.error('saveHeroSlideToSupabase exception:', err);
    return null;
  }
}

export async function deleteHeroSlideFromSupabase(slideId) {
  if (!isSupabaseConnected || !slideId) return;
  try {
    const { data } = await supabase.from('hero_slides').select('media_url').eq('id', slideId).single();
    if (data && data.media_url && data.media_url.includes('ayezz-assets')) {
      await deleteImageFromSupabaseStorage(data.media_url);
    }
    await supabase.from('hero_slides').delete().eq('id', slideId);
  } catch (err) {
    console.error('deleteHeroSlideFromSupabase error:', err);
  }
}
