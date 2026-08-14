import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { Users, Mail, Phone, Calendar, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        select: { totalAmount: true },
      },
      addresses: {
        take: 1,
        select: { city: true, state: true },
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
          wishlist: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Clientele Registry
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Registered VIP Collectors ({customers.length})
        </h1>
      </div>

      <div className="rounded-xl border border-obsidian-800 overflow-hidden bg-obsidian-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury font-cinzel text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="p-4">Collector</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Orders</th>
                <th className="p-4 text-right">Lifetime Spend</th>
                <th className="p-4 text-right">Enrolled Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              {customers.map((c) => {
                const lifetimeSpend = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
                const cityState = c.addresses[0] ? `${c.addresses[0].city}, ${c.addresses[0].state}` : 'India';

                return (
                  <tr key={c.id} className="hover:bg-obsidian-900/80 transition-colors text-gray-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center font-bold text-gold-300 font-cinzel">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-white block">{c.name}</strong>
                          <span className="text-[10px] text-gray-500">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.role === 'SUPER_ADMIN' || c.role === 'ADMIN'
                            ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                            : 'bg-obsidian-950 text-gray-400 border border-obsidian-800'
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>

                    <td className="p-4 text-gray-400">{cityState}</td>

                    <td className="p-4 text-center font-mono font-bold text-white">
                      {c._count.orders}
                    </td>

                    <td className="p-4 text-right font-cinzel font-bold text-gold-300">
                      {formatPrice(lifetimeSpend)}
                    </td>

                    <td className="p-4 text-right text-gray-500 font-mono text-[11px]">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
