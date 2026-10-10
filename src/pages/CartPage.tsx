import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getLocalizedProduct } from '../data/products';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  Tag, 
  AlertCircle,
  PackageCheck,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ProductCard } from '../components/commerce/ProductCard';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    shippingQuote,
    total,
    freeShippingThreshold,
    amountForFreeShipping,
    navigate,
    language,
    t,
    showToast,
    toggleWishlist,
    isInWishlist,
    products
  } = useStore();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Recommendations: products not in cart
  const cartIds = cart.map(i => i.product.id);
  const recommendedProducts = products
    .filter(p => !cartIds.includes(p.id))
    .slice(0, 4);

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'OCTAGON10') {
      setAppliedPromo({ code, discount: 10 });
      setPromoError('');
      showToast(language === 'pl' ? 'Zastosowano kod OCTAGON10 (-€10)' : 'Kortingscode OCTAGON10 toegepast (-€10)');
    } else if (code === 'FIGHTCLUB') {
      setAppliedPromo({ code, discount: 15 });
      setPromoError('');
      showToast(language === 'pl' ? 'Zastosowano kod FIGHTCLUB (-€15)' : 'Kortingscode FIGHTCLUB toegepast (-€15)');
    } else if (code === 'PROMO2026') {
      setAppliedPromo({ code, discount: 5 });
      setPromoError('');
      showToast(language === 'pl' ? 'Zastosowano kod PROMO2026 (-€5)' : 'Kortingscode PROMO2026 toegepast (-€5)');
    } else {
      setPromoError(language === 'pl' ? 'Nieprawidłowy kod promocyjny' : 'Ongeldige actiecode');
    }
  };

  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotal = Math.max(0, Number((total - discountAmount).toFixed(2)));
  const subtotalExclVat = Number((finalTotal / 1.21).toFixed(2));
  const vatAmount = Number((finalTotal - subtotalExclVat).toFixed(2));

  const handleMoveToWishlist = (productId: string, size: string, color: string) => {
    if (!isInWishlist(productId)) {
      toggleWishlist(productId);
    }
    removeFromCart(productId, size, color);
    showToast(
      language === 'pl'
        ? 'Przeniesiono do listy życzeń!'
        : language === 'en'
        ? 'Moved to wishlist!'
        : 'Verplaatst naar verlanglijst!'
    );
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-[#0A0A0A] border-b border-neutral-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <button onClick={() => navigate('/')} className="hover:text-white cursor-pointer">HOME</button>
            <span>/</span>
            <span className="text-white uppercase font-bold">
              {language === 'pl' ? 'KOSZYK ZAKUPOWY' : language === 'en' ? 'SHOPPING CART' : 'WINKELWAGEN'}
            </span>
          </div>

          <button
            onClick={() => navigate('/category/fight-gear')}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-condensed uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'pl' ? 'Kontynuuj zakupy w sklepie' : 'Verder winkelen in de webshop'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title & Cart Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-neutral-800 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#D71920] font-bold block">
              {language === 'pl' ? 'OFICJALNY SKLEP OCTAGON BENELUX' : 'OFFICIËLE OCTAGON SPORT WEBSHOP'}
            </span>
            <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide mt-1">
              {language === 'pl' ? 'TWÓJ KOSZYK ZAKUPOWY' : 'JOUW WINKELWAGEN'}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span>
              {language === 'pl' 
                ? `${cart.reduce((a, b) => a + b.quantity, 0)} produktów w koszyku` 
                : `${cart.reduce((a, b) => a + b.quantity, 0)} artikelen in winkelwagen`}
            </span>
            {cart.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-neutral-500 hover:text-[#D71920] underline cursor-pointer"
              >
                {language === 'pl' ? 'Wyczyść koszyk' : 'Winkelwagen legen'}
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#121212] border border-neutral-700 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <AlertCircle className="w-10 h-10 text-[#D71920] mx-auto" />
              <h3 className="font-bebas text-2xl text-white">
                {language === 'pl' ? 'WYCZYŚCIĆ CAŁY KOSZYK?' : 'WINKELWAGEN LEGEN?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'pl'
                  ? 'Czy na pewno chcesz usunąć wszystkie produkty z koszyka?'
                  : 'Weet je zeker dat je alle artikelen wilt verwijderen?'}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-2.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase"
                >
                  {language === 'pl' ? 'Tak, wyczyść' : 'Ja, leegmaken'}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-condensed font-bold text-xs uppercase"
                >
                  {language === 'pl' ? 'Anuluj' : 'Annuleren'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-[#0C0C0C] border border-neutral-800 p-12 sm:p-16 text-center space-y-6">
            <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <div>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
                {language === 'pl' ? 'TWÓJ KOSZYK JEST PUSTY' : 'JE WINKELWAGEN IS LEEG'}
              </h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed">
                {language === 'pl'
                  ? 'Nie dodałeś jeszcze żadnego sprzętu ani odzieży Octagon. Odkryj naszą oficjalną kolekcję z Polski i wybierz sprzęt mistrzów!'
                  : 'Je hebt nog geen artikelen in je winkelwagen geplaatst. Bekijk onze officiële collectie bokshandschoenen, rashguards en streetwear!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/category/fight-gear')}
                className="px-8 py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-xl shadow-red-950/30 transition-colors"
              >
                <span>{language === 'pl' ? 'Przeglądaj Fight Gear' : 'Bekijk Fight Gear'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/category/heren')}
                className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-condensed font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors"
              >
                <span>{language === 'pl' ? 'Odzież & Streetwear' : 'Kleding & Streetwear'}</span>
              </button>
            </div>

            {/* Popular Gear Preview */}
            {recommendedProducts.length > 0 && (
              <div className="pt-12 border-t border-neutral-800/80 text-left">
                <h3 className="font-bebas text-2xl text-white tracking-wide mb-6 text-center">
                  {language === 'pl' ? 'POLECANY SPRZĘT DO ROZPOCZĘCIA TRENINGU' : 'AANBEVOLEN FIGHT GEAR'}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Cart Grid (7 cols items, 5 cols summary) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT: Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Free Shipping Progress Alert */}
              <div className="p-4 bg-[#0E0E0E] border border-neutral-800">
                <div className="flex items-center justify-between text-xs mb-2 font-mono">
                  <span className="flex items-center gap-2 text-neutral-300">
                    <Truck className="w-4 h-4 text-[#D71920]" />
                    {amountForFreeShipping === 0 ? (
                      <span className="text-emerald-400 font-bold">
                        {language === 'pl' 
                          ? 'Darmowa dostawa PostNL odblokowana!' 
                          : 'Gefeliciteerd! Gratis PostNL bezorging bereikt!'}
                      </span>
                    ) : (
                      <span>
                        {language === 'pl'
                          ? `Dodaj produkty za jeszcze €${amountForFreeShipping.toFixed(2)} do darmowej dostawy!`
                          : `Nog €${amountForFreeShipping.toFixed(2)} voor gratis PostNL bezorging!`}
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-white">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      amountForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-[#D71920]'
                    }`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card Table */}
              <div className="bg-[#0B0B0B] border border-neutral-800 divide-y divide-neutral-800/80">
                {cart.map((item) => {
                  const locP = getLocalizedProduct(item.product, language);
                  const lineTotal = Number((item.product.price * item.quantity).toFixed(2));
                  const inWish = isInWishlist(item.product.id);

                  return (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-[#0E0E0E] transition-colors"
                    >
                      {/* Thumbnail & Info */}
                      <div className="flex gap-4 items-start sm:items-center flex-1">
                        <div 
                          onClick={() => navigate(`/product/${item.product.slug}`)}
                          className="w-20 h-24 sm:w-24 sm:h-28 bg-[#141414] border border-neutral-800 shrink-0 overflow-hidden cursor-pointer hover:border-neutral-600 transition-colors"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={locP.name}
                            className="w-full h-full object-contain bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-neutral-400">
                            {item.product.brand} · SKU: {item.product.sku || item.product.id}
                          </span>
                          <h3 
                            onClick={() => navigate(`/product/${item.product.slug}`)}
                            className="font-condensed font-bold text-base text-white hover:text-[#D71920] cursor-pointer transition-colors"
                          >
                            {locP.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
                            <span className="bg-[#161616] px-2 py-0.5 border border-neutral-800 text-neutral-200">
                              {language === 'pl' ? 'Rozmiar' : 'Maat'}: <strong className="text-white">{item.selectedSize}</strong>
                            </span>
                            <span className="bg-[#161616] px-2 py-0.5 border border-neutral-800 text-neutral-200">
                              {language === 'pl' ? 'Kolor' : 'Kleur'}: {item.selectedColor}
                            </span>
                            {item.product.stock !== undefined && (
                              <span className="text-[11px] text-emerald-400">
                                ✓ {language === 'pl' ? 'Dostępny w magazynie' : 'Op voorraad'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => handleMoveToWishlist(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-[#D71920] text-[#D71920]' : ''}`} />
                              <span>{language === 'pl' ? 'Do schowka' : 'Naar verlanglijst'}</span>
                            </button>
                            <span className="text-neutral-700">|</span>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-[11px] text-neutral-400 hover:text-[#D71920] flex items-center gap-1 font-mono transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{language === 'pl' ? 'Usuń' : 'Verwijderen'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                        {/* Stepper */}
                        <div className="flex items-center border border-neutral-700 bg-black">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1)}
                            className="p-1.5 hover:text-white text-neutral-400 cursor-pointer"
                            aria-label="Aantal verminderen"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-mono text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1)}
                            className="p-1.5 hover:text-white text-neutral-400 cursor-pointer"
                            aria-label="Aantal verhogen"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line price */}
                        <div className="text-right">
                          <span className="font-mono text-lg font-black text-white tabular-nums block">
                            €{lineTotal.toFixed(2)}
                          </span>
                          <span className="font-mono text-[11px] text-neutral-500 tabular-nums">
                            €{item.product.price.toFixed(2)} / {language === 'pl' ? 'szt.' : 'st.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate('/category/fight-gear')}
                  className="py-3 px-5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'pl' ? 'Kontynuuj przeglądanie sklepu' : 'Verder winkelen in catalogus'}</span>
                </button>
                <button
                  onClick={() => navigate('/compare')}
                  className="text-xs text-neutral-400 hover:text-white underline font-mono cursor-pointer"
                >
                  {language === 'pl' ? 'Porównaj specyfikacje produktów' : 'Vergelijk specificaties'}
                </button>
              </div>
            </div>

            {/* RIGHT: Order Summary & Checkout (5 cols) */}
            <div className="lg:col-span-5 bg-[#0C0C0C] border border-neutral-800 p-6 sticky top-24 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h2 className="font-bebas text-2xl text-white tracking-wider">
                  {language === 'pl' ? 'PODSUMOWANIE ZAMÓWIENIA' : 'BESTELOVERZICHT'}
                </h2>
                <span className="text-xs font-mono text-emerald-400">
                  {language === 'pl' ? 'Holenderska Dystrybucja' : 'NL Dystributie'}
                </span>
              </div>

              {/* Promo Code Input */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D71920]" />
                  <span>{language === 'pl' ? 'Kod Rabatowy / Kupon' : 'Kortingscode of Actiecode'}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value)}
                    placeholder="OCTAGON10 / FIGHTCLUB"
                    className="bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white flex-1 focus:outline-none focus:border-[#D71920] font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-neutral-800 hover:bg-[#D71920] text-white font-condensed font-bold text-xs uppercase cursor-pointer transition-colors"
                  >
                    {language === 'pl' ? 'Zastosuj' : 'Toepassen'}
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 p-2 bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span>✓ {appliedPromo.code} (-€{appliedPromo.discount.toFixed(2)})</span>
                    <button 
                      onClick={() => setAppliedPromo(null)}
                      className="text-neutral-400 hover:text-white ml-2 text-[10px] underline"
                    >
                      Usuń
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-[#D71920] font-mono mt-1">{promoError}</p>
                )}
              </div>

              {/* Price Calculation Lines */}
              <div className="border-t border-neutral-800 pt-4 space-y-2.5 text-xs font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span>{language === 'pl' ? 'Wartość koszyka (subtotal):' : 'Subtotaal artikelen:'}</span>
                  <span className="tabular-nums font-bold text-white">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'pl' ? 'Dostawa' : language === 'en' ? 'Shipping' : 'Verzendkosten'} (≈ {shippingQuote.totalKg.toFixed(1).replace('.', ',')} kg):</span>
                  <span className="tabular-nums">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold">GRATIS</span>
                    ) : (
                      `€${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{language === 'pl' ? 'Rabat kuponu:' : 'Korting:'}</span>
                    <span className="tabular-nums font-bold">-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 pt-1 text-[11px]">
                  <span>{language === 'pl' ? 'W tym 21% holenderskiego BTW:' : 'Waarvan 21% BTW:'}</span>
                  <span className="tabular-nums">€{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-neutral-800">
                  <span className="font-bebas text-2xl">
                    {language === 'pl' ? 'DO ZAPŁATY (BRUTTO):' : 'TOTAAL (INCL. BTW):'}
                  </span>
                  <span className="font-mono text-2xl text-[#D71920] tabular-nums font-black">
                    €{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Primary Checkout CTA Button */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-950/40 transition-colors"
                >
                  <span>{language === 'pl' ? 'PRZEJDŹ DO KASY (iDEAL / PostNL)' : 'VEILIG AFREKENEN MET iDEAL'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/category/fight-gear')}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-condensed font-bold text-xs uppercase tracking-wider text-center cursor-pointer transition-colors border border-neutral-800"
                >
                  {language === 'pl' ? 'Kontynuuj zakupy' : 'Verder winkelen'}
                </button>
              </div>

              {/* Dutch Logistics & Trust Badges */}
              <div className="border-t border-neutral-800/80 pt-4 space-y-2 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'pl' ? 'Dostawa do Holandii: 7–10 dni roboczych' : language === 'en' ? 'Delivery to the Netherlands: 7–10 business days' : 'Levertijd Nederland: 7–10 werkdagen'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'pl' ? 'Bezpieczna płatność przez Mollie: iDEAL, Bancontact, karta, Klarna' : language === 'en' ? 'Secure payment via Mollie: iDEAL, Bancontact, card, Klarna' : 'Veilig betalen via Mollie: iDEAL, Bancontact, creditcard, Klarna'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zakelijk bestellen met KvK en 21% BTW-factuur</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
