import React, { useState } from 'react';
import { TrainingVideos } from '../components/media/TrainingVideos';
import { GloveShowcase } from '../components/showcase/GloveShowcase';
import { BrandMark } from '../components/layout/BrandMark';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/commerce/ProductCard';
import { 
  PRODUCTS, 
  FIGHT_SYSTEM_KITS,
  getBestsellers,
  getNewProducts,
  getLocalizedProduct
} from '../data/products';
import { 
  ARENA_BANNER_IMAGE,
  HOME_HERO_IMAGE,
  BOXING_GLOVES_IMAGE, 
  RASHGUARD_IMAGE, 
  SHIN_GUARDS_IMAGE,
  MMA_SHORTS_IMAGE,
  MUAY_THAI_SHORTS_IMAGE,
  THAI_PADS_IMAGE,
  LEGGINGS_IMAGE,
  HOODIE_IMAGE
} from '../data/productImages';
import { SportDiscipline } from '../types';
import { ArrowRight, Flame, Shield, Check, Award, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate, addToCart, showToast, language, t } = useStore();
  const [selectedSport, setSelectedSport] = useState<SportDiscipline>('mma');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const bestsellers = getBestsellers(language);
  const newDrops = getNewProducts(language);

  const activeKitData = FIGHT_SYSTEM_KITS[selectedSport as keyof typeof FIGHT_SYSTEM_KITS] || FIGHT_SYSTEM_KITS.mma;
  const activeKitProducts = PRODUCTS.filter(p => activeKitData.productIds.includes(p.id));

  const handleAddFullKitToCart = () => {
    activeKitProducts.forEach(product => {
      addToCart(product, product.sizes[0], product.colors[0]?.name, 1);
    });
    showToast(t('fightSystem.addedToCart'));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    showToast(t('newsletter.success'));
    setNewsletterEmail('');
  };

  const disciplines = [
    { id: 'mma', name: t('discipline.mma'), desc: t('discipline.mmaDesc'), img: MMA_SHORTS_IMAGE, query: 'mma' },
    { id: 'boxing', name: t('discipline.boxing'), desc: t('discipline.boxingDesc'), img: BOXING_GLOVES_IMAGE, query: 'boxing' },
    { id: 'kickboxing', name: t('discipline.kickboxing'), desc: t('discipline.kickboxingDesc'), img: SHIN_GUARDS_IMAGE, query: 'kickboxing' },
    { id: 'muay-thai', name: t('discipline.muayThai'), desc: t('discipline.muayThaiDesc'), img: MUAY_THAI_SHORTS_IMAGE, query: 'muay-thai' },
    { id: 'grappling', name: t('discipline.grappling'), desc: t('discipline.grapplingDesc'), img: RASHGUARD_IMAGE, query: 'grappling' },
    { id: 'fitness', name: t('discipline.fitness'), desc: t('discipline.fitnessDesc'), img: THAI_PADS_IMAGE, query: 'fitness' }
  ];

  return (
    <div className="bg-[#050505] text-white">
      {/* ========================================================================= */}
      {/* SECTION 01 — HERO BANNER */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-neutral-800">
        {/* Cinematic Backdrop Image with Deep Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={HOME_HERO_IMAGE}
            alt="Marris Gym × Legion Octagon Academy"
            className="w-full h-full object-cover object-center filter brightness-75"
          />
          {/* Gradients – lżejsze, żeby sala była dobrze widoczna */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-black/45" />
          <div className="absolute inset-0 bg-radial-vignette opacity-50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center flex flex-col items-center">
          <BrandMark className="w-16 h-16 sm:w-20 sm:h-20 mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]" alt="Octagon" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-neutral-700/80 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-300">
              {t('hero.badge')}
            </span>
          </div>

          {/* Huge Editorial Headline */}
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase max-w-5xl leading-[0.9] text-balance drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl font-body font-normal leading-relaxed text-balance">
            {t('hero.subtitle')}
          </p>

          {/* Dual Primary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/category/fight-gear')}
              className="w-full sm:w-auto px-8 py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm tracking-widest uppercase transition-all duration-200 shadow-xl shadow-red-950/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t('hero.cta.fightGear')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/category/heren')}
              className="w-full sm:w-auto px-8 py-4 bg-[#111111]/90 hover:bg-[#1f1f1f] border border-neutral-700 hover:border-neutral-500 text-white font-condensed font-bold text-sm tracking-widest uppercase backdrop-blur-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
            >
              <span>{t('hero.cta.fightwear')}</span>
            </button>
          </div>

          {/* Secondary Link */}
          <button
            onClick={() => navigate('/nieuw')}
            className="mt-6 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>{t('hero.cta.newDrop')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D71920]" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">SCROLL</span>
          <div className="w-0.5 h-6 bg-gradient-to-b from-[#D71920] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 01.5 — OFFICIAL SUPPLIER & WHOLESALE CONTRACT GUARANTEE BAR */}
      {/* ========================================================================= */}
      <section className="bg-[#0A0A0A] border-b border-neutral-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D71920]/15 border border-[#D71920] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#D71920]" />
            </div>
            <div>
              <p className="font-condensed font-bold uppercase text-white tracking-wider text-sm sm:text-base flex items-center gap-2">
                <span>
                  {language === 'pl' 
                    ? 'ORYGINALNE PRODUKTY OCTAGON' 
                    : language === 'en' 
                    ? 'GENUINE OCTAGON PRODUCTS' 
                    : 'ORIGINELE OCTAGON-PRODUCTEN'}
                </span>
              </p>
              <p className="text-neutral-400 text-xs font-body mt-0.5">
                {language === 'pl'
                  ? 'Odzież i sprzęt polskiej marki Octagon. Oferta dla klubów i firm – zapytaj o ceny B2B.'
                  : language === 'en'
                  ? 'Apparel and gear from the Polish brand Octagon. Offers for clubs and businesses – ask for B2B pricing.'
                  : 'Kleding en uitrusting van het Poolse merk Octagon. Aanbod voor clubs en bedrijven – vraag naar B2B-prijzen.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/wholesale')}
              className="px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-neutral-700 hover:border-[#D71920] text-white font-condensed font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'pl' ? 'PORTAL HURTOWY B2B' : language === 'en' ? 'B2B WHOLESALE' : 'B2B GROOTHANDEL'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D71920]" />
            </button>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02 — SHOP BY DISCIPLINE */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
              DISCIPLINES
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mt-1">
              {t('disciplines.title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mt-2 md:mt-0 font-body">
            {t('disciplines.subtitle')}
          </p>
        </div>

        {/* Discipline Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {disciplines.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/category/fight-gear?sport=${item.query}`)}
              className="group relative h-64 sm:h-72 bg-[#0E0E0E] border border-neutral-800/80 hover:border-[#D71920] overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-end p-4"
            >
              {/* Background Photo */}
              <img
                src={item.img}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover filter brightness-50 group-hover:scale-110 group-hover:brightness-75 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Card Meta */}
              <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5">
                  {item.desc}
                </span>
                <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center justify-between">
                  <span>{item.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#D71920] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02.2 — PREMIUM SHOWCASE (karuzela 3D + scroll story rękawic Kevlar) */}
      {/* ========================================================================= */}
      <GloveShowcase />

      {/* ========================================================================= */}
      {/* SECTION 02.5 — OCTAGON IN ACTIE (wideo z treningów) */}
      {/* ========================================================================= */}
      <TrainingVideos />

      {/* ========================================================================= */}
      {/* SECTION 03 — NEW DROP */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#080808] border-y border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
                  LATEST RELEASE
                </span>
              </div>
              <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mt-1">
                {t('newDrop.title')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/nieuw')}
              className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-300 hover:text-[#D71920] flex items-center gap-1.5 transition-colors"
            >
              <span>{t('newDrop.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newDrops.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04 — CINEMATIC ARENA PROMOTION BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-[#050505]">
        {/* Zdjęcie: na telefonie nad tekstem, na komputerze po prawej stronie */}
        <div className="relative h-[360px] sm:h-[460px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[62%]">
          <img
            src={ARENA_BANNER_IMAGE}
            alt="Octagon fightwear bij Marris Gym"
            className="absolute inset-0 w-full h-full object-cover object-[48%_20%] md:object-[50%_22%] brightness-95 contrast-105"
            loading="lazy"
          />
          {/* telefon: płynne przejście w czarne tło pod zdjęciem */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent md:hidden" />
          {/* komputer: przejście od strony tekstu */}
          <div className="absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent md:block" />
          <div className="absolute inset-x-0 bottom-0 hidden h-20 bg-gradient-to-t from-[#050505]/80 to-transparent md:block" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 -mt-20 pb-14 md:mt-0 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
              {t('arenaBanner.tag')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white uppercase tracking-tight leading-none text-balance">
              {t('arenaBanner.title')}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-body leading-relaxed max-w-lg">
              {t('arenaBanner.desc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/category/fight-gear')}
                className="px-8 py-3.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm tracking-widest uppercase transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{t('arenaBanner.shopBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>


            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 05 — MOST WANTED / BESTSELLERS */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
              {t('bestsellers.tag')}
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mt-1">
              {t('bestsellers.title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 sm:mt-0 font-mono">
            {t('bestsellers.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 06 — INTERACTIVE FIGHT SYSTEM EQUIPMENT SELECTOR */}
      {/* ========================================================================= */}
      <section id="fight-system-section" className="py-16 md:py-24 bg-[#0A0A0A] border-y border-neutral-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest flex items-center justify-center gap-1.5 mb-2">
              <Flame className="w-4 h-4" /> {t('fightSystem.title')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide">
              {t('fightSystem.question')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              {t('fightSystem.desc')}
            </p>
          </div>

          {/* Discipline Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {[
              { id: 'mma', label: t('discipline.mma') },
              { id: 'boxing', label: t('discipline.boxing') },
              { id: 'kickboxing', label: t('discipline.kickboxing') },
              { id: 'muay-thai', label: t('discipline.muayThai') },
              { id: 'grappling', label: t('discipline.grappling') },
              { id: 'karate', label: 'Karate & Budo' }
            ].map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id as SportDiscipline)}
                className={`px-5 py-2.5 font-condensed font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 border ${
                  selectedSport === sport.id
                    ? 'bg-[#D71920] text-white border-[#D71920] shadow-lg shadow-red-950/40 scale-105'
                    : 'bg-[#141414] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>

          {/* Recommended Kit Presentation */}
          <div className="bg-[#0F0F0F] border border-neutral-800 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
                  {activeKitData.title[language] || activeKitData.title.nl}
                </h3>
                <p className="text-xs text-neutral-400">
                  {activeKitData.subtitle[language] || activeKitData.subtitle.nl}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-mono text-neutral-400 block uppercase">
                    {t('fightSystem.totalPrice')}
                  </span>
                  <span className="font-mono text-xl font-bold text-white tabular-nums">
                    €{activeKitProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddFullKitToCart}
                  className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('fightSystem.buildKit')}</span>
                </button>
              </div>
            </div>

            {/* Kit Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {activeKitProducts.map((rawProduct) => {
                const product = getLocalizedProduct(rawProduct, language);
                return (
                  <div 
                    key={product.id}
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="bg-[#161616] border border-neutral-800 p-2.5 flex flex-col justify-between hover:border-neutral-600 transition-colors cursor-pointer group"
                  >
                    <div className="aspect-square bg-white overflow-hidden mb-2">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block truncate">
                        {product.subcategoryLabel}
                      </span>
                      <h4 className="font-condensed font-bold text-xs text-white line-clamp-1 group-hover:text-[#D71920]">
                        {product.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-neutral-200 mt-1 block">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 07 — EQUIPMENT SPLIT BANNER */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-neutral-800">
        {/* Left Side: Heavy Bag / Fighter Imagery */}
        <div className="relative h-80 sm:h-96 md:h-[500px] overflow-hidden bg-white">
          <img
            src={SHIN_GUARDS_IMAGE}
            alt="Octagon scheenbeschermers"
            className="w-full h-full object-contain bg-white hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D71920]">
              {t('splitBanner.zeroComp')}
            </span>
            <p className="font-bebas text-2xl sm:text-3xl text-white">{t('splitBanner.foam')}</p>
          </div>
        </div>

        {/* Right Side: Editorial Message */}
        <div className="bg-[#0C0C0C] p-8 sm:p-12 md:p-16 flex flex-col justify-center items-start space-y-4">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
            {t('splitBanner.proTag')}
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-tight leading-none text-balance">
            {t('splitBanner.title')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-body leading-relaxed max-w-md">
            {t('splitBanner.subtitle')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/category/fight-gear?sub=scheenbeschermers')}
              className="px-8 py-3.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm tracking-widest uppercase transition-colors inline-flex items-center gap-2"
            >
              <span>{t('splitBanner.cta')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 08 — MEN / WOMEN EDITORIAL BLOCKS */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-neutral-800">
        {/* MEN BLOCK */}
        <div 
          onClick={() => navigate('/category/heren')}
          className="relative h-96 sm:h-[480px] bg-neutral-900 overflow-hidden cursor-pointer group flex items-end p-8 border-b md:border-b-0 md:border-r border-neutral-800"
        >
          <img
            src={HOODIE_IMAGE}
            alt="Men Fightwear"
            className="absolute inset-0 w-full h-full object-cover object-top filter brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-widest">
              {t('split.collectionYear')}
            </span>
            <h3 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('split.men')}
            </h3>
            <button className="px-6 py-2.5 bg-white text-black group-hover:bg-[#D71920] group-hover:text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2">
              <span>{t('split.shopMen')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* WOMEN BLOCK */}
        <div 
          onClick={() => navigate('/category/dames')}
          className="relative h-96 sm:h-[480px] bg-neutral-900 overflow-hidden cursor-pointer group flex items-end p-8"
        >
          <img
            src={LEGGINGS_IMAGE}
            alt="Women Fightwear"
            className="absolute inset-0 w-full h-full object-cover object-top filter brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-widest">
              {t('split.collectionYear')}
            </span>
            <h3 className="font-bebas text-4xl sm:text-5xl text-white">
              {t('split.women')}
            </h3>
            <button className="px-6 py-2.5 bg-white text-black group-hover:bg-[#D71920] group-hover:text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2">
              <span>{t('split.shopWomen')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 09 — FIGHT CLUB / COMMUNITY */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#0B0B0B] border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D71920]" />
              <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
                GYM PARTNERSHIPS
              </span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-tight leading-none text-balance">
              {t('community.title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-body leading-relaxed max-w-lg">
              {t('community.subtitle')}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/clubs')}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <span>{t('community.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/custom-teamwear')}
                className="px-6 py-3 bg-[#181818] hover:bg-neutral-800 border border-neutral-700 text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>{t('community.customTeamwear')}</span>
              </button>
            </div>
          </div>

          {/* Value Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-[#111111] border border-neutral-800">
              <span className="font-bebas text-4xl text-[#D71920]">{PRODUCTS.length}</span>
              <p className="font-condensed font-bold uppercase text-white text-sm mt-1">{language === 'pl' ? 'Produktów w ofercie' : language === 'en' ? 'Products in stock range' : 'Producten in het assortiment'}</p>
              <p className="text-xs text-neutral-500 mt-1">{t('community.clubsCount')}</p>
            </div>
            <div className="p-6 bg-[#111111] border border-neutral-800">
              <span className="font-bebas text-4xl text-[#D71920]">2010</span>
              <p className="font-condensed font-bold uppercase text-white text-sm mt-1">Est.</p>
              <p className="text-xs text-neutral-500 mt-1">{t('community.heritage')}</p>
            </div>
            <div className="p-6 bg-[#111111] border border-neutral-800">
              <span className="font-bebas text-4xl text-white">€99</span>
              <p className="font-condensed font-bold uppercase text-white text-sm mt-1">{t('footer.freeDelivery')}</p>
              <p className="text-xs text-neutral-500 mt-1">{t('community.shipping')}</p>
            </div>
            <div className="p-6 bg-[#111111] border border-neutral-800">
              <span className="font-bebas text-4xl text-white">14</span>
              <p className="font-condensed font-bold uppercase text-white text-sm mt-1">{t('footer.returns30')}</p>
              <p className="text-xs text-neutral-500 mt-1">{t('community.rating')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 11 — NEWSLETTER CALLOUT */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-2">
            {t('newsletter.tag')}
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-tight">
            {t('newsletter.title')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-body mt-2 mb-6 max-w-md mx-auto">
            {t('newsletter.subtitle')}
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 bg-neutral-900 border border-neutral-700 text-emerald-400 text-xs font-mono flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t('newsletter.success')}</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                className="bg-[#121212] border border-neutral-700 focus:border-[#D71920] px-4 py-3 text-xs text-white rounded-none flex-1 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                {t('newsletter.button')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
