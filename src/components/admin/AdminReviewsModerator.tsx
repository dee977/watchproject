'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, Check, X, Trash2, Loader2 } from 'lucide-react';

interface ReviewItem {
  id: string;
  productName: string;
  productSku: string;
  productImage: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export const AdminReviewsModerator: React.FC<{ initialReviews: ReviewItem[] }> = ({
  initialReviews,
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="p-8 text-center bg-obsidian-900/40 border border-obsidian-800 rounded-xl text-xs text-gray-500">
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 flex flex-col md:flex-row md:items-start justify-between gap-6 text-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-current' : 'text-obsidian-700'
                        }`}
                      />
                    ))}
                  </div>

                  <strong className="text-white text-sm">{r.title}</strong>

                  {r.isVerifiedPurchase && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Acquisition</span>
                    </span>
                  )}
                </div>

                <p className="text-gray-300 leading-relaxed">{r.comment}</p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                  <span>Author: <strong className="text-gray-400">{r.userName}</strong> ({r.userEmail})</span>
                  <span>•</span>
                  <span>Piece: <strong className="text-gold-300">{r.productName}</strong></span>
                  <span>•</span>
                  <span>{r.createdAt}</span>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => handleToggleApprove(r.id, r.isApproved)}
                  disabled={loadingId === r.id}
                  className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    r.isApproved
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                      : 'bg-gold-500 text-obsidian-950 hover:bg-gold-400'
                  }`}
                >
                  {r.isApproved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={loadingId === r.id}
                  className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-gray-500 hover:text-rose-400"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
