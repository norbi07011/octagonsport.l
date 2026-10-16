import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import { ShaderStage } from '../fx/ShaderStage';
import { KineticText, MagneticButton } from '../fx/Kinetic';
import { usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';
import type { SpotConfig, SpotItem, SpotLang as Lang, SpotTheme, T3 } from '../../data/spotlights';

/*
 * Karta „spotlight” – interaktywna scena kolekcji (góra podstron kategorii, Kids na stronie głównej).
 * Produkt/model wskakuje na scenę, co kilka sekund obraca się na drugą stronę, tło w kolorze produktu
 * (WebGL) + motyw: comic (dzieci), street (mężczyźni/nowości), silk (kobiety), cage (sprzęt/trening),
 * minimal (akcesoria). Roster do wyboru, swipe, strzałki, klawiatura. Konfiguracja: src/data/spotlights.ts
 */

const STAT_LABELS: T3[] = [
  { nl: 'Kracht', en: 'Power', pl: 'Siła' },
  { nl: 'Snelheid', en: 'Speed', pl: 'Szybkość' },
  { nl: 'Techniek', en: 'Technique', pl: 'Technika' },
  { nl: 'Stijl', en: 'Style', pl: 'Styl' },
];

const productOf = (it: SpotItem) => PRODUCTS.find(p => p.id === it.id);
const euro = (n?: number) => (typeof n === 'number' ? `€${n.toFixed(2).replace('.', ',')}` : '');
const L = (lang: Lang, nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);
const tx = (v: T3 | string, lang: Lang) => (typeof v === 'string' ? v : v[lang]);

/* ---------- elementy tła wg motywu ---------- */

const Burst: React.FC<{ color: string }> = ({ color }) => {
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 2 ? 0.72 : 1;
    return `${50 + Math.cos(a) * 50 * r},${50 + Math.sin(a) * 50 * r}`;
  }).join(' ');
  const id = `burst-${color.slice(1)}`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="70%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={pts} fill={`url(#${id})`} />
    </svg>
  );
};

const octagon = (r: number) =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(' ');

/** Ośmiokąty (klatka oktagonu) – obracające się w przeciwnych kierunkach */
const OctagonRings: React.FC<{ color: string; cage?: boolean }> = ({ color, cage }) => (
  <div className="relative h-full w-full" aria-hidden>
    <svg viewBox="0 0 100 100" className="oct-rot-slow absolute inset-0 h-full w-full">
      <polygon points={octagon(48)} fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="0.5" />
      {cage && Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * 48} y2={50 + Math.sin(a) * 48} stroke={color} strokeOpacity="0.18" strokeWidth="0.3" />;
      })}
    </svg>
    <svg viewBox="0 0 100 100" className="absolute inset-[9%] h-[82%] w-[82%]" style={{ animation: 'oct-rot 26s linear infinite reverse' }}>
      <polygon points={octagon(48)} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="0.7" strokeDasharray="3 2" />
    </svg>
    <div className="absolute inset-[22%] rounded-full blur-3xl" style={{ background: `${color}55` }} />
  </div>
);

/** Miękkie kule światła (motyw silk) */
const SilkOrbs: React.FC<{ color: string }> = ({ color }) => (
  <div className="relative h-full w-full" aria-hidden>
    <div className="oct-orb absolute left-[10%] top-[8%] h-[60%] w-[60%] rounded-full blur-3xl" style={{ background: `${color}55` }} />
    <div className="oct-orb absolute bottom-[6%] right-[6%] h-[55%] w-[55%] rounded-full blur-3xl" style={{ background: '#ffffff22', animationDelay: '-4s' }} />
    <div className="absolute inset-[14%] rounded-full border" style={{ borderColor: `${color}55` }} />
    <div className="oct-rot-slow absolute inset-[6%] rounded-full border border-dashed" style={{ borderColor: `${color}33` }} />
  </div>
);

const ThemeBackdrop: React.FC<{ theme: SpotTheme; color: string }> = ({ theme, color }) => {
  if (theme === 'comic') return <div className="oct-rot-med h-full w-full"><Burst color={color} /></div>;
  if (theme === 'silk') return <SilkOrbs color={color} />;
  if (theme === 'minimal') return (
    <div className="relative h-full w-full" aria-hidden>
      <div className="absolute inset-[18%] rounded-full blur-3xl" style={{ background: `${color}44` }} />
      <div className="absolute inset-[8%] rounded-full border" style={{ borderColor: `${color}40` }} />
    </div>
  );
  return <OctagonRings color={color} cage={theme === 'cage'} />;
};

