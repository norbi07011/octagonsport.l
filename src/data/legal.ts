// =====================================================================
// Strony prawne: Algemene voorwaarden, Retourneren, Privacy, Cookies.
// Wersja NL jest wiążąca (NL: "De Nederlandse versie is leidend").
// Dane firmy pobierane z src/config/company.ts.
// Ostatnia aktualizacja treści: 10 oktober 2026.
// =====================================================================
import { COMPANY } from '../config/company';

export type LegalLang = 'nl' | 'en' | 'pl';
export type LegalBlock =
  | { t: 'h'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'box'; title: string; lines: string[] };

export interface LegalDoc {
  slug: string;
  paths: string[];
  title: Record<LegalLang, string>;
  updated: string;
  body: Record<LegalLang, LegalBlock[]>;
}

const C = COMPANY;
const ADDR = `${C.street}, ${C.postalCode} ${C.city}`;
const UPDATED = '10-10-2026';

const companyBox = (lang: LegalLang): LegalBlock => ({
  t: 'box',
  title: lang === 'pl' ? 'Dane sprzedawcy' : lang === 'en' ? 'Seller details' : 'Gegevens van de verkoper',
  lines: [
    C.name,
    `${ADDR}, ${C.country[lang]}`,
    `KvK: ${C.kvk}`,
    `${lang === 'pl' ? 'NIP UE (BTW)' : lang === 'en' ? 'VAT (BTW)' : 'Btw-id'}: ${C.btw}`,
    `E-mail: ${C.email}`,
    `${lang === 'pl' ? 'Telefon / WhatsApp' : lang === 'en' ? 'Phone / WhatsApp' : 'Telefoon / WhatsApp'}: ${C.phone}`,
    `Website: ${C.website}`,
  ],
});

