import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { RotateCcw, ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import { AdminReturnsManager } from '@/components/admin/AdminReturnsManager';

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  const formatted = returns.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderNumber: r.order.orderNumber,
    userName: r.user.name,
    userEmail: r.user.email,
    reason: r.reason,
    description: r.description,
    status: r.status,
    refundAmount: r.refundAmount,
    adminNotes: r.adminNotes,
    orderTotal: r.order.totalAmount,
    createdAt: formatDate(r.createdAt),
    items: r.order.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      price: i.totalPrice,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Customer Service & Returns
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          14-Day Vault Return Requests ({returns.length})
        </h1>
      </div>

      <AdminReturnsManager initialReturns={formatted} />
    </div>
  );
}
