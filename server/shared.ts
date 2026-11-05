// =====================================================================
// Wspólne funkcje serwera (Netlify Functions): Mollie, maile (Resend), pomocnicze.
// Uruchamiane jako Netlify Functions (netlify/functions → adresy /api/...).
// Zmienne środowiskowe (Netlify → Site configuration → Environment variables):
//   MOLLIE_API_KEY   test_... (testy) albo live_... (prawdziwe płatności)  – WYMAGANE
//   SITE_URL         np. https://www.octagonsport.nl (bez / na końcu)        – zalecane
//   RESEND_API_KEY   re_... – maile z potwierdzeniem                         – opcjonalne
//   MAIL_FROM        np. "OctagonSportNL <shop@octagonsport.nl>"             – opcjonalne
//   SHOP_EMAIL       adres, na który przychodzą powiadomienia o zamówieniach – opcjonalne
//   ADMIN_PASSWORD   hasło do panelu zamówień /beheer (min. 8 znaków)              – zalecane
// =====================================================================
import { COMPANY } from '../src/config/company';

export const MOLLIE_API = 'https://api.mollie.com/v2';

export type Lang = 'nl' | 'en' | 'pl';

export const env = (name: string) => (typeof process !== 'undefined' ? process.env[name] : undefined) || '';

export const siteUrl = (req: any) => {
  const fromEnv = env('SITE_URL').replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'www.octagonsport.nl';
  const proto = req.headers?.['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
};

export const money = (n: number) => ({ currency: 'EUR', value: n.toFixed(2) });
export const round2 = (n: number) => Math.round(n * 100) / 100;
/** Kwota VAT zawarta w cenie brutto (21%). */
export const vatOf = (gross: number, rate = 21) => round2((gross * rate) / (100 + rate));

export async function mollie(path: string, init: { method?: string; body?: unknown } = {}) {
  const key = env('MOLLIE_API_KEY');
  if (!key) throw Object.assign(new Error('MOLLIE_API_KEY ontbreekt'), { status: 500 });
  const res = await fetch(`${MOLLIE_API}${path}`, {
    method: init.method || 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data?.detail || data?.title || `Mollie ${res.status}`);
    err.status = res.status;
    err.field = data?.field;
    throw err;
  }
  return data;
}

export const readBody = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return Object.fromEntries(new URLSearchParams(req.body));
    }
  }
  return req.body;
};

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Ostatni błąd wysyłki maila (pokazywany w panelu /beheer przy teście powiadomień). */
export let lastMailError = '';

export async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
  const key = env('RESEND_API_KEY');
  lastMailError = '';
  if (!key) { lastMailError = 'Brak zmiennej RESEND_API_KEY w Netlify'; return false; }
  if (!to) { lastMailError = 'Brak adresu odbiorcy'; return false; }
  const from = env('MAIL_FROM') || `OctagonSportNL <${COMPANY.email}>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      // kilka adresów naraz: „a@x.nl, b@gmail.com”
      body: JSON.stringify({ from, to: to.split(/[,;\s]+/).filter(Boolean), subject, html, reply_to: replyTo || COMPANY.email }),
    });
    if (!res.ok) {
      lastMailError = `Resend ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`;
      console.error('Resend error', lastMailError);
    }
    return res.ok;
  } catch (e: any) {
    lastMailError = `Resend: ${e?.message || 'brak połączenia'}`;
    console.error(lastMailError);
    return false;
  }
}

/**
 * Powiadomienie push na telefon przez ntfy.sh (darmowa aplikacja „ntfy” na Androida i iPhone'a).
 * NTFY_TOPIC = tajna, długa nazwa kanału (jak hasło) – właściciel subskrybuje ją w aplikacji.
 * Działa niezależnie od maili.
 */
export async function sendPush(opts: { title: string; message: string; click?: string; image?: string; tags?: string; priority?: number }) {
  const topic = env('NTFY_TOPIC');
  if (!topic) return { ok: false, error: 'Brak zmiennej NTFY_TOPIC w Netlify' };
  try {
    const res = await fetch('https://ntfy.sh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title: opts.title,
        message: opts.message,
        click: opts.click,
        attach: opts.image,
        tags: opts.tags ? opts.tags.split(',') : undefined,
        priority: opts.priority ?? 5,
        actions: opts.click ? [{ action: 'view', label: 'Otwórz zamówienie', url: opts.click }] : undefined,
      }),
    });
    if (!res.ok) return { ok: false, error: `ntfy ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}` };
    return { ok: true, error: '' };
  } catch (e: any) {
    return { ok: false, error: `ntfy: ${e?.message || 'brak połączenia'}` };
  }
}

export const json = (res: any, status: number, data: unknown) => {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
};
