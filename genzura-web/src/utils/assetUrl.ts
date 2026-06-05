/**
 * Resolves an asset URL (avatar, document, etc.) to an absolute URL.
 *
 * Strategy:
 * - If the URL is already absolute (starts with http/https), return it unchanged.
 *   (e.g. an external URL, though we avoid storing full S3 URLs for private buckets)
 * - If the URL is a relative /uploads/... path, route it through the API server.
 *   The API server's /uploads/avatars/:filename endpoint generates S3 presigned URLs
 *   and redirects the browser, so the image loads even from a private S3 bucket.
 *
 * This fixes the production issue where the frontend (Vercel) and API (Render) are
 * on different domains — without this, a relative /uploads/... path resolves to
 * the Vercel domain which has no /uploads route, giving a 404.
 */
export function resolveAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Already an absolute URL — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative path (e.g. /uploads/avatars/photo.png) — route through the API server
  // so the backend's presigned URL redirect works in all environments.
  //
  // VITE_API_URL is e.g. "https://your-api.onrender.com/api"
  // Strip the trailing "/api" to get the base origin for /uploads/* routes.
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

  return `${apiOrigin}${url}`;
}
