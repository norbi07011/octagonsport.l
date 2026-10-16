import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Shield, Hand, Lock, Users } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';

/*
 * Premium showcase rękawic Legion Octagon Kevlar (inspiracja: strony produktowe 3D).
 * 1) Karuzela 3D – produkty ustawione w łuk, aktywny unosi się nad podświetlanym podestem,
 *    tło przejmuje kolor produktu. Przesuwanie palcem / myszką / strzałkami / klawiaturą.
 * 2) Scroll story – sekcja „przypięta” do ekranu: rękawica obraca się i rośnie przy przewijaniu,
 *    cechy produktu pojawiają się po kolei, na końcu wybór koloru i przejście do produktu.
 * Wycięte zdjęcia: public/showcase (generowane przez scripts/showcase/cutout.py).
 */

type Lang = 'nl' | 'en' | 'pl';
type T3 = Record<Lang, string>;

interface Variant {
  key: string;
  id: string;
  accent: string;
  label: T3;
}

const VARIANTS: Variant[] = [
  { key: 'white', id: 'oct-5631', accent: '#9fc2ff', label: { nl: 'Wit', en: 'White', pl: 'Biały' } },
  { key: 'blue', id: 'oct-5632', accent: '#2f6bff', label: { nl: 'Blauw', en: 'Blue', pl: 'Niebieski' } },
  { key: 'red', id: 'oct-5633', accent: '#ff2533', label: { nl: 'Rood', en: 'Red', pl: 'Czerwony' } },
  { key: 'black', id: 'oct-5630', accent: '#8c96a8', label: { nl: 'Zwart', en: 'Black', pl: 'Czarny' } },
  { key: 'gold', id: 'oct-5801', accent: '#e8b730', label: { nl: 'Goud', en: 'Gold', pl: 'Złoty' } },
];
const DEFAULT_INDEX = 2;

const img = (key: string, view: 'pair' | 'side') => `/showcase/kevlar-${key}-${view}.webp`;
const productOf = (v: Variant) => PRODUCTS.find(p => p.id === v.id);
const euro = (n?: number) => (typeof n === 'number' ? `€${n.toFixed(2).replace('.', ',')}` : '');

const FEATURES: { icon: React.FC<{ className?: string }>; title: T3; text: T3 }[] = [
  {
    icon: Shield,
    title: { nl: 'Kevlar-coating', en: 'Kevlar coating', pl: 'Powłoka Kevlar' },
    text: {
      nl: 'Een sterke buitenlaag met KEVLAR-coating – gemaakt voor sparring én wedstrijden.',
      en: 'A tough outer layer with KEVLAR coating – built for sparring and competition.',
      pl: 'Wytrzymała warstwa zewnętrzna z powłoką KEVLAR – do sparingów i zawodów.',
    },
  },
  {
    icon: Lock,
    title: { nl: 'Brede klittenband', en: 'Wide hook & loop strap', pl: 'Szeroki rzep' },
    text: {
      nl: 'Brede klittenbandsluiting die je eenvoudig aanpast aan je hand en pols.',
      en: 'Wide hook-and-loop closure that adjusts easily to your hand and wrist.',
      pl: 'Szerokie zapięcie na rzep, które łatwo dopasujesz do dłoni i nadgarstka.',
    },
  },
  {
    icon: Hand,
    title: { nl: 'Gevormde duim', en: 'Shaped thumb', pl: 'Wyprofilowany kciuk' },
    text: {
      nl: 'De duim is verbonden met de bovenkant van de handschoen en wordt zo beschermd.',
      en: 'The thumb is attached to the top of the glove, keeping it protected.',
      pl: 'Kciuk połączony z górą rękawicy – lepiej chroniony przy każdym ciosie.',
    },
  },
  {
    icon: Users,
    title: { nl: 'Perfecte pasvorm', en: 'Perfect fit', pl: 'Idealne dopasowanie' },
    text: {
      nl: 'Sluit perfect aan op de hand voor comfort en veiligheid – voor beginners en gevorderden.',
      en: 'Fits the hand perfectly for comfort and safety – for beginners and advanced fighters.',
      pl: 'Idealnie przylega do dłoni – komfort i bezpieczeństwo dla początkujących i zaawansowanych.',
    },
  },
];

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

