'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

const links = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard },
  { label: 'My Acquisitions', href: '/account/orders', icon: Package },
  { label: 'Wishlist & Vault', href: '/account/wishlist', icon: Heart },
  { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Collector Profile', href: '/account/profile', icon: User },
  { label: 'Security & Password', href: '/account/security', icon: ShieldCheck },
];

export const AccountNavLinks: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-3 bg-obsidian-900/60 border border-obsidian-800 rounded-xl space-y-1 text-xs font-medium">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-gold-500/10 text-gold-300 font-semibold border border-gold-500/30'
                : 'text-gray-400 hover:text-white hover:bg-obsidian-950'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-gray-500'}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="pt-2 border-t border-obsidian-800 mt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out of Vault</span>
        </button>
      </div>
    </div>
  );
};
