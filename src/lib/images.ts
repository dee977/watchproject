const DEFAULT_SUPABASE_ORIGIN = 'https://regucynzyykcqhjvreiw.supabase.co';
const DEFAULT_STORAGE_BUCKET = 'image';

export function getSupabaseOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    try {
      const parsed = new URL(envUrl.trim());
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // ignore
    }
  }
  return DEFAULT_SUPABASE_ORIGIN;
}

export function getSupabaseStorageBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET;
}

export const SUPABASE_STORAGE_BASE_URL = `${getSupabaseOrigin()}/storage/v1/object/public/${getSupabaseStorageBucket()}/`;

export const LOCAL_PLACEHOLDER_WATCH = '/placeholder-watch.svg';

export const FALLBACK_WATCH_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const FALLBACK_SECONDARY_WATCH_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80';

/** List of known deleted/broken upstream Unsplash photo IDs */
const KNOWN_BROKEN_IMAGE_PATTERNS = [
  '1547996160-71dfa635826f',
  '1547996160',
];

/**
 * Safely encodes path components in an image URL to ensure spaces and special characters
 * don't cause Next.js Image Optimization to return 400/404.
 */
function safelyEncodeUrl(urlStr: string): string {
  try {
    const urlObj = new URL(urlStr);
    // encode URI on the pathname only if it's not already percent-encoded
    const decodedPath = decodeURI(urlObj.pathname);
    const encodedPath = encodeURI(decodedPath);
    urlObj.pathname = encodedPath;
    return urlObj.toString();
  } catch {
    return encodeURI(decodeURI(urlStr));
  }
}

/**
 * Normalizes any image URL, storage path, filename, or JSON array to a permanent, valid HTTPS URL.
 * Handles:
 * - Full HTTPS URLs (preserves valid external URLs and properly encodes path spaces)
 * - Supabase storage paths (e.g. "image/watch.jpg", "products/watch.jpg", "/storage/v1/object/public/...")
 * - Direct filenames (e.g. "WhatsApp Image 2026-08-18 at 8.37.02 PM.jpeg", "watch1.jpg")
 * - Signed URLs (/storage/v1/object/sign/... -> converts to permanent public URL without expired signature query)
 * - Placeholders (replaces placehold.co, etc. with luxury fallback image)
 * - Known broken URLs (replaces deleted Unsplash photos with verified fallback)
 * - Double Supabase prefixes (e.g. ".../public/image/https://..." -> cleanly unwraps to "https://...")
 * - JSON stringified arrays or objects
 * - Null / undefined / empty string -> returns fallback
 */
