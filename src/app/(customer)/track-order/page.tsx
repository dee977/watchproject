import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/store-settings';
import { MessageCircle, ArrowRight, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Assistance | AURELIA Haute Horlogerie',
  description:
    'Direct WhatsApp order assistance and concierge support for AURELIA timepiece acquisitions.',
};

export const dynamic = 'force-dynamic';

interface TrackOrderPageProps {
  searchParams?: {
    orderNumber?: string;
    orderId?: string;
  };
}

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const settings = await getStoreSettings();

  // Owner WhatsApp Configuration
  // Country Code: +91 | Mobile: 9687949373 | WhatsApp International: 919687949373
  const rawPhone =
    process.env.NEXT_PUBLIC_OWNER_WHATSAPP ||
    process.env.OWNER_WHATSAPP ||
    settings.CONCIERGE_PHONE ||
    '9687949373';

  let cleanDigits = rawPhone.replace(/[^0-9]/g, '');
  if (cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.substring(1);
  }

  let whatsappDigits = '919687949373';
  if (cleanDigits.length === 10) {
    whatsappDigits = `91${cleanDigits}`;
  } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    whatsappDigits = cleanDigits;
  }

  const orderRef = searchParams?.orderNumber || searchParams?.orderId;

  const prefilledMessage = orderRef
    ? `Hello, I would like an update on my order #${orderRef}. Please assist me.`
    : 'Hello, I would like an update on my order. Please assist me.';

  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    prefilledMessage
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-12">

      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[10px] uppercase tracking-luxury font-semibold">
          <span>Order Assistance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white leading-tight">
          Need an Update on Your Order?
        </h1>

        <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed font-light">
          For order status, delivery updates, or any questions about your
          acquisition, please contact our owner directly on WhatsApp.
        </p>
      </div>

      {/* WhatsApp Assistance Card */}
      <div className="relative rounded-2xl overflow-hidden border border-gold-500/30 bg-obsidian-900/80 p-8 sm:p-12 text-center space-y-8 shadow-2xl backdrop-blur-sm">

        <div className="space-y-4 max-w-lg mx-auto">

          {/* WhatsApp Icon */}
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400">
            <MessageCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white">
              Direct Owner Concierge
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Contact our owner directly on WhatsApp for order status,
              delivery updates, and assistance with your acquisition.
            </p>
          </div>

          <p className="text-xs text-gold-400/90 italic">
            &ldquo;Please include your order details when contacting us so we
            can assist you quickly.&rdquo;
          </p>
        </div>

        {/* WhatsApp Button */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full sm:w-auto px-8 py-4 rounded text-xs font-bold uppercase tracking-luxury inline-flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>

            <span>Contact Owner on WhatsApp</span>
          </a>
        </div>

        {/* Direct Contact Information */}
        <div className="pt-6 border-t border-obsidian-800">
          <div className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800 flex items-center justify-center gap-3">
            <Phone className="w-5 h-5 text-gold-400 flex-shrink-0" />

            <div className="text-left">
              <span className="text-[10px] uppercase text-gray-500 font-mono block">
                WhatsApp / Direct Line
              </span>

              <span className="text-sm text-white font-bold">
                +91 9687949373
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collector Account Link */}
      <div className="text-center p-6 rounded-xl bg-obsidian-900/20 border border-obsidian-800/80 space-y-2">
        <p className="text-xs text-gray-400">
          Already registered as an AURELIA collector?
        </p>

        <Link
          href="/account/orders"
          className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1.5 underline decoration-gold-500/40 hover:decoration-gold-400"
        >
          <span>View Private Order Ledger in Your Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}