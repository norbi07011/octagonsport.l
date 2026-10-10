import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SHOP_VIDEOS, ShopVideo } from '../../data/videos';

type L = 'nl' | 'en' | 'pl';

/** Ścieżka do pliku z /public (w podglądzie – względem adresu podglądu). */
const asset = (path?: string) => {
  if (!path) return undefined;
  const base = typeof window !== 'undefined' ? (window as any).__PREVIEW_BASE__ : undefined;
  return base ? base + path.replace(/^\//, '') : path;
};

const COPY = {
  eyebrow: { nl: 'Octagon in actie', en: 'Octagon in action', pl: 'Octagon w akcji' },
  title1: { nl: 'Getest', en: 'Tested', pl: 'Sprawdzone' },
  title2: { nl: 'op de mat', en: 'on the mat', pl: 'na macie' },
  lead: {
    nl: 'Echte trainingen, echte vechters. Onze partners van Marris Gym en Patryk MMA trainen dagelijks in Octagon-gear – handschoenen, scheenbeschermers, shorts en rashguards die elke sessie aankunnen.',
    en: 'Real training, real fighters. Our partners at Marris Gym and Patryk MMA train in Octagon gear every day – gloves, shin guards, shorts and rashguards built for every session.',
    pl: 'Prawdziwe treningi, prawdziwi zawodnicy. Nasi partnerzy z Marris Gym i Patryk MMA trenują na co dzień w sprzęcie Octagon – rękawicach, ochraniaczach, spodenkach i rashguardach, które wytrzymają każdy trening.',
  },
  shop: { nl: 'Shop fight gear', en: 'Shop fight gear', pl: 'Kup sprzęt' },
  partners: { nl: 'Onze partners', en: 'Our partners', pl: 'Nasi partnerzy' },
  soundOn: { nl: 'Geluid aan', en: 'Sound on', pl: 'Włącz dźwięk' },
  soundOff: { nl: 'Geluid uit', en: 'Sound off', pl: 'Wycisz' },
  play: { nl: 'Afspelen', en: 'Play', pl: 'Odtwórz' },
  pause: { nl: 'Pauzeren', en: 'Pause', pl: 'Zatrzymaj' },
  prev: { nl: 'Vorige video', en: 'Previous video', pl: 'Poprzedni film' },
  next: { nl: 'Volgende video', en: 'Next video', pl: 'Następny film' },
  swipe: { nl: 'Swipe voor meer', en: 'Swipe for more', pl: 'Przesuń, aby zobaczyć więcej' },
};

const VideoCard: React.FC<{
  v: ShopVideo;
  lang: L;
  index: number;
  unmuted: number | null;
  setUnmuted: (i: number | null) => void;
}> = ({ v, lang, index, unmuted, setUnmuted }) => {
  const ref = React.useRef<HTMLVideoElement>(null);
  const userPaused = React.useRef(false);
  const visible = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);
  const muted = unmuted !== index;

  // Auto-odtwarzanie tylko gdy film jest widoczny (także w poziomie w karuzeli)
  // i gdy użytkownik sam go nie zatrzymał.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting && !userPaused.current) el.play().catch(() => {});
        if (!e.isIntersecting) el.pause();
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (ref.current) ref.current.muted = muted;
    // włączenie dźwięku = użytkownik chce oglądać → wznów
    if (!muted && ref.current?.paused) {
      userPaused.current = false;
      ref.current.play().catch(() => {});
    }
  }, [muted]);

  const togglePlay = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  return (
    <figure className="group relative">
      {/* poświata */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[28px] bg-[#D71920] opacity-20 blur-2xl transition-opacity duration-700 group-hover:opacity-40"
      />
      {/* ramka z gradientem */}
      <div className="relative rounded-[22px] p-[2px] bg-gradient-to-b from-white/40 via-[#D71920]/70 to-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] transition-transform duration-700 ease-out lg:group-hover:-translate-y-1.5">
        <div className="relative overflow-hidden rounded-[20px] bg-black aspect-[9/16]">
          <video
            ref={ref}
            src={asset(v.src)}
            poster={asset(v.poster)}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
            className="absolute inset-0 h-full w-full cursor-pointer object-cover"
            aria-label={`${v.title[lang]} – ${v.subtitle}`}
          />
          {/* przyciemnienie u góry i u dołu */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />

          {/* duży przycisk Play, gdy film stoi */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={COPY.play[lang]}
            className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#D71920] ${
              playing ? 'pointer-events-none scale-90 opacity-0' : 'opacity-100'
            }`}
          >
            <Play className="ml-1 h-7 w-7" />
          </button>

          {/* etykieta LIVE */}
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              {playing && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D71920] opacity-75" />}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D71920]" />
            </span>
            Training
          </div>

          {/* sterowanie: pauza + dźwięk */}
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? COPY.pause[lang] : COPY.play[lang]}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setUnmuted(muted ? index : null)}
              aria-label={muted ? COPY.soundOn[lang] : COPY.soundOff[lang]}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* podpis */}
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <p className="font-bebas text-2xl leading-none tracking-wide text-white">{v.title[lang]}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-neutral-300">{v.subtitle}</p>
          </figcaption>
        </div>
      </div>
    </figure>
  );
};

export const TrainingVideos: React.FC = () => {
  const { language, navigate } = useStore();
  const lang = (language === 'pl' || language === 'en' ? language : 'nl') as L;
  const [unmuted, setUnmuted] = React.useState<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  // Który film jest na środku + czy można przewijać w lewo/prawo
  const update = React.useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const cards = Array.from(t.children) as HTMLElement[];
    const center = t.scrollLeft + t.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
    setCanPrev(t.scrollLeft > 4);
    setCanNext(t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    update();
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      t.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollToCard = (i: number) => {
    const t = trackRef.current;
    const c = t?.children[i] as HTMLElement | undefined;
    if (!t || !c) return;
    t.scrollTo({ left: c.offsetLeft - (t.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  };
  const step = (dir: 1 | -1) => scrollToCard(Math.min(SHOP_VIDEOS.length - 1, Math.max(0, active + dir)));
  const scrollable = canPrev || canNext;

  return (
    <section className="relative overflow-hidden border-y border-neutral-800 bg-[#060606] py-16 md:py-24">
      {/* tło: delikatna siatka i czerwona poświata */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '56px 56px' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[#D71920] opacity-[0.12] blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* tekst */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D71920]">{COPY.eyebrow[lang]}</p>
          <h2 className="mt-3 font-bebas text-5xl leading-[0.9] tracking-wide text-white sm:text-6xl lg:text-7xl">
            {COPY.title1[lang]}
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_#fff]">{COPY.title2[lang]}</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">{COPY.lead[lang]}</p>
          <div className="mt-8 hidden flex-col gap-3 sm:flex-row lg:flex">
            <button
              type="button"
              onClick={() => navigate('/category/fight-gear')}
              className="inline-flex items-center justify-center gap-2 bg-[#D71920] px-6 py-3.5 font-condensed text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b51319]"
            >
              {COPY.shop[lang]} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/partners')}
              className="inline-flex items-center justify-center gap-2 border border-neutral-700 px-6 py-3.5 font-condensed text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
            >
              {COPY.partners[lang]}
            </button>
          </div>
        </div>

        {/* karuzela filmów – przesuwana palcem (scroll-snap), na komputerze strzałkami */}
        <div className="min-w-0">
          <div
            ref={trackRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={COPY.eyebrow[lang]}
            className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-[16vw] pb-6 pt-4 sm:-mx-6 sm:gap-6 sm:px-6 lg:mx-0 lg:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${scrollable ? 'lg:[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]' : ''}`}
          >
            {SHOP_VIDEOS.map((v, i) => (
              <div
                key={v.src}
                className={`w-[68vw] max-w-[300px] shrink-0 snap-center sm:w-[260px] lg:w-[250px] ${i % 2 === 1 ? 'lg:mt-14' : ''}`}
              >
                <VideoCard v={v} lang={lang} index={i} unmuted={unmuted} setUnmuted={setUnmuted} />
              </div>
            ))}
          </div>

          {/* kropki + strzałki */}
          {SHOP_VIDEOS.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-4 lg:justify-start lg:px-2">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={!canPrev}
                aria-label={COPY.prev[lang]}
                className={`hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:border-white disabled:cursor-default disabled:opacity-30 sm:flex ${scrollable ? '' : 'lg:hidden'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {SHOP_VIDEOS.map((v, i) => (
                  <button
                    key={v.src}
                    type="button"
                    onClick={() => scrollToCard(i)}
                    aria-label={`${i + 1} / ${SHOP_VIDEOS.length}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-[#D71920]' : 'w-3 bg-neutral-700 hover:bg-neutral-500'} ${scrollable ? '' : 'lg:hidden'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={!canNext}
                aria-label={COPY.next[lang]}
                className={`hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:border-white disabled:cursor-default disabled:opacity-30 sm:flex ${scrollable ? '' : 'lg:hidden'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
          {SHOP_VIDEOS.length > 1 && (
            <p className="mt-3 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 sm:hidden">
              ← {COPY.swipe[lang]} →
            </p>
          )}
        </div>

        {/* przyciski pod karuzelą na telefonie/tablecie */}
        <div className="flex flex-col gap-3 sm:flex-row lg:hidden">
          <button
            type="button"
            onClick={() => navigate('/category/fight-gear')}
            className="inline-flex items-center justify-center gap-2 bg-[#D71920] px-6 py-3.5 font-condensed text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b51319]"
          >
            {COPY.shop[lang]} <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/partners')}
            className="inline-flex items-center justify-center gap-2 border border-neutral-700 px-6 py-3.5 font-condensed text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
          >
            {COPY.partners[lang]}
          </button>
        </div>
      </div>
    </section>
  );
};
