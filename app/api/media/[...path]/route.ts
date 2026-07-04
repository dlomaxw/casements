import { get } from '@vercel/blob';

export const runtime = 'nodejs';

// Public proxy that streams images from the (private) Vercel Blob store.
// These are website/blog images meant to be public, so no auth — but they live
// in a private store, so we fetch them server-side and serve with CDN caching.
export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const pathname = params.path.map((p) => decodeURIComponent(p)).join('/');
  if (!pathname) return new Response('Not found', { status: 404 });

  let result;
  try {
    result = await get(pathname, { access: 'private' });
  } catch (err) {
    console.error('[media] blob get error:', err);
    return new Response('Not found', { status: 404 });
  }
  if (!result) return new Response('Not found', { status: 404 });

  return new Response(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      // Pathnames are unique (timestamped) so the asset is immutable — cache hard.
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
