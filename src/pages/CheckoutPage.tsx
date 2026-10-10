import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getLocalizedProduct } from '../data/products';
import { calcShipping, formatEur, FREE_SHIPPING_THRESHOLD, TIERS } from '../config/shipping';
import { openWhatsApp } from '../components/layout/WhatsAppWidget';

type L = 'nl' | 'en' | 'pl';
export const PENDING_PAYMENT_KEY = 'octagon_pending_payment';

const inputCls =
  'w-full bg-[#141414] border border-neutral-800 px-3 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D71920] transition-colors';
const errCls = '!border-[#D71920]';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, navigate, language, currentPath } = useStore();
  const lang = (language === 'pl' || language === 'en' ? language : 'nl') as L;
  const tr = (nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);

  const [business, setBusiness] = useState(false);
  const [delivery, setDelivery] = useState<'home' | 'pickup'>('home');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [bad, setBad] = useState<string[]>([]);
  const [f, setF] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    company: '', kvk: '', vat: '',
    street: '', houseNumber: '', addition: '', postalCode: '', city: '',
    notes: '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let v = e.target.value;
    if (k === 'postalCode') {
      v = v.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 6);
      if (v.length > 4) v = `${v.slice(0, 4)} ${v.slice(4)}`;
    }
    if (k === 'kvk') v = v.replace(/\D/g, '').slice(0, 8);
    setF(prev => ({ ...prev, [k]: v }));
    setBad(prev => prev.filter(x => x !== k));
  };

  const cancelled = currentPath.includes('status=geannuleerd');
  const quote = calcShipping(cart, subtotal, delivery);
  const homeQuote = calcShipping(cart, subtotal, 'home');
  const pickupQuote = calcShipping(cart, subtotal, 'pickup');
  const total = Math.round((subtotal + quote.fee) * 100) / 100;
  const vat = Math.round((total * 21) / 121 * 100) / 100;

  const validate = () => {
    const b: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) b.push('email');
    if (!f.firstName.trim()) b.push('firstName');
    if (!f.lastName.trim()) b.push('lastName');
    if (!f.street.trim()) b.push('street');
    if (!/^\d+[a-zA-Z]?$/.test(f.houseNumber.trim())) b.push('houseNumber');
    if (!/^\d{4} ?[A-Z]{2}$/.test(f.postalCode.trim())) b.push('postalCode');
    if (!f.city.trim()) b.push('city');
    if (business && !f.company.trim()) b.push('company');
    return b;
  };

  const pay = async () => {
    setError('');
    const b = validate();
    setBad(b);
    if (b.length) {
      setError(tr('Vul de gemarkeerde velden correct in.', 'Please complete the highlighted fields.', 'Uzupełnij poprawnie zaznaczone pola.'));
      return;
    }
    if (!acceptTerms) {
      setError(tr('Ga akkoord met de algemene voorwaarden.', 'Please accept the terms and conditions.', 'Zaakceptuj regulamin.'));
      return;
    }
    if (quote.freightItems.length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          acceptTerms,
          deliveryMethod: delivery,
          items: cart.map(i => ({ id: i.product.id, quantity: i.quantity, size: i.selectedSize, color: i.selectedColor })),
          customer: { ...f, company: business ? f.company : '', kvk: business ? f.kvk : '', vat: business ? f.vat : '' },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        if (Array.isArray(data.fields)) setBad(data.fields);
        throw new Error(data.error || '');
      }
      try {
        sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ id: data.paymentId, order: data.orderNumber, total: data.total }));
      } catch {}
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setBusy(false);
      setError(
        e?.message ||
          tr(
            'Online betalen is op dit moment niet beschikbaar. Probeer het later opnieuw of bestel via WhatsApp.',
            'Online payment is not available right now. Please try again later or order via WhatsApp.',
            'Płatność online jest teraz niedostępna. Spróbuj później lub zamów przez WhatsApp.'
          )
      );
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-bebas text-4xl">{tr('Je winkelwagen is leeg', 'Your cart is empty', 'Koszyk jest pusty')}</h1>
        <button onClick={() => navigate('/category/all')} className="px-6 py-3 bg-[#D71920] font-condensed font-bold text-xs uppercase tracking-wider">
          {tr('Verder winkelen', 'Continue shopping', 'Wróć do sklepu')}
        </button>
      </div>
    );
  }

  const field = (k: keyof typeof f, label: string, opts: { type?: string; ph?: string; auto?: string; optional?: boolean; className?: string } = {}) => (
    <label className={`block ${opts.className || ''}`}>
      <span className="mb-1.5 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
        {label} {!opts.optional && <span className="text-[#D71920]">*</span>}
      </span>
      <input
        type={opts.type || 'text'}
        value={f[k]}
        onChange={set(k)}
        placeholder={opts.ph}
        autoComplete={opts.auto}
        className={`${inputCls} ${bad.includes(k) ? errCls : ''}`}
      />
    </label>
  );

  const sectionTitle = (n: number, text: string) => (
    <h2 className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-5 font-bebas text-2xl tracking-wider text-white">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D71920] font-mono text-xs font-bold">{n}</span>
      {text}
    </h2>
  );

  return (
    <div className="bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <button onClick={() => navigate('/cart')} className="mb-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {tr('Terug naar winkelwagen', 'Back to cart', 'Wróć do koszyka')}
        </button>
        <h1 className="font-bebas text-5xl tracking-wide sm:text-6xl">{tr('Afrekenen', 'Checkout', 'Zamówienie')}</h1>

        {cancelled && (
          <div className="mt-4 flex items-start gap-3 border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            {tr(
              'De betaling is geannuleerd. Je winkelwagen is bewaard – je kunt het opnieuw proberen.',
              'The payment was cancelled. Your cart has been kept – you can try again.',
              'Płatność została anulowana. Koszyk jest zachowany – możesz spróbować ponownie.'
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* LEWA KOLUMNA – dane */}
          <div className="space-y-8">
            <section className="border border-neutral-800 bg-[#0B0B0B] p-5 sm:p-6">
              {sectionTitle(1, tr('Je gegevens', 'Your details', 'Twoje dane'))}
              <div className="mb-5 grid grid-cols-2 gap-2">
                {[false, true].map(isB => (
                  <button
                    key={String(isB)}
                    type="button"
                    onClick={() => setBusiness(isB)}
                    className={`py-2.5 text-xs font-condensed font-bold uppercase tracking-wider border transition-colors ${
                      business === isB ? 'border-[#D71920] bg-[#D71920]/10 text-white' : 'border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isB ? tr('Zakelijk', 'Business', 'Firma') : tr('Particulier', 'Private', 'Osoba prywatna')}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('email', 'E-mail', { type: 'email', ph: 'naam@voorbeeld.nl', auto: 'email', className: 'sm:col-span-2' })}
                {field('firstName', tr('Voornaam', 'First name', 'Imię'), { auto: 'given-name' })}
                {field('lastName', tr('Achternaam', 'Last name', 'Nazwisko'), { auto: 'family-name' })}
                {field('phone', tr('Telefoon (voor de bezorger)', 'Phone (for the courier)', 'Telefon (dla kuriera)'), { type: 'tel', ph: '06 12345678', auto: 'tel', optional: true, className: 'sm:col-span-2' })}
                {business && (
                  <>
                    {field('company', tr('Bedrijfsnaam', 'Company name', 'Nazwa firmy'), { auto: 'organization', className: 'sm:col-span-2' })}
                    {field('kvk', tr('KvK-nummer', 'Chamber of Commerce no.', 'Numer KvK'), { ph: '12345678', optional: true })}
                    {field('vat', tr('Btw-nummer', 'VAT number', 'Numer VAT'), { ph: 'NL123456789B01', optional: true })}
                  </>
                )}
              </div>
            </section>

            <section className="border border-neutral-800 bg-[#0B0B0B] p-5 sm:p-6">
              {sectionTitle(2, tr('Bezorgadres', 'Delivery address', 'Adres dostawy'))}
              <div className="grid grid-cols-6 gap-4">
                {field('postalCode', tr('Postcode', 'Postcode', 'Kod pocztowy'), { ph: '1234 AB', auto: 'postal-code', className: 'col-span-3 sm:col-span-2' })}
                {field('houseNumber', tr('Huisnr.', 'House no.', 'Nr domu'), { ph: '12', className: 'col-span-2 sm:col-span-2' })}
                {field('addition', tr('Toev.', 'Suffix', 'Dop.'), { ph: 'A', optional: true, className: 'col-span-1 sm:col-span-2' })}
                {field('street', tr('Straat', 'Street', 'Ulica'), { auto: 'address-line1', className: 'col-span-6 sm:col-span-4' })}
                {field('city', tr('Plaats', 'City', 'Miejscowość'), { auto: 'address-level2', className: 'col-span-6 sm:col-span-2' })}
              </div>
              <p className="mt-3 text-[11px] text-neutral-500">{tr('We bezorgen alleen in Nederland.', 'We only deliver within the Netherlands.', 'Dostarczamy tylko na terenie Holandii.')}</p>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{tr('Opmerking bij je bestelling', 'Order note', 'Uwagi do zamówienia')}</span>
                <textarea value={f.notes} onChange={set('notes')} rows={2} maxLength={300} className={`${inputCls} resize-none`} />
              </label>
            </section>

            <section className="border border-neutral-800 bg-[#0B0B0B] p-5 sm:p-6">
              {sectionTitle(3, tr('Bezorging', 'Delivery', 'Dostawa'))}
              <div className="space-y-3">
                {([
                  ['home', tr('Thuisbezorging', 'Home delivery', 'Dostawa do domu'), tr('PostNL met Track & Trace · 7–10 werkdagen', 'PostNL with tracking · 7–10 business days', 'PostNL ze śledzeniem · 7–10 dni roboczych'), homeQuote],
                  ['pickup', tr('Ophalen bij een PostNL-punt', 'Pick up at a PostNL point', 'Odbiór w punkcie PostNL'), tr('Bij het PostNL-punt het dichtst bij je adres · 7–10 werkdagen', 'At the PostNL point nearest to your address · 7–10 business days', 'W punkcie PostNL najbliżej twojego adresu · 7–10 dni roboczych'), pickupQuote],
                ] as const).map(([val, title, desc, q]) => (
                  <label key={val} className={`flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors ${delivery === val ? 'border-[#D71920] bg-[#D71920]/5' : 'border-neutral-800 hover:border-neutral-600'}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="delivery" checked={delivery === val} onChange={() => setDelivery(val)} className="accent-[#D71920]" />
                      <span>
                        <span className="block font-condensed text-sm font-bold uppercase tracking-wide">{title}</span>
                        <span className="block text-[11px] text-neutral-400">{desc}</span>
                      </span>
                    </span>
                    <span className="font-mono text-sm font-bold">{q.fee === 0 ? <span className="text-emerald-400">GRATIS</span> : formatEur(q.fee)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-1 border border-neutral-800 bg-[#121212] p-3 text-[11px] font-mono text-neutral-300">
                <div className="flex justify-between"><span className="text-neutral-500">{tr('Geschat gewicht', 'Estimated weight', 'Szacowana waga')}</span><span>≈ {quote.totalKg.toFixed(1).replace('.', ',')} kg</span></div>
                {quote.parcels.map((pc, i) => (
                  <div key={i} className="flex justify-between gap-3"><span>{quote.parcels.length > 1 ? `${i + 1}. ` : ''}{TIERS[pc.tier].label[lang]}</span><span>{formatEur(pc.price)}</span></div>
                ))}
                {quote.freeApplied && quote.fullFee > 0 && (
                  <p className="pt-1 text-emerald-400">{tr(`Gratis verzending vanaf ${formatEur(FREE_SHIPPING_THRESHOLD)}`, `Free shipping from ${formatEur(FREE_SHIPPING_THRESHOLD)}`, `Darmowa dostawa od ${formatEur(FREE_SHIPPING_THRESHOLD)}`)}{quote.heavyFee > 0 ? tr(' (behalve pakketten boven 23 kg)', ' (except parcels over 23 kg)', ' (poza paczkami powyżej 23 kg)') : ''}</p>
                )}
                {!quote.freeApplied && (
                  <p className="pt-1 text-neutral-500">{tr(`Nog ${formatEur(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} tot gratis verzending`, `${formatEur(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} more for free shipping`, `Brakuje ${formatEur(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} do darmowej dostawy`)}</p>
                )}
              </div>
              {quote.freightItems.length > 0 && (
                <div className="mt-4 border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-300 space-y-2">
                  <p>{tr('Te zwaar voor pakketbezorging (pallet): ', 'Too heavy for parcel delivery (pallet): ', 'Za ciężkie na kuriera (paleta): ')}{quote.freightItems.join(', ')}</p>
                  <button type="button" onClick={() => openWhatsApp({ topic: 'freight', product: quote.freightItems.join(', ') })} className="w-full bg-[#25D366] py-2 font-condensed text-xs font-bold uppercase tracking-wider text-white">
                    WhatsApp – {tr('vraag verzendprijs aan', 'ask for a shipping quote', 'zapytaj o cenę wysyłki')}
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* PRAWA KOLUMNA – podsumowanie */}
          <aside className="lg:sticky lg:top-24 h-fit border border-neutral-800 bg-[#0B0B0B] p-5 sm:p-6">
            <h2 className="border-b border-neutral-800 pb-3 mb-4 font-bebas text-2xl tracking-wider">{tr('Je bestelling', 'Your order', 'Twoje zamówienie')} ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const loc = getLocalizedProduct(item.product, language);
                return (
                  <li key={idx} className="flex gap-3">
                    <img src={item.product.images[0]} alt={loc.name} className="h-16 w-14 shrink-0 bg-white object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{loc.name}</p>
                      <p className="text-[11px] font-mono text-neutral-500">{[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')} · {item.quantity}×</p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-bold">{formatEur(item.product.price * item.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 space-y-2 border-t border-neutral-800 pt-4 text-sm">
              <div className="flex justify-between text-neutral-300"><span>{tr('Subtotaal', 'Subtotal', 'Produkty')}</span><span className="font-mono">{formatEur(subtotal)}</span></div>
              <div className="flex justify-between text-neutral-300"><span>{tr('Verzendkosten', 'Shipping', 'Wysyłka')}</span><span className="font-mono">{quote.fee === 0 ? <span className="text-emerald-400">GRATIS</span> : formatEur(quote.fee)}</span></div>
              <div className="flex justify-between border-t border-neutral-800 pt-3 text-lg font-bold"><span>{tr('Totaal', 'Total', 'Razem')}</span><span className="font-mono text-[#D71920]">{formatEur(total)}</span></div>
              <p className="text-right text-[11px] text-neutral-500">{tr('waarvan 21% btw', 'incl. 21% VAT', 'w tym 21% VAT')} {formatEur(vat)}</p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-neutral-300">
              <input type="checkbox" checked={acceptTerms} onChange={e => { setAcceptTerms(e.target.checked); setError(''); }} className="mt-0.5 h-4 w-4 shrink-0 accent-[#D71920]" />
              <span>
                {tr('Ik ga akkoord met de ', 'I agree to the ', 'Akceptuję ')}
                <button type="button" onClick={() => navigate('/algemene-voorwaarden')} className="underline hover:text-white">{tr('algemene voorwaarden', 'terms and conditions', 'regulamin')}</button>
                {tr(' en het ', ' and the ', ' i ')}
                <button type="button" onClick={() => navigate('/privacy')} className="underline hover:text-white">{tr('privacybeleid', 'privacy policy', 'politykę prywatności')}</button>
                {tr('. Ik heb 14 dagen bedenktijd.', '. I have a 14-day right of withdrawal.', '. Mam 14 dni na odstąpienie od umowy.')}
              </span>
            </label>

            {error && (
              <div className="mt-4 flex items-start gap-2 border border-[#D71920]/50 bg-[#D71920]/10 p-3 text-xs text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={pay}
              disabled={busy || quote.freightItems.length > 0}
              className="mt-5 flex w-full items-center justify-center gap-2 bg-[#D71920] py-4 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b01318] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {busy ? tr('Even geduld…', 'Please wait…', 'Chwileczkę…') : `${tr('Bestellen en betalen', 'Order and pay', 'Zamawiam i płacę')} · ${formatEur(total)}`}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-500">
              {tr(
                'Je kiest je betaalmethode op de beveiligde betaalpagina van Mollie: iDEAL, Bancontact, creditcard, Klarna en meer.',
                'You choose your payment method on Mollie’s secure payment page: iDEAL, Bancontact, credit card, Klarna and more.',
                'Metodę płatności wybierzesz na bezpiecznej stronie Mollie: iDEAL, Bancontact, karta, Klarna i inne.'
              )}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> {tr('Veilig betalen', 'Secure payment', 'Bezpieczna płatność')}</span>
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-emerald-400" /> 7–10 {tr('werkdagen', 'business days', 'dni rob.')}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
