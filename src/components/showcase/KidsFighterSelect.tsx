import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import { ShaderStage } from '../fx/ShaderStage';
import { KineticText, MagneticButton } from '../fx/Kinetic';
import { usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';

/*
 * Legion Kids – ekran „Kies je fighter” w stylu gry walki dla koszulek dziecięcych Brainrot.
 * Dziecko wskakuje na scenę (wycięte zdjęcie), co kilka sekund odwraca się przodem/tyłem,
 * za nim komiksowy wybuch i linie akcji w kolorze nadruku, statystyki wojownika, wybór z rosteru.
 * Zdjęcia bez tła: public/showcase/kids-*.webp (scripts/showcase/cutout.py).
 */

type Lang = 'nl' | 'en' | 'pl';
type T3 = Record<Lang, string>;

interface Fighter {
  key: string;
  id: string;
  name: string;
  surname: string;
  accent: string;
  discipline: T3;
  stats: [number, number, number, number];
}

const FIGHTERS: Fighter[] = [
  { key: 'bull', id: 'oct-6009', name: 'Boombullini', surname: 'Knockoutini', accent: '#2f8bff', discipline: { nl: 'Boksen', en: 'Boxing', pl: 'Boks' }, stats: [95, 70, 76, 86] },
  { key: 'croc', id: 'oct-6008', name: 'Braziliano', surname: 'Crocodano', accent: '#a3e635', discipline: { nl: 'BJJ', en: 'BJJ', pl: 'BJJ' }, stats: [74, 68, 96, 90] },
  { key: 'gorilla', id: 'oct-6004', name: 'Gorillacio', surname: 'MMAssacracio', accent: '#ff2533', discipline: { nl: 'MMA', en: 'MMA', pl: 'MMA' }, stats: [98, 64, 82, 88] },
  { key: 'tiger', id: 'oct-6010', name: 'Thaigerini', surname: 'Muaythini', accent: '#ff8a1f', discipline: { nl: 'Muay Thai', en: 'Muay Thai', pl: 'Muay Thai' }, stats: [86, 93, 88, 84] },
];

const STAT_LABELS: T3[] = [
  { nl: 'Kracht', en: 'Power', pl: 'Siła' },
  { nl: 'Snelheid', en: 'Speed', pl: 'Szybkość' },
  { nl: 'Techniek', en: 'Technique', pl: 'Technika' },
  { nl: 'Stijl', en: 'Style', pl: 'Styl' },
];

const STICKERS: T3[] = [
  { nl: '100% katoen', en: '100% cotton', pl: '100% bawełny' },
  { nl: 'Grote print', en: 'Big print', pl: 'Duży nadruk' },
  { nl: 'Wassen op 30°', en: 'Wash at 30°', pl: 'Pranie w 30°' },
];

const img = (k: string, v: 'back' | 'front') => `/showcase/kids-${k}-${v}.webp`;
const productOf = (f: Fighter) => PRODUCTS.find(p => p.id === f.id);
const euro = (n?: number) => (typeof n === 'number' ? `€${n.toFixed(2).replace('.', ',')}` : '');
const L = (lang: Lang, nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);

/** Komiksowy „wybuch” (gwiazda) za wojownikiem */
const Burst: React.FC<{ color: string }> = ({ color }) => {
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 2 ? 0.72 : 1;
    return `${50 + Math.cos(a) * 50 * r},${50 + Math.sin(a) * 50 * r}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`burst-${color.slice(1)}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="70%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={pts} fill={`url(#burst-${color.slice(1)})`} />
    </svg>
  );
};

