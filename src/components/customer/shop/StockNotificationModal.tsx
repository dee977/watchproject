'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface StockNotificationModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StockNotificationModal: React.FC<StockNotificationModalProps> = ({
  productId,
  productName,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('You are on the priority reserve list. We will email you the moment stock arrives.');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2200);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to register allocation alert.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="min-h-screen px-4 flex items-center justify-center py-12">
        <div className="relative w-full max-w-md bg-obsidian-950 border border-gold-500/30 rounded-lg p-6 shadow-2xl text-white z-10 animate-scaleIn space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-gold-400 font-cinzel font-semibold text-sm">
              <Mail className="w-4 h-4" />
              <span>Vault Allocation Alert</span>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-white font-medium">{productName}</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              This timepiece is currently allocated to private orders. Register your email to receive first-priority notification upon restocking.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="uppercase tracking-luxury text-gold-400 font-semibold block">
                Notification Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@luxury.com"
                className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
            </div>

            {status === 'success' && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-gold py-3 rounded text-xs font-semibold uppercase tracking-luxury disabled:opacity-50"
            >
              {status === 'loading' ? 'Registering...' : 'Notify Me On Arrival'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
