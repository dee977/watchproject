'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { getPublicImageUrl, FALLBACK_WATCH_IMAGE } from '@/lib/images';

interface ProductGalleryProps {
  images: Array<{ url: string; altText?: string | null }>;
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const rawActive = images[selectedIndex]?.url || images[0]?.url || '';
  const [activeImage, setActiveImage] = useState(() => getPublicImageUrl(rawActive));

  useEffect(() => {
    const raw = images[selectedIndex]?.url || images[0]?.url || '';
    setActiveImage(getPublicImageUrl(raw));
  }, [selectedIndex, images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Primary Display with Zoom */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-square w-full rounded-lg bg-obsidian-900 border border-obsidian-800 overflow-hidden cursor-crosshair group"
      >
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-opacity duration-300 ${
            isZoomed ? 'opacity-0' : 'opacity-100'
          }`}
          onError={() => setActiveImage(FALLBACK_WATCH_IMAGE)}
        />

        {/* High Magnification Lens View */}
        {isZoomed && (
          <div
            className="absolute inset-0 bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '240%',
            }}
          />
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-3 right-3 p-2 rounded-full bg-obsidian-950/70 text-gray-400 backdrop-blur-sm pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
          <ZoomIn className="w-4 h-4 text-gold-400" />
        </div>
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => {
            const thumbUrl = getPublicImageUrl(img.url);
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 rounded-md overflow-hidden bg-obsidian-900 border transition-all flex-shrink-0 ${
                  selectedIndex === idx
                    ? 'border-gold-400 ring-2 ring-gold-400/50 scale-105'
                    : 'border-obsidian-800 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as any).src = FALLBACK_WATCH_IMAGE;
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
