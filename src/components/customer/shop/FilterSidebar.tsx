'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { RotateCcw, Check } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { normalizeParamArray } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSidebarProps {
  brands: FilterOption[];
  categories: FilterOption[];
  movements: string[];
  materials?: string[];
  maxPriceLimit?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  brands,
  categories,
  movements,
  materials = ['316L Stainless Steel', 'Super Titanium', '18K Rose Gold', 'Ceramic', 'Leather'],
  maxPriceLimit = 5000,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active params
  const selectedBrands = normalizeParamArray(searchParams.getAll('brand'));
  const selectedCategory = searchParams.get('category') || '';
  const selectedMovement = normalizeParamArray(searchParams.getAll('movement'));
  const selectedGender = searchParams.get('gender') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || maxPriceLimit);

  const updateFilters = (key: string, value: string, isMulti: boolean = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (isMulti) {
      const currentValues = normalizeParamArray(params.getAll(key));
      params.delete(key);
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      nextValues.forEach((v) => params.append(key, v));
    } else {
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete('page'); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceChange = (newMax: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('maxPrice', newMax.toString());
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleInStockToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    Boolean(selectedCategory) ||
    selectedMovement.length > 0 ||
    Boolean(selectedGender) ||
    inStockOnly ||
    maxPrice < maxPriceLimit ||
    minPrice > 0;

  return (
    <div className="space-y-8 bg-obsidian-950/60 border border-obsidian-800/80 rounded-lg p-6 text-sm text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
        <h3 className="font-cinzel text-sm uppercase tracking-luxury text-white font-bold">
          Refine Horology
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* In-Stock Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => handleInStockToggle(e.target.checked)}
            className="accent-gold-500 w-4 h-4 rounded"
          />
          <span className="text-xs group-hover:text-white transition-colors">
            Available in Vault Only
          </span>
        </label>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-4 border-t border-obsidian-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="font-cinzel uppercase tracking-luxury text-gold-400 font-semibold">
            Price Ceiling
          </span>
          <span className="text-white font-semibold">{formatPrice(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={500}
          max={maxPriceLimit}
          step={100}
          value={maxPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-gold-500 bg-obsidian-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>₹10,000</span>
          <span>{formatPrice(maxPriceLimit)}</span>
        </div>
      </div>

      {/* Manufactures / Brands */}
      <div className="space-y-3 pt-4 border-t border-obsidian-800/80">
        <h4 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
          Manufactures
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => {
            const isSelected = selectedBrands.includes(b.value);
            return (
              <label
                key={b.value}
                className="flex items-center justify-between text-xs cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => updateFilters('brand', b.value, true)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-gold-500 border-gold-500 text-obsidian-950'
                        : 'border-obsidian-700 group-hover:border-gold-500/50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    onClick={() => updateFilters('brand', b.value, true)}
                    className={`${isSelected ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}
                  >
                    {b.label}
                  </span>
                </div>
                {b.count !== undefined && (
                  <span className="text-[10px] text-gray-500 font-mono">({b.count})</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Movement Types */}
      <div className="space-y-3 pt-4 border-t border-obsidian-800/80">
        <h4 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
          Movement Caliber
        </h4>
        <div className="space-y-2">
          {movements.map((mov) => {
            const isSelected = selectedMovement.includes(mov);
            return (
              <label
                key={mov}
                className="flex items-center gap-2.5 text-xs cursor-pointer group py-0.5"
              >
                <div
                  onClick={() => updateFilters('movement', mov, true)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-gold-500 border-gold-500 text-obsidian-950'
                      : 'border-obsidian-700 group-hover:border-gold-500/50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span
                  onClick={() => updateFilters('movement', mov, true)}
                  className={`${isSelected ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}
                >
                  {mov}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-3 pt-4 border-t border-obsidian-800/80">
        <h4 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
          Gender / Silhouette
        </h4>
        <div className="flex flex-wrap gap-2">
          {['Men', 'Women', 'Unisex'].map((g) => {
            const isSelected = selectedGender === g;
            return (
              <button
                key={g}
                onClick={() => updateFilters('gender', g, false)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold-500 text-obsidian-950 font-bold'
                    : 'bg-obsidian-900 border border-obsidian-800 text-gray-400 hover:border-gold-500/40 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
