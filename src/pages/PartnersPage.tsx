import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PartnerForm } from '../components/forms/PartnerForm';
import { Reveal, TiltCard, VelocityMarquee, ScrollProgress, useInView } from '../components/fx/ScrollFx';
import { KineticText } from '../components/fx/Kinetic';
import { ShaderStage, type ShaderStageHandle } from '../components/fx/ShaderStage';
import { clamp, easeInOut, easeOut, lerp, prefersReducedMotion, useViewportWidth } from '../lib/motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ArrowUpRight, Globe, Maximize2, Users, X } from 'lucide-react';
import { PARTNERS, INFLUENCERS, PARTNERS_HERO_IMAGE, Partner, PartnerLink } from '../data/partners';
import { Language } from '../types';

// Ikony marek rysowane lokalnie (lucide nie zawiera logotypów platform)
const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H8v3h2.5V21h3z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 3c.3 2 1.5 3.5 3.4 3.8v3c-1.3 0-2.5-.4-3.5-1v6.1c0 3.2-2.5 5.6-5.6 5.6S5.3 18 5.3 15c0-3.1 2.6-5.5 5.8-5.3v3.1c-1.4-.3-2.8.8-2.8 2.2 0 1.3 1.1 2.4 2.5 2.4 1.5 0 2.6-1.1 2.6-2.8V3h3.2z" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);

const LinkIcon: React.FC<{ type: PartnerLink['type']; className?: string }> = ({ type, className }) => {
  if (type === 'instagram') return <InstagramIcon className={className} />;
  if (type === 'tiktok') return <TikTokIcon className={className} />;
  if (type === 'facebook') return <FacebookIcon className={className} />;
  if (type === 'youtube') return <YouTubeIcon className={className} />;
  return <Globe className={className} />;
};

const COPY: Record<string, Record<Language, string>> = {
  eyebrow: { nl: 'Partners & samenwerkingen', en: 'Partners & collaborations', pl: 'Partnerzy i współprace' },
  title: { nl: 'Samen in de ring', en: 'In the ring together', pl: 'Razem na ringu' },
  lead: {
    nl: 'De sportscholen, clubs en sporters waarmee OctagonSportNL samenwerkt. Mensen die elke week trainen, en weten wat goede uitrusting waard is.',
    en: 'The gyms, clubs and athletes OctagonSportNL works with. People who train every week and know what good gear is worth.',
    pl: 'Kluby, sale i zawodnicy, z którymi współpracuje OctagonSportNL. Ludzie, którzy trenują co tydzień i wiedzą, ile wart jest dobry sprzęt.',
  },
  caption: {
    nl: 'Trainingsgroep van Sportcentrum Marris Gym',
    en: 'Training group at Sportcentrum Marris Gym',
    pl: 'Grupa treningowa Sportcentrum Marris Gym',
  },
  follow: { nl: 'Volg & bezoek', en: 'Follow & visit', pl: 'Obserwuj i odwiedź' },
  partnersTitle: { nl: 'Zakelijke partners', en: 'Business partners', pl: 'Partnerzy biznesowi' },
  influencersTitle: { nl: 'Atleten & creators', en: 'Athletes & creators', pl: 'Zawodnicy i twórcy' },
  influencersEmpty: {
    nl: 'Binnenkort stellen we hier de vechters en creators voor die met Octagon-gear trainen. Ben jij actief op Instagram, TikTok of YouTube? Neem contact met ons op.',
    en: 'Soon we will introduce the fighters and creators who train in Octagon gear here. Active on Instagram, TikTok or YouTube? Get in touch.',
    pl: 'Wkrótce przedstawimy tu zawodników i twórców, którzy trenują w sprzęcie Octagon. Działasz na Instagramie, TikToku lub YouTube? Odezwij się do nas.',
  },
  soon: { nl: 'Binnenkort', en: 'Coming soon', pl: 'Wkrótce' },
  ctaTitle: { nl: 'Partner worden?', en: 'Become a partner?', pl: 'Zostań partnerem' },
  ctaText: {
    nl: 'Sportschool, team, evenement of creator: we werken graag samen. Vertel ons wie je bent en wat je zoekt.',
    en: 'Gym, team, event or creator: we are happy to work together. Tell us who you are and what you are looking for.',
    pl: 'Klub, drużyna, gala czy twórca – chętnie nawiążemy współpracę. Napisz, kim jesteś i czego szukasz.',
  },
  ctaContact: { nl: 'Neem contact op', en: 'Get in touch', pl: 'Skontaktuj się' },
  ctaClubs: { nl: 'Aanbod voor clubs', en: 'Offers for clubs', pl: 'Oferta dla klubów' },
};

