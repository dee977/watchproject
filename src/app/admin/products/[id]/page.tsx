import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: EditProductPageProps) {
  let product: any = null;
  let brands: any[] = [];
  let categories: any[] = [];
  let collections: any[] = [];

  try {
    const [prodRes, brandsRes, catsRes, colsRes] = await Promise.all([
      prisma.product.findUnique({
        where: { id: params.id },
        include: {
          inventory: true,
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: { orderBy: { displayOrder: 'asc' } },
        },
      }),
      prisma.brand.findMany({ orderBy: { name: 'asc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.collection.findMany({ orderBy: { name: 'asc' } }),
    ]);
    product = prodRes;
    brands = brandsRes || [];
    categories = catsRes || [];
    collections = colsRes || [];
  } catch (error) {
    console.error('[EditProductPage] Product lookup error:', error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Catalog Management
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Edit {product.name} (SKU: {product.sku})
        </h1>
      </div>

      <ProductForm
        initialData={product}
        brands={brands}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
