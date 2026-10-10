import React from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, getLocalizedProduct } from '../data/products';
import { ProductCard } from '../components/commerce/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, navigate, language, t } = useStore();
  const savedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      <div className="bg-[#0B0B0B] border-b border-neutral-800 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
            {t('wishlist.tag')}
          </span>
          <h1 className="font-bebas text-4xl sm:text-6xl text-white">
            {t('wishlist.title')} ({savedProducts.length})
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {savedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-neutral-800 p-8">
            <Heart className="w-12 h-12 text-neutral-600 mx-auto" />
            <p className="font-bebas text-2xl text-neutral-300">{t('wishlist.empty')}</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-body">
              {t('wishlist.emptyDesc')}
            </p>
            <button
              onClick={() => navigate('/category/fight-gear')}
              className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{t('wishlist.cta')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map(p => (
              <ProductCard key={p.id} product={getLocalizedProduct(p, language)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
