import React, { useState } from 'react';
import { openWhatsApp, WhatsAppIcon } from '../components/layout/WhatsAppWidget';
import { quoteForProduct, formatEur, FREE_SHIPPING_THRESHOLD, TIERS } from '../config/shipping';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, getProductBySlug, getLocalizedProduct, getVariants, subcategoryLabel } from '../data/products';
import { useProductDescription } from '../hooks/useProductDescription';
import { ProductCard } from '../components/commerce/ProductCard';
import { 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  ShoppingBag, 
  Ruler, 
  Plus, 
  Minus, 
  Check, 
  ArrowRight,
  Flame
} from 'lucide-react';

interface ProductPageProps {
  slug: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug }) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    openSizeGuide, 
    navigate, 
    language,
    t,
    getProductBySlug: storeGetProductBySlug,
    products: storeProducts
  } = useStore();

  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
  const foundProduct = (storeGetProductBySlug ? storeGetProductBySlug(slug) : null) || getProductBySlug(slug);
  const rawProduct = foundProduct || allProducts[0];
  const product = getLocalizedProduct(rawProduct, language);
  const descriptionHtml = useProductDescription(rawProduct.descKey, language);
  const variants = getVariants(rawProduct);
  const onlyOneSize = product.sizes.length === 1;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (rawProduct) {
      document.title = `${product.name} | OctagonSportNL`;
      setSelectedSize(rawProduct.sizes[0] || 'Standard');
      setSelectedColor(rawProduct.colors[0]?.name || 'Standard');
      setSelectedImageIdx(0);
      setQuantity(1);
    }
  }, [rawProduct.id]);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    tech: true,
    materials: false,
    shipping: false,
    care: false
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const inWishlist = isInWishlist(product.id);


  const handleAddToCart = () => {
    addToCart(rawProduct, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(rawProduct, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  // Podobne produkty: ta sama podkategoria, inne modele
  const crossSellProducts = (() => {
    const seen = new Set<string>([rawProduct.variantGroup || rawProduct.id]);
    return allProducts.filter(p => {
      const g = p.variantGroup || p.id;
      if (p.subcategory !== rawProduct.subcategory || seen.has(g)) return false;
      seen.add(g);
      return true;
    }).slice(0, 4);
  })();

  const shippingAccordionText = language === 'pl'
    ? 'Dostawa do Holandii: 7–10 dni roboczych. Koszt wysyłki zależy od wagi: paczka do skrzynki €4,95, do 10 kg €7,95, 10–23 kg €17,95 – darmowa dostawa od €99 (poza ciężkimi produktami powyżej 23 kg). Masz 14 dni na odstąpienie od umowy bez podania przyczyny. Koszt odesłania pokrywa kupujący; zwrot na adres w Someren (NL). Szczegóły: strona „Dostawa i zwroty”.'
    : language === 'en'
    ? 'Delivery to the Netherlands: 7–10 business days. Shipping depends on weight: letterbox parcel €4.95, up to 10 kg €7.95, 10–23 kg €17.95 – free from €99 (except heavy items over 23 kg). You have 14 days to withdraw from your purchase without giving a reason. Return shipping costs are paid by the customer; returns go to our address in Someren (NL). See “Shipping & returns” for details.'
    : 'Levertijd Nederland: 7–10 werkdagen. Verzendkosten op basis van gewicht: brievenbuspakje €4,95, tot 10 kg €7,95, 10–23 kg €17,95 – gratis vanaf €99 (behalve zware artikelen boven 23 kg). Je hebt 14 dagen bedenktijd. De kosten van het terugsturen zijn voor eigen rekening; retouren gaan naar ons adres in Someren. Zie „Verzending & retourneren” voor alle details.';

  if (!foundProduct) {
    return (
      <div className="bg-[#050505] min-h-[60vh] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-bebas text-4xl">{language === 'pl' ? 'Nie znaleziono produktu' : language === 'en' ? 'Product not found' : 'Product niet gevonden'}</h1>
        <button onClick={() => navigate('/category/all')} className="px-6 py-3 bg-[#D71920] text-white font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer">
          {language === 'pl' ? 'Zobacz wszystkie produkty' : language === 'en' ? 'View all products' : 'Bekijk alle producten'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-800 bg-[#0A0A0A] py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono text-neutral-400">
          <button onClick={() => navigate('/')} className="hover:text-white cursor-pointer">HOME</button>
          <span>/</span>
          <button onClick={() => navigate(`/category/${product.category}?sub=${product.subcategory}`)} className="hover:text-white uppercase cursor-pointer">
            {product.subcategoryLabel}
          </button>
          <span>/</span>
          <span className="text-neutral-200 truncate">{product.name}</span>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ============================================================= */}
          {/* LEFT: ~60% GALLERY (lg:col-span-7) */}
          {/* ============================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] bg-white border border-neutral-800 overflow-hidden flex items-center justify-center">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.badges.map((b, i) => (
                  <span
                    key={i}
                    className={`text-xs font-condensed font-bold uppercase tracking-wider px-3 py-1 ${
                      b.type === 'sale' ? 'bg-[#D71920] text-white' : 'bg-black/90 text-white border border-neutral-700'
                    }`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={t('nav.wishlist')}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                  inWishlist ? 'bg-[#D71920] text-white' : 'bg-black/60 hover:bg-black text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-24 shrink-0 bg-white border-2 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIdx === idx ? 'border-[#D71920] opacity-100' : 'border-neutral-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* RIGHT: ~40% STICKY PRODUCT INFO (lg:col-span-5) */}
          {/* ============================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono uppercase mb-1">
                <span>{product.brand} · {product.subcategoryLabel}</span>
                <span className="text-neutral-500">{t('product.sku')}: {product.sku}</span>
              </div>

              <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide leading-tight">
                {product.name}
              </h1>

            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 p-4 bg-[#0B0B0B] border border-neutral-800">
              <span className={`font-mono text-3xl font-bold tabular-nums ${product.compareAtPrice ? 'text-[#D71920]' : 'text-white'}`}>
                €{product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="font-mono text-lg text-neutral-500 line-through tabular-nums">
                    €{product.compareAtPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="px-2 py-0.5 bg-[#D71920] text-white text-xs font-mono font-bold">
                    -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
              <span className="text-xs text-neutral-500 font-mono">
                {language === 'pl' ? 'z VAT' : language === 'en' ? 'incl. VAT' : 'incl. btw'}
              </span>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Check className="w-4 h-4" />
              <span>{product.stock > 0 ? (language === 'pl' ? 'Dostępny · dostawa do Holandii w 7–10 dni roboczych' : language === 'en' ? 'In stock · delivery to the Netherlands in 7–10 business days' : 'Op voorraad · levering in Nederland binnen 7–10 werkdagen') : (language === 'pl' ? 'Chwilowo niedostępny' : language === 'en' ? 'Temporarily out of stock' : 'Tijdelijk uitverkocht')}</span>
            </div>

            {/* Direct Poland Supplier Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0E0E0E] border border-neutral-800 text-[11px] text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
              <span>
                {language === 'pl'
                  ? 'Oryginalny produkt polskiej marki Octagon'
                  : language === 'en'
                  ? 'Genuine product from the Polish brand Octagon'
                  : 'Origineel product van het Poolse merk Octagon'}
              </span>
            </div>

            {/* Warianty kolorystyczne (inne produkty z tej samej grupy) */}
            {variants.length > 0 && (
              <div>
                <label className="block text-xs font-condensed font-bold uppercase text-neutral-400 mb-2">
                  {language === 'pl' ? 'Inne warianty' : language === 'en' ? 'Other variants' : 'Andere varianten'}
                  {product.colors[0] && <>: <span className="text-white font-mono">{product.colors[0].name}</span></>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[rawProduct, ...variants].slice(0, 16).map(v => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/product/${v.slug}`)}
                      title={getLocalizedProduct(v, language).name}
                      className={`w-14 h-16 bg-white border-2 overflow-hidden cursor-pointer transition-all ${
                        v.id === rawProduct.id ? 'border-[#D71920]' : 'border-neutral-800 hover:border-neutral-500'
                      }`}
                    >
                      <img src={v.images[0]} alt="" className="w-full h-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {!onlyOneSize && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-condensed font-bold uppercase text-neutral-400">
                  {t('product.chooseSize')} <span className="text-white font-mono font-bold">{selectedSize}</span>
                </label>
                <button
                  onClick={() => openSizeGuide(product.category)}
                  className="text-xs text-[#D71920] hover:underline flex items-center gap-1 font-condensed font-bold uppercase cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" /> {t('product.sizeGuide')}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-3 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      selectedSize === s
                        ? 'border-[#D71920] bg-[#D71920] text-white'
                        : 'border-neutral-800 bg-[#121212] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Quantity Stepper & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-neutral-700 bg-[#111111] px-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950/30"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('product.addToCart')}</span>
                </button>
              </div>

              {/* Buy Now Direct */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#181818] hover:bg-[#252525] border border-neutral-700 hover:border-neutral-500 text-white font-condensed font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('product.buyNow')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Verzendkosten – automatisch uit gewicht */}
            {(() => {
              const q = quoteForProduct(product);
              const kg = q.kg.toFixed(1).replace('.', ',');
              if (q.freight) {
                return (
                  <div className="p-3 border border-amber-500/40 bg-amber-500/5 text-[12px] text-amber-300 leading-relaxed space-y-3">
                    <p>
                      {language === 'pl'
                        ? `Ciężki produkt (≈ ${kg} kg) – wysyłka tylko transportem paletowym. Koszt dostawy podajemy na zapytanie.`
                        : language === 'en'
                        ? `Heavy item (≈ ${kg} kg) – pallet delivery only. Shipping costs on request.`
                        : `Zwaar artikel (≈ ${kg} kg) – alleen te leveren per pallet. Verzendkosten op aanvraag.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => openWhatsApp({ topic: 'freight', product: product.name, quantity: 1 })}
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white py-2.5 font-condensed font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      {language === 'pl' ? 'Zapytaj o cenę wysyłki' : language === 'en' ? 'Ask for a shipping quote' : 'Vraag verzendprijs aan'}
                    </button>
                  </div>
                );
              }
              const tierLabel = TIERS[q.tier].label[(language === 'pl' || language === 'en' ? language : 'nl') as 'nl' | 'en' | 'pl'];
              return (
                <div className="p-3 border border-neutral-800 bg-[#0C0C0C] text-[12px] text-neutral-300 leading-relaxed">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-condensed font-bold uppercase tracking-wider text-white">
                      {language === 'pl' ? 'Wysyłka' : language === 'en' ? 'Shipping' : 'Verzendkosten'}
                    </span>
                    <span className="font-mono font-bold text-white">{formatEur(q.price)}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {tierLabel} · ≈ {kg} kg ·{' '}
                    {q.heavy
                      ? (language === 'pl' ? 'ciężka paczka, nie obejmuje jej darmowa dostawa' : language === 'en' ? 'heavy parcel, not covered by free shipping' : 'zwaar pakket, valt niet onder gratis verzending')
                      : (language === 'pl' ? `gratis od ${formatEur(FREE_SHIPPING_THRESHOLD)}` : language === 'en' ? `free from ${formatEur(FREE_SHIPPING_THRESHOLD)}` : `gratis vanaf ${formatEur(FREE_SHIPPING_THRESHOLD)}`)}
                  </p>
                </div>
              );
            })()}

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-4 h-4 text-[#D71920]" />
                <span>{t('product.postnl24')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#D71920]" />
                <span>{t('product.daysReturn')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#D71920]" />
                <span>{t('product.idealSecured')}</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-neutral-800 border-b border-neutral-800 text-xs">
              {/* Description */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between font-condensed font-bold uppercase tracking-wider text-white text-sm cursor-pointer"
                >
                  <span>{t('product.description')}</span>
                  {openAccordions.description ? <ChevronUp className="w-4 h-4 text-[#D71920]" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </button>
                {openAccordions.description && (
                  descriptionHtml ? (
                    <div
                      className="product-description mt-2.5 text-neutral-300 leading-relaxed font-body"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : (
                    <p className="mt-2.5 text-neutral-500 font-body">{product.shortDescription}</p>
                  )
                )}
              </div>

              {/* Tech details */}
              {product.technicalDetails && (
                <div className="py-3">
                  <button
                    onClick={() => toggleAccordion('tech')}
                    className="w-full flex items-center justify-between font-condensed font-bold uppercase tracking-wider text-white text-sm cursor-pointer"
                  >
                    <span>{t('product.techDetails')}</span>
                    {openAccordions.tech ? <ChevronUp className="w-4 h-4 text-[#D71920]" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                  </button>
                  {openAccordions.tech && (
                    <ul className="mt-2.5 space-y-1.5 text-neutral-400 list-disc list-inside font-mono">
                      {product.technicalDetails.map((td, i) => (
                        <li key={i}>{td}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Materials */}
              {product.material && (
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('materials')}
                  className="w-full flex items-center justify-between font-condensed font-bold uppercase tracking-wider text-white text-sm cursor-pointer"
                >
                  <span>{t('product.materials')}</span>
                  {openAccordions.materials ? <ChevronUp className="w-4 h-4 text-[#D71920]" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </button>
                {openAccordions.materials && (
                  <p className="mt-2.5 text-neutral-400 font-mono">
                    {product.material}
                  </p>
                )}
              </div>
              )}

              {/* Shipping & Returns */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between font-condensed font-bold uppercase tracking-wider text-white text-sm cursor-pointer"
                >
                  <span>{t('product.shippingInfo')}</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4 text-[#D71920]" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </button>
                {openAccordions.shipping && (
                  <p className="mt-2.5 text-neutral-400 leading-relaxed font-body">
                    {shippingAccordionText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* CROSS SELL: COMPLETE YOUR FIGHT KIT */}
        {/* ============================================================= */}
        {crossSellProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-neutral-800">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-[#D71920]" />
            <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
              {language === 'pl' ? 'Podobne produkty' : language === 'en' ? 'Similar products' : 'Vergelijkbare producten'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {crossSellProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0B0B0B]/98 border-t border-neutral-800 p-3 z-30 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl">
        <div className="truncate">
          <p className="font-condensed font-bold text-xs text-white truncate">{product.name}</p>
          <p className="font-mono text-sm font-bold text-[#D71920]">€{product.price.toFixed(2).replace('.', ',')}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className="px-6 py-2.5 bg-[#D71920] text-white font-condensed font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
        >
          {t('product.addToCart')}
        </button>
      </div>
    </div>
  );
};
