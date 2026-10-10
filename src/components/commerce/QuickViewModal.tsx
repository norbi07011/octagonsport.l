import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { getLocalizedProduct } from '../../data/products';
import { X, Star, Check, ShoppingBag, ArrowRight } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, addToCart, navigate, openSizeGuide, language, t } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0] || 'Standard');
      setSelectedColor(quickViewProduct.colors[0]?.name || 'Standard');
      setQuantity(1);
    }
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const rawProduct = quickViewProduct;
  const product = getLocalizedProduct(rawProduct, language);
  const activeSize = selectedSize || product.sizes[0];
  const activeColor = selectedColor || product.colors[0]?.name;

  const handleAddToCart = () => {
    addToCart(rawProduct, activeSize, activeColor, quantity);
    closeQuickView();
  };

  const handleFullDetails = () => {
    closeQuickView();
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#0C0C0C] border border-neutral-700 shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          aria-label={t('quickView.close')}
          className="absolute top-3 right-3 p-2 text-neutral-400 hover:text-white bg-black/60 rounded-full z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Left Column */}
        <div className="md:w-1/2 bg-[#141414] relative overflow-hidden flex items-center justify-center aspect-[4/5] md:aspect-auto">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-contain bg-white" 
          />
          {product.badges.length > 0 && (
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-condensed font-bold uppercase tracking-wider px-2.5 py-1 bg-[#D71920] text-white">
                {product.badges[0].label}
              </span>
            </div>
          )}
        </div>

        {/* Product Details Right Column */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono uppercase mb-1">
              <span>{product.brand} · {product.subcategoryLabel}</span>
            </div>

            <h3 className="font-bebas text-2xl text-white tracking-wide">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono text-2xl font-bold text-white tabular-nums">
                €{product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="font-mono text-sm text-neutral-500 line-through tabular-nums">
                  €{product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              {product.shortDescription}
            </p>

            {/* Color Selection */}
            {product.colors.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-condensed font-bold uppercase text-neutral-400 mb-1.5">
                  {t('product.selectColor')}: <span className="text-white font-mono">{activeColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded border-2 transition-all cursor-pointer ${
                        activeColor === c.name ? 'border-[#D71920] scale-110' : 'border-neutral-700'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-condensed font-bold uppercase text-neutral-400">
                  {t('product.chooseSize')} <span className="text-white font-bold font-mono">{activeSize}</span>
                </label>
                <button
                  onClick={() => openSizeGuide(product.category)}
                  className="text-[11px] text-[#D71920] hover:underline font-mono"
                >
                  {t('product.sizeGuideLink')}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      activeSize === s
                        ? 'border-[#D71920] bg-[#D71920] text-white'
                        : 'border-neutral-800 bg-[#161616] text-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-4">
              <Check className="w-3.5 h-3.5" />
              <span>{t('product.inStockCount', { count: product.stock })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('product.addToCart')}</span>
            </button>

            <button
              onClick={handleFullDetails}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>{t('product.viewFullSpecs')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
