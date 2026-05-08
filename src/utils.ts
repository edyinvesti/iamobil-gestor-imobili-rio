/**
 * Returns the base URL of the backend API.
 */
export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || 'https://iamobil-cloud-1.onrender.com';
}

/**
 * Resolves an image path to a full URL.
 * If the path is already a full URL (http/https) or a base64 data URI, it returns as-is.
 * If it's a relative path (e.g., /properties/img.jpg), prepends the API base URL.
 */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Relative path from backend static files
  const base = getApiUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
