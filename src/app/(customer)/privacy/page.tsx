import React from 'react';
import { Lock, Eye, Database, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & Data Security | AURELIA',
  description: 'Learn how AURELIA protects and manages your personal and horological data under GDPR and Indian IT Acts.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Data Governance
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Last updated: August 2026. AURELIA respects your confidentiality and enforces bank-grade data security protocols.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold-400" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you interact with AURELIA, we collect essential data to fulfill your luxury acquisitions: full name, contact information, armored shipping address, email, telephone number, and transaction logs. Orders are fulfilled exclusively via Cash on Delivery (COD); no credit card or online banking credentials are ever collected, processed, or stored on our servers.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-gold-400" />
            <span>2. How We Utilize Your Information</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>To process and fulfill authenticated horological orders, invoice generation, and courier tracking.</li>
            <li>To transmit critical transactional notifications regarding vault allocation and dispatch milestones.</li>
            <li>To manage manufacturer warranty registration records on your behalf.</li>
            <li>To provide personalized concierge recommendations and newsletter updates (only with explicit consent).</li>
          </ul>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-400" />
            <span>3. Zero Third-Party Data Monetization</span>
          </h2>
          <p>
            AURELIA operates under strict privacy ethics. We will never sell, lease, or monetize your personal details to third-party advertising brokers or data brokers under any circumstances.
          </p>
        </section>
      </div>
    </div>
  );
}
