import { z } from 'zod';

/**
 * Shared zod pieces for URL-ish fields.
 *
 * Uploads via /api/crm/upload return a site-relative path (`/api/media/…`),
 * not an absolute URL, so any field that can hold an uploaded asset has to
 * accept both forms — validating it with `z.string().url()` alone rejects
 * every image the media library produces.
 */

/** An uploaded media path, an absolute URL, or empty. */
export const mediaUrl = z.union([
  z.literal(''),
  z.string().regex(/^\/[^\s]*$/, 'Must be an uploaded file or a full URL'),
  z.string().url(),
]);

/** An external link (YouTube, Vimeo, Drive…) or empty. */
export const externalUrl = z.union([z.literal(''), z.string().url('Must be a full URL, e.g. https://…')]);
