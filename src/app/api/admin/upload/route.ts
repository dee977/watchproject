import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, canManageProducts } from '@/lib/auth';
import { getSupabaseOrigin, getSupabaseStorageBucket, getProductImageUrl } from '@/lib/images';

export const dynamic = 'force-dynamic';

function sanitizeFilename(originalName: string): string {
  const clean = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
  const ext = clean.includes('.') ? clean.split('.').pop() : 'jpg';
  const base = clean.includes('.') ? clean.substring(0, clean.lastIndexOf('.')) : clean;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `watch_${timestamp}_${random}.${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const filename = sanitizeFilename(file.name || 'image.jpg');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const origin = getSupabaseOrigin();
    const bucket = getSupabaseStorageBucket();

    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Upload to Supabase Storage REST endpoint
    const uploadUrl = `${origin}/storage/v1/object/${bucket}/${filename}`;
    const uploadHeaders: Record<string, string> = {
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'true',
    };

    if (apiKey) {
      uploadHeaders['Authorization'] = `Bearer ${apiKey}`;
      uploadHeaders['apikey'] = apiKey;
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: buffer,
    });

    if (!uploadRes.ok && uploadRes.status !== 200 && uploadRes.status !== 201) {
      const errText = await uploadRes.text().catch(() => '');
      console.warn(`Supabase Storage upload returned ${uploadRes.status}: ${errText}`);
    }

    const publicUrl = `${origin}/storage/v1/object/public/${bucket}/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}
