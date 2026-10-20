import React, { useEffect, useRef, useState } from 'react';
import { ShaderStage } from './ShaderStage';
import { KineticText } from './Kinetic';
import { BRAND_MARK } from '../layout/BrandMark';
import { usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';

/*
 * „Zwycięstwo w oktagonie” – scena po udanej płatności:
 *  1. klatka oktagonu buduje się w 3D (ściany z siatki wyrastają z maty, logo zapala się na podłodze),
 *  2. z dwóch stron wpadają rękawice Kevlar i przybijają „żółwika” w środku,
 *  3. uderzenie: błysk, drżenie, fala w kształcie oktagonu, konfetti z małych oktagonów,
 *  4. numer zamówienia jako bilet na galę („Fight Pass”), który odwraca się w 3D.
 * Bez bibliotek: CSS 3D + canvas 2D + tło WebGL (ShaderStage). Przy „ogranicz ruch” – statyczny kadr końcowy.
 */

const IMPACT_MS = 1650;
const OCT = Array.from({ length: 8 }, (_, i) => i);
const TAN = Math.tan(Math.PI / 8); // bok oktagonu = 2·apotema·tan(22.5°)

/** Konfetti z oktagonów: wybuch z punktu uderzenia + dwa „działka” z boków. */
const useConfetti = (canvas: React.RefObject<HTMLCanvasElement>, fire: boolean) => {
  useEffect(() => {
    const c = canvas.current;
    if (!fire || !c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#D71920', '#ff3b45', '#F5C542', '#c9a227', '#ffffff', '#9aa0a6'];
    type P = { x: number; y: number; vx: number; vy: number; s: number; r: number; vr: number; f: number; vf: number; c: string; life: number };
    const ps: P[] = [];
    const add = (x: number, y: number, n: number, ang: number, spread: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        const a = ang + (Math.random() - 0.5) * spread;
        const v = speed * (0.45 + Math.random() * 0.75);
        ps.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          s: 5 + Math.random() * 7,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          f: Math.random() * Math.PI * 2,
          vf: 0.08 + Math.random() * 0.14,
          c: colors[(Math.random() * colors.length) | 0],
          life: 0,
        });
      }
    };
    const small = W < 640;
    add(W / 2, H * 0.42, small ? 90 : 160, -Math.PI / 2, Math.PI * 2, small ? 13 : 17);
    add(-10, H * 0.85, small ? 50 : 90, -Math.PI / 3.2, 0.6, small ? 19 : 25);
    add(W + 10, H * 0.85, small ? 50 : 90, -Math.PI + Math.PI / 3.2, 0.6, small ? 19 : 25);
    const octPath = (s: number) => {
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = Math.PI / 8 + (k * Math.PI) / 4;
        const px = Math.cos(a) * s;
        const py = Math.sin(a) * s;
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
    };
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.life++;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.32;
        p.x += p.vx + Math.sin(p.f) * 0.8;
        p.y += p.vy;
        p.r += p.vr;
        p.f += p.vf;
        const alpha = t > 3800 ? Math.max(0, 1 - (t - 3800) / 1200) : 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(Math.cos(p.f), 1); // „trzepotanie” – obrót w 3D
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.c;
        octPath(p.s / 2);
        ctx.fill();
        if (p.c === '#F5C542' || p.c === '#ffffff') {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }
      if (t < 5000) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire, canvas]);
};

