'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Banknote,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/currency';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.getCartTotal());
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const discountAmount = useCartStore((state) => state.getDiscountAmount());

  // Form states
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    fullName: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
  });

  const [deliveryType, setDeliveryType] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);

    // Fetch user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSessionUser(data.user);
          setContactInfo({
            email: data.user.email,
            phone: data.user.phone || '',
            fullName: data.user.name || '',
          });

          if (data.user.addresses && data.user.addresses.length > 0) {
            const defAddr = data.user.addresses[0];
            setShippingAddress({
              fullName: defAddr.fullName || data.user.name,
              phone: defAddr.phone || data.user.phone || '',
              addressLine1: defAddr.addressLine1,
              addressLine2: defAddr.addressLine2 || '',
              landmark: defAddr.landmark || '',
              city: defAddr.city,
              state: defAddr.state,
              postalCode: defAddr.postalCode,
              country: defAddr.country || 'India',
            });
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoadingSession(false));
  }, []);

  if (!mounted || isLoadingSession) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gold-400">Loading Checkout Security Protocol...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-4">
        <h2 className="text-2xl font-cinzel font-bold text-white">Your Vault is Empty</h2>
        <p className="text-xs text-gray-400">Add timepieces to your cart before proceeding to checkout.</p>
        <Link href="/watches" className="btn-gold px-6 py-2.5 rounded text-xs font-semibold inline-block">
          Explore Timepieces
        </Link>
      </div>
    );
  }

  const freeShippingThreshold = 50000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.18);
  const shippingAmount = isFreeShipping
    ? (deliveryType === 'EXPRESS' ? 1850 : 0)
    : (deliveryType === 'EXPRESS' ? 1850 : 750);
  const codFee = 250;
  const grandTotal = taxableSubtotal + taxAmount + shippingAmount + codFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      // Create Cash on Delivery order on server
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            ...shippingAddress,
            fullName: shippingAddress.fullName || contactInfo.fullName,
            phone: shippingAddress.phone || contactInfo.phone,
          },
          paymentMethod: 'COD',
          couponCode: appliedCoupon?.code,
          deliveryType,
          customerNotes,
          guestEmail: contactInfo.email,
          guestPhone: contactInfo.phone,
          guestName: contactInfo.fullName,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // Order created successfully with Cash on Delivery
      clearCart();
      router.push(`/order/${orderData.orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-obsidian-800 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cinzel font-bold text-white flex items-center gap-3">
            <Lock className="w-6 h-6 text-gold-400" />
            <span>Vault Armored Checkout</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            White-Glove Cash on Delivery • Armored Insured Transport
          </p>
        </div>

        {!sessionUser && (
          <Link
            href="/login?redirect=/checkout"
            className="text-xs text-gold-400 hover:text-gold-300 underline font-medium"
          >
            Sign in to access saved addresses
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Checkout Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Client Contact */}
            <div className="p-6 rounded-lg bg-obsidian-900/60 border border-obsidian-800 space-y-4">
              <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center text-xs">1</span>
                <span>Client Identification</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-400 font-medium block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactInfo.fullName}
                    onChange={(e) => setContactInfo({ ...contactInfo, fullName: e.target.value })}
                    placeholder="e.g. Lord Alistair Vance"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium block">Email Address (For Invoicing) *</label>
                  <input
                    type="email"
                    required
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="concierge@collector.com"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium block">Telephone (For Delivery Protocol) *</label>
                  <input
                    type="tel"
                    required
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Armored Delivery Address */}
            <div className="p-6 rounded-lg bg-obsidian-900/60 border border-obsidian-800 space-y-4">
              <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center text-xs">2</span>
                <span>Armored Destination & Vault Address</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium block">Address Line 1 (Suite / Villa / Street) *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="Penthouse 42B, Oberoi Sky Heights"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium block">Address Line 2 (Tower / Complex / Landmark)</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    placeholder="Near Private Helipad / Bandra West"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium block">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium block">State *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium block">Postal / PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      placeholder="400050"
                      className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-600 font-mono focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery Method */}
            <div className="p-6 rounded-lg bg-obsidian-900/60 border border-obsidian-800 space-y-4">
              <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center text-xs">3</span>
                <span>Armored Transport Speed</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  onClick={() => setDeliveryType('STANDARD')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    deliveryType === 'STANDARD'
                      ? 'bg-gold-500/10 border-gold-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Standard Armored Logistics</span>
                    <span className="font-mono text-gold-400">{isFreeShipping ? 'COMPLIMENTARY' : '₹750'}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">3 - 5 Business Days with GPS Tamper Seals.</p>
                </label>

                <label
                  onClick={() => setDeliveryType('EXPRESS')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    deliveryType === 'EXPRESS'
                      ? 'bg-gold-500/10 border-gold-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Priority Armed Courier</span>
                    <span className="font-mono text-gold-400">₹1,850</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Guaranteed 24-48h dispatch via BlueDart Apex Vault.</p>
                </label>
              </div>
            </div>

            {/* 4. Payment Method: Cash on Delivery Only */}
            <div className="p-6 rounded-lg bg-obsidian-900/60 border border-obsidian-800 space-y-4">
              <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center text-xs">4</span>
                <span>Payment & Settlement</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-gold-500/10 border-gold-500 text-white">
                  <Banknote className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">Cash on Delivery (COD)</div>
                      <span className="font-mono text-gold-400">+₹250 Handling Fee</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      Pay in cash upon physical verification and white-glove handover by our certified armored courier. No advance payment required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Concierge Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="text-gray-400 font-medium block">Concierge Instructions / Vault Packaging Notes</label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Please size bracelet to 7.25 inches or include gift card message."
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="p-6 rounded-lg bg-obsidian-900/60 border border-obsidian-800 space-y-6 text-xs">
              <h3 className="font-cinzel text-sm uppercase tracking-luxury text-white font-bold pb-3 border-b border-obsidian-800">
                Acquisition Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              {/* Items preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-semibold text-gold-300">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price calculations */}
              <div className="space-y-2.5 pt-4 border-t border-obsidian-800">
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
                  <span>GST (18% Applicable)</span>
                  <span className="text-white font-semibold">{formatPrice(taxAmount)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Armored Insured Shipping</span>
                  <span className="text-white font-semibold">
                    {shippingAmount === 0 ? (
                      <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
                    ) : (
                      formatPrice(shippingAmount)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>COD Handling Fee</span>
                  <span className="text-white font-semibold">{formatPrice(codFee)}</span>
                </div>

                <div className="pt-3 border-t border-obsidian-800 flex justify-between items-end">
                  <div>
                    <span className="text-sm font-bold text-white block">Total Acquisition Value</span>
                    <span className="text-[10px] text-gray-500">Payable in Cash on Delivery</span>
                  </div>
                  <span className="font-cinzel text-xl font-bold text-gold-300">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-gold py-3.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Allocating Vault Manifest...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order (Cash on Delivery)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[10px] text-gray-500 text-center space-y-1">
                <p>• 100% Certified Authentic with Global Warranty</p>
                <p>• Inspection Privilege upon Handover</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
