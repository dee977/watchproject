import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Search, Eye, Filter, Truck } from 'lucide-react';

interface AdminOrdersPageProps {
  searchParams: { status?: string; q?: string };
}

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const statusFilter = searchParams.status || 'ALL';
  const query = searchParams.q?.trim() || '';

  const where: any = {};
  if (statusFilter !== 'ALL') {
    where.status = statusFilter;
  }
  if (query) {
    where.OR = [
      { orderNumber: { contains: query } },
      { guestEmail: { contains: query } },
      { guestName: { contains: query } },
      { user: { name: { contains: query } } },
      { user: { email: { contains: query } } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        shipments: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Fulfillment Telemetry
          </span>
          <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
            Acquisition Orders ({totalCount})
          </h1>
        </div>
      </div>

      {/* Filter status tabs & search bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {statuses.map((st) => (
            <Link
              key={st}
              href={`/admin/orders?status=${st}${query ? `&q=${query}` : ''}`}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-gold-500 text-obsidian-950 shadow-gold'
                  : 'bg-obsidian-900 border border-obsidian-800 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-obsidian-900/60 border border-obsidian-800 flex items-center gap-3 text-xs">
          <Search className="w-4 h-4 text-gray-500" />
          <form method="GET" className="flex-1">
            <input type="hidden" name="status" value={statusFilter} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by order reference (e.g. AUR-2026), client name, or email..."
              className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-obsidian-800 overflow-hidden bg-obsidian-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury font-cinzel text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Client</th>
                <th className="p-4">Settlement</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Acquisition Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              {orders.map((order) => {
                const clientName = order.user?.name || order.guestName || 'VIP Guest';
                const clientEmail = order.user?.email || order.guestEmail || '';

                return (
                  <tr key={order.id} className="hover:bg-obsidian-900/80 transition-colors text-gray-300">
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-gold-300 hover:underline block"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[10px] text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'Timepiece' : 'Timepieces'}
                      </span>
                    </td>

                    <td className="p-4">
                      <strong className="text-white block">{clientName}</strong>
                      <span className="text-[10px] text-gray-500">{clientEmail}</span>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">{formatPrice(order.totalAmount)}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{order.paymentMethod}</div>
                    </td>

                    <td className="p-4">
                      <OrderStatusBadge status={order.status} type="order" />
                    </td>

                    <td className="p-4">
                      <OrderStatusBadge status={order.paymentStatus} type="payment" />
                    </td>

                    <td className="p-4 text-gray-400 font-mono">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn-outline-gold px-3 py-1.5 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Fulfill & Track</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
