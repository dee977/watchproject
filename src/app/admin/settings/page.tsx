import React from 'react';
import { getStoreSettings } from '@/lib/store-settings';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Platform Configuration
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Dynamic Store Parameters & Policies
        </h1>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
