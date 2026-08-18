import { cache as reactCache } from 'react';
const cache = typeof reactCache === 'function' ? reactCache : (<T extends (...args: any[]) => any>(fn: T): T => fn);
import { prisma } from './prisma';

export interface StoreSettingsMap {
  STORE_NAME: string;
  STORE_CURRENCY: string;
  STORE_CURRENCY_SYMBOL: string;
  TAX_RATE_PERCENT: number;
  FREE_SHIPPING_THRESHOLD: number;
  STANDARD_SHIPPING_FEE: number;
  EXPRESS_SHIPPING_FEE: number;
  COD_FEE: number;
  RETURN_WINDOW_DAYS: number;
  CONCIERGE_EMAIL: string;
  CONCIERGE_PHONE: string;
  STORE_ADDRESS: string;
  HERO_TITLE: string;
  HERO_SUBTITLE: string;
}

export type StoreSettings = StoreSettingsMap;

const DEFAULT_SETTINGS: StoreSettingsMap = {
  STORE_NAME: 'AURELIA Haute Horlogerie',
  STORE_CURRENCY: 'INR',
  STORE_CURRENCY_SYMBOL: '₹',
  TAX_RATE_PERCENT: 18,
  FREE_SHIPPING_THRESHOLD: 50000,
  STANDARD_SHIPPING_FEE: 750,
  EXPRESS_SHIPPING_FEE: 1850,
  COD_FEE: 250,
  RETURN_WINDOW_DAYS: 14,
  CONCIERGE_EMAIL: 'concierge@aureliawatches.com',
  CONCIERGE_PHONE: '+91 9687949373',
  STORE_ADDRESS: 'The Horizon Tower, Suite 44B, Bandra Kurla Complex, Mumbai, MH 400051',
  HERO_TITLE: 'TIME, REDEFINED.',
  HERO_SUBTITLE: 'Discover exceptional handcrafted horological masterpieces engineered for eternity.',
};

export const getStoreSettings = cache(async (): Promise<StoreSettingsMap> => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return {
      STORE_NAME: map.STORE_NAME || DEFAULT_SETTINGS.STORE_NAME,
      STORE_CURRENCY: map.STORE_CURRENCY || DEFAULT_SETTINGS.STORE_CURRENCY,
      STORE_CURRENCY_SYMBOL: map.STORE_CURRENCY_SYMBOL || DEFAULT_SETTINGS.STORE_CURRENCY_SYMBOL,
      TAX_RATE_PERCENT: map.TAX_RATE_PERCENT ? Number(map.TAX_RATE_PERCENT) : DEFAULT_SETTINGS.TAX_RATE_PERCENT,
      FREE_SHIPPING_THRESHOLD: map.FREE_SHIPPING_THRESHOLD ? Number(map.FREE_SHIPPING_THRESHOLD) : DEFAULT_SETTINGS.FREE_SHIPPING_THRESHOLD,
      STANDARD_SHIPPING_FEE: map.STANDARD_SHIPPING_FEE ? Number(map.STANDARD_SHIPPING_FEE) : DEFAULT_SETTINGS.STANDARD_SHIPPING_FEE,
      EXPRESS_SHIPPING_FEE: map.EXPRESS_SHIPPING_FEE ? Number(map.EXPRESS_SHIPPING_FEE) : DEFAULT_SETTINGS.EXPRESS_SHIPPING_FEE,
      COD_FEE: map.COD_FEE ? Number(map.COD_FEE) : DEFAULT_SETTINGS.COD_FEE,
      RETURN_WINDOW_DAYS: map.RETURN_WINDOW_DAYS ? Number(map.RETURN_WINDOW_DAYS) : DEFAULT_SETTINGS.RETURN_WINDOW_DAYS,
      CONCIERGE_EMAIL: map.CONCIERGE_EMAIL || DEFAULT_SETTINGS.CONCIERGE_EMAIL,
      CONCIERGE_PHONE: map.CONCIERGE_PHONE || DEFAULT_SETTINGS.CONCIERGE_PHONE,
      STORE_ADDRESS: map.STORE_ADDRESS || DEFAULT_SETTINGS.STORE_ADDRESS,
      HERO_TITLE: map.HERO_TITLE || DEFAULT_SETTINGS.HERO_TITLE,
      HERO_SUBTITLE: map.HERO_SUBTITLE || DEFAULT_SETTINGS.HERO_SUBTITLE,
    };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
});

export async function updateStoreSetting(key: string, value: string, description?: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value, ...(description ? { description } : {}) },
    create: { key, value, description },
  });
}
