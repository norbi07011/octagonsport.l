import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler, HelpCircle } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { sizeGuideOpen, closeSizeGuide, language, t } = useStore();
  const [activeTab, setActiveTab] = useState<'gloves' | 'shins' | 'apparel' | 'shorts'>('gloves');

  if (!sizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={closeSizeGuide}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0C0C0C] border border-neutral-700 shadow-2xl z-50 overflow-hidden rounded-none max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#D71920]" />
            <h3 className="font-bebas text-xl text-white tracking-wider">
              {t('sizeGuide.title')}
            </h3>
          </div>
          <button
            onClick={closeSizeGuide}
            aria-label={t('sizeGuide.close')}
            className="p-1.5 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#121212] overflow-x-auto text-xs font-condensed font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('gloves')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'gloves' ? 'border-[#D71920] text-white bg-neutral-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t('sizeGuide.glovesTab')}
          </button>
          <button
            onClick={() => setActiveTab('shins')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'shins' ? 'border-[#D71920] text-white bg-neutral-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t('sizeGuide.shinsTab')}
          </button>
          <button
            onClick={() => setActiveTab('apparel')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'apparel' ? 'border-[#D71920] text-white bg-neutral-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t('sizeGuide.apparelTab')}
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'shorts' ? 'border-[#D71920] text-white bg-neutral-900' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t('sizeGuide.shortsTab')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'gloves' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">
                {language === 'pl'
                  ? 'Waga rękawic bokserskich podawana jest w uncjach (OZ). Wybierz odpowiedni rozmiar na podstawie wagi ciała i przeznaczenia (trening na worku vs sparingi).'
                  : language === 'en'
                  ? 'Boxing glove sizes are specified in Ounces (OZ). Choose according to your body weight and training purpose (heavy bag vs hard sparring).'
                  : 'Het gewicht van bokshandschoenen wordt uitgedrukt in Ounces (OZ). Kies het juiste gewicht op basis van je lichaamsgewicht en trainingsdoel.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-800">
                  <thead className="bg-[#181818] font-condensed font-bold uppercase text-neutral-300">
                    <tr>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.gloveSize')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.weight')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.purpose')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-neutral-400">
                    <tr>
                      <td className="p-2.5 font-bold text-white">10 OZ</td>
                      <td className="p-2.5">45 - 65 kg</td>
                      <td className="p-2.5">{language === 'pl' ? 'Tarcze, worek, zawody' : language === 'en' ? 'Pads, heavy bag, competition' : 'Zaktraining, pads, wedstrijden'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">12 OZ</td>
                      <td className="p-2.5">60 - 75 kg</td>
                      <td className="p-2.5">{language === 'pl' ? 'Trening uniwersalny, technika, lekki sparing' : language === 'en' ? 'All-round training, technical drills, light sparring' : 'All-round training, techniek & sparring'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">14 OZ</td>
                      <td className="p-2.5">75 - 85 kg</td>
                      <td className="p-2.5">{language === 'pl' ? 'Regularne sparingi klubowe (standard)' : language === 'en' ? 'Standard club sparring (most popular)' : 'Reguliere club sparring (meest gekozen)'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">16 OZ</td>
                      <td className="p-2.5">85+ kg</td>
                      <td className="p-2.5">{language === 'pl' ? 'Mocne sparingi, maksymalna ochrona partnera' : language === 'en' ? 'Heavy sparring, maximum partner protection' : 'Zware sparring, maximale partnerbescherming'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shins' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">
                {language === 'pl'
                  ? 'Rozmiar ochraniaczy piszczeli dobiera się na podstawie długości kości piszczelowej (od dołu rzepki do grzbietu stopy).'
                  : language === 'en'
                  ? 'Shin guard sizing is based on tibia length from below kneecap down to top of foot instep.'
                  : 'De maat van scheenbeschermers wordt bepaald door de lengte van je scheenbeen (onder de knieschijf tot bovenkant wreef).'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-800">
                  <thead className="bg-[#181818] font-condensed font-bold uppercase text-neutral-300">
                    <tr>
                      <th className="p-2.5 border-b border-neutral-800">{t('cart.size')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.bodyHeight')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.shinLength')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-neutral-400">
                    <tr>
                      <td className="p-2.5 font-bold text-white">S</td>
                      <td className="p-2.5">&lt; 160 cm</td>
                      <td className="p-2.5">30 - 33 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">M</td>
                      <td className="p-2.5">160 - 175 cm</td>
                      <td className="p-2.5">34 - 36 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">L</td>
                      <td className="p-2.5">175 - 188 cm</td>
                      <td className="p-2.5">37 - 40 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">XL</td>
                      <td className="p-2.5">&gt; 188 cm</td>
                      <td className="p-2.5">&gt; 40 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'apparel' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">
                {t('sizeGuide.fitNote')}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-800">
                  <thead className="bg-[#181818] font-condensed font-bold uppercase text-neutral-300">
                    <tr>
                      <th className="p-2.5 border-b border-neutral-800">{t('cart.size')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.chest')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.waist')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-neutral-400">
                    <tr><td className="p-2.5 font-bold text-white">S</td><td className="p-2.5">90 - 96 cm</td><td className="p-2.5">76 - 82 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">M</td><td className="p-2.5">97 - 104 cm</td><td className="p-2.5">83 - 89 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">L</td><td className="p-2.5">105 - 112 cm</td><td className="p-2.5">90 - 97 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">XL</td><td className="p-2.5">113 - 120 cm</td><td className="p-2.5">98 - 106 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">XXL</td><td className="p-2.5">121 - 128 cm</td><td className="p-2.5">107 - 115 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shorts' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">
                {language === 'pl'
                  ? 'Spodenki MMA i Muay Thai posiadają elastyczny pas ze sznurkiem wewnętrznym oraz boczne rozcięcia dla pełnej swobody kopnięć.'
                  : language === 'en'
                  ? 'MMA and Muay Thai shorts feature an elastic stretch waistband with internal drawstring and lateral high slits for unrestricted high kicks.'
                  : 'MMA en Muay Thai shorts beschikken over een elastische tailleband met intern trekkoord en zijsplitten voor hoge trappen.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-800">
                  <thead className="bg-[#181818] font-condensed font-bold uppercase text-neutral-300">
                    <tr>
                      <th className="p-2.5 border-b border-neutral-800">{t('cart.size')}</th>
                      <th className="p-2.5 border-b border-neutral-800">{t('sizeGuide.waist')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-neutral-400">
                    <tr><td className="p-2.5 font-bold text-white">S (30)</td><td className="p-2.5">76 - 81 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">M (32)</td><td className="p-2.5">82 - 87 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">L (34)</td><td className="p-2.5">88 - 93 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">XL (36)</td><td className="p-2.5">94 - 101 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-white">XXL (38)</td><td className="p-2.5">102 - 110 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
