// Kody rabatowe – TYLKO na serwerze (nie trafiają do kodu strony, więc nie da się ich podejrzeć).
// Żeby dodać / wyłączyć kod: zmień listę poniżej i wypchnij do GitHub (Netlify przebuduje sklep).
//   percent        – rabat w % od CAŁEGO rachunku (produkty + wysyłka)
//   minSubtotal    – minimalna wartość produktów (€), 0 = brak minimum
//   firstOrderOnly – tylko dla klientów, którzy jeszcze nic nie kupili w tym sklepie (sprawdzane po e-mailu w Mollie)
//   active         – false = kod wyłączony
//   partner        – czyj to kod (pokazywane w panelu /beheer → zakładka „Kody”)
import { mollie, round2 } from './shared';

export interface DiscountCode {
  code: string;
  percent: number;
  minSubtotal: number;
  firstOrderOnly?: boolean;
  active: boolean;
  partner?: string;
}

export const DISCOUNT_CODES: DiscountCode[] = [
  // Ustalenie właściciela (27.10.2026): każdy kod = 10% od całego rachunku, bez minimum i bez innych warunków.
  { code: 'DJZIBI', percent: 10, minSubtotal: 0, active: true, partner: 'DJ Zibi' },
  { code: 'BALAGANKUBA', percent: 10, minSubtotal: 0, active: true, partner: 'Bałagan Team – Kuba' },
  { code: 'RS6', percent: 10, minSubtotal: 0, active: true, partner: '' },
  { code: 'KICKDOMINIK5', percent: 10, minSubtotal: 0, active: true, partner: 'Dominik (kickboks)' },
  { code: 'BERKANO10', percent: 10, minSubtotal: 0, active: true, partner: 'Berkano' },
  { code: 'MIRO_SW', percent: 10, minSubtotal: 0, active: true, partner: 'Trener Miro (@trener_miro_sw)' },
];

export const normalizeCode = (raw: unknown) => String(raw || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 40);

export type DiscountCheck =
  | { ok: true; code: string; percent: number; amount: number; minSubtotal: number; firstOrderOnly: boolean }
  | { ok: false; reason: 'unknown' | 'min' | 'used'; minSubtotal?: number };

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

/** Sprawdza kod dla danej wartości produktów. E-mail podaj, gdy trzeba sprawdzić „tylko pierwsze zamówienie”. */
export async function checkDiscount(raw: unknown, subtotal: number, email?: string): Promise<DiscountCheck> {
  // porównujemy same litery i cyfry: „miro sw”, „MIROSW”, „Miro-SW” = MIRO_SW
  const key = normalizeCode(raw).replace(/[^A-Z0-9]/g, '');
  const d = key ? DISCOUNT_CODES.find(c => c.active && c.code.replace(/[^A-Z0-9]/g, '') === key) : undefined;
  if (!d) return { ok: false, reason: 'unknown' };
  if (subtotal < d.minSubtotal) return { ok: false, reason: 'min', minSubtotal: d.minSubtotal };
  if (d.firstOrderOnly && email && (await hasPaidBefore(email))) return { ok: false, reason: 'used' };
  return { ok: true, code: d.code, percent: d.percent, amount: round2((subtotal * d.percent) / 100), minSubtotal: d.minSubtotal, firstOrderOnly: !!d.firstOrderOnly };
}

/** Czyj to kod (do panelu i maili). */
export const partnerOf = (code: string) => DISCOUNT_CODES.find(c => c.code === code)?.partner || '';
