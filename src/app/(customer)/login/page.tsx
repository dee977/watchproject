'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user?.role === 'SUPER_ADMIN' || data.user?.role === 'ADMIN') {
        router.push(redirect !== '/account' ? redirect : '/admin');
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@aurelia.com');
    setPassword('Admin@123456');
  };

  const handleDemoCustomer = () => {
    setEmail('vikram@royalhorology.com');
    setPassword('Collector@123');
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Collector Authentication
        </span>
        <h1 className="text-3xl font-cinzel font-bold text-white">
          Sign In to Your Vault
        </h1>
        <p className="text-xs text-gray-400">
          Access your private acquisitions, saved wishlists, and order telemetry.
        </p>
      </div>

      {/* Demo Credentials Quick Fill Bar */}
      <div className="p-4 rounded-lg bg-obsidian-900/80 border border-gold-500/30 text-xs space-y-2">
        <div className="flex items-center justify-between text-gold-300 font-semibold font-cinzel">
          <span>Quick Sign-In Autofill:</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Select Role</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="p-2.5 rounded bg-obsidian-950 border border-gold-500/30 hover:border-gold-500 text-[11px] text-gray-300 hover:text-white transition-colors text-left flex flex-col justify-between"
          >
            <strong className="block text-gold-400 font-medium font-cinzel">Super Admin</strong>
            <span className="text-gray-500 text-[10px] truncate">admin@aurelia.com</span>
          </button>
          <button
            type="button"
            onClick={handleDemoCustomer}
            className="p-2.5 rounded bg-obsidian-950 border border-obsidian-800 hover:border-gold-500/50 text-[11px] text-gray-300 hover:text-white transition-colors text-left flex flex-col justify-between"
          >
            <strong className="block text-gray-300 font-medium font-cinzel">VIP Collector</strong>
            <span className="text-gray-500 text-[10px] truncate">vikram@royalhorology...</span>
          </button>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-obsidian-900/50 border border-obsidian-800 space-y-6">
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Email Address</label>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 font-medium block">Vault Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-gold-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <span>Verifying Authentication...</span>
              </>
            ) : (
              <>
                <span>Sign In To Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-obsidian-800 text-xs text-gray-400">
          <span>New to Maison AURELIA? </span>
          <Link
            href={`/register?redirect=${redirect}`}
            className="text-gold-400 hover:text-gold-300 font-semibold underline"
          >
            Create Collector Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-gold-400">Loading Authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
