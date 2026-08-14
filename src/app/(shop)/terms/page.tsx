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
            <span>1. Authenticity & Warranty Guarantee</span>
          </h2>
          <p>
            All products offered on AURELIA are guaranteed authentic, brand new, and sourced through official authorized channels. Every watch includes its international manufacturer warranty card, original presentation box, and manufacturer serial numbers.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            <span>2. Pricing & Taxation</span>
          </h2>
          <p>
            All prices displayed on AURELIA are listed in Indian Rupees (INR ₹) and are inclusive of Goods & Services Tax (GST 18%) unless explicitly noted otherwise. Prices are subject to adjustment based on official Swiss Franc (CHF) exchange rates and manufacturer MSRP updates.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>3. Limitation of Liability & Dispute Jurisdiction</span>
          </h2>
          <p>
            Any disputes arising from transactions conducted on AURELIA shall be governed exclusively by the laws of India and subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
}
