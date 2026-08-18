'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError Boundary] Caught unhandled admin error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Atelier System Advisory
        </span>
        <h2 className="text-2xl font-cinzel font-bold text-white">
          Admin Hub Telemetry Sync Transient
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          The administration console experienced a momentary connection transient with the secure vault.
          {error?.digest && (
            <span className="block mt-1 font-mono text-[10px] text-gray-500">
              Telemetry Code: {error.digest}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="btn-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>

        <Link
          href="/admin"
          className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
