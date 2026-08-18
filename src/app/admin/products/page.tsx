import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { getProductPrimaryImage, FALLBACK_WATCH_IMAGE } from '@/lib/images';
import { Plus, Download, Upload, Search, Edit2, Trash2 } from 'lucide-react';
import { AdminProductRowActions } from '@/components/admin/AdminProductRowActions';

interface AdminProductsPageProps {
  searchParams?: { q?: string; brand?: string };
}

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const query = searchParams?.q?.trim() || '';

  const where: any = {};
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { sku: { contains: query } },
      { brand: { name: { contains: query } } },
    ];
  }

  let products: any[] = [];
  let totalCount = 0;

  try {
    const [prodsRes, countRes] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          inventory: true,
          images: { orderBy: { displayOrder: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    products = prodsRes || [];
    totalCount = countRes || 0;
  } catch (error) {
    console.error('[AdminProductsPage] Product list query error:', error);
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Catalog Inventory
          </span>
          <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
            Timepiece References ({totalCount})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/import-csv"
            download
            className="btn-outline-gold px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/admin/products/import"
            className="btn-outline-gold px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="btn-gold px-4 py-2 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timepiece</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-lg bg-obsidian-900/60 border border-obsidian-800 flex items-center gap-3 text-xs">
        <Search className="w-4 h-4 text-gray-500" />
        <form method="GET" className="flex-1">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by watch model, brand name, or SKU reference..."
            className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-obsidian-800 overflow-hidden bg-obsidian-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950 text-gray-400 uppercase tracking-luxury font-cinzel text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="p-4">Timepiece</th>
                <th className="p-4">SKU / Ref</th>
                <th className="p-4">Price / MRP</th>
                <th className="p-4">Movement</th>
                <th className="p-4">Vault Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No timepiece references found in the catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = p.inventory?.stockQuantity ?? 0;
                  const imageUrl = getProductPrimaryImage(p.images);

                  return (
                    <tr key={p.id} className="hover:bg-obsidian-900/80 transition-colors text-gray-300">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={p.name || 'Timepiece'}
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={(e) => {
                                (e.target as any).src = FALLBACK_WATCH_IMAGE;
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-white hover:text-gold-300 transition-colors"
                            >
                              {p.name || 'Untitled Timepiece'}
                            </Link>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                              {p.brand?.name || 'Maison'} • {p.category?.name || 'Reference'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-gray-400">{p.sku || 'N/A'}</td>

                      <td className="p-4">
                        <div className="font-semibold text-gold-300">{formatPrice(p.price)}</div>
                        {Number(p.mrp) > Number(p.price) && (
                          <div className="text-[10px] text-gray-500 line-through">
                            {formatPrice(p.mrp)}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-gray-300">{p.movement || 'Automatic'}</td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            stock <= 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : stock <= 3
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {stock} in Vault
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <AdminProductRowActions productId={p.id} productName={p.name || 'Timepiece'} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
