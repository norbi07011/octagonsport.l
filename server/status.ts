// GET /api/payment-status?id=tr_… – status płatności dla strony „Bedankt”.
// Zwraca tylko status, numer zamówienia i kwotę (bez danych osobowych).
import { json, mollie } from './shared';

export default async function handler(req: any, res: any) {
  const id = String(req.query?.id || '');
  if (!/^tr_[A-Za-z0-9]+$/.test(id)) return json(res, 400, { error: 'invalid id' });
  try {
    const p = await mollie(`/payments/${id}`);
    return json(res, 200, { status: p.status, orderNumber: p.metadata?.order || null, amount: p.amount?.value || null, method: p.method || null });
  } catch (e: any) {
    return json(res, e.status === 404 ? 404 : 502, { error: 'unavailable' });
  }
}
