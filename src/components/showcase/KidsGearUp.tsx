import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import { ShaderStage } from '../fx/ShaderStage';
import { KineticText, MagneticButton } from '../fx/Kinetic';
import { usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';

/*
 * Kids „Gear up!” – ekwipunek wojownika. Wybierz zwierzaka, a jego rękawice, kask i ochraniacze
 * wlatują na scenę z trzech stron (sprężyście), na komiksowym tle WebGL w kolorze zwierzaka.
 * Zdjęcia bez tła: public/showcase/kidsgear-*.webp (scripts/showcase/build_cutouts.py).
 */

type Lang = 'nl' | 'en' | 'pl';
interface Animal {
  key: string;
  name: Record<Lang, string>;
  accent: string;
  gloves: string;
  helmet: string;
  shins: string;
}

const ANIMALS: Animal[] = [
  { key: 'bear', name: { nl: 'Bear', en: 'Bear', pl: 'Miś' }, accent: '#f5a623', gloves: 'oct-5627', helmet: 'oct-6063', shins: 'oct-6055' },
  { key: 'bull', name: { nl: 'Bull', en: 'Bull', pl: 'Byk' }, accent: '#ff2533', gloves: 'oct-5629', helmet: 'oct-6062', shins: 'oct-6058' },
  { key: 'croc', name: { nl: 'Crocodile', en: 'Crocodile', pl: 'Krokodyl' }, accent: '#8bd32f', gloves: 'oct-5628', helmet: 'oct-6059', shins: 'oct-6054' },
  { key: 'monkey', name: { nl: 'Monkey', en: 'Monkey', pl: 'Małpka' }, accent: '#2ec5c5', gloves: 'oct-5626', helmet: 'oct-6061', shins: 'oct-6056' },
  { key: 'tiger', name: { nl: 'Tiger', en: 'Tiger', pl: 'Tygrys' }, accent: '#ff6a1a', gloves: 'oct-5625', helmet: 'oct-6060', shins: 'oct-6057' },
];

const PARTS = [
  { part: 'helmet' as const, label: { nl: 'Bokshelm', en: 'Head guard', pl: 'Kask' }, short: { nl: 'Helm', en: 'Helmet', pl: 'Kask' }, anim: 'oct-drop' },
  { part: 'gloves' as const, label: { nl: 'Bokshandschoenen', en: 'Boxing gloves', pl: 'Rękawice' }, short: { nl: 'Handschoenen', en: 'Gloves', pl: 'Rękawice' }, anim: 'oct-fly-left' },
  { part: 'shins' as const, label: { nl: 'Scheenbeschermers', en: 'Shin guards', pl: 'Ochraniacze' }, short: { nl: 'Schenen', en: 'Shins', pl: 'Ochraniacze' }, anim: 'oct-fly-right' },
];

const img = (k: string, part: string) => `/showcase/kidsgear-${k}-${part}.webp`;
const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const L = (lang: Lang, nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);

export const KidsGearUp: React.FC = () => {
  const { language, navigate } = useStore();
  const lang = (['nl', 'en', 'pl'].includes(language) ? language : 'nl') as Lang;
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const [active, setActive] = useState(1);
  const [visible, setVisible] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const root = useRef<HTMLElement>(null);
  const a = ANIMALS[active];
  const products = { gloves: PRODUCTS.find(p => p.id === a.gloves), helmet: PRODUCTS.find(p => p.id === a.helmet), shins: PRODUCTS.find(p => p.id === a.shins) };
  const total = (products.gloves?.price || 0) + (products.helmet?.price || 0) + (products.shins?.price || 0);

  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!autoplay || !visible || reduced) return;
    const t = window.setInterval(() => setActive(i => (i + 1) % ANIMALS.length), 5500);
    return () => window.clearInterval(t);
  }, [autoplay, visible, reduced]);
  const pick = (i: number) => { setAutoplay(false); setActive(i); };

  return (
    <section ref={root} aria-label="Legion Kids – Gear up" className="relative overflow-hidden border-b border-neutral-800 bg-[#07050c]">
      <div aria-hidden className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${a.accent}40, transparent 70%)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage color={a.accent} mode="story" pulseKey={active} />
      </div>
      <div
        aria-hidden
        className="oct-rot-slow pointer-events-none absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${a.accent}40 0deg 1.2deg, transparent 1.2deg 9deg)`,
          WebkitMaskImage: 'radial-gradient(circle, transparent 14%, #000 30%, transparent 60%)',
          maskImage: 'radial-gradient(circle, transparent 14%, #000 30%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">Legion Kids · {L(lang, 'Complete set', 'Complete set', 'Cały zestaw')}</p>
          <h2 className="mt-2 font-bebas text-5xl leading-none tracking-wide text-white sm:text-7xl">
            GEAR UP!{' '}
            <span key={a.key} className="inline-block" style={{ color: a.accent, textShadow: '4px 4px 0 #000' }}>
              <KineticText text={a.name[lang].toUpperCase()} stagger={40} />
            </span>
          </h2>
        </div>

        {/* Scena: kask z góry, rękawica z lewej, ochraniacze z prawej */}
        <div className="relative mx-auto mt-6 grid max-w-5xl grid-cols-3 items-end gap-2 sm:gap-6" style={{ minHeight: mobile ? 230 : 420 }}>
          {[PARTS[1], PARTS[0], PARTS[2]].map((pt, i) => {
            const prod = products[pt.part];
            return (
              <div key={`${a.key}-${pt.part}`} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => prod && navigate(`/product/${prod.slug}`)}
                  aria-label={`${pt.label[lang]} ${a.name[lang]}`}
                  className={`${reduced ? '' : pt.anim} group relative w-full`}
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  <span aria-hidden className="absolute inset-x-[15%] bottom-0 h-[12%] rounded-[50%] bg-black/70 blur-md" />
                  <img
                    src={img(a.key, pt.part)}
                    alt={`${pt.label[lang]} Legion Octagon ${a.name.en}`}
                    draggable={false}
                    className="relative mx-auto block w-full object-contain transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-3 group-hover:scale-105"
                    style={{ maxHeight: mobile ? 170 : pt.part === 'helmet' ? 330 : 300, filter: `drop-shadow(0 0 26px ${a.accent}66) drop-shadow(0 16px 20px rgba(0,0,0,.6))` }}
                  />
                </button>
                <p className="mt-3 max-w-full truncate font-condensed text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 sm:text-sm sm:tracking-[0.2em]">{mobile ? pt.short[lang] : pt.label[lang]}</p>
                {prod && (
                  <>
                    <p className="font-bebas text-2xl text-white sm:text-3xl">{euro(prod.price)}</p>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${prod.slug}`)}
                      className="mt-1 hidden items-center gap-1 font-mono text-[10px] uppercase tracking-widest transition-colors sm:inline-flex"
                      style={{ color: a.accent }}
                    >
                      {L(lang, 'Kies maat', 'Choose size', 'Wybierz rozmiar')} <ArrowRight className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Suma zestawu */}
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            {L(lang, 'Hele set samen', 'Full set together', 'Cały zestaw razem')}
          </p>
          <p key={`t-${a.key}`} className="oct-pop font-bebas text-6xl leading-none text-white" style={{ textShadow: `4px 4px 0 ${a.accent}` }}>
            {euro(total)}
          </p>
          <div className="mt-2 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            <MagneticButton onClick={() => products.gloves && navigate(`/product/${products.gloves.slug}`)}>
              {L(lang, 'Begin met de handschoenen', 'Start with the gloves', 'Zacznij od rękawic')} <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton variant="ghost" accent={a.accent} onClick={() => navigate('/category/kids')}>
              {L(lang, 'Alle kids-items', 'All kids items', 'Wszystko dla dzieci')}
            </MagneticButton>
          </div>
        </div>

        {/* Wybór zwierzaka */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {ANIMALS.map((an, i) => {
            const on = i === active;
            return (
              <button
                key={an.key}
                type="button"
                onClick={() => pick(i)}
                aria-current={on}
                className="group relative w-[17%] max-w-[120px] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5"
                style={{ transform: on ? 'translateY(-8px) scale(1.08)' : undefined }}
              >
                <div
                  className="relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-500"
                  style={{ borderColor: on ? an.accent : 'rgba(255,255,255,.12)', background: `radial-gradient(circle, ${an.accent}${on ? '55' : '22'}, #0b0b0b 75%)`, boxShadow: on ? `0 0 26px ${an.accent}aa` : 'none' }}
                >
                  <img src={img(an.key, 'helmet')} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-[12%] transition-transform duration-500 group-hover:scale-110" style={{ filter: on ? 'none' : 'grayscale(.5) brightness(.7)' }} />
                </div>
                <p className="mt-1.5 truncate text-center font-bebas text-sm tracking-wide sm:text-lg" style={{ color: on ? an.accent : '#bbb' }}>{an.name[lang]}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
