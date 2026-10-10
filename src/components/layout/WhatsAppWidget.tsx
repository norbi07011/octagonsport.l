import React from 'react';
import { useStore } from '../../context/StoreContext';
import { COMPANY } from '../../config/company';

type L = 'nl' | 'en' | 'pl';

/** Numer WhatsApp w formacie międzynarodowym bez „+” i spacji. */
export const WHATSAPP_NUMBER = COMPANY.phone.replace(/[^\d]/g, '');

export type WaTopic = 'order' | 'freight' | 'size' | 'return' | 'other';

export interface WaPreset {
  topic?: WaTopic;
  product?: string;
  quantity?: number;
}

/** Otwiera okno WhatsApp z formularzem (np. z karty produktu). */
export const openWhatsApp = (preset: WaPreset = {}) =>
  window.dispatchEvent(new CustomEvent<WaPreset>('octagon:whatsapp', { detail: preset }));

const T = {
  title: { nl: 'Vraag het via WhatsApp', en: 'Ask us on WhatsApp', pl: 'Zapytaj przez WhatsApp' },
  intro: {
    nl: 'Vul kort in waar het over gaat – we sturen je bericht direct door naar WhatsApp. Meestal antwoorden we dezelfde dag.',
    en: 'Fill in a few details – your message opens straight in WhatsApp. We usually reply the same day.',
    pl: 'Uzupełnij kilka pól – wiadomość od razu otworzy się w WhatsAppie. Zwykle odpowiadamy tego samego dnia.',
  },
  topic: { nl: 'Onderwerp', en: 'Topic', pl: 'Temat' },
  topics: {
    order: { nl: 'Vraag over een bestelling', en: 'Question about an order', pl: 'Pytanie o zamówienie' },
    freight: { nl: 'Verzendprijs zwaar artikel (bokszak)', en: 'Shipping quote for a heavy item (bag)', pl: 'Cena wysyłki ciężkiego produktu (worek)' },
    size: { nl: 'Maat- of productadvies', en: 'Size or product advice', pl: 'Dobór rozmiaru lub produktu' },
    return: { nl: 'Retour of klacht', en: 'Return or complaint', pl: 'Zwrot lub reklamacja' },
    other: { nl: 'Iets anders', en: 'Something else', pl: 'Coś innego' },
  },
  product: { nl: 'Product', en: 'Product', pl: 'Produkt' },
  productPh: { nl: 'Bijv. bokszak 180x45', en: 'e.g. heavy bag 180x45', pl: 'np. worek 180x45' },
  qty: { nl: 'Aantal', en: 'Quantity', pl: 'Ilość' },
  orderNo: { nl: 'Bestelnummer', en: 'Order number', pl: 'Numer zamówienia' },
  postcode: { nl: 'Postcode', en: 'Postcode', pl: 'Kod pocztowy' },
  city: { nl: 'Plaats', en: 'City', pl: 'Miejscowość' },
  name: { nl: 'Je naam', en: 'Your name', pl: 'Imię' },
  msg: { nl: 'Je vraag', en: 'Your question', pl: 'Twoje pytanie' },
  send: { nl: 'Verstuur via WhatsApp', en: 'Send via WhatsApp', pl: 'Wyślij przez WhatsApp' },
  close: { nl: 'Sluiten', en: 'Close', pl: 'Zamknij' },
  open: { nl: 'Chat via WhatsApp', en: 'Chat on WhatsApp', pl: 'Napisz na WhatsApp' },
  privacy: {
    nl: 'Je bericht wordt via WhatsApp (Meta) verstuurd.',
    en: 'Your message is sent via WhatsApp (Meta).',
    pl: 'Wiadomość zostanie wysłana przez WhatsApp (Meta).',
  },
  hello: { nl: 'Hallo OctagonSportNL!', en: 'Hi OctagonSportNL!', pl: 'Cześć OctagonSportNL!' },
};

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44a9.38 9.38 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.04.69C5.77.69.67 5.79.67 12.06c0 2 .52 3.96 1.52 5.69L.57 23.66l6.04-1.58a11.34 11.34 0 0 0 5.43 1.38h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.9-3.34-8.07z" />
  </svg>
);

const inputCls =
  'w-full bg-[#141414] border border-neutral-800 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#25D366]';

