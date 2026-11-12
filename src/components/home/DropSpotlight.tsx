import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getProductBySlug } from '../../data/products';
import { Reveal } from '../fx/ScrollFx';

/*
 * „DROP” – wyróżniona nowość na stronie głównej i na /nieuw.
 * Koszulka w 3D: obraca się sama (przód ↔ tył z pauzą), reaguje na ruch myszy i daje się kręcić palcem/myszą.
 * Do zmiany na inny produkt: DROP_SLUG + dwa zdjęcia bez tła (FRONT/BACK) w public/images/drops.
 */
const DROP_SLUG = 'sportshirt-octagon-berkano-breda-1944-limited-edition';
const FRONT = '/images/drops/breda-1944-front.webp';
const BACK = '/images/drops/breda-1944-back.webp';

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 0.73) % 7,
  dur: 6 + ((i * 1.7) % 5),
  size: 2 + (i % 3),
  color: i % 5 === 0 ? '#ff8a00' : i % 3 === 0 ? '#ffffff' : '#D71920',
}));

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const DropSpotlight: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, navigate } = useStore();
  const product = getProductBySlug(DROP_SLUG, language);
  const tr = (nl: string, en: string, pl: string) => (language === 'pl' ? pl : language === 'en' ? en : nl);

  const stageRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const st = useRef({ angle: 0, target: 0, tiltX: 0, tiltY: 0, drag: false, lastX: 0, idleUntil: 0, visible: false });
  const [side, setSide] = useState<'front' | 'back'>('front');

  // pętla animacji – działa tylko, gdy sekcja jest widoczna
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const still = reducedMotion();
    let raf = 0;
    let t0 = performance.now();
    const io = new IntersectionObserver(([e]) => {
      st.current.visible = e.isIntersecting;
      if (e.isIntersecting && !raf) { t0 = performance.now(); raf = requestAnimationFrame(tick); }
    });
    io.observe(el);
    const tick = (now: number) => {
      const s = st.current;
      if (!s.visible) { raf = 0; return; }
      // automatyczny obrót: 3,2 s przód, obrót, 3,2 s tył, obrót…
      if (!still && !s.drag && now > s.idleUntil) {
        const cycle = ((now - t0) / 1000) % 8;
        const turns = Math.floor((now - t0) / 8000);
        const base = turns * 360;
        const phase = cycle < 3.2 ? 0 : cycle < 4 ? (cycle - 3.2) / 0.8 : cycle < 7.2 ? 1 : 1 + (cycle - 7.2) / 0.8;
        const ease = (p: number) => (p < 1 ? 0.5 - Math.cos(Math.PI * p) / 2 : 1 + (0.5 - Math.cos(Math.PI * (p - 1)) / 2));
        s.target = base + ease(phase) * 180;
        // wyrównaj do bieżącego kąta po ręcznym kręceniu
        while (s.target - s.angle > 180) s.target -= 360;
        while (s.angle - s.target > 180) s.target += 360;
      }
      s.angle += (s.target - s.angle) * (s.drag ? 0.35 : 0.08);
      const a = ((s.angle % 360) + 360) % 360;
      const nextSide = a > 90 && a < 270 ? 'back' : 'front';
      setSide(prev => (prev === nextSide ? prev : nextSide));
      if (spinRef.current) {
        spinRef.current.style.transform = `rotateX(${s.tiltX}deg) rotateY(${s.angle + s.tiltY}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    if (s.drag) {
      s.target += (e.clientX - s.lastX) * 0.6;
      s.lastX = e.clientX;
      return;
    }
    if (e.pointerType === 'mouse') {
      s.tiltY = ((e.clientX - r.left) / r.width - 0.5) * 24;
      s.tiltX = -((e.clientY - r.top) / r.height - 0.5) * 14;
    }
  };
  const onDown = (e: React.PointerEvent) => {
    st.current.drag = true;
    st.current.lastX = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onUp = () => {
    const s = st.current;
    s.drag = false;
    s.idleUntil = performance.now() + 2500;
    // dociągnij do najbliższej strony
    s.target = Math.round(s.target / 180) * 180;
  };
  const onLeave = () => { st.current.tiltX = 0; st.current.tiltY = 0; };
  const show = (which: 'front' | 'back') => {
    const s = st.current;
    s.idleUntil = performance.now() + 5000;
    const want = which === 'front' ? 0 : 180;
    let t = Math.round(s.angle / 360) * 360 + want;
    if (t - s.angle > 180) t -= 360;
    if (s.angle - t > 180) t += 360;
    s.target = t;
  };

  if (!product) return null;
  const price = new Intl.NumberFormat(language === 'en' ? 'en-IE' : 'nl-NL', { style: 'currency', currency: 'EUR' }).format(product.price);
  const go = () => navigate(`/product/${product.slug}`);

  return (
    <section
      aria-label={tr('Nieuw: Breda 1944 herdenkingsshirt', 'New: Breda 1944 commemorative shirt', 'Nowość: koszulka Breda 1944')}
      className="relative isolate overflow-hidden border-y border-neutral-800/80 bg-[#060606]"
    >
      {/* tło: łuna PL + NL, siatka, wielkie „1944” */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 45% 60% at 28% 50%, rgba(215,25,32,.28), transparent 70%), radial-gradient(ellipse 35% 45% at 80% 30%, rgba(255,120,0,.10), transparent 70%), radial-gradient(ellipse 35% 45% at 85% 85%, rgba(33,70,139,.16), transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }} />
      <div aria-hidden className="oct-outline-text pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none font-bebas text-[34vw] leading-none opacity-[.07] md:text-[22rem]">1944</div>
      {EMBERS.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="drop-ember pointer-events-none absolute bottom-0 rounded-full"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 4}px ${p.color}`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}

      <div className={`relative mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 ${compact ? 'py-10 md:py-14' : 'py-14 md:py-24'}`}>
        {/* SCENA 3D */}
        <div
          ref={stageRef}
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onLeave}
          className="relative mx-auto aspect-square w-full max-w-[520px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ perspective: '1300px' }}
        >
          {/* ośmiokąt „ringu” na podłodze */}
          <div aria-hidden className="absolute inset-x-[6%] bottom-[2%] h-[34%]" style={{ perspective: '600px' }}>
            <div className="h-full w-full" style={{ transform: 'rotateX(68deg)', transformStyle: 'preserve-3d' }}>
              <svg viewBox="-110 -110 220 220" className="oct-rot-med h-full w-full overflow-visible">
                <polygon points="42,-101 101,-42 101,42 42,101 -42,101 -101,42 -101,-42 -42,-101" fill="rgba(215,25,32,.10)" stroke="#D71920" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 10px #D71920)' }} />
                <polygon points="30,-72 72,-30 72,30 30,72 -30,72 -72,30 -72,-30 -30,-72" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeDasharray="4 6" />
              </svg>
            </div>
          </div>
          {/* pulsujący pierścień za koszulką */}
          <div aria-hidden className="oct-pulse-ring absolute left-1/2 top-[44%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(215,25,32,.35), transparent 65%)' }} />

          {/* koszulka */}
          <div className="absolute inset-[6%] bottom-[12%]" style={{ transformStyle: 'preserve-3d' }}>
            <div ref={spinRef} className="relative h-full w-full will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              {[{ src: FRONT, rot: 0, key: 'front' }, { src: BACK, rot: 180, key: 'back' }].map(f => (
                <div key={f.key} className="absolute inset-0" style={{ transform: `rotateY(${f.rot}deg) translateZ(1px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <img
                    src={f.src}
                    alt={f.key === 'front' ? tr('Voorkant', 'Front', 'Przód') : tr('Achterkant', 'Back', 'Tył')}
                    draggable={false}
                    className="h-full w-full object-contain"
                    style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.75)) drop-shadow(0 0 28px rgba(215,25,32,.35))' }}
                  />
                  {/* błysk światła tylko na koszulce */}
                  <div
                    aria-hidden
                    className="drop-sheen absolute inset-0"
                    style={{ maskImage: `url(${f.src})`, WebkitMaskImage: `url(${f.src})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* znaczniki */}
          <div className="absolute left-0 top-2 flex items-center gap-2 border border-[#D71920]/60 bg-black/70 px-3 py-1.5 backdrop-blur">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#D71920]" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[.25em] text-white">{tr('Nieuw', 'New', 'Nowość')}</span>
          </div>
          <div className="absolute right-0 top-2 border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur">
            Limited Edition
          </div>
          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 border border-white/10 bg-black/70 p-1 backdrop-blur">
            {(['front', 'back'] as const).map(k => (
              <button
                key={k}
                onClick={() => show(k)}
                onPointerDown={e => e.stopPropagation()}
                className={`px-3 py-1.5 font-condensed text-[11px] font-bold uppercase tracking-widest transition-colors ${side === k ? 'bg-[#D71920] text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                {k === 'front' ? tr('Voorkant', 'Front', 'Przód') : tr('Achterkant', 'Back', 'Tył')}
              </button>
            ))}
            <span className="flex items-center gap-1 px-2 font-mono text-[10px] text-neutral-500"><RotateCw className="h-3 w-3" /> 360°</span>
          </div>
        </div>

        {/* TEKST */}
        <Reveal className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#D71920]">{tr('Nieuw · Herdenkingsshirt', 'New · Commemorative shirt', 'Nowość · Koszulka pamiątkowa')}</span>
            <span className="flex h-3 overflow-hidden" aria-hidden>
              <span className="flex w-5 flex-col"><span className="h-1/2 bg-white" /><span className="h-1/2 bg-[#D71920]" /></span>
              <span className="ml-1 flex w-5 flex-col"><span className="h-1/3 bg-[#AE1C28]" /><span className="h-1/3 bg-white" /><span className="h-1/3 bg-[#21468B]" /></span>
            </span>
          </div>
          <h2 className="mt-3 font-bebas text-6xl leading-[0.85] tracking-wide text-white sm:text-8xl">
            Breda <span className="text-[#D71920]">1944</span>
          </h2>
          <p className="mt-3 font-condensed text-lg font-bold uppercase tracking-[.2em] text-neutral-200 sm:text-xl">„Za naszą i waszą wolność”</p>
          {language !== 'pl' && <p className="text-xs italic text-neutral-500">{tr('Voor onze en jullie vrijheid', 'For our freedom and yours', '')}</p>}
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base">
            {tr(
              'Op 29 oktober 1944 bevrijdde de 1e Poolse Pantserdivisie van generaal Stanisław Maczek de stad Breda. Dit Limited Edition-shirt van Octagon Sport × Berkano eert die gedeelde geschiedenis van Polen en Nederland.',
              'On 29 October 1944 General Stanisław Maczek’s 1st Polish Armoured Division liberated Breda. This Octagon Sport × Berkano Limited Edition shirt honours the shared history of Poland and the Netherlands.',
              '29 października 1944 r. 1. Dywizja Pancerna gen. Stanisława Maczka wyzwoliła Bredę. Ta koszulka Limited Edition od Octagon Sport × Berkano upamiętnia wspólną historię Polski i Holandii.'
            )}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              tr('Herdenkingsprint achterop', 'Commemorative back print', 'Pamiątkowy nadruk na plecach'),
              tr('82 + Poolse vlag op de mouwen', '82 + Polish flag on sleeves', '82 + polska flaga na rękawach'),
              'Octagon × Berkano',
            ].map(x => (
              <li key={x} className="border border-neutral-800 bg-white/[.03] px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider text-neutral-300">{x}</li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <span className="font-bebas text-5xl tracking-wide text-white">{price}</span>
            <button
              onClick={go}
              className="oct-shine group relative inline-flex items-center gap-2 overflow-hidden bg-[#D71920] px-7 py-4 font-condensed text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(215,25,32,.45)] transition-transform hover:-translate-y-0.5"
            >
              {tr('Bekijk het shirt', 'View the shirt', 'Zobacz koszulkę')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            {!compact && (
              <button onClick={() => navigate('/nieuw')} className="font-condensed text-xs font-bold uppercase tracking-widest text-neutral-400 underline-offset-4 hover:text-white hover:underline">
                {tr('Alle nieuwe items', 'All new items', 'Wszystkie nowości')}
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
