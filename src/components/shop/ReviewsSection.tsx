'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, AlertCircle, MessageSquarePlus, ThumbsUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
  user: {
    name: string;
  };
}

interface ReviewsSectionProps {
  productId: string;
  productName: string;
  reviews: ReviewItem[];
  user?: { id: string; name: string } | null;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  productName,
  reviews = [],
  user,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Compute rating metrics
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !comment) return;

    setStatus('loading');
    setStatusMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMessage('Your horological appraisal has been submitted for moderation.');
        setTitle('');
        setComment('');
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus('idle');
        }, 1800);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to submit appraisal.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage('Network connection error. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8 bg-obsidian-900/40 border border-obsidian-800 rounded-lg items-center">
        {/* Average Score */}
        <div className="md:col-span-4 text-center md:text-left space-y-2 md:border-r border-obsidian-800 md:pr-8">
          <div className="text-4xl md:text-5xl font-cinzel font-bold text-gold-300">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating) ? 'fill-current' : 'text-obsidian-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Based on {reviewCount} verified collector {reviewCount === 1 ? 'appraisal' : 'appraisals'}
          </p>
        </div>

        {/* Rating Distribution Bar */}
        <div className="md:col-span-5 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-xs text-gray-400">
              <span className="w-12 text-right font-mono">{d.stars} Stars</span>
              <div className="flex-1 h-1.5 bg-obsidian-950 rounded-full overflow-hidden border border-obsidian-800">
                <div
                  className="h-full bg-gold-400 rounded-full transition-all duration-500"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <span className="w-8 font-mono text-[10px] text-gray-500">{d.count}</span>
            </div>
          ))}
        </div>

        {/* Submit Review CTA */}
        <div className="md:col-span-3 text-center md:text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-gold py-3 px-6 rounded text-xs font-semibold uppercase tracking-luxury flex items-center justify-center gap-2 mx-auto md:ml-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write Appraisal</span>
          </button>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-obsidian-900/20 border border-obsidian-800 rounded-lg p-6 space-y-2">
            <h4 className="font-cinzel text-base text-white">No Client Appraisals Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Be the first connoisseur to share an appraisal of the {productName}.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="p-6 bg-obsidian-900/30 border border-obsidian-800/80 rounded-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-300 font-semibold text-xs flex items-center justify-center">
                    {r.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white">{r.user.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Acquisition</span>
                      </span>
                    )}
                  </div>
                </div>

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
                  <span className="text-[10px] text-gray-500 font-mono">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
              </div>

              <h5 className="font-cinzel text-sm font-bold text-white pt-1">{r.title}</h5>
              <p className="text-xs text-gray-300 leading-relaxed">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="min-h-screen px-4 flex items-center justify-center py-12">
            <div className="relative w-full max-w-lg bg-obsidian-950 border border-gold-500/30 rounded-lg p-6 md:p-8 shadow-2xl text-white z-10 animate-scaleIn space-y-6">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Client Horological Appraisal
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Share your experience with the {productName}.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-gold-400 font-semibold block">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= rating ? 'fill-current' : 'text-obsidian-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-gold-400 font-semibold block">
                    Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Masterful finishing and timing accuracy"
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-gold-400 font-semibold block">
                    Detailed Observations
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the dial finishing, comfort on the wrist, movement winding feel..."
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {status === 'success' && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded bg-obsidian-900 border border-obsidian-800 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 btn-gold py-2.5 rounded text-xs font-semibold uppercase tracking-luxury disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Submitting...' : 'Publish Appraisal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
