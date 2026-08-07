'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface GalleryItem { src: string; alt: string }

export default function ProductGallery({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(() => setOpenIndex((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);
  const prev = useCallback(() => setOpenIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)), [items.length]);

  // Keyboard control + prevent the page scrolling behind the lightbox
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, next, prev]);

  if (items.length === 0) return null;
  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {items.map((g, i) => (
          <button
            key={g.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`View larger: ${g.alt}`}
            className="group overflow-hidden rounded-2xl border border-brand-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="relative h-56 overflow-hidden bg-steel-50">
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* darkening veil + zoom affordance, both revealed on hover */}
              <div className="absolute inset-0 bg-steel-950/0 transition-colors duration-300 group-hover:bg-steel-950/30" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/95 text-brand-600 opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                  </svg>
                </span>
              </span>
            </div>

            {/* caption bar with icon */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-steel-900 transition-colors duration-300 group-hover:text-brand-600">
                {g.alt}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
        >
          <div className="absolute inset-0 bg-steel-950/90 backdrop-blur-sm" onClick={close} />

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>

          {items.length > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Previous image"
                className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button type="button" onClick={next} aria-label="Next image"
                className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </>
          )}

          <figure className="relative z-[1] flex max-h-full w-full max-w-5xl flex-col items-center">
            <div className="relative max-h-[75vh] w-full">
              {/* key forces a remount per image so the fade replays */}
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={1600}
                height={1100}
                sizes="100vw"
                className="mx-auto max-h-[75vh] w-auto animate-[fadeIn_.3s_ease-out] rounded-xl object-contain"
                priority
              />
            </div>
            <figcaption className="mt-5 flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 text-center backdrop-blur">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <span className="text-sm font-medium text-white">{current.alt}</span>
              <span className="font-mono text-xs text-white/50">{openIndex! + 1}/{items.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
