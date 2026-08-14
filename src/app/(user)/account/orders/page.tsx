import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Package, Truck, ExternalLink, Printer, ArrowRight } from 'lucide-react';

export default async function AccountOrdersPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      shipments: true,
      payments: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <h2 className="text-xl font-cinzel font-bold text-white">
          My Acquisitions & Orders
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          History of all certified timepieces and real-time courier statuses.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center bg-obsidian-900/30 border border-obsidian-800 rounded-xl space-y-4">
          <Package className="w-10 h-10 text-gold-400/50 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-cinzel font-bold text-white">No Acquisitions Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Your personal vault is waiting for its first timepiece.
            </p>
          </div>
          <Link href="/watches" className="btn-gold px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury inline-block">
            Explore Watches
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipment = order.shipments[0];

            return (
              <div
                key={order.id}
                className="p-6 rounded-xl bg-obsidian-900/50 border border-obsidian-800 space-y-6"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800/80 pb-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gold-300 text-sm">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} type="order" />
                    </div>
                    <p className="text-gray-400">
                      Acquisition Date: <strong className="text-white">{formatDate(order.createdAt)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-cinzel font-bold text-white text-base">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="btn-outline-gold px-4 py-2 rounded text-xs font-semibold"
                    >
                      Order Details
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <div className="relative w-12 h-12 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {item.brandName} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>

                      <span className="font-semibold text-gold-300">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking / Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-obsidian-800/60 text-xs">
                  {shipment ? (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Truck className="w-4 h-4 text-gold-400" />
                      <span>
                        {shipment.courierName} • Tracking:{' '}
                        <strong className="text-gold-300 font-mono">{shipment.trackingNumber}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Vault Logistics: Preparing Allocation</span>
                  )}

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/track-order?orderNumber=${order.orderNumber}`}
                      className="text-gold-400 hover:text-gold-300 underline font-medium flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Telemetry</span>
                    </Link>
                    <Link
                      href={`/order/${order.orderNumber}`}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
