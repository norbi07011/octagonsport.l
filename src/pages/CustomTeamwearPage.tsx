import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Palette, Check, ArrowRight, Shield } from 'lucide-react';
import { RASHGUARD_IMAGE, BOXING_GLOVES_IMAGE } from '../data/productImages';

export const CustomTeamwearPage: React.FC = () => {
  const { navigate, showToast, language, t } = useStore();
  const [selectedProductType, setSelectedProductType] = useState('rashguard');
  const [customText, setCustomText] = useState('FIGHT TEAM NL');

  const productTypes = [
    {
      id: 'rashguard',
      name: language === 'pl' ? 'Rashguardy Klubowe (Długi & Krótki Rękaw)' : language === 'en' ? 'Custom Rashguards (Long & Short Sleeve)' : 'Custom Rashguards (Long & Short)',
      price: language === 'pl' ? 'Od €29.95 / szt.' : language === 'en' ? 'From €29.95 / pc' : 'Vanaf €29.95 / stuk'
    },
    {
      id: 'shorts',
      name: language === 'pl' ? 'Spodenki MMA & Muay Thai' : language === 'en' ? 'Custom MMA & Muay Thai Shorts' : 'Custom MMA & Muay Thai Shorts',
      price: language === 'pl' ? 'Od €27.50 / szt.' : language === 'en' ? 'From €27.50 / pc' : 'Vanaf €27.50 / stuk'
    },
    {
      id: 'hoodie',
      name: language === 'pl' ? 'Ciężkie Bluzy Klubowe 460 GSM' : language === 'en' ? 'Heavyweight Team Hoodies 460gsm' : 'Heavyweight Team Hoodies 460gsm',
      price: language === 'pl' ? 'Od €39.95 / szt.' : language === 'en' ? 'From €39.95 / pc' : 'Vanaf €39.95 / stuk'
    },
    {
      id: 'tracksuit',
      name: language === 'pl' ? 'Dresy Klubowe & Kurtki Walkout' : language === 'en' ? 'Club Tracksuits & Walkout Jackets' : 'Club Tracksuits & Walkout Jackets',
      price: language === 'pl' ? 'Od €49.95 / kpl.' : language === 'en' ? 'From €49.95 / set' : 'Vanaf €49.95 / set'
    }
  ];

  const handleRequestDesign = () => {
    showToast(
      language === 'pl'
        ? 'Projekt zapisany! Nasz grafik przygotuje bezpłatną wizualizację 3D.'
        : language === 'en'
        ? 'Mockup saved! Our design team will create your digital 3D vector kit.'
        : 'Mockup verzoek opgeslagen! We sturen je een digitaal 3D vectorontwerp.'
    );
    navigate('/clubs');
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Hero */}
      <div className="bg-[#0C0C0C] border-b border-neutral-800 py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
            {t('custom.tag')}
          </span>
          <h1 className="font-bebas text-5xl sm:text-7xl text-white uppercase leading-none">
            {t('custom.title')}
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-body">
            {t('custom.lead')}
          </p>
        </div>
      </div>

      {/* Interactive Mockup Studio Preview */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F0F0F] border border-neutral-800 p-6 sm:p-10 shadow-2xl">
          {/* Visual Mockup Box */}
          <div className="lg:col-span-7 bg-[#070707] border border-neutral-800 p-8 flex flex-col items-center justify-center relative overflow-hidden aspect-[4/3] rounded">
            <div className="relative w-64 sm:w-80 aspect-[4/5] overflow-hidden bg-neutral-900 border border-neutral-700 shadow-2xl flex items-center justify-center">
              <img
                src={RASHGUARD_IMAGE}
                alt="Custom Fightwear Mockup"
                className="w-full h-full object-cover filter contrast-125"
              />
              {/* Simulated Club Logo & Text Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 pointer-events-none">
                <div className="w-16 h-16 rounded-full border-2 border-[#D71920] flex items-center justify-center bg-black/80 mb-2">
                  <Shield className="w-8 h-8 text-[#D71920]" />
                </div>
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-widest drop-shadow-md text-center">
                  {customText || (language === 'pl' ? 'TWÓJ KLUB' : language === 'en' ? 'YOUR CLUB' : 'JOUW CLUBLABEL')}
                </span>
                <span className="text-[10px] font-mono text-[#D71920] uppercase tracking-widest mt-1 bg-black/80 px-2 py-0.5">
                  OCTAGON BESPOKE LAB
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
                STUDIO CONFIGURATOR
              </span>
              <h2 className="font-bebas text-3xl text-white">
                {language === 'pl' ? 'SPERSONALIZUJ ZESTAW' : language === 'en' ? 'CUSTOMIZE YOUR KIT' : 'PERSONALISEER JE KIT'}
              </h2>
            </div>

            {/* Custom text input */}
            <div>
              <label className="block text-xs font-condensed font-bold uppercase text-neutral-400 mb-1.5">
                {language === 'pl' ? 'Wpisz Nazwę Twojego Klubu (Podgląd Na Żywo):' : language === 'en' ? 'Enter Your Club Name (Live Preview):' : 'Voer de naam van jouw club in (Live Preview):'}
              </label>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                maxLength={24}
                className="w-full bg-[#181818] border border-neutral-700 px-3 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#D71920]"
              />
            </div>

            {/* Product item selection */}
            <div>
              <label className="block text-xs font-condensed font-bold uppercase text-neutral-400 mb-2">
                {t('custom.step1')}
              </label>
              <div className="space-y-2">
                {productTypes.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductType(p.id)}
                    className={`w-full p-3 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      selectedProductType === p.id ? 'border-[#D71920] bg-neutral-900 text-white' : 'border-neutral-800 bg-[#141414] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-condensed font-bold text-xs uppercase text-white">{p.name}</p>
                      <p className="text-[11px] font-mono text-[#D71920]">{p.price}</p>
                    </div>
                    {selectedProductType === p.id && <Check className="w-4 h-4 text-[#D71920]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps & Request Design CTA */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <div className="text-[11px] font-mono text-neutral-400 space-y-1">
                <p className="text-white font-bold">{t('custom.step2')}</p>
                <p>{t('custom.step3')}</p>
              </div>

              <button
                onClick={handleRequestDesign}
                className="w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-950/40 transition-colors"
              >
                <span>{t('custom.submitBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
