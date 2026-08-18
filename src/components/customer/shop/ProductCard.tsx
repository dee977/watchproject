'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { WishlistButton } from './WishlistButton';
import { useCartStore } from '@/lib/cart-store';
import { QuickViewModal, QuickViewProduct } from './QuickViewModal';
import {
  getProductPrimaryImage,
  getProductSecondaryImage,
  FALLBACK_WATCH_IMAGE,
  FALLBACK_SECONDARY_WATCH_IMAGE,
} from '@/lib/images';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: { name: string; slug: string };
  category?: { name: string; slug: string };
  price: number;
  mrp: number;
  discountPercent?: number;
  movement: string;
  caseDiameter?: string | null;
  waterResistance?: string | null;
  shortDescription?: string | null;
  description: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  stockQuantity: number;
  images: Array<{ url: string; altText?: string | null; isPrimary?: boolean; displayOrder?: number }>;
  averageRating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
}) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const initialPrimary = getProductPrimaryImage(product.images);
  const initialSecondary = getProductSecondaryImage(product.images);

  const [primaryImageSrc, setPrimaryImageSrc] = useState(initialPrimary);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState(initialSecondary);

  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const discount =
    product.discountPercent ||
    (product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand.name,
      price: product.price,
      mrp: product.mrp,
      image: primaryImageSrc,
      maxStock: product.stockQuantity,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const quickViewData: QuickViewProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand.name,
    price: product.price,
    mrp: product.mrp,
    discountPercent: discount,
    movement: product.movement,
    caseDiameter: product.caseDiameter,
    waterResistance: product.waterResistance,
    shortDescription: product.shortDescription,
    description: product.description,
    stockQuantity: product.stockQuantity,
    images: product.images,
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="group relative bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-gold-500/40 hover:bg-obsidian-900 transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative w-full md:w-56 aspect-square rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
            <Link href={`/product/${product.slug}`} className="block h-full w-full">
              <Image
                src={primaryImageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setPrimaryImageSrc(FALLBACK_WATCH_IMAGE)}
              />
            </Link>

            <div className="absolute top-3 right-3 z-10">
              <WishlistButton
                product={{
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  brand: product.brand.name,
                  price: product.price,
                  mrp: product.mrp,
                  image: primaryImageSrc,
                }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 text-xs mb-1">
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="uppercase tracking-luxury text-gold-400 font-cinzel font-semibold hover:underline"
                >
                  {product.brand.name}
                </Link>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-mono text-[11px]">{product.sku}</span>
              </div>

              <Link href={`/product/${product.slug}`} className="block">
                <h3 className="text-lg font-cinzel font-bold text-white group-hover:text-gold-300 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-gray-300">
                <span className="px-2.5 py-0.5 rounded bg-obsidian-950 border border-obsidian-800">
                  ⚙️ {product.movement}
                </span>
                {product.caseDiameter && (
                  <span className="px-2.5 py-0.5 rounded bg-obsidian-950 border border-obsidian-800">
                    📏 {product.caseDiameter}
                  </span>
                )}
                {product.waterResistance && (
                  <span className="px-2.5 py-0.5 rounded bg-obsidian-950 border border-obsidian-800">
                    🌊 {product.waterResistance}
                  </span>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-obsidian-800/80">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-gold-300 font-cinzel">
                  {formatPrice(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsQuickViewOpen(true)}
                  className="px-3.5 py-2 rounded bg-obsidian-950 border border-obsidian-700 hover:border-gold-500/40 text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-gold-400" />
                  <span>Quick View</span>
                </button>

                <button
                  onClick={handleQuickAdd}
                  disabled={isOutOfStock}
                  className="btn-gold px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-950" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Acquire'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <QuickViewModal
          product={quickViewData}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      </>
    );
  }

  // Grid View Mode
  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-obsidian-900/40 border border-obsidian-800/90 rounded-lg overflow-hidden hover:border-gold-500/40 hover:bg-obsidian-900/80 transition-all duration-300 flex flex-col justify-between"
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-luxury bg-obsidian-950/90 text-gold-300 border border-gold-500/30">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-gold-500 text-obsidian-950">
              -{discount}%
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist Trigger */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            product={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              brand: product.brand.name,
              price: product.price,
              mrp: product.mrp,
              image: primaryImageSrc,
            }}
          />
        </div>

        {/* Image Display */}
        <div className="relative aspect-square w-full bg-obsidian-950 overflow-hidden">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={isHovered && secondaryImageSrc ? secondaryImageSrc : primaryImageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-all duration-700 ease-out"
              onError={() => {
                if (isHovered && secondaryImageSrc) {
                  setSecondaryImageSrc(FALLBACK_SECONDARY_WATCH_IMAGE);
                } else {
                  setPrimaryImageSrc(FALLBACK_WATCH_IMAGE);
                }
              }}
            />
          </Link>

          {/* Quick Actions Hover Drawer */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-obsidian-950 via-obsidian-950/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="flex-1 py-2 px-2.5 rounded bg-obsidian-900/90 border border-obsidian-700 hover:border-gold-400 text-gray-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gold-400" />
              <span>Quick View</span>
            </button>

            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="btn-gold py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {justAdded ? (
                <Check className="w-3.5 h-3.5 text-emerald-950" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/brands/${product.brand.slug}`}
                className="uppercase tracking-luxury text-gold-400 font-cinzel font-semibold hover:underline"
              >
                {product.brand.name}
              </Link>
              <span className="text-[10px] text-gray-500 font-mono">{product.movement}</span>
            </div>

            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="text-sm font-cinzel font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="pt-2 border-t border-obsidian-800/80 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gold-300 font-cinzel">
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            {product.averageRating ? (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.averageRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewData}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};
