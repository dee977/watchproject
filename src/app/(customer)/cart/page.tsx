'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/currency';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponMessage, setCouponMessage] = useState('');

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getCartTotal());
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const discountAmount = useCartStore((state) => state.getDiscountAmount());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gold-400">Loading Vault...</div>;
  }

  const freeShippingThreshold = 50000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedGst = Math.round(taxableSubtotal * 0.18);
  const estimatedShipping = isFreeShipping ? 0 : 750;
  const grandTotal = taxableSubtotal + estimatedGst + estimatedShipping;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponStatus('loading');
    setCouponMessage('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        applyCoupon({
          code: data.coupon.code,
          type: data.coupon.type,
          discountValue: data.coupon.discountValue,
          description: data.coupon.description,
        });
        setCouponStatus('success');
        setCouponMessage(`Privilege voucher ${data.coupon.code} applied.`);
        setCouponInput('');
      } else {
        setCouponStatus('error');
        setCouponMessage(data.error || 'Invalid privilege code.');
      }
    } catch (err) {
      setCouponStatus('error');
      setCouponMessage('Failed to validate voucher.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-obsidian-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-gold-400" />
          <span>Vault Acquisitions</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review your selected timepieces before proceeding to armored transit checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center space-y-5 bg-obsidian-900/30 rounded-xl border border-obsidian-800 p-8 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-obsidian-900 border border-obsidian-800 flex items-center justify-center text-gold-500/50 mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-cinzel font-bold text-white">Your cart is waiting for something timeless.</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Explore our master chronometers, grand complications, and certified Swiss and Japanese horology.
            </p>
          </div>
          <Link
            href="/watches"
            className="btn-gold px-8 py-3.5 rounded text-xs font-bold uppercase tracking-luxury inline-flex items-center gap-2 group"
          >
            <span>Explore Horology Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Items Table / List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping banner */}
            <div className="p-4 rounded-lg bg-obsidian-900/60 border border-obsidian-800 text-xs">
              {isFreeShipping ? (
                <div className="flex items-center gap-2 text-gold-300 font-medium">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Complimentary Insured Armored Vault Delivery Unlocked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-300">
                  <Truck className="w-4 h-4 text-gold-400" />
                  <span>Add <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> more for complimentary armored delivery</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-obsidian-900/50 border border-obsidian-800 rounded-lg hover:border-gold-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                        {item.brand} • <span className="font-mono text-gray-500">{item.sku}</span>
                      </span>
                      <Link
                        href={`/product/${item.slug}`}
                        className="block text-sm font-cinzel font-bold text-white hover:text-gold-300 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs font-semibold text-gold-300">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-obsidian-800">
                    <div className="flex items-center border border-obsidian-700 rounded bg-obsidian-950">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 text-gray-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-cinzel font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Coupon Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Privilege Coupon Box */}
            <div className="p-6 bg-obsidian-900/60 border border-obsidian-800 rounded-lg space-y-4">
              <h3 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Privilege Voucher</span>
              </h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded bg-gold-500/10 border border-gold-500/30 text-xs">
                  <div>
                    <span className="font-bold text-gold-300">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-gray-400">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. AURELIA10"
                      className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none uppercase font-mono"
                    />
                    <button
                      type="submit"
                      disabled={couponStatus === 'loading' || !couponInput.trim()}
                      className="btn-gold px-4 py-2 rounded text-xs font-semibold disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>

                  {couponStatus === 'success' && (
                    <div className="text-emerald-400 text-xs flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{couponMessage}</span>
                    </div>
                  )}
                  {couponStatus === 'error' && (
                    <div className="text-rose-400 text-xs flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{couponMessage}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-6 bg-obsidian-900/60 border border-obsidian-800 rounded-lg space-y-4 text-xs">
              <h3 className="font-cinzel text-xs uppercase tracking-luxury text-white font-bold pb-3 border-b border-obsidian-800">
                Acquisition Summary
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-gray-400">
                  <span>Vault Subtotal</span>
                  <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-gold-400 font-semibold">
                    <span>Privilege Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Goods & Services Tax (18% GST)</span>
                  <span className="text-white font-semibold">{formatPrice(estimatedGst)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Armored Transport & Insurance</span>
                  <span className={isFreeShipping ? 'text-emerald-400 font-semibold' : 'text-white'}>
                    {isFreeShipping ? 'Complimentary' : formatPrice(estimatedShipping)}
                  </span>
                </div>

                <div className="flex justify-between text-base pt-3 border-t border-obsidian-800 text-white font-bold">
                  <span>Grand Total</span>
                  <span className="text-gold-300 font-cinzel text-xl">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="w-full btn-gold py-4 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Vault Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>256-Bit SSL Escrow Verification • 14-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
