import React from 'react';
import { RollingNumber } from '../fx/Kinetic';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, ShoppingBag } from 'lucide-react';
import { PRODUCTS, getLocalizedProduct } from '../../data/products';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    shippingQuote,
    total,
    freeShippingThreshold,
    amountForFreeShipping,
    addToCart,
    navigate,
    language,
    t,
    products: storeProducts
  } = useStore();

  if (!isCartOpen) return null;

  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;

  // Recommendations: products not in cart
  const cartIds = cart.map(i => i.product.id);
  const recommended = allProducts.filter(p => !cartIds.includes(p.id)).slice(0, 2);

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="oct-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="oct-drawer relative w-full max-w-md bg-[#0B0B0B] border-l border-neutral-800 h-full flex flex-col z-50 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D71920]" />
            <h3 className="font-bebas text-xl text-white tracking-wider">
              {t('cart.title')} ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Sluit winkelwagen"
            className="p-1.5 text-neutral-400 hover:text-white rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="p-4 bg-[#111111] border-b border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1.5 font-condensed tracking-wider">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Truck className="w-4 h-4 text-[#D71920]" />
              {amountForFreeShipping === 0 ? (
                <span className="text-emerald-400 font-bold">{t('cart.freeShippingReached')}</span>
              ) : (
                <span>{t('cart.freeShippingRemaining', { amount: amountForFreeShipping.toFixed(2) })}</span>
              )}
            </span>
            <span className="font-mono font-bold text-white text-xs"><RollingNumber value={freeShippingProgress} format={n => `${Math.round(n)}%`} /></span>
          </div>
          <div className="relative w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`oct-progress relative h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${amountForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-[#D71920]'}`}
              style={{ width: `${freeShippingProgress}%`, boxShadow: amountForFreeShipping === 0 ? '0 0 14px rgba(16,185,129,.8)' : '0 0 14px rgba(215,25,32,.8)' }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="font-bebas text-xl text-neutral-400">{t('cart.empty')}</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/category/fight-gear');
                }}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors inline-block"
              >
                {t('cart.emptyAction')}
              </button>
            </div>
          ) : (
            cart.map((item, itemIdx) => {
              const localizedP = getLocalizedProduct(item.product, language);
              return (
                <div 
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="oct-rise flex gap-3 bg-[#111111] border border-neutral-800/80 p-3 rounded-none relative hover:border-neutral-600 transition-colors"
                  style={{ animationDelay: `${150 + itemIdx * 70}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-900 shrink-0 overflow-hidden">
                    <img 
                      src={item.product.images[0]} 
                      alt={localizedP.name} 
                      className="w-full h-full object-contain bg-white" 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-condensed font-bold text-sm text-white line-clamp-1">
                        {localizedP.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {t('cart.size')}: <span className="text-white font-bold">{item.selectedSize}</span> | {t('cart.color')}: {item.selectedColor}
                      </p>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800">
                      <div className="flex items-center border border-neutral-700 bg-black">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1)}
                          className="p-1 hover:text-white text-neutral-400"
                          aria-label="Aantal verminderen"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1)}
                          className="p-1 hover:text-white text-neutral-400"
                          aria-label="Aantal verhogen"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white tabular-nums">
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-neutral-500 hover:text-[#D71920] transition-colors"
                          aria-label={t('cart.remove')}
                          title={t('cart.remove')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Cross Sell Section */}
          {cart.length > 0 && recommended.length > 0 && (
            <div className="pt-4 border-t border-neutral-800">
              <h5 className="font-condensed font-bold text-xs uppercase tracking-wider text-neutral-300 mb-3">
                {t('cart.youMayAlsoLike')}
              </h5>
              <div className="space-y-2">
                {recommended.map(rec => {
                  const locRec = getLocalizedProduct(rec, language);
                  return (
                    <div 
                      key={rec.id}
                      className="flex items-center justify-between p-2 bg-[#141414] border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={rec.images[0]} alt={locRec.name} className="w-10 h-10 object-contain bg-white" />
                        <div>
                          <p className="font-condensed font-bold text-white line-clamp-1 text-xs">{locRec.name}</p>
                          <p className="font-mono text-neutral-400 text-[11px]">€{rec.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(rec, rec.sizes[0])}
                        className="px-2.5 py-1 bg-[#222222] hover:bg-[#D71920] text-white text-[11px] font-condensed font-bold uppercase transition-colors shrink-0"
                      >
                        {t('cart.addBtn')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-[#080808] space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-300 font-condensed tracking-wider">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">€<RollingNumber value={subtotal} /></span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.shipping')} (≈ {shippingQuote.totalKg.toFixed(1).replace('.', ',')} kg)</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {shippingFee === 0 ? <span className="text-emerald-400 font-bold">{t('cart.free')}</span> : `€${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                <span className="font-bebas text-lg">{t('cart.total')} (INCL. BTW)</span>
                <span className="font-mono text-lg text-[#D71920] tabular-nums">€<RollingNumber value={total} /></span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950/20"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/cart');
                }}
                className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-condensed font-bold uppercase transition-colors text-center cursor-pointer"
              >
                {language === 'pl' ? 'Otwórz pełny koszyk' : 'Bekijk winkelwagen'}
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-condensed font-bold uppercase transition-colors text-center cursor-pointer"
              >
                {language === 'pl' ? 'Dalej przeglądaj' : 'Verder winkelen'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('cart.sslNotice')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
