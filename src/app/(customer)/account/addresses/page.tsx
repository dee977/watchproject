import React from 'react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AddressManager } from './AddressManager';

export default async function AccountAddressesPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { isDefaultShipping: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <h2 className="text-xl font-cinzel font-bold text-white">
          Saved Armored Delivery Addresses
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage multiple residences, estates, and corporate delivery addresses for insured dispatch.
        </p>
      </div>

      <AddressManager initialAddresses={addresses} userId={session.userId} />
    </div>
  );
}
