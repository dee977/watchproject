'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  Star,
  Plus,
  Minus,
  Check,
  MapPin,
  Bell,
  Mail,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useCartStore } from '@/lib/cart-store';
import { WishlistButton } from '@/components/customer/shop/WishlistButton';
import { PriceAlertModal } from '@/components/customer/shop/PriceAlertModal';
import { StockNotificationModal } from '@/components/customer/shop/StockNotificationModal';

interface ProductPurchasePanelProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    price: number;
    mrp: number;
    discountPercent?: number;
    movement: string;
    gender?: string;
    caseMaterial?: string | null;
    caseDiameter?: string | null;
    caseThickness?: string | null;
    waterResistance?: string | null;
    powerReserve?: string | null;
    warranty?: string | null;
    condition?: string;
    stockQuantity: number;
    images: Array<{ url: string }>;
    shortDescription?: string | null;
    averageRating: number;
    reviewCount: number;
  };
}

export const ProductPurchasePanel: React.FC<ProductPurchasePanelProps> = ({ product }) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [isStockAlertOpen, setIsStockAlertOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const primaryImage = product.images[0]?.url || '';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand.name,
        price: product.price,
        mrp: product.mrp,
        image: primaryImage,
        maxStock: product.stockQuantity,
      },
      quantity
    );
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand.name,
        price: product.price,
        mrp: product.mrp,
        image: primaryImage,
        maxStock: product.stockQuantity,
      },
      quantity
    );
    router.push('/checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) return;

    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formatted = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(deliveryDate);
      setDeliveryEstimate(`Guaranteed Armored Delivery by ${formatted} to PIN ${pincode}`);
    }, 400);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Brand & Reference */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href={`/brands/${product.brand.slug}`}
            className="uppercase tracking-luxury text-gold-400 font-cinzel font-semibold hover:underline"
          >
            {product.brand.name}
          </Link>
          <span className="text-gray-400 font-mono">Ref: {product.sku}</span>
        </div>

        {/* Product Title */}
        <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-white leading-tight">
          {product.name}
        </h1>

        {/* Rating & Short description */}
        <div className="flex items-center gap-4 text-xs">
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(product.averageRating) ? 'fill-current' : 'text-obsidian-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-white">({product.reviewCount} Appraisals)</span>
            </div>
          )}
          <span className="text-gray-500">•</span>
          <span className="text-gray-300 font-mono text-[11px]">{product.condition}</span>
        </div>

        {/* Price Box */}
        <div className="p-5 rounded-lg bg-obsidian-900/80 border border-obsidian-800 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-cinzel font-bold text-gold-300">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gold-500/10 text-gold-300 border border-gold-500/30">
                  Save {product.discountPercent || Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Includes all applicable GST and duties</span>
            <span>Complimentary transit insurance</span>
          </div>
        </div>

        {/* Key Features Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded bg-obsidian-900/60 border border-obsidian-800 text-gray-300">
            <span className="text-[10px] uppercase text-gray-500 block">Movement</span>
            <span className="font-medium text-white">{product.movement}</span>
          </div>
          {product.caseDiameter && (
            <div className="p-2.5 rounded bg-obsidian-900/60 border border-obsidian-800 text-gray-300">
              <span className="text-[10px] uppercase text-gray-500 block">Case Diameter</span>
              <span className="font-medium text-white">{product.caseDiameter}</span>
            </div>
          )}
          {product.waterResistance && (
            <div className="p-2.5 rounded bg-obsidian-900/60 border border-obsidian-800 text-gray-300">
              <span className="text-[10px] uppercase text-gray-500 block">Water Resistance</span>
              <span className="font-medium text-white">{product.waterResistance}</span>
            </div>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="text-xs">
          {isOutOfStock ? (
            <div className="flex items-center justify-between p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <span className="font-medium">Currently Vault Allocated (Out of Stock)</span>
              <button
                onClick={() => setIsStockAlertOpen(true)}
                className="text-gold-400 hover:text-gold-300 underline font-semibold flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Notify Me</span>
              </button>
            </div>
          ) : isLowStock ? (
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Only {product.stockQuantity} pieces remaining in vault</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>In Stock • Ready for Armored Vault Dispatch</span>
            </div>
          )}
        </div>

        {/* Purchase Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            {!isOutOfStock && (
              <div className="flex items-center border border-obsidian-700 rounded bg-obsidian-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-400 hover:text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="p-3 text-gray-400 hover:text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 btn-gold py-3.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 ${
                isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
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

            {/* Wishlist Button */}
            <WishlistButton
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                brand: product.brand.name,
                price: product.price,
                mrp: product.mrp,
                image: primaryImage,
              }}
              className="p-3.5"
            />
          </div>

          {/* Buy Now Direct Button */}
          {!isOutOfStock && (
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded bg-obsidian-900 border border-gold-500/40 hover:border-gold-400 text-gold-300 text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 hover:bg-gold-500/10 transition-colors"
            >
              <Zap className="w-4 h-4 text-gold-400" />
              <span>Express Vault Checkout</span>
            </button>
          )}

          {/* Price Drop Alert Trigger */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setIsPriceAlertOpen(true)}
              className="text-xs text-gray-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-gold-400" />
              <span>Notify me when price drops</span>
            </button>
          </div>
        </div>

        {/* PIN Code Delivery Estimator */}
        <div className="p-4 rounded bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Check Armored Delivery Timeline</span>
          </span>

          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit PIN code (e.g. 400051)"
              className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCheckingPincode || pincode.length < 6}
              className="btn-outline-gold px-4 py-2 rounded text-xs font-semibold disabled:opacity-40"
            >
              {isCheckingPincode ? 'Verifying...' : 'Check'}
            </button>
          </form>

          {deliveryEstimate && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <Truck className="w-3.5 h-3.5" />
              <span>{deliveryEstimate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-obsidian-950/95 backdrop-blur-md border-t border-obsidian-800 p-4 z-40 flex items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-luxury font-cinzel">
            {product.brand.name}
          </div>
          <div className="text-base font-bold text-gold-300 font-cinzel">
            {formatPrice(product.price)}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="btn-gold px-6 py-2.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-1.5 disabled:opacity-40"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? 'Sold Out' : 'Acquire'}</span>
        </button>
      </div>

      {/* Modals */}
      <PriceAlertModal
        productId={product.id}
        productName={product.name}
        currentPrice={product.price}
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
      />

      <StockNotificationModal
        productId={product.id}
        productName={product.name}
        isOpen={isStockAlertOpen}
        onClose={() => setIsStockAlertOpen(false)}
      />
    </>
  );
};
