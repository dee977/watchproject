import React from 'react';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Armored Vault Logistics & Shipping Policy | AURELIA',
  description: 'Learn about AURELIA insured armored courier services and delivery protocols across India.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Secure Transit Protocols
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Armored Shipping & Logistics Policy
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          How AURELIA safeguards every luxury timepiece in transit from our vault to your hands.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>1. 100% Full-Value Insured Transit</span>
          </h2>
          <p>
            Every order leaving our Mumbai vault facility is comprehensively insured for 100% of its replacement value with Lloyds of London / ICICI Lombard underwriters. In the improbable event of transit delay, damage, or loss, your investment is fully safeguarded.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold-400" />
            <span>2. Courier Partners & Security Seals</span>
          </h2>
          <p>
            We partner exclusively with BlueDart Apex Armored Transport and specialized high-value security escorts. Packages are enclosed in tamper-evident security containers bearing unique holographic barcodes that can only be unlocked by the recipient.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <span>3. Delivery Timelines & Fees</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li><strong>Standard Armored Delivery (3-4 business days)</strong> </li>
            <li><strong>Priority Armed Transport (24-48 hours)</strong> </li>
          </ul>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold-400" />
            <span>4. No Verification</span>
          </h2>
          <p>
            there are no verification.
          </p>
        </section>
      </div>
    </div>
  );
}
