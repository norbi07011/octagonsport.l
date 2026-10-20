# Wdrożenie sklepu OctagonSportNL (GitHub + Netlify + Mollie)

## W skrócie – co jest czym

| Co | Do czego | Koszt |
|---|---|---|
| **Domena** octagonsport.nl | adres sklepu (masz) | już opłacona |
| **GitHub** | schowek na pliki sklepu – repozytorium `octagonsportnl/octagonsport.nl` | darmowy |
| **Netlify** | „lokal”, w którym sklep działa 24/7 + mały program do płatności | darmowy (sklep komercyjny dozwolony) |
| **Mollie** | przyjmuje płatności (iDEAL, Bancontact, karta, Klarna) | prowizja od transakcji |
| **Resend** (opcjonalnie) | maile z potwierdzeniem zamówienia | darmowy do 3000 maili/mies. |

## Jak działa płatność

1. Klient wypełnia dane w kasie i klika **„Bestellen en betalen”**.
2. Serwer (`/api/checkout`) sam liczy ceny i wysyłkę z katalogu i tworzy płatność w **Mollie**.
3. Klient płaci na bezpiecznej stronie Mollie.
4. Mollie wysyła potwierdzenie na `/api/mollie-webhook` → sklep wysyła maile (jeśli ustawiony Resend).
5. Klient wraca na stronę **/bedankt**, która sprawdza status płatności.

Zamówienia (produkty, adres, telefon, kwota) widzisz w **panelu Mollie → Płatności**.
Adres webhooka sklep podaje sam – **w Mollie nie trzeba niczego ustawiać**.

---

## Krok 1 – Netlify: podłącz repozytorium

1. Wejdź na **netlify.com** → *Sign up* → **GitHub** (bez karty, plan Free).
2. *Add new site → Import an existing project → GitHub* → wybierz **octagonsportnl/octagonsport.nl**.
3. Ustawienia budowania wczyta sam z pliku `netlify.toml` (Build: `npm run build`, Publish: `dist`).
4. Kliknij **Deploy**. Po 2–3 minutach dostaniesz adres, np. `https://octagonsport-nl.netlify.app`.

Od teraz **każda zmiana wrzucona do GitHub automatycznie aktualizuje sklep**.

## Krok 2 – Klucz Mollie

1. Panel Mollie → **Developers / Ontwikkelaars → API keys** → skopiuj **Test API key** (`test_...`).
2. Netlify → *Site configuration → Environment variables → Add a variable*:
   - `MOLLIE_API_KEY` = `test_...`
3. Netlify → *Deploys → Trigger deploy → Deploy site*.

> Klucze wpisujesz **tylko w Netlify**. Nigdy w kodzie, na czacie ani w mailu.

## Krok 3 – Test płatności

1. Otwórz sklep z Netlify, dodaj produkt → *Afrekenen* → wypełnij dane → zgoda → *Bestellen en betalen*.
2. Na testowej stronie Mollie wybierz metodę i status **Paid** (nic nie jest pobierane).
3. Powinna pojawić się strona **„Bedankt voor je bestelling!”**, a płatność w Mollie (tryb Test).

## Krok 4 – Prawdziwe płatności (po zatwierdzeniu konta Mollie)

1. Mollie → *Settings → Payment methods*: włącz iDEAL, Bancontact, Credit card, Klarna, Apple Pay.
2. Skopiuj **Live API key** (`live_...`) → w Netlify podmień `MOLLIE_API_KEY` → *Trigger deploy*.

## Krok 5 – Domena octagonsport.nl

1. Netlify → *Domain management → Add a domain* → `octagonsport.nl` (doda też `www`).
2. Netlify pokaże rekordy DNS. Ustaw je u firmy, gdzie kupiona jest domena
   (zamiast obecnych, które wskazują na Shopify).
3. Netlify sam włączy HTTPS (certyfikat) – może to potrwać do kilku godzin.
4. Dodaj zmienną `SITE_URL` = `https://www.octagonsport.nl` → *Trigger deploy*.
5. Gdy nowy sklep działa pod domeną – wyłącz stary sklep Shopify.

## Krok 6 – Maile (zalecane)

1. **resend.com** → konto → *Domains* → dodaj `octagonsport.nl` i ustaw rekordy DNS, które pokaże Resend.
2. *API Keys* → utwórz klucz (`re_...`) i dodaj w Netlify:
   - `RESEND_API_KEY` = `re_...`
   - `MAIL_FROM` = `OctagonSportNL <shop@octagonsport.nl>`
   - `SHOP_EMAIL` = adres na powiadomienia o zamówieniach
3. *Trigger deploy*.

## Krok 7 – Panel zamówień na telefonie (/beheer)

Zamówienia ze zdjęciami produktów, rozmiarami i adresem – jak w aplikacji Shopify.

1. Netlify → *Project configuration → Environment variables → Add a variable*:
   - `ADMIN_PASSWORD` = własne, długie hasło (min. 8 znaków, najlepiej 12+). Zaznacz *Contains secret values*.
2. *Deploys → Trigger deploy*.
3. W telefonie otwórz `https://<twoja-domena>/beheer`, wpisz hasło, zaznacz „Zapamiętaj”.
4. W przeglądarce telefonu: *Udostępnij / menu ⋮ → Dodaj do ekranu głównego* – panel otwiera się jak aplikacja.

W panelu: lista „Do wysłania / Wysłane / Wszystkie”, szczegóły z dużymi zdjęciami, kopiowanie adresu,
telefon i WhatsApp do klienta, „Oznacz jako wysłane” z numerem Track & Trace (klient dostaje maila, jeśli działa Resend).
Status wysyłki zapisuje się w Mollie (metadane płatności) – nie trzeba bazy danych.

Powiadomienia o nowym zamówieniu ze zdjęciami przychodzą mailem na `SHOP_EMAIL` (wymaga Resend – Krok 6).
Włącz powiadomienia z aplikacji pocztowej w telefonie, a mail z listą produktów i zdjęciami pojawi się od razu.

---

## Zmiana cen

Ceny liczy `scripts/catalog/pricing_old_shop.py` (progi w słowniku `POINTS`). Po zmianie:

```bash
npm run prices
```

Netlify przy każdym wdrożeniu buduje funkcje płatności z aktualnego katalogu,
więc cena w sklepie i na stronie płatności jest zawsze ta sama.
