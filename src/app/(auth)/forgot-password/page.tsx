'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Security Recovery
        </span>
        <h1 className="text-3xl font-cinzel font-bold text-white">
          Reset Vault Password
        </h1>
        <p className="text-xs text-gray-400">
          Enter your registered email address to receive secure cryptographic access credentials.
        </p>
      </div>

      <div className="p-8 rounded-xl bg-obsidian-900/50 border border-obsidian-800 space-y-6">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-gold-400 mx-auto" />
            <h2 className="text-lg font-cinzel font-bold text-white">Recovery Instructions Dispatched</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              If an account is associated with <strong className="text-gold-300">{email}</strong>, a secure password recovery link has been delivered.
            </p>
            <div className="pt-2">
              <Link href="/login" className="btn-gold px-6 py-2.5 rounded text-xs font-semibold inline-block">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-gray-400 font-medium block">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@luxury.com"
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-gold py-3.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2"
            >
              <span>Transmit Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-obsidian-800 text-xs">
          <Link href="/login" className="text-gray-400 hover:text-gold-300">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
