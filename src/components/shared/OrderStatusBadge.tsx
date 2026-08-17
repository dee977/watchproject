import React from 'react';
import { OrderStatus, PaymentStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  type?: 'order' | 'payment';
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, type = 'order' }) => {
  if (type === 'payment') {
    return <PaymentStatusBadge status={status} />;
  }

  const configs: Record<string, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: 'Pending Vault Review', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
    CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
    PROCESSING: { label: 'Timing & Casing Inspection', bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    PACKED: { label: 'Vault Sealed & Packed', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    SHIPPED: { label: 'In Armored Transit', bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
    DELIVERED: { label: 'Delivered to Client', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    COMPLETED: { label: 'Acquisition Completed', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    RETURN_REQUESTED: { label: 'Return Under Review', bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
    RETURNED: { label: 'Returned to Vault', bg: 'bg-gray-500/10', text: 'text-gray-300', border: 'border-gray-500/30' },
    REFUNDED: { label: 'Escrow Refunded', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-gray-500/10',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const configs: Record<string, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: 'Pending Payment', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    AUTHORIZED: { label: 'Authorized', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    PAID: { label: 'Paid & Escrow Verified', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    FAILED: { label: 'Payment Failed', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    REFUNDED: { label: 'Refunded', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    PARTIALLY_REFUNDED: { label: 'Partially Refunded', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-gray-500/10',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};
