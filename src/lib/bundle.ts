// Kod „pakietowy”: N sztuk z danej podkategorii za stałą cenę, raz na zamówienie
// (np. LEGGINS2 – dwie pary legginsów za €79,99). Wspólne dla serwera i przeglądarki,
// żeby podgląd w koszyku zawsze zgadzał się z kwotą naliczaną przy płatności.

export interface BundleRule {
  /** podkategoria z katalogu, np. 'leggings' */
  subcategory: string;
  /** ile sztuk trzeba mieć w koszyku */
  qty: number;
  /** cena za te sztuki razem (€) */
  price: number;
}

export interface BundleLine {
  product: { subcategory?: string; price: number };
  quantity: number;
}

/** Kwota rabatu (€) dla koszyka; 0, gdy w koszyku jest za mało sztuk z tej podkategorii. */
export function bundleAmount(rule: BundleRule, cart: BundleLine[]): number {
  const prices: number[] = [];
  for (const line of cart) {
    if (line.product.subcategory !== rule.subcategory) continue;
    for (let i = 0; i < line.quantity; i++) prices.push(line.product.price);
  }
  if (prices.length < rule.qty) return 0;
  // promocja obejmuje tylko jeden komplet – liczymy go od najtańszych sztuk
  prices.sort((a, b) => a - b);
  const regular = prices.slice(0, rule.qty).reduce((s, p) => s + p, 0);
  return Math.max(0, Math.round((regular - rule.price) * 100) / 100);
}
