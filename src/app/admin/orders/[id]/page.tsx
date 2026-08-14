import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { ArrowLeft, Printer, Truck, ShieldCheck, Mail } from 'lucide-react';
import { AdminOrderFulfillForm } from './AdminOrderFulfillForm';

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      user: true,
      items: true,
      payments: true,
      shipments: true,
      returnRequests: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = JSON.parse(order.shippingAddressSnapshot || '{}');
  const latestShipment = order.shipments[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded bg-obsidian-900 border border-obsidian-800 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Acquisition Control
            </span>
            <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
              Order #{order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} type="order" />
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
          <Link
            href={`/order/${order.orderNumber}`}
            target="_blank"
            className="btn-outline-gold px-4 py-2 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Tax Invoice</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Order items & Customer Address (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Items */}
          <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
            <h2 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
              Acquired Timepieces ({order.items.length})
            </h2>

            <div className="divide-y divide-obsidian-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <div className="relative w-12 h-12 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <strong className="text-white block">{item.productName}</strong>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {item.brandName} • SKU: {item.productSku}
                      </span>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                    </div>
                  </div>

                  <span className="font-semibold text-gold-300 font-cinzel">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-4 border-t border-obsidian-800 space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-gold-400 font-semibold">
                  <span>Privilege Discount ({order.couponCode})</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Armored Shipping</span>
                <span>{order.shippingAmount === 0 ? 'Complimentary' : formatPrice(order.shippingAmount)}</span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Handling Fee</span>
                  <span>{formatPrice(order.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-obsidian-800">
                <span>Total Amount</span>
                <span className="text-gold-300 font-cinzel text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Client Destination Snapshot */}
          <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3 text-xs">
            <h2 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
              Armored Delivery Destination & Client
            </h2>
            <div className="space-y-1 text-gray-300">
              <p className="text-white font-semibold">{shippingAddress.fullName || order.guestName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
              <p>Phone: {shippingAddress.phone || order.guestPhone}</p>
              <p>Email: {order.user?.email || order.guestEmail}</p>
              {order.notes && (
                <div className="p-3 mt-2 rounded bg-obsidian-950 border border-obsidian-800 text-[11px] text-gray-400">
                  <strong>Client Instructions:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Fulfillment Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-6">
            <h2 className="font-cinzel text-xs uppercase tracking-luxury text-white font-bold pb-2 border-b border-obsidian-800">
              Fulfillment Operations & Logistics
            </h2>

            <AdminOrderFulfillForm
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
              currentCourier={latestShipment?.courierName || 'BlueDart Armored Logistics'}
              currentTrackingNumber={latestShipment?.trackingNumber || ''}
              currentTrackingUrl={latestShipment?.trackingUrl || ''}
              currentNotes={order.adminNotes || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
