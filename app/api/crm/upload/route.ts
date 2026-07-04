import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';

export const runtime = 'nodejs';

// POST /api/crm/upload — multipart file upload to Vercel Blob. Requires manage_media.
// Falls back to a clear error if BLOB_READ_WRITE_TOKEN isn't configured yet.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_media')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: 'File too large (max 8MB)' }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  let blob;
  try {
    blob = await put(`casements/${Date.now()}-${safeName}`, file, {
      access: 'public',
      contentType: file.type || undefined,
      // Explicit token when provided; otherwise the SDK uses the linked store.
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (err) {
    console.error('[upload] Vercel Blob error:', err);
    return Response.json(
      {
        error:
          'Image storage is not fully configured. Connect a public Vercel Blob store to this project (or paste an image URL instead).',
      },
      { status: 400 },
    );
  }

  const media = await prisma.media.create({
    data: {
      url: blob.url,
      filename: file.name,
      contentType: file.type || null,
      uploadedById: session.user.id,
    },
  });

  return Response.json({ success: true, url: media.url, media });
}
