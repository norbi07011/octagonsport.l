import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import type { ShowcaseConfig, ShowcaseLang as Lang, ShowcaseVariant as Variant, T3 } from '../../data/showcases';
import { ShaderStage, type ShaderStageHandle } from '../fx/ShaderStage';
import { KineticText, MagneticButton } from '../fx/Kinetic';
import { asset, clamp, easeInOut, easeOut, lerp, useFinePointer, usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';
import { scrollToY } from '../../lib/smoothScroll';

/*
 * Premium showcase serii produktów.
 * 1) Karuzela 3D na żywym tle WebGL: produkty w łuku, aktywny unosi się nad świecącym podestem,
 *    pochyla się za kursorem, ma odblask światła i odbicie w podłodze. Kursor „DRAG”, przesuwanie
 *    palcem / myszką / strzałkami / klawiaturą, fala uderzeniowa przy zmianie koloru.
 * 2) Scroll story: sekcja przypięta do ekranu, wszystko sterowane wygładzonym postępem przewijania
 *    (działa płynnie w obie strony) – produkt obraca się i rośnie, cechy wjeżdżają z rozmycia,
 *    napis w tle reaguje na prędkość przewijania, na końcu błysk + fala i „obrót” do frontu.
 * Konfiguracja serii: src/data/showcases.ts
 */

const productOf = (v: Variant) => PRODUCTS.find(p => p.id === v.id);
const euro = (n?: number) => (typeof n === 'number' ? `€${n.toFixed(2).replace('.', ',')}` : '');
const swatchOf = (v: Variant) => v.swatch || v.accent;
const L = (lang: Lang, nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);
const pad = (n: number) => String(n).padStart(2, '0');

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
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
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
    if (!autoplay || hover || !visible || reduced) return;
    const t = window.setInterval(() => setActive(a => (a + 1) % n), 4600);
    return () => window.clearInterval(t);
  }, [autoplay, hover, visible, n, setActive, reduced]);
  const userGo = (d: number) => { setAutoplay(false); go(d); };

  /* --- tilt za kursorem + odblask + kursor DRAG (pętla rAF tylko gdy widoczne) --- */
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, nx: 0, ny: 0, inside: false, cx: 0, cy: 0, tx: 0, ty: 0 });
  const [cursorLabel, setCursorLabel] = useState<'drag' | 'view'>('drag');
  const [cursorOn, setCursorOn] = useState(false);

  useEffect(() => {
    if (!visible || reduced) return;
    let raf = 0;
    let t0 = performance.now();
    const loop = (now: number) => {
      const P = pointer.current;
      const t = (now - t0) / 1000;
      // gdy kursor poza sceną – delikatne „oddychanie” (żywy produkt także na telefonie)
      const gx = P.inside ? P.nx : Math.sin(t * 0.7) * 0.35;
      const gy = P.inside ? P.ny : Math.cos(t * 0.55) * 0.25;
      P.tx += (gx - P.tx) * 0.08;
      P.ty += (gy - P.ty) * 0.08;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${P.tx * 16}deg) rotateX(${-P.ty * 11}deg)`;
      if (sheenRef.current) {
        sheenRef.current.style.setProperty('--mx', `${50 + P.tx * 45}%`);
        sheenRef.current.style.setProperty('--my', `${32 + P.ty * 40}%`);
      }
      if (cursorRef.current) {
        P.cx += (P.x - P.cx) * 0.2;
        P.cy += (P.y - P.cy) * 0.2;
        cursorRef.current.style.transform = `translate3d(${P.cx}px, ${P.cy}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduced]);

  const onStageMove = (e: React.PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    const P = pointer.current;
    P.x = e.clientX;
    P.y = e.clientY;
    P.nx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    P.ny = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    if (e.pointerType === 'mouse') P.inside = true;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false, horizontal: null };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    onStageMove(e);
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
  const useCursor = fine && !reduced;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={cfg.eyebrow}
      className="relative overflow-hidden border-b border-neutral-800 bg-[#050505]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Fallback bez WebGL: gradient w kolorze produktu */}
      {variants.map((v, i) => (
        <div
          key={v.key}
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === active ? 1 : 0,
            background: `radial-gradient(ellipse 70% 55% at 50% 62%, ${v.accent}38 0%, ${v.accent}10 45%, transparent 75%)`,
          }}
        />
      ))}
      {/* Żywe tło WebGL */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage color={current.accent} mode="carousel" pulseKey={active} />
      </div>
      {/* Lampa */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="mx-auto h-2.5 w-28 rounded-b-full bg-white/90 sm:w-44" style={{ boxShadow: `0 0 50px 12px ${current.accent}77, 0 0 12px 2px #fff` }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              <span className="h-px w-8" style={{ background: current.accent }} />
              {cfg.eyebrow}
            </p>
            <h2 className="mt-2 font-bebas text-4xl tracking-wide text-white sm:text-6xl">{tr(cfg.title)}</h2>
          </div>
          <p className="hidden font-mono text-xs tracking-[0.3em] text-neutral-500 sm:block">
            <span className="text-white">{pad(active + 1)}</span> / {pad(n)}
          </p>
        </div>

        {/* Scena 3D */}
        <div
          ref={stageRef}
          className="relative mx-auto mt-2 select-none outline-none sm:mt-4"
          style={{ height: mobile ? 360 : 500, perspective: 1400, touchAction: 'pan-y', cursor: useCursor ? 'none' : undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={e => { if (e.pointerType === 'mouse') { const P = pointer.current; P.x = P.cx = e.clientX; P.y = P.cy = e.clientY; setCursorOn(true); } }}
          onPointerLeave={() => { pointer.current.inside = false; setCursorOn(false); if (drag.current) endDrag(); }}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') userGo(1);
            if (e.key === 'ArrowLeft') userGo(-1);
          }}
        >
          {/* Podest: obracający się pierścień światła w perspektywie */}
          <div aria-hidden className="absolute left-1/2" style={{ bottom: mobile ? 22 : 30, width: mobile ? 230 : 340, height: mobile ? 230 : 340, transform: 'translateX(-50%) scaleY(0.2)', transformOrigin: 'bottom' }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${current.accent}aa`, boxShadow: `0 0 60px 10px ${current.accent}55, inset 0 0 60px ${current.accent}66`, transition: 'border-color .8s, box-shadow .8s' }}
            />
            <div
              className="oct-spin absolute -inset-1 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${current.accent} 40deg, #fff 52deg, transparent 90deg, transparent 200deg, ${current.accent}aa 240deg, transparent 280deg)`,
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
                filter: 'blur(1px)',
              }}
            />
            <div className="absolute inset-[18%] rounded-full" style={{ background: `radial-gradient(circle, ${current.accent}55, transparent 70%)` }} />
          </div>

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
                  onPointerEnter={() => setCursorLabel(isActive ? 'view' : 'drag')}
                  onPointerLeave={() => setCursorLabel('drag')}
                  className="absolute left-1/2 top-[44%] outline-none"
                  style={{
                    width: itemW,
                    cursor: useCursor ? 'none' : 'pointer',
                    transform: `translate(-50%, -50%) translateX(${f * spacing}px) translateZ(${-abs * 190}px) rotateY(${-f * 28}deg) scale(${1 - Math.min(abs, 2.2) * 0.13})`,
                    opacity: abs > 2.6 ? 0 : 1 - Math.min(abs, 2.6) * 0.17,
                    filter: `brightness(${1 - Math.min(abs, 1) * 0.6}) saturate(${1 - Math.min(abs, 1) * 0.4}) blur(${Math.max(0, abs - 0.6) * 1.4}px)`,
                    zIndex: 10 - Math.round(abs),
                    pointerEvents: abs > 2.6 ? 'none' : undefined,
                    transition: dragging ? 'none' : 'transform 1000ms cubic-bezier(.16,1,.3,1), opacity 900ms, filter 900ms',
                  }}
                >
                  <div className={isActive && !dragging ? 'oct-float' : ''} style={{ perspective: 900 }}>
                    <div ref={isActive ? tiltRef : undefined} style={{ transformStyle: 'preserve-3d', willChange: isActive ? 'transform' : undefined }}>
                      <div className="relative">
                        <img
                          src={v.hero}
                          alt={`${cfg.eyebrow} ${tr(v.label)}`}
                          draggable={false}
                          loading={Math.abs(o) <= 1 ? 'eager' : 'lazy'}
                          className="mx-auto block max-h-[300px] w-full object-contain sm:max-h-[380px]"
                          style={{ filter: isActive ? `drop-shadow(0 30px 40px ${v.accent}66) drop-shadow(0 6px 10px rgba(0,0,0,.6))` : 'drop-shadow(0 18px 18px rgba(0,0,0,.6))' }}
                        />
                        {isActive && !reduced && (
                          <div
                            ref={sheenRef}
                            aria-hidden
                            className="oct-sheen absolute inset-0"
                            style={{ WebkitMaskImage: `url("${asset(v.hero)}")`, maskImage: `url("${asset(v.hero)}")` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Odbicie w błyszczącej podłodze */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-full w-full transition-opacity duration-700"
                    style={{
                      opacity: isActive && !dragging ? 0.28 : 0,
                      transform: 'scaleY(-1) translateY(-6%)',
                      WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 32%)',
                      maskImage: 'linear-gradient(to top, #000 0%, transparent 32%)',
                      filter: 'blur(2px)',
                    }}
                  >
                    <img src={v.hero} alt="" draggable={false} className="mx-auto block max-h-[300px] w-full object-contain sm:max-h-[380px]" />
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
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur-md transition hover:scale-110 hover:border-white/60 sm:left-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => userGo(1)}
            aria-label={L(lang, 'Volgende', 'Next', 'Następny')}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 p-3 text-white backdrop-blur-md transition hover:scale-110 hover:border-white/60 sm:right-4"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Opis aktywnego produktu */}
        <div className="-mt-4 text-center">
          <KineticText
            key={current.key}
            text={tr(current.label)}
            className="font-bebas text-6xl leading-none tracking-wide sm:text-8xl"
            style={{ color: current.accent, textShadow: `0 0 40px ${current.accent}66` }}
          />
          <p key={`s-${current.key}`} className="oct-rise mt-2 font-condensed text-sm font-bold uppercase tracking-[0.25em] text-neutral-300" style={{ animationDelay: '250ms' }}>
            {cfg.specLine} · <span className="text-white">{euro(product?.price)}</span>
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {variants.map((v, i) => (
            <button
              key={v.key}
              type="button"
              aria-label={tr(v.label)}
              onClick={() => { setAutoplay(false); setActive(() => i); }}
              className="group relative h-6 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{ width: i === active ? 44 : 18 }}
            >
              <span
                className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-colors duration-500 group-hover:bg-white/60"
                style={{ background: i === active ? current.accent : 'rgba(255,255,255,.22)', boxShadow: i === active ? `0 0 12px ${current.accent}` : 'none' }}
              />
            </button>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <MagneticButton onClick={() => onView(current)}>
            {L(lang, 'Bekijk & kies je maat', 'View & choose size', 'Zobacz i wybierz rozmiar')}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton variant="ghost" accent={current.accent} onClick={onDiscover}>
            {L(lang, 'Ontdek de details', 'Discover details', 'Odkryj szczegóły')}
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </MagneticButton>
        </div>
      </div>

      {/* Kursor DRAG / BEKIJK (tylko komputer) */}
      {useCursor && (
        <div
          ref={cursorRef}
          aria-hidden
          className="oct-cursor"
          style={{
            opacity: cursorOn ? 1 : 0,
            background: `${current.accent}${cursorLabel === 'view' ? 'cc' : '33'}`,
            border: `1px solid ${current.accent}`,
            width: dragging ? 64 : cursorLabel === 'view' ? 104 : 92,
            height: dragging ? 64 : cursorLabel === 'view' ? 104 : 92,
            margin: dragging ? '-32px 0 0 -32px' : cursorLabel === 'view' ? '-52px 0 0 -52px' : '-46px 0 0 -46px',
          }}
        >
          {cursorLabel === 'view' ? L(lang, 'BEKIJK', 'VIEW', 'ZOBACZ') : '‹ DRAG ›'}
        </div>
      )}
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

  const stageRef = useRef<ShaderStageHandle>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLImageElement | null>(null);
  const frontRef = useRef<HTMLImageElement | null>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const accentRef = useRef(v.accent);
  accentRef.current = v.accent;

  const productW = vw >= 768
    ? Math.min((vw * cfg.story.width) / 100, cfg.story.maxW)
    : Math.min((vw * cfg.story.mobileWidth) / 100, cfg.story.mobileMaxW);
  const productWRef = useRef(productW);
  productWRef.current = productW;

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    let pS = -1; // wygładzony postęp
    let vel = 0;
    let lastY = window.scrollY;
    let wasFront = false;
    let lastIdx = -2;

    let lastT = 0;
    const frame = (now = performance.now()) => {
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 1 / 60;
      lastT = now;
      const k = 1 - Math.pow(1 - 0.12, dt * 60); // wygładzanie niezależne od liczby klatek
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const total = Math.max(el.offsetHeight - vh, 1);
      const pT = clamp(-rect.top / total);
      pS = pS < 0 ? pT : pS + (pT - pS) * k;
      if (Math.abs(pT - pS) < 0.0004) pS = pT;
      const p = pS;
      const y0 = window.scrollY;
      vel += ((y0 - lastY) / (dt * 60) - vel) * Math.min(1, k * 1.5);
      lastY = y0;

      const seg = p * SEGMENTS;
      const desktop = window.innerWidth >= 768;
      const X = desktop ? 17 * dir : 0;
      const Y = desktop ? 0 : -10;
      let x = 0, y = 0, rz = 0, ry = 0, rx = 0, sc = 1, front = false;
      if (seg < 1) {
        const t = easeInOut(clamp(seg));
        y = lerp(desktop ? 26 : 18, Y, t);
        sc = lerp(0.55, 1, t);
        rz = lerp(m.enterRz, m.rzFrom, t);
        rx = lerp(35, 0, t);
        x = lerp(0, X, t);
      } else if (seg < SEGMENTS - 1) {
        const t = (seg - 1) / features.length;
        x = X;
        y = Y + Math.sin(t * Math.PI * 2) * 1.5;
        rz = lerp(m.rzFrom, m.rzTo, m.spin ? easeInOut(t) : t);
        ry = m.spin ? 0 : Math.sin(t * Math.PI * 2) * 16;
        rx = Math.cos(t * Math.PI * 2) * 6;
        sc = 1 + Math.sin(t * Math.PI) * 0.1;
      } else {
        const t = clamp(seg - (SEGMENTS - 1));
        const e = easeInOut(t);
        x = lerp(X, 0, e);
        y = lerp(Y, desktop ? -13 : -17, e);
        rz = lerp(m.spin ? 0 : m.rzTo, 0, e);
        ry = t < 0.5 ? t * 2 * 90 : (1 - t) * 2 * 90; // „obrót” – podmiana ujęcia w połowie
        front = t >= 0.5;
        sc = lerp(1, m.finalScale, e);
      }
      // drobna reakcja na prędkość przewijania
      rz += clamp(vel * 0.05, -6, 6);

      if (productRef.current) productRef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotateZ(${rz}deg) rotateY(${ry}deg) rotateX(${rx}deg) scale(${sc})`;
      if (detailRef.current) detailRef.current.style.opacity = front ? '0' : '1';
      if (frontRef.current) frontRef.current.style.opacity = front ? '1' : '0';
      if (shadowRef.current) {
        const pw = productWRef.current;
        shadowRef.current.style.transform = `translate3d(calc(-50% + ${x}vw), ${y * vh / 100 + pw * 0.48 * sc}px, 0) scale(${sc * (1 - Math.abs(ry) / 200)}, ${sc})`;
        shadowRef.current.style.opacity = String(clamp(0.25 + (1 - Math.abs(y + 10) / 30) * 0.5, 0, 0.75));
      }
      if (front && !wasFront) stageRef.current?.pulse();
      wasFront = front;

      const skew = clamp(-vel * 0.12, -14, 14);
      if (bigRef.current) bigRef.current.style.transform = `translate3d(${dir > 0 ? lerp(18, -62, p) : lerp(-62, 18, p)}%, -50%, 0) skewX(${skew}deg)`;
      const flashT = clamp(seg - (SEGMENTS - 1));
      stageRef.current?.set({
        focusX: 0.5 + x / 100,
        focusY: 0.5 - y / 100,
        intensity: 0.7 + 0.5 * clamp(p * 1.4),
        flash: Math.max(0, 1 - Math.abs(flashT - 0.5) * 4) * 0.5,
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      // teksty sterowane przewijaniem (płynnie w obie strony)
      blockRefs.current.forEach((b, i) => {
        if (!b) return;
        let o = 0, ty = 0;
        if (i === 0) {
          const out = easeOut(clamp((seg - 0.55) / 0.35));
          o = 1 - out;
          ty = -out * 50;
        } else if (i <= features.length) {
          const local = seg - i;
          const inT = easeOut(clamp(local / 0.3));
          const outT = easeInOut(clamp((local - 0.72) / 0.28));
          o = inT * (1 - outT);
          ty = (1 - inT) * 60 - outT * 60;
        } else {
          const inT = easeOut(clamp((seg - (SEGMENTS - 1) - 0.35) / 0.4));
          o = inT;
          ty = (1 - inT) * 50;
        }
        b.style.opacity = String(o);
        b.style.transform = `translate3d(0, ${ty}px, 0)`;
        b.style.filter = o > 0.98 ? 'none' : `blur(${(1 - o) * 12}px)`;
        b.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        b.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
      });

      const idx = seg >= 1 && seg < SEGMENTS - 1 ? Math.floor(seg) - 1 : -1;
      if (idx !== lastIdx) {
        lastIdx = idx;
        const acc = accentRef.current;
        dotRefs.current.forEach((d, i) => {
          if (!d) return;
          const on = i === idx;
          d.style.borderColor = on ? acc : 'rgba(255,255,255,.18)';
          d.style.background = on ? `${acc}33` : 'rgba(0,0,0,.35)';
          d.style.color = on ? '#fff' : 'rgba(255,255,255,.5)';
          d.style.boxShadow = on ? `0 0 18px ${acc}88` : 'none';
          d.style.transform = on ? 'scale(1.15)' : 'scale(1)';
        });
      }
      if (running) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }, { rootMargin: '20% 0px' });
    io.observe(el);
    frame();
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, [reduced, wrapRef, SEGMENTS, dir, m, features.length]);

  // zmiana koloru odświeża kolory kropek nawigacji
  useEffect(() => {
    dotRefs.current.forEach(d => {
      if (d && d.style.transform === 'scale(1.15)') {
        d.style.borderColor = v.accent;
        d.style.background = `${v.accent}33`;
        d.style.boxShadow = `0 0 18px ${v.accent}88`;
      }
    });
  }, [v.accent]);

  const scrollToStep = (s: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + ((s + 0.5) / SEGMENTS) * total);
  };

  const sizesLine = cfg.sizesLine || (product?.sizes || []).join(' · ');
  const viewLabel = L(lang, 'Kies je maat', 'Choose your size', 'Wybierz rozmiar');

  const Swatches = (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {variants.map((sv, i) => (
        <button
          key={sv.key}
          type="button"
          aria-label={tr(sv.label)}
          onClick={() => setActive(() => i)}
          className="h-8 w-8 rounded-full border-2 transition-all duration-500 hover:scale-110"
          style={{
            background: swatchOf(sv),
            borderColor: i === active ? '#fff' : 'rgba(255,255,255,.2)',
            boxShadow: i === active ? `0 0 0 3px #050505, 0 0 0 4px ${sv.accent}, 0 0 22px ${sv.accent}` : 'none',
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

  // pozycja tekstu na komputerze – po przeciwnej stronie niż produkt
  const textPos = dir < 0 ? 'md:left-auto md:right-24' : 'md:left-6 md:right-auto';

  return (
    <div ref={wrapRef} id={`story-${cfg.id}`} className="relative h-[440vh] bg-[#050505] md:h-[520vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden border-b border-neutral-800">
        {/* Fallback bez WebGL */}
        <div
          aria-hidden
          className="absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(ellipse 65% 60% at ${dir < 0 ? '35%' : '65%'} 50%, ${v.accent}55 0%, ${v.accent}14 45%, transparent 75%)` }}
        />
        {/* Żywe tło WebGL */}
        <div aria-hidden className="absolute inset-0">
          <ShaderStage ref={stageRef} color={v.accent} mode="story" pulseKey={active} />
        </div>

        {/* Ogromny napis w tle – reaguje na prędkość przewijania */}
        <div
          ref={bigRef}
          aria-hidden
          className="oct-outline-text pointer-events-none absolute left-0 top-1/2 whitespace-nowrap font-bebas leading-none"
          style={{ fontSize: 'clamp(160px, 32vw, 460px)', transform: 'translate3d(18%, -50%, 0)', willChange: 'transform' }}
        >
          {cfg.bigText}
        </div>

        {/* Cień produktu na podłodze */}
        <div
          ref={shadowRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%] blur-xl"
          style={{ width: productW * 0.8, height: productW * 0.12, background: 'rgba(0,0,0,.85)', willChange: 'transform' }}
        />

        {/* Produkt */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1200 }}>
          <div ref={productRef} className="relative" style={{ width: productW, willChange: 'transform', transformStyle: 'preserve-3d' }}>
            <img
              key={`d-${v.key}`}
              ref={el => { detailRef.current = el; }}
              src={v.detail}
              alt={`${cfg.eyebrow} ${tr(v.label)}`}
              draggable={false}
              className="oct-swap block max-h-[60svh] w-full object-contain"
              style={{ filter: `drop-shadow(0 30px 40px rgba(0,0,0,.65)) drop-shadow(0 0 50px ${v.accent}55)` }}
            />
            <img
              key={`f-${v.key}`}
              ref={el => { frontRef.current = el; }}
              src={v.hero}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 m-auto block h-full w-full object-contain opacity-0"
              style={{ filter: `drop-shadow(0 30px 40px rgba(0,0,0,.65)) drop-shadow(0 0 50px ${v.accent}55)` }}
            />
          </div>
        </div>

        {/* Treści sterowane przewijaniem */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-7xl">
          {/* intro */}
          <div
            ref={el => { blockRefs.current[0] = el; }}
            className={`absolute left-5 right-16 top-24 md:top-1/2 md:max-w-xl md:-translate-y-1/2 ${textPos}`}
            style={{ willChange: 'transform, opacity, filter' }}
          >
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              <span className="h-px w-8" style={{ background: v.accent }} />
              {cfg.eyebrow}
            </p>
            <h2 className="mt-3 font-bebas text-[clamp(44px,13vw,64px)] leading-[0.92] tracking-wide text-white md:text-7xl xl:text-8xl">
              {cfg.storyTitle}<br />
              <span style={{ color: v.accent, textShadow: `0 0 40px ${v.accent}55` }}>{tr(cfg.storyTagline)}</span>
            </h2>
            <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              <ChevronDown className="h-4 w-4 animate-bounce" />
              {L(lang, 'Scroll', 'Scroll', 'Przewiń')}
            </p>
          </div>

          {/* cechy */}
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title.nl}
                ref={el => { blockRefs.current[i + 1] = el; }}
                className={`absolute bottom-20 left-4 right-4 md:bottom-auto md:top-1/2 md:w-[min(460px,38vw)] md:-translate-y-1/2 ${textPos}`}
                style={{ opacity: 0, visibility: 'hidden', willChange: 'transform, opacity, filter' }}
              >
                <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black/70 p-5 md:overflow-visible md:border-0 md:bg-transparent md:p-0">
                  <span
                    aria-hidden
                    className="oct-outline-text pointer-events-none absolute -right-2 -top-6 font-bebas text-[110px] leading-none md:-left-4 md:-top-24 md:right-auto md:text-[200px]"
                  >
                    {pad(i + 1)}
                  </span>
                  <p className="relative font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: v.accent }}>
                    {pad(i + 1)} / {pad(features.length)}
                  </p>
                  <div className="relative mt-3 flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border" style={{ borderColor: `${v.accent}99`, color: v.accent, boxShadow: `0 0 24px ${v.accent}44` }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="min-w-0 font-bebas text-[clamp(30px,8.5vw,42px)] leading-none tracking-wide text-white md:text-5xl xl:text-6xl">{tr(f.title)}</h3>
                  </div>
                  <p className="relative mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">{tr(f.text)}</p>
                </div>
              </div>
            );
          })}

          {/* finał */}
          <div
            ref={el => { blockRefs.current[features.length + 1] = el; }}
            className="absolute bottom-10 left-4 right-4 mx-auto max-w-md text-center md:bottom-12"
            style={{ opacity: 0, visibility: 'hidden', willChange: 'transform, opacity, filter' }}
          >
            <p className="font-bebas text-[clamp(32px,9vw,52px)] leading-none tracking-wide" style={{ color: v.accent, textShadow: `0 0 30px ${v.accent}77` }}>
              {cfg.storyTitle} · {tr(v.label)}
            </p>
            {sizesLine && <p className="mt-2 font-condensed text-sm font-bold uppercase tracking-[0.25em] text-neutral-300">{sizesLine}</p>}
            <div className="mt-4">{Swatches}</div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <MagneticButton onClick={() => onView(v)}>
                {viewLabel} · {euro(product?.price)}
              </MagneticButton>
              <MagneticButton variant="ghost" accent={v.accent} onClick={onAll}>
                {tr(cfg.allLabel)}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Nawigacja po krokach */}
        <nav aria-label={cfg.storyTitle} className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={f.title.nl}
                ref={el => { dotRefs.current[i] = el; }}
                type="button"
                onClick={() => scrollToStep(i + 1)}
                aria-label={tr(f.title)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/35 text-white/50 backdrop-blur-md transition-all duration-500 sm:h-10 sm:w-10"
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </nav>

        {/* Pasek postępu */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
          <div ref={barRef} className="h-full origin-left" style={{ background: v.accent, transform: 'scaleX(0)', boxShadow: `0 0 12px ${v.accent}` }} />
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
    scrollToY(el.getBoundingClientRect().top + window.scrollY + (total / SEGMENTS) * 1.5);
  };

  if (!config.variants.some(v => productOf(v))) return null;

  return (
    <>
      <Carousel cfg={config} active={active} setActive={setActive} lang={lang} onDiscover={onDiscover} onView={onView} />
      <Story cfg={config} active={active} setActive={setActive} lang={lang} onView={onView} onAll={onAll} wrapRef={storyRef} />
    </>
  );
};
