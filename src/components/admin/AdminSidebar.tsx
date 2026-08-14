'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Watch,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  ShoppingBag,
  Users,
  Star,
  HelpCircle,
  Ticket,
  RotateCcw,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface AdminSidebarProps {
  userRole?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userRole = 'ADMIN' }) => {
  const pathname = usePathname();

  const isSuperAdminOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const isSupport = userRole === 'CUSTOMER_SUPPORT';

  const navGroups = [
    {
      label: 'Executive',
      items: [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/admin/analytics', label: 'Sales Analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Horological Catalog',
      items: [
        { href: '/admin/products', label: 'Product Catalog', icon: Watch, exact: true },
        { href: '/admin/products/new', label: 'New Timepiece', icon: PlusCircle },
        { href: '/admin/products/import', label: 'CSV Bulk Import', icon: FileSpreadsheet },
        { href: '/admin/inventory', label: 'Vault Inventory', icon: Layers },
      ],
    },
    {
      label: 'Fulfillment & Orders',
      items: [
        { href: '/admin/orders', label: 'Orders & Shipments', icon: ShoppingBag },
        { href: '/admin/returns', label: 'Return Requests', icon: RotateCcw },
      ],
    },
    {
      label: 'Clients & Moderation',
      items: [
        { href: '/admin/customers', label: 'Client Directory', icon: Users },
        { href: '/admin/reviews', label: 'Reviews Moderation', icon: Star },
        { href: '/admin/questions', label: 'Concierge Q&A', icon: HelpCircle },
        { href: '/admin/coupons', label: 'Privilege Coupons', icon: Ticket },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { href: '/admin/settings', label: 'Store Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-obsidian-950 border-r border-obsidian-800/80 flex flex-col justify-between h-screen sticky top-0 text-sm">
      <div className="overflow-y-auto p-4 space-y-6">
        {/* Brand */}
        <div className="px-3 py-2 border-b border-obsidian-800 pb-4">
          <Link href="/admin" className="block">
            <span className="font-cinzel text-xl font-bold tracking-luxury text-gold-300">
              AURELIA
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-sans">
              Admin Control Center
            </span>
          </Link>

          <div className="mt-3 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gold-500/10 text-gold-400 border border-gold-500/30">
              {userRole}
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
            >
              <span>Live Boutique</span>
              <ExternalLink className="w-3 h-3 text-gold-500" />
            </Link>
          </div>
        </div>

        {/* Nav Groups */}
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-[10px] uppercase tracking-luxury text-gold-500/70 font-cinzel font-semibold">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-obsidian-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Vault Status */}
      <div className="p-4 border-t border-obsidian-800 bg-obsidian-900/40 text-[11px] text-gray-500">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PostgreSQL/SQLite Sync Active</span>
        </div>
        <div className="mt-1 text-[10px] text-gray-400">
          Razorpay Webhook Listener: Ready
        </div>
      </div>
    </aside>
  );
};
