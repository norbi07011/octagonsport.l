// POST /api/mollie-webhook – Mollie informuje o zmianie statusu płatności (pole id=tr_…).
// Status zawsze pobieramy z API Mollie (fałszywe wywołania nic nie zrobią).
// Po opłaceniu: mail z potwierdzeniem do klienta + powiadomienie do sklepu (jeśli ustawiono Resend).
import { COMPANY, COMPANY_ADDRESS_LINE } from '../src/config/company';
import { env, escapeHtml as e, Lang, mollie, readBody, sendMail } from './shared';

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

const lineRows = (lines: any[] = []) =>
  lines
    .map(
      l => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${l.quantity}× ${e(l.description)}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">€${e(l.totalAmount?.value)}</td></tr>`
    )
    .join('');

const addressBlock = (a: any) =>
  a ? `${a.organizationName ? e(a.organizationName) + '<br>' : ''}${e(a.givenName)} ${e(a.familyName)}<br>${e(a.streetAndNumber)}<br>${e(a.postalCode)} ${e(a.city)}` : '';

const layout = (inner: string) => `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111">
<div style="max-width:560px;margin:0 auto;background:#fff">
<div style="background:#050505;color:#fff;padding:18px 24px;font-size:20px;letter-spacing:2px;font-weight:bold">OCTAGON <span style="color:#D71920;font-size:12px">SPORT NL</span></div>
<div style="padding:24px;font-size:14px;line-height:1.6">${inner}</div>
<div style="padding:16px 24px;background:#fafafa;color:#777;font-size:11px;line-height:1.5">${e(COMPANY.name)} · ${e(COMPANY_ADDRESS_LINE)} · KvK ${e(COMPANY.kvk)} · BTW ${e(COMPANY.btw)}<br>${e(COMPANY.email)} · ${e(COMPANY.phone)} · ${e(COMPANY.website)}</div>
</div></body></html>`;

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

      if (email) {
        await sendMail(
          email,
          `${T.subject[lang]} – ${order}`,
          layout(`<p>${T.hi[lang]} ${e(addr?.givenName || '')},</p><p>${T.intro[lang]}</p>
<p><strong>${T.order[lang]}:</strong> ${e(order)}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${lineRows(p.lines)}
<tr><td style="padding:10px 0;font-weight:bold">${T.total[lang]}</td><td style="padding:10px 0;text-align:right;font-weight:bold">€${e(p.amount?.value)}</td></tr></table>
<p><strong>${T.ship[lang]}:</strong><br>${addressBlock(addr)}</p><p>${T.returns[lang]}</p>`)
        );
      }

      const shopEmail = env('SHOP_EMAIL') || COMPANY.email;
      await sendMail(
        shopEmail,
        `Nieuwe bestelling ${order} – €${p.amount?.value}`,
        layout(`<p><strong>Nieuwe betaalde bestelling</strong> (${e(p.method || '')})</p>
<p><strong>Bestelnummer:</strong> ${e(order)}<br><strong>Mollie:</strong> ${e(p.id)}<br><strong>Bezorging:</strong> ${meta.delivery === 'pickup' ? 'PostNL-punt' : 'Thuisbezorging'}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${lineRows(p.lines)}
<tr><td style="padding:10px 0;font-weight:bold">Totaal</td><td style="padding:10px 0;text-align:right;font-weight:bold">€${e(p.amount?.value)}</td></tr></table>
<p><strong>Klant:</strong><br>${addressBlock(addr)}<br>${e(addr?.email || '')}<br>${e(addr?.phone || '')}</p>
${meta.kvk || meta.vat ? `<p><strong>Zakelijk:</strong> KvK ${e(meta.kvk || '-')} · BTW ${e(meta.vat || '-')}</p>` : ''}
${meta.notes ? `<p><strong>Opmerking:</strong> ${e(meta.notes)}</p>` : ''}
<p>Alle details staan in het Mollie-dashboard.</p>`),
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
