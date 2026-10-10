import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, getLocalizedProduct } from '../data/products';
import { ProductGrid } from '../components/commerce/ProductGrid';
import { Flame, Tag, AlertCircle } from 'lucide-react';

export const SalePage: React.FC = () => {
  const { language, t, products: storeProducts } = useStore();
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
  const [selectedDiscountFilter, setSelectedDiscountFilter] = useState<number | 'all'>('all');

  const saleProducts = useMemo(() => {
    return allProducts.filter(p => {
      return p.isSale;
    }).map(p => getLocalizedProduct(p, language));
  }, [selectedDiscountFilter, language, allProducts]);

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Sale Hero */}
      <div className="relative bg-gradient-to-b from-[#180506] via-[#0E0606] to-[#050505] border-b border-red-950/60 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D71920]/20 border border-[#D71920]/60 mb-4">
            <Flame className="w-4 h-4 text-[#D71920] animate-bounce" />
            <span className="text-xs font-mono tracking-widest uppercase text-[#D71920] font-bold">
              {t('sale.badge')}
            </span>
          </div>

          <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-none">
            {t('sale.title')}
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-body">
            {t('sale.desc')}
          </p>

        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-8">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#D71920]" />
            <span className="font-bebas text-xl text-white">
              {selectedDiscountFilter === 'all' 
                ? t('sale.allOffers')
                : t('sale.minDiscount', { pct: selectedDiscountFilter })}
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {saleProducts.length} {t('filters.found')}
          </span>
        </div>

        {saleProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="font-bebas text-xl text-neutral-400">
              {language === 'pl' ? 'Brak produktów z wybranym rabatem' : language === 'en' ? 'No products match this discount filter' : 'Geen artikelen gevonden met dit kortingspercentage'}
            </p>
          </div>
        ) : (
          <ProductGrid products={saleProducts} columns={4} />
        )}
      </div>
    </div>
  );
};
