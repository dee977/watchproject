import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({ products: [], brands: [], categories: [] });
    }

    const [products, brands, categories] = await Promise.all([
      // Products
      prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { description: { contains: query } },
            { brand: { name: { contains: query } } },
          ],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          brand: { select: { name: true } },
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
            select: { url: true },
          },
        },
      }),

      // Brands
      prisma.brand.findMany({
        where: {
          name: { contains: query },
        },
        take: 3,
        select: { name: true, slug: true },
      }),

      // Categories
      prisma.category.findMany({
        where: {
          name: { contains: query },
        },
        take: 3,
        select: { name: true, slug: true },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      brand: p.brand.name,
      image: p.images[0]?.url || '',
    }));

    return NextResponse.json({
      products: formattedProducts,
      brands,
      categories,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], brands: [], categories: [] });
  }
}
