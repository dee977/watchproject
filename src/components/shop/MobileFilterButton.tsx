'use client';

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterDrawer } from './FilterDrawer';

interface MobileFilterButtonProps {
  brands: Array<{ label: string; value: string; count?: number }>;
  categories: Array<{ label: string; value: string }>;
  movements: string[];
  maxPriceLimit?: number;
}

export const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({
  brands,
  categories,
  movements,
  maxPriceLimit = 500000,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-gold-300 hover:border-gold-500/40 text-xs font-semibold uppercase tracking-luxury transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filters</span>
      </button>

      <FilterDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        brands={brands}
        categories={categories}
        movements={movements}
        maxPriceLimit={maxPriceLimit}
      />
    </>
  );
};
