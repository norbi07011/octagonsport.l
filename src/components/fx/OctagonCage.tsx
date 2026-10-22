import React from 'react';
import { BRAND_MARK } from '../layout/BrandMark';

/*
 * Klatka oktagonu w CSS 3D: mata z logo, świecący kontur i 8 ścian z siatki z czerwonymi poduszkami.
 * Rysowana w płaszczyźnie podłogi – rodzic ustawia kamerę (rotateX) i ewentualny obrót.
 * `play` = animacja budowania (kontur się rysuje, ściany wyrastają, logo się zapala).
 */

const OCT = Array.from({ length: 8 }, (_, i) => i);
const TAN = Math.tan(Math.PI / 8);

export const OctagonCage: React.FC<{
  apothem: number;
  wallH: number;
  play: boolean;
  delay?: number; // ms – przesunięcie całej sekwencji
  logoOpacity?: number;
  spinClass?: string;
}> = ({ apothem: a, wallH, play, delay = 0, logoOpacity = 0.9, spinClass = '' }) => {
  const side = 2 * a * TAN;
  const anim = (cls: string) => (play ? cls : 'opacity-0');
  const d = (ms: number) => ({ animationDelay: `${delay + ms}ms` });
  const r = a / Math.cos(Math.PI / 8);
  const pts = OCT.map(i => {
    const ang = Math.PI / 8 + (i * Math.PI) / 4;
    return `${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`;
  }).join(' ');

  return (
    <div className={spinClass} style={{ transformStyle: 'preserve-3d' }}>
      {/* Mata */}
      <div
        className={`absolute ${anim('oct-floor-in')}`}
        style={{
          ...d(0),
          width: a * 2.18, height: a * 2.18, left: -a * 1.09, top: -a * 1.09,
          clipPath: 'polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)',
          background: 'radial-gradient(circle, #222225 0%, #0e0e10 60%, #050505 100%)',
          boxShadow: 'inset 0 0 70px rgba(215,25,32,.45)',
        }}
      >
        {/* delikatne linie maty */}
        <div aria-hidden className="absolute inset-0 opacity-30" style={{ background: 'repeating-radial-gradient(circle at 50% 50%, transparent 0 38px, rgba(255,255,255,.05) 38px 39px)' }} />
        <img
          src={BRAND_MARK}
          alt=""
          draggable={false}
          className={`absolute left-1/2 top-1/2 w-[40%] -translate-x-1/2 -translate-y-1/2 ${anim('oct-logo-ignite')}`}
          style={{ ...d(0), filter: 'drop-shadow(0 0 22px rgba(215,25,32,.95))', ['--logo-o' as string]: logoOpacity } as React.CSSProperties}
        />
        <div aria-hidden className="oct-rot-slow absolute inset-0" style={{ background: 'conic-gradient(from 0deg, transparent 0 72%, rgba(255,255,255,.16) 80%, transparent 88%)' }} />
      </div>
      {/* Kontur */}
      <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1" aria-hidden>
        <polygon className={play ? 'oct-draw' : 'opacity-0'} style={d(150)} points={pts} fill="none" stroke="#D71920" strokeWidth="3" filter="drop-shadow(0 0 8px #D71920)" />
      </svg>
      {/* Ściany z siatki */}
      {OCT.map(i => (
        <div
          key={i}
          className="absolute"
          style={{ width: side, height: wallH, left: -side / 2, top: 0, transformStyle: 'preserve-3d', transformOrigin: '50% 0', transform: `rotateZ(${i * 45}deg) translateY(${a}px) rotateX(90deg)` }}
        >
          <div
            className={`absolute inset-0 ${anim('oct-wall-rise')}`}
            style={{
              ...d(250 + i * 85),
              transformOrigin: '50% 0',
              background:
                'repeating-linear-gradient(45deg, rgba(255,255,255,.2) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, rgba(255,255,255,.2) 0 1px, transparent 1px 9px), linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.5))',
              borderLeft: '3px solid #0c0c0c', borderRight: '3px solid #0c0c0c',
            }}
          >
            <span className="absolute inset-x-[-3px] bottom-[-7px] h-[9px] rounded-full bg-[#D71920]" style={{ boxShadow: '0 0 16px rgba(215,25,32,.95)' }} />
          </div>
        </div>
      ))}
    </div>
  );
};
