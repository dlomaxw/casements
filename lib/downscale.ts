/**
 * Client-side image downscaling, run before upload.
 *
 * Vercel serverless functions reject request bodies over ~4.5MB at the platform
 * level, before our route ever runs — so a photo straight off a phone (commonly
 * 3–12MB) fails with an opaque error no matter what the route's own size check
 * says. Shrinking in the browser sidesteps that, and keeps page weight down:
 * nothing on the site is displayed wider than about 1600px anyway.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;
/** Files at or under this are already web-sized; upload them untouched. */
const SKIP_BELOW = 600 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

export async function downscaleImage(file: File): Promise<File> {
  // SVGs are vectors and GIFs may be animated — canvas would destroy both.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size <= SKIP_BELOW) return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));

    // Already small enough in both dimensions and reasonably sized on disk.
    if (scale === 1 && file.size <= 2 * 1024 * 1024) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // Flatten onto white: JPEG has no alpha, and without this a transparent
    // PNG comes out with a black background.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file; // no gain — keep the original

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Never block an upload because resizing failed.
    return file;
  }
}
