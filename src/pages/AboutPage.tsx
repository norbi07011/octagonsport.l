import React from 'react';
import { BrandMark } from '../components/layout/BrandMark';
import { useStore } from '../context/StoreContext';
import { HERO_IMAGE, BOXING_GLOVES_IMAGE, RASHGUARD_IMAGE } from '../data/productImages';
import { Shield, Award, Users, Flame, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate, language, t } = useStore();

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
      <div className="relative py-24 px-4 sm:px-6 overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Octagon Heritage"
            className="w-full h-full object-cover filter brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <BrandMark className="w-14 h-14 mx-auto mb-5" alt="Octagon" />
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-2">
            {t('about.tag')}
          </span>
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white uppercase leading-none">
            {t('about.title')}
          </h1>
          <p className="mt-6 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-body">
            {t('about.lead')}
          </p>
        </div>
      </div>

      {/* Cinematic Story Chapters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Chapter 01: Durability & Material */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono text-[#D71920] uppercase tracking-widest">
              {t('about.ch1Tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('about.ch1Title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-body">
              {t('about.ch1Desc')}
            </p>
          </div>
          <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800">
            <img src={BOXING_GLOVES_IMAGE} alt="Quality craftsmanship" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Chapter 02: Culture & Streetwear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800">
            <img src={RASHGUARD_IMAGE} alt="Streetwear & Combat" className="w-full h-full object-cover" />
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <span className="text-xs font-mono text-[#D71920] uppercase tracking-widest">
              {t('about.ch2Tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('about.ch2Title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-body">
              {t('about.ch2Desc')}
            </p>
          </div>
        </div>

        {/* Chapter 03: Community */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
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
          </div>
          <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800">
            <img src={HERO_IMAGE} alt="Community" className="w-full h-full object-cover" />
          </div>
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
          <div className="p-6 bg-[#0E0E0E] border border-neutral-800">
            <Shield className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.indestructible.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.indestructible.desc}</p>
          </div>
          <div className="p-6 bg-[#0E0E0E] border border-neutral-800">
            <Users className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.clubs.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.clubs.desc}</p>
          </div>
          <div className="p-6 bg-[#0E0E0E] border border-neutral-800">
            <Flame className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.fightReady.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.fightReady.desc}</p>
          </div>
          <div className="p-6 bg-[#0E0E0E] border border-neutral-800">
            <Award className="w-6 h-6 text-[#D71920] mb-2" />
            <h4 className="font-bebas text-xl text-white">{pillarTranslations.team.title}</h4>
            <p className="text-xs text-neutral-400 mt-1">{pillarTranslations.team.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
