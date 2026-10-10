// POST /api/checkout – tworzy płatność w Mollie i zwraca adres strony płatności.
// Ceny i koszt wysyłki liczone są TUTAJ (na serwerze) z katalogu – klient nie może ich zmienić.
import { PRODUCTS } from '../src/data/products';
import { calcShipping } from '../src/config/shipping';
import { CartItem } from '../src/types';
import { env, json, Lang, mollie, money, readBody, round2, siteUrl, vatOf } from './shared';

const LOCALE: Record<Lang, string> = { nl: 'nl_NL', en: 'en_NL', pl: 'pl_PL' };

const MSG = {
  invalid: { nl: 'Controleer je gegevens.', en: 'Please check your details.', pl: 'Sprawdź swoje dane.' },
  empty: { nl: 'Je winkelwagen is leeg.', en: 'Your cart is empty.', pl: 'Koszyk jest pusty.' },
  unknown: { nl: 'Een product is niet meer beschikbaar. Vernieuw je winkelwagen.', en: 'A product is no longer available. Please refresh your cart.', pl: 'Jeden z produktów jest niedostępny. Odśwież koszyk.' },
  freight: { nl: 'Een artikel is te zwaar voor pakketbezorging – vraag de verzendprijs aan via WhatsApp.', en: 'An item is too heavy for parcel delivery – ask for a quote via WhatsApp.', pl: 'Produkt jest za ciężki na kuriera – zapytaj o cenę wysyłki przez WhatsApp.' },
  terms: { nl: 'Ga akkoord met de algemene voorwaarden.', en: 'Please accept the terms.', pl: 'Zaakceptuj regulamin.' },
  config: { nl: 'Online betalen is nog niet geactiveerd. Probeer het later opnieuw of neem contact op.', en: 'Online payment is not active yet. Please try again later or contact us.', pl: 'Płatności online nie są jeszcze aktywne. Spróbuj później lub skontaktuj się z nami.' },
  mollie: { nl: 'Betaling kon niet worden gestart. Probeer het opnieuw.', en: 'Payment could not be started. Please try again.', pl: 'Nie udało się rozpocząć płatności. Spróbuj ponownie.' },
};

