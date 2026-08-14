import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Star, ShieldCheck, Check, X, Trash2 } from 'lucide-react';
import { AdminReviewsModerator } from './AdminReviewsModerator';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { id: true, name: true, sku: true, images: { take: 1, select: { url: true } } },
      },
      user: { select: { name: true, email: true } },
    },
  });

  const formatted = reviews.map((r) => ({
    id: r.id,
    productName: r.product.name,
    productSku: r.product.sku,
    productImage: r.product.images[0]?.url || '',
    userName: r.user.name,
    userEmail: r.user.email,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerifiedPurchase: r.isVerifiedPurchase,
    isApproved: r.isApproved,
    createdAt: formatDate(r.createdAt),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Curatorial Oversight
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Appraisal & Review Moderation ({reviews.length})
        </h1>
      </div>

      <AdminReviewsModerator initialReviews={formatted} />
    </div>
  );
}