// ---------------------------------------------------------------------
// ALGEMENE VOORWAARDEN
// ---------------------------------------------------------------------
const terms: LegalDoc = {
  slug: 'algemene-voorwaarden',
  paths: ['/algemene-voorwaarden', '/terms', '/regulamin'],
  title: { nl: 'Algemene voorwaarden', en: 'Terms and conditions', pl: 'Regulamin sklepu' },
  updated: UPDATED,
  body: {
    nl: [
      companyBox('nl'),
      { t: 'h', text: '1. Toepasselijkheid' },
      { t: 'p', text: `Deze voorwaarden gelden voor elk aanbod van en elke overeenkomst via de webshop ${C.website}, die wordt geëxploiteerd door ${C.name}. Door een bestelling te plaatsen ga je akkoord met deze voorwaarden. Je kunt ze op deze pagina lezen, opslaan en printen.` },
      { t: 'h', text: '2. Aanbod en prijzen' },
      { t: 'ul', items: [
        'Alle prijzen zijn in euro en inclusief 21% btw.',
        'Verzendkosten worden vóór het afronden van de bestelling getoond en hangen af van het gewicht van het pakket. Vanaf €99 is verzending binnen Nederland gratis, met uitzondering van zware artikelen boven 23 kg.',
        'Voor artikelen die alleen per pallet vervoerd kunnen worden (bijvoorbeeld gevulde bokszakken) maken we vooraf een prijsopgave voor de verzending.',
        'Kennelijke vergissingen of fouten in het aanbod (zoals een duidelijk verkeerde prijs) binden ons niet.',
        'Productfoto’s geven het artikel zo goed mogelijk weer; kleine verschillen in kleur kunnen voorkomen.',
      ] },
      { t: 'h', text: '3. De overeenkomst' },
      { t: 'p', text: 'De overeenkomst komt tot stand op het moment dat je de bestelling afrondt en de betaling is gelukt. Je ontvangt daarna een bevestiging per e-mail. Kan een artikel onverhoopt niet geleverd worden, dan laten we dat zo snel mogelijk weten en betalen we het betaalde bedrag binnen 14 dagen terug.' },
      { t: 'h', text: '4. Betaling' },
      { t: 'p', text: 'Je betaalt vooraf via de betaalmethoden die bij het afrekenen worden getoond (zoals iDEAL). Betalingen worden verwerkt door een erkende betaaldienstverlener; wij ontvangen of bewaren geen gegevens van je bankrekening of creditcard.' },
      { t: 'h', text: '5. Levering' },
      { t: 'ul', items: [
        'We leveren binnen Nederland. De levertijd is 7–10 werkdagen na ontvangst van de betaling. Een deel van het assortiment wordt vanuit Polen verzonden.',
        'Je ontvangt een Track & Trace-code zodra het pakket verzonden is.',
        'Lukt levering niet binnen 30 dagen, dan mag je de bestelling kosteloos annuleren en ontvang je het betaalde bedrag binnen 14 dagen terug.',
        'Het risico van beschadiging of verlies gaat over op jou op het moment dat het pakket bij jou (of een door jou aangewezen persoon of afhaalpunt) is afgeleverd.',
      ] },
      { t: 'h', text: '6. Herroepingsrecht (bedenktijd)' },
      { t: 'p', text: 'Je hebt 14 dagen bedenktijd vanaf de dag dat je het artikel hebt ontvangen. Binnen die termijn kun je de overeenkomst zonder opgave van redenen ontbinden. De volledige regels, de uitzonderingen en het modelformulier staan op de pagina Verzending & retourneren.' },
      { t: 'ul', items: [
        'De kosten van het terugsturen zijn voor jouw rekening.',
        'Wij betalen de productprijs én de oorspronkelijke standaard verzendkosten binnen 14 dagen na je melding terug. We mogen wachten met terugbetalen tot we het artikel hebben ontvangen of je hebt aangetoond dat het is teruggestuurd.',
        'Behandel het artikel zorgvuldig: pas het alleen zoals je dat in een winkel zou doen. Bij waardevermindering door verder gebruik mogen we die waardevermindering in mindering brengen.',
      ] },
      { t: 'h', text: '7. Garantie en klachten' },
      { t: 'ul', items: [
        'Je hebt altijd recht op een product dat voldoet aan de overeenkomst (wettelijke garantie). Normale slijtage door gebruik valt hier niet onder.',
        `Meld een gebrek of klacht zo snel mogelijk, bij voorkeur binnen 2 maanden na ontdekking, via ${C.email} of WhatsApp, met foto’s en je bestelnummer.`,
        'We reageren binnen 14 dagen inhoudelijk op je klacht en zoeken samen naar een oplossing: herstel, vervanging of (gedeeltelijke) terugbetaling.',
      ] },
      { t: 'h', text: '8. Merken en productinformatie' },
      { t: 'p', text: 'Octagon en Legion Octagon zijn handelsmerken van de betreffende eigenaar. Wij verkopen originele producten van dit merk; productfoto’s en -beschrijvingen zijn afkomstig van de fabrikant.' },
      { t: 'h', text: '9. Privacy' },
      { t: 'p', text: 'We gebruiken je gegevens alleen om je bestelling af te handelen. Lees meer in ons privacybeleid.' },
      { t: 'h', text: '10. Toepasselijk recht en geschillen' },
      { t: 'p', text: 'Op deze voorwaarden is Nederlands recht van toepassing. Komen we er samen niet uit, dan kun je het geschil voorleggen aan de bevoegde rechter. Dwingende regels uit het consumentenrecht van je woonland blijven gelden.' },
    ],
    en: [
      companyBox('en'),
      { t: 'p', text: 'This is a translation. In case of any difference the Dutch version prevails.' },
      { t: 'h', text: '1. Applicability' },
      { t: 'p', text: `These terms apply to every offer and agreement through the webshop ${C.website}, operated by ${C.name}. By placing an order you accept these terms. You can read, save and print them on this page.` },
      { t: 'h', text: '2. Offer and prices' },
      { t: 'ul', items: [
        'All prices are in euros and include 21% Dutch VAT.',
        'Shipping costs are shown before you complete your order and depend on the weight of the parcel. Shipping within the Netherlands is free from €99, except for heavy items over 23 kg.',
        'For items that can only be shipped on a pallet (such as filled heavy bags) we give a shipping quote in advance.',
        'Obvious mistakes in the offer (such as a clearly wrong price) are not binding.',
        'Product photos show the item as accurately as possible; small colour differences may occur.',
      ] },
      { t: 'h', text: '3. The agreement' },
      { t: 'p', text: 'The agreement is concluded when you complete the order and the payment has succeeded. You will then receive a confirmation by e-mail. If an item cannot be delivered after all, we will inform you as soon as possible and refund the amount paid within 14 days.' },
      { t: 'h', text: '4. Payment' },
      { t: 'p', text: 'You pay in advance using the methods shown at checkout (such as iDEAL). Payments are processed by a licensed payment service provider; we do not receive or store your bank or card details.' },
      { t: 'h', text: '5. Delivery' },
      { t: 'ul', items: [
        'We deliver within the Netherlands. Delivery takes 7–10 business days after payment is received. Part of the range is shipped from Poland.',
        'You receive a tracking code as soon as the parcel has been shipped.',
        'If delivery is not possible within 30 days, you may cancel the order free of charge and receive the amount paid back within 14 days.',
        'The risk of damage or loss passes to you once the parcel has been delivered to you, a person you designated or a pick-up point.',
      ] },
      { t: 'h', text: '6. Right of withdrawal' },
      { t: 'p', text: 'You have 14 days from the day you received the item to withdraw from the agreement without giving any reason. The full rules, exceptions and model form are on the Shipping & returns page.' },
      { t: 'ul', items: [
        'Return shipping costs are paid by you.',
        'We refund the product price and the original standard shipping costs within 14 days of your notice. We may withhold the refund until we have received the item or you have shown proof of return.',
        'Handle the item with care and only try it on as you would in a shop. If its value is reduced by further use, we may deduct that reduction.',
      ] },
      { t: 'h', text: '7. Warranty and complaints' },
      { t: 'ul', items: [
        'You are always entitled to a product that conforms to the agreement (statutory warranty). Normal wear and tear is not covered.',
        `Report a defect or complaint as soon as possible, preferably within 2 months of discovering it, via ${C.email} or WhatsApp, with photos and your order number.`,
        'We respond to your complaint within 14 days and look for a solution together: repair, replacement or a (partial) refund.',
      ] },
      { t: 'h', text: '8. Trademarks and product information' },
      { t: 'p', text: 'Octagon and Legion Octagon are trademarks of their respective owner. We sell original products of this brand; product photos and descriptions come from the manufacturer.' },
      { t: 'h', text: '9. Privacy' },
      { t: 'p', text: 'We only use your data to handle your order. Read more in our privacy policy.' },
      { t: 'h', text: '10. Applicable law and disputes' },
      { t: 'p', text: 'These terms are governed by Dutch law. If we cannot resolve a dispute together, you may bring it before the competent court. Mandatory consumer protection rules of your country of residence continue to apply.' },
    ],
    pl: [
      companyBox('pl'),
      { t: 'p', text: 'To jest tłumaczenie. W razie rozbieżności wiążąca jest wersja holenderska.' },
      { t: 'h', text: '1. Zakres' },
      { t: 'p', text: `Regulamin dotyczy każdej oferty i umowy zawartej w sklepie ${C.website}, prowadzonym przez ${C.name}. Składając zamówienie, akceptujesz ten regulamin. Możesz go przeczytać, zapisać i wydrukować na tej stronie.` },
      { t: 'h', text: '2. Oferta i ceny' },
      { t: 'ul', items: [
        'Wszystkie ceny są w euro i zawierają 21% holenderskiego VAT (BTW).',
        'Koszt wysyłki jest pokazany przed złożeniem zamówienia i zależy od wagi paczki. Od €99 dostawa w Holandii jest darmowa, z wyjątkiem ciężkich produktów powyżej 23 kg.',
        'Dla produktów, które można wysłać tylko na palecie (np. wypełnione worki bokserskie), koszt wysyłki podajemy indywidualnie przed zamówieniem.',
        'Oczywiste pomyłki w ofercie (np. wyraźnie błędna cena) nie są wiążące.',
        'Zdjęcia możliwie wiernie pokazują produkt; drobne różnice w kolorze są możliwe.',
      ] },
      { t: 'h', text: '3. Zawarcie umowy' },
      { t: 'p', text: 'Umowa zostaje zawarta w chwili złożenia zamówienia i udanej płatności. Następnie otrzymasz potwierdzenie e-mailem. Jeśli produktu jednak nie da się dostarczyć, poinformujemy cię o tym jak najszybciej i zwrócimy zapłaconą kwotę w ciągu 14 dni.' },
      { t: 'h', text: '4. Płatność' },
      { t: 'p', text: 'Płacisz z góry metodami pokazanymi przy zamówieniu (np. iDEAL). Płatności obsługuje licencjonowany operator płatności; nie otrzymujemy ani nie przechowujemy danych twojego konta bankowego ani karty.' },
      { t: 'h', text: '5. Dostawa' },
      { t: 'ul', items: [
        'Dostarczamy na terenie Holandii. Czas dostawy to 7–10 dni roboczych od zaksięgowania płatności. Część asortymentu wysyłamy z Polski.',
        'Numer śledzenia przesyłki otrzymasz zaraz po nadaniu paczki.',
        'Jeśli dostawa nie będzie możliwa w ciągu 30 dni, możesz bezpłatnie anulować zamówienie, a zapłaconą kwotę zwrócimy w ciągu 14 dni.',
        'Ryzyko uszkodzenia lub utraty przechodzi na ciebie z chwilą doręczenia paczki tobie, wskazanej osobie lub do punktu odbioru.',
      ] },
      { t: 'h', text: '6. Prawo odstąpienia od umowy' },
      { t: 'p', text: 'Masz 14 dni od dnia otrzymania produktu, aby bez podania przyczyny odstąpić od umowy. Pełne zasady, wyjątki i wzór formularza znajdziesz na stronie „Dostawa i zwroty”.' },
      { t: 'ul', items: [
        'Koszt odesłania produktu ponosi kupujący.',
        'Zwracamy cenę produktu oraz pierwotny koszt standardowej wysyłki w ciągu 14 dni od twojego zgłoszenia. Możemy wstrzymać zwrot do czasu otrzymania produktu lub dowodu jego odesłania.',
        'Obchodź się z produktem ostrożnie – przymierz go tak, jak w sklepie stacjonarnym. Jeśli wartość produktu zmniejszy się przez dalsze używanie, możemy potrącić tę różnicę.',
      ] },
      { t: 'h', text: '7. Gwarancja i reklamacje' },
      { t: 'ul', items: [
        'Zawsze masz prawo do produktu zgodnego z umową (rękojmia ustawowa). Normalne zużycie nie jest wadą.',
        `Wadę lub reklamację zgłoś jak najszybciej, najlepiej w ciągu 2 miesięcy od jej wykrycia – mailowo na ${C.email} lub przez WhatsApp, ze zdjęciami i numerem zamówienia.`,
        'Odpowiemy w ciągu 14 dni i wspólnie znajdziemy rozwiązanie: naprawę, wymianę lub (częściowy) zwrot pieniędzy.',
      ] },
      { t: 'h', text: '8. Znaki towarowe i informacje o produktach' },
      { t: 'p', text: 'Octagon i Legion Octagon są znakami towarowymi ich właściciela. Sprzedajemy oryginalne produkty tej marki; zdjęcia i opisy pochodzą od producenta.' },
      { t: 'h', text: '9. Prywatność' },
      { t: 'p', text: 'Twoich danych używamy wyłącznie do realizacji zamówienia. Więcej w polityce prywatności.' },
      { t: 'h', text: '10. Prawo właściwe i spory' },
      { t: 'p', text: 'Regulamin podlega prawu holenderskiemu. Jeśli nie dojdziemy do porozumienia, możesz skierować spór do właściwego sądu. Bezwzględnie obowiązujące przepisy konsumenckie kraju twojego zamieszkania pozostają w mocy.' },
    ],
  },
};

