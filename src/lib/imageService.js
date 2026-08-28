import { supabase, isSupabaseConnected } from './supabaseClient';

/**
 * Upload image directly to Supabase Storage Bucket ('ayezz-assets')
 * Works seamlessly in client-side browser and server environments.
 */
export async function uploadDirectToSupabaseStorage(fileOrDataUrl, filenameHint = 'image') {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client is not connected.');
  }

  let fileBody = fileOrDataUrl;
  let mimeType = 'image/png';
  let fileExt = 'png';

  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
    const parts = fileOrDataUrl.split(',');
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
    fileExt = mimeType.split('/')[1] || 'png';
    if (fileExt === 'jpeg') fileExt = 'jpg';

    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    fileBody = new Blob([ab], { type: mimeType });
  } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
    mimeType = fileOrDataUrl.type || 'image/png';
    fileExt = fileOrDataUrl.name ? fileOrDataUrl.name.split('.').pop() : 'png';
  } else {
    throw new Error('Input file atau dataURL tidak sah.');
  }

  const safeName = String(filenameHint).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `${safeName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  console.log(`[SupabaseStorage] Direct uploading ${filename} to bucket 'ayezz-assets'...`);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ayezz-assets')
    .upload(filename, fileBody, {
      contentType: mimeType,
      upsert: true
    });

  if (uploadError) {
    console.error('[SupabaseStorage] Direct Upload Error:', uploadError);
    throw new Error(`Gagal memuat naik ke Supabase Storage: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('ayezz-assets')
    .getPublicUrl(filename);

  const finalPublicUrl = publicUrlData?.publicUrl;
  console.log(`[SupabaseStorage] Success! Public URL: ${finalPublicUrl}`);

  return finalPublicUrl;
}

/**
 * Upload and process image using Sharp API with direct Supabase Storage fallback
 */
export async function uploadAndProcessImageServerSide(fileOrDataUrl, options = {}) {
  try {
    const formData = new FormData();

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
      formData.append('dataUrl', fileOrDataUrl);
    } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      formData.append('file', fileOrDataUrl);
    } else {
      throw new Error('Input bukan merupakan File atau DataURL gambar yang sah.');
    }

    if (options.width) formData.append('width', String(options.width));
    if (options.height) formData.append('height', String(options.height));
    if (options.table) formData.append('table', options.table);
    if (options.recordId || options.id) formData.append('recordId', options.recordId || options.id);
    if (options.column) formData.append('column', options.column);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          filename: data.filename,
          sizeBytes: data.sizeBytes,
          width: data.width,
          height: data.height,
          dbStatus: data.dbStatus
        };
      }
    }
  } catch (err) {
    console.warn('[ImageService] /api/upload error, switching to direct Supabase Storage upload:', err.message);
  }

  // Fallback to direct client-side Supabase Storage Bucket upload!
  try {
    const publicUrl = await uploadDirectToSupabaseStorage(fileOrDataUrl, 'img');
    return {
      success: true,
      url: publicUrl
    };
  } catch (directErr) {
    console.error('[ImageService] Direct Supabase Storage fallback failed:', directErr);
    throw directErr;
  }
}
