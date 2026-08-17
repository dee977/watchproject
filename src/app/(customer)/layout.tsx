import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getStoreSettings } from '@/lib/store-settings';
import { Header } from '@/components/customer/layout/Header';
import { Footer } from '@/components/customer/layout/Footer';
import { CartDrawer } from '@/components/customer/shop/CartDrawer';
import { CookieConsent } from '@/components/customer/layout/CookieConsent';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings, brands, categories, collections] = await Promise.all([
    getSessionUser(),
    getStoreSettings(),
    prisma.brand.findMany({ select: { id: true, name: true, slug: true, isFeatured: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.collection.findMany({ select: { id: true, name: true, slug: true, coverImage: true } }),
  ]);

  return (
    <>
      <Header
        brands={brands}
        categories={categories}
        collections={collections}
        user={session ? { id: session.userId, name: session.name, email: session.email, role: session.role } : null}
      />

      <main className="flex-1">{children}</main>

      <Footer />
      <CartDrawer freeShippingThreshold={settings.FREE_SHIPPING_THRESHOLD} />
      <CookieConsent />
    </>
  );
}