// ---------------------------------------------------------------------
// VERZENDING & RETOURNEREN (incl. modelformulier)
// ---------------------------------------------------------------------
const returnAddr = (lang: LegalLang) => [`${C.name}`, C.street, `${C.postalCode} ${C.city}`, C.country[lang]];

const returns: LegalDoc = {
  slug: 'retourneren',
  paths: ['/retourneren', '/verzending', '/returns', '/zwroty', '/dostawa'],
  title: { nl: 'Verzending & retourneren', en: 'Shipping & returns', pl: 'Dostawa i zwroty' },
  updated: UPDATED,
  body: {
    nl: [
      { t: 'h', text: 'Verzending' },
      { t: 'ul', items: [
        'We verzenden binnen Nederland met Track & Trace. Levertijd: 7–10 werkdagen na betaling.',
        'Verzendkosten op basis van gewicht: brievenbuspakje (tot 2 kg) €4,95 · pakket tot 10 kg €7,95 · 10–23 kg €17,95 · zwaar pakket 23–31,5 kg €34,95 · 31,5–40 kg €49,95. Ophalen bij een PostNL-punt is bij pakketten €0,50 goedkoper.',
        'Gratis verzending vanaf €99 (geldt voor pakketten tot 23 kg).',
        'Artikelen boven 40 kg (gevulde bokszakken) gaan per pallet; vraag via WhatsApp een prijsopgave aan.',
      ] },
      { t: 'h', text: 'Bedenktijd: 14 dagen' },
      { t: 'p', text: 'Je mag je aankoop binnen 14 dagen na ontvangst zonder opgave van redenen annuleren (herroepen). Daarna heb je nog 14 dagen om het artikel terug te sturen.' },
      { t: 'h', text: 'Zo stuur je iets terug' },
      { t: 'ul', items: [
        `Meld je retour binnen 14 dagen na ontvangst via ${C.email} of WhatsApp (${C.phone}). Vermeld je naam, bestelnummer en welke artikelen je terugstuurt. Je mag hiervoor ook het modelformulier hieronder gebruiken.`,
        'Pak het artikel goed in, bij voorkeur in de originele verpakking, en stuur het binnen 14 dagen na je melding terug naar het retouradres.',
        'De kosten van het terugsturen zijn voor jouw rekening. Bewaar het verzendbewijs.',
      ] },
      { t: 'box', title: 'Retouradres', lines: returnAddr('nl') },
      { t: 'h', text: 'Terugbetaling' },
      { t: 'p', text: 'Wij betalen binnen 14 dagen na je melding het aankoopbedrag terug, inclusief de oorspronkelijke standaard verzendkosten (dit is wettelijk verplicht). De kosten van het retourneren betalen we niet terug. We mogen wachten met terugbetalen tot het artikel bij ons binnen is of je hebt aangetoond dat je het hebt verstuurd. We betalen terug via dezelfde betaalmethode die je hebt gebruikt.' },
      { t: 'h', text: 'Staat van het artikel' },
      { t: 'p', text: 'Je mag het artikel passen zoals in een winkel. Is het gedragen, gebruikt in training, gewassen of beschadigd, dan mogen we de waardevermindering in rekening brengen.' },
      { t: 'h', text: 'Uitzonderingen' },
      { t: 'ul', items: [
        'Gebitsbeschermers, ondergoed en andere artikelen die om hygiënische redenen verzegeld zijn, als de verzegeling of verpakking na levering is verbroken.',
        'Artikelen die speciaal voor jou zijn gemaakt of bedrukt (zoals custom teamwear).',
      ] },
      { t: 'h', text: 'Modelformulier voor herroeping' },
      { t: 'p', text: 'Vul dit formulier alleen in en stuur het terug (per e-mail of WhatsApp) als je de overeenkomst wilt herroepen.' },
      { t: 'box', title: 'Modelformulier', lines: [
        `Aan: ${C.name}, ${ADDR}, ${C.email}`,
        'Ik/Wij* deel/delen* u hierbij mede dat ik/wij* onze overeenkomst betreffende de verkoop van de volgende producten herroep/herroepen*: …',
        'Besteld op* / Ontvangen op*: …',
        'Bestelnummer: …',
        'Naam/Namen consument(en): …',
        'Adres consument(en): …',
        'IBAN-rekeningnummer (voor terugbetaling, indien nodig): …',
        'Handtekening (alleen bij papieren versie): …',
        'Datum: …',
        '* Doorhalen wat niet van toepassing is.',
      ] },
    ],
    en: [
      { t: 'p', text: 'This is a translation. In case of any difference the Dutch version prevails.' },
      { t: 'h', text: 'Shipping' },
      { t: 'ul', items: [
        'We ship within the Netherlands with a tracking code. Delivery time: 7–10 business days after payment.',
        'Shipping costs by weight: letterbox parcel (up to 2 kg) €4.95 · parcel up to 10 kg €7.95 · 10–23 kg €17.95 · heavy parcel 23–31.5 kg €34.95 · 31.5–40 kg €49.95. Collecting at a PostNL point is €0.50 cheaper for parcels.',
        'Free shipping from €99 (for parcels up to 23 kg).',
        'Items over 40 kg (filled heavy bags) ship on a pallet; ask for a quote via WhatsApp.',
      ] },
      { t: 'h', text: 'Right of withdrawal: 14 days' },
      { t: 'p', text: 'You may cancel your purchase within 14 days of receipt without giving a reason. After that you have another 14 days to send the item back.' },
      { t: 'h', text: 'How to return an item' },
      { t: 'ul', items: [
        `Notify us within 14 days of receipt via ${C.email} or WhatsApp (${C.phone}), stating your name, order number and the items you are returning. You may also use the model form below.`,
        'Pack the item well, preferably in its original packaging, and send it to the return address within 14 days of your notice.',
        'Return shipping costs are paid by you. Keep your proof of shipment.',
      ] },
      { t: 'box', title: 'Return address', lines: returnAddr('en') },
      { t: 'h', text: 'Refund' },
      { t: 'p', text: 'Within 14 days of your notice we refund the purchase price including the original standard shipping costs (this is required by law). We do not refund the cost of returning the item. We may wait with the refund until we have received the item or you have shown that you sent it. We refund using the payment method you used.' },
      { t: 'h', text: 'Condition of the item' },
      { t: 'p', text: 'You may try the item on as you would in a shop. If it has been worn, used in training, washed or damaged, we may charge for the reduction in value.' },
      { t: 'h', text: 'Exceptions' },
      { t: 'ul', items: [
        'Mouthguards, underwear and other items sealed for hygiene reasons, if the seal or packaging has been opened after delivery.',
        'Items made or printed especially for you (such as custom teamwear).',
      ] },
      { t: 'h', text: 'Model withdrawal form' },
      { t: 'p', text: 'Only complete and return this form (by e-mail or WhatsApp) if you wish to withdraw from the agreement.' },
      { t: 'box', title: 'Model form', lines: [
        `To: ${C.name}, ${ADDR}, ${C.email}`,
        'I/We* hereby give notice that I/We* withdraw from my/our* contract for the sale of the following goods: …',
        'Ordered on* / Received on*: …',
        'Order number: …',
        'Name of consumer(s): …',
        'Address of consumer(s): …',
        'IBAN (for the refund, if needed): …',
        'Signature (only for a paper form): …',
        'Date: …',
        '* Delete as appropriate.',
      ] },
    ],
    pl: [
      { t: 'p', text: 'To jest tłumaczenie. W razie rozbieżności wiążąca jest wersja holenderska.' },
      { t: 'h', text: 'Dostawa' },
      { t: 'ul', items: [
        'Wysyłamy na terenie Holandii z numerem śledzenia. Czas dostawy: 7–10 dni roboczych od płatności.',
        'Koszt wysyłki zależy od wagi: paczka do skrzynki (do 2 kg) €4,95 · paczka do 10 kg €7,95 · 10–23 kg €17,95 · ciężka paczka 23–31,5 kg €34,95 · 31,5–40 kg €49,95. Odbiór w punkcie PostNL jest o €0,50 tańszy.',
        'Darmowa dostawa od €99 (dla paczek do 23 kg).',
        'Produkty powyżej 40 kg (wypełnione worki) wysyłamy na palecie – zapytaj o cenę przez WhatsApp.',
      ] },
      { t: 'h', text: 'Prawo odstąpienia: 14 dni' },
      { t: 'p', text: 'Możesz odstąpić od zakupu w ciągu 14 dni od otrzymania produktu bez podania przyczyny. Potem masz kolejne 14 dni na odesłanie produktu.' },
      { t: 'h', text: 'Jak zwrócić produkt' },
      { t: 'ul', items: [
        `Zgłoś zwrot w ciągu 14 dni od otrzymania – mailowo na ${C.email} lub przez WhatsApp (${C.phone}). Podaj imię i nazwisko, numer zamówienia i zwracane produkty. Możesz też użyć wzoru formularza poniżej.`,
        'Zapakuj produkt starannie, najlepiej w oryginalne opakowanie, i odeślij go na adres zwrotów w ciągu 14 dni od zgłoszenia.',
        'Koszt odesłania ponosi kupujący. Zachowaj dowód nadania.',
      ] },
      { t: 'box', title: 'Adres do zwrotów', lines: returnAddr('pl') },
      { t: 'h', text: 'Zwrot pieniędzy' },
      { t: 'p', text: 'W ciągu 14 dni od zgłoszenia zwracamy cenę produktu wraz z pierwotnym kosztem standardowej wysyłki (wymaga tego prawo). Nie zwracamy kosztu odesłania produktu. Możemy wstrzymać zwrot do chwili otrzymania produktu lub dowodu jego nadania. Zwrot następuje tą samą metodą płatności.' },
      { t: 'h', text: 'Stan produktu' },
      { t: 'p', text: 'Możesz przymierzyć produkt tak, jak w sklepie stacjonarnym. Jeśli był noszony, używany na treningu, prany lub jest uszkodzony, możemy potrącić utratę wartości.' },
      { t: 'h', text: 'Wyjątki' },
      { t: 'ul', items: [
        'Ochraniacze na zęby, bielizna i inne produkty zapieczętowane ze względów higienicznych, jeśli plomba lub opakowanie zostały otwarte po dostawie.',
        'Produkty wykonane lub nadrukowane specjalnie dla ciebie (np. custom teamwear).',
      ] },
      { t: 'h', text: 'Wzór formularza odstąpienia od umowy' },
      { t: 'p', text: 'Wypełnij i odeślij ten formularz (mailem lub przez WhatsApp) tylko wtedy, gdy chcesz odstąpić od umowy.' },
      { t: 'box', title: 'Wzór formularza', lines: [
        `Adresat: ${C.name}, ${ADDR}, ${C.email}`,
        'Ja/My* niniejszym informuję/informujemy* o moim/naszym odstąpieniu od umowy sprzedaży następujących rzeczy: …',
        'Data zamówienia* / odbioru*: …',
        'Numer zamówienia: …',
        'Imię i nazwisko konsumenta(-ów): …',
        'Adres konsumenta(-ów): …',
        'IBAN (do zwrotu pieniędzy, jeśli potrzebny): …',
        'Podpis (tylko w wersji papierowej): …',
        'Data: …',
        '* Niepotrzebne skreślić.',
      ] },
    ],
  },
};

