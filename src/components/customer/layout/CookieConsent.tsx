'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Settings2, X, Check } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('aurelia_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'aurelia_cookie_consent',
      JSON.stringify({ necessary: true, analytics: true, marketing: true, date: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'aurelia_cookie_consent',
      JSON.stringify({
        necessary: true,
        analytics: analyticsAllowed,
        marketing: marketingAllowed,
        date: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(
      'aurelia_cookie_consent',
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        date: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-fadeIn">
      <div className="bg-obsidian-950/98 backdrop-blur-xl border border-gold-500/30 rounded-lg p-6 shadow-luxury text-gray-300 text-xs">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 text-gold-400 font-cinzel font-semibold text-sm">
            <Shield className="w-4 h-4" />
            <span>Maison Privacy & Cookies</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss cookie notice"
            className="text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-400 leading-relaxed mb-4">
          AURELIA utilizes cookies and encrypted identifiers to deliver bespoke horological curation, preserve your vault preferences, and secure transactions.
        </p>

        {showPreferences ? (
          <div className="space-y-3 mb-4 p-3 bg-obsidian-900 rounded border border-obsidian-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Essential Cookies</span>
                <p className="text-[11px] text-gray-400">Required for checkout, security, and cart session.</p>
              </div>
              <span className="text-[11px] text-gold-400 font-medium">Always Active</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-obsidian-800">
              <div>
                <span className="font-semibold text-white">Analytics Cookies</span>
                <p className="text-[11px] text-gray-400">Help us refine concierge experiences and catalog metrics.</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="accent-gold-500 w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-obsidian-800">
              <div>
                <span className="font-semibold text-white">Marketing & Privilege Curation</span>
                <p className="text-[11px] text-gray-400">Tailors bespoke invitations to timepiece allocations.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingAllowed}
                onChange={(e) => setMarketingAllowed(e.target.checked)}
                className="accent-gold-500 w-4 h-4"
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-2">
          {showPreferences ? (
            <button
              onClick={handleSavePreferences}
              className="flex-1 btn-gold py-2 rounded text-center font-semibold"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 btn-gold py-2 rounded text-center font-semibold"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 py-2 px-3 bg-obsidian-900 border border-obsidian-800 hover:border-gray-600 rounded text-center text-gray-300 font-medium transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                aria-label="Configure preferences"
                className="p-2 bg-obsidian-900 border border-obsidian-800 hover:border-gray-600 rounded text-gray-400 hover:text-white"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="mt-3 text-center">
          <Link href="/privacy" className="text-[11px] text-gray-500 hover:text-gold-400 underline underline-offset-2">
            Read Maison Privacy Statement
          </Link>
        </div>
      </div>
    </div>
  );
};
