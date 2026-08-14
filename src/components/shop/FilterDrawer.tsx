'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Array<{ label: string; value: string; count?: number }>;
  categories: Array<{ label: string; value: string }>;
  movements: string[];
  maxPriceLimit?: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  brands,
  categories,
  movements,
  maxPriceLimit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-obsidian-950 border-l border-obsidian-800 p-6 flex flex-col justify-between overflow-y-auto animate-slideDown">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-obsidian-800 mb-6">
              <h3 className="font-cinzel text-base uppercase tracking-luxury text-white font-bold">
                Filter Timepieces
              </h3>
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSidebar
              brands={brands}
              categories={categories}
              movements={movements}
              maxPriceLimit={maxPriceLimit}
            />
          </div>

          <div className="pt-6 border-t border-obsidian-800 mt-6">
            <button
              onClick={onClose}
              className="w-full btn-gold py-3 rounded text-xs font-bold uppercase tracking-luxury"
            >
              Apply Filter Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