// ---------------------------------------------------------------------
// PRIVACYBELEID
// ---------------------------------------------------------------------
const privacy: LegalDoc = {
  slug: 'privacy',
  paths: ['/privacy', '/privacybeleid', '/prywatnosc'],
  title: { nl: 'Privacybeleid', en: 'Privacy policy', pl: 'Polityka prywatności' },
  updated: UPDATED,
  body: {
    nl: [
      { t: 'p', text: `${C.name} (${C.website}) is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit privacybeleid. We verwerken alleen wat nodig is en verkopen je gegevens nooit.` },
      companyBox('nl'),
      { t: 'h', text: 'Welke gegevens en waarom' },
      { t: 'ul', items: [
        'Bestellen: naam, adres, e-mailadres, telefoonnummer, bestelde artikelen en betaalstatus – om je bestelling te leveren en je op de hoogte te houden (uitvoering van de overeenkomst).',
        'Bedrijfsgegevens bij zakelijke bestellingen (bedrijfsnaam, KvK, btw-nummer) – voor de factuur.',
        'Contact (formulier, e-mail, WhatsApp): de gegevens die je zelf stuurt – om je vraag te beantwoorden.',
        'Boekhouding: factuur- en betaalgegevens – omdat we die volgens de wet 7 jaar moeten bewaren.',
        'Er is geen klantaccount: je hoeft geen account aan te maken om te bestellen.',
      ] },
      { t: 'h', text: 'Met wie we gegevens delen' },
      { t: 'p', text: 'Alleen met partijen die nodig zijn om je bestelling uit te voeren. Met hen hebben we afspraken over de beveiliging van je gegevens:' },
      { t: 'ul', items: [
        'Betaaldienstverlener (bijvoorbeeld Mollie) – voor de betaling.',
        'Vervoerders (PostNL, DHL, DPD, GLS, InPost) – naam, adres en eventueel telefoon/e-mail voor de bezorging.',
        'Onze leverancier in Polen – adresgegevens als je bestelling direct vanuit Polen wordt verzonden.',
        'Hosting, database en e-maildienst van de webshop – om de site te laten werken en bevestigingsmails te sturen.',
        'WhatsApp (Meta) – alleen als je zelf contact met ons opneemt via WhatsApp.',
      ] },
      { t: 'h', text: 'Hoe lang we gegevens bewaren' },
      { t: 'p', text: 'Bestel- en factuurgegevens 7 jaar (fiscale bewaarplicht). Berichten via contactformulier, e-mail of WhatsApp bewaren we zo lang als nodig is om je vraag af te handelen, maximaal 2 jaar.' },
      { t: 'h', text: 'Beveiliging' },
      { t: 'p', text: 'De website gebruikt een beveiligde verbinding (HTTPS). Betaalgegevens gaan rechtstreeks naar de betaaldienstverlener en worden niet door ons opgeslagen.' },
      { t: 'h', text: 'Jouw rechten' },
      { t: 'p', text: `Je hebt het recht om je gegevens in te zien, te laten corrigeren of verwijderen, de verwerking te beperken, bezwaar te maken en je gegevens over te laten dragen. Stuur je verzoek naar ${C.email}; we reageren binnen een maand. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).` },
      { t: 'h', text: 'Cookies' },
      { t: 'p', text: 'Zie ons cookiebeleid.' },
    ],
    en: [
      { t: 'p', text: 'This is a translation. In case of any difference the Dutch version prevails.' },
      { t: 'p', text: `${C.name} (${C.website}) is responsible for processing personal data as described in this policy. We only process what is necessary and never sell your data.` },
      companyBox('en'),
      { t: 'h', text: 'What data and why' },
      { t: 'ul', items: [
        'Ordering: name, address, e-mail, phone number, ordered items and payment status – to deliver your order and keep you informed (performance of the contract).',
        'Company details for business orders (company name, KvK, VAT number) – for the invoice.',
        'Contact (form, e-mail, WhatsApp): the data you send us – to answer your question.',
        'Accounting: invoice and payment data – because Dutch law requires us to keep them for 7 years.',
        'There is no customer account: you do not need to register to order.',
      ] },
      { t: 'h', text: 'Who we share data with' },
      { t: 'p', text: 'Only with parties needed to fulfil your order, with whom we have agreed on data protection:' },
      { t: 'ul', items: [
        'Payment service provider (e.g. Mollie) – for the payment.',
        'Carriers (PostNL, DHL, DPD, GLS, InPost) – name, address and possibly phone/e-mail for delivery.',
        'Our supplier in Poland – address details if your order ships directly from Poland.',
        'Hosting, database and e-mail service of the webshop – to run the site and send confirmation e-mails.',
        'WhatsApp (Meta) – only if you contact us via WhatsApp yourself.',
      ] },
      { t: 'h', text: 'How long we keep data' },
      { t: 'p', text: 'Order and invoice data for 7 years (tax obligation). Messages via the contact form, e-mail or WhatsApp as long as needed to handle your question, at most 2 years.' },
      { t: 'h', text: 'Security' },
      { t: 'p', text: 'The website uses a secure connection (HTTPS). Payment details go directly to the payment provider and are not stored by us.' },
      { t: 'h', text: 'Your rights' },
      { t: 'p', text: `You have the right to access, correct or delete your data, to restrict processing, to object and to data portability. Send your request to ${C.email}; we respond within one month. You can also file a complaint with the Dutch Data Protection Authority (autoriteitpersoonsgegevens.nl).` },
      { t: 'h', text: 'Cookies' },
      { t: 'p', text: 'See our cookie policy.' },
    ],
    pl: [
      { t: 'p', text: 'To jest tłumaczenie. W razie rozbieżności wiążąca jest wersja holenderska.' },
      { t: 'p', text: `${C.name} (${C.website}) jest administratorem danych osobowych opisanych w tej polityce. Przetwarzamy tylko to, co konieczne, i nigdy nie sprzedajemy twoich danych.` },
      companyBox('pl'),
      { t: 'h', text: 'Jakie dane i po co' },
      { t: 'ul', items: [
        'Zamówienie: imię i nazwisko, adres, e-mail, telefon, zamówione produkty i status płatności – aby dostarczyć zamówienie i informować cię o nim (wykonanie umowy).',
        'Dane firmy przy zamówieniach firmowych (nazwa, KvK, numer VAT) – do faktury.',
        'Kontakt (formularz, e-mail, WhatsApp): dane, które sam przesyłasz – aby odpowiedzieć na pytanie.',
        'Księgowość: dane faktur i płatności – prawo holenderskie wymaga ich przechowywania przez 7 lat.',
        'Nie ma konta klienta: do zakupu nie musisz się rejestrować.',
      ] },
      { t: 'h', text: 'Komu przekazujemy dane' },
      { t: 'p', text: 'Tylko podmiotom potrzebnym do realizacji zamówienia, z którymi uzgodniliśmy ochronę danych:' },
      { t: 'ul', items: [
        'Operator płatności (np. Mollie) – do obsługi płatności.',
        'Przewoźnicy (PostNL, DHL, DPD, GLS, InPost) – imię i nazwisko, adres i ewentualnie telefon/e-mail do doręczenia.',
        'Nasz dostawca w Polsce – dane adresowe, jeśli paczka jest wysyłana bezpośrednio z Polski.',
        'Hosting, baza danych i usługa e-mail sklepu – aby strona działała i wysyłała potwierdzenia.',
        'WhatsApp (Meta) – tylko jeśli sam skontaktujesz się z nami przez WhatsApp.',
      ] },
      { t: 'h', text: 'Jak długo przechowujemy dane' },
      { t: 'p', text: 'Dane zamówień i faktur 7 lat (obowiązek podatkowy). Wiadomości z formularza, e-maila lub WhatsAppa tak długo, jak to potrzebne do obsługi sprawy, maksymalnie 2 lata.' },
      { t: 'h', text: 'Bezpieczeństwo' },
      { t: 'p', text: 'Strona korzysta z bezpiecznego połączenia (HTTPS). Dane płatnicze trafiają bezpośrednio do operatora płatności i nie są przez nas przechowywane.' },
      { t: 'h', text: 'Twoje prawa' },
      { t: 'p', text: `Masz prawo dostępu do danych, ich poprawienia lub usunięcia, ograniczenia przetwarzania, sprzeciwu i przeniesienia danych. Wyślij wniosek na ${C.email}; odpowiemy w ciągu miesiąca. Możesz też złożyć skargę do holenderskiego organu ochrony danych (autoriteitpersoonsgegevens.nl).` },
      { t: 'h', text: 'Cookies' },
      { t: 'p', text: 'Zobacz politykę cookies.' },
    ],
  },
};

