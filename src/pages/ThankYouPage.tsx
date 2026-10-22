import React from 'react';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PENDING_PAYMENT_KEY } from './CheckoutPage';
import { openWhatsApp } from '../components/layout/WhatsAppWidget';
import { VictoryScene } from '../components/fx/VictoryScene';
import { clearDiscount } from '../lib/discount';

type State = 'loading' | 'paid' | 'pending' | 'failed' | 'unknown';

/** Strona po powrocie z Mollie: /bedankt?order=OCT-… – sprawdza status płatności na serwerze. */
export const ThankYouPage: React.FC = () => {
  const { language, navigate, clearCart, currentPath } = useStore();
  const tr = (nl: string, en: string, pl: string) => (language === 'pl' ? pl : language === 'en' ? en : nl);
  const [state, setState] = React.useState<State>('loading');
  const [order, setOrder] = React.useState('');

  React.useEffect(() => {
    let pending: { id?: string; order?: string } = {};
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_PAYMENT_KEY) || '{}');
    } catch {}
    const params = new URLSearchParams(currentPath.split('?')[1] || '');
    const urlOrder = params.get('order') || '';
    setOrder(pending.order || urlOrder);
    // podgląd animacji bez płacenia: /bedankt?preview=1 (nic nie zmienia, nie czyści koszyka)
    if (params.get('preview') === '1') {
      if (!pending.order && !urlOrder) setOrder('OCT-PREVIEW');
      setState('paid');
      return;
    }
    if (!pending.id) {
      setState('unknown');
      return;
    }
    let tries = 0;
    let timer: number | undefined;
    const check = async () => {
      tries++;
      try {
        const r = await fetch(`/api/payment-status?id=${encodeURIComponent(pending.id!)}`);
        const d = await r.json();
        if (d.status === 'paid' || d.status === 'authorized') {
          setState('paid');
          clearCart();
          clearDiscount();
          try { sessionStorage.removeItem(PENDING_PAYMENT_KEY); } catch {}
          return;
        }
        if (['canceled', 'expired', 'failed'].includes(d.status)) {
          setState('failed');
          return;
        }
        setState('pending');
      } catch {
        setState('unknown');
        return;
      }
      if (tries < 10) timer = window.setTimeout(check, 3000);
    };
    check();
    return () => window.clearTimeout(timer);
  }, []);

  const box = (icon: React.ReactNode, title: string, text: string, extra?: React.ReactNode, bare?: boolean) => (
    <div className={`mx-auto max-w-xl px-4 text-center ${bare ? 'py-10 sm:py-12' : 'py-16 sm:py-24'}`}>
      {!bare && <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">{icon}</div>}
      {!bare && <h1 className="font-bebas text-5xl tracking-wide">{title}</h1>}
      {order && !bare && <p className="mt-2 font-mono text-sm text-neutral-400">{tr('Bestelnummer', 'Order number', 'Numer zamówienia')}: <span className="text-white">{order}</span></p>}
      <p className="mt-4 text-sm leading-relaxed text-neutral-300">{text}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {extra}
        <button onClick={() => navigate('/')} className="border border-neutral-700 px-6 py-3 font-condensed text-xs font-bold uppercase tracking-widest hover:border-white">
          {tr('Verder winkelen', 'Continue shopping', 'Wróć do sklepu')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh] bg-[#050505] text-white">
      {state === 'loading' && box(<Loader2 className="h-12 w-12 animate-spin text-neutral-400" />, tr('Betaling controleren…', 'Checking payment…', 'Sprawdzamy płatność…'), '')}
      {state === 'paid' && (
        <VictoryScene
          eyebrow={tr('Betaling gelukt · Round 1', 'Payment successful · Round 1', 'Płatność udana · Runda 1')}
          title={tr('Bedankt, kampioen!', 'Thanks, champ!', 'Dzięki, mistrzu!')}
          order={order}
          passLabel={tr('Octagon fight pass · bestelling', 'Octagon fight pass · order', 'Octagon fight pass · zamówienie')}
          dateLabel={tr('Betaald', 'Paid', 'Opłacone')}
        />
      )}
      {state === 'paid' &&
        box(
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />,
          tr('Bedankt voor je bestelling!', 'Thank you for your order!', 'Dziękujemy za zamówienie!'),
          tr(
            'Je betaling is gelukt. Je ontvangt een bevestiging per e-mail. We verzenden je bestelling binnen 7–10 werkdagen en sturen je een Track & Trace-code zodra het pakket onderweg is.',
            'Your payment was successful. You will receive a confirmation by e-mail. Your order will be delivered within 7–10 business days; we will send you a tracking code once it ships.',
            'Płatność się powiodła. Potwierdzenie otrzymasz mailem. Zamówienie dostarczymy w ciągu 7–10 dni roboczych, a po nadaniu paczki wyślemy numer śledzenia.'
          ),
          undefined,
          true
        )}
      {state === 'pending' &&
        box(
          <Clock className="h-16 w-16 text-amber-400" />,
          tr('Betaling wordt verwerkt', 'Payment is being processed', 'Płatność w toku'),
          tr(
            'We wachten nog op de bevestiging van je bank. Dit duurt meestal enkele seconden tot minuten. Je ontvangt een e-mail zodra de betaling binnen is.',
            'We are still waiting for confirmation from your bank. This usually takes a few seconds to minutes. You will get an e-mail once the payment is received.',
            'Czekamy jeszcze na potwierdzenie z banku. Zwykle trwa to od kilku sekund do kilku minut. Gdy płatność dotrze, dostaniesz maila.'
          )
        )}
      {state === 'failed' &&
        box(
          <XCircle className="h-16 w-16 text-[#D71920]" />,
          tr('Betaling niet gelukt', 'Payment not completed', 'Płatność nieudana'),
          tr(
            'De betaling is geannuleerd of mislukt. Er is niets afgeschreven en je winkelwagen is bewaard.',
            'The payment was cancelled or failed. Nothing has been charged and your cart has been kept.',
            'Płatność została anulowana lub się nie powiodła. Nic nie zostało pobrane, a koszyk jest zachowany.'
          ),
          <button onClick={() => navigate('/checkout')} className="bg-[#D71920] px-6 py-3 font-condensed text-xs font-bold uppercase tracking-widest hover:bg-[#b01318]">
            {tr('Opnieuw proberen', 'Try again', 'Spróbuj ponownie')}
          </button>
        )}
      {state === 'unknown' &&
        box(
          <Clock className="h-16 w-16 text-neutral-400" />,
          tr('Bedankt!', 'Thank you!', 'Dziękujemy!'),
          tr(
            'We konden de status van je betaling hier niet ophalen. Heb je betaald, dan ontvang je een bevestiging per e-mail. Twijfel je? Neem contact met ons op.',
            'We could not load your payment status here. If you paid, you will receive a confirmation e-mail. Not sure? Contact us.',
            'Nie udało się tu sprawdzić statusu płatności. Jeśli zapłaciłeś, dostaniesz potwierdzenie mailem. Masz wątpliwości? Skontaktuj się z nami.'
          ),
          <button onClick={() => openWhatsApp({ topic: 'order', product: order })} className="bg-[#25D366] px-6 py-3 font-condensed text-xs font-bold uppercase tracking-widest text-white">
            WhatsApp
          </button>
        )}
    </div>
  );
};
