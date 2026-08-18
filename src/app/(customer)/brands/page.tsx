import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Prestigious Manufactures & Watchmakers | AURELIA',
  description: 'Explore authorized Swiss and Japanese manufactures curated by Maison AURELIA.',
};

export default async function BrandsPage() {
  let brands: any[] = [];
  try {
    brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  } catch (error) {
    console.error('Failed to load brands:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
           Authorized Heritage
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Manufactures & Maisons
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          From the Jura valleys of Switzerland to the precision ateliers of Japan, explore the world&apos;s preeminent watchmaking houses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="group relative bg-obsidian-900/40 border border-obsidian-800 rounded-lg p-6 hover:border-gold-500/50 hover:bg-obsidian-900 transition-all duration-300 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-mono">
                  {brand.originCountry} • Est. {brand.foundedYear}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-obsidian-950 border border-obsidian-800 text-gray-400 font-mono">
                  {brand._count?.products ?? 0} Editions
                </span>
              </div>

              <h2 className="text-2xl font-cinzel font-bold text-white group-hover:text-gold-300 transition-colors">
                {brand.name}
              </h2>

              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {brand.description}
              </p>
            </div>

            <div className="pt-4 border-t border-obsidian-800 flex items-center justify-between text-xs text-gold-400 font-medium">
              <span>View Brand Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
