import React from 'react';
import { useStore } from '../../context/StoreContext';

const KEY = 'octagon_cookie_notice_v1';

/**
 * Krótka informacja o cookies. Sklep nie używa ciasteczek śledzących ani analityki,
 * więc nie potrzeba zgody – to tylko uczciwa informacja z linkiem do polityki.
 * Jeśli kiedyś dodamy analitykę, tu trzeba będzie dodać prawdziwy wybór zgody.
 */
export const CookieNotice: React.FC = () => {
  const { language, navigate } = useStore();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setShow(false);
  };

  if (!show) return null;
  const t = (nl: string, en: string, pl: string) => (language === 'pl' ? pl : language === 'en' ? en : nl);

  return (
    <div className="fixed left-3 right-20 bottom-3 z-[80] sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-sm" role="region" aria-label="Cookies">
      <div className="border border-neutral-700 bg-[#0C0C0C]/95 p-4 shadow-2xl backdrop-blur-md">
        <p className="font-condensed text-sm font-bold uppercase tracking-wider text-white">🍪 {t('Alleen wat nodig is', 'Only what is necessary', 'Tylko to, co niezbędne')}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
          {t(
            'We gebruiken geen tracking- of advertentiecookies. Alleen je winkelwagen en taalkeuze worden in je browser bewaard.',
            'We use no tracking or advertising cookies. Only your cart and language are stored in your browser.',
            'Nie używamy ciasteczek śledzących ani reklamowych. W przeglądarce zapisujemy tylko koszyk i wybrany język.'
          )}
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={close} className="flex-1 bg-[#D71920] py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-white hover:bg-[#b51319]">
            OK
          </button>
          <button
            onClick={() => {
              close();
              navigate('/cookies');
            }}
            className="flex-1 border border-neutral-700 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-neutral-300 hover:border-white hover:text-white"
          >
            {t('Meer info', 'More info', 'Więcej')}
          </button>
        </div>
      </div>
    </div>
  );
};
