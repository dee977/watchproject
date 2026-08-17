'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, Save, Truck } from 'lucide-react';

interface AdminOrderFulfillFormProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentCourier: string;
  currentTrackingNumber: string;
  currentTrackingUrl: string;
  currentNotes: string;
}

export const AdminOrderFulfillForm: React.FC<AdminOrderFulfillFormProps> = ({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentCourier,
  currentTrackingNumber,
  currentTrackingUrl,
  currentNotes,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [courierName, setCourierName] = useState(currentCourier);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl);
  const [adminNotes, setAdminNotes] = useState(currentNotes);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          courierName,
          trackingNumber,
          trackingUrl,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order.');
      }

      setMessage({ type: 'success', text: 'Order & logistics telemetry updated.' });
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating order.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 text-xs">
      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Fulfillment Lifecycle Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
        >
          <option value="PENDING">PENDING (Awaiting Settlement)</option>
          <option value="CONFIRMED">CONFIRMED (Vault Reserved)</option>
          <option value="PROCESSING">PROCESSING (Undergoing Atelier Inspection)</option>
          <option value="SHIPPED">SHIPPED (En Route via Armored Transport)</option>
          <option value="DELIVERED">DELIVERED (Signed & Handed Over)</option>
          <option value="CANCELLED">CANCELLED (Restocked)</option>
          <option value="REFUNDED">REFUNDED (Settled Back)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Payment Settlement Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID (Escrow Cleared)</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Armored Courier Partner</label>
        <input
          type="text"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          placeholder="e.g. BlueDart Armored Logistics"
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Courier Tracking Number</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. BD892019482IN"
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Courier Tracking URL</label>
        <input
          type="url"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://www.bluedart.com/tracking?trackNumber=..."
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Internal Vault Notes</label>
        <textarea
          rows={2}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Private staff notes regarding inspection / courier pickup..."
          className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-gold py-3 rounded font-bold uppercase tracking-luxury flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating Order Telemetry...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Update Fulfillment & Notify Client</span>
          </>
        )}
      </button>
    </form>
  );
};
