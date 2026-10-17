import React, { useEffect, useRef } from 'react';
import { BrandMark } from '../components/layout/BrandMark';
import { useStore } from '../context/StoreContext';
import { HERO_IMAGE, BOXING_GLOVES_IMAGE, RASHGUARD_IMAGE, ARENA_BANNER_IMAGE } from '../data/productImages';
import { PRODUCTS } from '../data/products';
import { PARTNERS, INFLUENCERS } from '../data/partners';
import { Reveal, CountUp, useInView } from '../components/fx/ScrollFx';
import { KineticText } from '../components/fx/Kinetic';
import { clamp, prefersReducedMotion } from '../lib/motion';

/** Zdjęcie odsłaniane „kurtyną” przy pojawieniu się na ekranie */
const WipeImage: React.FC<{ src: string; alt: string; from?: 'left' | 'right' }> = ({ src, alt, from = 'left' }) => {
  const [ref, inView] = useInView<HTMLDivElement>();
  // obserwujemy ramkę zewnętrzną – element całkowicie zasłonięty clip-path przeglądarka uznaje za niewidoczny
  return (
    <div ref={ref} className="aspect-[4/3]">
      <div
        className="h-full w-full overflow-hidden border border-neutral-800 bg-neutral-900"
        style={{
          clipPath: inView ? 'inset(0 0 0 0)' : from === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
          transition: 'clip-path 1.3s cubic-bezier(.77,0,.18,1)',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ transform: inView ? 'scale(1)' : 'scale(1.25)', transition: 'transform 1.8s cubic-bezier(.16,1,.3,1)' }}
        />
      </div>
    </div>
  );
};

