import React from 'react';
import { Cookie, Settings, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cookie & Tracking Policy | AURELIA',
  description: 'Detailed explanation of cookie usage and privacy preferences on AURELIA.',
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Transparency & Preferences
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Cookie Policy
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          How AURELIA uses essential, analytical, and marketing cookies to enhance your browsing experience.
        </p>
      </div>

      <div className="space-y-8 text-xs text-gray-300 leading-relaxed">
        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Cookie className="w-5 h-5 text-gold-400" />
            <span>1. What Are Cookies?</span>
          </h2>
          <p>
            Cookies are small cryptographic text files placed on your device to maintain your logged-in session, remember your shopping cart items across browser reloads, and preserve your currency and filtering preferences.
          </p>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-400" />
            <span>2. Categories of Cookies We Deploy</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong>Strictly Necessary Cookies:</strong> Required for cart persistence, user authentication, and secure checkout escrow. Cannot be disabled.</li>
            <li><strong>Performance & Analytics Cookies:</strong> Help us anonymously analyze page engagement, search patterns, and server response times.</li>
            <li><strong>Personalization Cookies:</strong> Remember your preferred watch complications, recently viewed horological pieces, and filters.</li>
          </ul>
        </section>

        <section className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3">
          <h2 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>3. Managing Your Preferences</span>
          </h2>
          <p>
            You can modify your cookie settings at any time via the Cookie Consent banner at the bottom of the page or through your browser settings.
          </p>
        </section>
      </div>
    </div>
  );
}
