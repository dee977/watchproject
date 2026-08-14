'use client';

import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  type: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  totalUsages: number;
  perUserLimit: number;
  isActive: boolean;
  endDate?: string | null;
}

export const AdminCouponsManager: React.FC<{ initialCoupons: CouponItem[] }> = ({
  initialCoupons,
}) => {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 50000,
    maxDiscountAmount: 15000,
    usageLimit: 100,
    perUserLimit: 1,
    endDate: '',
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrderAmount: Number(formData.minOrderAmount),
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          endDate: formData.endDate ? formData.endDate : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon.');
      }

      setCoupons([
        {
          id: data.coupon.id,
          code: data.coupon.code,
          description: data.coupon.description,
          type: data.coupon.type,
          discountValue: data.coupon.discountValue,
          minOrderAmount: data.coupon.minOrderAmount,
          maxDiscountAmount: data.coupon.maxDiscountAmount,
          usageLimit: data.coupon.usageLimit,
          usageCount: 0,
          totalUsages: 0,
          perUserLimit: data.coupon.perUserLimit,
          isActive: true,
          endDate: data.coupon.endDate,
        },
        ...coupons,
      ]);
      setIsModalOpen(false);
      setFormData({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 50000,
        maxDiscountAmount: 15000,
        usageLimit: 100,
        perUserLimit: 1,
        endDate: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating coupon.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Privilege Voucher</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-obsidian-800 overflow-hidden bg-obsidian-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury font-cinzel text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Benefit</th>
                <th className="p-4">Min. Acquisition</th>
                <th className="p-4 text-center">Usages / Cap</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-obsidian-900/80 transition-colors text-gray-300">
                  <td className="p-4">
                    <strong className="font-mono text-gold-300 font-bold text-sm block">
                      {c.code}
                    </strong>
                    <span className="text-[10px] text-gray-500">{c.description}</span>
                  </td>

                  <td className="p-4">
                    <strong className="text-white">
                      {c.type === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString('en-IN')} FLAT`}
                    </strong>
                    {c.maxDiscountAmount && (
                      <span className="text-[10px] text-gray-400 block">
                        Max: {formatPrice(c.maxDiscountAmount)}
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-mono text-gray-400">
                    {formatPrice(c.minOrderAmount)}
                  </td>

                  <td className="p-4 text-center font-mono">
                    <span className="text-white font-semibold">{c.usageCount}</span>
                    <span className="text-gray-500"> / {c.usageLimit || '∞'}</span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-gray-500 hover:text-rose-400"
                      title="Delete Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-400" />
                <span>Issue Privilege Voucher</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Voucher Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. PRIVILEGE15"
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white font-mono uppercase focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="15% Exclusive Allocation Discount"
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Min. Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-obsidian-900 text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold px-5 py-2 rounded font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Issue Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