/** Proces zamówienia – linia rysuje się przy przewijaniu */
const ProcessLine: React.FC<{ steps: { title: string; text: string }[] }> = ({ steps }) => {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = box.current;
      if (!el || !line.current) return;
      const r = el.getBoundingClientRect();
      const p = prefersReducedMotion() ? 1 : clamp((window.innerHeight * 0.7 - r.top) / r.height);
      line.current.style.transform = `scaleY(${p})`;
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((d, i) => {
        d.dataset.on = p >= (i + 0.2) / steps.length ? '1' : '0';
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, [steps.length]);
  return (
    <div ref={box} className="relative mx-auto max-w-3xl pl-10 sm:pl-14">
      <div className="absolute left-3 top-0 h-full w-[2px] bg-neutral-800 sm:left-5" />
      <div ref={line} className="absolute left-3 top-0 h-full w-[2px] origin-top bg-[#D71920] sm:left-5" style={{ transform: 'scaleY(0)', boxShadow: '0 0 12px #D71920' }} />
      <ol className="space-y-12">
        {steps.map((st, i) => (
          <li key={st.title} data-step className="group relative">
            <span className="absolute -left-10 top-0 grid h-8 w-8 place-items-center rounded-full border-2 border-neutral-700 bg-[#050505] font-mono text-xs text-neutral-400 transition-all duration-500 group-data-[on='1']:scale-110 group-data-[on='1']:border-[#D71920] group-data-[on='1']:text-white group-data-[on='1']:shadow-[0_0_20px_rgba(215,25,32,.7)] sm:-left-[3.2rem]">
              {i + 1}
            </span>
            <p className="font-bebas text-3xl tracking-wide text-neutral-500 transition-colors duration-500 group-data-[on='1']:text-white sm:text-4xl">{st.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-400">{st.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
import { Shield, Award, Users, Flame, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate, language, t } = useStore();
  const L = (nl: string, en: string, pl: string) => (language === 'pl' ? pl : language === 'en' ? en : nl);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImg = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = heroRef.current?.offsetHeight || 1;
      const p = clamp(window.scrollY / h);
      if (heroImg.current) heroImg.current.style.transform = `translate3d(0, ${p * 20}%, 0) scale(${1.08 + p * 0.2})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  const pillarTranslations = {
    indestructible: {
      title: language === 'pl' ? 'SOLIDNE WYKONANIE' : language === 'en' ? 'BUILT TO LAST' : 'STEVIG GEMAAKT',
      desc: language === 'pl' ? 'Sprzęt i odzież do regularnych, intensywnych treningów.' : language === 'en' ? 'Gear and apparel made for regular, intense training.' : 'Uitrusting en kleding voor regelmatige, intensieve training.'
    },
    clubs: {
      title: language === 'pl' ? 'DLA KLUBÓW' : language === 'en' ? 'FOR CLUBS' : 'VOOR CLUBS',
      desc: language === 'pl' ? 'Oferta dla klubów i drużyn na zapytanie.' : language === 'en' ? 'Offers for clubs and teams on request.' : 'Aanbod voor clubs en teams op aanvraag.'
    },
    fightReady: {
      title: language === 'pl' ? 'SZYTE W POLSCE' : language === 'en' ? 'MADE IN POLAND' : 'GEMAAKT IN POLEN',
      desc: language === 'pl' ? 'Wiele modeli odzieży jest w całości produkowanych w Polsce.' : language === 'en' ? 'Many apparel models are fully produced in Poland.' : 'Veel kledingmodellen worden volledig in Polen geproduceerd.'
    },
    team: {
      title: language === 'pl' ? 'W HOLANDII' : language === 'en' ? 'IN THE NETHERLANDS' : 'IN NEDERLAND',
      desc: language === 'pl' ? 'Sklep i obsługa klienta w Holandii.' : language === 'en' ? 'Shop and customer service in the Netherlands.' : 'Webshop en klantenservice in Nederland.'
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Hero */}
      <div ref={heroRef} className="relative py-28 sm:py-36 px-4 sm:px-6 overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 z-0">
          <img
            ref={heroImg}
            src={ARENA_BANNER_IMAGE}
            alt="Octagon – Marris Gym"
            className="w-full h-full object-cover filter brightness-50"
            style={{ transform: 'scale(1.08)', willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <BrandMark className="w-14 h-14 mx-auto mb-5" alt="Octagon" />
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-2">
            {t('about.tag')}
          </span>
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white uppercase leading-none">
            <KineticText text={t('about.title')} stagger={35} delay={150} />
          </h1>
          <p className="mt-6 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-body">
            {t('about.lead')}
          </p>
        </div>
      </div>

      {/* Liczby – nabijają się przy pojawieniu */}
      <div className="border-b border-neutral-800 bg-[#080808]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { to: Math.floor(PRODUCTS.length / 50) * 50, suffix: '+', label: L('Producten', 'Products', 'Produktów') },
            { to: 6, suffix: '', label: L('Categorieën', 'Categories', 'Kategorii') },
            { to: PARTNERS.length + INFLUENCERS.length, suffix: '', label: L('Partners & creators', 'Partners & creators', 'Partnerów i twórców') },
            { to: 14, suffix: L(' dagen', ' days', ' dni'), label: L('Bedenktijd', 'Right of withdrawal', 'Na zwrot') },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 100}>
              <p className="font-bebas text-5xl leading-none text-white sm:text-6xl">
                <CountUp to={c.to} suffix={c.suffix} />
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#D71920]">{c.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Cinematic Story Chapters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Chapter 01: Durability & Material */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Reveal className="space-y-4">
            <span className="text-xs font-mono text-[#D71920] uppercase tracking-widest">
              {t('about.ch1Tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('about.ch1Title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-body">
              {t('about.ch1Desc')}
            </p>
          </Reveal>
          <WipeImage src={BOXING_GLOVES_IMAGE} alt="Quality craftsmanship" from="right" />
        </div>

        {/* Chapter 02: Culture & Streetwear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1"><WipeImage src={RASHGUARD_IMAGE} alt="Streetwear & Combat" /></div>
          <Reveal className="order-1 md:order-2 space-y-4">
            <span className="text-xs font-mono text-[#D71920] uppercase tracking-widest">
              {t('about.ch2Tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('about.ch2Title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-body">
              {t('about.ch2Desc')}
            </p>
          </Reveal>
        </div>

        {/* Chapter 03: Community */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Reveal className="space-y-4">
            <span className="text-xs font-mono text-[#D71920] uppercase tracking-widest">
              {t('about.ch3Tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('about.ch3Title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-body">
              {t('about.ch3Desc')}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/category/fight-gear')}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{t('about.cta')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
          <WipeImage src={HERO_IMAGE} alt="Community" from="right" />
        </div>

        {/* Jak to działa – linia rysuje się przy przewijaniu */}
        <div className="border-t border-neutral-800 pt-16">
          <Reveal>
            <h2 className="mb-10 text-center font-bebas text-5xl tracking-wide text-white sm:text-6xl">{L('Zo werkt het', 'How it works', 'Jak to działa')}</h2>
          </Reveal>
          <ProcessLine
            steps={[
              { title: L('Kies je gear', 'Choose your gear', 'Wybierz sprzęt'), text: L('Bestel online en betaal veilig met iDEAL, Bancontact, kaart of Klarna.', 'Order online and pay securely with iDEAL, Bancontact, card or Klarna.', 'Zamów online i zapłać bezpiecznie przez iDEAL, Bancontact, kartę lub Klarna.') },
              { title: L('Wij verwerken je bestelling', 'We process your order', 'Realizujemy zamówienie'), text: L('Je krijgt een bevestiging per e-mail en wij gaan direct voor je aan de slag.', 'You receive a confirmation by e-mail and we get started right away.', 'Dostajesz potwierdzenie e-mailem, a my od razu zabieramy się do pracy.') },
              { title: L('Levering in Nederland', 'Delivery in the Netherlands', 'Dostawa w Holandii'), text: L('Binnen 7–10 werkdagen bij jou thuis. Gratis verzending vanaf €99.', 'At your door within 7–10 business days. Free shipping from €99.', 'U Ciebie w 7–10 dni roboczych. Darmowa dostawa od 99 €.') },
              { title: L('14 dagen bedenktijd', '14-day right of withdrawal', '14 dni na zwrot'), text: L('Past het niet? Je hebt 14 dagen om je aankoop te retourneren.', 'Not the right fit? You have 14 days to return your purchase.', 'Nie pasuje? Masz 14 dni na zwrot.') },
            ]}
          />
        </div>

        {/* Verified Direct Supplier Contract Banner */}
        <div className="bg-gradient-to-r from-[#140607] via-[#0E0E0E] to-[#120506] border border-[#D71920]/40 p-6 sm:p-8 rounded flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D71920] font-bold flex items-center gap-2">
              <Award className="w-4 h-4" />
              {language === 'pl' ? 'OFICJALNY KONTRAKT DYSTRYBUCYJNY' : language === 'en' ? 'OFFICIAL WHOLESALE & DISTRIBUTION CONTRACT' : 'OFFICIEEL LEVERINGSCONTRACT MET POLEN'}
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white">
              OCTAGON POLSKA (OCTAGONSHOP.PL) ➔ OCTAGON SPORT NEDERLAND
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-body leading-relaxed">
              {language === 'pl'
                ? 'Dzięki bezpośredniej umowie z polską centralą Octagon (octagonshop.pl) oferujemy w Holandii oryginalną odzież i sprzęt z polskiej produkcji w bezpośrednich cenach hurtowych, z dostawą do Holandii w 7–10 dni roboczych.'
                : language === 'en'
                ? 'Under our signed direct supply contract with Octagon Poland headquarters (octagonshop.pl), we deliver 100% authentic Polish combat gear across the Netherlands and EU at direct wholesale prices, delivered to the Netherlands within 7–10 business days.'
                : 'Dankzij onze exclusieve overeenkomst met Octagon Polen (octagonshop.pl) leveren wij de 100% originele collectie in Nederland tegen scherpe groothandelstarieven, rechtstreeks uit de fabriek, met levering in Nederland binnen 7–10 werkdagen.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="https://octagonshop.pl/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>{language === 'pl' ? 'SPRAWDŹ DOSTAWCĘ (OCTAGONSHOP.PL)' : language === 'en' ? 'VISIT SUPPLIER (OCTAGONSHOP.PL)' : 'BEKIJK PARTNER (OCTAGONSHOP.PL)'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Core Values 4-Pillar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-10 border-t border-neutral-800">
          <Reveal delay={0} className="p-6 bg-[#0E0E0E] border border-neutral-800 transition-colors hover:border-[#D71920]/60">
            <Shield className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.indestructible.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.indestructible.desc}</p>
          </Reveal>
          <Reveal delay={100} className="p-6 bg-[#0E0E0E] border border-neutral-800 transition-colors hover:border-[#D71920]/60">
            <Users className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.clubs.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.clubs.desc}</p>
          </Reveal>
          <Reveal delay={200} className="p-6 bg-[#0E0E0E] border border-neutral-800 transition-colors hover:border-[#D71920]/60">
            <Flame className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.fightReady.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.fightReady.desc}</p>
          </Reveal>
          <Reveal delay={300} className="p-6 bg-[#0E0E0E] border border-neutral-800 transition-colors hover:border-[#D71920]/60">
            <Award className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.team.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.team.desc}</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