// ---------------------------------------------------------------------
// COOKIEBELEID
// ---------------------------------------------------------------------
const cookies: LegalDoc = {
  slug: 'cookies',
  paths: ['/cookies', '/cookiebeleid'],
  title: { nl: 'Cookiebeleid', en: 'Cookie policy', pl: 'Polityka cookies' },
  updated: UPDATED,
  body: {
    nl: [
      { t: 'p', text: 'We houden het simpel: deze webshop gebruikt geen tracking- of advertentiecookies en geen analysetools.' },
      { t: 'h', text: 'Wat we wel opslaan (noodzakelijk)' },
      { t: 'ul', items: [
        'Je winkelwagen, verlanglijst en vergelijkingslijst – zodat je bestelling niet verdwijnt als je de pagina ververst.',
        'Je taalkeuze en je keuze in de cookiemelding.',
      ] },
      { t: 'p', text: 'Deze gegevens staan alleen in je eigen browser (local storage) en worden niet naar ons of naar derden gestuurd. Hiervoor is geen toestemming nodig.' },
      { t: 'h', text: 'Externe diensten' },
      { t: 'ul', items: [
        'Lettertypen (Google Fonts) en iconen worden geladen van externe servers; daarbij wordt je IP-adres aan die server doorgegeven.',
        'Betalen gebeurt op de beveiligde pagina van de betaaldienstverlener; die kan daar eigen, noodzakelijke cookies gebruiken.',
        'De WhatsApp-knop opent pas WhatsApp als je erop klikt.',
      ] },
      { t: 'h', text: 'Wijzigen of verwijderen' },
      { t: 'p', text: 'Je kunt opgeslagen gegevens op elk moment wissen via de instellingen van je browser. Gaan we in de toekomst analysecookies gebruiken, dan vragen we eerst je toestemming en passen we dit beleid aan.' },
    ],
    en: [
      { t: 'p', text: 'This is a translation. In case of any difference the Dutch version prevails.' },
      { t: 'p', text: 'We keep it simple: this webshop uses no tracking or advertising cookies and no analytics tools.' },
      { t: 'h', text: 'What we do store (necessary)' },
      { t: 'ul', items: [
        'Your cart, wishlist and comparison list – so your order does not disappear when you reload the page.',
        'Your language and your choice in the cookie notice.',
      ] },
      { t: 'p', text: 'This data is stored only in your own browser (local storage) and is not sent to us or to third parties. No consent is required for this.' },
      { t: 'h', text: 'External services' },
      { t: 'ul', items: [
        'Fonts (Google Fonts) and icons are loaded from external servers; your IP address is passed to those servers.',
        'Payment takes place on the secure page of the payment provider, which may use its own necessary cookies.',
        'The WhatsApp button only opens WhatsApp when you click it.',
      ] },
      { t: 'h', text: 'Change or delete' },
      { t: 'p', text: 'You can clear stored data at any time in your browser settings. If we start using analytics cookies in the future, we will ask for your consent first and update this policy.' },
    ],
    pl: [
      { t: 'p', text: 'To jest tłumaczenie. W razie rozbieżności wiążąca jest wersja holenderska.' },
      { t: 'p', text: 'Krótko: ten sklep nie używa ciasteczek śledzących ani reklamowych i nie korzysta z narzędzi analitycznych.' },
      { t: 'h', text: 'Co zapisujemy (niezbędne)' },
      { t: 'ul', items: [
        'Twój koszyk, ulubione i listę porównania – żeby zamówienie nie znikało po odświeżeniu strony.',
        'Wybrany język i twoją decyzję w komunikacie o cookies.',
      ] },
      { t: 'p', text: 'Te dane są tylko w twojej przeglądarce (local storage) i nie są wysyłane do nas ani do innych firm. Nie wymagają zgody.' },
      { t: 'h', text: 'Usługi zewnętrzne' },
      { t: 'ul', items: [
        'Czcionki (Google Fonts) i ikony ładowane są z zewnętrznych serwerów; przy tym twój adres IP trafia do tych serwerów.',
        'Płatność odbywa się na bezpiecznej stronie operatora płatności, który może używać własnych niezbędnych ciasteczek.',
        'Przycisk WhatsApp otwiera WhatsApp dopiero po kliknięciu.',
      ] },
      { t: 'h', text: 'Zmiana lub usunięcie' },
      { t: 'p', text: 'Zapisane dane możesz w każdej chwili usunąć w ustawieniach przeglądarki. Jeśli w przyszłości dodamy ciasteczka analityczne, najpierw poprosimy o zgodę i zaktualizujemy tę politykę.' },
    ],
  },
};

export const LEGAL_DOCS: LegalDoc[] = [terms, returns, privacy, cookies];

export const findLegalDoc = (path: string) => LEGAL_DOCS.find(d => d.paths.includes(path));
export const legalPath = (slug: string) => LEGAL_DOCS.find(d => d.slug === slug)?.paths[0] ?? '/';
