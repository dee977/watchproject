'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export const PrintInvoiceButton: React.FC = () => {
  return (
    <button
      onClick={() => window.print()}
      className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
    >
      <Printer className="w-4 h-4" />
      <span>Print Official Tax Invoice</span>
    </button>
  );
};
