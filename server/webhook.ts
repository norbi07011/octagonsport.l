// POST /api/mollie-webhook – Mollie informuje o zmianie statusu płatności (pole id=tr_…).
// Status zawsze pobieramy z API Mollie (fałszywe wywołania nic nie zrobią).
// Po opłaceniu: mail z potwierdzeniem do klienta + powiadomienie do sklepu (jeśli ustawiono Resend).
import { COMPANY, COMPANY_ADDRESS_LINE } from '../src/config/company';
import { env, escapeHtml as e, Lang, mollie, readBody, sendMail, siteUrl } from './shared';
import { emailLayout, itemRowsHtml, linesToItems } from './orderItems';

const eur = (v: unknown) => Number(v || 0).toFixed(2).replace('.', ',');

const T = {
  subject: { nl: 'Bedankt voor je bestelling', en: 'Thank you for your order', pl: 'Dziękujemy za zamówienie' },
  hi: { nl: 'Hoi', en: 'Hi', pl: 'Cześć' },
  intro: {
    nl: 'We hebben je betaling ontvangen en gaan je bestelling klaarmaken. De levertijd is 7–10 werkdagen; zodra je pakket onderweg is, ontvang je een Track & Trace-code.',
    en: 'We have received your payment and are preparing your order. Delivery takes 7–10 business days; you will receive a tracking code once your parcel ships.',
    pl: 'Otrzymaliśmy płatność i przygotowujemy zamówienie. Dostawa trwa 7–10 dni roboczych; gdy paczka zostanie nadana, otrzymasz numer śledzenia.',
  },
  order: { nl: 'Bestelnummer', en: 'Order number', pl: 'Numer zamówienia' },
  total: { nl: 'Totaal (incl. btw)', en: 'Total (incl. VAT)', pl: 'Razem (z VAT)' },
  ship: { nl: 'Bezorgadres', en: 'Delivery address', pl: 'Adres dostawy' },
  returns: {
    nl: 'Je hebt 14 dagen bedenktijd. Vragen? Beantwoord deze e-mail of stuur ons een WhatsApp-bericht.',
    en: 'You have a 14-day right of withdrawal. Questions? Reply to this e-mail or send us a WhatsApp message.',
    pl: 'Masz 14 dni na odstąpienie od umowy. Pytania? Odpowiedz na tego maila lub napisz na WhatsApp.',
  },
};

const addressBlock = (a: any) =>
  a ? `${a.organizationName ? e(a.organizationName) + '<br>' : ''}${e(a.givenName)} ${e(a.familyName)}<br>${e(a.streetAndNumber)}<br>${e(a.postalCode)} ${e(a.city)}` : '';

export default async function handler(req: any, res: any) {
  // Zawsze 200 – Mollie inaczej ponawia wywołanie.
  const done = () => {
    res.status(200);
    res.end('OK');
  };
  if (req.method !== 'POST') return done();
  const id = String(readBody(req).id || '');
  if (!/^tr_[A-Za-z0-9]+$/.test(id)) return done();

  try {
    const p = await mollie(`/payments/${id}`);
    const meta = p.metadata || {};
    const lang: Lang = meta.lang === 'en' || meta.lang === 'pl' ? meta.lang : 'nl';
    const paidRecently = p.status === 'paid' && p.paidAt && Date.now() - Date.parse(p.paidAt) < 6 * 3600 * 1000;
    const refunded = Number(p.amountRefunded?.value || 0) > 0;

    // Maile wysyłamy tylko raz – przy świeżo opłaconej płatności (kolejne webhooki, np. przy zwrocie, są pomijane).
    if (paidRecently && !refunded && !p.amountChargedBack) {
      const addr = p.shippingAddress || p.billingAddress;
      const email = addr?.email || p.billingEmail;
      const order = meta.order || p.id;
      const site = siteUrl(req);
      const items = linesToItems(p.lines, meta.i, site);
      const shipFee = (p.lines || []).filter((l: any) => l.type === 'shipping_fee').reduce((s: number, l: any) => s + Number(l.totalAmount?.value || 0), 0);
      const shipRow = shipFee ? `<tr><td></td><td style="padding:8px 0;color:#555">Verzending</td><td style="padding:8px 0;text-align:right;color:#555">€${eur(shipFee)}</td></tr>` : '';
      const disc = Math.abs((p.lines || []).filter((l: any) => l.type === 'discount').reduce((s: number, l: any) => s + Number(l.totalAmount?.value || 0), 0)) || Number(meta.disc || 0);
      const discRow = disc ? `<tr><td></td><td style="padding:8px 0;color:#0a7d3b">Kortingscode ${e(meta.code || '')}</td><td style="padding:8px 0;text-align:right;color:#0a7d3b">-€${eur(disc)}</td></tr>` : '';

      if (email) {
        await sendMail(
          email,
          `${T.subject[lang]} – ${order}`,
          emailLayout(`<p>${T.hi[lang]} ${e(addr?.givenName || '')},</p><p>${T.intro[lang]}</p>
<p><strong>${T.order[lang]}:</strong> ${e(order)}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${itemRowsHtml(items)}${discRow}${shipRow}
<tr><td></td><td style="padding:10px 0;font-weight:bold">${T.total[lang]}</td><td style="padding:10px 0;text-align:right;font-weight:bold">€${eur(p.amount?.value)}</td></tr></table>
<p><strong>${T.ship[lang]}:</strong><br>${addressBlock(addr)}</p><p>${T.returns[lang]}</p>`)
        );
      }

      const shopEmail = env('SHOP_EMAIL') || COMPANY.email;
      await sendMail(
        shopEmail,
        `🛒 Nowe zamówienie ${order} – €${eur(p.amount?.value)}${meta.code ? ` [kod ${meta.code}]` : ''} – ${items.map(i => `${i.qty}× ${i.name}${i.size ? ` (${i.size})` : ''}`).join(', ').slice(0, 120)}`,
        emailLayout(`<p><strong>Nowe opłacone zamówienie</strong> (${e(p.method || '')}${p.mode === 'test' ? ' · TEST' : ''})</p>
<p><strong>Numer zamówienia:</strong> ${e(order)}<br><strong>Mollie:</strong> ${e(p.id)}<br><strong>Dostawa:</strong> ${meta.delivery === 'pickup' ? 'punkt PostNL' : 'do domu'}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${itemRowsHtml(items)}${discRow}${shipRow}
<tr><td></td><td style="padding:10px 0;font-weight:bold">Razem</td><td style="padding:10px 0;text-align:right;font-weight:bold">€${eur(p.amount?.value)}</td></tr></table>
<p><strong>Klient:</strong><br>${addressBlock(addr)}<br>${e(addr?.email || '')}<br>${e(addr?.phone || '')}</p>
${meta.kvk || meta.vat ? `<p><strong>Firma:</strong> KvK ${e(meta.kvk || '-')} · BTW ${e(meta.vat || '-')}</p>` : ''}
${meta.notes ? `<p><strong>Uwagi klienta:</strong> ${e(meta.notes)}</p>` : ''}
<p style="margin-top:20px"><a href="${site}/beheer#${e(p.id)}" style="display:inline-block;background:#D71920;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px">Otwórz zamówienie w panelu →</a></p>`),
        email
      );
    }
  } catch (err: any) {
    console.error('Webhook error', err?.status, err?.message);
    // Błąd po naszej stronie → 500, żeby Mollie spróbowało ponownie później.
    res.status(500);
    return res.end('retry');
  }
  return done();
}
