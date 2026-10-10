import React, { useState } from 'react';
import { BrandMark } from '../layout/BrandMark';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { getLocalizedProduct } from '../../data/products';
import { Heart, Eye, ShoppingBag, Scale } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    navigate, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    openQuickView, 
    toggleComparison,
    isInComparison,
    language, 
    t 
  } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [imageError, setImageError] = useState(false);

  const localizedItem = getLocalizedProduct(product, language);
  const inWishlist = isInWishlist(product.id);

  const currentImage = (isHovered && product.images[1]) ? product.images[1] : product.images[0];

  const handleCardClick = (e: React.MouseEvent) => {
    // If not clicked on a button
    navigate(`/product/${product.slug}`);
  };

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, size);
    setShowQuickSizes(false);
  };

  return (
    <div 
      className="group relative flex flex-col bg-[#0B0B0B] border border-neutral-800/80 hover:border-neutral-600 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickSizes(false);
      }}
    >
      {/* 4:5 Image Container */}
      <div 
        onClick={handleCardClick}
        className="relative w-full aspect-[4/5] bg-white overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {!imageError ? (
          <img
            src={currentImage}
            alt={localizedItem.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 to-[#0B0B0B] text-center">
            <BrandMark className="w-12 h-12 opacity-40" alt="" />
            <span className="font-bebas text-2xl text-neutral-400 mt-2">OCTAGON</span>
            <span className="text-xs text-neutral-500 uppercase mt-1 font-mono">{product.category}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-condensed font-bold uppercase tracking-wider px-2 py-0.5 rounded-none ${
                badge.type === 'sale'
                  ? 'bg-[#D71920] text-white'
                  : badge.type === 'bestseller'
                  ? 'bg-neutral-900/90 text-white border border-neutral-700'
                  : 'bg-white text-black'
              }`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Verlanglijst"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
            inWishlist 
              ? 'bg-[#D71920] text-white' 
              : 'bg-black/60 hover:bg-black text-white backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Comparison Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComparison(product.id);
          }}
          aria-label={isInComparison(product.id) ? 'Verwijder uit vergelijking' : 'Toevoegen aan vergelijking'}
          className={`absolute top-12 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
            isInComparison(product.id)
              ? 'bg-[#D71920] text-white shadow-md'
              : 'bg-black/60 hover:bg-black text-white backdrop-blur-sm'
          }`}
          title={isInComparison(product.id) ? 'In vergelijking' : 'Vergelijk specificaties'}
        >
          <Scale className="w-4 h-4" />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openQuickView(product);
          }}
          aria-label="Snelle weergave"
          className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-black/70 hover:bg-[#D71920] text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Quick Add Overlay Drawer (appears when clicked or hovered) */}
        {product.stock !== undefined && product.stock <= 0 ? (
          <div className="absolute inset-x-0 bottom-0 py-2.5 bg-neutral-900/90 text-neutral-400 text-xs font-mono font-bold uppercase tracking-wider text-center z-10">
            {language === 'pl' ? 'Chwilowo Wyprzedane' : language === 'en' ? 'Out of Stock' : 'Uitverkocht'}
          </div>
        ) : showQuickSizes ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-neutral-700 p-3 z-20 flex flex-col gap-2 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-condensed font-bold uppercase text-neutral-300">
                {t('product.chooseSize')}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickSizes(false);
                }}
                className="text-[10px] font-mono text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={(e) => handleQuickAdd(s, e)}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-[#181818] hover:bg-[#D71920] text-white border border-neutral-700 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.sizes.length === 1) {
                addToCart(product, product.sizes[0]);
              } else {
                setShowQuickSizes(true);
              }
            }}
            className="absolute inset-x-0 bottom-0 py-2.5 bg-black/85 hover:bg-[#D71920] text-white text-xs font-condensed font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('product.quickAdd')}
          </button>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Sport Tag */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono uppercase tracking-wider mb-1">
            <span>{localizedItem.subcategoryLabel}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={handleCardClick}
            className="font-condensed font-bold text-sm sm:text-base text-white hover:text-[#D71920] transition-colors line-clamp-1 cursor-pointer"
          >
            {localizedItem.name}
          </h3>

          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
            {localizedItem.shortDescription}
          </p>
        </div>

        {/* Pricing & Colors */}
        <div className="flex items-end justify-between mt-3 pt-2 border-t border-neutral-800/60">
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-base font-bold tabular-nums ${product.compareAtPrice ? 'text-[#D71920]' : 'text-white'}`}>
              €{product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.compareAtPrice && (
              <span className="font-mono text-xs text-neutral-500 line-through tabular-nums">
                €{product.compareAtPrice.toFixed(2).replace('.', ',')}
              </span>
            )}

          </div>

          {/* Color indicators */}
          <div className="flex items-center gap-1">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-2.5 h-2.5 rounded-full border border-neutral-700"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
