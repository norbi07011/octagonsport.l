// /api/admin-orders – prywatny panel zamówień (strona /beheer).
//   GET                     → lista ostatnich płatności z Mollie (z pozycjami, adresem, statusem wysyłki)
//   POST {id, action:'ship', tracking?, notify?}   → oznacz jako wysłane (+ opcjonalnie mail do klienta z Track & Trace)
//   POST {id, action:'unship'}                    → cofnij „wysłane”
// Dostęp tylko z hasłem: nagłówek x-admin-key = zmienna ADMIN_PASSWORD (Netlify → Environment variables).
// Status wysyłki zapisujemy w metadanych płatności w Mollie – nie potrzeba osobnej bazy danych.
import { PRODUCTS } from '../src/data/products';
import { env, escapeHtml as e, json, Lang, mollie, readBody, sendMail, siteUrl } from './shared';
import { emailLayout, itemRowsHtml, linesToItems } from './orderItems';
import { DISCOUNT_CODES, partnerOf } from './discounts';

/** Porównanie haseł odporne na pomiar czasu. */
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

const T_SHIP = {
  subject: { nl: 'Je bestelling is verzonden', en: 'Your order has shipped', pl: 'Twoje zamówienie zostało wysłane' },
  hi: { nl: 'Hoi', en: 'Hi', pl: 'Cześć' },
  intro: {
    nl: 'Goed nieuws: je bestelling is onderweg!',
    en: 'Good news: your order is on its way!',
    pl: 'Dobra wiadomość: Twoje zamówienie jest w drodze!',
  },
  track: { nl: 'Track & Trace', en: 'Tracking code', pl: 'Numer śledzenia' },
  order: { nl: 'Bestelnummer', en: 'Order number', pl: 'Numer zamówienia' },
};

const toOrder = (p: any, site: string) => {
  const meta = p.metadata || {};
  const addr = p.shippingAddress || p.billingAddress || {};
  const items = linesToItems(p.lines, meta.i, site);
  const shipping = (p.lines || []).filter((l: any) => l.type === 'shipping_fee').reduce((s: number, l: any) => s + Number(l.totalAmount?.value || 0), 0);
  return {
    id: p.id,
    order: meta.order || p.id,
    status: p.status as string,
    method: p.method || '',
    mode: p.mode,
    createdAt: p.createdAt,
    paidAt: p.paidAt || null,
    amount: Number(p.amount?.value || 0),
    refunded: Number(p.amountRefunded?.value || 0),
    shippingFee: shipping,
    discount: Math.abs((p.lines || []).filter((l: any) => l.type === 'discount').reduce((s: number, l: any) => s + Number(l.totalAmount?.value || 0), 0)) || Number(meta.disc || 0),
    code: meta.code || '',
    codePartner: meta.code ? partnerOf(meta.code) : '',
    delivery: meta.delivery === 'pickup' ? 'pickup' : 'home',
    notes: meta.notes || '',
    kvk: meta.kvk || '',
    vat: meta.vat || '',
    lang: meta.lang || 'nl',
    shippedAt: meta.shippedAt || null,
    tracking: meta.tracking || '',
    customer: {
      name: [addr.givenName, addr.familyName].filter(Boolean).join(' '),
      company: addr.organizationName || '',
      street: addr.streetAndNumber || '',
      postalCode: addr.postalCode || '',
      city: addr.city || '',
      country: addr.country || '',
      email: addr.email || p.billingEmail || '',
      phone: addr.phone || '',
    },
    items,
  };
};

export default async function handler(req: any, res: any) {
  const pass = env('ADMIN_PASSWORD');
  if (!pass || pass.length < 8) return json(res, 503, { error: 'no-password' });
  const given = String(req.headers?.['x-admin-key'] || '');
  if (!safeEqual(given, pass)) {
    await new Promise(r => setTimeout(r, 600)); // spowolnienie zgadywania
    return json(res, 401, { error: 'unauthorized' });
  }
  if (!env('MOLLIE_API_KEY')) return json(res, 503, { error: 'no-mollie' });
  const site = siteUrl(req);

  try {
    if (req.method === 'GET') {
      // ostatnie płatności (do 1000) – potrzebne też do zestawienia kodów rabatowych
      const all: any[] = [];
      let path: string | null = '/payments?limit=250';
      for (let page = 0; path && page < 4; page++) {
        const data: any = await mollie(path);
        all.push(...(data?._embedded?.payments || []));
        const next: string | undefined = data?._links?.next?.href;
        path = next ? next.replace(/^https:\/\/api\.mollie\.com\/v2/, '') : null;
      }
      const list = all.map((p: any) => toOrder(p, site));
      const codes = DISCOUNT_CODES.map(({ code, percent, minSubtotal, firstOrderOnly, active, partner }) => ({ code, percent, minSubtotal, firstOrderOnly: !!firstOrderOnly, active, partner: partner || '' }));
      return json(res, 200, { orders: list, codes, products: PRODUCTS.length });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const id = String(body.id || '');
      if (!/^tr_[A-Za-z0-9]+$/.test(id)) return json(res, 400, { error: 'bad-id' });
      const p = await mollie(`/payments/${id}`);
      const meta = { ...(p.metadata || {}) };
      if (body.action === 'ship') {
        meta.shippedAt = new Date().toISOString();
        meta.tracking = String(body.tracking || '').trim().slice(0, 60) || undefined;
      } else if (body.action === 'unship') {
        delete meta.shippedAt;
        delete meta.tracking;
      } else return json(res, 400, { error: 'bad-action' });

      const updated = await mollie(`/payments/${id}`, { method: 'PATCH', body: { metadata: meta } });

      let mailed = false;
      if (body.action === 'ship' && body.notify) {
        const addr = p.shippingAddress || p.billingAddress || {};
        const to = addr.email || p.billingEmail;
        const lang: Lang = meta.lang === 'en' || meta.lang === 'pl' ? meta.lang : 'nl';
        const items = linesToItems(p.lines, meta.i, site);
        const track = meta.tracking
          ? `<p><strong>${T_SHIP.track[lang]}:</strong> ${e(meta.tracking)}<br><a href="https://jouw.postnl.nl/track-and-trace/${encodeURIComponent(meta.tracking)}-NL-${encodeURIComponent(String(addr.postalCode || '').replace(/\s+/g, ''))}" style="color:#D71920">PostNL Track & Trace →</a></p>`
          : '';
        if (to) {
          mailed = await sendMail(
            to,
            `${T_SHIP.subject[lang]} – ${meta.order || id}`,
            emailLayout(`<p>${T_SHIP.hi[lang]} ${e(addr.givenName || '')},</p><p>${T_SHIP.intro[lang]}</p>
<p><strong>${T_SHIP.order[lang]}:</strong> ${e(meta.order || id)}</p>${track}
<table style="width:100%;border-collapse:collapse;font-size:14px">${itemRowsHtml(items)}</table>`)
          );
        }
      }
      return json(res, 200, { order: toOrder(updated?.id ? updated : { ...p, metadata: meta }, site), mailed });
    }

    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'method' });
  } catch (err: any) {
    console.error('Admin error', err?.status, err?.message);
    return json(res, 502, { error: 'mollie', detail: String(err?.message || '').slice(0, 200) });
  }
}
