'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { StoreSettings } from '@/lib/store-settings';

export const SettingsForm: React.FC<{ initialSettings: StoreSettings }> = ({
  initialSettings,
}) => {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save store parameters.');
      }

      setMessage({ type: 'success', text: 'Store settings synchronized successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-xs max-w-3xl">
      {/* 1. Identity */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          1. Maison Brand Identity & Concierge Lines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Store Name</label>
            <input
              type="text"
              value={settings.STORE_NAME}
              onChange={(e) => setSettings({ ...settings, STORE_NAME: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Default Currency</label>
            <input
              type="text"
              value={settings.STORE_CURRENCY}
              onChange={(e) => setSettings({ ...settings, STORE_CURRENCY: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Concierge Email</label>
            <input
              type="email"
              value={settings.CONCIERGE_EMAIL}
              onChange={(e) => setSettings({ ...settings, CONCIERGE_EMAIL: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">VIP Phone Line</label>
            <input
              type="text"
              value={settings.CONCIERGE_PHONE}
              onChange={(e) => setSettings({ ...settings, CONCIERGE_PHONE: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Shipping & Financial Logistics */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          2. Logistics Fees, GST & Free Shipping Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Free Shipping Threshold (INR ₹)</label>
            <input
              type="number"
              value={settings.FREE_SHIPPING_THRESHOLD}
              onChange={(e) => setSettings({ ...settings, FREE_SHIPPING_THRESHOLD: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Standard Courier Fee (INR ₹)</label>
            <input
              type="number"
              value={settings.STANDARD_SHIPPING_FEE}
              onChange={(e) => setSettings({ ...settings, STANDARD_SHIPPING_FEE: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Priority Armed Express Fee (INR ₹)</label>
            <input
              type="number"
              value={settings.EXPRESS_SHIPPING_FEE}
              onChange={(e) => setSettings({ ...settings, EXPRESS_SHIPPING_FEE: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">COD Handling Fee (INR ₹)</label>
            <input
              type="number"
              value={settings.COD_FEE}
              onChange={(e) => setSettings({ ...settings, COD_FEE: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Goods & Services Tax (GST %)</label>
            <input
              type="number"
              value={settings.TAX_RATE_PERCENT}
              onChange={(e) => setSettings({ ...settings, TAX_RATE_PERCENT: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Return Privilege Window (Days)</label>
            <input
              type="number"
              value={settings.RETURN_WINDOW_DAYS}
              onChange={(e) => setSettings({ ...settings, RETURN_WINDOW_DAYS: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-2 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
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
        className="btn-gold px-8 py-3 rounded font-bold uppercase tracking-luxury flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Persisting Store Parameters...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Store Parameters</span>
          </>
        )}
      </button>
    </form>
  );
};
