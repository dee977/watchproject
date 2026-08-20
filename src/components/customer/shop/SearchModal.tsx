'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Clock, ArrowRight, Loader2, Sparkles, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { getProductImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    brand: string;
    image: string;
  }>;
  brands: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Seiko Presage',
  'Omega Moonwatch',
  'Tissot PRX',
  'Cartier Tank',
  'Chronograph',
  'Automatic Diver',
  'Grade 5 Titanium',
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = localStorage.getItem('aurelia_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {}
      }
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('aurelia_recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('aurelia_recent_searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Modal Dialog */}
      <div className="min-h-screen px-4 text-center flex items-start justify-center pt-16 md:pt-24">
        <div className="relative w-full max-w-3xl bg-obsidian-950 border border-gold-500/30 rounded-lg shadow-2xl text-left overflow-hidden z-10 animate-scaleIn">
          {/* Search Header Input */}
          <form onSubmit={handleSearchSubmit} className="relative border-b border-obsidian-800 p-4 md:p-6 flex items-center gap-3">
            <Search className="w-6 h-6 text-gold-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by watch name, caliber, brand, reference SKU..."
              className="w-full bg-transparent text-lg md:text-xl text-white placeholder-gray-500 focus:outline-none"
            />
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gold-400 animate-spin flex-shrink-0" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="p-1 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-luxury text-gray-400 hover:text-gold-300 ml-2 px-2 py-1 border border-obsidian-800 rounded"
            >
              ESC
            </button>
          </form>

          {/* Body Content */}
          <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
            {/* Live Search Results */}
            {query.trim() && results ? (
              <div className="space-y-6">
                {/* Brand & Category Matches */}
                {(results.brands.length > 0 || results.categories.length > 0) && (
                  <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-obsidian-800/60">
                    {results.brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brands/${b.slug}`}
                        onClick={() => {
                          saveRecentSearch(b.name);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs hover:bg-gold-500/20 transition-colors"
                      >
                        <Tag className="w-3 h-3 text-gold-400" />
                        <span>Brand: {b.name}</span>
                      </Link>
                    ))}
                    {results.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/watches/${c.slug}`}
                        onClick={() => {
                          saveRecentSearch(c.name);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-obsidian-900 border border-obsidian-800 text-gray-300 text-xs hover:border-gold-500/40 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-gold-500" />
                        <span>Category: {c.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Product Matches */}
                {results.products.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-luxury font-cinzel">
                      <span>Timepiece Matches ({results.products.length})</span>
                      <button
                        onClick={handleSearchSubmit}
                        className="text-gold-400 hover:text-gold-300 flex items-center gap-1"
                      >
                        <span>View All Results</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.products.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => {
                            saveRecentSearch(item.name);
                            onClose();
                          }}
                          className="flex items-center gap-3.5 p-3 rounded bg-obsidian-900/80 border border-obsidian-800 hover:border-gold-500/50 hover:bg-obsidian-900 transition-all group"
                        >
                          <div className="relative w-14 h-14 bg-obsidian-950 rounded overflow-hidden flex-shrink-0 border border-obsidian-800">
                            <Image
                              src={getProductImageUrl(item.image, FALLBACK_WATCH_IMAGE)}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as any).src = FALLBACK_WATCH_IMAGE;
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] uppercase tracking-luxury text-gold-400 font-semibold truncate">
                              {item.brand} • <span className="text-gray-400">{item.sku}</span>
                            </div>
                            <div className="text-xs font-medium text-white group-hover:text-gold-300 transition-colors truncate">
                              {item.name}
                            </div>
                            <div className="text-xs font-semibold text-gold-300 mt-0.5">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No horological timepieces match &quot;{query}&quot;.</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try searching for brands like Seiko, Omega, Tissot or styles like Chronograph, Automatic.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Idle State: Popular & Recent Searches */
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-luxury font-cinzel">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span>Recent Inquiries</span>
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectRecent(term)}
                          className="px-3 py-1.5 rounded bg-obsidian-900 border border-obsidian-800 text-xs text-gray-300 hover:border-gold-500/40 hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular searches */}
                <div className="space-y-3">
                  <div className="text-xs text-gold-400 uppercase tracking-luxury font-cinzel font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Horological Searches</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectRecent(term)}
                        className="px-3.5 py-1.5 rounded bg-obsidian-900/60 border border-obsidian-800 text-xs text-gray-300 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
