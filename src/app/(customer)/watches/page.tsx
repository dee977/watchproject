import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductGrid } from '@/components/customer/shop/ProductGrid';
import { FilterSidebar } from '@/components/customer/shop/FilterSidebar';
import { SortSelect } from '@/components/customer/shop/SortSelect';
import { MobileFilterButton } from '@/components/customer/shop/MobileFilterButton';
import { ProductCardData } from '@/components/customer/shop/ProductCard';
import Link from 'next/link';

interface WatchesPageProps {
  searchParams: {
    brand?: string;
    category?: string;
    collection?: string;
    movement?: string;
    gender?: string;
    inStock?: string;
    featured?: string;
    new?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    view?: 'grid' | 'list';
  };
}

export const dynamic = 'force-dynamic';

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = 12;
  const viewMode = searchParams.view || 'grid';
  const sort = searchParams.sort || 'recommended';

  // Build Prisma where filter
  const where: any = { isPublished: true };

  if (searchParams.brand) {
    const brandSlugs = searchParams.brand.split(',');
    where.brand = { slug: { in: brandSlugs } };
  }

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.collection) {
    where.collection = { slug: searchParams.collection };
  }

  if (searchParams.movement) {
    const movements = searchParams.movement.split(',');
    where.movement = { in: movements };
  }

  if (searchParams.gender) {
    where.gender = searchParams.gender;
  }

  if (searchParams.featured === 'true') {
    where.isFeatured = true;
  }

  if (searchParams.new === 'true') {
    where.isNewArrival = true;
  }

  if (searchParams.inStock === 'true') {
    where.inventory = { stockQuantity: { gt: 0 } };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice);
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };
  if (sort === 'popular') orderBy = { isBestSeller: 'desc' };

  const [totalCount, products, allBrands, allCategories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),
    prisma.brand.findMany({
      select: { name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      select: { name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedProducts: ProductCardData[] = products.map((p) => {
    const reviewCount = p.reviews.length;
    const averageRating =
      reviewCount > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
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

  const totalPages = Math.ceil(totalCount / limit);
  const movementsList = ['Automatic', 'Manual Wind', 'Quartz', 'Solar', 'Kinetic', 'Spring Drive', 'Co-Axial'];
  const filterBrands = allBrands.map((b) => ({ label: b.name, value: b.slug, count: b._count.products }));
  const filterCategories = allCategories.map((c) => ({ label: c.name, value: c.slug, count: c._count.products }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-3 border-b border-obsidian-800 pb-6">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span>/</span>
          <span className="text-gold-300">Watches</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
              The Horological Catalogue
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Displaying {totalCount} authenticated precision timepieces
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24">
          <FilterSidebar
            brands={filterBrands}
            categories={filterCategories}
            movements={movementsList}
            maxPriceLimit={500000}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Sort & View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-obsidian-900/40 border border-obsidian-800 rounded-lg text-xs">
            <div className="flex items-center gap-3">
              <MobileFilterButton
                brands={filterBrands}
                categories={filterCategories}
                movements={movementsList}
                maxPriceLimit={500000}
              />
              <span className="text-gray-400">
                Showing <strong className="text-white">{products.length}</strong> of <strong className="text-white">{totalCount}</strong> pieces
              </span>
            </div>

            <div className="flex items-center gap-4">
              <SortSelect currentSort={sort} />
            </div>
          </div>

          {/* Catalog Products */}
          <ProductGrid products={formattedProducts} viewMode={viewMode} columns={3} />

          {/* Database Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-obsidian-800">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === page;
                const newParams = new URLSearchParams(searchParams as any);
                newParams.set('page', p.toString());

                return (
                  <Link
                    key={p}
                    href={`/watches?${newParams.toString()}`}
                    className={`w-9 h-9 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-gold-500 text-obsidian-950 shadow-gold'
                        : 'bg-obsidian-900 border border-obsidian-800 text-gray-300 hover:border-gold-500/40 hover:text-white'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
