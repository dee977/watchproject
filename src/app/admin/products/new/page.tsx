import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage() {
  const [brands, categories, collections] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.collection.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Catalog Expansion
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Register New Timepiece Reference
        </h1>
      </div>

      <ProductForm brands={brands} categories={categories} collections={collections} />
    </div>
  );
}
