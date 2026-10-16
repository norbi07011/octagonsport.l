import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isFinePointer, prefersReducedMotion } from '../../lib/motion';

/*
 * Galeria produktu:
 * - komputer: duże zdjęcie z płynnym przybliżeniem pod kursorem (lupa), przejścia między zdjęciami,
 *   strzałki i klawiatura, miniatury z animowanym wskaźnikiem
 * - telefon: przesuwanie palcem (natywny scroll-snap z bezwładnością) + kropki
 * - zmiana wariantu: fala koloru przez scenę
 */

const waveColor = (hex?: string) => {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return '#D71920';
  const n = parseInt(hex.slice(1), 16);
  const l = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return l < 0.18 || l > 0.92 ? '#D71920' : hex;
};

export const ProductGallery: React.FC<{
  productId: string;
  images: string[];
  name: string;
  colorHex?: string;
  overlay?: React.ReactNode;
  stageRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ productId, images, name, colorHex, overlay, stageRef }) => {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const fine = isFinePointer();
  const n = images.length;

  useEffect(() => { setIdx(0); strip.current?.scrollTo({ left: 0 }); }, [productId]);

  const go = (d: number) => setIdx(i => (i + d + n) % n);

  const onMove = (e: React.MouseEvent) => {
    if (!fine || prefersReducedMotion()) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (imgRef.current) imgRef.current.style.transformOrigin = `${x}% ${y}%`;
    if (!zoom) setZoom(true);
  };

  const onStripScroll = () => {
    const el = strip.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  return (
    <div className="space-y-4">
      {/* Telefon: przesuwanie palcem */}
      <div className="relative lg:hidden">
        <div
          ref={strip}
          onScroll={onStripScroll}
          className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto border border-neutral-800 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative h-full w-full shrink-0 snap-center">
              <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-contain" loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
        <div key={`wave-m-${productId}`} aria-hidden className="oct-wave pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle, ${waveColor(colorHex)}66, transparent 70%)` }} />
        {overlay}
        {n > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === idx ? 22 : 6, background: i === idx ? '#D71920' : 'rgba(0,0,0,.25)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Komputer: scena z lupą */}
      <div
        ref={stageRef}
        className="group relative hidden aspect-[4/5] items-center justify-center overflow-hidden border border-neutral-800 bg-white lg:flex"
        style={{ cursor: fine ? (zoom ? 'zoom-out' : 'zoom-in') : undefined }}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(false)}
        onClick={() => fine && setZoom(z => !z)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
      >
        <img
          key={images[idx] + idx}
          ref={imgRef}
          src={images[idx] || images[0]}
          alt={name}
          className="oct-swap h-full w-full object-contain"
          style={{ transform: zoom ? 'scale(2.1)' : 'scale(1)', transition: 'transform .45s cubic-bezier(.16,1,.3,1)' }}
        />
        <div key={`wave-${productId}`} aria-hidden className="oct-wave pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle, ${waveColor(colorHex)}66, transparent 70%)` }} />
        {overlay}
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Vorige"
              onClick={e => { e.stopPropagation(); setZoom(false); go(-1); }}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2.5 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-[#D71920] group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Volgende"
              onClick={e => { e.stopPropagation(); setZoom(false); go(1); }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2.5 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-[#D71920] group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-widest text-white">
              {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </>
        )}
      </div>

      {/* Miniatury (komputer) */}
      {n > 1 && (
        <div className="hidden gap-3 overflow-x-auto pb-2 lg:flex">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setIdx(i)}
              className={`relative h-24 w-20 shrink-0 overflow-hidden border-2 bg-white transition-all duration-300 hover:-translate-y-1 ${
                idx === i ? 'border-[#D71920] opacity-100' : 'border-neutral-800 opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-contain" />
              {idx === i && <span className="absolute inset-x-0 bottom-0 h-1 bg-[#D71920]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
