import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Package, Heart, MapPin, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default async function AccountOverviewPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const [recentOrders, wishlistCount, defaultAddress] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        shipments: true,
      },
    }),
    prisma.wishlistItem.count({
      where: { userId: session.userId },
    }),
    prisma.address.findFirst({
      where: { userId: session.userId, isDefaultShipping: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-2">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Collector Atelier
        </span>
        <h2 className="text-2xl font-cinzel font-bold text-white">
          Welcome Back, {session.name}
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          From this private portal, you can monitor live armored vault logistics, track your warranty documentation, and manage your private horological collection.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <div className="flex items-center justify-between text-gold-400">
            <Package className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-luxury font-cinzel">Acquisitions</span>
          </div>
          <div>
            <div className="text-2xl font-cinzel font-bold text-white">{recentOrders.length}</div>
            <p className="text-[11px] text-gray-400">Registered timepieces</p>
          </div>
          <Link href="/account/orders" className="text-xs text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 pt-1">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <div className="flex items-center justify-between text-gold-400">
            <Heart className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-luxury font-cinzel">Saved Vault</span>
          </div>
          <div>
            <div className="text-2xl font-cinzel font-bold text-white">{wishlistCount}</div>
            <p className="text-[11px] text-gray-400">Saved wishlist pieces</p>
          </div>
          <Link href="/account/wishlist" className="text-xs text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 pt-1">
            <span>View Wishlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <div className="flex items-center justify-between text-gold-400">
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-luxury font-cinzel">Vault Destination</span>
          </div>
          <div>
            {defaultAddress ? (
              <p className="text-xs text-white truncate font-medium">
                {defaultAddress.city}, {defaultAddress.state}
              </p>
            ) : (
              <p className="text-xs text-gray-400">No default address saved</p>
            )}
            <p className="text-[11px] text-gray-500">Primary delivery address</p>
          </div>
          <Link href="/account/addresses" className="text-xs text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 pt-1">
            <span>Manage Addresses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury">
            Recent Vault Orders
          </h3>
          <Link href="/account/orders" className="text-xs text-gold-400 hover:text-gold-300 font-medium">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No acquisitions placed yet. Browse the horological catalogue to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg bg-obsidian-950/60 border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold-300">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} type="order" />
                  </div>
                  <p className="text-gray-400">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-cinzel font-bold text-white text-sm">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="btn-outline-gold px-3.5 py-1.5 rounded text-[11px] font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
