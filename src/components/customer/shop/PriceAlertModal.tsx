'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface PriceAlertModalProps {
  productId: string;
  productName: string;
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  productId,
  productName,
  currentPrice,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !targetPrice) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email,
          targetPrice: Number(targetPrice),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Price alert activated. We will notify your private email as soon as price reaches your target.');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2200);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to set price alert.');
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
              <Bell className="w-4 h-4" />
              <span>Privilege Price Drop Alert</span>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-white font-medium">{productName}</p>
            <p className="text-xs text-gray-400">
              Current Vault Price: <strong className="text-gold-300">{formatPrice(currentPrice)}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="uppercase tracking-luxury text-gold-400 font-semibold block">
                Target Price (INR ₹)
              </label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                min={1000}
                max={currentPrice - 1}
                className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
            </div>

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
              {status === 'loading' ? 'Activating Alert...' : 'Set Price Alert'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
