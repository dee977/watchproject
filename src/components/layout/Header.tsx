'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  ShieldCheck,
  LogOut,
  Package,
} from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import { useCartStore } from '@/lib/cart-store';

interface HeaderProps {
  brands?: Array<{ name: string; slug: string; isFeatured: boolean }>;
  categories?: Array<{ name: string; slug: string }>;
  collections?: Array<{ name: string; slug: string; coverImage?: string | null }>;
  user?: { id: string; name: string; email: string; role: string } | null;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  brands = [],
  categories = [],
  collections = [],
  user = null,
  onOpenSearch,
}) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useCartStore((state) => state.wishlist.length);
  const openCartDrawer = useCartStore((state) => state.openCartDrawer);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserDropdownOpen(false);
      router.refresh();
      router.push('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      router.push('/search');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-obsidian-950/95 backdrop-blur-md border-b border-obsidian-800 shadow-luxury py-3'
            : 'bg-gradient-to-b from-obsidian-950 via-obsidian-950/90 to-transparent border-b border-white/5 py-4'
        }`}
      >
        {/* Top VIP Announcement Bar */}
        <div className="hidden md:flex justify-between items-center max-w-7xl mx-auto px-6 mb-2 text-[11px] uppercase tracking-luxury text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span>Complimentary Insured White-Glove Vault Transport on Acquisitions</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/track-order" className="hover:text-gold-300 transition-colors">
              Track Order
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gold-300 transition-colors">
              VIP Concierge: +91 22 8900 4400
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Left: Mobile Menu Trigger + Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open mobile navigation menu"
              className="lg:hidden text-gray-300 hover:text-gold-300 transition-colors p-1"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-luxury font-medium text-gray-300">
              <Link href="/" className="hover:text-gold-300 transition-colors py-2">
                Home
              </Link>

              <Link href="/watches" className="hover:text-gold-300 transition-colors py-2">
                Watches
              </Link>

              <Link href="/brands" className="hover:text-gold-300 transition-colors py-2">
                Brands
              </Link>

              <Link href="/collections" className="hover:text-gold-300 transition-colors py-2">
                Collections
              </Link>

              <Link href="/contact" className="hover:text-gold-300 transition-colors py-2">
                Concierge
              </Link>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="text-center">
            <Link href="/" className="inline-block group">
              <span className="block font-cinzel text-2xl md:text-3xl font-bold tracking-luxury gold-gradient-text transition-all group-hover:tracking-widest duration-300">
                AURELIA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.35em] text-gray-400 font-sans -mt-1">
                Haute Horlogerie
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Wishlist, Cart, User) */}
          <div className="flex items-center gap-4 md:gap-5 text-gray-300">
            {/* Search Trigger */}
            <button
              onClick={handleSearchClick}
              aria-label="Open search dialog"
              className="p-2 text-gray-300 hover:text-gold-300 transition-colors hover:scale-105"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon with Dynamic Badge */}
            <Link
              href="/account/wishlist"
              aria-label="View Wishlist"
              className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors hover:scale-105"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 font-bold text-[10px] flex items-center justify-center animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Dynamic Badge & Drawer Trigger */}
            <button
              onClick={openCartDrawer}
              aria-label="Open Shopping Bag"
              className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 font-bold text-[10px] flex items-center justify-center animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    aria-label="User profile menu"
                    className="flex items-center gap-1.5 p-1.5 rounded-full border border-gold-500/30 hover:border-gold-500 text-gray-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-300 font-semibold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {isUserDropdownOpen && (
                    <div
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                      className="absolute right-0 mt-3 w-56 bg-obsidian-950 border border-obsidian-800 rounded shadow-luxury py-2 z-50 text-xs animate-fadeIn"
                    >
                      <div className="px-4 py-2.5 border-b border-obsidian-800">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-gray-400 truncate text-[11px]">{user.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/20">
                          {user.role}
                        </span>
                      </div>

                      {['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT'].includes(user.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-gold-300 hover:bg-obsidian-900 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-gold-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-obsidian-900 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>Client Dashboard</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-obsidian-900 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>My Acquisitions</span>
                      </Link>

                      <Link
                        href="/account/wishlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-obsidian-900 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span>Saved Horology</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-obsidian-900 border-t border-obsidian-800 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in to your account"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-gold-500/40 text-gold-300 text-xs uppercase tracking-luxury hover:bg-gold-500/10 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenSearch={() => (onOpenSearch ? onOpenSearch() : router.push('/search'))}
        brands={brands}
        categories={categories}
        user={user}
      />
    </>
  );
};
