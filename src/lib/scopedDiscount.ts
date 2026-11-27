// Kod „na wybrane produkty”: procent tylko od produktów z danej podkategorii
// (np. LEGGINS2 – 10% na legginsy), bez rabatu na resztę koszyka i wysyłkę.
// Wspólne dla serwera i przeglądarki, żeby podgląd w koszyku zgadzał się z kwotą przy płatności.

export interface ScopeRule {
  /** podkategoria z katalogu, np. 'leggings' */
  subcategory: string;
}

export interface ScopeLine {
  product: { subcategory?: string; price: number };
  quantity: number;
}

/** Kwota rabatu (€): procent od produktów z podkategorii; 0, gdy nie ma ich w koszyku. */
export function scopedAmount(rule: ScopeRule, percent: number, cart: ScopeLine[]): number {
  const base = cart.reduce((s, l) => (l.product.subcategory === rule.subcategory ? s + l.product.price * l.quantity : s), 0);
  return Math.round(base * percent) / 100;
}
