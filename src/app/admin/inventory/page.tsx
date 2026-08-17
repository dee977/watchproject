import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import { InventoryManagerTable } from '@/components/admin/InventoryManagerTable';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: {
        include: {
          brand: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' } },
        },
      },
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const formatted = inventory.map((inv) => ({
    id: inv.id,
    productId: inv.productId,
    productName: inv.product.name,
    sku: inv.product.sku,
    brand: inv.product.brand.name,
    price: inv.product.price,
    stockQuantity: inv.stockQuantity,
    reservedQuantity: inv.reservedQuantity,
    lowStockThreshold: inv.lowStockThreshold,
    image: inv.product.images[0]?.url || '',
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Vault Stock Control
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Real-Time Inventory & Allocation Ledger ({inventory.length} References)
        </h1>
      </div>

      <InventoryManagerTable initialData={formatted} />
    </div>
  );
}
