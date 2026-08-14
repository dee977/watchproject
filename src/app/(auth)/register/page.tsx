'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Privilege Membership
        </span>
        <h1 className="text-3xl font-cinzel font-bold text-white">
          Create Collector Account
        </h1>
        <p className="text-xs text-gray-400">
          Join Maison AURELIA for private horological allocations and personal concierge services.
        </p>
      </div>

      <div className="p-8 rounded-xl bg-obsidian-900/50 border border-obsidian-800 space-y-6">
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikramaditya Roy"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@luxury.com"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
              <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Password (Min. 6 Characters)</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-obsidian-950 border border-obsidian-800 rounded pl-10 pr-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gold py-3.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-obsidian-800 text-xs text-gray-400">
          <span>Already have an account? </span>
          <Link
            href={`/login?redirect=${redirect}`}
            className="text-gold-400 hover:text-gold-300 font-semibold underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-gold-400">Loading Registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
