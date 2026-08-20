'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/currency';
import { getProductImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';

interface CartDrawerProps {
  freeShippingThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  freeShippingThreshold = 50000,
}) => {
  const isOpen = useCartStore((state) => state.isCartDrawerOpen);
  const closeCartDrawer = useCartStore((state) => state.closeCartDrawer);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getCartTotal());

  if (!isOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Slide Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-obsidian-950 border-l border-obsidian-800 shadow-2xl flex flex-col justify-between animate-slideDown">
          {/* Header */}
          <div className="p-6 border-b border-obsidian-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
                <h2 className="font-cinzel text-lg font-bold tracking-luxury text-white">
                  Vault Acquisitions ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={closeCartDrawer}
                aria-label="Close cart drawer"
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-obsidian-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="mt-4 p-3 bg-obsidian-900 rounded border border-obsidian-800 text-xs">
              {remainingForFreeShipping > 0 ? (
                <div className="space-y-2">
                  <p className="text-gray-300 flex items-center justify-between">
                    <span>Add <strong className="text-gold-400">{formatPrice(remainingForFreeShipping)}</strong> for complimentary insured shipping</span>
                  </p>
                  <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                    <div
                      className="h-full gold-gradient-bg transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gold-300 font-medium">
                  <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>Complimentary Armored Vault Delivery Unlocked</span>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-obsidian-900 border border-obsidian-800 flex items-center justify-center text-gold-500/50">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-cinzel text-white">Your vault is empty</h3>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Your cart is waiting for something timeless. Explore our curated master chronometers.
                  </p>
                </div>
                <Link
                  href="/watches"
                  onClick={closeCartDrawer}
                  className="btn-gold px-6 py-2.5 rounded text-xs font-semibold mt-2"
                >
                  Explore Timepieces
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 bg-obsidian-900/60 rounded border border-obsidian-800/80 hover:border-gold-500/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 bg-obsidian-950 rounded overflow-hidden flex-shrink-0 border border-obsidian-800">
                    <Image
                      src={getProductImageUrl(item.image, FALLBACK_WATCH_IMAGE)}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={(e) => {
                        (e.target as any).src = FALLBACK_WATCH_IMAGE;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="text-[10px] uppercase tracking-luxury text-gold-400 font-semibold truncate">
                        {item.brand}
                      </div>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCartDrawer}
                        className="text-xs text-white font-medium hover:text-gold-300 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs font-semibold text-gold-300 mt-0.5">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-obsidian-700 rounded bg-obsidian-950">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove item"
                        className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-obsidian-800 bg-obsidian-950 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Armored Transport</span>
                  <span className="text-emerald-400">
                    {remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at Checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-obsidian-800 text-white font-bold">
                  <span>Estimated Total</span>
                  <span className="text-gold-300 font-cinzel text-base">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCartDrawer}
                  className="w-full btn-gold py-3 rounded text-center text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Vault Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCartDrawer}
                  className="w-full py-2.5 bg-obsidian-900 border border-obsidian-800 hover:border-gray-700 rounded text-center text-xs text-gray-300 font-medium block transition-colors"
                >
                  View Full Cart & Apply Privileges
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>256-Bit Escrow Vault Security • 14-Day Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
