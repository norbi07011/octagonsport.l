import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Scale, X, ArrowRight, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { getLocalizedProduct } from '../../data/products';

export const ComparisonFloatingBar: React.FC = () => {
  const {
    comparison,
    removeFromComparison,
    clearComparison,
    isComparisonBarOpen,
    setIsComparisonBarOpen,
    navigate,
    currentPath,
    products,
    language
  } = useStore();

  // Don't show if on compare page or no items in comparison
  if (comparison.length === 0 || currentPath === '/compare') {
    return null;
  }

  const comparedProducts = comparison
    .map(id => products.find(p => p.id === id || p.sku === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0C0C0C]/98 backdrop-blur-md border-t border-neutral-700 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#181818] border border-neutral-700 flex items-center justify-center text-[#D71920]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-lg text-white tracking-wide">
                  {language === 'pl' ? 'PORÓWNYWARKA SPRZĘTU' : 'SPECIFICATIE VERGELIJKER'}
                </span>
                <span className="px-1.5 py-0.2 bg-[#D71920] text-white text-[10px] font-mono font-bold">
                  {comparison.length}/4
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 hidden sm:block">
                {language === 'pl'
                  ? 'Wybierz 2 lub więcej produktów, aby porównać specyfikacje obok siebie'
                  : 'Vergelijk materialen, maten en specificaties naast elkaar'}
              </p>
            </div>
          </div>

          {/* Middle Thumbnails Row */}
          <div className="hidden md:flex items-center gap-3">
            {comparedProducts.map(product => {
              if (!product) return null;
              const locP = getLocalizedProduct(product, language);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-2 bg-[#161616] border border-neutral-700 p-1.5 pr-2.5 group relative"
                >
                  <img
                    src={product.images[0]}
                    alt={locP.name}
                    className="w-8 h-10 object-contain bg-white"
                  />
                  <div className="max-w-[130px]">
                    <p className="font-condensed font-bold text-xs text-white truncate">{locP.name}</p>
                    <p className="font-mono text-[10px] text-[#D71920]">€{product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors ml-1"
                    title="Verwijderen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Empty slots indicator */}
            {Array.from({ length: Math.max(0, 4 - comparison.length) }).map((_, idx) => (
              <div
                key={idx}
                className="w-24 h-11 border border-dashed border-neutral-800 flex items-center justify-center text-neutral-600 text-[10px] font-mono"
              >
                + Slot {comparison.length + idx + 1}
              </div>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearComparison()}
              className="px-3 py-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors hidden sm:block"
            >
              {language === 'pl' ? 'Wyczyść' : 'Wissen'}
            </button>

            <button
              onClick={() => navigate('/compare')}
              className="px-4 py-2.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950/40"
            >
              <span>
                {language === 'pl'
                  ? `Porównaj (${comparison.length})`
                  : `Vergelijk (${comparison.length})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
