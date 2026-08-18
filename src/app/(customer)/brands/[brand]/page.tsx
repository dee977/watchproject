import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/customer/shop/ProductGrid';
import { ProductCardData } from '@/components/customer/shop/ProductCard';
import Link from 'next/link';

interface BrandCatalogPageProps {
  params: { brand: string };
  searchParams: {
    sort?: string;
    view?: 'grid' | 'list';
  };
}

export default async function BrandCatalogPage({
  params,
  searchParams,
}: BrandCatalogPageProps) {
  let brand: any = null;
  try {
    brand = await prisma.brand.findUnique({
      where: { slug: params.brand },
    });
  } catch (err) {
    console.error('Brand lookup error:', err);
  }

  if (!brand) {
    notFound();
  }

  const sort = searchParams.sort || 'recommended';
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'popular') orderBy = { isBestSeller: 'desc' };

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        brandId: brand.id,
        isPublished: true,
      },
      orderBy,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    });
  } catch (err) {
    console.error('Brand products query error:', err);
  }

  const formatted: ProductCardData[] = products.map((p) => {
    const reviewCount = p.reviews?.length || 0;
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
      {/* Breadcrumb & Brand Banner */}
      <div className="space-y-4 border-b border-obsidian-800 pb-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span>/</span>
          <Link href="/brands" className="hover:text-gold-400">Brands</Link>
          <span>/</span>
          <span className="text-gold-300">{brand.name}</span>
        </nav>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            {brand.originCountry} • Est. {brand.foundedYear}
          </span>
          <h1 className="text-4xl sm:text-5xl font-cinzel font-bold text-white">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed font-light">
              {brand.description}
            </p>
          )}
        </div>
      </div>

      {/* Catalog Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{products.length} Timepiece Editions Available</span>
        </div>

        <ProductGrid products={formatted} columns={4} />
      </div>
    </div>
  );
}
