import React from 'react';
import { Banknote, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Refund & Settlement Policy | AURELIA',
  description: 'Detailed explanation of AURELIA Cash on Delivery settlement and return policies.',
};

export default function RefundsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Financial Transparency
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Refund & Settlement Policy
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          How refunds and returns are settled for Cash on Delivery acquisitions.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Banknote className="w-5 h-5 text-gold-400" />
            <span>1. Cash on Delivery (COD) Return Settlements</span>
          </h2>
          <p>
            For orders delivered and paid via Cash on Delivery, in the event of an authorized return or exchange, our concierge will request your verified bank account details (Account Name, Account Number, IFSC Code) or UPI ID. Direct NEFT/IMPS transfer is executed within 48 business hours of inspection approval.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <span>2. Order Cancellations Prior to Dispatch</span>
          </h2>
          <p>
            You may cancel an unfulfilled Cash on Delivery order directly from your client dashboard or by contacting our concierge prior to armored courier dispatch with zero restocking fees or penalties.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>3. White-Glove Handover & Inspection Privilege</span>
          </h2>
          <p>
            With our 100% Cash on Delivery fulfillment protocol, you have the right to physically inspect the factory seals, serial numbers, and documentation in the presence of our armored courier before completing payment.
          </p>
        </section>
      </div>
    </div>
  );
}
