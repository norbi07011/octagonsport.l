import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import type { ShowcaseConfig, ShowcaseLang as Lang, ShowcaseVariant as Variant, T3 } from '../../data/showcases';

/*
 * Premium showcase serii produktów (inspiracja: strony produktowe 3D).
 * 1) Karuzela 3D – produkty w łuku, aktywny unosi się nad świecącym podestem,
 *    tło przejmuje kolor produktu. Przesuwanie palcem / myszką / strzałkami / klawiaturą.
 * 2) Scroll story – sekcja przypięta do ekranu: produkt obraca się i rośnie przy przewijaniu,
 *    cechy pojawiają się po kolei, na końcu „obrót” do frontu, wybór koloru i przejście do produktu.
 * Konfiguracja serii: src/data/showcases.ts
 */

const productOf = (v: Variant) => PRODUCTS.find(p => p.id === v.id);
const euro = (n?: number) => (typeof n === 'number' ? `€${n.toFixed(2).replace('.', ',')}` : '');
const swatchOf = (v: Variant) => v.swatch || v.accent;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
};

const useViewportWidth = () => {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
};

const L = (lang: Lang, nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);

/* ------------------------------------------------------------------------- */
/* 1) KARUZELA 3D                                                            */
/* ------------------------------------------------------------------------- */

