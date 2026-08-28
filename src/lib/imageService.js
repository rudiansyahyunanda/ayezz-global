/**
 * Upload and process image on server-side using Sharp:
 * - Resizes image while maintaining aspect ratio
 * - Converts raw format to optimized WebP
 * - Preserves full PNG alpha channel / transparency
 * - Returns WebP public URL and optionally saves to Supabase database
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

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status} upload error`);
    }

    const data = await response.json();
    if (!data.success || !data.url) {
      throw new Error(data.message || 'Gagal memproses gambar di server-side.');
    }

    return {
      success: true,
      url: data.url,
      filename: data.filename,
      sizeBytes: data.sizeBytes,
      width: data.width,
      height: data.height,
      dbStatus: data.dbStatus
    };
  } catch (err) {
    console.error('uploadAndProcessImageServerSide exception:', err);
    throw err;
  }
}
