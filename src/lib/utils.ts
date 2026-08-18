import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function generateSKU(brand: string, name: string): string {
  const brandPrefix = brand.substring(0, 3).toUpperCase().padEnd(3, 'X');
  const nameClean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const namePart = nameClean.substring(0, 4).padEnd(4, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${brandPrefix}-${namePart}-${randomNum}`;
}

export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Safely normalizes searchParam values that could be string, string[], undefined, or comma-separated strings.
 * Returns a deduplicated, trimmed array of non-empty strings.
 */
export function normalizeParamArray(param: string | string[] | undefined | null): string[] {
  if (!param) return [];
  const rawList = Array.isArray(param) ? param : [param];
  return Array.from(
    new Set(
      rawList
        .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  );
}

/**
 * Safely normalizes searchParam values that should be a single string.
 */
export function normalizeParamString(param: string | string[] | undefined | null): string | undefined {
  if (!param) return undefined;
  if (Array.isArray(param)) {
    const first = param[0];
    return typeof first === 'string' && first.trim().length > 0 ? first.trim() : undefined;
  }
  return typeof param === 'string' && param.trim().length > 0 ? param.trim() : undefined;
}
