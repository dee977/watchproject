'use client';

import React from 'react';
import { ProductCard, ProductCardData } from './ProductCard';

interface ProductGridProps {
  products: ProductCardData[];
  viewMode?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode = 'grid',
  columns = 4,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-obsidian-900/30 rounded-lg border border-obsidian-800 p-8">
        <h3 className="text-xl font-cinzel text-white">No Horological Pieces Found</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          No timepieces matched the chosen filters or specifications. Try adjusting your movement, brand, or price constraints.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode="list" />
        ))}
      </div>
    );
  }

  const gridColClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridColClasses} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode="grid" />
      ))}
    </div>
  );
};
