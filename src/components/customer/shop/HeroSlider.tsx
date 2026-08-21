'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Slide {
  id: number;
  tagline: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    tagline: 'HAUTE HORLOGERIE • GENEVE & TOKYO',
    title: 'TIME, REDEFINED.',
    subtitle: 'Discover exceptional handcrafted timepieces engineered for eternity and curated with uncompromising pedigree.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Explore Masterpieces',
    ctaLink: '/watches',
    secondaryCtaText: 'Discover Collections',
    secondaryCtaLink: '/collections',
  },
  {
    id: 2,
    tagline: 'LEGENDARY MOONWATCH PEDIGREE',
    title: 'THE CHRONOMETER ICON.',
    subtitle: 'METAS Master Chronometer certified co-axial calibers tested beyond the frontiers of extreme gravity.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'View Chronographs',
    ctaLink: '/watches/chronograph',
    secondaryCtaText: 'Omega Lineage',
    secondaryCtaLink: '/brands/omega',
  },
  {
    id: 3,
    tagline: 'ABYSSAL DEEP SEA INSTRUMENTS',
    title: 'MASTER OF THE DEEP.',
    subtitle: 'ISO 6425 certified dive watches resistant up to 300 meters with ceramic unidirectional rotating bezels.',
    image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Discover Dive Watches',
    ctaLink: '/watches/dive',
    secondaryCtaText: 'Seiko Prospex',
    secondaryCtaLink: '/brands/seiko',
  },
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
  };

  const active = DEFAULT_SLIDES[currentSlide];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-[85vh] min-h-[580px] max-h-[820px] w-full overflow-hidden bg-obsidian-950"
    >
      {/* Slide Background Images */}
      {DEFAULT_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } transition-transform duration-[6500ms]`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            className="object-cover object-center"
          />
          {/* Luxury Multi-layer Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-obsidian-950/50" />
        </div>
      ))}

      {/* Slide Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center z-10">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[11px] uppercase tracking-luxury font-semibold animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span>{active.tagline}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cinzel font-bold text-white tracking-luxury leading-[1.08] drop-shadow-lg">
            {active.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed max-w-xl">
            {active.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={active.ctaLink}
              className="btn-gold px-8 py-3.5 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2 group"
            >
              <span>{active.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {active.secondaryCtaText && (
              <Link
                href={active.secondaryCtaLink || '/collections'}
                className="btn-outline-gold px-7 py-3.5 rounded text-xs font-semibold uppercase tracking-luxury"
              >
                {active.secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
        {/* Slide Counter */}
        <div className="text-xs font-mono text-gray-400">
          <span className="text-gold-300 font-bold">0{currentSlide + 1}</span> / 0{DEFAULT_SLIDES.length}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-2.5 rounded-full bg-obsidian-900/80 border border-obsidian-700 hover:border-gold-400 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-2.5 rounded-full bg-obsidian-900/80 border border-obsidian-700 hover:border-gold-400 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 flex items-center gap-2">
        {DEFAULT_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1 transition-all rounded-full ${
              idx === currentSlide
                ? 'w-8 bg-gold-400'
                : 'w-2 bg-obsidian-700 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
