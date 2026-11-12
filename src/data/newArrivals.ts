/*
 * NOWOŚCI – ręcznie wybrane produkty, pokazywane na stronie głównej (sekcja „Net binnen” pod dyscyplinami)
 * oraz na początku strony /nieuw i w sekcji „New drop”.
 * Jak dojdzie coś nowego: dopisz ID produktu NA POCZĄTKU listy (najnowsze pierwsze).
 */
export const NEW_ARRIVALS: string[] = [
  'oct-breda-1944', // Sportshirt Octagon Berkano Breda 1944 Limited Edition (12.11.2026)
  'oct-4352', // Sportshirt Octagon Polska Orzeł wit Limited Edition (06.11.2026)
  'oct-5011', // Sportshirt Octagon Polska Orzeł rood Limited Edition (06.11.2026)
];

/** Pozycja na liście nowości (mniejsza = nowsza); produkty spoza listy na końcu. */
export const arrivalRank = (id: string) => {
  const i = NEW_ARRIVALS.indexOf(id);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};
