import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getStoreSettings } from '@/lib/store-settings';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { generateOrganizationJsonLd } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliawatches.com';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.STORE_NAME} | Certified Luxury Timepieces & Horology Boutique`,
      template: `%s | ${settings.STORE_NAME}`,
    },
    description:
      'Explore certified Master Chronometer, automatic, chronograph, and Haute Horlogerie timepieces from Omega, Cartier, Longines, Tissot, and Seiko. Complimentary armored vault delivery across India.',
    keywords: [
      'Luxury Watches India',
      'Automatic Watches',
      'Chronograph',
      'Omega Moonwatch',
      'Cartier Tank',
      'Tissot PRX',
      'Seiko Presage',
      'Haute Horlogerie',
      'Swiss Timepieces',
    ],
    authors: [{ name: 'AURELIA Haute Horlogerie' }],
    creator: 'AURELIA Haute Horlogerie',
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: siteUrl,
      title: `${settings.STORE_NAME} | Certified Luxury Timepieces`,
      description:
        'Discover exceptional handcrafted timepieces engineered for eternity. 100% Certified Authentic with global manufacturer warranty.',
      siteName: settings.STORE_NAME,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: 'AURELIA Haute Horlogerie Flagship Collection',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.STORE_NAME,
      description: 'Certified luxury timepieces and Master Chronometer heritage collections.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
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

  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-obsidian-950 text-gray-100 antialiased selection:bg-gold-500 selection:text-obsidian-950">
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
      </body>
    </html>
  );
}