export const WhatsAppWidget: React.FC = () => {
  const { language, comparison, currentPath } = useStore();
  // Pływający przycisk tylko na stronie Kontakt; okno z formularzem działa wszędzie (openWhatsApp).
  const showButton = currentPath.split('?')[0] === '/contact';
  const lang = (language === 'pl' || language === 'en' ? language : 'nl') as L;
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ topic: 'order' as WaTopic, product: '', qty: '1', orderNo: '', postcode: '', city: '', name: '', msg: '' });

  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<WaPreset>).detail || {};
      setF(prev => ({
        ...prev,
        topic: d.topic ?? prev.topic,
        product: d.product ?? prev.product,
        qty: d.quantity ? String(d.quantity) : prev.qty,
      }));
      setOpen(true);
    };
    window.addEventListener('octagon:whatsapp', onOpen);
    return () => window.removeEventListener('octagon:whatsapp', onOpen);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const showProduct = f.topic === 'freight' || f.topic === 'size' || f.topic === 'order' || f.topic === 'other';
  const showAddress = f.topic === 'freight';
  const showOrderNo = f.topic === 'order' || f.topic === 'return';

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      T.hello[lang],
      `${T.topic[lang]}: ${T.topics[f.topic][lang]}`,
      showProduct && f.product ? `${T.product[lang]}: ${f.product}` : '',
      showProduct && f.product ? `${T.qty[lang]}: ${f.qty || '1'}` : '',
      showOrderNo && f.orderNo ? `${T.orderNo[lang]}: ${f.orderNo}` : '',
      showAddress && (f.postcode || f.city) ? `${T.postcode[lang]} / ${T.city[lang]}: ${[f.postcode, f.city].filter(Boolean).join(' ')}` : '',
      f.msg ? `\n${f.msg}` : '',
      f.name ? `\n— ${f.name}` : '',
    ].filter(Boolean);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    setOpen(false);
  };

  return (
    <>
      {/* pływający przycisk – tylko na stronie Kontakt */}
      {showButton && (
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={T.open[lang]}
        title={T.open[lang]}
        className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,.55)] transition-all duration-300 hover:scale-105 sm:right-6 ${
          comparison.length > 0 ? 'bottom-28' : 'bottom-5 sm:bottom-6'
        }`}
      >
        <WhatsAppIcon className="relative h-7 w-7" />
      </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-[2px] sm:items-end sm:justify-end sm:bg-transparent sm:backdrop-blur-0 sm:p-6" onClick={() => setOpen(false)}>
          <form
            onSubmit={send}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={T.title[lang]}
            className="w-full max-h-[90vh] overflow-y-auto border border-neutral-800 bg-[#0B0B0B] shadow-2xl sm:mb-20 sm:w-[380px] sm:rounded-lg"
          >
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white sm:rounded-t-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-condensed text-sm font-bold uppercase tracking-wider">{T.title[lang]}</p>
                <p className="text-[11px] text-white/80">OctagonSportNL · {COMPANY.phone}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={T.close[lang]} className="text-2xl leading-none text-white/80 hover:text-white">
                ×
              </button>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-xs leading-relaxed text-neutral-400">{T.intro[lang]}</p>

              <label className="block">
                <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.topic[lang]}</span>
                <select value={f.topic} onChange={set('topic')} className={inputCls}>
                  {(Object.keys(T.topics) as WaTopic[]).map(k => (
                    <option key={k} value={k}>{T.topics[k][lang]}</option>
                  ))}
                </select>
              </label>

              {showProduct && (
                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.product[lang]}</span>
                    <input value={f.product} onChange={set('product')} placeholder={T.productPh[lang]} className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.qty[lang]}</span>
                    <input type="number" min={1} value={f.qty} onChange={set('qty')} className={inputCls} />
                  </label>
                </div>
              )}

              {showOrderNo && (
                <label className="block">
                  <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.orderNo[lang]}</span>
                  <input value={f.orderNo} onChange={set('orderNo')} placeholder="OCT-…" className={inputCls} />
                </label>
              )}

              {showAddress && (
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.postcode[lang]}</span>
                    <input value={f.postcode} onChange={set('postcode')} placeholder="1234 AB" autoComplete="postal-code" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.city[lang]}</span>
                    <input value={f.city} onChange={set('city')} autoComplete="address-level2" className={inputCls} />
                  </label>
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.name[lang]}</span>
                <input value={f.name} onChange={set('name')} autoComplete="given-name" className={inputCls} />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">{T.msg[lang]}</span>
                <textarea value={f.msg} onChange={set('msg')} rows={3} className={`${inputCls} resize-none`} />
              </label>

              <button type="submit" className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#1ebe5b]">
                <WhatsAppIcon className="h-5 w-5" /> {T.send[lang]}
              </button>
              <p className="text-center text-[10px] text-neutral-500">{T.privacy[lang]}</p>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
