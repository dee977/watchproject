'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ShieldCheck, Truck, Clock, Award, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You have been enrolled into the AURELIA Horology Gazette.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <footer className="bg-obsidian-950 border-t border-obsidian-800 text-gray-400 text-sm">
      {/* Brand Trust Bar */}
      <div className="border-b border-obsidian-800/80 py-10 bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-cinzel text-xs uppercase tracking-luxury mb-1">
                100% Certified Authentic
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Directly sourced from manufacture boutiques with stamped global warranty papers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-cinzel text-xs uppercase tracking-luxury mb-1">
                Insured Armored Transit
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Complimentary insured delivery with tamper-proof security seals and GPS tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-cinzel text-xs uppercase tracking-luxury mb-1">
                14-Day Return Privilege
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full refund or exchange on unworn timepieces in original vault packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-cinzel text-xs uppercase tracking-luxury mb-1">
                256-Bit Escrow Security
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Seamless encrypted payments via Razorpay, UPI, cards, and Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        {/* Brand Column & Newsletter */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-cinzel text-2xl font-bold tracking-luxury gold-gradient-text">
                AURELIA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-gray-500 -mt-1">
                Haute Horlogerie • Geneve & Mumbai
              </span>
            </Link>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-sm">
              Maison AURELIA curates the world’s most distinguished mechanical timepieces. Combining horological pedigree with uncompromising authenticity.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="pt-2">
            <h4 className="text-xs uppercase tracking-luxury text-gold-300 font-cinzel mb-2 font-semibold">
              The Horology Gazette
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Receive private invitations to limited allocations and horological releases.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 bg-obsidian-900 border border-obsidian-800 px-3.5 py-2.5 rounded text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-gold px-4 py-2.5 text-xs rounded font-semibold disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Subscribe'}
                </button>
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Categories */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Timepieces
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/watches/automatic" className="hover:text-gold-300 transition-colors">
                Automatic & Mechanical
              </Link>
            </li>
            <li>
              <Link href="/watches/chronograph" className="hover:text-gold-300 transition-colors">
                Chronographs & Racing
              </Link>
            </li>
            <li>
              <Link href="/watches/dive" className="hover:text-gold-300 transition-colors">
                Professional Divers (300M)
              </Link>
            </li>
            <li>
              <Link href="/watches/dress" className="hover:text-gold-300 transition-colors">
                Dress & Formal Elegance
              </Link>
            </li>
            <li>
              <Link href="/watches/luxury" className="hover:text-gold-300 transition-colors">
                Grand Complications
              </Link>
            </li>
            <li>
              <Link href="/watches/sport" className="hover:text-gold-300 transition-colors">
                Sport & High Shock
              </Link>
            </li>
          </ul>
        </div>

        {/* Manufactures */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Manufactures
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/brands/omega" className="hover:text-gold-300 transition-colors">
                Omega
              </Link>
            </li>
            <li>
              <Link href="/brands/cartier" className="hover:text-gold-300 transition-colors">
                Cartier
              </Link>
            </li>
            <li>
              <Link href="/brands/longines" className="hover:text-gold-300 transition-colors">
                Longines
              </Link>
            </li>
            <li>
              <Link href="/brands/tissot" className="hover:text-gold-300 transition-colors">
                Tissot
              </Link>
            </li>
            <li>
              <Link href="/brands/seiko" className="hover:text-gold-300 transition-colors">
                Seiko Presage & Prospex
              </Link>
            </li>
            <li>
              <Link href="/brands/casio" className="hover:text-gold-300 transition-colors">
                Casio Full Metal
              </Link>
            </li>
          </ul>
        </div>

        {/* Concierge & Client Service */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Client Concierge
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/track-order" className="hover:text-gold-300 transition-colors">
                Track Your Shipment
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-gold-300 transition-colors">
                White-Glove Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold-300 transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold-300 transition-colors">
                Contact Concierge
              </Link>
            </li>
          </ul>
        </div>

        {/* Maison Info */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            The Maison
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/privacy" className="hover:text-gold-300 transition-colors">
                Privacy & Data Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold-300 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-gold-300 transition-colors">
                Cookie Preferences
              </Link>
            </li>
          </ul>

          <div className="pt-2 text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-gold-300 font-medium">
              <Phone className="w-3 h-3" />
              <span>+91 (0) 22 8900 4400</span>
            </div>
            <p className="text-[11px]">Mon - Sat: 10:00 AM - 8:00 PM IST</p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Security Badges */}
      <div className="border-t border-obsidian-800 py-8 bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} AURELIA Haute Horlogerie Private Limited. All rights reserved. Registered in India.
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Razorpay • UPI • Cards • COD</span>
            <span>•</span>
            <span>ISO 9001:2015 Vault Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
