import React, { useEffect, useRef, useState } from 'react';
import { clamp, isFinePointer, prefersReducedMotion } from '../../lib/motion';

/*
 * Efekty sterowane przewijaniem (bez bibliotek):
 * - Reveal: element wjeżdża w 3D z rozmycia, gdy pojawi się na ekranie (z opóźnieniem dla kolejnych)
 * - TiltCard: karta pochyla się za kursorem, z odblaskiem światła (tylko komputer)
 * - VelocityMarquee: przewijany pasek tekstu, który przyspiesza i wygina się wraz z tempem scrolla
 * - ScrollProgress: pasek postępu przewijania strony
 */

/** Jednorazowe „wejście” elementu, gdy jest widoczny. */
export const useInView = <T extends Element>(rootMargin = '0px 0px -12% 0px') => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) { setInView(true); return; }
    // górny margines „do nieba”: elementy przeskoczone szybkim scrollem (już nad ekranem) też się pokażą
    const margin = rootMargin.split(' ');
    margin[0] = '99999px';
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin: margin.join(' '), threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
};

export const Reveal: React.FC<{ delay?: number; className?: string; children: React.ReactNode; as?: 'div' | 'section' | 'li' }> = ({
  delay = 0,
  className = '',
  children,
  as = 'div',
}) => {
  const [ref, inView] = useInView<HTMLDivElement>();
  const Tag = as as 'div';
  return (
    <Tag ref={ref} className={`oct-reveal ${inView ? 'is-in' : ''} ${className}`} style={{ ['--d' as string]: `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
};

/** Karta pochylająca się za kursorem, z odblaskiem. Na dotyku – zwykła karta. */
export const TiltCard: React.FC<{ className?: string; children: React.ReactNode; max?: number; glow?: string }> = ({
  className = '',
  children,
  max = 7,
  glow = 'rgba(255,255,255,.14)',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shine = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0, hovering = false;
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `perspective(1100px) rotateX(${-cy * max}deg) rotateY(${cx * max}deg) translateZ(0)`;
      if (shine.current) {
        shine.current.style.background = `radial-gradient(600px circle at ${50 + cx * 50}% ${50 + cy * 50}%, ${glow}, transparent 45%)`;
        shine.current.style.opacity = hovering ? '1' : '0';
      }
      if (hovering || Math.abs(cx) > 0.002 || Math.abs(cy) > 0.002) raf = requestAnimationFrame(loop);
      else { el.style.transform = ''; raf = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      hovering = true;
      kick();
    };
    const leave = () => { tx = 0; ty = 0; hovering = false; kick(); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max, glow]);
  return (
    <div ref={ref} className={`relative will-change-transform ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
      <span ref={shine} aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500" style={{ mixBlendMode: 'soft-light' }} />
    </div>
  );
};

/** Prędkość przewijania (px/klatkę, wygładzona) – wspólna pętla dla wszystkich pasków. */
const useScrollVelocity = () => {
  const vel = useRef(0);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      vel.current += (y - last - vel.current) * 0.15;
      last = y;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return vel;
};

export const VelocityMarquee: React.FC<{
  items: string[];
  direction?: 1 | -1;
  className?: string;
  outline?: boolean;
  accent?: string;
}> = ({ items, direction = 1, className = '', outline = false, accent = '#D71920' }) => {
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const vel = useScrollVelocity();
  useEffect(() => {
    const el = track.current;
    const box = wrap.current;
    if (!el || !box || prefersReducedMotion()) return;
    let x = 0;
    let raf = 0;
    let visible = true;
    let skew = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: '10% 0px' });
    io.observe(box);
    const loop = () => {
      raf = 0;
      if (!visible) return;
      const v = vel.current;
      const speed = 0.6 + Math.min(Math.abs(v) * 0.35, 14);
      x -= speed * direction * (v < -0.5 ? -1 : 1);
      const half = el.scrollWidth / 2;
      if (half > 0) { if (x <= -half) x += half; if (x > 0) x -= half; }
      skew += (clamp(-v * 0.35, -12, 12) - skew) * 0.15;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [direction, vel]);

  const row = items.map((t, i) => (
    <span key={i} className="flex items-center">
      <span
        className="px-6 font-bebas leading-none tracking-wide sm:px-10"
        style={outline ? { color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,.35)' } : undefined}
      >
        {t}
      </span>
      <span aria-hidden style={{ color: accent }} className="text-[0.4em]">✦</span>
    </span>
  ));
  return (
    <div ref={wrap} className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div ref={track} className="inline-flex will-change-transform">
        {row}
        {row}
      </div>
    </div>
  );
};

export const ScrollProgress: React.FC<{ color?: string }> = ({ color = '#D71920' }) => {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div ref={bar} className="h-full origin-left" style={{ background: color, transform: 'scaleX(0)', boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
};

/** Licznik, który „nabija” do wartości, gdy pojawi się na ekranie. */
export const CountUp: React.FC<{ to: number; suffix?: string; prefix?: string; duration?: number; className?: string }> = ({
  to,
  suffix = '',
  prefix = '',
  duration = 1600,
  className = '',
}) => {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) { setV(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setV(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{v}{suffix}</span>;
};

/**
 * Automatyczne wjazdy dla zwykłych podstron: bloki treści (dzieci sekcji) wjeżdżają w 3D z rozmycia,
 * gdy pojawią się na ekranie – po kolei w obrębie rodzica. Nie wymaga zmian w samych stronach.
 */
export const AutoReveal: React.FC<{ children: React.ReactNode; enabled?: boolean }> = ({ children, enabled = true }) => {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '99999px 0px -8% 0px', threshold: 0 });
    const seen = new WeakSet<Element>();
    // od najgłębszych: najpierw oznacz małe bloki, potem pomiń rodziców, którzy je zawierają
    const deepFirst = () => {
      const levels = [':scope > div > * > * > *', ':scope > div > * > *', ':scope > div > *'];
      levels.forEach(sel => {
        el.querySelectorAll(sel).forEach(c => {
          if (seen.has(c) || !(c instanceof HTMLElement)) return;
          const cs = getComputedStyle(c);
          if (cs.position === 'fixed' || cs.position === 'sticky' || cs.position === 'absolute' || cs.display === 'contents') return;
          if (c.offsetHeight < 24 || c.offsetHeight > window.innerHeight * 1.4) return;
          if (c.querySelector('.oct-reveal') || c.closest('.oct-reveal')) return;
          if (c.querySelector('form, input, select, textarea') && c.offsetHeight > 400) return;
          seen.add(c);
          const i = Array.prototype.indexOf.call(c.parentElement?.children || [], c);
          c.classList.add('oct-reveal');
          c.style.setProperty('--d', `${Math.min(Math.max(i, 0), 6) * 80}ms`);
          io.observe(c);
        });
      });
    };
    const t = window.setTimeout(deepFirst, 30);
    return () => { window.clearTimeout(t); io.disconnect(); };
  }, [enabled]);
  return <div ref={root}>{children}</div>;
};
