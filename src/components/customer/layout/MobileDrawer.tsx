'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight, ChevronDown, Search, Heart, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  brands: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  user?: { name: string; email: string; role: string } | null;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  brands,
  categories,
  user,
}) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useCartStore((state) => state.wishlist.length);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-obsidian-950 border-r border-obsidian-800 p-6 flex flex-col justify-between overflow-y-auto animate-slideDown">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-obsidian-800">
            <Link href="/" onClick={onClose} className="text-xl font-cinzel tracking-luxury text-gold-300 font-bold">
              AURELIA
            </Link>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded bg-obsidian-900 border border-obsidian-800 text-gray-400 text-sm hover:border-gold-500/30 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-gold-400" />
              <span>Search watches, calibers...</span>
            </span>
          </button>

          {/* Nav Links */}
          <nav className="mt-6 space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className="block px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
            >
              Home
            </Link>

            <Link
              href="/watches"
              onClick={onClose}
              className="block px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
            >
              Watches
            </Link>

            {/* Categories Accordion */}
            <div>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
              >
                <span>Categories</span>
                {isCategoriesOpen ? (
                  <ChevronDown className="w-4 h-4 text-gold-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {isCategoriesOpen && (
                <div className="pl-6 py-1 space-y-1 border-l border-obsidian-800 ml-3">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/watches/${c.slug}`}
                      onClick={onClose}
                      className="block py-2 text-sm text-gray-400 hover:text-gold-300"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Brands Accordion */}
            <div>
              <button
                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
              >
                <span>Brands</span>
                {isBrandsOpen ? (
                  <ChevronDown className="w-4 h-4 text-gold-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {isBrandsOpen && (
                <div className="pl-6 py-1 space-y-1 border-l border-obsidian-800 ml-3">
                  {brands.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/brands/${b.slug}`}
                      onClick={onClose}
                      className="block py-2 text-sm text-gray-400 hover:text-gold-300"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/collections"
              onClick={onClose}
              className="block px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
            >
              Collections
            </Link>

            <Link
              href="/contact"
              onClick={onClose}
              className="block px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
            >
              VIP Concierge
            </Link>

            <Link
              href="/track-order"
              onClick={onClose}
              className="block px-3 py-2.5 text-base text-gray-200 hover:text-gold-300 transition-colors rounded"
            >
              Track Order
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-obsidian-800 space-y-3">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/account/wishlist"
              onClick={onClose}
              className="relative p-2 text-gray-300 hover:text-gold-400 flex flex-col items-center gap-1"
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">Wishlist ({wishlistCount})</span>
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="relative p-2 text-gray-300 hover:text-gold-400 flex flex-col items-center gap-1"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">Cart ({cartCount})</span>
            </Link>

            <Link
              href={user ? '/account' : '/login'}
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-gold-400 flex flex-col items-center gap-1"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">
                {user ? 'Account' : 'Sign In'}
              </span>
            </Link>
          </div>

          {user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT'].includes(user.role) && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs uppercase tracking-luxury font-semibold hover:bg-gold-500/20 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
