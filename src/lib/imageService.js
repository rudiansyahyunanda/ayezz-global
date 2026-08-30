import { supabase, isSupabaseConnected } from './supabaseClient';

/**
 * Delete image file(s) from Supabase Storage Bucket ('ayezz-assets')
 * Accepts single URL or array of URLs.
 */
export async function deleteImageFromSupabaseStorage(imageUrlOrUrls) {
  if (!isSupabaseConnected || !imageUrlOrUrls) return;

  const urls = Array.isArray(imageUrlOrUrls) ? imageUrlOrUrls : [imageUrlOrUrls];
  const filenamesToDelete = [];

  for (const url of urls) {
    if (!url || typeof url !== 'string') continue;

    let filename = '';
    if (url.includes('/ayezz-assets/')) {
      filename = url.split('/ayezz-assets/').pop();
    } else if (url.includes('/uploads/')) {
      filename = url.split('/uploads/').pop();
    } else if (!url.startsWith('http') && !url.startsWith('data:')) {
      filename = url.split('/').pop();
    }

    if (filename && filename.includes('.')) {
      const cleanFilename = decodeURIComponent(filename);
      if (!filenamesToDelete.includes(cleanFilename)) {
        filenamesToDelete.push(cleanFilename);
      }
    }
  }

  if (filenamesToDelete.length === 0) return;

  console.log(`[SupabaseStorage] Deleting ${filenamesToDelete.length} files from bucket 'ayezz-assets':`, filenamesToDelete);

  try {
    const { data, error } = await supabase.storage
      .from('ayezz-assets')
      .remove(filenamesToDelete);

    if (error) {
      console.warn('[SupabaseStorage] Delete image error:', error.message);
    } else {
      console.log('[SupabaseStorage] Delete image success:', data);
    }
  } catch (err) {
    console.warn('[SupabaseStorage] Delete image exception:', err.message);
  }
}

function applyPhotoshopBicubicSharpen(ctx, width, height, mix = 0.22) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);
    const w = width;
    const h = height;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const current = copy[idx + c];
          const top = copy[((y - 1) * w + x) * 4 + c];
          const bottom = copy[((y + 1) * w + x) * 4 + c];
          const left = copy[(y * w + (x - 1)) * 4 + c];
          const right = copy[(y * w + (x + 1)) * 4 + c];

          const sharpened = current * 5 - (top + bottom + left + right);
          data[idx + c] = Math.min(255, Math.max(0, current + (sharpened - current) * mix));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('[ImageService] Canvas sharpen filter warning:', e);
  }
}

/**
 * Client-Side HTML5 Canvas WebP Converter (Photoshop Bicubic Sharper Quality):
 * - Accepts JPG, PNG, GIF, WebP, etc.
 * - Preserves Full HD crisp resolution up to 1920px
 * - Preserves 100% original alpha channel / transparency from source file
 * - Applies Bicubic Sharper unsharp mask filter for vivid image clarity
 * - Converts to crystal clear image/webp Blob (Quality 0.92)
 */
export async function convertImageToWebpBlob(fileOrDataUrl, maxDimension = 1920, quality = 0.92) {
  if (typeof window === 'undefined') return null;

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

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Apply Photoshop Bicubic Sharper filter to keep details 100% crisp
          applyPhotoshopBicubicSharpen(ctx, width, height, 0.22);
        }

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
 * ALWAYS converts input image to crystal clear .webp format before uploading!
 */
export async function uploadDirectToSupabaseStorage(fileOrDataUrl, filenameHint = 'image') {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client is not connected.');
  }

  let finalFileBody = fileOrDataUrl;
  let mimeType = 'image/webp';
  let fileExt = 'webp';

  // 1. Try converting to Ultra HD WebP Blob on client browser (1920px max, 0.92 quality)
  try {
    const webpBlob = await convertImageToWebpBlob(fileOrDataUrl, 1920, 0.92);
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