/* ------------------------------------------------------------------------- */
/* 1) KARUZELA 3D                                                            */
/* ------------------------------------------------------------------------- */

const Carousel: React.FC<{
  active: number;
  setActive: (fn: (a: number) => number) => void;
  lang: Lang;
  onDiscover: () => void;
  onView: (v: Variant) => void;
}> = ({ active, setActive, lang, onDiscover, onView }) => {
  const n = VARIANTS.length;
  const w = useViewportWidth();
  const mobile = w < 640;
  const spacing = mobile ? Math.min(w * 0.3, 150) : w < 1024 ? 210 : 260;
  const itemW = mobile ? Math.min(w * 0.5, 230) : 300;
  const tr = (t: T3) => t[lang];

  const [dragDx, setDragDx] = useState(0);
  const drag = useRef<{ x: number; y: number; moved: boolean; horizontal: boolean | null } | null>(null);
  const suppressClick = useRef(false);
  const go = (d: number) => setActive(a => (a + d + n) % n);

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

  const current = VARIANTS[active];
  const product = productOf(current);
  const dragging = dragDx !== 0;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Legion Octagon Kevlar"
      className="relative overflow-hidden border-b border-neutral-800 bg-[#050505]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tło w kolorze aktywnego produktu (warstwy z płynnym przenikaniem) */}
      {VARIANTS.map((v, i) => (
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
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">Legion Octagon · Kevlar</p>
          <h2 className="mt-2 font-bebas text-4xl tracking-wide text-white sm:text-6xl">
            {lang === 'pl' ? 'Wybierz swój kolor' : lang === 'en' ? 'Choose your colour' : 'Kies jouw kleur'}
          </h2>
        </div>

        {/* Scena 3D */}
        <div
          className="relative mx-auto mt-4 select-none sm:mt-6"
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
            {VARIANTS.map((v, i) => {
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
                  aria-label={`Kevlar – ${tr(v.label)}`}
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
                    transition: dragging ? 'none' : 'transform 800ms cubic-bezier(.2,.8,.2,1), opacity 800ms, filter 800ms',
                  }}
                >
                  <div className={isActive && !dragging ? 'oct-float' : ''}>
                    <img
                      src={img(v.key, 'pair')}
                      alt={`Legion Octagon Kevlar ${tr(v.label)}`}
                      draggable={false}
                      loading={Math.abs(o) <= 1 ? 'eager' : 'lazy'}
                      className="mx-auto block w-full"
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
            aria-label={lang === 'pl' ? 'Poprzedni' : lang === 'en' ? 'Previous' : 'Vorige'}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-white/50 sm:left-4 sm:p-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => userGo(1)}
            aria-label={lang === 'pl' ? 'Następny' : lang === 'en' ? 'Next' : 'Volgende'}
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
            Kevlar · 8–16 oz · {euro(product?.price)}
          </p>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {VARIANTS.map((v, i) => (
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
            {lang === 'pl' ? 'Zobacz i wybierz rozmiar' : lang === 'en' ? 'View & choose size' : 'Bekijk & kies je maat'}
          </button>
          <button
            type="button"
            onClick={onDiscover}
            className="flex w-full items-center justify-center gap-2 border border-white/20 px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/60 sm:w-auto"
          >
            {lang === 'pl' ? 'Odkryj szczegóły' : lang === 'en' ? 'Discover details' : 'Ontdek de details'}
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

const SEGMENTS = FEATURES.length + 2; // intro + cechy + finał

const Story: React.FC<{
  active: number;
  setActive: (fn: (a: number) => number) => void;
  lang: Lang;
  onView: (v: Variant) => void;
  wrapRef: React.RefObject<HTMLDivElement | null>;
}> = ({ active, setActive, lang, onView, wrapRef }) => {
  const reduced = usePrefersReducedMotion();
  const v = VARIANTS[active];
  const product = productOf(v);
  const tr = (t: T3) => t[lang];

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
      const total = el.offsetHeight - vh;
      const p = clamp(-el.getBoundingClientRect().top / Math.max(total, 1));
      const seg = p * SEGMENTS;
      const s = clamp(Math.floor(seg), 0, SEGMENTS - 1);
      if (s !== stepRef.current) { stepRef.current = s; setStep(s); }

      const desktop = window.innerWidth >= 768;
      let x = 0, y = 0, rz = 0, ry = 0, sc = 1, showPair = false;
      if (seg < 1) {
        const t = ease(clamp(seg));
        y = lerp(desktop ? 22 : 16, desktop ? 0 : -9, t); // vh
        sc = lerp(0.62, 1, t);
        rz = lerp(-48, -14, t);
        x = lerp(0, desktop ? 17 : 0, t);
      } else if (seg < SEGMENTS - 1) {
        const t = (seg - 1) / FEATURES.length;
        x = desktop ? 17 : 0;
        y = desktop ? 0 : -9;
        rz = lerp(-14, 16, t);
        ry = Math.sin(t * Math.PI * 2) * 14;
        sc = 1 + Math.sin(t * Math.PI) * 0.08;
      } else {
        const t = clamp(seg - (SEGMENTS - 1));
        const e = ease(t);
        x = lerp(desktop ? 17 : 0, 0, e);
        y = lerp(desktop ? 0 : -9, desktop ? -13 : -17, e);
        rz = lerp(16, 0, e);
        ry = t < 0.5 ? t * 2 * 90 : (1 - t) * 2 * 90; // „obrót” – podmiana ujęcia w połowie
        showPair = t >= 0.5;
        sc = lerp(1, desktop ? 0.7 : 0.66, e);
      }
      const g = gloveRef.current;
      if (g) g.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotateZ(${rz}deg) rotateY(${ry}deg) scale(${sc})`;
      if (sideRef.current) sideRef.current.style.opacity = showPair ? '0' : '1';
      if (pairRef.current) pairRef.current.style.opacity = showPair ? '1' : '0';
      if (bigRef.current) bigRef.current.style.transform = `translate3d(${lerp(18, -62, p)}%, -50%, 0)`;
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
  }, [reduced, wrapRef]);

  const scrollToStep = (s: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((s + 0.5) / SEGMENTS) * total, behavior: 'smooth' });
  };

  const viewLabel = lang === 'pl' ? 'Wybierz rozmiar' : lang === 'en' ? 'Choose your size' : 'Kies je maat';
  const allLabel = lang === 'pl' ? 'Wszystkie rękawice' : lang === 'en' ? 'All boxing gloves' : 'Alle bokshandschoenen';

  const Swatches = (
    <div className="flex items-center gap-2.5">
      {VARIANTS.map((sv, i) => (
        <button
          key={sv.key}
          type="button"
          aria-label={tr(sv.label)}
          onClick={() => setActive(() => i)}
          className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            background: sv.key === 'black' ? '#111' : sv.key === 'white' ? '#f2f2f2' : sv.accent,
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
          <img src={img(v.key, 'side')} alt={`Legion Octagon Kevlar ${tr(v.label)}`} className="mx-auto w-full max-w-md" />
          <div className="space-y-6">
            {FEATURES.map(f => (
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

  return (
    <div ref={wrapRef} id="kevlar-story" className="relative h-[480vh] bg-[#050505] md:h-[560vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden border-b border-neutral-800">
        {/* Tło: poświata w kolorze produktu + błysk przy obrocie */}
        <div
          ref={glowRef}
          aria-hidden
          className="absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(ellipse 65% 60% at 60% 55%, ${v.accent}66 0%, ${v.accent}1a 45%, transparent 75%)` }}
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
          KEVLAR · OCTAGON · KEVLAR
        </div>

        {/* Rękawica */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1200 }}>
          <div ref={gloveRef} className="relative w-[78vw] max-w-[360px] md:w-[38vw] md:max-w-[560px]" style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}>
            <img
              ref={sideRef}
              src={img(v.key, 'side')}
              alt={`Legion Octagon Kevlar ${tr(v.label)}`}
              draggable={false}
              className="block w-full"
              style={{ filter: `drop-shadow(0 40px 50px rgba(0,0,0,.7)) drop-shadow(0 0 40px ${v.accent}44)` }}
            />
            <img
              ref={pairRef}
              src={img(v.key, 'pair')}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 m-auto block h-full w-auto opacity-0"
              style={{ filter: `drop-shadow(0 40px 50px rgba(0,0,0,.7)) drop-shadow(0 0 40px ${v.accent}44)` }}
            />
          </div>
        </div>

        {/* Treści */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 pt-24 sm:px-6 md:justify-center md:pb-0">
          {step === 0 && (
            <div key="intro" className="oct-rise mb-auto max-w-md md:mb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">Legion Octagon</p>
              <h2 className="mt-2 font-bebas text-5xl leading-[0.95] tracking-wide text-white sm:text-7xl">
                Kevlar<br />
                <span style={{ color: v.accent }}>{lang === 'pl' ? 'Zbudowane do walki' : lang === 'en' ? 'Built to fight' : 'Gemaakt om te vechten'}</span>
              </h2>
              <p className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                <ChevronDown className="h-4 w-4 animate-bounce" />
                {lang === 'pl' ? 'Przewiń' : lang === 'en' ? 'Scroll' : 'Scroll'}
              </p>
            </div>
          )}

          {featureIdx >= 0 && featureIdx < FEATURES.length && (() => {
            const f = FEATURES[featureIdx];
            const Icon = f.icon;
            return (
              <div key={`f${featureIdx}`} className="oct-rise max-w-sm rounded-sm border border-white/10 bg-black/45 p-5 backdrop-blur-md md:max-w-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: v.accent }}>
                  0{featureIdx + 1} / 0{FEATURES.length}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border" style={{ borderColor: `${v.accent}88`, color: v.accent }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-bebas text-4xl leading-none tracking-wide text-white sm:text-6xl">{tr(f.title)}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">{tr(f.text)}</p>
              </div>
            );
          })()}

          {isFinal && (
            <div key="final" className="oct-rise mx-auto w-full max-w-md text-center md:absolute md:bottom-12 md:left-1/2 md:-translate-x-1/2">
              <p className="font-bebas text-4xl tracking-wide sm:text-5xl" style={{ color: v.accent, textShadow: `0 0 24px ${v.accent}66` }}>
                Kevlar · {tr(v.label)}
              </p>
              <p className="mt-1 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-neutral-300">8 · 10 · 12 · 14 · 16 oz</p>
              <div className="mt-4 flex justify-center">{Swatches}</div>
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
                  onClick={() => onView({ ...v, id: '__all' })}
                  className="border border-white/25 px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/60"
                >
                  {allLabel}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nawigacja po krokach */}
        <nav aria-label="Kevlar" className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {FEATURES.map((f, i) => {
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

export const GloveShowcase: React.FC = () => {
  const { language, navigate } = useStore();
  const lang = (['nl', 'en', 'pl'].includes(language) ? language : 'nl') as Lang;
  const [active, setActiveState] = useState(DEFAULT_INDEX);
  const setActive = (fn: (a: number) => number) => setActiveState(fn);
  const storyRef = useRef<HTMLDivElement>(null);

  const onView = (v: Variant) => {
    if (v.id === '__all') return navigate('/category/fight-gear?sub=bokshandschoenen');
    const p = productOf(v);
    navigate(p ? `/product/${p.slug}` : '/category/fight-gear?sub=bokshandschoenen');
  };
  const onDiscover = () => {
    const el = storyRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + total / SEGMENTS * 1.5, behavior: 'smooth' });
  };

  if (!VARIANTS.some(v => productOf(v))) return null;

  return (
    <>
      <Carousel active={active} setActive={setActive} lang={lang} onDiscover={onDiscover} onView={onView} />
      <Story active={active} setActive={setActive} lang={lang} onView={onView} wrapRef={storyRef} />
    </>
  );
};
