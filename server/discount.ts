// POST /api/discount {code, subtotal} – sprawdza kod rabatowy (podgląd w koszyku i kasie).
// Ostateczne sprawdzenie i naliczenie rabatu robi /api/checkout (tu nie ufamy kwotom z przeglądarki).
import { checkDiscount } from './discounts';
import { json, readBody } from './shared';

const MSG = {
  unknown: { nl: 'Deze kortingscode bestaat niet of is verlopen.', en: 'This discount code does not exist or has expired.', pl: 'Ten kod rabatowy nie istnieje lub wygasł.' },
  min: { nl: 'Deze code geldt vanaf €{min} aan producten.', en: 'This code applies from €{min} in products.', pl: 'Ten kod działa od €{min} za produkty.' },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  const body = readBody(req);
  const lang: 'nl' | 'en' | 'pl' = body.lang === 'en' || body.lang === 'pl' ? body.lang : 'nl';
  const subtotal = Math.max(0, Number(body.subtotal) || 0);
  // e-maila tu nie sprawdzamy – „tylko pierwsze zamówienie” weryfikuje kasa
  const r = await checkDiscount(body.code, subtotal);
  if (!r.ok) {
    await new Promise(t => setTimeout(t, 300)); // spowolnienie zgadywania kodów
    const text = r.reason === 'min' ? MSG.min[lang].replace('{min}', String(r.minSubtotal)) : MSG.unknown[lang];
    return json(res, 200, { ok: false, reason: r.reason, minSubtotal: r.minSubtotal, error: text });
  }
  return json(res, 200, { ok: true, code: r.code, percent: r.percent, minSubtotal: r.minSubtotal, firstOrderOnly: r.firstOrderOnly });
}
