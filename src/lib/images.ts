export const SUPABASE_STORAGE_BASE_URL =
  'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/';

export const FALLBACK_WATCH_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const FALLBACK_SECONDARY_WATCH_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes any image URL or storage key to a valid, permanent HTTPS public URL.
 * Handles:
 * - Direct Supabase filenames ("watch-1.jpg" -> "https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-1.jpg")
 * - Signed URLs (/storage/v1/object/sign/... -> /storage/v1/object/public/...)
 * - Placeholder URLs (replaces placehold.co with luxury watch image)
 * - Full HTTPS URLs (preserves)
 * - Empty / null / undefined (returns fallback luxury image)
 */
export function getPublicImageUrl(
  urlOrFilename: string | null | undefined,
  fallback: string = FALLBACK_WATCH_IMAGE
): string {
  if (!urlOrFilename || typeof urlOrFilename !== 'string') {
    return fallback;
  }

  const clean = urlOrFilename.trim();
  if (!clean) return fallback;

  // Replace placeholder URLs like placehold.co
  if (
    clean.includes('placehold.co') ||
    clean.includes('placeholder.com') ||
    clean.includes('via.placeholder')
  ) {
    return fallback;
  }

  // Convert signed Supabase storage URLs to permanent public URLs
  if (clean.includes('/storage/v1/object/sign/image/')) {
    try {
      const urlObj = new URL(clean);
      const pathname = urlObj.pathname.replace(
        '/storage/v1/object/sign/image/',
        '/storage/v1/object/public/image/'
      );
      return `${urlObj.origin}${pathname}`;
    } catch {
      return clean.replace('/storage/v1/object/sign/image/', '/storage/v1/object/public/image/');
    }
  }

  // Already a full HTTPS URL
  if (clean.startsWith('https://') || clean.startsWith('http://')) {
    return clean;
  }

  // Relative storage path or direct filename
  const filename = clean.replace(/^\/?(storage\/v1\/object\/public\/)?(image\/)?/, '');
  return `${SUPABASE_STORAGE_BASE_URL}${filename}`;
}

/**
 * Extracts primary image URL from product images array
 */
export function getProductPrimaryImage(
  images?: Array<{ url: string; isPrimary?: boolean; displayOrder?: number }> | null,
  fallback: string = FALLBACK_WATCH_IMAGE
): string {
  if (!images || images.length === 0) return fallback;

  const primary =
    images.find((img) => img.isPrimary) ||
    [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0];

  return getPublicImageUrl(primary?.url, fallback);
}

/**
 * Extracts secondary image URL from product images array for hover states
 */
export function getProductSecondaryImage(
  images?: Array<{ url: string; isPrimary?: boolean; displayOrder?: number }> | null,
  fallback: string = FALLBACK_SECONDARY_WATCH_IMAGE
): string {
  if (!images || images.length === 0) return fallback;
  if (images.length === 1) return getProductPrimaryImage(images, fallback);

  const nonPrimary =
    images.find((img) => !img.isPrimary) ||
    [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[1] ||
    images[0];

  return getPublicImageUrl(nonPrimary?.url, fallback);
}
