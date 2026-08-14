import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import {
  CheckCircle2,
  Printer,
  Truck,
  ShieldCheck,
  ArrowRight,
  Package,
  Calendar,
} from 'lucide-react';
import { PrintInvoiceButton } from './PrintInvoiceButton';

interface OrderConfirmationPageProps {
  params: { id: string };
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      items: true,
      user: true,
      shipments: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = JSON.parse(order.shippingAddressSnapshot || '{}');
  const latestShipment = order.shipments[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Confirmation Banner */}
      <div className="p-8 rounded-xl bg-obsidian-900/60 border border-gold-500/30 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Acquisition Confirmed & Vault Allocated
          </span>
          <h1 className="text-3xl font-cinzel font-bold text-white">
            Thank You For Your Order
          </h1>
          <p className="text-xs text-gray-400">
            Order Reference: <strong className="text-white font-mono">{order.orderNumber}</strong> • Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <PrintInvoiceButton />
          <Link
            href={`/track-order?orderNumber=${order.orderNumber}`}
            className="btn-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Track Armored Shipment</span>
          </Link>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="p-8 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-8 print:bg-white print:text-black print:border-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6 print:border-gray-300">
          <div>
            <span className="text-xl font-cinzel font-bold tracking-widest text-gold-300 print:text-black">
              AURELIA
            </span>
            <p className="text-[10px] uppercase tracking-luxury text-gray-400 font-cinzel">
              Haute Horlogerie & Vault Deliveries
            </p>
            <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
              GSTIN: 27AAACA0000A1Z5 • Mumbai, India
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-gray-300 print:text-gray-700">
            <div className="font-bold text-white print:text-black">TAX INVOICE</div>
            <div>Order: <strong className="font-mono text-gold-300 print:text-black">{order.orderNumber}</strong></div>
            <div>Date: {formatDate(order.createdAt)}</div>
            <div className="pt-1">
              <OrderStatusBadge status={order.status} type="order" />
            </div>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-300 print:text-gray-700">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-luxury text-gold-400 print:text-black block pb-1">
              Billed & Shipped To:
            </span>
            <p className="font-semibold text-white print:text-black">{shippingAddress.fullName || order.guestName}</p>
            <p>{shippingAddress.addressLine1}</p>
            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
            <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
            <p>Phone: {shippingAddress.phone || order.guestPhone}</p>
            <p>Email: {order.user?.email || order.guestEmail}</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold uppercase tracking-luxury text-gold-400 print:text-black block pb-1">
              Logistics & Settlement:
            </span>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            {latestShipment && (
              <>
                <p><strong>Courier:</strong> {latestShipment.courierName}</p>
                <p><strong>Tracking Number:</strong> <span className="font-mono text-gold-300 print:text-black">{latestShipment.trackingNumber}</span></p>
              </>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <span className="font-bold uppercase tracking-luxury text-gold-400 print:text-black text-xs block">
            Acquired Timepieces
          </span>

          <div className="border border-obsidian-800 rounded-lg overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury print:bg-gray-100 print:text-black border-b border-obsidian-800 print:border-gray-300">
                <tr>
                  <th className="p-3">Timepiece</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800 print:divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-gray-200 print:text-black">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <div className="relative w-10 h-10 rounded bg-obsidian-950 overflow-hidden flex-shrink-0 print:hidden">
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{item.productName}</div>
                          <div className="text-[10px] text-gray-400 print:text-gray-600 font-mono">
                            {item.brandName} • SKU: {item.productSku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">{formatPrice(item.unitPrice)}</td>
                    <td className="p-3 text-right font-semibold text-gold-300 print:text-black">
                      {formatPrice(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-full max-w-xs space-y-2 text-xs text-gray-300 print:text-gray-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-gold-400 font-semibold print:text-gray-900">
                <span>Discount ({order.couponCode || 'Privilege'})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Goods & Services Tax (18% GST)</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span>Armored Delivery</span>
              <span>{order.shippingAmount === 0 ? 'Complimentary' : formatPrice(order.shippingAmount)}</span>
            </div>

            {order.codFee > 0 && (
              <div className="flex justify-between">
                <span>COD Handling</span>
                <span>{formatPrice(order.codFee)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-white print:text-black pt-3 border-t border-obsidian-800 print:border-gray-300">
              <span>Total Settled</span>
              <span className="text-gold-300 font-cinzel text-lg print:text-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return & Support Guidelines */}
      <div className="p-6 rounded-xl bg-obsidian-900/30 border border-obsidian-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-gold-400 flex-shrink-0" />
          <p className="text-gray-300">
            Need assistance with your acquisition or wish to request bracelet sizing? Contact our 24/7 Master Concierge at{' '}
            <strong className="text-gold-300">concierge@aureliawatches.com</strong>
          </p>
        </div>

        <Link href="/watches" className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold whitespace-nowrap">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
