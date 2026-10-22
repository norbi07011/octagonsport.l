import React, { useEffect, useRef, useState } from 'react';
import { asset, prefersReducedMotion } from '../../lib/motion';

/*
 * Intro przy pierwszej wizycie (raz na sesję): logo Octagon składa się z rozżarzonych cząsteczek,
 * rozbłyskuje, a potem strona odsłania się rozszerzającym się kołem. ~2,5 s, kliknięcie = pominięcie.
 * Nie pokazuje się przy włączonym „ograniczonym ruchu”.
 */

const KEY = 'octagon_intro_seen';

export const shouldShowIntro = () => {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try { return !sessionStorage.getItem(KEY); } catch { return false; }
};

interface P { x: number; y: number; tx: number; ty: number; vx: number; vy: number; d: number; s: number; }

export const IntroOverlay: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'build' | 'reveal'>('build');
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* prywatny tryb */ }
    setPhase('reveal');
    // hero „Arena” startuje razem z odsłonięciem strony (logo z intra „spada” na matę)
    try { window.dispatchEvent(new Event('oct:intro-reveal')); } catch {}
    window.setTimeout(onDone, 900);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) { finish(); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let parts: P[] = [];
    const start = performance.now();
    const size = Math.min(W, H) * 0.42;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset('/brand/octagon-mark-white.png');
    img.onload = () => {
      // próbkowanie pikseli logo -> punkty docelowe cząsteczek
      const off = document.createElement('canvas');
      const S = 160;
      off.width = S; off.height = S;
      const o = off.getContext('2d')!;
      const r = Math.min(S / img.width, S / img.height);
      o.drawImage(img, (S - img.width * r) / 2, (S - img.height * r) / 2, img.width * r, img.height * r);
      const data = o.getImageData(0, 0, S, S).data;
      const pts: [number, number][] = [];
      const step = W < 700 ? 3 : 2;
      for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) {
        if (data[(y * S + x) * 4 + 3] > 120) pts.push([x / S, y / S]);
      }
      parts = pts.map(([u, v]) => {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.max(W, H) * (0.6 + Math.random() * 0.6);
        return {
          x: W / 2 + Math.cos(a) * rr,
          y: H / 2 + Math.sin(a) * rr,
          tx: W / 2 + (u - 0.5) * size,
          ty: H / 2 + (v - 0.5) * size,
          vx: 0, vy: 0,
          d: Math.random() * 0.35,
          s: 0.8 + Math.random() * 1.6,
        };
      });
    };
    img.onerror = () => finish();

    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5,5,5,0.32)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const flash = Math.max(0, 1 - Math.abs(t - 1.75) * 4);
      for (const p of parts) {
        const k = ease(Math.min(Math.max((t - p.d) / 1.3, 0), 1));
        let x = p.x + (p.tx - p.x) * k;
        let y = p.y + (p.ty - p.y) * k;
        if (t > 1.9) { // rozprysk
          const e = (t - 1.9) * 1.6;
          x += (p.tx - W / 2) * e * e * 2.2;
          y += (p.ty - H / 2) * e * e * 2.2;
        }
        const heat = k < 1 ? 0.55 : 1;
        ctx.fillStyle = k > 0.98 ? `rgba(255,${120 + flash * 135},${90 + flash * 165},${heat})` : `rgba(215,25,32,${0.55 + k * 0.4})`;
        ctx.fillRect(x, y, p.s, p.s);
      }
      if (flash > 0) {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, size);
        g.addColorStop(0, `rgba(215,25,32,${0.35 * flash})`);
        g.addColorStop(1, 'rgba(215,25,32,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      if (t > 2.15) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    raf = requestAnimationFrame(loop);
    const safety = window.setTimeout(finish, 4000);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(safety); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="presentation"
      onClick={finish}
      className="fixed inset-0 z-[300] cursor-pointer"
      style={{
        background: '#050505',
        clipPath: phase === 'reveal' ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
        transition: 'clip-path 900ms cubic-bezier(.7,0,.2,1)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">
        Octagon Sport NL
      </span>
    </div>
  );
};
