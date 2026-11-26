import { useCallback, useEffect, useState } from 'react';
import { bundleAmount, BundleLine, BundleRule } from './bundle';

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
  /** kod pakietowy (np. 2 pary legginsów za stałą cenę) – wtedy percent = 0 */
  bundle?: BundleRule;
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

export function useDiscount(subtotal: number, lang: string, cart: BundleLine[] = []) {
  const [applied, setApplied] = useState<AppliedDiscount | null>(read);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const on = () => setApplied(read());
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);

  const belowMin = !!applied && subtotal < applied.minSubtotal;
  const amount = !applied || belowMin ? 0 : applied.bundle ? bundleAmount(applied.bundle, cart) : Math.round(subtotal * applied.percent) / 100;
  /** kod pakietowy jest wpisany, ale w koszyku brakuje wymaganych produktów */
  const bundleMissing = !!applied?.bundle && amount <= 0;

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
        const d = await r.json().catch(() => null);
        // brak poprawnej odpowiedzi serwera – pokaż numer błędu, żeby łatwo znaleźć przyczynę
        if (!r.ok || !d) throw new Error(`HTTP ${r.status}${d ? '' : ' (geen JSON)'}`);
        if (!d.ok) { setError(d.error || ''); return false; }
        write({ code: d.code, percent: d.percent, minSubtotal: d.minSubtotal, firstOrderOnly: !!d.firstOrderOnly, bundle: d.bundle || undefined });
        return true;
      } catch (e: any) {
        const info = e?.message ? ` [${e.message}]` : ' [offline]';
        setError((lang === 'pl' ? 'Nie udało się sprawdzić kodu. Spróbuj ponownie.' : lang === 'en' ? 'Could not check the code. Please try again.' : 'De code kon niet worden gecontroleerd. Probeer het opnieuw.') + info);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [subtotal, lang]
  );

  const remove = useCallback(() => { setError(''); write(null); }, []);

  return { applied, amount, belowMin, bundleMissing, error, setError, busy, apply, remove };
}
