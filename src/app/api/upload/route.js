import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConnected } from '../../../lib/supabaseClient';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const dataUrl = formData.get('dataUrl');
    const customWidth = formData.get('width');
    const customHeight = formData.get('height');
    const dbTable = formData.get('table');
    const dbRecordId = formData.get('recordId') || formData.get('id');
    const dbColumn = formData.get('column') || 'thumbnail';

    let inputBuffer = null;
    let originalName = 'image';

    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer();
      inputBuffer = Buffer.from(bytes);
      originalName = file.name || 'uploaded_image';
    } else if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
      const base64Data = dataUrl.split(',')[1];
      inputBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!inputBuffer) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file gambar atau DataURL yang sah diterima.' },
        { status: 400 }
      );
    }

    // Target dimensions (maintain aspect ratio)
    const maxWidth = customWidth ? parseInt(customWidth, 10) : 1200;
    const maxHeight = customHeight ? parseInt(customHeight, 10) : 1200;

    // Process image using Sharp library:
    // 1. Preserve Alpha Channel (transparansi PNG) with alphaQuality: 100
    // 2. Resize proportionally preserving aspect ratio (fit: 'inside', withoutEnlargement: true)
    // 3. Convert to WebP format for optimal file size and crisp quality
    const processedWebpBuffer = await sharp(inputBuffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 85,
        alphaQuality: 100,
        lossless: false
      })
      .toBuffer();

    // Get metadata of processed image
    const metadata = await sharp(processedWebpBuffer).metadata();

    // Generate unique WebP filename
    const safeBaseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${safeBaseName}_${timestamp}_${randomSuffix}.webp`;

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save processed WebP file to public/uploads
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, processedWebpBuffer);

    // Public URL accessible via browser
    const publicUrl = `/uploads/${filename}`;

    // Optional: Persist to Supabase Database if table and record ID are specified
    let dbStatus = null;
    if (dbTable && dbRecordId && isSupabaseConnected) {
      try {
        const { error: dbError } = await supabase
          .from(dbTable)
          .update({ [dbColumn]: publicUrl })
          .eq('id', dbRecordId);

        if (dbError) {
          console.warn('Supabase DB auto-update notice:', dbError);
          dbStatus = { updated: false, error: dbError.message };
        } else {
          dbStatus = { updated: true, table: dbTable, recordId: dbRecordId, column: dbColumn };
        }
      } catch (err) {
        console.warn('Supabase DB auto-update exception:', err);
        dbStatus = { updated: false, error: err.message };
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      sizeBytes: processedWebpBuffer.length,
      width: metadata.width,
      height: metadata.height,
      format: 'webp',
      dbStatus
    });
  } catch (error) {
    console.error('Server-side Sharp image processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Ralat pemrosesan gambar di server: ' + error.message },
      { status: 500 }
    );
  }
}
