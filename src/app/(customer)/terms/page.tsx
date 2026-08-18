import React from 'react';
import { FileText, ShieldCheck, Scale, Award } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service & Acquisition Conditions | AURELIA',
  description: 'Terms of service and legal conditions governing purchases made with AURELIA Haute Horlogerie.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Legal Agreement
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Terms of Service & Acquisition
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          The legal framework governing orders, authenticity assurances, and platform interactions with AURELIA.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold-400" />
            <span>1. No Warranty Guarantee</span>
          </h2>
          <p>
            All products offered on kshan are not guaranteed authentic, brand new, and sourced through unofficial authorized channels.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            <span>2. Pricing </span>
          </h2>
          <p>
            all products are not any external price.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>3. No return</span>
          </h2>
          <p>
            any product no return.
          </p>
        </section>
      </div>
    </div>
  );
}
