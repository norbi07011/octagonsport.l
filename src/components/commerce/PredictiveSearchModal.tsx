import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight, Flame } from 'lucide-react';
import { PRODUCTS, getLocalizedProduct } from '../../data/products';
import { Product } from '../../types';

export const PredictiveSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigate, language, t, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const matched = allProducts.filter(p => {
      const locP = getLocalizedProduct(p, language);
      return (
        p.name.toLowerCase().includes(cleanQuery) ||
        (p.name_en && p.name_en.toLowerCase().includes(cleanQuery)) ||
        (p.name_pl && p.name_pl.toLowerCase().includes(cleanQuery)) ||
        locP.name.toLowerCase().includes(cleanQuery) ||
        locP.subcategoryLabel.toLowerCase().includes(cleanQuery) ||
        p.brand.toLowerCase().includes(cleanQuery) ||
        p.sport.some(s => s.toLowerCase().includes(cleanQuery)) ||
        (p.collection && p.collection.toLowerCase().includes(cleanQuery)) ||
        p.sku.toLowerCase().includes(cleanQuery)
      );
    });
    setResults(matched);
  }, [query, language]);

  if (!isSearchOpen) return null;

  const popularSearches = language === 'pl'
    ? ['Zęby', 'Pasy', 'Rękawice Bokserskie', 'Worek Bokserski', 'Ochraniacze Piszczeli', 'Bluza Fight Club', 'Nerka Tactical']
    : language === 'en'
    ? ['Teeth', 'Stripes', 'Boxing Gloves', 'Heavy Bag', 'Shin Guards', 'Fight Club Hoodie', 'Waist Bag']
    : ['Zęby Tanden', 'Pasy Strepen', 'Bokshandschoenen', 'Bokszak 150cm', 'Scheenbeschermers', 'Fight Club Hoodie', 'Heuptas'];

  const handleSelectProduct = (slug: string) => {
    setIsSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Panel */}
      <div className="relative w-full max-w-2xl bg-[#0E0E0E] border border-neutral-700 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-[#080808]">
          <Search className="w-5 h-5 text-[#D71920] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent text-white text-base focus:outline-none placeholder-neutral-500 font-condensed tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-500 hover:text-white text-xs font-mono uppercase"
            >
              {language === 'pl' ? 'Wyczyść' : language === 'en' ? 'Clear' : 'Wissen'}
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close"
            className="p-1 text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Popular searches when query is empty */}
          {!query.trim() && (
            <div className="py-2">
              <p className="text-xs font-condensed font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#D71920]" /> {t('search.popular')}
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className="px-3 py-1.5 bg-[#161616] hover:bg-[#D71920] border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase text-neutral-400 mb-2">
                {t('search.resultsCount', { count: results.length })} "{query}"
              </p>
              {results.map((product) => {
                const locP = getLocalizedProduct(product, language);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center justify-between p-2.5 bg-[#141414] hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.images[0]} 
                        alt={locP.name} 
                        className="w-12 h-14 object-contain bg-white" 
                      />
                      <div>
                        <p className="font-condensed font-bold text-sm text-white group-hover:text-[#D71920] transition-colors">
                          {locP.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          {product.brand} · {locP.subcategoryLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white tabular-nums">
                        €{product.price.toFixed(2)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-neutral-400">
              <p className="font-bebas text-xl text-white">
                {t('search.noResults', { query })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
