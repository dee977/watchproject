import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliawatches.com';

  const [products, brands, categories, collections] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.collection.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    '',
    '/watches',
    '/brands',
    '/collections',
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns',
    '/refunds',
    '/privacy',
    '/terms',
    '/cookies',
    '/track-order',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${siteUrl}/brands/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${siteUrl}/watches/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const collectionRoutes = collections.map((col) => ({
    url: `${siteUrl}/collections/${col.slug}`,
    lastModified: col.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes, ...collectionRoutes];
}
