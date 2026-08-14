'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItemType {
  id: string; // Product ID
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  image: string;
  brand: string;
  quantity: number;
  maxStock: number;
}

export interface WishlistItemType {
  productId: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  image: string;
  brand: string;
}

interface CartStore {
  items: CartItemType[];
  wishlist: WishlistItemType[];
  isCartDrawerOpen: boolean;
  appliedCoupon: {
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    description: string;
  } | null;

  // Cart actions
  addItem: (item: Omit<CartItemType, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  applyCoupon: (coupon: CartStore['appliedCoupon']) => void;
  removeCoupon: () => void;

  // Wishlist actions
  addToWishlist: (item: WishlistItemType) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: WishlistItemType) => void;

  // Computed helpers
  getCartTotal: () => number;
  getCartCount: () => number;
  getDiscountAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      isCartDrawerOpen: false,
      appliedCoupon: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.productId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            const newQty = Math.min(
              currentItem.quantity + quantity,
              currentItem.maxStock || 99
            );
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: newQty,
            };
            return { items: updatedItems, isCartDrawerOpen: true };
          }

          const newItem: CartItemType = {
            ...product,
            id: product.productId,
            quantity: Math.min(quantity, product.maxStock || 99),
          };

          return {
            items: [...state.items, newItem],
            isCartDrawerOpen: true,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              const safeQty = Math.min(quantity, item.maxStock || 99);
              return { ...item, quantity: safeQty };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () =>
        set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      // Wishlist
      addToWishlist: (item) => {
        set((state) => {
          if (state.wishlist.some((w) => w.productId === item.productId)) {
            return state;
          }
          return { wishlist: [...state.wishlist, item] };
        });
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.productId !== productId),
        }));
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.some((w) => w.productId === productId);
      },

      toggleWishlist: (item) => {
        const isIn = get().isInWishlist(item.productId);
        if (isIn) {
          get().removeFromWishlist(item.productId);
        } else {
          get().addToWishlist(item);
        }
      },

      // Calculations
      getCartTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getCartTotal();
        const coupon = get().appliedCoupon;
        if (!coupon || subtotal <= 0) return 0;

        if (coupon.type === 'PERCENTAGE') {
          return Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          return Math.min(coupon.discountValue, subtotal);
        }
      },
    }),
    {
      name: 'aurelia_cart_store_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
