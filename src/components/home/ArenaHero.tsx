import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import { ShaderStage, type ShaderStageHandle } from '../fx/ShaderStage';
import { KineticText } from '../fx/Kinetic';
import { OctagonCage } from '../fx/OctagonCage';
import { clamp, isFinePointer, lerp, usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';

/*
 * HERO „ARENA” – pierwsze wrażenie sklepu, w całości w kodzie (bez zdjęcia):
 *  - ciemna hala: dym WebGL, reflektory przesuwające się po scenie, kurz unoszący się w świetle,
 *  - na środku klatka oktagonu w 3D, logo zapala się na macie (kontynuacja intra z cząsteczek),
 *  - wokół klatki po orbicie 3D krążą prawdziwe produkty Octagon (klik = karta produktu),
 *  - mysz pochyla scenę, przewijanie „wjeżdża kamerą” do klatki.
 * Start sekwencji: po intrze (zdarzenie 'oct:intro-reveal') albo od razu przy kolejnej wizycie.
 */

const ORBIT = [
  { img: '/showcase/kevlar-red-pair.webp', id: 'oct-5633', w: 1 },
  { img: '/showcase/guardox-black-hero.webp', id: 'oct-6070', w: 0.95 },
  { img: '/showcase/shin-kevlar-red-hero.webp', id: 'oct-5676', w: 0.9 },
  { img: '/showcase/kevlar-gold-side.webp', id: 'oct-5801', w: 1 },
  { img: '/showcase/supreme-red-hero.webp', id: 'oct-5850', w: 0.85 },
  { img: '/showcase/guardox-red-hero.webp', id: 'oct-6074', w: 0.95 },
  { img: '/showcase/kevlar-black-pair.webp', id: 'oct-5630', w: 1 },
  { img: '/showcase/shin-kevlar-black-hero.webp', id: 'oct-5678', w: 0.9 },
];

const INTRO_KEY = 'octagon_intro_seen';

/** Kurz w snopach światła (canvas 2D, lekki). */
const Dust: React.FC<{ run: boolean }> = ({ run }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !run) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const n = W < 640 ? 40 : 80;
    const ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, v: 0.15 + Math.random() * 0.45, a: Math.random() * Math.PI * 2 }));
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
    io.observe(c);
    function tick() {
      raf = 0;
      if (!visible) return;
      ctx!.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.v; p.a += 0.01; p.x += Math.sin(p.a) * 0.25;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        // jaśniej w środku (tam padają reflektory)
        const lit = 1 - Math.min(Math.abs(p.x - W / 2) / (W * 0.45), 1);
        ctx!.globalAlpha = 0.12 + lit * 0.55;
        ctx!.fillStyle = lit > 0.5 ? '#ffd9b0' : '#ff8a8a';
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); };
  }, [run]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
};

