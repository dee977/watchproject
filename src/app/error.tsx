'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError Boundary] Caught unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6 bg-obsidian-950 text-white">
      <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          AURELIA Haute Horlogerie
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white">
          Connection Synchronization Notice
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          We encountered a brief interruption connecting with our timepiece database. Please refresh to restore your horological view.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="btn-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Page</span>
        </button>

        <Link
          href="/"
          className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
