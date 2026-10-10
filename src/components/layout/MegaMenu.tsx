import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { getSubcategoriesFor } from '../../data/products';
import {
  BOXING_GLOVES_IMAGE,
  HOODIE_IMAGE,
  LEGGINGS_IMAGE,
  THAI_PADS_IMAGE,
  BACKPACK_IMAGE,
} from '../../data/productImages';

interface MegaMenuProps {
  category: string;
  onClose: () => void;
}

const FEATURE_IMAGE: Record<string, string> = {
  heren: HOODIE_IMAGE,
  dames: LEGGINGS_IMAGE,
  'fight-gear': BOXING_GLOVES_IMAGE,
  training: THAI_PADS_IMAGE,
  accessoires: BACKPACK_IMAGE,
};

const SPORTS = [
  { id: 'boxing', key: 'discipline.boxing' },
  { id: 'kickboxing', key: 'discipline.kickboxing' },
  { id: 'muay-thai', key: 'discipline.muayThai' },
  { id: 'mma', key: 'discipline.mma' },
  { id: 'grappling', key: 'discipline.grappling' },
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ category, onClose }) => {
  const { navigate, language, t } = useStore();
  const subs = getSubcategoriesFor(category);
  if (subs.length === 0) return null;

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const half = Math.ceil(subs.length / 2);
  const columns = subs.length > 6 ? [subs.slice(0, half), subs.slice(half)] : [subs];
  const allLabel = language === 'pl' ? 'Zobacz wszystko' : language === 'en' ? 'View all' : 'Bekijk alles';
  const sportTitle = language === 'pl' ? 'Według dyscypliny' : language === 'en' ? 'By discipline' : 'Per discipline';

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[#0B0B0B]/98 backdrop-blur-xl border-b border-neutral-800 shadow-2xl py-8 px-6 z-40"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {columns.map((col, i) => (
          <div key={i}>
            <h4 className="font-bebas text-lg tracking-wider text-white mb-4 border-l-2 border-[#D71920] pl-3">
              {i === 0 ? t(`nav.${navKey(category)}`) : ' '}
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {col.map(s => (
                <li key={s.key}>
                  <button
                    onClick={() => go(`/category/${category}?sub=${s.key}`)}
                    className="hover:text-white hover:translate-x-1 transition-all cursor-pointer text-left"
                  >
                    {s.label[language]} <span className="text-neutral-600 text-xs">({s.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {category !== 'accessoires' && (
          <div>
            <h4 className="font-bebas text-lg tracking-wider text-white mb-4 border-l-2 border-neutral-700 pl-3">{sportTitle}</h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {SPORTS.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => go(`/category/${category}?sport=${s.id}`)}
                    className="hover:text-white hover:translate-x-1 transition-all cursor-pointer"
                  >
                    {t(s.key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {FEATURE_IMAGE[category] && (
          <button
            onClick={() => go(`/category/${category}`)}
            className="bg-white border border-neutral-800 rounded overflow-hidden group text-left cursor-pointer"
          >
            <div className="h-48 w-full overflow-hidden">
              <img src={FEATURE_IMAGE[category]} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="bg-[#141414] p-3 flex items-center justify-between text-xs font-condensed font-bold uppercase tracking-wider text-white">
              <span>{allLabel}</span>
              <ArrowRight className="w-4 h-4 text-[#D71920]" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

function navKey(category: string) {
  return (
    {
      heren: 'men',
      dames: 'women',
      kids: 'kids',
      'fight-gear': 'fightGear',
      training: 'training',
      accessoires: 'accessories',
    } as Record<string, string>
  )[category] || 'shop';
}
