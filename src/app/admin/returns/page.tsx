import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { AdminReturnsManager } from '@/components/admin/AdminReturnsManager';

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage() {
  let returns: any[] = [];
  try {
    returns = await prisma.returnRequest.findMany({
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
  } catch (error) {
    console.error('[AdminReturnsPage] Returns query error:', error);
  }

  const formatted = (returns || []).map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderNumber: r.order?.orderNumber || 'N/A',
    userName: r.user?.name || 'VIP Client',
    userEmail: r.user?.email || '',
    reason: r.reason,
    description: r.description,
    status: r.status,
    refundAmount: r.refundAmount,
    adminNotes: r.adminNotes,
    orderTotal: r.order?.totalAmount || 0,
    createdAt: formatDate(r.createdAt),
    items: (r.order?.items || []).map((i: any) => ({
      name: i.productName || 'Timepiece',
      quantity: i.quantity || 1,
      price: i.totalPrice || 0,
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
