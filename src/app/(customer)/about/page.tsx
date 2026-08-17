import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Our Heritage & Maison Story | AURELIA Haute Horlogerie',
  description: 'Learn about AURELIA Haute Horlogerie, our master watchmakers, and our dedication to horological excellence.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Maison Heritage & Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-cinzel font-bold text-white leading-tight">
          Guardians of Precision, Legacy & Eternal Craft
        </h1>
        <p className="text-sm text-gray-300 leading-relaxed font-light">
          Founded on the principle that true luxury is measured in generations rather than seconds, AURELIA is India&apos;s premier destination for certified Haute Horlogerie and independent master watchmaking.
        </p>
      </div>

      {/* Visual Feature */}
      <div className="relative h-96 sm:h-[480px] rounded-2xl overflow-hidden border border-gold-500/20">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
          alt="Horology Workshop"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 max-w-xl text-white space-y-2">
          <span className="text-[10px] uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Certified Atelier Inspection
          </span>
          <h2 className="text-2xl font-cinzel font-bold">
            Every Balance Wheel & Escapement Verified
          </h2>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-cinzel font-bold text-white">100% Certified Provenance</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Direct partnerships with Swiss and Japanese manufactures ensure every timepiece is delivered with its official international warranty card, box, and serial records.
          </p>
        </div>

        <div className="p-8 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-cinzel font-bold text-white">18-Point Atelier Testing</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Before entering our armored vaults, our master watchmakers verify beat rate, amplitude, power reserve, and water-resistance seals on specialized Witschi diagnostic units.
          </p>
        </div>

        <div className="p-8 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-cinzel font-bold text-white">Armored Vault Logistics</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            All acquisitions are transported in tamper-evident armored escorts with comprehensive GPS-tracked transit insurance across every pin code in India.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-12 rounded-2xl bg-obsidian-900/80 border border-gold-500/30 text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-cinzel font-bold text-white">
          Begin Your Horological Journey
        </h2>
        <p className="text-xs text-gray-300 max-w-lg mx-auto">
          Explore our private collection or schedule a private consultation with our Master Concierge team.
        </p>
        <Link
          href="/watches"
          className="btn-gold px-8 py-3.5 rounded text-xs font-bold uppercase tracking-luxury inline-flex items-center gap-2"
        >
          <span>Explore The Vault Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
