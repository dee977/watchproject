'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setMessage({ type: 'success', text: 'Vault credentials updated securely.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <h2 className="text-xl font-cinzel font-bold text-white">
          Security & Password Management
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Maintain cryptographic credentials and session authorizations.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-6 max-w-lg">
        <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury flex items-center gap-2">
          <Lock className="w-4 h-4 text-gold-400" />
          <span>Change Vault Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">New Vault Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
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

          <button type="submit" className="btn-gold px-6 py-2.5 rounded font-semibold uppercase tracking-luxury">
            Update Security Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
