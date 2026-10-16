import React, { useEffect, useRef } from 'react';

/** Tekst wjeżdżający litera po literze (obrót 3D + rozmycie). Zmień `key`, aby odtworzyć animację. */
export const KineticText: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
}> = ({ text, className = '', style, delay = 0, stagger = 32 }) => (
  <span className={`oct-kinetic ${className}`} style={style} aria-label={text} role="text">
    {(() => {
      // słowa zostają w całości (łamanie linii tylko między słowami), litery animowane osobno
      let n = 0;
      return text.split(' ').map((word, wi, arr) => (
        <React.Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(word).map(ch => {
              const i = n++;
              return (
                <span key={i} className="oct-char" style={{ animationDelay: `${delay + i * stagger}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < arr.length - 1 ? ((n++), ' ') : null}
        </React.Fragment>
      ));
    })()}
  </span>
);

/**
 * Przycisk „magnetyczny”: lekko podąża za kursorem, z wypełnieniem przesuwającym się przy najechaniu.
 * Na telefonie zachowuje się jak zwykły przycisk.
 */
export const MagneticButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost'; accent?: string }
> = ({ variant = 'solid', accent = '#D71920', className = '', children, style, ...rest }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${x * 0.22}px, ${y * 0.32}px, 0)`;
      if (inner.current) inner.current.style.transform = `translate3d(${x * 0.1}px, ${y * 0.14}px, 0)`;
    };
    const leave = () => {
      el.style.transform = '';
      if (inner.current) inner.current.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  const base =
    'oct-magnetic group relative isolate overflow-hidden px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-[transform,border-color,box-shadow] duration-500 ease-out';
  const look =
    variant === 'solid'
      ? 'bg-[#D71920] hover:shadow-[0_10px_40px_-8px_rgba(215,25,32,.7)]'
      : 'border border-white/25 hover:border-white/70 backdrop-blur-sm';

  return (
    <button ref={ref} type="button" className={`${base} ${look} ${className}`} style={style} {...rest}>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-100"
        style={{ background: variant === 'solid' ? '#ff2b33' : `${accent}33` }}
      />
      <span ref={inner} className="relative flex items-center justify-center gap-2 transition-transform duration-300 ease-out">
        {children}
      </span>
    </button>
  );
};
