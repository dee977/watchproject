'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';

interface ProductFormProps {
  initialData?: any;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  collections: Array<{ id: string; name: string }>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  brands,
  categories,
  collections,
}) => {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brandId: initialData?.brandId || brands[0]?.id || '',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    collectionId: initialData?.collectionId || '',
    price: initialData?.price || 25000,
    mrp: initialData?.mrp || 30000,
    stockQuantity: initialData?.inventory?.stockQuantity ?? 5,
    lowStockThreshold: initialData?.inventory?.lowStockThreshold ?? 2,
    movement: initialData?.movement || 'Automatic',
    gender: initialData?.gender || 'Men',
    caseMaterial: initialData?.caseMaterial || '316L Stainless Steel',
    caseDiameter: initialData?.caseDiameter || '40 mm',
    caseThickness: initialData?.caseThickness || '12 mm',
    dialColor: initialData?.dialColor || 'Sunburst Blue',
    strapMaterial: initialData?.strapMaterial || 'Stainless Steel Bracelet',
    waterResistance: initialData?.waterResistance || '100m / 10 Bar',
    powerReserve: initialData?.powerReserve || '45 Hours',
    crystal: initialData?.crystal || 'Sapphire Crystal with Anti-Reflective Coating',
    warranty: initialData?.warranty || '2 Years International Manufacturer Guarantee',
    condition: initialData?.condition || 'New / Unworn',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || true,
    isPublished: initialData?.isPublished ?? true,
  });

  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i: any) => i.url) || [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  const [specs, setSpecs] = useState<Array<{ group: string; key: string; value: string }>>(
    initialData?.specifications?.map((s: any) => ({
      group: s.group,
      key: s.key,
      value: s.value,
    })) || [
      { group: 'Movement', key: 'Caliber', value: 'Manufacture Self-Winding' },
      { group: 'Case', key: 'Bezel', value: 'Unidirectional Rotating Ceramic' },
    ]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { group: 'General', key: 'Feature', value: 'Value' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'group' | 'key' | 'value', value: string) => {
    const updated = [...specs];
    updated[idx][field] = value;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        collectionId: formData.collectionId ? formData.collectionId : null,
        images,
        specs,
      };

      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save timepiece.');
      }

      setSuccessMessage(data.message || 'Timepiece saved successfully.');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-xs">
      {/* 1. Core Identity */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          1. Timepiece Model & Manufacture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-3">
            <label className="text-gray-400 font-medium block">Watch Name & Reference Model</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Presage Cocktail Time 'Blue Moon'"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Brand / Manufacture</label>
            <select
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Horological Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Curated Collection (Optional)</label>
            <select
              value={formData.collectionId}
              onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            >
              <option value="">None (Standard Roster)</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Pricing & Vault Inventory */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          2. Valuation & Vault Allocation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Selling Price (INR ₹)</label>
            <input
              type="number"
              required
              min={1}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">MRP / List Price (INR ₹)</label>
            <input
              type="number"
              required
              min={1}
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Vault Stock Quantity</label>
            <input
              type="number"
              required
              min={0}
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Low Stock Warning Threshold</label>
            <input
              type="number"
              required
              min={1}
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white font-mono focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Watchmaker Specifications */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          3. Horological Caliber & Case Engineering
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Movement Caliber</label>
            <input
              type="text"
              required
              value={formData.movement}
              onChange={(e) => setFormData({ ...formData, movement: e.target.value })}
              placeholder="e.g. Automatic, Manual Wind, Co-Axial Master Chronometer"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Gender Audience</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Case Diameter</label>
            <input
              type="text"
              value={formData.caseDiameter}
              onChange={(e) => setFormData({ ...formData, caseDiameter: e.target.value })}
              placeholder="40 mm"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Case Material</label>
            <input
              type="text"
              value={formData.caseMaterial}
              onChange={(e) => setFormData({ ...formData, caseMaterial: e.target.value })}
              placeholder="316L Stainless Steel"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Water Resistance</label>
            <input
              type="text"
              value={formData.waterResistance}
              onChange={(e) => setFormData({ ...formData, waterResistance: e.target.value })}
              placeholder="100m / 10 Bar"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Power Reserve</label>
            <input
              type="text"
              value={formData.powerReserve}
              onChange={(e) => setFormData({ ...formData, powerReserve: e.target.value })}
              placeholder="45 Hours"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. High-Res Image Gallery Strip */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>4. High-Resolution Visual Gallery</span>
        </h2>

        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste high-res image URL (Unsplash or CDN)..."
            className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="btn-gold px-4 py-2 rounded font-semibold"
          >
            Add Image
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded bg-obsidian-950 border border-obsidian-800 overflow-hidden group"
            >
              <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-2 rounded-full bg-rose-500 text-white"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-gold-500 text-obsidian-950">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Narrative & Description */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          5. Curatorial Description
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Short Summary (Featured on product cards)</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="e.g. Japanese artisanal guilloché sunburst dial with 4R35 automatic movement."
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium block">Full Horological Narrative</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed explanation of dial finish, balance wheel frequency, escapement, and historical provenance..."
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 6. Status & Catalog Placement Flags */}
      <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4">
        <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
          6. Visibility & Merchandising Badges
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 p-3 rounded bg-obsidian-950 border border-obsidian-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-white font-medium">Published in Store</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded bg-obsidian-950 border border-obsidian-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-white font-medium">Curator&apos;s Feature</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded bg-obsidian-950 border border-obsidian-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNewArrival}
              onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-white font-medium">New Release</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded bg-obsidian-950 border border-obsidian-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBestSeller}
              onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-white font-medium">Best Seller Icon</span>
          </label>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-obsidian-800">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-3 rounded bg-obsidian-900 text-gray-400 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold px-8 py-3.5 rounded font-bold uppercase tracking-luxury flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving to Vault Ledger...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Timepiece' : 'Register Timepiece'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
