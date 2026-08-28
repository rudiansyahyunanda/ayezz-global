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

/**
 * Automatically removes solid white / light background box from image canvas,
 * making the jersey float seamlessly on transparent background!
 */
export function stripSolidBackgroundFromCanvas(ctx, width, height) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample the 4 corner pixels
    const corners = [
      0,
      (width - 1) * 4,
      (height - 1) * width * 4,
      ((height - 1) * width + (width - 1)) * 4
    ];

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (const idx of corners) {
      if (data[idx + 3] > 0) {
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
    }

    if (count === 0) return; // Already transparent!

    const bgR = rSum / count;
    const bgG = gSum / count;
    const bgB = bSum / count;

    // Check if background is solid light/white
    const isLightBg = bgR > 215 && bgG > 215 && bgB > 215;

    if (isLightBg) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0) {
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist < 32) {
            if (dist < 15) {
              data[i + 3] = 0; // Fully transparent
            } else {
              data[i + 3] = Math.round(((dist - 15) / 17) * a); // Smooth edge fade
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } catch (err) {
    console.warn('[ImageService] Auto background stripping warning:', err);
  }
}

/**
 * Client-Side HTML5 Canvas WebP Converter:
 * - Accepts JPG, PNG, GIF, WebP, etc.
 * - Preserves Full HD crisp resolution up to 1920px
 * - Automatically strips solid white/light background box so jersey floats 100% transparently
 * - Converts to crystal clear image/webp Blob (Quality 0.92)
 */
export async function convertImageToWebpBlob(fileOrDataUrl, maxDimension = 1920, quality = 0.92) {
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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Strip solid white background box automatically!
        stripSolidBackgroundFromCanvas(ctx, width, height);

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
 * ALWAYS converts input image to crystal clear transparent .webp format before uploading!
 */
export async function uploadDirectToSupabaseStorage(fileOrDataUrl, filenameHint = 'image') {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client is not connected.');
  }

  let finalFileBody = fileOrDataUrl;
  let mimeType = 'image/webp';
  let fileExt = 'webp';

  // 1. Try converting to Ultra HD Transparent WebP Blob on client browser (1920px max, 0.92 quality)
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

  console.log(`[SupabaseStorage] Uploading Transparent WebP ${filename} to bucket 'ayezz-assets'...`);

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
