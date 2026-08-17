import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  User,
  Package,
  Heart,
  MapPin,
  ShieldCheck,
  LogOut,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { AccountNavLinks } from './AccountNavLinks';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect('/login?redirect=/account');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      _count: {
        select: {
          orders: true,
          wishlist: true,
          addresses: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* User Header */}
      <div className="p-8 rounded-xl bg-obsidian-900/60 border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 font-cinzel text-xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-cinzel font-bold text-white">{user.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-gold-500/10 text-gold-400 border border-gold-500/30">
                VIP Collector
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 text-xs text-center border-t sm:border-t-0 pt-4 sm:pt-0 border-obsidian-800">
          <div>
            <span className="text-lg font-cinzel font-bold text-gold-300">{user._count.orders}</span>
            <span className="block text-[10px] uppercase text-gray-500 mt-0.5">Acquisitions</span>
          </div>
          <div className="w-px h-8 bg-obsidian-800" />
          <div>
            <span className="text-lg font-cinzel font-bold text-gold-300">{user._count.wishlist}</span>
            <span className="block text-[10px] uppercase text-gray-500 mt-0.5">Saved Timepieces</span>
          </div>
        </div>
      </div>

      {/* Main Account Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3">
          <AccountNavLinks />
        </div>

        {/* Content Container (9 cols) */}
        <div className="lg:col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
}