export const ArenaHero: React.FC = () => {
  const { navigate, t } = useStore();
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 640;
  const tablet = vw < 1024;

  // start sekwencji: po intrze albo od razu
  const [play, setPlay] = useState(() => {
    if (reduced) return true;
    try { return !!sessionStorage.getItem(INTRO_KEY); } catch { return true; }
  });
  useEffect(() => {
    if (play) return;
    const go = () => setPlay(true);
    window.addEventListener('oct:intro-reveal', go);
    const safety = window.setTimeout(go, 4800);
    return () => { window.removeEventListener('oct:intro-reveal', go); window.clearTimeout(safety); };
  }, [play]);

  const section = useRef<HTMLElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const orbitEls = useRef<(HTMLButtonElement | null)[]>([]);
  const content = useRef<HTMLDivElement>(null);
  const bigWord = useRef<HTMLDivElement>(null);
  const stage = useRef<ShaderStageHandle>(null);
  const [hover, setHover] = useState(-1);
  const hoverRef = useRef(-1);
  hoverRef.current = hover;

  const items = (mobile ? ORBIT.slice(0, 6) : ORBIT).map(o => ({ ...o, product: PRODUCTS.find(p => p.id === o.id) }));
  const a = mobile ? Math.min(vw * 0.25, 110) : tablet ? 150 : 175; // apotema klatki
  const wallH = mobile ? 36 : 58;
  const R = mobile ? Math.min(vw * 0.4, 175) : tablet ? 300 : 400; // promień orbity
  const itemW = mobile ? 72 : tablet ? 105 : 122;
  const stageH = mobile ? 290 : tablet ? 360 : 370;

  // pętla: orbita produktów, pochylenie za myszą, „wjazd kamery” przy przewijaniu
  useEffect(() => {
    if (reduced) return;
    let raf = 0, running = true, visible = true;
    let mx = 0, my = 0, cx = 0, cy = 0, ang = 0, last = 0, speed = 1, intro = 0;
    const fine = isFinePointer();
    const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && running) raf = requestAnimationFrame(loop); });
    if (section.current) io.observe(section.current);
    const startAt = performance.now();
    function loop(now: number) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const h = section.current?.offsetHeight || 1;
      const p = clamp(window.scrollY / h);
      cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05;
      speed += ((hoverRef.current >= 0 ? 0.08 : 1 + p * 4) - speed) * 0.08;
      ang += dt * 0.22 * speed;
      intro = clamp((now - startAt - 900) / 1100); // produkty wlatują na orbitę
      const ease = 1 - Math.pow(1 - intro, 3);

      if (camera.current) {
        const tilt = lerp(62, 72, p) + cy * 6;
        camera.current.style.transform = `translate3d(0, ${p * h * 0.18}px, 0) rotateX(${tilt}deg) rotateZ(${cx * 8}deg) scale(${1 + p * 0.5})`;
      }
      if (spin.current) spin.current.style.transform = `rotateZ(${-ang * 57.3 * 0.35}deg)`;
      orbitEls.current.forEach((el, i) => {
        if (!el) return;
        const n = orbitEls.current.length;
        const th = ang + (i / n) * Math.PI * 2;
        const rr = R * lerp(2.2, 1, ease);
        const x = Math.cos(th) * rr + cx * 30;
        const z = Math.sin(th); // -1 tył … 1 przód
        const y = z * (mobile ? 40 : 58) - (mobile ? 30 : 40) + Math.sin(now / 900 + i) * 8 - p * 140;
        const s = lerp(0.62, 1.12, (z + 1) / 2) * (hoverRef.current === i ? 1.12 : 1);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s}) rotate(${Math.sin(now / 1300 + i * 2) * 6}deg)`;
        el.style.zIndex = String(z > -0.05 ? 30 : 5);
        el.style.opacity = String(ease * (1 - p * 1.2));
        el.style.filter = z < -0.05 ? `blur(${(-z * 2.2).toFixed(1)}px) brightness(${(0.55 + (z + 1) * 0.3).toFixed(2)})` : 'none';
      });
      if (content.current) {
        content.current.style.transform = `translate3d(${cx * 14}px, ${-p * 160}px, 0)`;
        content.current.style.opacity = String(1 - p * 1.6);
      }
      if (bigWord.current) bigWord.current.style.transform = `translate3d(${-50 + cx * -4 - p * 30}%, -50%, 0)`;
      stage.current?.set({ focusX: 0.5 + cx * 0.2, focusY: 0.55, intensity: 0.6 + p * 0.6 });
      raf = requestAnimationFrame(loop);
    }
    if (play) raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove); };
  }, [play, reduced, R, mobile]);

  const hovered = hover >= 0 ? items[hover] : null;

  return (
    <section ref={section} aria-label="Octagon arena" className="relative isolate overflow-hidden border-b border-neutral-800 bg-[#040404]" style={{ minHeight: mobile ? 'calc(100svh - 96px)' : 'calc(100svh - 112px)' }}>
      {/* dym WebGL */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage ref={stage} color="#D71920" mode="story" pulseKey={play ? 1 : 0} />
      </div>
      {/* reflektory */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${play ? 'oct-fade-in' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
        <div className="oct-spot-l absolute left-1/2 top-[-12%] h-[115%] w-[34%] origin-top bg-gradient-to-b from-white/[.13] via-white/[.05] to-transparent blur-2xl" style={{ clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
        <div className="oct-spot-r absolute left-1/2 top-[-12%] h-[115%] w-[34%] origin-top bg-gradient-to-b from-[#ff3b45]/[.14] via-[#ff3b45]/[.05] to-transparent blur-2xl" style={{ clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
        <div className="absolute left-1/2 top-[-12%] h-[115%] w-[26%] -translate-x-1/2 bg-gradient-to-b from-white/[.10] to-transparent blur-3xl" style={{ clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)' }} />
      </div>
      <Dust run={play && !reduced} />
      {/* winieta */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 58%, transparent 40%, rgba(0,0,0,.85) 100%)' }} />

      {/* ogromny napis w tle */}
      <div
        ref={bigWord}
        aria-hidden
        className={`oct-outline-text pointer-events-none absolute left-1/2 top-[64%] whitespace-nowrap font-bebas leading-none ${play ? 'oct-fade-in' : 'opacity-0'}`}
        style={{ fontSize: mobile ? '46vw' : 'min(30vw, 420px)', transform: 'translate3d(-50%,-50%,0)', animationDelay: '600ms', willChange: 'transform' }}
      >
        OCTAGON
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center px-4 pt-8 sm:px-6 sm:pt-10" style={{ minHeight: 'inherit' }}>
        {/* Nagłówek */}
        <div ref={content} className="relative z-40 flex flex-col items-center text-center" style={{ willChange: 'transform, opacity' }}>
          <div className={`mb-4 inline-flex items-center gap-2 border border-white/15 bg-black/50 px-3 py-1 backdrop-blur-md ${play ? 'oct-rise' : 'opacity-0'}`}>
            <span className="h-2 w-2 animate-ping rounded-full bg-[#D71920]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300 sm:text-[11px]">{t('hero.badge')}</span>
          </div>
          <h1 className="font-bebas text-[clamp(58px,15vw,136px)] uppercase leading-[0.86] tracking-tight text-white" style={{ textShadow: '0 6px 40px rgba(0,0,0,.9), 0 0 60px rgba(215,25,32,.35)' }}>
            {play ? <KineticText text={t('hero.title')} stagger={34} delay={150} /> : <span className="opacity-0">{t('hero.title')}</span>}
          </h1>
          <p className={`mt-3 max-w-xl text-balance text-sm leading-relaxed text-neutral-300 sm:text-base ${play ? 'oct-rise' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
            {t('hero.subtitle')}
          </p>
        </div>

        {/* SCENA: klatka + orbita produktów */}
        <div className="relative w-full flex-1" style={{ minHeight: stageH }}>
          {/* Warstwy są płaskie względem siebie (bez wspólnego 3D), żeby mata nie „przecinała” zdjęć produktów:
              klatka ma własną perspektywę, a produkty układają się tylko przed nią (z-index 30) albo za nią (5). */}
          <div className="absolute left-1/2 top-[56%] h-0 w-0" style={{ isolation: 'isolate' }}>
            {/* cień pod klatką */}
            <div aria-hidden className="absolute rounded-[50%] bg-black/80 blur-2xl" style={{ width: a * 3.2, height: a * 1.1, left: -a * 1.6, top: a * 0.15 }} />
            <div className="absolute left-0 top-0 h-0 w-0" style={{ zIndex: 10, perspective: mobile ? 900 : 1400 }}>
            <div ref={camera} style={{ transformStyle: 'preserve-3d', transform: 'rotateX(62deg)' }}>
              <div ref={spin} style={{ transformStyle: 'preserve-3d' }}>
                <OctagonCage apothem={a} wallH={wallH} play={play} delay={150} />
              </div>
            </div>
            </div>
            {/* orbita produktów */}
            {items.map((it, i) => (
              <button
                key={it.id + i}
                ref={el => { orbitEls.current[i] = el; }}
                type="button"
                onClick={() => it.product && navigate(`/product/${it.product.slug}`)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
                aria-label={it.product?.name || 'Octagon'}
                className="absolute left-0 top-0 cursor-pointer outline-none"
                style={{
                  width: itemW * it.w,
                  opacity: reduced ? 1 : 0,
                  transform: reduced
                    ? `translate3d(${Math.cos((i / items.length) * Math.PI * 2) * R}px, ${Math.sin((i / items.length) * Math.PI * 2) * (mobile ? 40 : 58) - (mobile ? 30 : 40)}px, 0) translate(-50%,-50%)`
                    : undefined,
                  willChange: 'transform, opacity, filter',
                }}
              >
                <img
                  src={it.img}
                  alt=""
                  draggable={false}
                  className="block w-full select-none"
                  style={{ filter: `drop-shadow(0 18px 18px rgba(0,0,0,.7)) drop-shadow(0 0 ${hover === i ? 28 : 14}px rgba(215,25,32,${hover === i ? 0.75 : 0.35}))` }}
                />
              </button>
            ))}
          </div>

          {/* etykieta najechanego produktu */}
          <div className={`pointer-events-none absolute inset-x-0 bottom-2 z-40 flex justify-center transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {hovered?.product && (
              <div className="border border-white/15 bg-black/70 px-4 py-2 text-center backdrop-blur-md">
                <p className="font-condensed text-sm font-bold uppercase tracking-wider text-white">{hovered.product.name}</p>
                <p className="font-mono text-xs text-[#ff5a62]">€{hovered.product.price.toFixed(2).replace('.', ',')} · {t('hero.cta.fightGear')} →</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className={`relative z-40 flex w-full flex-col items-center gap-3 pb-8 sm:w-auto sm:flex-row sm:pb-10 ${play ? 'oct-rise' : 'opacity-0'}`} style={{ animationDelay: '1300ms' }}>
          <button
            onClick={() => navigate('/category/fight-gear')}
            className="oct-shine group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-[#D71920] px-8 py-4 font-condensed text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-red-950/40 transition-all hover:bg-[#b01318] hover:shadow-[0_10px_40px_-8px_rgba(215,25,32,.8)] active:scale-[0.97] sm:w-auto"
          >
            {t('hero.cta.fightGear')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/category/heren')}
            className="flex w-full items-center justify-center border border-neutral-600 bg-black/60 px-8 py-4 font-condensed text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:border-white sm:w-auto"
          >
            {t('hero.cta.fightwear')}
          </button>
          <button onClick={() => navigate('/nieuw')} className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white sm:ml-3">
            {t('hero.cta.newDrop')} <ChevronRight className="h-3.5 w-3.5 text-[#D71920]" />
          </button>
        </div>
      </div>
    </section>
  );
};