export const KidsFighterSelect: React.FC = () => {
  const { language, navigate } = useStore();
  const lang = (['nl', 'en', 'pl'].includes(language) ? language : 'nl') as Lang;
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const [active, setActive] = useState(2);
  const [front, setFront] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const n = FIGHTERS.length;
  const f = FIGHTERS[active];
  const product = productOf(f);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // cykl, gdy sekcja jest widoczna: plecy (nadruk) 3 s → przód 2,2 s → plecy …
  const [manual, setManual] = useState(false);
  useEffect(() => { setFront(false); }, [active]);
  useEffect(() => {
    if (reduced || !visible || manual) return;
    let t = 0;
    const loop = (isFront: boolean) => {
      t = window.setTimeout(() => {
        setFront(!isFront);
        loop(!isFront);
      }, isFront ? 2200 : 3000);
    };
    loop(false);
    return () => window.clearTimeout(t);
  }, [active, reduced, visible, manual]);
  const toggleFront = () => { setManual(true); setFront(v => !v); };

  useEffect(() => {
    if (!autoplay || hover || !visible || reduced) return;
    const t = window.setInterval(() => setActive(a => (a + 1) % n), 6500);
    return () => window.clearInterval(t);
  }, [autoplay, hover, visible, reduced, n]);

  const pick = (i: number) => { setAutoplay(false); setManual(false); setActive(((i % n) + n) % n); };

  const stageH = mobile ? Math.min(vw * 1.05, 420) : 560;

  return (
    <section
      ref={rootRef}
      aria-label="Legion Kids"
      className="relative overflow-hidden border-b border-neutral-800 bg-[#07050c]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') pick(active + 1);
        if (e.key === 'ArrowLeft') pick(active - 1);
      }}
    >
      {/* Tło: fallback + żywy shader w kolorze nadruku */}
      <div aria-hidden className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${f.accent}44, transparent 70%)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage color={f.accent} mode="story" pulseKey={active} />
      </div>
      {/* Linie akcji (manga) + raster komiksowy */}
      <div
        aria-hidden
        className="oct-rot-slow pointer-events-none absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2 opacity-40 transition-[background] duration-700"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${f.accent}40 0deg 1.2deg, transparent 1.2deg 9deg)`,
          WebkitMaskImage: 'radial-gradient(circle, transparent 12%, #000 30%, transparent 62%)',
          maskImage: 'radial-gradient(circle, transparent 12%, #000 30%, transparent 62%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.10) 1px, transparent 1.6px)',
          backgroundSize: '9px 9px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 0%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse at 50% 45%, #000 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-14">
        {/* Nagłówek */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              <span className="h-px w-8" style={{ background: f.accent }} />
              Legion Kids · Brainrot
            </p>
            <h2 className="mt-2 font-bebas text-5xl leading-none tracking-wide text-white sm:text-7xl">
              {L(lang, 'Kies je fighter', 'Choose your fighter', 'Wybierz wojownika')}
            </h2>
          </div>
          <span
            className="oct-blink rounded-sm border px-3 py-1 font-mono text-xs font-bold tracking-[0.3em]"
            style={{ borderColor: f.accent, color: f.accent }}
          >
            PLAYER 1
          </span>
        </div>

        <div className="mt-4 grid items-center gap-6 md:mt-0 md:grid-cols-[1fr_1.2fr_1fr]">
          {/* Info (desktop: lewa kolumna) */}
          <div key={`info-${f.key}`} className="order-2 md:order-1">
            <span
              className="oct-pop inline-block -rotate-3 px-3 py-1 font-condensed text-sm font-extrabold uppercase tracking-[0.2em] text-black"
              style={{ background: f.accent, boxShadow: `4px 4px 0 #fff` }}
            >
              {f.discipline[lang]}
            </span>
            <div className="mt-3">
              <KineticText
                text={f.name}
                className="whitespace-nowrap font-bebas text-[clamp(48px,13vw,78px)] leading-[0.9] tracking-wide text-white"
                style={{ textShadow: `4px 4px 0 ${f.accent}` }}
              />
            </div>
            <p className="oct-rise mt-1 font-condensed text-lg font-bold uppercase tracking-[0.25em]" style={{ color: f.accent, animationDelay: '300ms' }}>
              {f.surname}
            </p>

            {/* Statystyki */}
            <div className="mt-5 space-y-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{L(lang, 'Fighter stats', 'Fighter stats', 'Statystyki')}</p>
              {STAT_LABELS.map((s, i) => (
                <div key={s.nl} className="flex items-center gap-3">
                  <span className="w-20 font-condensed text-xs font-bold uppercase tracking-widest text-neutral-300">{s[lang]}</span>
                  <div className="relative h-2.5 flex-1 -skew-x-12 overflow-hidden bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 transition-[width] duration-1000 ease-[cubic-bezier(.16,1,.3,1)]"
                      style={{ width: `${f.stats[i]}%`, background: `linear-gradient(90deg, ${f.accent}88, ${f.accent})`, boxShadow: `0 0 12px ${f.accent}`, transitionDelay: `${150 + i * 90}ms` }}
                    />
                  </div>
                  <span className="w-7 text-right font-mono text-xs text-white">{f.stats[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scena z wojownikiem */}
          <div
            className="relative order-1 mx-auto w-full md:order-2"
            style={{ height: stageH, perspective: 1200, touchAction: 'pan-y' }}
            onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            onTouchEnd={e => {
              const t = touch.current;
              touch.current = null;
              if (!t) return;
              const dx = e.changedTouches[0].clientX - t.x;
              const dy = e.changedTouches[0].clientY - t.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) pick(active + (dx < 0 ? 1 : -1));
            }}
          >
            {/* Wielkie imię w tle */}
            <div
              key={`bg-${f.key}`}
              aria-hidden
              className="oct-rise pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bebas leading-none"
              style={{ fontSize: mobile ? 120 : 200, color: 'transparent', WebkitTextStroke: `2px ${f.accent}55` }}
            >
              {f.name.toUpperCase()}
            </div>
            {/* Wybuch */}
            <div key={`burst-${f.key}`} className="oct-pop absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" style={{ width: stageH * 0.95, height: stageH * 0.95 }}>
              <div className="oct-rot-med h-full w-full"><Burst color={f.accent} /></div>
            </div>

            {/* Dziecko – wskakuje i się odwraca */}
            <div key={`kid-${f.key}`} className="oct-jump absolute inset-x-0 bottom-0 mx-auto h-full" style={{ maxWidth: stageH * 0.56 }}>
              <button
                type="button"
                onClick={toggleFront}
                aria-label={L(lang, 'Draai om', 'Turn around', 'Obróć')}
                className="relative h-full w-full cursor-pointer"
                style={{ transformStyle: 'preserve-3d', transform: `rotateY(${front ? 180 : 0}deg)`, transition: 'transform 900ms cubic-bezier(.68,-0.35,.27,1.35)' }}
              >
                {(['back', 'front'] as const).map(side => (
                  <img
                    key={side}
                    src={img(f.key, side)}
                    alt={side === 'back' ? `Legion Octagon Brainrot ${f.name} – ${L(lang, 'achterkant', 'back', 'tył')}` : ''}
                    aria-hidden={side === 'front'}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain object-bottom"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: side === 'front' ? 'rotateY(180deg)' : undefined,
                      filter: `drop-shadow(0 0 30px ${f.accent}66) drop-shadow(0 20px 30px rgba(0,0,0,.6))`,
                      WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)',
                      maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)',
                    }}
                  />
                ))}
              </button>
            </div>

            {/* Naklejki z cechami */}
            {!mobile && STICKERS.map((s, i) => (
              <span
                key={`${f.key}-${s.nl}`}
                className="oct-pop pointer-events-none absolute"
                style={{
                  left: ['4%', '74%', '8%'][i],
                  top: ['22%', '34%', '62%'][i],
                  animationDelay: `${450 + i * 140}ms`,
                }}
              >
                <span
                  className="oct-bob block border-2 border-black px-3 py-1.5 font-condensed text-xs font-extrabold uppercase tracking-wider text-black"
                  style={{ background: i === 1 ? f.accent : '#fff', boxShadow: '3px 3px 0 #000', ['--r' as string]: ['-6deg', '5deg', '-3deg'][i], animationDelay: `${i * 0.6}s` } as React.CSSProperties}
                >
                  {s[lang]}
                </span>
              </span>
            ))}

            {/* „FIGHT!” przy wyborze */}
            <span
              key={`fight-${active}`}
              aria-hidden
              className="oct-fight pointer-events-none absolute left-1/2 top-1/2 z-10 font-bebas text-[clamp(70px,18vw,150px)] leading-none text-white"
              style={{ textShadow: `5px 5px 0 ${f.accent}, -2px -2px 0 #000`, WebkitTextStroke: '2px #000' }}
            >
              FIGHT!
            </span>

            {/* Odwróć */}
            <button
              type="button"
              onClick={toggleFront}
              className="absolute bottom-3 right-0 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 md:right-2"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {front ? L(lang, 'Achterkant', 'Back', 'Tył') : L(lang, 'Voorkant', 'Front', 'Przód')}
            </button>
          </div>

          {/* Zakup (desktop: prawa kolumna) */}
          <div key={`buy-${f.key}`} className="order-3 md:pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">T-shirt kids</p>
            <p className="oct-rise mt-1 font-bebas text-6xl leading-none text-white">{euro(product?.price)}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{L(lang, 'Maten', 'Sizes', 'Rozmiary')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(product?.sizes || []).map(s => (
                <span key={s} className="border border-white/15 px-2 py-1 font-mono text-[11px] text-neutral-200">{s}</span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {L(
                lang,
                'Kinder-T-shirt uit de Brainrot-collectie met een grote, opvallende print. 100% zacht katoen – perfect voor school, training en elke dag.',
                'Kids’ T-shirt from the Brainrot collection with a big, eye-catching print. 100% soft cotton – perfect for school, training and every day.',
                'Koszulka dziecięca z kolekcji Brainrot z dużym, efektownym nadrukiem. 100% miękkiej bawełny – do szkoły, na trening i na co dzień.'
              )}
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <MagneticButton onClick={() => product && navigate(`/product/${product.slug}`)}>
                {L(lang, 'Kies je maat', 'Choose size', 'Wybierz rozmiar')}
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton variant="ghost" accent={f.accent} onClick={() => navigate('/category/kids')}>
                {L(lang, 'Alle kids-items', 'All kids items', 'Wszystko dla dzieci')}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Roster – wybór wojownika */}
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
          <button type="button" onClick={() => pick(active - 1)} aria-label={L(lang, 'Vorige', 'Previous', 'Poprzedni')} className="hidden rounded-full border border-white/15 p-2.5 text-white transition hover:border-white/60 sm:block">
            <ArrowLeft className="h-4 w-4" />
          </button>
          {FIGHTERS.map((fi, i) => {
            const on = i === active;
            return (
              <button
                key={fi.key}
                type="button"
                onClick={() => pick(i)}
                aria-label={fi.name}
                aria-current={on}
                className="group relative w-[22%] max-w-[150px] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5"
                style={{ transform: on ? 'translateY(-8px) scale(1.06)' : undefined }}
              >
                {on && (
                  <span className="oct-bob absolute -top-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] font-bold tracking-widest" style={{ color: fi.accent }}>
                    ▼ P1
                  </span>
                )}
                <div
                  className="relative aspect-[4/5] overflow-hidden border-2 transition-all duration-500"
                  style={{
                    borderColor: on ? fi.accent : 'rgba(255,255,255,.12)',
                    boxShadow: on ? `0 0 0 2px #07050c, 0 0 28px ${fi.accent}aa` : 'none',
                    background: `linear-gradient(160deg, ${fi.accent}${on ? '66' : '2a'}, #0b0b0b 75%)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
                  }}
                >
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${fi.accent}55 0 2px, transparent 2px 9px)` }} />
                  <img
                    src={img(fi.key, 'back')}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-x-0 top-1 mx-auto h-[150%] w-auto max-w-none object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    style={{ left: '50%', transform: 'translateX(-50%)', filter: on ? 'none' : 'grayscale(.6) brightness(.7)' }}
                  />
                </div>
                <p className="mt-1.5 truncate text-center font-bebas text-sm tracking-wide sm:text-lg" style={{ color: on ? fi.accent : '#bbb' }}>
                  {fi.name}
                </p>
              </button>
            );
          })}
          <button type="button" onClick={() => pick(active + 1)} aria-label={L(lang, 'Volgende', 'Next', 'Następny')} className="hidden rounded-full border border-white/15 p-2.5 text-white transition hover:border-white/60 sm:block">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
