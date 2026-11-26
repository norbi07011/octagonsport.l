// Kody rabatowe – TYLKO na serwerze (nie trafiają do kodu strony, więc nie da się ich podejrzeć).
// Żeby dodać / wyłączyć kod: zmień listę poniżej i wypchnij do GitHub (Netlify przebuduje sklep).
//   percent        – rabat w % od CAŁEGO rachunku (produkty + wysyłka)
//   minSubtotal    – minimalna wartość produktów (€), 0 = brak minimum
//   firstOrderOnly – tylko dla klientów, którzy jeszcze nic nie kupili w tym sklepie (sprawdzane po e-mailu w Mollie)
//   active         – false = kod wyłączony
//   partner        – czyj to kod (pokazywane w panelu /beheer → zakładka „Kody”)
//   bundle         – kod pakietowy zamiast procentu: N sztuk z podkategorii za stałą cenę, raz na zamówienie
import { mollie, round2 } from './shared';
import { bundleAmount, BundleLine, BundleRule } from '../src/lib/bundle';

export interface DiscountCode {
  code: string;
  percent: number;
  minSubtotal: number;
  firstOrderOnly?: boolean;
  active: boolean;
  partner?: string;
  bundle?: BundleRule;
}

export const DISCOUNT_CODES: DiscountCode[] = [
  // Ustalenie właściciela (27.10.2026): każdy kod = 10% od całego rachunku, bez minimum i bez innych warunków.
  { code: 'DJZIBI', percent: 10, minSubtotal: 0, active: true, partner: 'DJ Zibi' },
  { code: 'BALAGANKUBA', percent: 10, minSubtotal: 0, active: true, partner: 'Bałagan Team – Kuba' },
  { code: 'RS6', percent: 10, minSubtotal: 0, active: true, partner: '' },
  { code: 'KICKDOMINIK5', percent: 10, minSubtotal: 0, active: true, partner: 'Dominik (kickboks)' },
  { code: 'MIRO_SW', percent: 10, minSubtotal: 0, active: true, partner: 'Trener Miro (@trener_miro_sw)' },
  { code: 'HIGHKICK', percent: 10, minSubtotal: 0, active: true, partner: 'Highkick' },
  { code: 'SLAVIA_FIGHT', percent: 10, minSubtotal: 0, active: true, partner: 'Slavia Fight' },
  { code: 'ERYCZEK20', percent: 10, minSubtotal: 0, active: true, partner: 'Eryczek' },
  // Kody ogólne sklepu (26.11.2026) – % od całego rachunku, bez minimum.
  { code: 'OCTAGON20', percent: 20, minSubtotal: 0, active: true, partner: '' },
  { code: 'SUMMER30', percent: 30, minSubtotal: 0, active: true, partner: '' },
  // Pakiet: dwie pary legginsów za €79,99 (zamiast 2 × €49,99), tylko raz na zamówienie.
  { code: 'LEGGINS2', percent: 0, minSubtotal: 0, active: true, partner: '', bundle: { subcategory: 'leggings', qty: 2, price: 79.99 } },
];

export const normalizeCode = (raw: unknown) => String(raw || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 40);

export type DiscountCheck =
  | { ok: true; code: string; percent: number; amount: number; minSubtotal: number; firstOrderOnly: boolean; bundle?: BundleRule }
  | { ok: false; reason: 'unknown' | 'min' | 'used' | 'bundle'; minSubtotal?: number; bundle?: BundleRule };

/** Czy ten e-mail ma już opłacone zamówienie (przegląda ostatnie płatności w Mollie). */
export async function hasPaidBefore(email: string): Promise<boolean> {
  const target = email.trim().toLowerCase();
  if (!target) return false;
  let path: string | null = '/payments?limit=250';
  for (let page = 0; path && page < 8; page++) {
    const data: any = await mollie(path);
    for (const p of data?._embedded?.payments || []) {
      if (p.status !== 'paid' && p.status !== 'authorized') continue;
      const mail = String(p.shippingAddress?.email || p.billingAddress?.email || p.billingEmail || '').toLowerCase();
      if (mail === target) return true;
    }
    const next: string | undefined = data?._links?.next?.href;
    path = next ? next.replace(/^https:\/\/api\.mollie\.com\/v2/, '') : null;
  }
  return false;
}

/**
 * Sprawdza kod dla danej wartości produktów. E-mail podaj, gdy trzeba sprawdzić „tylko pierwsze zamówienie”.
 * Koszyk podaj przy płatności: kod pakietowy liczy rabat z koszyka i bez wymaganych sztuk jest odrzucany.
 * Bez koszyka (podgląd) kod pakietowy jest przyjmowany z kwotą 0 – kwotę liczy wtedy przeglądarka.
 */
export async function checkDiscount(raw: unknown, subtotal: number, email?: string, cart?: BundleLine[]): Promise<DiscountCheck> {
  // porównujemy same litery i cyfry: „miro sw”, „MIROSW”, „Miro-SW” = MIRO_SW
  const key = normalizeCode(raw).replace(/[^A-Z0-9]/g, '');
  const d = key ? DISCOUNT_CODES.find(c => c.active && c.code.replace(/[^A-Z0-9]/g, '') === key) : undefined;
  if (!d) return { ok: false, reason: 'unknown' };
  if (subtotal < d.minSubtotal) return { ok: false, reason: 'min', minSubtotal: d.minSubtotal };
  if (d.firstOrderOnly && email && (await hasPaidBefore(email))) return { ok: false, reason: 'used' };
  if (d.bundle) {
    const amount = cart ? bundleAmount(d.bundle, cart) : 0;
    if (cart && amount <= 0) return { ok: false, reason: 'bundle', bundle: d.bundle };
    return { ok: true, code: d.code, percent: 0, amount, minSubtotal: d.minSubtotal, firstOrderOnly: !!d.firstOrderOnly, bundle: d.bundle };
  }
  return { ok: true, code: d.code, percent: d.percent, amount: round2((subtotal * d.percent) / 100), minSubtotal: d.minSubtotal, firstOrderOnly: !!d.firstOrderOnly };
}

/** Czyj to kod (do panelu i maili). */
export const partnerOf = (code: string) => DISCOUNT_CODES.find(c => c.code === code)?.partner || '';
