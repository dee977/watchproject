import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { HeroSlider } from '@/components/customer/shop/HeroSlider';
import { ProductGrid } from '@/components/customer/shop/ProductGrid';
import { ProductCardData } from '@/components/customer/shop/ProductCard';
import { ArrowRight, Sparkles, Award, Compass, ChevronRight } from 'lucide-react';

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [trendingProducts, newArrivals, bestSellers, featuredBrands, featuredCollections] = await Promise.all([
    // Trending / Featured
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),

    // New Arrivals
    prisma.product.findMany({
      where: { isPublished: true, isNewArrival: true },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),

    // Best Sellers
    prisma.product.findMany({
      where: { isPublished: true, isBestSeller: true },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),

    // Featured Brands
    prisma.brand.findMany({
      where: { isFeatured: true },
      take: 6,
    }),

    // Featured Collections
    prisma.collection.findMany({
      where: { isFeatured: true },
      take: 4,
      include: {
        _count: { select: { products: true } },
      },
    }),
  ]);

  const mapProductToCard = (p: any): ProductCardData => {
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
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Banner Slider */}
      <HeroSlider />

      {/* 2. Prestigious Manufactures Bar */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="border-y border-obsidian-800/80 py-8">
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Authorized Boutique Network & Manufactures
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group p-4 rounded bg-obsidian-900/40 border border-obsidian-800/60 hover:border-gold-500/40 hover:bg-obsidian-900 transition-all text-center space-y-1 block"
              >
                <span className="block font-cinzel text-sm font-bold text-gray-300 group-hover:text-gold-300 transition-colors">
                  {brand.name}
                </span>
                <span className="block text-[10px] text-gray-500 font-mono uppercase">
                  {brand.originCountry}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Curations (Masterpieces in Spotlight) */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-obsidian-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-luxury font-cinzel font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curator&apos;s Private Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-1">
              Trending Masterpieces
            </h2>
          </div>

          <Link
            href="/watches?featured=true"
            className="text-xs uppercase tracking-luxury text-gold-400 hover:text-gold-300 flex items-center gap-1.5 font-medium group self-start sm:self-auto"
          >
            <span>Explore All Featured</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={trendingProducts.map(mapProductToCard)} columns={4} />
      </section>

      {/* 4. Curated Collections Showcase */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Horological Chapters
          </span>
          <h2 className="text-3xl font-cinzel font-bold text-white">
            Curated Collections
          </h2>
          <p className="text-xs text-gray-400">
            Explore dedicated universes created around iconic complications, motorsport heritage, and deep ocean exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCollections.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group relative h-80 rounded-lg overflow-hidden border border-obsidian-800 hover:border-gold-500/50 transition-all duration-500 flex flex-col justify-end p-6"
            >
              {col.coverImage && (
                <Image
                  src={col.coverImage}
                  alt={col.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                  {col._count.products} Reference Editions
                </span>
                <h3 className="text-xl font-cinzel font-bold text-white group-hover:text-gold-300 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-1 text-xs text-gold-400 font-medium">
                  <span>View Collection</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. New Horological Arrivals */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-obsidian-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-luxury font-cinzel font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Fresh From Switzerland & Japan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-1">
              New Releases & Allocations
            </h2>
          </div>

          <Link
            href="/watches?new=true"
            className="text-xs uppercase tracking-luxury text-gold-400 hover:text-gold-300 flex items-center gap-1.5 font-medium group self-start sm:self-auto"
          >
            <span>View All New Releases</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={newArrivals.map(mapProductToCard)} columns={4} />
      </section>

      {/* 6. Best Selling Timepieces */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-obsidian-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-luxury font-cinzel font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Collector Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-1">
              Best Selling Icons
            </h2>
          </div>

          <Link
            href="/watches?sort=popular"
            className="text-xs uppercase tracking-luxury text-gold-400 hover:text-gold-300 flex items-center gap-1.5 font-medium group self-start sm:self-auto"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={bestSellers.map(mapProductToCard)} columns={4} />
      </section>
    </div>
  );
}