export const VictoryScene: React.FC<{
  title: string;
  eyebrow: string;
  order?: string;
  passLabel: string;
  dateLabel: string;
}> = ({ title, eyebrow, order, passLabel, dateLabel }) => {
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 640;
  const [impact, setImpact] = useState(reduced);
  const confetti = useRef<HTMLCanvasElement>(null);
  useConfetti(confetti, impact && !reduced);

  useEffect(() => {
    if (reduced) { setImpact(true); return; }
    const t = window.setTimeout(() => {
      setImpact(true);
      try { navigator.vibrate?.([30, 40, 60]); } catch {}
    }, IMPACT_MS);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const a = mobile ? Math.min(vw * 0.36, 150) : 210; // apotema klatki (px)
  const side = 2 * a * TAN;
  const wallH = mobile ? 56 : 84;
  const glove = mobile ? Math.min(vw * 0.42, 170) : 250;
  const anim = (cls: string) => (reduced ? '' : cls);
  const today = new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <section className={`relative overflow-hidden border-b border-neutral-900 bg-[#050505] ${impact && !reduced ? 'oct-shake' : ''}`} aria-label={title}>
      {/* Tło: dym WebGL – błyska przy uderzeniu */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage color={impact ? '#F5C542' : '#D71920'} mode="story" pulseKey={impact ? 1 : 0} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 52%, rgba(215,25,32,.35), transparent 70%)' }} />
      {/* Reflektory z góry */}
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-full ${anim('oct-fade-in')}`}>
        <div className="absolute left-[18%] top-[-10%] h-[90%] w-[22%] origin-top -rotate-[18deg] bg-gradient-to-b from-white/[.10] to-transparent blur-2xl" />
        <div className="absolute right-[18%] top-[-10%] h-[90%] w-[22%] origin-top rotate-[18deg] bg-gradient-to-b from-white/[.10] to-transparent blur-2xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <p className={`font-mono text-[11px] uppercase tracking-[0.35em] text-[#F5C542] ${anim('oct-rise')}`}>{eyebrow}</p>

        {/* SCENA: klatka 3D + rękawice */}
        <div className="relative mt-2 w-full" style={{ height: mobile ? 330 : 470, perspective: mobile ? 900 : 1300 }}>
          {/* Klatka */}
          <div className="absolute left-1/2 top-[58%] h-0 w-0" style={{ transformStyle: 'preserve-3d', transform: `rotateX(64deg)` }}>
            <div className={anim('oct-cage-spin')} style={{ transformStyle: 'preserve-3d' }}>
              {/* Mata (podłoga) */}
              <div
                className={`absolute ${anim('oct-floor-in')}`}
                style={{
                  width: a * 2.18, height: a * 2.18, left: -a * 1.09, top: -a * 1.09,
                  clipPath: 'polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)',
                  background: 'radial-gradient(circle, #1d1d1f 0%, #0d0d0e 62%, #050505 100%)',
                  boxShadow: 'inset 0 0 60px rgba(215,25,32,.4)',
                }}
              >
                <img src={BRAND_MARK} alt="" className={`absolute left-1/2 top-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2 ${anim('oct-logo-ignite')}`} style={{ filter: 'drop-shadow(0 0 18px rgba(215,25,32,.9))', opacity: reduced ? 0.85 : undefined }} />
                <div aria-hidden className={`absolute inset-0 ${anim('oct-rot-slow')}`} style={{ background: 'conic-gradient(from 0deg, transparent 0 70%, rgba(245,197,66,.35) 80%, transparent 90%)' }} />
              </div>
              {/* Kontur na macie */}
              <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1" aria-hidden>
                <polygon
                  className={anim('oct-draw')}
                  points={OCT.map(i => { const ang = Math.PI / 8 + (i * Math.PI) / 4; const r = a / Math.cos(Math.PI / 8); return `${Math.cos(ang) * r},${Math.sin(ang) * r}`; }).join(' ')}
                  fill="none" stroke="#D71920" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 8px #D71920)' }}
                />
              </svg>
              {/* 8 ścian z siatki */}
              {OCT.map(i => (
                <div
                  key={i}
                  className="absolute"
                  style={{ width: side, height: wallH, left: -side / 2, top: 0, transformStyle: 'preserve-3d', transformOrigin: '50% 0', transform: `rotateZ(${i * 45}deg) translateY(${a}px) rotateX(90deg)` }}
                >
                  <div
                    className={`absolute inset-0 ${anim('oct-wall-rise')}`}
                    style={{
                      animationDelay: `${250 + i * 85}ms`,
                      transformOrigin: '50% 0',
                      background:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, rgba(255,255,255,.22) 0 1px, transparent 1px 9px), linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.45))',
                      borderLeft: '3px solid #111', borderRight: '3px solid #111',
                    }}
                  >
                    {/* czerwona poduszka na górze */}
                    <span className="absolute inset-x-[-3px] bottom-[-7px] h-[9px] rounded-full bg-[#D71920]" style={{ boxShadow: '0 0 14px rgba(215,25,32,.9)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fala uderzeniowa w kształcie oktagonu */}
          {impact && !reduced && (
            <svg aria-hidden className="oct-shock pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" width="200" height="200" viewBox="-100 -100 200 200">
              <polygon points={OCT.map(i => { const ang = Math.PI / 8 + (i * Math.PI) / 4; return `${Math.cos(ang) * 90},${Math.sin(ang) * 90}`; }).join(' ')} fill="none" stroke="#F5C542" strokeWidth="5" />
            </svg>
          )}
          {impact && !reduced && <div aria-hidden className="oct-flash pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 44%, #fff, rgba(255,255,255,0) 45%)' }} />}

          {/* Rękawice: czerwona z lewej (odbita), złota z prawej – przybijają w środku */}
          <div className="pointer-events-none absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-1/2 items-center" style={{ gap: 0 }}>
            <div className={anim('oct-punch-l')} style={{ marginRight: -glove * 0.16 }}>
              <img
                src="/showcase/kevlar-red-side.webp"
                alt=""
                draggable={false}
                className={impact && !reduced ? 'oct-recoil-l' : ''}
                style={{ width: glove, transform: 'scaleX(-1)', filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.65)) drop-shadow(0 0 22px rgba(215,25,32,.55))' }}
              />
            </div>
            <div className={anim('oct-punch-r')} style={{ marginLeft: -glove * 0.16 }}>
              <img
                src="/showcase/kevlar-gold-side.webp"
                alt=""
                draggable={false}
                className={impact && !reduced ? 'oct-recoil-r' : ''}
                style={{ width: glove, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.65)) drop-shadow(0 0 22px rgba(245,197,66,.55))' }}
              />
            </div>
          </div>
        </div>

        {/* Tytuł – wjeżdża przy uderzeniu */}
        <h1 className="relative -mt-4 text-center font-bebas text-[clamp(44px,12vw,104px)] leading-[0.9] tracking-wide text-white" style={{ textShadow: '0 0 40px rgba(215,25,32,.55), 4px 4px 0 #000' }}>
          {impact ? <KineticText text={title} stagger={34} /> : <span className="opacity-0">{title}</span>}
        </h1>

        {/* Bilet na galę z numerem zamówienia */}
        {order && (
          <div className="mt-6 [perspective:900px]">
            <div
              className={`relative flex items-stretch overflow-hidden rounded-md border border-[#F5C542]/40 bg-gradient-to-br from-[#16130a] via-[#0b0b0b] to-[#1a0606] ${impact && !reduced ? 'oct-ticket' : reduced ? '' : 'opacity-0'}`}
              style={{ boxShadow: '0 20px 60px -20px rgba(245,197,66,.45)' }}
            >
              <div className="flex min-w-0 flex-col justify-center gap-1 px-4 py-3 sm:px-7">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#F5C542] sm:text-[10px] sm:tracking-[0.3em]">{passLabel}</span>
                <span className="font-bebas text-2xl leading-none tracking-wider text-white sm:text-4xl">{order}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{dateLabel} · {today}</span>
              </div>
              {/* perforacja */}
              <div aria-hidden className="relative w-0 border-l-2 border-dashed border-[#F5C542]/30">
                <span className="absolute -left-[9px] -top-2 h-4 w-4 rounded-full bg-[#050505]" />
                <span className="absolute -bottom-2 -left-[9px] h-4 w-4 rounded-full bg-[#050505]" />
              </div>
              <div className="flex items-center justify-center px-4 sm:px-5">
                <img src={BRAND_MARK} alt="" className="h-10 w-10 opacity-90 sm:h-12 sm:w-12" />
              </div>
              {!reduced && <span aria-hidden className="oct-ticket-shine pointer-events-none absolute inset-0" />}
            </div>
          </div>
        )}
      </div>

      {/* Konfetti nad całą stroną */}
      {!reduced && <canvas ref={confetti} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-screen w-screen" />}
    </section>
  );
};
