'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, CheckCircle2, Loader2 } from 'lucide-react';

export const ProfileForm: React.FC<{ user: any }> = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs max-w-lg">
      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Full Name</label>
        <div className="relative">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
          />
          <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">Email Address (Read Only)</label>
        <div className="relative">
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full bg-obsidian-950/60 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-gray-400 cursor-not-allowed"
          />
          <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-gray-400 font-medium block">VIP Contact Phone Number</label>
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
          />
          <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile records updated successfully.</span>
        </div>
      )}

      <button type="submit" className="btn-gold px-6 py-2.5 rounded font-semibold uppercase tracking-luxury">
        Save Profile
      </button>
    </form>
  );
};
