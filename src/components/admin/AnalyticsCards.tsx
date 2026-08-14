import React from 'react';
import { DollarSign, ShoppingBag, Users, Watch, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface AnalyticsCardsProps {
  stats?: {
    grossRevenue?: number;
    totalRevenue?: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    lowStockCount: number;
  };
  metrics?: {
    totalRevenue?: number;
    grossRevenue?: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    lowStockCount: number;
    periodChange?: {
      revenuePercent: number;
      ordersPercent: number;
    };
  };
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ stats, metrics }) => {
  const data = stats || metrics || {
    grossRevenue: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
  };

  const revenue = data.grossRevenue ?? data.totalRevenue ?? 0;

  const cards = [
    {
      title: 'Gross Horological Revenue',
      value: formatPrice(revenue),
      subtext: '+12.4% vs previous cycle',
      icon: DollarSign,
      color: 'text-gold-300',
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/30',
    },
    {
      title: 'Confirmed Acquisitions',
      value: data.totalOrders.toLocaleString(),
      subtext: '+8.1% acquisition rate',
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    {
      title: 'Average Order Value (AOV)',
      value: formatPrice(data.averageOrderValue),
      subtext: 'Luxury ticket benchmark',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Registered Clients',
      value: data.totalCustomers.toLocaleString(),
      subtext: 'Active collector profiles',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    {
      title: 'Vault Catalog Timepieces',
      value: data.totalProducts.toLocaleString(),
      subtext: 'Active references in catalogue',
      icon: Watch,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
    },
    {
      title: 'Low Vault Stock Alerts',
      value: data.lowStockCount.toLocaleString(),
      subtext: data.lowStockCount > 0 ? 'Requires manufacture replenishment' : 'Vault well stocked',
      icon: AlertTriangle,
      color: data.lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bg: data.lowStockCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      border: data.lowStockCount > 0 ? 'border-amber-500/30' : 'border-emerald-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-6 flex flex-col justify-between space-y-4 hover:border-gold-500/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-luxury text-gray-400 font-cinzel font-semibold">
                  {card.title}
                </span>
                <div className="text-2xl font-cinzel font-bold text-white mt-1">
                  {card.value}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color} border ${card.border}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-obsidian-800 flex items-center gap-1.5">
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
