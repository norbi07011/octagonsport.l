// =====================================================================
// CENY – tutaj zmieniasz narzut i kurs. Wszystkie ceny w sklepie
// liczą się automatycznie z ceny detalicznej dostawcy (octagonshop.pl, PLN).
//
//   cena EUR = cena PLN / kurs × (1 + narzut%)  → zaokrąglona w górę do ,99
//
// Przykład (kurs 4,25, narzut 15%): 199 zł → 53,85 € → 53,99 €
// =====================================================================
export const PRICING = {
  /** Ile złotych za 1 euro */
  plnPerEur: 4.25,
  /** Narzut w procentach doliczany do przeliczonej ceny */
  markupPct: 15,
};

export const calcPriceEur = (pricePln: number): number => {
  const raw = (pricePln / PRICING.plnPerEur) * (1 + PRICING.markupPct / 100);
  return Math.round((Math.ceil(raw) - 0.01) * 100) / 100;
};
