'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SortSelectProps {
  currentSort?: string;
}

export const SortSelect: React.FC<SortSelectProps> = ({ currentSort = 'recommended' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'recommended') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    params.delete('page'); // Reset to page 1 on sort change
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 uppercase tracking-luxury font-cinzel text-[10px]">Sort:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-obsidian-950 border border-obsidian-800 text-gray-200 rounded px-2.5 py-1.5 text-xs focus:border-gold-500 focus:outline-none cursor-pointer hover:border-gold-500/40 transition-colors"
      >
        <option value="recommended">Curator&apos;s Recommendation</option>
        <option value="newest">Newest Acquisitions</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="popular">Most Coveted</option>
      </select>
    </div>
  );
};
