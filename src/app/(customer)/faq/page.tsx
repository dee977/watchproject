'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

const faqs = [
  {
    category: 'Authenticity & Warranty',
    items: [
      {
        q: 'Are all timepieces sold on AURELIA 100% authentic?',
        a: 'Yes, without exception. Every timepiece curated by AURELIA is guaranteed 100% authentic and brand new. Each piece arrives in its original manufacturer packaging with full documentation, stamped warranty card, and unique serial numbers registered in the manufacture ledger.',
      },
      {
        q: 'What warranty is included with my acquisition?',
        a: 'All watches carry the complete official international manufacturer warranty (typically 2 to 5 years depending on the brand, e.g., Omega provides 5 years, Longines provides 5 years for silicon balance spring calibers). Additionally, AURELIA provides lifetime concierge support for routine atelier diagnostics.',
      },
    ],
  },
  {
    category: 'Armored Vault Logistics',
    items: [
      {
        q: 'How are the timepieces shipped and secured in transit?',
        a: 'We partner exclusively with BlueDart Apex Armored Transport and specialized armored couriers. Each package is enclosed in a tamper-evident GPS-monitored security pouch with full replacement value transit insurance. Delivery is made directly to you against biometric verification / OTP.',
      },
      {
        q: 'What is the standard delivery timeline across India?',
        a: 'Standard armored delivery takes 3 to 4 business days across all tier-1 and tier-2 Indian cities. For express shipments, dispatch is executed within 24 hours with dedicated air couriers.',
      },
    ],
  },
  {
    category: 'Sizing & Atelier Services',
    items: [
      {
        q: 'Can you size the bracelet before shipping?',
        a: 'Yes, complimentary bracelet sizing is available. Simply provide your wrist circumference in the checkout Concierge Instructions field. All removed original links will be safely packaged inside the presentation box.',
      },
      {
        q: 'What if I need future servicing, polishing, or water-resistance testing?',
        a: 'Our certified master horologists provide full overhaul and service support. You may contact our Concierge to arrange an insured pickup of your timepiece for routine servicing.',
      },
    ],
  },
  {
    category: 'Payments & Returns',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We operate exclusively with Cash on Delivery (COD). You inspect and verify your authenticated timepiece upon white-glove handover before paying in cash.',
      },
      {
        q: 'What is the 14-day Vault Return Privilege?',
        a: 'If for any reason you are not completely satisfied with your unworn timepiece, you may initiate a return within 14 calendar days of receipt. The watch must remain in pristine, unworn condition with all factory security stickers, tags, and documentation intact.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    '0-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Client Advisory
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Detailed guidance regarding our authenticity protocols, armored logistics, warranty coverages, and boutique policies.
        </p>
      </div>

      <div className="space-y-10">
        {faqs.map((group, groupIdx) => (
          <div key={group.category} className="space-y-4">
            <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold border-b border-obsidian-800 pb-2">
              {group.category}
            </h2>

            <div className="space-y-3">
              {group.items.map((item, itemIdx) => {
                const key = `${groupIdx}-${itemIdx}`;
                const isOpen = openItems[key];

                return (
                  <div
                    key={item.q}
                    className="rounded-lg bg-obsidian-900/40 border border-obsidian-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-obsidian-900 transition-colors"
                    >
                      <span className="text-sm font-semibold text-white">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gold-400 flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed border-t border-obsidian-800/60 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
