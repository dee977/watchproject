'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight, ShieldCheck, Check, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/lib/cart-store';
import { WishlistButton } from './WishlistButton';
import {
  getPublicImageUrl,
  getProductPrimaryImage,
  FALLBACK_WATCH_IMAGE,
} from '@/lib/images';

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  mrp: number;
  discountPercent?: number | null;
  movement?: string | null;
  caseDiameter?: string | null;
  waterResistance?: string | null;
  shortDescription?: string | null;
  description?: string | null;
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

  const rawActive = product?.images[selectedImageIndex]?.url || product?.images[0]?.url || '';
  const [currentImageSrc, setCurrentImageSrc] = useState(() => getPublicImageUrl(rawActive));

  useEffect(() => {
    if (product) {
      const raw = product.images[selectedImageIndex]?.url || product.images[0]?.url || '';
      setCurrentImageSrc(getPublicImageUrl(raw));
    }
  }, [product, selectedImageIndex]);

  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const primaryImage = getProductPrimaryImage(product.images);

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
                  src={currentImageSrc}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-all duration-300"
                  onError={() => setCurrentImageSrc(FALLBACK_WATCH_IMAGE)}
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => {
                    const thumb = getPublicImageUrl(img.url);
                    return (
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
                          src={thumb}
                          alt={`${product.name} preview ${idx + 1}`}
                          fill
                          sizes="56px"
                          className="object-cover"
                          onError={(e) => {
                            (e.target as any).src = FALLBACK_WATCH_IMAGE;
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                    {product.brand}
                  </span>
                  <span className="text-gray-500 font-mono">{product.sku}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-gold-300 font-cinzel">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.mrp)}
                    </span>
                  )}
                  {product.discountPercent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gold-500 text-obsidian-950">
                      Save {product.discountPercent}%
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {product.shortDescription || product.description}
                </p>

                {/* Micro Specs */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-obsidian-800">
                  <div className="text-gray-400">
                    Movement: <strong className="text-gray-200">{product.movement || 'Automatic'}</strong>
                  </div>
                  {product.caseDiameter && (
                    <div className="text-gray-400">
                      Diameter: <strong className="text-gray-200">{product.caseDiameter}</strong>
                    </div>
                  )}
                  {product.waterResistance && (
                    <div className="text-gray-400">
                      Water Resist: <strong className="text-gray-200">{product.waterResistance}</strong>
                    </div>
                  )}
                  <div className="text-gray-400">
                    Vault Status:{' '}
                    <strong className={isOutOfStock ? 'text-red-400' : 'text-emerald-400'}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} Available`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="space-y-3 pt-4 border-t border-obsidian-800">
                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-obsidian-700 rounded bg-obsidian-900">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      disabled={quantity >= product.stockQuantity || isOutOfStock}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="btn-gold flex-1 py-2.5 px-4 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Added to Collection</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isOutOfStock ? 'Out of Stock' : 'Acquire Timepiece'}</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-full py-2 rounded text-center text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Full Horological Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