/* ------------------------------------------------------------------------- */

export const CategorySpotlight: React.FC<{ config: SpotConfig }> = ({ config }) => {
  const { language, navigate } = useStore();
  const lang = (['nl', 'en', 'pl'].includes(language) ? language : 'nl') as Lang;
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const items = config.items;
  const n = items.length;
  const [active, setActive] = useState(config.defaultIndex);
  const [front, setFront] = useState(false);
  const [manual, setManual] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const it = items[active];
  const product = productOf(it);
  const comic = config.theme === 'comic';
  const person = config.kind === 'person';

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // obrót: widok A 3 s → widok B 2,2 s → … (tylko gdy widoczne i bez ręcznego obracania)
  useEffect(() => { setFront(false); }, [active]);
  useEffect(() => {
    if (reduced || !visible || manual) return;
    let t = 0;
    const loop = (isB: boolean) => {
      t = window.setTimeout(() => { setFront(!isB); loop(!isB); }, isB ? 2200 : 3000);
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

  const stageH = mobile ? Math.min(vw * (person ? 1.05 : 0.85), person ? 420 : 340) : person ? 560 : 480;
  const figureW = stageH * (person ? 0.56 : 0.92);
  const bgName = (it.rosterLabel || it.name).toUpperCase();

  return (
    <section
      ref={rootRef}
      aria-label={config.eyebrow}
      className="relative overflow-hidden border-b border-neutral-800 bg-[#07050c]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') pick(active + 1);
        if (e.key === 'ArrowLeft') pick(active - 1);
      }}
    >
      {/* Tło: fallback + żywy shader w kolorze produktu */}
      <div aria-hidden className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${it.accent}44, transparent 70%)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage color={it.accent} mode="story" pulseKey={active} />
      </div>
      {comic && (
        <>
          <div
            aria-hidden
            className="oct-rot-slow pointer-events-none absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2 opacity-40 transition-[background] duration-700"
            style={{
              background: `repeating-conic-gradient(from 0deg, ${it.accent}40 0deg 1.2deg, transparent 1.2deg 9deg)`,
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
        </>
      )}
      {(config.theme === 'street' || config.theme === 'cage') && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '64px 64px', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000, transparent 70%)', maskImage: 'radial-gradient(ellipse at 50% 50%, #000, transparent 70%)' }}
        />
      )}

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-14">
        {/* Nagłówek */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              <span className="h-px w-8" style={{ background: it.accent }} />
              {config.eyebrow}
            </p>
            <h2 className="mt-2 font-bebas text-5xl leading-none tracking-wide text-white sm:text-7xl">{config.title[lang]}</h2>
          </div>
          <span className={`${comic ? 'oct-blink' : ''} rounded-sm border px-3 py-1 font-mono text-xs font-bold tracking-[0.3em]`} style={{ borderColor: it.accent, color: it.accent }}>
            {config.badge}
          </span>
        </div>

        <div className="mt-4 grid items-center gap-6 md:mt-0 md:grid-cols-[1fr_1.2fr_1fr]">
          {/* Info */}
          <div key={`info-${it.key}`} className="order-2 md:order-1">
            <span
              className="oct-pop inline-block -rotate-3 px-3 py-1 font-condensed text-sm font-extrabold uppercase tracking-[0.2em] text-black"
              style={{ background: it.accent, boxShadow: comic ? '4px 4px 0 #fff' : `0 0 24px ${it.accent}66` }}
            >
              {tx(it.tag, lang)}
            </span>
            <div className="mt-3">
              <KineticText
                text={it.name}
                className="whitespace-nowrap font-bebas text-[clamp(46px,12vw,78px)] leading-[0.9] tracking-wide text-white"
                style={{ textShadow: comic ? `4px 4px 0 ${it.accent}` : `0 0 40px ${it.accent}55` }}
              />
            </div>
            <p className="oct-rise mt-1 font-condensed text-lg font-bold uppercase tracking-[0.25em]" style={{ color: it.accent, animationDelay: '300ms' }}>
              {tx(it.sub, lang)}
            </p>

            {comic && it.stats ? (
              <div className="mt-5 space-y-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{L(lang, 'Fighter stats', 'Fighter stats', 'Statystyki')}</p>
                {STAT_LABELS.map((s, i) => (
                  <div key={s.nl} className="flex items-center gap-3">
                    <span className="w-20 font-condensed text-xs font-bold uppercase tracking-widest text-neutral-300">{s[lang]}</span>
                    <div className="relative h-2.5 flex-1 -skew-x-12 overflow-hidden bg-white/10">
                      <div
                        className="absolute inset-y-0 left-0 transition-[width] duration-1000 ease-[cubic-bezier(.16,1,.3,1)]"
                        style={{ width: `${it.stats![i]}%`, background: `linear-gradient(90deg, ${it.accent}88, ${it.accent})`, boxShadow: `0 0 12px ${it.accent}`, transitionDelay: `${150 + i * 90}ms` }}
                      />
                    </div>
                    <span className="w-7 text-right font-mono text-xs text-white">{it.stats![i]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {(it.features || []).map((f, i) => (
                  <li key={f.nl} className="oct-rise flex items-center gap-3 text-sm text-neutral-200" style={{ animationDelay: `${350 + i * 110}ms` }}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border" style={{ borderColor: `${it.accent}99`, color: it.accent }}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f[lang]}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Scena */}
          <div
            className="relative order-1 mx-auto w-full md:order-2"
            style={{ height: stageH, perspective: 1200, touchAction: 'pan-y' }}
            onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            onTouchEnd={e => {
              const tch = touch.current;
              touch.current = null;
              if (!tch) return;
              const dx = e.changedTouches[0].clientX - tch.x;
              const dy = e.changedTouches[0].clientY - tch.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) pick(active + (dx < 0 ? 1 : -1));
            }}
          >
            {/* Wielka nazwa w tle */}
            <div
              key={`bg-${it.key}`}
              aria-hidden
              className="oct-rise pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bebas leading-none"
              style={{ fontSize: mobile ? 110 : 190, color: 'transparent', WebkitTextStroke: `2px ${it.accent}55` }}
            >
              {bgName}
            </div>
            {/* Motyw */}
            <div key={`fx-${it.key}`} className="oct-pop absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2" style={{ width: stageH * 0.95, height: stageH * 0.95 }}>
              <ThemeBackdrop theme={config.theme} color={it.accent} />
            </div>

            {/* Produkt / model – wskakuje i obraca się */}
            <div key={`fig-${it.key}`} className="oct-jump absolute inset-x-0 bottom-0 mx-auto h-full" style={{ maxWidth: figureW }}>
              <button
                type="button"
                onClick={toggleFront}
                aria-label={L(lang, 'Draai om', 'Turn around', 'Obróć')}
                className="relative h-full w-full cursor-pointer"
                style={{ transformStyle: 'preserve-3d', transform: `rotateY(${front ? 180 : 0}deg)`, transition: 'transform 900ms cubic-bezier(.68,-0.35,.27,1.35)' }}
              >
                {(['A', 'B'] as const).map(side => (
                  <img
                    key={side}
                    src={side === 'A' ? it.imgA : it.imgB}
                    alt={side === 'A' ? `${config.eyebrow} ${it.rosterLabel || it.name}` : ''}
                    aria-hidden={side === 'B'}
                    draggable={false}
                    className={`absolute inset-0 h-full w-full object-contain ${person ? 'object-bottom' : 'object-center p-[6%]'}`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: side === 'B' ? 'rotateY(180deg)' : undefined,
                      filter: `drop-shadow(0 0 30px ${it.accent}55) drop-shadow(0 20px 30px rgba(0,0,0,.6))`,
                      WebkitMaskImage: person ? 'linear-gradient(to bottom, #000 82%, transparent 100%)' : undefined,
                      maskImage: person ? 'linear-gradient(to bottom, #000 82%, transparent 100%)' : undefined,
                    }}
                  />
                ))}
              </button>
            </div>

            {/* Naklejki z cechami (dzieci) */}
            {!mobile && config.stickers?.map((s, i) => (
              <span key={`${it.key}-${s.nl}`} className="oct-pop pointer-events-none absolute" style={{ left: ['4%', '74%', '8%'][i], top: ['22%', '34%', '62%'][i], animationDelay: `${450 + i * 140}ms` }}>
                <span
                  className="oct-bob block border-2 border-black px-3 py-1.5 font-condensed text-xs font-extrabold uppercase tracking-wider text-black"
                  style={{ background: i === 1 ? it.accent : '#fff', boxShadow: '3px 3px 0 #000', ['--r' as string]: ['-6deg', '5deg', '-3deg'][i], animationDelay: `${i * 0.6}s` } as React.CSSProperties}
                >
                  {s[lang]}
                </span>
              </span>
            ))}

            {/* Napis przy wyborze */}
            {config.popWord && (
              <span
                key={`pop-${active}`}
                aria-hidden
                className="oct-fight pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap font-bebas text-[clamp(64px,16vw,140px)] leading-none text-white"
                style={comic ? { textShadow: `5px 5px 0 ${it.accent}, -2px -2px 0 #000`, WebkitTextStroke: '2px #000' } : { textShadow: `0 0 40px ${it.accent}, 0 0 4px #fff` }}
              >
                {config.popWord}
              </span>
            )}

            {/* Obrót */}
            <button
              type="button"
              onClick={toggleFront}
              className="absolute bottom-3 right-0 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-white/60 md:right-2"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {(front ? config.flipLabels[1] : config.flipLabels[0])[lang]}
            </button>
          </div>

          {/* Zakup */}
          <div key={`buy-${it.key}`} className="order-3 md:pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{tx(it.sub, lang)}</p>
            <div className="mt-1 flex items-baseline gap-3">
              <p className="oct-rise font-bebas text-6xl leading-none text-white">{euro(product?.price)}</p>
              {product?.compareAtPrice ? <p className="font-bebas text-2xl text-neutral-500 line-through">{euro(product.compareAtPrice)}</p> : null}
            </div>
            {product && product.sizes.length > 0 && !(product.sizes.length === 1 && /one size/i.test(product.sizes[0])) && (
              <>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{L(lang, 'Maten', 'Sizes', 'Rozmiary')}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.sizes.map(s => (
                    <span key={s} className="border border-white/15 px-2 py-1 font-mono text-[11px] text-neutral-200">{s}</span>
                  ))}
                </div>
              </>
            )}
            {config.description && <p className="mt-4 text-sm leading-relaxed text-neutral-400">{config.description[lang]}</p>}
            <div className="mt-5 flex flex-col gap-2.5">
              <MagneticButton onClick={() => product && navigate(`/product/${product.slug}`)}>
                {person || (product && product.sizes.length > 1) ? L(lang, 'Kies je maat', 'Choose size', 'Wybierz rozmiar') : L(lang, 'Bekijk product', 'View product', 'Zobacz produkt')}
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton variant="ghost" accent={it.accent} onClick={() => navigate(config.allLink)}>
                {config.allLabel[lang]}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Roster */}
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
          <button type="button" onClick={() => pick(active - 1)} aria-label={L(lang, 'Vorige', 'Previous', 'Poprzedni')} className="hidden rounded-full border border-white/15 p-2.5 text-white transition hover:border-white/60 sm:block">
            <ArrowLeft className="h-4 w-4" />
          </button>
          {items.map((fi, i) => {
            const on = i === active;
            const label = fi.rosterLabel || fi.name;
            return (
              <button
                key={fi.key}
                type="button"
                onClick={() => pick(i)}
                aria-label={label}
                aria-current={on}
                className="group relative w-[22%] max-w-[150px] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5"
                style={{ transform: on ? 'translateY(-8px) scale(1.06)' : undefined }}
              >
                {on && (
                  <span className="oct-bob absolute -top-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] font-bold tracking-widest" style={{ color: fi.accent }}>
                    {comic ? '▼ P1' : '▼'}
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
                  {person ? (
                    <img
                      src={fi.imgA}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="absolute left-1/2 top-1 h-[150%] w-auto max-w-none -translate-x-1/2 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: on ? 'none' : 'grayscale(.6) brightness(.7)' }}
                    />
                  ) : (
                    <img
                      src={fi.imgA}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-contain p-[10%] transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: on ? `drop-shadow(0 6px 12px ${fi.accent}66)` : 'grayscale(.5) brightness(.65)' }}
                    />
                  )}
                </div>
                <p className="mt-1.5 truncate text-center font-bebas text-sm tracking-wide sm:text-lg" style={{ color: on ? fi.accent : '#bbb' }}>
                  {label}
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