const PartnerLinks: React.FC<{ links: PartnerLink[]; icons?: boolean }> = ({ links, icons }) =>
  icons ? (
    // telefon (przypięta scena): okrągłe ikony w jednym rzędzie – mieszczą się na ekranie
    <div className="flex flex-wrap gap-2.5">
      {links.map(l => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${l.type}: ${l.label}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm transition-colors active:bg-[#D71920]"
        >
          <LinkIcon type={l.type} className="h-[18px] w-[18px] text-white" />
        </a>
      ))}
    </div>
  ) : (
  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
    {links.map(l => (
      <a
        key={l.url}
        href={l.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group/link inline-flex items-center gap-3 pl-3 pr-4 py-3 border border-neutral-800 bg-[#0E0E0E] hover:border-[#D71920] hover:bg-[#140808] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D71920]"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-[#181818] group-hover/link:bg-[#D71920] flex items-center justify-center transition-colors">
          <LinkIcon type={l.type} className="w-4 h-4 text-white" />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500">{l.type}</span>
          <span className="text-sm text-white font-medium truncate">{l.label}</span>
        </span>
        <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover/link:text-[#D71920] ml-auto sm:ml-2 transition-colors" />
      </a>
    ))}
  </div>
  );

const FeaturedPartner: React.FC<{ p: Partner; lang: Language; followLabel: string }> = ({ p, lang, followLabel }) => (
  <article className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
    {/* Logo w pierścieniu w barwach NL */}
    <div className="flex justify-center">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 max-w-full">
        <div
          aria-hidden="true"
          className="absolute -inset-3 rounded-full opacity-70 blur-2xl"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(215,25,32,.45), transparent 60%), radial-gradient(circle at 70% 75%, rgba(33,70,139,.5), transparent 60%)' }}
        />
        <div className="relative w-full h-full rounded-full p-[3px]" style={{ background: 'conic-gradient(from 200deg, #AE1C28, #f4f4f4, #21468B, #AE1C28)' }}>
          <div className="w-full h-full rounded-full bg-[#050505] p-2">
            <img src={p.logo} alt={`Logo ${p.name}`} className="w-full h-full rounded-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </div>

    <div className="min-w-0 space-y-6">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#D71920] text-white text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
          {p.role[lang]}
        </span>
        <h2 className="font-bebas text-5xl sm:text-6xl text-white leading-[0.9] tracking-wide text-balance">{p.name}</h2>
      </div>
      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-[62ch]">{p.description[lang]}</p>

      {p.tags && p.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {p.tags.map((t, i) => (
            <li key={i} className="px-3 py-1.5 border border-neutral-800 text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-300">
              {t[lang]}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 pt-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500">{followLabel}</p>
        <PartnerLinks links={p.links} />
      </div>
    </div>
  </article>
);

/** Kolor akcentu ramki – kolor poświaty partnera z pełniejszym kryciem. */
const accentOf = (p: Partner) => (p.glow ?? 'rgba(201,162,39,.18)').replace(/,\s*[\d.]+\)\s*$/, ',0.95)');

/**
 * Ramka zdjęcia/logo: zdjęcie zawsze widoczne w całości (object-contain w stałych proporcjach),
 * podświetlana obwódka, powiększenie po najechaniu myszką, a po kliknięciu / dotknięciu
 * podgląd na pełnym ekranie (działa też na telefonach, gdzie nie ma „hover”).
 */
const ImageFrame: React.FC<{ p: Partner }> = ({ p }) => {
  const [open, setOpen] = React.useState(false);
  const accent = accentOf(p);
  const round = p.logoShape === 'photo';
  const wide = p.logoShape === 'wide';
  const radius = round ? 'rounded-full' : 'rounded-2xl';
  const innerRadius = round ? 'rounded-full' : 'rounded-[14px]';

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${p.name} – powiększ`}
        className={`group/frame relative block ${radius} p-[2px] outline-none cursor-zoom-in transition-transform duration-500 ease-out hover:scale-[1.07] focus-visible:scale-[1.07] active:scale-[0.98]`}
        style={{ width: wide ? 'min(100%, 320px)' : 'min(100%, 250px)' }}
      >
        {/* poświata za ramką */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-4 ${radius} blur-2xl opacity-40 transition-opacity duration-500 group-hover/frame:opacity-90 group-focus-visible/frame:opacity-90`}
          style={{ background: accent }}
        />
        {/* obwódka z obracającym się gradientem */}
        <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${radius} overflow-hidden`}>
          <span
            className="absolute -inset-1/2 opacity-60 transition-opacity duration-500 group-hover/frame:opacity-100 motion-safe:animate-[spin_7s_linear_infinite]"
            style={{ background: `conic-gradient(from 0deg, ${accent}, rgba(255,255,255,.06) 25%, rgba(255,255,255,.55) 50%, rgba(255,255,255,.06) 75%, ${accent})` }}
          />
        </span>
        <span
          className={`relative block ${innerRadius} overflow-hidden bg-[#050505]`}
          style={{ aspectRatio: wide ? '16 / 10' : '1 / 1' }}
        >
          <img
            src={p.logo}
            alt={`Logo ${p.name}`}
            className={`absolute inset-0 w-full h-full ${round ? 'object-cover' : wide ? 'object-contain p-4' : 'object-contain'} transition-transform duration-700 ease-out group-hover/frame:scale-[1.04]`}
            loading="lazy"
          />
          {/* połysk przy najechaniu */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/frame:opacity-100"
          />
        </span>
        <span
          aria-hidden="true"
          className={`absolute ${round ? 'bottom-3 right-3' : 'bottom-2 right-2'} flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white border border-white/15 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover/frame:opacity-100 group-focus-visible/frame:opacity-100 [@media(hover:none)]:opacity-100`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </span>
      </button>

      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={p.name}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Sluiten"
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <figure className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <img
              src={p.logo}
              alt={`Logo ${p.name}`}
              className={`max-h-[78vh] max-w-[92vw] w-auto h-auto object-contain ${round ? 'rounded-full' : 'rounded-xl'}`}
              style={{ boxShadow: `0 0 60px ${accent}` }}
            />
            <figcaption className="font-bebas text-2xl tracking-wide text-white">{p.name}</figcaption>
          </figure>
        </div>,
        document.body
      )}
    </>
  );
};

const PartnerCard: React.FC<{ p: Partner; lang: Language; stacked?: boolean }> = ({ p, lang, stacked }) => {
  const body = (
    <>
      <p className="text-sm text-neutral-400 leading-relaxed max-w-[62ch]">{p.description[lang]}</p>
      {p.tags && p.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {p.tags.map((t, i) => (
            <li key={i} className="px-3 py-1.5 border border-neutral-800 text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-300">
              {t[lang]}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-1">
        <PartnerLinks links={p.links} />
      </div>
    </>
  );

  if (p.logoShape === 'wide' || p.logoShape === 'square' || p.logoShape === 'photo') {
    return (
      <article className={`grid grid-cols-1 border border-neutral-800 bg-[#0B0B0B] ${stacked ? 'grid-rows-[auto_1fr]' : 'md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]'}`}>
        <div className={`relative flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12 bg-[#080808] border-b border-neutral-800 overflow-hidden ${stacked ? 'min-h-[350px]' : 'md:border-b-0 md:border-r'}`}>
          <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 50% 50%, ${p.glow ?? 'rgba(201,162,39,.18)'}, transparent 65%)` }} />
          <ImageFrame p={p} />
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8 min-w-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D71920]">{p.role[lang]}</p>
            <h3 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide leading-none mt-1">{p.name}</h3>
          </div>
          {body}
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-5 p-6 border border-neutral-800 bg-[#0B0B0B]">
      <div className="flex items-center gap-4">
        <img src={p.logo} alt={`Logo ${p.name}`} className="w-16 h-16 rounded-full object-cover bg-[#050505] border border-neutral-800" loading="lazy" />
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D71920]">{p.role[lang]}</p>
          <h3 className="font-bebas text-2xl text-white tracking-wide leading-tight">{p.name}</h3>
        </div>
      </div>
      {body}
    </article>
  );
};

/** Nagłówek sekcji – litery wjeżdżają, gdy sekcja pojawi się na ekranie */
const RevealTitle: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [ref, inView] = useInView<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={className}>
      {inView ? <KineticText text={text} stagger={26} /> : <span className="opacity-0">{text}</span>}
    </h2>
  );
};

/** rgba(...)/#hex → #rrggbb (kolor tła WebGL) */
const toHex = (c: string) => {
  const m = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return c.startsWith('#') ? c : '#D71920';
  return '#' + [m[1], m[2], m[3]].map(v => Number(v).toString(16).padStart(2, '0')).join('');
};

/**
 * Partner przypięty do ekranu (komputer): logo w obracającym się, świecącym pierścieniu
 * wyrasta na środku na żywym tle WebGL, potem odsuwa się w bok, a opis wyłania się z rozmycia.
 * Kolor = kolor partnera; Marris Gym (hoofdpartner) ma pierścień w barwach NL.
 */
const PartnerPinned: React.FC<{
  p: Partner;
  lang: Language;
  followLabel: string;
  side: 'left' | 'right';
  heightVh: number;
  index?: string;
  nl?: boolean;
  /** telefon: logo odpływa do góry, opis wyłania się od dołu (zamiast na boki) */
  compact?: boolean;
}> = ({ p, lang, followLabel, side, heightVh, index, nl, compact }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const stage = useRef<ShaderStageHandle>(null);
  const accent = nl ? '#D71920' : toHex(accentOf(p));
  const dir = side === 'left' ? -1 : 1; // w którą stronę odsuwa się logo
  const round = p.logoShape === 'photo' || nl;
  const wide = p.logoShape === 'wide';
  const radius = round ? 'rounded-full' : 'rounded-[28px]';

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    let pS = -1;
    let last = 0;
    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const k = 1 - Math.pow(1 - 0.12, dt * 60);
      const rect = el.getBoundingClientRect();
      const total = Math.max(el.offsetHeight - window.innerHeight, 1);
      const pT = clamp(-rect.top / total);
      pS = pS < 0 ? pT : pS + (pT - pS) * k;
      const pp = pS;
      const t = easeInOut(clamp(pp / (compact ? 0.4 : 0.45)));
      const x = compact ? 0 : lerp(0, 22 * dir, t);
      const sh = sticky.current?.offsetHeight || window.innerHeight;
      const y = compact ? lerp(0, -0.33 * sh, t) : 0;
      const sc = compact ? lerp(1.12, 0.56, t) : lerp(1.3, 0.92, t);
      const ry = lerp(-28 * dir, 0, easeOut(clamp(pp / 0.35)));
      if (logo.current) logo.current.style.transform = `translate3d(${x}vw, ${y}px, 0) perspective(1000px) rotateY(${ry}deg) scale(${sc})`;
      if (ring.current) ring.current.style.transform = `rotate(${pp * 300}deg)`;
      const o = easeOut(clamp((pp - (compact ? 0.3 : 0.28)) / 0.25));
      if (text.current) {
        text.current.style.opacity = String(o);
        text.current.style.transform = compact ? `translate3d(0, ${(1 - o) * 70}px, 0)` : `translate3d(${(1 - o) * -80 * dir}px, -50%, 0)`;
        text.current.style.filter = o > 0.98 ? 'none' : `blur(${(1 - o) * 12}px)`;
        text.current.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
      }
      if (big.current) big.current.style.transform = `translate3d(${dir < 0 ? lerp(12, -55, pp) : lerp(-55, 12, pp)}%, -50%, 0)`;
      stage.current?.set({ focusX: 0.5 + x / 100, focusY: compact ? 0.5 - (0.33 * t) : 0.5, intensity: 0.55 + 0.5 * pp });
      if (running) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }, { rootMargin: '20% 0px' });
    io.observe(el);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, [dir, compact]);

  const ringBg = nl
    ? 'conic-gradient(from 200deg, #AE1C28, #f4f4f4, #21468B, #AE1C28)'
    : `conic-gradient(from 0deg, ${accent}, rgba(255,255,255,.08) 25%, rgba(255,255,255,.75) 50%, rgba(255,255,255,.08) 75%, ${accent})`;
  const glowBg = nl
    ? 'radial-gradient(circle at 30% 30%, rgba(215,25,32,.55), transparent 60%), radial-gradient(circle at 70% 75%, rgba(33,70,139,.6), transparent 60%)'
    : `radial-gradient(circle, ${accent}99, transparent 65%)`;
  const box = compact
    ? wide
      ? { width: 'min(80vw, 360px)', height: 'min(50vw, 225px)' }
      : { width: 'min(64vw, 38svh, 300px)', height: 'min(64vw, 38svh, 300px)' }
    : wide
    ? { width: 'min(64vh, 560px)', height: 'min(40vh, 350px)' }
    : { width: 'min(46vh, 420px)', height: 'min(46vh, 420px)' };

  return (
    <div ref={wrap} className="relative border-b border-neutral-900" style={{ height: `${heightVh}vh` }}>
      <div ref={sticky} className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(ellipse 55% 55% at ${dir < 0 ? 40 : 60}% 50%, ${accent}40, transparent 70%)` }} />
        <div aria-hidden className="absolute inset-0">
          <ShaderStage ref={stage} color={accent} mode="story" />
        </div>
        <div
          ref={big}
          aria-hidden
          className="oct-outline-text pointer-events-none absolute left-0 top-1/2 whitespace-nowrap font-bebas leading-none"
          style={{ fontSize: compact ? 'min(44vw, 26svh)' : 'clamp(160px, 26vw, 400px)', transform: 'translate3d(12%, -50%, 0)', willChange: 'transform' }}
        >
          {p.name.toUpperCase()} · {p.name.toUpperCase()}
        </div>

        {/* Logo w obracającym się pierścieniu */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={logo} className="relative" style={{ ...box, willChange: 'transform' }}>
            <div aria-hidden className={`absolute -inset-10 ${radius} opacity-80 blur-3xl`} style={{ background: glowBg }} />
            <span aria-hidden className={`absolute inset-0 overflow-hidden ${radius}`}>
              <span ref={ring} className="absolute -inset-1/2" style={{ background: ringBg, willChange: 'transform' }} />
            </span>
            <div className={`absolute inset-[4px] overflow-hidden bg-[#050505] ${round ? 'rounded-full p-2' : 'rounded-[24px]'}`}>
              <img
                src={p.logo}
                alt={`Logo ${p.name}`}
                className={`h-full w-full ${round ? 'rounded-full object-cover' : wide ? 'object-contain p-6' : 'object-contain'}`}
              />
            </div>
          </div>
        </div>

        {/* Opis */}
        <div
          ref={text}
          className={compact ? 'absolute inset-x-5 top-[31%] bottom-[3%] flex flex-col justify-center space-y-3' : `absolute top-1/2 w-[min(540px,44vw)] space-y-5 ${dir < 0 ? 'right-[5vw]' : 'left-[5vw]'}`}
          style={{ opacity: 0, transform: compact ? 'translate3d(0,70px,0)' : `translate3d(${-80 * dir}px,-50%,0)`, willChange: 'transform, opacity, filter' }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: nl ? '#D71920' : `${accent}cc`, color: nl ? '#fff' : '#050505' }}>
              {p.role[lang]}
            </span>
            {index && <span className="font-mono text-[11px] tracking-[0.3em] text-neutral-500">{index}</span>}
          </div>
          <h3 className={`font-bebas leading-[0.9] tracking-wide text-white ${compact ? 'text-[clamp(36px,11vw,52px)] [overflow-wrap:anywhere]' : 'text-6xl xl:text-7xl'}`} style={{ textShadow: `0 0 40px ${accent}55` }}>{p.name}</h3>
          <p className={compact ? 'text-[13px] leading-relaxed text-neutral-200 [text-shadow:0_1px_8px_#000]' : 'text-sm leading-relaxed text-neutral-300 xl:text-base'}>{p.description[lang]}</p>
          {p.tags && p.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {p.tags.map((tg, i) => (
                <li key={i} className={`border border-white/15 bg-black/30 font-condensed font-bold ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} uppercase tracking-wider text-neutral-200 backdrop-blur-sm`}>{tg[lang]}</li>
              ))}
            </ul>
          )}
          <div className={compact ? 'space-y-2' : 'space-y-3 pt-1'}>
            {!compact && <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">{followLabel}</p>}
            <PartnerLinks links={p.links} icons={compact} />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Hero z parallaxą: zdjęcie przybliża się i przesuwa, tekst odpływa przy przewijaniu */
const useHeroParallax = () => {
  const section = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const h = el.offsetHeight;
      const pp = clamp(window.scrollY / Math.max(h, 1));
      if (pp >= 1) return;
      if (img.current) img.current.style.transform = `translate3d(0, ${pp * 18}%, 0) scale(${1.06 + pp * 0.22})`;
      if (content.current) {
        content.current.style.transform = `translate3d(0, ${-pp * 140}px, 0)`;
        content.current.style.opacity = String(1 - pp * 1.25);
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return { section, img, content };
};

export const PartnersPage: React.FC = () => {
  const { language, navigate } = useStore();
  const lang = language as Language;
  const c = (k: string) => COPY[k][lang];
  const vw = useViewportWidth();
  // każdy partner ma przypiętą scenę jak Marris Gym – na komputerze logo odsuwa się w bok,
  // na telefonie/tablecie w pionie do góry (compact). Przy „ogranicz ruch” – zwykłe karty.
  const compact = vw < 1024;
  const pinned = !prefersReducedMotion();
  const pinH = (d: number) => (compact ? Math.round(d * 0.8) : d);
  const hero = useHeroParallax();

  React.useEffect(() => {
    document.title = `${c('eyebrow')} | OctagonSportNL`;
  }, [lang]);

  const featured = PARTNERS.filter(p => p.featured);
  const others = PARTNERS.filter(p => !p.featured);
  const allNames = [...PARTNERS, ...INFLUENCERS].map(p => p.name);

  return (
    <div className="bg-[#050505] text-white">
      <ScrollProgress />

      {/* HERO – zdjęcie grupowe z treningu (parallax) */}
      <section ref={hero.section} className="relative overflow-hidden border-b border-neutral-800">
        <img
          ref={hero.img}
          src={PARTNERS_HERO_IMAGE}
          alt={c('caption')}
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          style={{ transform: 'scale(1.06)', willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-[#050505]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />

        <div ref={hero.content} className="relative mx-auto max-w-7xl px-4 pt-48 pb-12 sm:px-6 sm:pt-72 sm:pb-16 lg:pt-96" style={{ willChange: 'transform, opacity' }}>
          <p className="oct-rise mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-[#D71920]">
            <span className="h-px w-8 bg-[#D71920]" />
            {c('eyebrow')}
          </p>
          <h1 className="max-w-4xl font-bebas text-6xl leading-[0.85] tracking-wide sm:text-8xl lg:text-9xl">
            <KineticText text={c('title')} stagger={40} delay={150} />
          </h1>
          <div className="oct-rise mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" style={{ animationDelay: '700ms' }}>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-200 sm:text-base">{c('lead')}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{c('caption')}</p>
          </div>
        </div>
      </section>

      {/* HOOFDPARTNER – przypięty na komputerze, zwykły wjazd na telefonie */}
      {featured.map(p =>
        pinned ? (
          <PartnerPinned key={p.id} p={p} lang={lang} followLabel={c('follow')} side="left" heightVh={pinH(260)} compact={compact} nl />
        ) : (
          <section key={p.id} className="mx-auto max-w-7xl border-b border-neutral-900 px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <FeaturedPartner p={p} lang={lang} followLabel={c('follow')} />
            </Reveal>
          </section>
        )
      )}

      {/* Paski z nazwami – reagują na tempo przewijania */}
      <section aria-hidden className="relative overflow-hidden border-b border-neutral-900 py-8 sm:py-12">
        <VelocityMarquee items={allNames} className="text-6xl text-white sm:text-8xl" />
        <VelocityMarquee items={[...allNames].reverse()} direction={-1} outline className="mt-2 text-6xl sm:text-8xl" />
      </section>

      {pinned ? (
        <>
          {/* KOMPUTER: każdy partner i twórca – przypięta scena jak Marris Gym */}
          {others.length > 0 && (
            <>
              <div className="mx-auto max-w-7xl px-4 pt-16 pb-6 sm:px-6 sm:pt-20">
                <RevealTitle text={c('partnersTitle')} className="font-bebas text-5xl tracking-wide sm:text-6xl" />
              </div>
              {others.map((p, i) => (
                <PartnerPinned
                  key={p.id}
                  p={p}
                  lang={lang}
                  followLabel={c('follow')}
                  side={i % 2 === 0 ? 'right' : 'left'}
                  heightVh={pinH(210)}
                  compact={compact}
                  index={`${String(i + 1).padStart(2, '0')} / ${String(others.length).padStart(2, '0')}`}
                />
              ))}
            </>
          )}
          <div className="mx-auto max-w-7xl px-4 pt-16 pb-6 sm:px-6 sm:pt-20">
            <RevealTitle text={c('influencersTitle')} className="font-bebas text-5xl tracking-wide sm:text-6xl" />
          </div>
          {INFLUENCERS.map((p, i) => (
            <PartnerPinned
              key={p.id}
              p={p}
              lang={lang}
              followLabel={c('follow')}
              side={i % 2 === 0 ? 'right' : 'left'}
              heightVh={pinH(210)}
              compact={compact}
              index={`${String(i + 1).padStart(2, '0')} / ${String(INFLUENCERS.length).padStart(2, '0')}`}
            />
          ))}
        </>
      ) : (
        <>
      {/* POZOSTALI PARTNERZY BIZNESOWI */}
      {others.length > 0 && (
        <section className="mx-auto max-w-7xl border-b border-neutral-900 px-4 py-16 sm:px-6 sm:py-20">
          <RevealTitle text={c('partnersTitle')} className="mb-8 font-bebas text-4xl tracking-wide sm:text-6xl" />
          <div className={`grid grid-cols-1 gap-5 ${others.length > 1 ? 'md:grid-cols-2' : ''} ${others.length === 3 || others.length > 4 ? 'xl:grid-cols-3' : ''}`}>
            {others.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 120} className="grid">
                <TiltCard glow={accentOf(p).replace(/[\d.]+\)$/, '0.35)')} className="grid">
                  <PartnerCard p={p} lang={lang} stacked={others.length > 1} />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* INFLUENCERZY / ZAWODNICY */}
      <section className="mx-auto max-w-7xl border-b border-neutral-900 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <RevealTitle text={c('influencersTitle')} className="font-bebas text-4xl tracking-wide sm:text-6xl" />
          {INFLUENCERS.length === 0 && (
            <span className="border border-neutral-800 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              {c('soon')}
            </span>
          )}
        </div>
        {INFLUENCERS.length > 0 ? (
          <div className={`grid grid-cols-1 gap-5 ${INFLUENCERS.length > 1 ? 'md:grid-cols-2' : ''} ${INFLUENCERS.length === 3 || INFLUENCERS.length > 4 ? 'xl:grid-cols-6' : ''}`}>
            {INFLUENCERS.map((p, i) => (
              <Reveal
                key={p.id}
                delay={(i % 3) * 120}
                className={`grid ${
                  INFLUENCERS.length === 3 || INFLUENCERS.length > 4
                    ? // 3 kolumny (siatka 6 × span 2); niepełny ostatni rząd wyśrodkowany
                      `xl:col-span-2 ${
                        INFLUENCERS.length % 3 === 1 && i === INFLUENCERS.length - 1
                          ? 'xl:col-start-3'
                          : INFLUENCERS.length % 3 === 2 && i === INFLUENCERS.length - 2
                          ? 'xl:col-start-2'
                          : ''
                      }`
                    : ''
                }`}
              >
                <TiltCard glow={accentOf(p).replace(/[\d.]+\)$/, '0.35)')} className="grid">
                  <PartnerCard p={p} lang={lang} stacked={INFLUENCERS.length > 1} />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 border border-dashed border-neutral-800 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#141414]">
              <Users className="h-5 w-5 text-[#D71920]" />
            </span>
            <p className="max-w-[70ch] text-sm leading-relaxed text-neutral-400">{c('influencersEmpty')}</p>
          </div>
        )}
      </section>

        </>
      )}

      {/* CTA + formularz współpracy */}
      <section id="samenwerken" className="mx-auto max-w-7xl border-t border-neutral-900 px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="min-w-0 lg:sticky lg:top-28">
            <RevealTitle text={c('ctaTitle')} className="font-bebas text-5xl leading-none tracking-wide sm:text-7xl" />
            <Reveal delay={150}>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">{c('ctaText')}</p>
              <ul className="mt-6 space-y-2 text-sm text-neutral-300">
                {(lang === 'pl'
                  ? ['Sprzęt i odzież Octagon dla klubów i drużyn', 'Współpraca z zawodnikami, trenerami i twórcami', 'Wspólne akcje, gale i wydarzenia']
                  : lang === 'en'
                  ? ['Octagon gear and apparel for clubs and teams', 'Collaborations with fighters, coaches and creators', 'Joint campaigns, fight nights and events']
                  : ['Octagon-gear en kleding voor clubs en teams', 'Samenwerkingen met vechters, trainers en creators', 'Samen acties, gala’s en evenementen']
                ).map(item => (
                  <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#D71920]" aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/clubs')}
                className="mt-6 inline-flex items-center gap-2 font-condensed text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-white"
              >
                {c('ctaClubs')} <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>
          <Reveal delay={250}>
            <PartnerForm lang={lang} />
          </Reveal>
        </div>
      </section>
    </div>
  );
};
