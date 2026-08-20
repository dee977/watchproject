import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { getProductImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import {
  ArrowLeft,
  Truck,
  Printer,
  ShieldCheck,
  Package,
  RotateCcw,
} from 'lucide-react';
import { RequestReturnModalTrigger } from './RequestReturnModalTrigger';

interface AccountOrderDetailProps {
  params: { id: string };
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailProps) {
  const session = await getSessionUser();
  if (!session) return null;

  const order = await prisma.order.findFirst({
    where: {
      userId: session.userId,
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      items: true,
      shipments: true,
      payments: true,
      returnRequests: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = JSON.parse(order.shippingAddressSnapshot || '{}');
  const latestShipment = order.shipments[0];
  const activeReturn = order.returnRequests[0];

  return (
    <div className="space-y-8">
      {/* Back button & Header */}
      <div className="flex items-center justify-between border-b border-obsidian-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/account/orders" className="p-2 rounded bg-obsidian-950 border border-obsidian-800 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-cinzel font-bold text-white">
              Order {order.orderNumber}
            </h2>
            <p className="text-xs text-gray-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} type="order" />
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      {/* Return Request Banner if active */}
      {activeReturn && (
        <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 text-xs space-y-1">
          <div className="flex items-center justify-between text-gold-300 font-semibold">
            <span>Return Request Status: {activeReturn.status}</span>
            <span>Reason: {activeReturn.reason}</span>
          </div>
          {activeReturn.adminNotes && (
            <p className="text-gray-300">Concierge Notes: {activeReturn.adminNotes}</p>
          )}
        </div>
      )}

      {/* Grid info: Address + Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-2">
          <h3 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
            Armored Delivery Destination
          </h3>
          <p className="text-white font-medium">{shippingAddress.fullName}</p>
          <p className="text-gray-400">{shippingAddress.addressLine1}</p>
          {shippingAddress.addressLine2 && <p className="text-gray-400">{shippingAddress.addressLine2}</p>}
          <p className="text-gray-400">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
          <p className="text-gray-400">Contact: {shippingAddress.phone}</p>
        </div>

        <div className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-2">
          <h3 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
            Armored Logistics & COD Settlement
          </h3>
          <p className="text-gray-300"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <p className="text-gray-300"><strong>Payment Status:</strong> {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending Payment on Handover'}</p>
          <p className="text-gray-300"><strong>Courier Escort:</strong> {latestShipment?.courierName || 'BlueDart Apex Armored'}</p>
          <p className="text-gray-300"><strong>Tracking Code:</strong> <span className="font-mono text-gold-300">{latestShipment?.trackingNumber || 'Pending'}</span></p>
          <div className="pt-2">
            <Link
              href={`/track-order?orderNumber=${order.orderNumber}`}
              className="text-gold-400 hover:text-gold-300 underline font-semibold flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Live Telemetry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h3 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Acquired Timepieces
        </h3>

        <div className="divide-y divide-obsidian-800">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                {item.productImage && (
                  <div className="relative w-14 h-14 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                    <Image
                      src={getProductImageUrl(item.productImage, FALLBACK_WATCH_IMAGE)}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-cinzel font-bold text-white text-sm">{item.productName}</h4>
                  <p className="text-gray-400 font-mono">{item.brandName} • SKU: {item.productSku}</p>
                  <p className="text-gray-400">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                </div>
              </div>

              <span className="font-cinzel font-bold text-gold-300 text-sm">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-obsidian-800 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-gold-400 font-semibold">
                <span>Discount ({order.couponCode || 'Privilege'})</span>
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
                <span>COD Handling</span>
                <span>{formatPrice(order.codFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-obsidian-800">
              <span>Grand Total</span>
              <span className="text-gold-300 font-cinzel text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-obsidian-800">
        <Link
          href={`/order/${order.orderNumber}`}
          className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tax Invoice</span>
        </Link>

        {!activeReturn && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
          <RequestReturnModalTrigger orderId={order.id} orderNumber={order.orderNumber} />
        )}
      </div>
    </div>
  );
}
