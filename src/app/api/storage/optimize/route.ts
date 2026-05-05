/**
 * Image Optimization API
 * Resizes & converts uploaded images to WebP for faster loading
 *
 * Setup: npm install sharp
 * Usage: POST /api/storage/optimize { bucket, path, hotelId }
 *
 * Returns: { optimized: [{ size, url }] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireHotelAccess } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/server';

const SIZES = [
  { name: 'thumbnail', width: 400,  quality: 75 },
  { name: 'medium',    width: 800,  quality: 80 },
  { name: 'large',     width: 1600, quality: 85 },
];

export async function POST(request: NextRequest) {
  const { hotelId, bucket = 'hotel-assets', path: imagePath } = await request.json();

  const ctx = await requireHotelAccess(hotelId, ['owner', 'admin', 'manager']);
  if (ctx.error) return ctx.error;

  const admin = createAdminClient();

  // Download original
  const { data: originalData, error: dlErr } = await admin.storage
    .from(bucket).download(imagePath);
  if (dlErr || !originalData) {
    return NextResponse.json({ error: 'ไม่พบไฟล์ต้นฉบับ' }, { status: 404 });
  }

  // Try to use sharp if installed
  let sharp: any;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    return NextResponse.json({
      error: 'sharp is not installed',
      message: 'Run: npm install sharp — then redeploy',
      fallback: 'Original image is used without optimization',
    }, { status: 501 });
  }

  const buffer     = Buffer.from(await originalData.arrayBuffer());
  const basePath   = imagePath.replace(/\.[^.]+$/, '');
  const results: { size: string; url: string; bytes: number }[] = [];

  for (const size of SIZES) {
    const optimized = await sharp(buffer)
      .resize(size.width, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: size.quality })
      .toBuffer();

    const outPath = `${basePath}_${size.name}.webp`;

    const { error: upErr } = await admin.storage
      .from(bucket).upload(outPath, optimized, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!upErr) {
      const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(outPath);
      results.push({ size: size.name, url: publicUrl, bytes: optimized.length });
    }
  }

  return NextResponse.json({
    success: true,
    original: imagePath,
    optimized: results,
    savings: `${results.length} variants generated`,
  });
}
