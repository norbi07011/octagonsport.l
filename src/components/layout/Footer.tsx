import { subscribeNewsletter, NEWSLETTER_ERROR } from '../../lib/newsletter';
import React, { useEffect, useRef, useState } from 'react';
import { VelocityMarquee } from '../fx/ScrollFx';
import { PARTNERS, INFLUENCERS } from '../../data/partners';
import { COMPANY, COMPANY_ADDRESS_LINE } from '../../config/company';
import { BrandMark } from './BrandMark';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Truck, RotateCcw, Award, Check } from 'lucide-react';

/**
 * Finał strony: ogromny napis OCTAGON, który przy dojściu do końca strony
 * wysuwa się i „wypełnia” czerwienią od dołu (sterowane scrollem).
 */
const FooterWordmark: React.FC = () => {
  const box = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = box.current;
      const w = word.current;
      if (!el || !w) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh - r.top) / Math.max(r.height, 1)));
      const fill = Math.round(Math.min(1, p * 1.25) * 100);
      w.style.transform = `translate3d(0, ${(1 - p) * 35}%, 0) scale(${0.92 + p * 0.08})`;
      w.style.backgroundImage = `linear-gradient(to top, #D71920 ${fill}%, rgba(255,255,255,.04) ${fill}%)`;
      w.style.letterSpacing = `${(1 - p) * 0.12}em`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={box} aria-hidden className="relative overflow-hidden border-t border-neutral-900 bg-[#030303] pt-6">
      <div
        ref={word}
        className="select-none text-center font-bebas leading-[0.8] text-transparent"
        style={{
          fontSize: 'clamp(80px, 22vw, 360px)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextStroke: '1px rgba(255,255,255,.12)',
          backgroundImage: 'linear-gradient(to top, #D71920 0%, rgba(255,255,255,.04) 0%)',
          transform: 'translate3d(0,35%,0)',
          willChange: 'transform',
        }}
      >
        OCTAGON
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const { navigate, language, t, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const [sending, setSending] = useState(false);
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || sending) return;
    setSending(true);
    const ok = await subscribeNewsletter(email, 'footer', language);
    setSending(false);
    if (!ok) { showToast(NEWSLETTER_ERROR[language] || NEWSLETTER_ERROR.nl); return; }
    setSubscribed(true);
    showToast(t('newsletter.success'));
    setEmail('');
  };

  return (
    <footer className="bg-[#050505] border-t border-neutral-800 text-neutral-400 text-sm">
      {/* 4 Value Pillars */}
      <div className="border-b border-neutral-800/80 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-[#D71920] shrink-0" />
            <div>
              <p className="font-condensed font-bold uppercase tracking-wider text-white text-xs sm:text-sm">
                {t('footer.freeDelivery')}
              </p>
              <p className="text-[11px] text-neutral-400">{t('community.shipping')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-[#D71920] shrink-0" />
            <div>
              <p className="font-condensed font-bold uppercase tracking-wider text-white text-xs sm:text-sm">
                {t('footer.returns30')}
              </p>
              <p className="text-[11px] text-neutral-400">
                {language === 'pl' ? 'Łatwa wymiana i zwroty' : language === 'en' ? 'Returns within 14 days' : 'Retourneren binnen 14 dagen'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#D71920] shrink-0" />
            <div>
              <p className="font-condensed font-bold uppercase tracking-wider text-white text-xs sm:text-sm">
                {t('footer.proTested')}
              </p>
              <p className="text-[11px] text-neutral-400">
                {language === 'pl' ? 'Stworzone dla zawodników' : language === 'en' ? 'Engineered for champions' : 'Ontwikkeld voor actieve vechters'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#D71920] shrink-0" />
            <div>
              <p className="font-condensed font-bold uppercase tracking-wider text-white text-xs sm:text-sm">
                {t('footer.securePayments')}
              </p>
              <p className="text-[11px] text-neutral-400">iDEAL, Bancontact, Visa, MC & Klarna</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        {/* Brand Story Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BrandMark className="w-10 h-10" alt="" />
            <span className="font-bebas text-2xl tracking-wider text-white">
              OCTAGON <span className="text-[#D71920]">SPORT NL</span>
            </span>
          </div>

          <p className="text-xs leading-relaxed text-neutral-400 max-w-md">
            {t('footer.aboutText')}
          </p>

          {/* Newsletter Box */}
          <div className="pt-2">
            <p className="font-condensed font-bold uppercase text-white tracking-wider text-xs mb-2">
              {t('newsletter.tag')}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#D71920] bg-neutral-900 border border-neutral-800 p-2.5 rounded">
                <Check className="w-4 h-4" /> {t('newsletter.success')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  required
                  className="bg-[#111111] border border-neutral-800 focus:border-[#D71920] text-white px-3 py-2 text-xs rounded-none w-full focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#D71920] hover:bg-[#b01318] disabled:opacity-60 text-white px-4 py-2 text-xs font-condensed font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                >
                  {t('newsletter.button')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-bebas text-base text-white tracking-wider mb-4 border-l border-[#D71920] pl-2">
            {t('footer.customerService')}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigate('/retourneren')} className="hover:text-white hover:underline text-left cursor-pointer">
                {language === 'pl' ? 'Dostawa i zwroty' : language === 'en' ? 'Shipping & returns' : 'Verzending & retourneren'}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/size-guide')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('footer.sizeGuide')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/contact')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('footer.contactUs')}
              </button>
            </li>

          </ul>
        </div>

        {/* Fight Gear Categories */}
        <div>
          <h4 className="font-bebas text-base text-white tracking-wider mb-4 border-l border-neutral-700 pl-2">
            {t('footer.categories')}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigate('/category/fight-gear?sub=bokshandschoenen')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('sub.boxingGloves')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/fight-gear?sub=mma-handschoenen')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('sub.mmaGloves')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/heren?sub=rashguards')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('sub.rashguards')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/fight-gear?sub=scheenbeschermers')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('sub.shinGuards')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/sale')} className="text-[#D71920] font-semibold hover:underline text-left cursor-pointer">
                {t('nav.sale')}
              </button>
            </li>
          </ul>
        </div>

        {/* Clubs & B2B */}
        <div>
          <h4 className="font-bebas text-base text-white tracking-wider mb-4 border-l border-neutral-700 pl-2">
            {t('footer.b2b')}
          </h4>
          <ul className="space-y-2 text-xs">
            
            <li>
              <button onClick={() => navigate('/partners')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('nav.partners')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/clubs')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('nav.clubs')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/custom-teamwear')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('footer.customWear')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/wholesale')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('footer.wholesale')}
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-white hover:underline text-left cursor-pointer">
                {t('footer.aboutUs')}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment & Carrier Badges */}
      <div className="border-t border-neutral-900 bg-[#040404] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono text-[11px] uppercase mr-2 text-neutral-500">
              {language === 'pl' ? 'Płatności:' : language === 'en' ? 'Payment Methods:' : 'Betaalmethoden:'}
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              iDEAL
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              Bancontact
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              Klarna
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              VISA
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              Mastercard
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-bold font-mono text-[11px] rounded">
              Apple Pay
            </span>
          </div>

          {/* Carrier Badges */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono text-[11px] uppercase mr-1 text-neutral-500">
              {language === 'pl' ? 'Dostawa:' : language === 'en' ? 'Couriers:' : 'Vervoerders:'}
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-mono text-[11px] rounded">
              PostNL
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-mono text-[11px] rounded">
              DHL Express
            </span>
            <span className="px-2 py-1 bg-[#111111] border border-neutral-800 text-neutral-200 font-mono text-[11px] rounded">
              DPD
            </span>
          </div>
        </div>
      </div>

      {/* Partnerzy – pasek reagujący na tempo przewijania */}
      <div className="border-t border-neutral-900 py-5">
        <VelocityMarquee items={[...PARTNERS, ...INFLUENCERS].map(p => p.name)} outline className="text-4xl sm:text-5xl" />
      </div>

      {/* Wielki finał */}
      <FooterWordmark />

      {/* Copyright Bottom Bar */}
      <div className="border-t border-neutral-900 bg-[#020202] py-4 px-4 sm:px-6 text-[11px] text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <p>{t('footer.rights')}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              {COMPANY.name} · {COMPANY_ADDRESS_LINE} · KvK {COMPANY.kvk} · BTW {COMPANY.btw} ·{' '}
              <a href={`mailto:${COMPANY.email}`} className="hover:text-neutral-300">{COMPANY.email}</a>
            </p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              {language === 'pl'
                ? 'Octagon i Legion Octagon to znaki towarowe ich właściciela. Zdjęcia i opisy produktów: Octagon.'
                : language === 'en'
                ? 'Octagon and Legion Octagon are trademarks of their respective owner. Product photos and descriptions: Octagon.'
                : 'Octagon en Legion Octagon zijn handelsmerken van de betreffende eigenaar. Productfoto’s en -beschrijvingen: Octagon.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button onClick={() => navigate('/algemene-voorwaarden')} className="hover:text-neutral-300 cursor-pointer">
              {t('footer.terms')}
            </button>
            <button onClick={() => navigate('/retourneren')} className="hover:text-neutral-300 cursor-pointer">
              {language === 'pl' ? 'Zwroty' : language === 'en' ? 'Returns' : 'Retourneren'}
            </button>
            <button onClick={() => navigate('/privacy')} className="hover:text-neutral-300 cursor-pointer">
              {t('footer.privacy')}
            </button>
            <button onClick={() => navigate('/cookies')} className="hover:text-neutral-300 cursor-pointer">
              {t('footer.cookies')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
