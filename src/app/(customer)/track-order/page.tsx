import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface TrackOrderPageProps {
  searchParams: { orderNumber?: string; email?: string };
}

export const dynamic = 'force-dynamic';

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const query = searchParams.orderNumber?.trim();

  let order: any = null;
  if (query) {
    order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: query }, { id: query }],
      },
      include: {
        items: true,
        shipments: true,
      },
    });
  }

  const milestones = [
    { label: 'Order Confirmed', description: 'Acquisition registered in vault ledger', status: 'CONFIRMED' },
    { label: 'Vault Allocation & Inspection', description: 'Undergoing 18-point horological inspection & sealing', status: 'PROCESSING' },
    { label: 'Armored Vault Dispatch', description: 'Transferred to armored GPS courier escort', status: 'SHIPPED' },
    { label: 'Delivered to Destination', description: 'Physical biometric & signature handover completed', status: 'DELIVERED' },
  ];

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = order ? getMilestoneIndex(order.status) : 0;
  const shipment = order?.shipments?.[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Live Logistics Telemetry
        </span>
        <h1 className="text-3xl font-cinzel font-bold text-white">
          Armored Shipment Tracking
        </h1>
        <p className="text-xs text-gray-400">
          Enter your acquisition reference code to track real-time vault dispatch milestones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="orderNumber"
            defaultValue={query || ''}
            required
            placeholder="Enter Order Number (e.g. AUR-2026-8942)"
            className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="btn-gold px-7 py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {query && !order && (
        <div className="p-8 text-center bg-obsidian-900/30 border border-obsidian-800 rounded-xl space-y-2">
          <p className="text-sm text-rose-400 font-medium">No order found matching &quot;{query}&quot;</p>
          <p className="text-xs text-gray-400">
            Please check your receipt or contact the Master Concierge for assistance.
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fadeIn">
          {/* Order Snapshot Card */}
          <div className="p-6 rounded-xl bg-obsidian-900/50 border border-obsidian-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-4">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-cinzel">Order Reference</span>
                <h2 className="text-xl font-bold font-mono text-gold-300">{order.orderNumber}</h2>
              </div>

              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} type="order" />
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
              <div>
                <span className="text-gray-500 block">Acquisition Date</span>
                <span className="font-semibold text-white">{formatDate(order.createdAt)}</span>
              </div>

              <div>
                <span className="text-gray-500 block">Courier Service</span>
                <span className="font-semibold text-white">{shipment?.courierName || 'BlueDart Armored Logistics'}</span>
              </div>

              <div>
                <span className="text-gray-500 block">Tracking Number</span>
                <span className="font-mono text-gold-300 font-semibold">{shipment?.trackingNumber || 'BD-VAULT-PENDING'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-8 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-6">
            <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury">
              Transit Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l border-obsidian-800 space-y-8">
              {milestones.map((m, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep - 1;

                return (
                  <div key={m.label} className="relative space-y-1">
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isPassed
                          ? 'bg-gold-500 text-obsidian-950 shadow-gold'
                          : 'bg-obsidian-900 border border-obsidian-700 text-gray-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <h4
                      className={`text-sm font-semibold ${
                        isPassed || isCurrent ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {m.label}
                    </h4>
                    <p className="text-xs text-gray-400">{m.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timepiece Items */}
          <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
            <h3 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Package Manifest ({order.items.length} {order.items.length === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-3 rounded bg-obsidian-950/60 border border-obsidian-800/80">
                  <div>
                    <span className="font-semibold text-white">{item.productName}</span>
                    <p className="text-[10px] text-gray-400">{item.brandName} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gold-300 font-mono">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