const Carousel: React.FC<{
  cfg: ShowcaseConfig;
  active: number;
  setActive: (fn: (a: number) => number) => void;
  lang: Lang;
  onDiscover: () => void;
  onView: (v: Variant) => void;
}> = ({ cfg, active, setActive, lang, onDiscover, onView }) => {
  const variants = cfg.variants;
  const n = variants.length;
  const w = useViewportWidth();
  const mobile = w < 640;
  const c = cfg.carousel;
  const spacing = mobile ? Math.min(w * c.mobileSpacing, 150) : w < 1024 ? c.spacing * 0.82 : c.spacing;
  const itemW = mobile ? Math.min(w * c.mobileItemW, 230) : w < 1024 ? c.itemW * 0.85 : c.itemW;
  const tr = (t: T3) => t[lang];

  const [dragDx, setDragDx] = useState(0);
  const drag = useRef<{ x: number; y: number; moved: boolean; horizontal: boolean | null } | null>(null);
  const suppressClick = useRef(false);
  const go = (d: number) => setActive(a => (((a + d) % n) + n) % n);

  // Autoplay do pierwszej interakcji użytkownika (tylko gdy sekcja jest widoczna).
  const [autoplay, setAutoplay] = useState(true);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!autoplay || hover || !visible) return;
    const t = window.setInterval(() => setActive(a => (a + 1) % n), 4200);
    return () => window.clearInterval(t);
  }, [autoplay, hover, visible, n, setActive]);
  const userGo = (d: number) => { setAutoplay(false); go(d); };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false, horizontal: null };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) d.horizontal = Math.abs(dx) > Math.abs(dy);
    if (d.horizontal) {
      d.moved = true;
      setDragDx(dx);
    }
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      suppressClick.current = true;
      setAutoplay(false);
      const steps = Math.round(-dragDx / spacing) || (Math.abs(dragDx) > 40 ? (dragDx < 0 ? 1 : -1) : 0);
      if (steps) go(steps);
      window.setTimeout(() => (suppressClick.current = false), 50);
    }
    setDragDx(0);
  };

  const current = variants[active];
  const product = productOf(current);
  const dragging = dragDx !== 0;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={cfg.eyebrow}
      className="relative overflow-hidden border-b border-neutral-800 bg-[#050505]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tło w kolorze aktywnego produktu (warstwy z płynnym przenikaniem) */}
      {variants.map((v, i) => (
        <div
          key={v.key}
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === active ? 1 : 0,
            background: `radial-gradient(ellipse 70% 55% at 50% 72%, ${v.accent}38 0%, ${v.accent}10 45%, transparent 75%)`,
          }}
        />
      ))}
      {/* Reflektor z góry */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="mx-auto h-3 w-28 rounded-full bg-white/80 blur-[1px] sm:w-40" style={{ boxShadow: `0 0 40px 8px ${current.accent}66` }} />
        <div
          className="mx-auto h-[420px] w-[340px] opacity-40 transition-[background] duration-1000 sm:w-[560px]"
          style={{
            clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
            background: `linear-gradient(to bottom, ${current.accent}55, transparent 85%)`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">{cfg.eyebrow}</p>
          <h2 className="mt-2 font-bebas text-4xl tracking-wide text-white sm:text-6xl">{tr(cfg.title)}</h2>
        </div>

        {/* Scena 3D */}
        <div
          className="relative mx-auto mt-4 select-none outline-none sm:mt-6"
          style={{ height: mobile ? 340 : 470, perspective: 1400, touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={() => drag.current && endDrag()}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') userGo(1);
            if (e.key === 'ArrowLeft') userGo(-1);
          }}
        >
          {/* Podest z poświatą */}
          <div
            aria-hidden
            className="oct-pulse-ring absolute left-1/2 rounded-[50%] transition-[box-shadow,border-color] duration-700"
            style={{
              bottom: mobile ? 34 : 44,
              width: mobile ? 190 : 280,
              height: mobile ? 34 : 48,
              border: `2px solid ${current.accent}`,
              boxShadow: `0 0 30px 6px ${current.accent}88, inset 0 0 22px ${current.accent}88`,
              background: `radial-gradient(ellipse at center, ${current.accent}55, transparent 70%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-[50%] blur-2xl transition-colors duration-700"
            style={{ bottom: mobile ? 10 : 14, width: mobile ? 300 : 520, height: mobile ? 60 : 90, background: `${current.accent}40` }}
          />

          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {variants.map((v, i) => {
              let o = i - active;
              if (o > n / 2) o -= n;
              if (o < -n / 2) o += n;
              const f = o + dragDx / spacing;
              const abs = Math.abs(f);
              const isActive = o === 0;
              return (
                <button
                  key={v.key}
                  type="button"
                  aria-label={`${cfg.storyTitle} – ${tr(v.label)}`}
                  aria-current={isActive}
                  onClick={() => {
                    if (suppressClick.current) return;
                    if (isActive) onView(v);
                    else { setAutoplay(false); setActive(() => i); }
                  }}
                  className="absolute left-1/2 top-[46%] cursor-pointer outline-none"
                  style={{
                    width: itemW,
                    transform: `translate(-50%, -50%) translateX(${f * spacing}px) translateZ(${-abs * 170}px) rotateY(${-f * 26}deg) scale(${1 - Math.min(abs, 2.2) * 0.12})`,
                    opacity: abs > 2.6 ? 0 : 1 - Math.min(abs, 2.6) * 0.16,
                    filter: `brightness(${1 - Math.min(abs, 1) * 0.55}) saturate(${1 - Math.min(abs, 1) * 0.35})`,
                    zIndex: 10 - Math.round(abs),
                    pointerEvents: abs > 2.6 ? 'none' : undefined,
                    transition: dragging ? 'none' : 'transform 800ms cubic-bezier(.2,.8,.2,1), opacity 800ms, filter 800ms',
                  }}
                >
                  <div className={isActive && !dragging ? 'oct-float' : ''}>
                    <img
                      src={v.hero}
                      alt={`${cfg.eyebrow} ${tr(v.label)}`}
                      draggable={false}
                      loading={Math.abs(o) <= 1 ? 'eager' : 'lazy'}
                      className="mx-auto block max-h-[300px] w-full object-contain sm:max-h-[380px]"
                      style={{ filter: isActive ? `drop-shadow(0 24px 30px ${v.accent}55)` : 'drop-shadow(0 18px 18px rgba(0,0,0,.6))' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Strzałki */}
          <button
            type="button"
            onClick={() => userGo(-1)}
            aria-label={L(lang, 'Vorige', 'Previous', 'Poprzedni')}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-white/50 sm:left-4 sm:p-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => userGo(1)}
            aria-label={L(lang, 'Volgende', 'Next', 'Następny')}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-white/50 sm:right-4 sm:p-3"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Opis aktywnego produktu */}
        <div key={current.key} className="oct-rise -mt-2 text-center">
          <p
            className="font-bebas text-5xl leading-none tracking-wide sm:text-7xl"
            style={{ color: current.accent, textShadow: `0 0 28px ${current.accent}66` }}
          >
            {tr(current.label)}
          </p>
          <p className="mt-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-neutral-300">
            {cfg.specLine} · {euro(product?.price)}
          </p>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {variants.map((v, i) => (
            <button
              key={v.key}
              type="button"
              aria-label={tr(v.label)}
              onClick={() => { setAutoplay(false); setActive(() => i); }}
              className="h-1.5 transition-all duration-500"
              style={{ width: i === active ? 34 : 14, background: i === active ? current.accent : 'rgba(255,255,255,.25)' }}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onView(current)}
            className="w-full bg-[#D71920] px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b01318] sm:w-auto"
          >
            {L(lang, 'Bekijk & kies je maat', 'View & choose size', 'Zobacz i wybierz rozmiar')}
          </button>
          <button
            type="button"
            onClick={onDiscover}
            className="flex w-full items-center justify-center gap-2 border border-white/20 px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/60 sm:w-auto"
          >
            {L(lang, 'Ontdek de details', 'Discover details', 'Odkryj szczegóły')}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------------- */
/* 2) SCROLL STORY (sekcja przypięta do ekranu)                              */
/* ------------------------------------------------------------------------- */

const Story: React.FC<{
  cfg: ShowcaseConfig;
  active: number;
  setActive: (fn: (a: number) => number) => void;
  lang: Lang;
  onView: (v: Variant) => void;
  onAll: () => void;
  wrapRef: React.RefObject<HTMLDivElement | null>;
}> = ({ cfg, active, setActive, lang, onView, onAll, wrapRef }) => {
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const variants = cfg.variants;
  const features = cfg.features;
  const SEGMENTS = features.length + 2; // intro + cechy + finał
  const v = variants[active];
  const product = productOf(v);
  const tr = (t: T3) => t[lang];
  const dir = cfg.side === 'left' ? -1 : 1;
  const m = cfg.motion;

  const gloveRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLImageElement>(null);
  const pairRef = useRef<HTMLImageElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrapRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) return; // daleko poza ekranem – nic nie licz
      const total = el.offsetHeight - vh;
      const p = clamp(-rect.top / Math.max(total, 1));
      const seg = p * SEGMENTS;
      const s = clamp(Math.floor(seg), 0, SEGMENTS - 1);
      if (s !== stepRef.current) { stepRef.current = s; setStep(s); }

      const desktop = window.innerWidth >= 768;
      const X = desktop ? 17 * dir : 0;
      const Y = desktop ? 0 : -9;
      let x = 0, y = 0, rz = 0, ry = 0, sc = 1, showFront = false;
      if (seg < 1) {
        const t = ease(clamp(seg));
        y = lerp(desktop ? 22 : 16, Y, t);
        sc = lerp(0.62, 1, t);
        rz = lerp(m.enterRz, m.rzFrom, t);
        x = lerp(0, X, t);
      } else if (seg < SEGMENTS - 1) {
        const t = (seg - 1) / features.length;
        x = X;
        y = Y;
        rz = lerp(m.rzFrom, m.rzTo, m.spin ? ease(t) : t);
        ry = m.spin ? 0 : Math.sin(t * Math.PI * 2) * 14;
        sc = 1 + Math.sin(t * Math.PI) * 0.08;
      } else {
        const t = clamp(seg - (SEGMENTS - 1));
        const e = ease(t);
        x = lerp(X, 0, e);
        y = lerp(Y, desktop ? -13 : -17, e);
        rz = lerp(m.spin ? 0 : m.rzTo, 0, e);
        ry = t < 0.5 ? t * 2 * 90 : (1 - t) * 2 * 90; // „obrót” – podmiana ujęcia w połowie
        showFront = t >= 0.5;
        sc = lerp(1, m.finalScale, e);
      }
      const g = gloveRef.current;
      if (g) g.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotateZ(${rz}deg) rotateY(${ry}deg) scale(${sc})`;
      if (sideRef.current) sideRef.current.style.opacity = showFront ? '0' : '1';
      if (pairRef.current) pairRef.current.style.opacity = showFront ? '1' : '0';
      if (bigRef.current) bigRef.current.style.transform = `translate3d(${dir > 0 ? lerp(18, -62, p) : lerp(-62, 18, p)}%, -50%, 0)`;
      if (glowRef.current) glowRef.current.style.opacity = String(0.35 + 0.65 * clamp(p * 1.4));
      const flashT = clamp(seg - (SEGMENTS - 1));
      if (flashRef.current) flashRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(flashT - 0.5) * 4) * 0.55);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, wrapRef, SEGMENTS, dir, m, features.length]);

  const scrollToStep = (s: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((s + 0.5) / SEGMENTS) * total, behavior: 'smooth' });
  };

  const sizesLine = cfg.sizesLine || (product?.sizes || []).join(' · ');
  const viewLabel = L(lang, 'Kies je maat', 'Choose your size', 'Wybierz rozmiar');
  const productW = vw >= 768
    ? Math.min((vw * cfg.story.width) / 100, cfg.story.maxW)
    : Math.min((vw * cfg.story.mobileWidth) / 100, cfg.story.mobileMaxW);

  const Swatches = (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {variants.map((sv, i) => (
        <button
          key={sv.key}
          type="button"
          aria-label={tr(sv.label)}
          onClick={() => setActive(() => i)}
          className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            background: swatchOf(sv),
            borderColor: i === active ? '#fff' : 'rgba(255,255,255,.2)',
            boxShadow: i === active ? `0 0 16px ${sv.accent}` : 'none',
          }}
        />
      ))}
    </div>
  );

  /* Wersja statyczna dla osób z wyłączonymi animacjami */
  if (reduced) {
    return (
      <section ref={wrapRef as React.RefObject<HTMLDivElement>} className="border-b border-neutral-800 bg-[#050505] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <img src={v.detail} alt={`${cfg.eyebrow} ${tr(v.label)}`} className="mx-auto w-full max-w-md" />
          <div className="space-y-6">
            {features.map(f => (
              <div key={f.title.nl}>
                <p className="font-bebas text-3xl tracking-wide" style={{ color: v.accent }}>{tr(f.title)}</p>
                <p className="mt-1 text-sm text-neutral-300">{tr(f.text)}</p>
              </div>
            ))}
            {Swatches}
            <button type="button" onClick={() => onView(v)} className="bg-[#D71920] px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white">
              {viewLabel} · {euro(product?.price)}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const featureIdx = step - 1;
  const isFinal = step === SEGMENTS - 1;
  const textSide = dir < 0 ? 'md:ml-auto md:mr-16' : '';
  const glowX = dir < 0 ? '40%' : '60%';

  return (
    <div ref={wrapRef} id={`story-${cfg.id}`} className="relative h-[440vh] bg-[#050505] md:h-[520vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden border-b border-neutral-800">
        {/* Tło: poświata w kolorze produktu + błysk przy obrocie */}
        <div
          ref={glowRef}
          aria-hidden
          className="absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(ellipse 65% 60% at ${glowX} 55%, ${v.accent}66 0%, ${v.accent}1a 45%, transparent 75%)` }}
        />
        <div ref={flashRef} aria-hidden className="absolute inset-0 opacity-0" style={{ background: v.accent }} />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.75)_100%)]" />

        {/* Ogromny napis w tle */}
        <div
          ref={bigRef}
          aria-hidden
          className="oct-outline-text pointer-events-none absolute left-0 top-1/2 whitespace-nowrap font-bebas leading-none"
          style={{ fontSize: 'clamp(160px, 32vw, 460px)', transform: 'translate3d(18%, -50%, 0)', willChange: 'transform' }}
        >
          {cfg.bigText}
        </div>

        {/* Produkt */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1200 }}>
          <div ref={gloveRef} className="relative" style={{ width: productW, willChange: 'transform', transformStyle: 'preserve-3d' }}>
            <img
              ref={sideRef}
              src={v.detail}
              alt={`${cfg.eyebrow} ${tr(v.label)}`}
              draggable={false}
              className="block max-h-[62svh] w-full object-contain"
              style={{ filter: `drop-shadow(0 40px 50px rgba(0,0,0,.7)) drop-shadow(0 0 40px ${v.accent}44)` }}
            />
            <img
              ref={pairRef}
              src={v.hero}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 m-auto block h-full w-full object-contain opacity-0"
              style={{ filter: `drop-shadow(0 40px 50px rgba(0,0,0,.7)) drop-shadow(0 0 40px ${v.accent}44)` }}
            />
          </div>
        </div>

        {/* Treści */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 pt-24 sm:px-6 md:justify-center md:pb-0">
          {step === 0 && (
            <div key="intro" className={`oct-rise mb-auto max-w-md md:mb-0 ${textSide}`}>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">{cfg.eyebrow}</p>
              <h2 className="mt-2 font-bebas text-[clamp(36px,11vw,56px)] leading-[0.95] tracking-wide text-white md:text-6xl xl:text-7xl">
                {cfg.storyTitle}<br />
                <span style={{ color: v.accent }}>{tr(cfg.storyTagline)}</span>
              </h2>
              <p className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                <ChevronDown className="h-4 w-4 animate-bounce" />
                {L(lang, 'Scroll', 'Scroll', 'Przewiń')}
              </p>
            </div>
          )}

          {featureIdx >= 0 && featureIdx < features.length && (() => {
            const f = features[featureIdx];
            const Icon = f.icon;
            return (
              <div
                key={`f${featureIdx}`}
                className={`oct-rise max-w-sm rounded-sm border border-white/10 bg-black/45 p-5 backdrop-blur-md md:max-w-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0 ${textSide}`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: v.accent }}>
                  0{featureIdx + 1} / 0{features.length}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border" style={{ borderColor: `${v.accent}88`, color: v.accent }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="min-w-0 font-bebas text-[clamp(28px,8.5vw,40px)] leading-none tracking-wide text-white md:text-5xl xl:text-6xl">{tr(f.title)}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">{tr(f.text)}</p>
              </div>
            );
          })()}

          {isFinal && (
            <div key="final" className="oct-rise mx-auto w-full max-w-md text-center md:absolute md:bottom-12 md:left-1/2 md:-translate-x-1/2">
              <p className="font-bebas text-[clamp(30px,9vw,48px)] leading-none tracking-wide" style={{ color: v.accent, textShadow: `0 0 24px ${v.accent}66` }}>
                {cfg.storyTitle} · {tr(v.label)}
              </p>
              {sizesLine && <p className="mt-1 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-neutral-300">{sizesLine}</p>}
              <div className="mt-4">{Swatches}</div>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => onView(v)}
                  className="bg-[#D71920] px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b01318]"
                >
                  {viewLabel} · {euro(product?.price)}
                </button>
                <button
                  type="button"
                  onClick={onAll}
                  className="border border-white/25 px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/60"
                >
                  {tr(cfg.allLabel)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nawigacja po krokach */}
        <nav aria-label={cfg.storyTitle} className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            const on = featureIdx === i;
            return (
              <button
                key={f.title.nl}
                type="button"
                onClick={() => scrollToStep(i + 1)}
                aria-label={tr(f.title)}
                className="grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10"
                style={{
                  borderColor: on ? v.accent : 'rgba(255,255,255,.18)',
                  background: on ? `${v.accent}33` : 'rgba(0,0,0,.35)',
                  color: on ? '#fff' : 'rgba(255,255,255,.5)',
                  boxShadow: on ? `0 0 18px ${v.accent}88` : 'none',
                }}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </nav>

        {/* Pasek postępu */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
          <div ref={barRef} className="h-full origin-left" style={{ background: v.accent, transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------- */

export const ProductShowcase: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const { language, navigate } = useStore();
  const lang = (['nl', 'en', 'pl'].includes(language) ? language : 'nl') as Lang;
  const [active, setActiveState] = useState(config.defaultIndex);
  const setActive = (fn: (a: number) => number) => setActiveState(fn);
  const storyRef = useRef<HTMLDivElement>(null);
  const SEGMENTS = config.features.length + 2;

  const onAll = () => navigate(config.allLink);
  const onView = (v: Variant) => {
    const p = productOf(v);
    navigate(p ? `/product/${p.slug}` : config.allLink);
  };
  const onDiscover = () => {
    const el = storyRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (total / SEGMENTS) * 1.5, behavior: 'smooth' });
  };

  if (!config.variants.some(v => productOf(v))) return null;

  return (
    <>
      <Carousel cfg={config} active={active} setActive={setActive} lang={lang} onDiscover={onDiscover} onView={onView} />
      <Story cfg={config} active={active} setActive={setActive} lang={lang} onView={onView} onAll={onAll} wrapRef={storyRef} />
    </>
  );
};
