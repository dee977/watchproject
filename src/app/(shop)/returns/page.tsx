import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '14-Day Vault Return Policy | AURELIA',
  description: 'Learn about AURELIA 14-day return and exchange policy for certified unworn timepieces.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Collector Protection
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          14-Day Vault Return Privilege
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Our commitment to total collector satisfaction and seamless return experiences.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-gold-400" />
            <span>1. Eligibility Requirements</span>
          </h2>
          <p>
            You may request a return or exchange within 14 calendar days from the verified delivery date. To qualify:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>The timepiece must remain unworn, unaltered, and completely free of any scratches, sizing link modifications, or signs of wear.</li>
            <li>All factory protective plastics, caseback stickers, and crown locks must be intact.</li>
            <li>All original manufacture boxes, certificates, manual booklets, warranty cards, and swing tags must be returned in their original condition.</li>
          </ul>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>2. Insured Return Pickup</span>
          </h2>
          <p>
            Once your return request is authorized by our Concierge team, we will dispatch an insured armored courier to collect the package directly from your address at no additional cost to you.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold-400" />
            <span>3. Atelier Inspection & Refund Clearance</span>
          </h2>
          <p>
            Upon arrival at our Mumbai vault, our master watchmakers will inspect the serial number, movement amplitude, and cosmetic integrity within 48 business hours. Following clearance, your refund will be processed immediately.
          </p>
        </section>
      </div>

      <div className="text-center pt-4">
        <Link href="/account/orders" className="btn-gold px-7 py-3 rounded text-xs font-bold uppercase tracking-luxury inline-block">
          Manage Orders & Initiate Return
        </Link>
      </div>
    </div>
  );
}
