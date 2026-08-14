'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useCartStore, WishlistItemType } from '@/lib/cart-store';

interface WishlistButtonProps {
  product: WishlistItemType;
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = '',
  showText = false,
}) => {
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.productId));
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`group flex items-center justify-center gap-2 p-2 rounded-full transition-all duration-300 ${
        isInWishlist
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          : 'bg-obsidian-900/80 backdrop-blur-md text-gray-400 hover:text-white border border-obsidian-700 hover:border-gold-500/40'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-300 ${
          isInWishlist ? 'fill-current text-rose-500' : 'group-hover:scale-110'
        } ${animating ? 'scale-125' : ''}`}
      />
      {showText && (
        <span className="text-xs uppercase tracking-luxury font-medium">
          {isInWishlist ? 'Saved in Vault' : 'Save to Vault'}
        </span>
      )}
    </button>
  );
};
