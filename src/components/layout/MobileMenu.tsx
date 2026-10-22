import React, { useState } from 'react';
import { BrandMark } from './BrandMark';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, ChevronDown, Flame, Globe, X, Award } from 'lucide-react';
import { TOP_CATEGORIES, getSubcategoriesFor } from '../../data/products';

/** Miniatury kategorii (wycięte zdjęcia z animacji) */
const CAT_THUMB: Record<string, string> = {
  heren: '/showcase/men-6040-a.webp',
  dames: '/showcase/women-6209-a.webp',
  kids: '/showcase/kids-bull-back.webp',
  'fight-gear': '/showcase/kevlar-red-pair.webp',
  training: '/showcase/training-6084-a.webp',
  accessoires: '/showcase/acc-6028-a.webp',
};

const NAV_KEY: Record<string, string> = {
  heren: 'men',
  dames: 'women',
  kids: 'kids',
  'fight-gear': 'fightGear',
  training: 'training',
  accessoires: 'accessories',
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { navigate, language, setLanguage, t } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="oct-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer – pełny ekran na telefonie */}
      <div className="oct-menu-in relative w-full sm:max-w-md bg-[#080808] border-r border-neutral-800 h-full flex flex-col z-50 overflow-y-auto" data-native-scroll>
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark className="w-8 h-8" alt="" />
            <span className="font-bebas text-xl tracking-wider text-white">
              OCTAGON <span className="text-[#D71920]">SPORT NL</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            aria-label={t('mobile.close')}
            className="p-1.5 text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Highlight Promo Banner */}
        <div className="p-3 bg-[#111111] border-b border-neutral-800">
          <button
            onClick={() => handleNavigate('/')}
            className="w-full flex items-center justify-between p-2.5 bg-[#181818] border border-neutral-700 rounded text-left"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-[#D71920]" />
              <div>
                <p className="text-xs font-condensed font-bold tracking-wider uppercase text-white">
                  {t('mobile.fightSystemPromo')}
                </p>
                <p className="text-[11px] text-neutral-400">{t('mobile.fightSystemDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Main Categories Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {TOP_CATEGORIES.map((cat, ci) => {
            const subs = getSubcategoriesFor(cat);
            const label = t(`nav.${NAV_KEY[cat]}`);
            const open = expandedSection === cat;
            return (
              <div key={cat} className="oct-rise border-b border-neutral-800/60 pb-1" style={{ animationDelay: `${120 + ci * 60}ms` }}>
                <button
                  onClick={() => toggleSection(cat)}
                  className={`group relative w-full py-3 flex items-center justify-between font-bebas text-3xl tracking-wider ${cat === 'fight-gear' ? 'text-[#D71920]' : 'text-white'}`}
                >
                  <span className="transition-transform duration-300 group-active:translate-x-1">{label}</span>
                  <span className="flex items-center gap-3">
                    {CAT_THUMB[cat] && (
                      <img
                        src={CAT_THUMB[cat]}
                        alt=""
                        loading="lazy"
                        className={`h-12 w-12 object-contain transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${open ? 'scale-125 -rotate-6' : 'scale-100'}`}
                        style={{ filter: 'drop-shadow(0 6px 12px rgba(215,25,32,.35))' }}
                      />
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-0 text-[#D71920]' : '-rotate-90 text-neutral-500'}`} />
                  </span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                  <div className="overflow-hidden">
                  <div className="pl-3 pb-3 space-y-2 text-sm text-neutral-400">
                    <button onClick={() => handleNavigate(`/category/${cat}`)} className="block hover:text-white text-left w-full font-semibold text-white">
                      {language === 'pl' ? 'Zobacz wszystko' : language === 'en' ? 'View all' : 'Bekijk alles'} →
                    </button>
                    {subs.map(s => (
                      <button key={s.key} onClick={() => handleNavigate(`/category/${cat}?sub=${s.key}`)} className="block hover:text-white text-left w-full">
                        {s.label[language]} <span className="text-neutral-600 text-xs">({s.count})</span>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* PARTNERS */}
          <div className="border-b border-neutral-800/60 pb-1">
            <button
              onClick={() => handleNavigate('/partners')}
              className="w-full py-3 flex items-center justify-between font-bebas text-xl tracking-wider text-white text-left"
            >
              <span>{t('nav.partners')}</span>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          {/* B2B / CLUBS */}
          <div className="border-b border-neutral-800/60 pb-1">
            <button
              onClick={() => handleNavigate('/clubs')}
              className="w-full py-3 flex items-center justify-between font-bebas text-xl tracking-wider text-white text-left"
            >
              <span>{t('nav.clubs')}</span>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
          {/* Snelkoppelingen: verlanglijst, vergelijken, account */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {[
              { path: '/wishlist', label: language === 'pl' ? 'Ulubione' : language === 'en' ? 'Wishlist' : 'Verlanglijst' },
              { path: '/compare', label: language === 'pl' ? 'Porównaj' : language === 'en' ? 'Compare' : 'Vergelijk' },
              { path: '/contact', label: 'Contact' },
            ].map(l => (
              <button
                key={l.path}
                onClick={() => handleNavigate(l.path)}
                className="py-2.5 border border-neutral-800 bg-[#121212] text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:border-neutral-600"
              >
                {l.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer & Language Controls */}
        <div className="p-4 border-t border-neutral-800 bg-[#0B0B0B] space-y-3">
          {/* Language Selector */}
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-400" /> {t('mobile.language')}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setLanguage('nl')}
                className={`py-1.5 text-xs font-mono font-bold uppercase border transition-colors ${
                  language === 'nl' ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 bg-[#161616] text-neutral-400'
                }`}
              >
                NL
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`py-1.5 text-xs font-mono font-bold uppercase border transition-colors ${
                  language === 'en' ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 bg-[#161616] text-neutral-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('pl')}
                className={`py-1.5 text-xs font-mono font-bold uppercase border transition-colors ${
                  language === 'pl' ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 bg-[#161616] text-neutral-400'
                }`}
              >
                PL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
