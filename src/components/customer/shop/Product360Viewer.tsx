'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { RotateCw, MoveHorizontal } from 'lucide-react';

interface Product360ViewerProps {
  images: Array<{ url: string }>;
  productName: string;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  if (!images || images.length < 2) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    if (Math.abs(diff) > 15) {
      if (diff > 0) {
        setFrameIndex((prev) => (prev + 1) % images.length);
      } else {
        setFrameIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-obsidian-900/60 border border-obsidian-800 rounded-lg p-6 text-center space-y-4">
      <div className="flex items-center justify-between text-xs text-gold-400 font-cinzel">
        <span className="flex items-center gap-1.5 font-semibold">
          <RotateCw className="w-4 h-4 text-gold-400" />
          <span>Interactive 360° Horological View</span>
        </span>
        <span className="text-gray-400 flex items-center gap-1 text-[11px]">
          <MoveHorizontal className="w-3.5 h-3.5" />
          <span>Drag to Rotate</span>
        </span>
      </div>

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative aspect-square max-w-sm mx-auto rounded bg-obsidian-950 overflow-hidden border border-obsidian-800 cursor-grab active:cursor-grabbing select-none"
      >
        <Image
          src={images[frameIndex]?.url || images[0]?.url}
          alt={`${productName} 360 Angle ${frameIndex + 1}`}
          fill
          className="object-cover pointer-events-none"
        />
      </div>

      <p className="text-[11px] text-gray-500">
        Angle {frameIndex + 1} of {images.length} • Drag left or right to inspect case finishing and bevels
      </p>
    </div>
  );
};
