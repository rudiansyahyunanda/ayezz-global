import { supabase, isSupabaseConnected } from './supabaseClient';

/**
 * Client-Side HTML5 Canvas WebP Converter:
 * - Accepts JPG, PNG, GIF, WebP, etc.
 * - Resizes proportionally to maxDimension (default 800px)
 * - Converts to optimized image/webp Blob (~15KB - 35KB)
 */
export async function convertImageToWebpBlob(fileOrDataUrl, maxDimension = 800, quality = 0.8) {
  if (typeof window === 'undefined') return null; // Server environment fallback

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(null);
            }
          },
          'image/webp',
          quality
        );
      } catch (err) {
        console.warn('[ImageService] Canvas convertToWebp exception:', err);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      img.src = URL.createObjectURL(fileOrDataUrl);
    } else {
      resolve(null);
    }
  });
}

/**
 * Upload image directly to Supabase Storage Bucket ('ayezz-assets')
 * ALWAYS converts input image to .webp format before uploading!
 */
export async function uploadDirectToSupabaseStorage(fileOrDataUrl, filenameHint = 'image') {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client is not connected.');
  }

  let finalFileBody = fileOrDataUrl;
  let mimeType = 'image/webp';
  let fileExt = 'webp';

  // 1. Try converting to WebP Blob on client browser
  try {
    const webpBlob = await convertImageToWebpBlob(fileOrDataUrl, 800, 0.8);
    if (webpBlob && webpBlob.size > 0) {
      finalFileBody = webpBlob;
      mimeType = 'image/webp';
      fileExt = 'webp';
    }
  } catch (convErr) {
    console.warn('[ImageService] Client webp conversion warning:', convErr);
  }

  // 2. Base64 fallback parsing if conversion was skipped
  if (!(finalFileBody instanceof Blob) && typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
    const parts = fileOrDataUrl.split(',');
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
    fileExt = mimeType.split('/')[1] || 'webp';
    if (fileExt === 'jpeg') fileExt = 'jpg';

    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    finalFileBody = new Blob([ab], { type: mimeType });
  }

  const safeName = String(filenameHint).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `${safeName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  console.log(`[SupabaseStorage] Uploading WebP ${filename} to bucket 'ayezz-assets'...`);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ayezz-assets')
    .upload(filename, finalFileBody, {
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
  console.log(`[SupabaseStorage] Success! Public WebP URL: ${finalPublicUrl}`);

  return finalPublicUrl;
}

/**
 * Upload and process image using Sharp API with direct WebP Supabase Storage fallback
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
    console.warn('[ImageService] /api/upload error, switching to direct WebP Supabase Storage upload:', err.message);
  }

  // Fallback to direct client-side WebP Supabase Storage Bucket upload!
  try {
    const publicUrl = await uploadDirectToSupabaseStorage(fileOrDataUrl, 'img');
    return {
      success: true,
      url: publicUrl
    };
  } catch (directErr) {
    console.error('[ImageService] Direct WebP Supabase Storage fallback failed:', directErr);
    throw directErr;
  }
}
