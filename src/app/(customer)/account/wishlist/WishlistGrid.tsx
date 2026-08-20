'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/lib/cart-store';
import { getProductImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  mrp: number;
  image: string;
  inStock: boolean;
  maxStock: number;
}

export const WishlistGrid: React.FC<{ initialItems: WishlistItem[] }> = ({ initialItems }) => {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const addItem = useCartStore((state) => state.addItem);
  const removeFromWishlist = useCartStore((state) => state.removeFromWishlist);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) return;
    addItem(
      {
        id: item.productId,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        brand: item.brand,
        price: item.price,
        mrp: item.mrp,
        image: item.image,
        maxStock: item.maxStock,
      },
      1
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center bg-obsidian-900/30 border border-obsidian-800 rounded-xl space-y-4">
        <Heart className="w-10 h-10 text-gold-400/50 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-cinzel font-bold text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Save timepieces you are considering for future acquisitions.
          </p>
        </div>
        <Link href="/watches" className="btn-gold px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury inline-block">
          Explore Watches
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.productId}
          className="p-4 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="relative aspect-square rounded-lg bg-obsidian-950 overflow-hidden border border-obsidian-800/80">
              <Image
                src={getProductImageUrl(item.image, FALLBACK_WATCH_IMAGE)}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
                onError={(e) => {
                  (e.target as any).src = FALLBACK_WATCH_IMAGE;
                }}
              />
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-2.5 right-2.5 p-2 rounded-full bg-obsidian-950/80 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-luxury text-gold-400 font-cinzel font-semibold block">
                {item.brand}
              </span>
              <Link
                href={`/product/${item.slug}`}
                className="font-cinzel font-bold text-white text-sm hover:text-gold-300 transition-colors block line-clamp-1"
              >
                {item.name}
              </Link>
              <div className="text-xs font-bold text-gold-300 font-cinzel mt-1">
                {formatPrice(item.price)}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleAddToCart(item)}
              disabled={!item.inStock}
              className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 ${
                item.inStock ? 'btn-gold' : 'bg-obsidian-950 text-gray-500 cursor-not-allowed border border-obsidian-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{item.inStock ? 'Acquire' : 'Allocated'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
