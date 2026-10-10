import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';
import { getLocalizedProduct } from '../../data/products';

export const FloatingCartWidget: React.FC = () => {
  const { 
    cart, 
    cartCount, 
    subtotal, 
    isCartOpen, 
    setIsCartOpen, 
    navigate, 
    currentPath,
    language 
  } = useStore();

  // Don't show if drawer is open or on checkout/cart page or if cart is empty
  if (isCartOpen || cartCount === 0 || currentPath === '/checkout' || currentPath === '/cart') {
    return null;
  }

  const lastAddedItem = cart[cart.length - 1];
  const lastLoc = lastAddedItem ? getLocalizedProduct(lastAddedItem.product, language) : null;

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0C0C0C]/95 backdrop-blur-md border border-neutral-700 hover:border-neutral-500 shadow-2xl p-2.5 sm:p-3 flex items-center gap-3 text-white transition-all group">
        {/* Thumbnail of last item */}
        {lastAddedItem && (
          <div 
            onClick={() => setIsCartOpen(true)}
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden cursor-pointer"
          >
            <img 
              src={lastAddedItem.product.images[0]} 
              alt={lastLoc?.name || 'Item'} 
              className="w-full h-full object-contain bg-white" 
            />
          </div>
        )}

        {/* Info */}
        <div 
          onClick={() => setIsCartOpen(true)}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-300">
              {language === 'pl' ? 'W Koszyku' : 'In Winkelwagen'} ({cartCount})
            </span>
          </div>
          <p className="font-mono text-sm font-black text-[#D71920] tabular-nums">
            €{subtotal.toFixed(2)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-800">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-2.5 py-1.5 bg-[#181818] hover:bg-neutral-800 text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            title="Winkelwagen openen"
          >
            {language === 'pl' ? 'Zobacz' : 'Bekijk'}
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="px-3 py-1.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow"
            title="Direct naar afrekenen"
          >
            <span>{language === 'pl' ? 'Kasa' : 'Kassa'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