export function getProductImageUrl(
  image: any,
  fallback: string = FALLBACK_WATCH_IMAGE
): string {
  if (image === null || image === undefined) {
    return fallback;
  }

  // If passed an array, resolve the primary / first element
  if (Array.isArray(image)) {
    if (image.length === 0) return fallback;
    const primary = image.find((i: any) => i?.isPrimary) || image[0];
    return getProductImageUrl(primary, fallback);
  }

  // If passed an object with url / src / image property
  if (typeof image === 'object') {
    const candidate = image.url || image.src || image.image;
    if (candidate && typeof candidate === 'string') {
      return getProductImageUrl(candidate, fallback);
    }
    return fallback;
  }

  if (typeof image !== 'string') {
    return fallback;
  }

  let clean = image.trim();
  if (!clean) return fallback;

  // Immediately filter out known broken external URLs
  for (const pattern of KNOWN_BROKEN_IMAGE_PATTERNS) {
    if (clean.includes(pattern)) {
      return fallback;
    }
  }

  // Handle JSON array or JSON object string
  if (clean.startsWith('[') || clean.startsWith('{')) {
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) || typeof parsed === 'object') {
        return getProductImageUrl(parsed, fallback);
      }
    } catch {
      // not JSON, continue string processing
    }
  }

  // Reject placeholder URLs
  if (
    clean.includes('placehold.co') ||
    clean.includes('placeholder.com') ||
    clean.includes('via.placeholder')
  ) {
    return fallback;
  }

  // Handle double Supabase prefix duplication (e.g. ".../public/image/https://...")
  const httpIndex = clean.indexOf('https://', 8);
  if (httpIndex !== -1) {
    clean = clean.substring(httpIndex);
  } else {
    const insecureHttpIndex = clean.indexOf('http://', 8);
    if (insecureHttpIndex !== -1) {
      clean = clean.substring(insecureHttpIndex);
    }
  }

  // Check again after unwrapping double prefixes
  for (const pattern of KNOWN_BROKEN_IMAGE_PATTERNS) {
    if (clean.includes(pattern)) {
      return fallback;
    }
  }

  const origin = getSupabaseOrigin();
  const bucket = getSupabaseStorageBucket();

  // Convert signed Supabase storage URLs to permanent public URLs
  if (clean.includes('/storage/v1/object/sign/')) {
    try {
      const urlObj = new URL(clean);
      const pathname = urlObj.pathname.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
      return safelyEncodeUrl(`${urlObj.origin}${pathname}`);
    } catch {
      const stripped = clean.split('?')[0].replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
      return safelyEncodeUrl(stripped);
    }
  }

  // If it's already an absolute HTTPS or HTTP URL
  if (clean.startsWith('https://') || clean.startsWith('http://')) {
    return safelyEncodeUrl(clean);
  }

  // If it starts with storage path "/storage/v1/object/public/"
  if (clean.startsWith('/storage/v1/object/public/')) {
    return safelyEncodeUrl(`${origin}${clean}`);
  }

  if (clean.startsWith('storage/v1/object/public/')) {
    return safelyEncodeUrl(`${origin}/${clean}`);
  }

  // If it starts with bucket name e.g. "image/filename.jpg" or "/image/filename.jpg"
  if (clean.startsWith('image/') || clean.startsWith('/image/')) {
    const filename = clean.replace(/^\/?image\//, '');
    return safelyEncodeUrl(`${origin}/storage/v1/object/public/image/${filename}`);
  }

  if (clean.startsWith('products/') || clean.startsWith('/products/')) {
    const filename = clean.replace(/^\/?products\//, '');
    return safelyEncodeUrl(`${origin}/storage/v1/object/public/products/${filename}`);
  }

  // Clean filename: remove leading slashes and any accidental storage prefix
  const filename = clean.replace(/^\/?(storage\/v1\/object\/public\/)?([a-zA-Z0-9_\-]+\/)?/, (match) => {
    // If it specifically matched storage prefix, strip it
    if (match.includes('storage/v1/object/public/')) return '';
    return match;
  });

  return safelyEncodeUrl(`${origin}/storage/v1/object/public/${bucket}/${filename.replace(/^\/+/, '')}`);
}

/**
 * Backward compatibility alias for getProductImageUrl
 */
export const getPublicImageUrl = getProductImageUrl;

/**
 * Extracts primary image URL from product images array
 */
export function getProductPrimaryImage(
  images?: Array<{ url?: string; src?: string; isPrimary?: boolean; displayOrder?: number } | string> | null,
  fallback: string = FALLBACK_WATCH_IMAGE
): string {
  if (!images || !Array.isArray(images) || images.length === 0) return fallback;

  // If array contains objects
  const first = images[0];
  if (typeof first === 'object' && first !== null) {
    const objectList = images as Array<{ url?: string; src?: string; isPrimary?: boolean; displayOrder?: number }>;
    const primary =
      objectList.find((img) => img?.isPrimary) ||
      [...objectList].sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))[0];

    return getProductImageUrl(primary?.url || primary?.src, fallback);
  }

  // If array contains strings
  return getProductImageUrl(images[0], fallback);
}

/**
 * Extracts secondary image URL from product images array for hover states
 */
export function getProductSecondaryImage(
  images?: Array<{ url?: string; src?: string; isPrimary?: boolean; displayOrder?: number } | string> | null,
  fallback: string = FALLBACK_SECONDARY_WATCH_IMAGE
): string {
  if (!images || !Array.isArray(images) || images.length === 0) return fallback;
  if (images.length === 1) return getProductPrimaryImage(images, fallback);

  const first = images[0];
  if (typeof first === 'object' && first !== null) {
    const objectList = images as Array<{ url?: string; src?: string; isPrimary?: boolean; displayOrder?: number }>;
    const nonPrimary =
      objectList.find((img) => !img?.isPrimary) ||
      [...objectList].sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))[1] ||
      objectList[0];

    return getProductImageUrl(nonPrimary?.url || nonPrimary?.src, fallback);
  }

  return getProductImageUrl(images[1] || images[0], fallback);
}