const str = (v: unknown, max = 100) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Telefon w formacie międzynarodowym (+31…), wymaganym przez Mollie; inaczej pomijamy. */
const phoneE164 = (raw: string) => {
  let p = raw.replace(/[^\d+]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  else if (p.startsWith('0')) p = '+31' + p.slice(1);
  return /^\+\d{8,15}$/.test(p) ? p : undefined;
};

const orderNumber = () => {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OCT-${ymd}-${rnd}`;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  const body = readBody(req);
  const lang: Lang = body.lang === 'en' || body.lang === 'pl' ? body.lang : 'nl';
  const fail = (status: number, key: keyof typeof MSG, extra: object = {}) => json(res, status, { error: MSG[key][lang], ...extra });

  if (!env('MOLLIE_API_KEY')) return fail(503, 'config');
  if (body.acceptTerms !== true) return fail(400, 'terms');

  // --- klient
  const c = body.customer || {};
  const customer = {
    firstName: str(c.firstName, 60),
    lastName: str(c.lastName, 60),
    email: str(c.email, 120).toLowerCase(),
    phone: str(c.phone, 30),
    company: str(c.company, 100),
    kvk: str(c.kvk, 12),
    vat: str(c.vat, 20),
    street: str(c.street, 100),
    houseNumber: str(c.houseNumber, 10),
    addition: str(c.addition, 10),
    postalCode: str(c.postalCode, 8).toUpperCase().replace(/\s+/g, ''),
    city: str(c.city, 60),
    notes: str(c.notes, 300),
  };
  const errors: string[] = [];
  if (!customer.firstName) errors.push('firstName');
  if (!customer.lastName) errors.push('lastName');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) errors.push('email');
  if (!customer.street) errors.push('street');
  if (!/^\d+[a-zA-Z]?$/.test(customer.houseNumber)) errors.push('houseNumber');
  if (!/^\d{4}[A-Z]{2}$/.test(customer.postalCode)) errors.push('postalCode');
  if (!customer.city) errors.push('city');
  if (errors.length) return fail(400, 'invalid', { fields: errors });
  const postalCode = `${customer.postalCode.slice(0, 4)} ${customer.postalCode.slice(4)}`;

  // --- koszyk (ceny z katalogu na serwerze)
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (!items.length) return fail(400, 'empty');
  const cart: CartItem[] = [];
  for (const it of items) {
    const product = PRODUCTS.find(p => p.id === it?.id);
    const quantity = Math.floor(Number(it?.quantity));
    if (!product || !(quantity >= 1 && quantity <= 20)) return fail(400, 'unknown');
    const size = str(it.size, 30);
    if (product.sizes.length && size && !product.sizes.includes(size)) return fail(400, 'unknown');
    cart.push({ product, quantity, selectedSize: size, selectedColor: str(it.color, 40) });
  }

  const subtotal = round2(cart.reduce((s, i) => s + i.product.price * i.quantity, 0));
  const delivery = body.deliveryMethod === 'pickup' ? 'pickup' : 'home';
  const quote = calcShipping(cart, subtotal, delivery);
  if (quote.freightItems.length) return fail(400, 'freight');
  const total = round2(subtotal + quote.fee);

  const site = siteUrl(req);
  const order = orderNumber();

  const lines: any[] = cart.map(i => {
    const lineTotal = round2(i.product.price * i.quantity);
    const variant = [i.selectedSize, i.selectedColor].filter(Boolean).join(', ');
    return {
      type: 'physical',
      description: `${i.product.name}${variant ? ` (${variant})` : ''}`.slice(0, 100),
      quantity: i.quantity,
      unitPrice: money(i.product.price),
      totalAmount: money(lineTotal),
      vatRate: '21.00',
      vatAmount: money(vatOf(lineTotal)),
      sku: i.product.sku,
      productUrl: `${site}/product/${i.product.slug}`,
      imageUrl: i.product.images[0] ? `${site}${i.product.images[0]}` : undefined,
    };
  });
  if (quote.fee > 0) {
    lines.push({
      type: 'shipping_fee',
      description: delivery === 'pickup' ? 'Verzending (PostNL-punt)' : 'Verzending',
      quantity: 1,
      unitPrice: money(quote.fee),
      totalAmount: money(quote.fee),
      vatRate: '21.00',
      vatAmount: money(vatOf(quote.fee)),
    });
  }

  const address: any = {
    givenName: customer.firstName,
    familyName: customer.lastName,
    organizationName: customer.company || undefined,
    streetAndNumber: `${customer.street} ${customer.houseNumber}${customer.addition ? ` ${customer.addition}` : ''}`,
    postalCode,
    city: customer.city,
    country: 'NL',
    email: customer.email,
    phone: phoneE164(customer.phone),
  };

  const payment: any = {
    amount: money(total),
    description: `Bestelling ${order} – OctagonSportNL`,
    redirectUrl: `${site}/bedankt?order=${order}`,
    cancelUrl: `${site}/checkout?status=geannuleerd`,
    webhookUrl: `${site}/api/mollie-webhook`,
    locale: LOCALE[lang],
    lines,
    billingAddress: address,
    shippingAddress: address,
    metadata: {
      order,
      delivery,
      lang,
      kvk: customer.kvk || undefined,
      vat: customer.vat || undefined,
      notes: customer.notes ? customer.notes.slice(0, 200) : undefined,
    },
  };

  try {
    let created: any;
    try {
      created = await mollie('/payments', { method: 'POST', body: payment });
    } catch (e: any) {
      // Gdyby Mollie odrzuciło pozycje lub adres – próbujemy bez nich (bez Klarny).
      if (e.status === 422) {
        console.warn('Mollie 422, retry without lines:', e.message, e.field);
        const { lines: _l, billingAddress: _b, shippingAddress: _s, ...simple } = payment;
        created = await mollie('/payments', { method: 'POST', body: simple });
      } else throw e;
    }
    return json(res, 200, { checkoutUrl: created?._links?.checkout?.href, paymentId: created?.id, orderNumber: order, total });
  } catch (e: any) {
    console.error('Mollie error', e.status, e.message);
    return fail(502, 'mollie');
  }
}
