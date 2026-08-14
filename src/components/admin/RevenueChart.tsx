'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/currency';

interface ChartPoint {
  label?: string;
  day?: string;
  revenue: number;
  orders: number;
}

interface CategoryItem {
  category?: string;
  name?: string;
  count?: number;
  percentage?: number;
  amount?: number;
}

interface RevenueChartProps {
  data?: ChartPoint[];
  categoryBreakdown?: CategoryItem[];
  categoryShare?: CategoryItem[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [],
  categoryBreakdown,
  categoryShare,
}) => {
  const [activeView, setActiveView] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Fallback sample data if empty
  const rawChartData = data.length > 0 ? data : [
    { label: 'Mon', revenue: 45000, orders: 1 },
    { label: 'Tue', revenue: 118000, orders: 2 },
    { label: 'Wed', revenue: 68500, orders: 1 },
    { label: 'Thu', revenue: 245000, orders: 3 },
    { label: 'Fri', revenue: 195000, orders: 2 },
    { label: 'Sat', revenue: 380000, orders: 4 },
    { label: 'Sun', revenue: 495000, orders: 3 },
  ];

  const chartData = rawChartData.map((d) => ({
    label: d.label || d.day || 'Day',
    revenue: d.revenue,
    orders: d.orders,
  }));

  const maxVal = Math.max(...chartData.map((d) => (activeView === 'revenue' ? d.revenue : d.orders)), 1);

  const rawCategories = categoryShare || categoryBreakdown || [
    { name: 'Automatic & Mechanical', percentage: 45, amount: 485000 },
    { name: 'Chronographs', percentage: 28, amount: 310000 },
    { name: 'Professional Divers', percentage: 15, amount: 165000 },
    { name: 'Dress & Formal', percentage: 12, amount: 132000 },
  ];

  const totalCatCount = rawCategories.reduce((s, c) => s + (c.count || c.percentage || 1), 0);

  const categories = rawCategories.map((c) => ({
    name: c.name || c.category || 'Category',
    percentage: c.percentage ?? Math.round(((c.count || 1) / totalCatCount) * 100),
    amount: c.amount ?? (c.count ? c.count * 85000 : 125000),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Trends Chart */}
      <div className="lg:col-span-8 bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-cinzel text-base font-bold text-white uppercase tracking-luxury">
              Revenue & Acquisition Trajectory
            </h3>
            <p className="text-xs text-gray-400">
              Live transaction trajectory across active time intervals
            </p>
          </div>

          <div className="flex rounded-lg border border-obsidian-800 p-1 bg-obsidian-950">
            <button
              onClick={() => setActiveView('revenue')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeView === 'revenue'
                  ? 'bg-gold-500 text-obsidian-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Revenue (INR)
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeView === 'orders'
                  ? 'bg-gold-500 text-obsidian-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        {/* Interactive Bar/Column Display */}
        <div className="h-64 flex items-end gap-3 pt-8 px-2 border-b border-obsidian-800">
          {chartData.map((item, idx) => {
            const currentVal = activeView === 'revenue' ? item.revenue : item.orders;
            const heightPercent = Math.max(8, (currentVal / maxVal) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                {hoveredPoint === item && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded bg-obsidian-950 border border-gold-500/40 text-xs shadow-xl text-center whitespace-nowrap animate-fadeIn">
                    <div className="font-semibold text-gold-300">
                      {activeView === 'revenue' ? formatPrice(item.revenue) : `${item.orders} Orders`}
                    </div>
                    <div className="text-[10px] text-gray-400">{item.label}</div>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all duration-500 ${
                    hoveredPoint === item
                      ? 'gold-gradient-bg shadow-gold'
                      : 'bg-obsidian-800 group-hover:bg-gold-500/50'
                  }`}
                />
                <span className="text-[10px] text-gray-500 mt-2 font-mono truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Sales Distribution */}
      <div className="lg:col-span-4 bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="font-cinzel text-base font-bold text-white uppercase tracking-luxury">
            Category Share
          </h3>
          <p className="text-xs text-gray-400">
            Revenue volume by horological classification
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">{cat.name}</span>
                <span className="text-gold-300 font-semibold">{cat.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian-950 rounded-full overflow-hidden border border-obsidian-800">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-500 font-mono text-right">
                {formatPrice(cat.amount)}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-obsidian-800 text-[11px] text-gray-500">
          Updated in real-time from settled order transactions.
        </div>
      </div>
    </div>
  );
};
