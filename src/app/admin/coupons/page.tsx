import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { Tag, Plus, Trash2, Calendar, Users } from 'lucide-react';
import { AdminCouponsManager } from '@/components/admin/AdminCouponsManager';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { usages: true } },
    },
  });

  const formatted = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    type: c.type,
    discountValue: c.discountValue,
    minOrderAmount: c.minOrderAmount,
    maxDiscountAmount: c.maxDiscountAmount,
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    totalUsages: c._count.usages,
    perUserLimit: c.perUserLimit,
    isActive: c.isActive,
    endDate: c.endDate ? formatDate(c.endDate) : null,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Promotions & Privileges
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Privilege Vouchers & Codes ({coupons.length})
        </h1>
      </div>

      <AdminCouponsManager initialCoupons={formatted} />
    </div>
  );
}
