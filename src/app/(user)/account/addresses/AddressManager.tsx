'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, X } from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  type?: string | null;
}

export const AddressManager: React.FC<{ initialAddresses: Address[]; userId: string }> = ({
  initialAddresses,
  userId,
}) => {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    type: 'RESIDENCE',
    isDefaultShipping: true,
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      ...formData,
      country: 'India',
    };
    setAddresses([newAddr, ...addresses]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Destination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4 relative flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white font-cinzel text-sm">{addr.fullName}</span>
                  {addr.isDefaultShipping && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/30 font-semibold">
                      Primary
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-gray-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-gray-300">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-gray-400">{addr.addressLine2}</p>}
              <p className="text-gray-400 font-mono">
                {addr.city}, {addr.state} - {addr.postalCode}
              </p>
              <p className="text-gray-400">Phone: {addr.phone}</p>
            </div>

            <div className="pt-2 border-t border-obsidian-800 text-[10px] uppercase tracking-luxury text-gray-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>Armored GPS Delivery Zone: Verified</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-cinzel font-bold text-white uppercase tracking-luxury flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Add Armored Delivery Destination</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Recipient Name"
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Estate / Building / Villa"
                  className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="400051"
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3 py-2 text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-obsidian-900 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold px-5 py-2 rounded font-semibold">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
