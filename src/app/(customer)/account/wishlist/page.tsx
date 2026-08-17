import React from 'react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WishlistGrid } from './WishlistGrid';

export default async function AccountWishlistPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const dbWishlist = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: {
      product: {
        include: {
          brand: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = dbWishlist.map((w) => ({
    id: w.id,
    productId: w.productId,
    name: w.product.name,
    slug: w.product.slug,
    sku: w.product.sku,
    brand: w.product.brand.name,
    price: w.product.price,
    mrp: w.product.mrp,
    image: w.product.images[0]?.url || '',
    inStock: (w.product.inventory?.stockQuantity ?? 0) > 0,
    maxStock: w.product.inventory?.stockQuantity ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <h2 className="text-xl font-cinzel font-bold text-white">
          Private Wishlist & Saved Pieces
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Curate timepieces for future acquisitions or allocation reservations.
        </p>
      </div>

      <WishlistGrid initialItems={formatted} />
    </div>
  );
}
