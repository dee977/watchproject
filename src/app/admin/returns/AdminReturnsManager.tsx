'use client';

import React, { useState } from 'react';
import { RotateCcw, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  reason: string;
  description?: string | null;
  status: string;
  refundAmount?: number | null;
  adminNotes?: string | null;
  orderTotal: number;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export const AdminReturnsManager: React.FC<{ initialReturns: ReturnItem[] }> = ({
  initialReturns,
}) => {
  const [returns, setReturns] = useState<ReturnItem[]>(initialReturns);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setReturns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {returns.length === 0 ? (
        <div className="p-8 text-center bg-obsidian-900/40 border border-obsidian-800 rounded-xl text-xs text-gray-500">
          No return requests pending in the queue.
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-3">
                <div>
                  <span className="font-mono font-bold text-gold-300 text-sm">
                    Order Ref: {r.orderNumber}
                  </span>
                  <p className="text-gray-400">
                    Client: <strong className="text-white">{r.userName}</strong> ({r.userEmail}) • Requested: {r.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.status === 'APPROVED' || r.status === 'REFUNDED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : r.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="font-cinzel font-bold text-white text-sm">
                    {formatPrice(r.orderTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <strong className="text-gold-300 block">Reason: {r.reason}</strong>
                {r.description && <p className="text-gray-300 italic">&quot;{r.description}&quot;</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-obsidian-800">
                {r.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                      disabled={loadingId === r.id}
                      className="px-3 py-1.5 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 font-semibold"
                    >
                      Reject Return
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                      disabled={loadingId === r.id}
                      className="btn-gold px-4 py-1.5 rounded font-semibold"
                    >
                      Approve & Dispatch Armored Pickup
                    </button>
                  </>
                )}

                {r.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'REFUNDED')}
                    disabled={loadingId === r.id}
                    className="btn-gold px-4 py-1.5 rounded font-semibold"
                  >
                    Execute Escrow Refund Settlement
                  </button>
                )}

                {r.status === 'REFUNDED' && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Refund Fully Settled</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
