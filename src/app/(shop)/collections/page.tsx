import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Curated Horological Collections | AURELIA',
  description: 'Explore thematic watch universes curated by AURELIA Master Horologists.',
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Thematic Universes
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Curated Horological Collections
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          From high-frequency tourbillons to deep sea saturation diving instruments, explore our specialized editions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group relative h-96 rounded-xl overflow-hidden border border-obsidian-800 hover:border-gold-500/50 transition-all duration-500 flex flex-col justify-end p-8"
          >
            {col.coverImage && (
              <Image
                src={col.coverImage}
                alt={col.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent" />

            <div className="relative z-10 space-y-2 max-w-lg">
              <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                {col._count.products} Registered References
              </span>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white group-hover:text-gold-300 transition-colors">
                {col.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                {col.description}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-gold-400 font-medium">
                <span>Enter Collection Universe</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
