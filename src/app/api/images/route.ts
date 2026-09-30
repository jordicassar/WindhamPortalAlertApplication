import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/dal';
import { db } from '@/lib/db';

// Hosts cap request bodies (Vercel: 4.5 MB); the editor downsizes photos before upload.
const MAX_BYTES = 4 * 1024 * 1024;

/** Identify the real file type from its first bytes, not from what the browser claims. */
function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (starts([0x47, 0x49, 0x46, 0x38])) return 'image/gif';
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  return null;
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: 'Sign in to upload photos.' }, { status: 401 });
  }

  const file = (await request.formData()).get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photos must be 4 MB or smaller.' }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageType(bytes);
  if (!mimeType) {
    return NextResponse.json({ error: 'Upload a PNG, JPEG, GIF or WebP image.' }, { status: 415 });
  }

  const image = await db.image.create({
    data: { mimeType, size: bytes.length, data: bytes, uploadedById: user.id },
    select: { id: true },
  });
  return NextResponse.json({ url: `/api/images/${image.id}` }, { status: 201 });
}
