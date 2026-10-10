# OctagonSportNL – sklep

Sklep z produktami marki Octagon (dostawca: octagonshop.pl) dla rynku holenderskiego.
React 19 + Vite + Tailwind. Języki: NL (główny), EN, PL.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # wersja produkcyjna w folderze dist/
```

## Gdzie co jest

| Co | Gdzie |
|---|---|
| Katalog produktów (739 szt., 710 opublikowanych) | `src/data/catalog.json` |
| Opisy produktów NL / EN / PL | `public/data/desc-nl.json`, `desc-en.json`, `desc-pl.json` |
| Zdjęcia produktów (WebP) | `public/products/` |
| **Ceny – kurs i narzut** | `src/config/pricing.ts` |
| Logika katalogu (kategorie, warianty, zestawy) | `src/data/products.ts` |
| Teksty sklepu (NL/EN/PL) | `src/data/translations.ts` |

## Ceny

Ceny są ustawione **w stylu starego sklepu octagonsport.nl** – kategoriami (np. rashguardy €49,99,
spodenki MMA €49,99, T-shirty €19,99–39,99, bluzy €54,99–64,99, kurtki €74,99–94,99).
Liczy je skrypt `scripts/catalog/pricing_old_shop.py` (zapisuje `priceEur` i `compareAtEur` w `src/data/catalog.json`,
raport: `scripts/catalog/pricing_report.csv`):

- produkt obecny w starym sklepie → ta sama cena,
- pozostałe → najbliższy próg cenowy swojej kategorii (wg ceny dostawcy),
- promocja u dostawcy → ten sam procent obniżki, na stronie przekreślona cena regularna,
- cena nigdy nie spada poniżej ceny dostawcy przeliczonej na EUR (kurs 4,25).

Progi kategorii zmienisz w słowniku `POINTS` na górze skryptu. Gdy produkt nie ma `priceEur`,
działa stara formuła z `src/config/pricing.ts` (PLN ÷ kurs × 1,15).

## Aktualizacja katalogu

Skrypty w `scripts/catalog/` (Python 3 + Pillow):

- `source/octagonshop-katalog*.json` – dane pobrane z octagonshop.pl (PL i EN),
- `taxonomy.py` – przypisanie produktów do kategorii i nazwy NL,
- `nl/*.txt` – opisy NL (mini-format: `@@ klucz`, `- punkt`, `## nagłówek`, `=klucz` = ten sam opis),
- `nl_convert.py` → `build.py` → `export.py` – generują pliki w `src/data` i `public/data`.

## Płatności i wdrożenie

Płatności: **Mollie** (strona płatności Mollie), funkcje serwerowe w `server/` uruchamiane jako Netlify Functions (`netlify/functions/`).
Instrukcja wdrożenia krok po kroku: **`WDROZENIE.md`**.

## Do zrobienia

- Podłączenie domeny octagonsport.nl (Netlify) i klucza `live_` z Mollie po weryfikacji konta.
- Maile przez Resend (opcjonalnie, instrukcja w `WDROZENIE.md`).
- SEO: tytuły podstron, sitemap.xml, dane produktów dla Google.
