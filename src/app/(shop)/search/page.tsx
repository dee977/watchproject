import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductCardData } from '@/components/shop/ProductCard';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q || '').trim();

  let products: any[] = [];
  if (query) {
    products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { description: { contains: query } },
          { movement: { contains: query } },
          { caseMaterial: { contains: query } },
          { brand: { name: { contains: query } } },
          { category: { name: { contains: query } } },
        ],
      },
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    });
  }

  const formatted: ProductCardData[] = products.map((p) => {
    const reviewCount = p.reviews.length;
    const averageRating =
      reviewCount > 0
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
        : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      discountPercent: p.discountPercent,
      movement: p.movement,
      caseDiameter: p.caseDiameter,
      waterResistance: p.waterResistance,
      shortDescription: p.shortDescription,
      description: p.description,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      stockQuantity: p.inventory?.stockQuantity ?? 0,
      images: p.images,
      averageRating,
      reviewCount,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-4 border-b border-obsidian-800 pb-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span>/</span>
          <span className="text-gold-300">Search Inquiries</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel font-bold text-white flex items-center gap-3">
              <Search className="w-6 h-6 text-gold-400" />
              <span>Search Results for &quot;{query}&quot;</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Found {products.length} matching horological {products.length === 1 ? 'edition' : 'editions'}
            </p>
          </div>
        </div>
      </div>

      <ProductGrid products={formatted} columns={4} />
    </div>
  );
}
