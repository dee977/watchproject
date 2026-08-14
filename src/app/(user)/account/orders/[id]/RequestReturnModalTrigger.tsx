'use client';

import React, { useState } from 'react';
import { RotateCcw, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RequestReturnModalTriggerProps {
  orderId: string;
  orderNumber: string;
}

export const RequestReturnModalTrigger: React.FC<RequestReturnModalTriggerProps> = ({
  orderId,
  orderNumber,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Change of Preference / Aesthetic Choice');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit return request');
      }

      setStatusMessage({
        type: 'success',
        text: 'Return request submitted. Concierge will contact you within 24 hours.',
      });
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error submitting return request' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Request 14-Day Vault Return</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold-400" />
                <span>Return Request • {orderNumber}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Reason for Return</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                >
                  <option value="Change of Preference / Aesthetic Choice">Change of Preference / Aesthetic Choice</option>
                  <option value="Incorrect Case Diameter / Wrist Fit">Incorrect Case Diameter / Wrist Fit</option>
                  <option value="Cosmetic / Transit Imperfection">Cosmetic / Transit Imperfection</option>
                  <option value="Technical Caliber Inquiry">Technical Caliber Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Detailed Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional details for our horologists..."
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded bg-obsidian-900 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold px-5 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Return Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
