import React from 'react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { User, Mail, Phone, Globe, Award } from 'lucide-react';
import { ProfileForm } from './ProfileForm';

export default async function AccountProfilePage() {
  const session = await getSessionUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <h2 className="text-xl font-cinzel font-bold text-white">
          VIP Collector Profile
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage your personal details and horological correspondence preferences.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
