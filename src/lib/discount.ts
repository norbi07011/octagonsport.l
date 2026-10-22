import { useCallback, useEffect, useState } from 'react';

/*
 * Kod rabatowy po stronie przeglądarki – tylko PODGLĄD (koszyk i kasa).
 * Lista kodów i ostateczne naliczenie rabatu są na serwerze (server/discounts.ts, /api/checkout).
 * Zastosowany kod pamiętamy w sessionStorage, żeby przechodził z koszyka do kasy.
 */

export interface AppliedDiscount {
  code: string;
  percent: number;
  minSubtotal: number;
  firstOrderOnly: boolean;
}

const KEY = 'oct-discount';
const EVT = 'oct:discount';

const read = (): AppliedDiscount | null => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
};
const write = (d: AppliedDiscount | null) => {
  try { d ? sessionStorage.setItem(KEY, JSON.stringify(d)) : sessionStorage.removeItem(KEY); } catch {}
  try { window.dispatchEvent(new Event(EVT)); } catch {}
};

export const clearDiscount = () => write(null);

export function useDiscount(subtotal: number, lang: string) {
  const [applied, setApplied] = useState<AppliedDiscount | null>(read);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const on = () => setApplied(read());
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);

  const belowMin = !!applied && subtotal < applied.minSubtotal;
  const amount = applied && !belowMin ? Math.round(subtotal * applied.percent) / 100 : 0;

  const apply = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code) return false;
      setBusy(true);
      setError('');
      try {
        const r = await fetch('/api/discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal, lang }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error('');
        if (!d.ok) { setError(d.error || ''); return false; }
        write({ code: d.code, percent: d.percent, minSubtotal: d.minSubtotal, firstOrderOnly: !!d.firstOrderOnly });
        return true;
      } catch {
        setError(lang === 'pl' ? 'Nie udało się sprawdzić kodu. Spróbuj ponownie.' : lang === 'en' ? 'Could not check the code. Please try again.' : 'De code kon niet worden gecontroleerd. Probeer het opnieuw.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [subtotal, lang]
  );

  const remove = useCallback(() => { setError(''); write(null); }, []);

  return { applied, amount, belowMin, error, setError, busy, apply, remove };
}
