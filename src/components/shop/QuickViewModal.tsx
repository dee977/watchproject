'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight, ShieldCheck, Check, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/lib/cart-store';
import { WishlistButton } from './WishlistButton';

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  mrp: number;
  discountPercent?: number;
  movement: string;
  caseDiameter?: string | null;
  waterResistance?: string | null;
  shortDescription?: string | null;
  description: string;
  stockQuantity: number;
  images: Array<{ url: string; altText?: string | null }>;
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const primaryImage = product.images[selectedImageIndex]?.url || product.images[0]?.url || '';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        price: product.price,
        mrp: product.mrp,
        image: primaryImage,
        maxStock: product.stockQuantity,
      },
      quantity
    );
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      <div className="min-h-screen px-4 flex items-center justify-center py-12">
        <div className="relative w-full max-w-4xl bg-obsidian-950 border border-gold-500/30 rounded-lg shadow-2xl overflow-hidden z-10 animate-scaleIn text-white">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-obsidian-900/80 text-gray-400 hover:text-white border border-obsidian-800 hover:border-gold-500/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Gallery Column */}
            <div className="md:col-span-6 bg-obsidian-900/50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-obsidian-800">
              <div className="relative aspect-square w-full rounded overflow-hidden bg-obsidian-950 border border-obsidian-800">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-14 rounded overflow-hidden flex-shrink-0 border transition-all ${
                        selectedImageIndex === idx
                          ? 'border-gold-400 ring-1 ring-gold-400'
                          : 'border-obsidian-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumb ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Brand & SKU */}
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                    {product.brand}
                  </span>
                  <span className="text-gray-400 font-mono">{product.sku}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-cinzel font-bold text-white leading-tight">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-bold text-gold-300 font-cinzel">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.mrp)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gold-500/10 text-gold-300 border border-gold-500/20">
                        Save {product.discountPercent || Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Key Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800 text-[11px] text-gray-300">
                    ⚙️ {product.movement}
                  </span>
                  {product.caseDiameter && (
                    <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800 text-[11px] text-gray-300">
                      📏 {product.caseDiameter}
                    </span>
                  )}
                  {product.waterResistance && (
                    <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800 text-[11px] text-gray-300">
                      🌊 {product.waterResistance}
                    </span>
                  )}
                </div>

                {/* Description snippet */}
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {product.shortDescription || product.description}
                </p>

                {/* Stock indicator */}
                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      Currently Vault Allocated (Out of Stock)
                    </span>
                  ) : isLowStock ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                      Only {product.stockQuantity} pieces remaining in vault
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      In Stock • Ready for Armored Dispatch
                    </span>
                  )}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-4 pt-4 border-t border-obsidian-800">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  {!isOutOfStock && (
                    <div className="flex items-center border border-obsidian-700 rounded bg-obsidian-900">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2.5 text-gray-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="p-2.5 text-gray-400 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 btn-gold py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Added to Vault</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isOutOfStock ? 'Sold Out' : 'Acquire Timepiece'}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist */}
                  <WishlistButton
                    product={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      brand: product.brand,
                      price: product.price,
                      mrp: product.mrp,
                      image: primaryImage,
                    }}
                    className="p-3"
                  />
                </div>

                {/* View Full Product Details Link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                    <span>2-Year International Warranty</span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 group"
                  >
                    <span>Full Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
