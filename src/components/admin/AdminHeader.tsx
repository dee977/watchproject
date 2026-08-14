'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield, ExternalLink, Bell } from 'lucide-react';

interface AdminHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="h-16 bg-obsidian-950 border-b border-obsidian-800/80 px-8 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-luxury text-gray-400 font-cinzel">
          AURELIA Vault Administration
        </span>
        <span className="text-gray-700">•</span>
        <span className="text-xs text-gold-400 font-mono">Live Master Hub</span>
      </div>

      <div className="flex items-center gap-6 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-gray-400 hover:text-gold-300 transition-colors"
        >
          <span>View Boutique</span>
          <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
        </Link>

        {/* User Card & Logout */}
        <div className="flex items-center gap-4 pl-4 border-l border-obsidian-800">
          <div className="text-right">
            <div className="text-white font-semibold">{user.name}</div>
            <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 font-bold text-xs flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            title="Log out of admin session"
            aria-label="Log out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-obsidian-900 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
