'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Loader2 } from 'lucide-react';

interface AdminProductRowActionsProps {
  productId: string;
  productName: string;
}

export const AdminProductRowActions: React.FC<AdminProductRowActionsProps> = ({
  productId,
  productName,
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you certain you wish to delete reference "${productName}" from the vault catalog?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete timepiece.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting timepiece.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-gray-400 hover:text-white hover:border-gold-500/40 transition-colors"
        title="Edit Timepiece"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-gray-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors disabled:opacity-50"
        title="Delete Timepiece"
      >
        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
