import React from 'react';
import { CreditCard, Banknote, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Refund & Settlement Policy | AURELIA',
  description: 'Detailed explanation of AURELIA escrow refund and settlement policies.',
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
          How refunds are executed and credited back to your original source of settlement.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-400" />
            <span>1. Online Payment Gateway Refunds (Razorpay / UPI / Cards)</span>
          </h2>
          <p>
            For transactions completed via Razorpay (Credit/Debit Card, NetBanking, UPI), refunds are automatically credited back to the original source account within 5 to 7 business days following atelier inspection clearance.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Banknote className="w-5 h-5 text-gold-400" />
            <span>2. Cash on Delivery (COD) Settlements</span>
          </h2>
          <p>
            For orders delivered via Cash on Delivery, our concierge will request your verified bank account details (Account Name, Account Number, IFSC Code) or UPI ID. Direct NEFT/IMPS transfer is executed within 48 business hours of inspection approval.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <span>3. Order Cancellations Prior to Dispatch</span>
          </h2>
          <p>
            You may cancel an unfulfilled order directly from your user dashboard prior to armored courier handover for an immediate 100% full refund without deduction of any restocking or processing fees.
          </p>
        </section>
      </div>
    </div>
  );
}
