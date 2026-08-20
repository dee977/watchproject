'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Search, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getProductImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  image: string;
}

export const InventoryManagerTable: React.FC<{ initialData: InventoryItem[] }> = ({
  initialData,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(initialData);
  const [filterQuery, setFilterQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStockAdjust = async (productId: string, adjustment: number) => {
    setUpdatingId(productId);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, adjustment }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { ...item, stockQuantity: Math.max(0, item.stockQuantity + adjustment) }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(filterQuery.toLowerCase());

    if (onlyLowStock) {
      return matchesSearch && item.stockQuantity <= item.lowStockThreshold;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="p-4 rounded-lg bg-obsidian-900/60 border border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search timepiece model, brand, or SKU..."
            className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-gray-300 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => setOnlyLowStock(e.target.checked)}
            className="rounded accent-gold-500"
          />
          <span>Show Low Stock Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-obsidian-800 overflow-hidden bg-obsidian-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury font-cinzel text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="p-4">Timepiece Reference</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Valuation</th>
                <th className="p-4 text-center">Available in Vault</th>
                <th className="p-4 text-center">Reserved</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              {filtered.map((item) => {
                const isLow = item.stockQuantity <= item.lowStockThreshold;
                const isUpdating = updatingId === item.productId;

                return (
                  <tr key={item.id} className="hover:bg-obsidian-900/80 transition-colors text-gray-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="relative w-10 h-10 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                            <Image
                              src={getProductImageUrl(item.image, FALLBACK_WATCH_IMAGE)}
                              alt={item.productName}
                              fill
                              sizes="40px"
                              className="object-cover"
                              onError={(e) => {
                                (e.target as any).src = FALLBACK_WATCH_IMAGE;
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="font-semibold text-white hover:text-gold-300"
                          >
                            {item.productName}
                          </Link>
                          <div className="text-[10px] text-gray-500">{item.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-gray-400">{item.sku}</td>

                    <td className="p-4 font-semibold text-gold-300">
                      {formatPrice(item.price)}
                    </td>

                    <td className="p-4 text-center">
                      <strong className="text-white text-sm font-mono">{item.stockQuantity}</strong>
                    </td>

                    <td className="p-4 text-center font-mono text-gray-400">
                      {item.reservedQuantity}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.stockQuantity <= 0
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.stockQuantity <= 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Allocated OK'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStockAdjust(item.productId, -1)}
                          disabled={item.stockQuantity <= 0 || isUpdating}
                          className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 hover:bg-obsidian-900 disabled:opacity-30"
                          title="Decrement Stock"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          onClick={() => handleStockAdjust(item.productId, 1)}
                          disabled={isUpdating}
                          className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 hover:bg-obsidian-900 text-gold-400"
                          title="Add 1 Piece"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleStockAdjust(item.productId, 5)}
                          disabled={isUpdating}
                          className="px-2 py-1 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30 hover:bg-gold-500/20 font-semibold text-[10px]"
                          title="Restock +5 Pieces"
                        >
                          +5
                        </button>
                      </div>
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
};
