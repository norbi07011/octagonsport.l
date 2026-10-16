/*
 * Karty „spotlight” na górze podstron kategorii (oraz Kids na stronie głównej).
 * Każda karta: scena z wyciętym produktem/modelem, obrót (druga strona), roster do wyboru,
 * prawdziwe cechy z opisów produktów (scripts/catalog/source/nl_desc.json).
 * Zdjęcia bez tła: public/showcase/* (scripts/showcase/cutout.py).
 */

export type SpotLang = 'nl' | 'en' | 'pl';
export type T3 = Record<SpotLang, string>;
const t = (nl: string, en: string, pl: string): T3 => ({ nl, en, pl });

export type SpotTheme = 'comic' | 'street' | 'silk' | 'cage' | 'minimal';

export interface SpotItem {
  key: string;
  /** id produktu w katalogu */
  id: string;
  name: string;
  /** nazwa w rosterze (domyślnie name) */
  rosterLabel?: string;
  sub: T3 | string;
  tag: T3 | string;
  accent: string;
  /** widok główny i druga strona (po obrocie) */
  imgA: string;
  imgB: string;
  features?: T3[];
  /** tylko motyw comic (dzieci) */
  stats?: [number, number, number, number];
}

export interface SpotConfig {
  id: string;
  theme: SpotTheme;
  eyebrow: string;
  title: T3;
  badge: string;
  /** napis wyskakujący przy wyborze (np. FIGHT!) */
  popWord?: string;
  /** osoby (koszulki na modelach) czy produkty */
  kind: 'person' | 'product';
  /** etykiety przycisku obrotu [widok A, widok B] */
  flipLabels: [T3, T3];
  description?: T3;
  stickers?: T3[];
  allLink: string;
  allLabel: T3;
  defaultIndex: number;
  items: SpotItem[];
}

const PERSON_FLIP: [T3, T3] = [t('Voorkant', 'Front', 'Przód'), t('Achterkant', 'Back', 'Tył')];
const PRODUCT_FLIP: [T3, T3] = [t('Andere kant', 'Other side', 'Druga strona'), t('Andere kant', 'Other side', 'Druga strona')];
const MADE_PL = t('Gemaakt in Polen', 'Made in Poland', 'Wyprodukowano w Polsce');

/* ---------------- KIDS ---------------- */
const kids: SpotConfig = {
  id: 'kids',
  theme: 'comic',
  eyebrow: 'Legion Kids · Brainrot',
  title: t('Kies je fighter', 'Choose your fighter', 'Wybierz wojownika'),
  badge: 'PLAYER 1',
  popWord: 'FIGHT!',
  kind: 'person',
  flipLabels: PERSON_FLIP,
  description: t(
    'Kinder-T-shirt uit de Brainrot-collectie met een grote, opvallende print. 100% zacht katoen – perfect voor school, training en elke dag.',
    'Kids’ T-shirt from the Brainrot collection with a big, eye-catching print. 100% soft cotton – perfect for school, training and every day.',
    'Koszulka dziecięca z kolekcji Brainrot z dużym, efektownym nadrukiem. 100% miękkiej bawełny – do szkoły, na trening i na co dzień.'
  ),
  stickers: [t('100% katoen', '100% cotton', '100% bawełny'), t('Grote print', 'Big print', 'Duży nadruk'), t('Wassen op 30°', 'Wash at 30°', 'Pranie w 30°')],
  allLink: '/category/kids',
  allLabel: t('Alle kids-items', 'All kids items', 'Wszystko dla dzieci'),
  defaultIndex: 2,
  items: [
    { key: 'bull', id: 'oct-6009', name: 'Boombullini', sub: 'Knockoutini', tag: t('Boksen', 'Boxing', 'Boks'), accent: '#2f8bff', imgA: '/showcase/kids-bull-back.webp', imgB: '/showcase/kids-bull-front.webp', stats: [95, 70, 76, 86] },
    { key: 'croc', id: 'oct-6008', name: 'Braziliano', sub: 'Crocodano', tag: 'BJJ', accent: '#a3e635', imgA: '/showcase/kids-croc-back.webp', imgB: '/showcase/kids-croc-front.webp', stats: [74, 68, 96, 90] },
    { key: 'gorilla', id: 'oct-6004', name: 'Gorillacio', sub: 'MMAssacracio', tag: 'MMA', accent: '#ff2533', imgA: '/showcase/kids-gorilla-back.webp', imgB: '/showcase/kids-gorilla-front.webp', stats: [98, 64, 82, 88] },
    { key: 'tiger', id: 'oct-6010', name: 'Thaigerini', sub: 'Muaythini', tag: 'Muay Thai', accent: '#ff8a1f', imgA: '/showcase/kids-tiger-back.webp', imgB: '/showcase/kids-tiger-front.webp', stats: [86, 93, 88, 84] },
  ],
};

/* ---------------- HEREN ---------------- */
const TEE_FEATURES = [t('Stevige stof 210 g/m²', 'Heavy 210 g/m² fabric', 'Gruba tkanina 210 g/m²'), t('100% katoen', '100% cotton', '100% bawełny'), MADE_PL];
const men: SpotConfig = {
  id: 'men',
  theme: 'street',
  eyebrow: 'Legion Octagon · 2026 Collection',
  title: t('Draag je verhaal', 'Wear your story', 'Noś swoją historię'),
  badge: 'NEW 2026',
  kind: 'person',
  flipLabels: PERSON_FLIP,
  description: t(
    'Grafische T-shirts uit de nieuwe 2026-collectie: grote print op de rug, klein ontwerp op de borst. Zacht, stevig katoen voor elke dag.',
    'Graphic T-shirts from the new 2026 collection: big print on the back, small design on the chest. Soft, heavy cotton for every day.',
    'Koszulki z nowej kolekcji 2026: duży nadruk na plecach, mały na piersi. Miękka, gruba bawełna na co dzień.'
  ),
  allLink: '/category/heren?sub=t-shirts',
  allLabel: t('Alle T-shirts', 'All T-shirts', 'Wszystkie koszulki'),
  defaultIndex: 0,
  items: [
    { key: 'quiet', id: 'oct-6040', name: 'Be Quiet', sub: 'or Be Dead', tag: 'T-shirt', accent: '#ff2533', imgA: '/showcase/men-6040-a.webp', imgB: '/showcase/men-6040-b.webp', features: TEE_FEATURES },
    { key: 'horror', id: 'oct-6038', name: 'Horror Show', sub: '2026', tag: 'T-shirt', accent: '#ff7a1a', imgA: '/showcase/men-6038-a.webp', imgB: '/showcase/men-6038-b.webp', features: TEE_FEATURES },
    { key: 'ego', id: 'oct-6035', name: 'Alter Ego', sub: 'Meet my', tag: 'T-shirt', accent: '#e0a83a', imgA: '/showcase/men-6035-a.webp', imgB: '/showcase/men-6035-b.webp', features: TEE_FEATURES },
    { key: 'underground', id: 'oct-6039', name: 'Underground', sub: 'Warriors', tag: 'T-shirt', accent: '#a9b56a', imgA: '/showcase/men-6039-a.webp', imgB: '/showcase/men-6039-b.webp', features: TEE_FEATURES },
  ],
};

/* ---------------- DAMES ---------------- */
const LEGGING_FEATURES = [t('Hoge tailleband', 'High waistband', 'Wysoki stan'), t('4-way stretch', '4-way stretch', 'Rozciągliwość 4-way'), t('Ademend & licht', 'Breathable & light', 'Oddychające i lekkie')];
const women: SpotConfig = {
  id: 'women',
  theme: 'silk',
  eyebrow: 'Legion Octagon · Women',
  title: t('Sterk & stijlvol', 'Strong & stylish', 'Silna i stylowa'),
  badge: 'WOMEN',
  kind: 'person',
  flipLabels: [t('Draai om', 'Turn around', 'Obróć'), t('Draai om', 'Turn around', 'Obróć')],
  allLink: '/category/dames',
  allLabel: t('Alles voor dames', 'All women', 'Wszystko dla kobiet'),
  defaultIndex: 0,
  items: [
    { key: 'ribbed-black', id: 'oct-6209', name: 'Ribbed', rosterLabel: 'Ribbed Black', sub: t('Legging zwart', 'Leggings black', 'Legginsy czarne'), tag: 'Legging', accent: '#ff5fa2', imgA: '/showcase/women-6209-a.webp', imgB: '/showcase/women-6209-b.webp', features: LEGGING_FEATURES },
    { key: 'ribbed-beige', id: 'oct-6207', name: 'Ribbed', rosterLabel: 'Ribbed Beige', sub: t('Legging beige', 'Leggings beige', 'Legginsy beżowe'), tag: 'Legging', accent: '#e8c39e', imgA: '/showcase/women-6207-a.webp', imgB: '/showcase/women-6207-b.webp', features: LEGGING_FEATURES },
    { key: 'ring', id: 'oct-3528', name: 'Ring', sub: t('Oversized T-shirt', 'Oversized T-shirt', 'Koszulka oversize'), tag: 'T-shirt', accent: '#b9a7ff', imgA: '/showcase/women-3528-a.webp', imgB: '/showcase/women-3528-b.webp', features: [t('Oversized fit', 'Oversized fit', 'Krój oversize'), t('92% katoen, 8% elastaan', '92% cotton, 8% elastane', '92% bawełny, 8% elastanu'), MADE_PL] },
    { key: 'oct', id: 'oct-6234', name: 'OCT.', sub: t('T-shirt zwart', 'T-shirt black', 'Koszulka czarna'), tag: 'T-shirt', accent: '#ff8fb3', imgA: '/showcase/women-6234-a.webp', imgB: '/showcase/women-6234-b.webp', features: [t('100% katoen', '100% cotton', '100% bawełny'), t('180 g/m²', '180 g/m²', '180 g/m²'), MADE_PL] },
  ],
};

/* ---------------- FIGHT GEAR ---------------- */
const fightGear: SpotConfig = {
  id: 'fight-gear',
  theme: 'cage',
  eyebrow: 'Legion Octagon · Fight Gear',
  title: t('Complete je kit', 'Complete your kit', 'Skompletuj sprzęt'),
  badge: 'GEAR UP',
  popWord: 'READY?',
  kind: 'product',
  flipLabels: PRODUCT_FLIP,
  allLink: '/category/fight-gear',
  allLabel: t('Alle fight gear', 'All fight gear', 'Cały sprzęt'),
  defaultIndex: 0,
  items: [
    { key: 'gloves', id: 'oct-5633', name: 'Kevlar', rosterLabel: 'Kevlar Gloves', sub: t('Bokshandschoenen', 'Boxing gloves', 'Rękawice bokserskie'), tag: '8–16 oz', accent: '#ff2533', imgA: '/showcase/kevlar-red-pair.webp', imgB: '/showcase/kevlar-red-side.webp', features: [t('KEVLAR-coating', 'KEVLAR coating', 'Powłoka KEVLAR'), t('Brede klittenband', 'Wide strap', 'Szeroki rzep'), t('Gevormde duim', 'Shaped thumb', 'Wyprofilowany kciuk')] },
    { key: 'guardox', id: 'oct-6075', name: 'Guardox', sub: t('2-in-1 bokshelm', '2-in-1 head guard', 'Kask 2w1'), tag: 'XS–XL', accent: '#2f6bff', imgA: '/showcase/guardox-blue-hero.webp', imgB: '/showcase/guardox-blue-detail.webp', features: [t('Volledig gezichtsmasker', 'Full face mask', 'Pełna osłona twarzy'), t('Meerlaags schuim', 'Multi-layer foam', 'Wielowarstwowa pianka'), t('Oren & achterhoofd', 'Ears & back of head', 'Uszy i potylica')] },
    { key: 'shin', id: 'oct-5804', name: 'Kevlar', rosterLabel: 'Kevlar Shins', sub: t('Scheenbeschermers', 'Shin guards', 'Ochraniacze goleni'), tag: 'K-1 · Muay Thai', accent: '#e8b730', imgA: '/showcase/shin-kevlar-gold-hero.webp', imgB: '/showcase/shin-kevlar-gold-detail.webp', features: [t('KEVLAR-coating', 'KEVLAR coating', 'Powłoka KEVLAR'), t('Verdicht schuim', 'Dense foam', 'Zagęszczona pianka'), t('12 mnd garantie', '12-month warranty', '12 mies. gwarancji')] },
    { key: 'wraps', id: 'oct-5874', name: 'Supreme', sub: t('Bandages', 'Hand wraps', 'Owijki'), tag: '3 m', accent: '#5cff3d', imgA: '/showcase/supreme-lime-hero.webp', imgB: '/showcase/supreme-lime-detail.webp', features: [t('Velcro Quick', 'Velcro Quick', 'Velcro Quick'), t('95% katoen', '95% cotton', '95% bawełny'), t('Stabiele pols', 'Stable wrist', 'Stabilny nadgarstek')] },
  ],
};

/* ---------------- TRAINING ---------------- */
const LEATHER = t('Echt leer', 'Genuine leather', 'Skóra naturalna');
const training: SpotConfig = {
  id: 'training',
  theme: 'cage',
  eyebrow: 'Legion Octagon · Training',
  title: t('Train als een prof', 'Train like a pro', 'Trenuj jak zawodowiec'),
  badge: 'TRAINING',
  kind: 'product',
  flipLabels: PRODUCT_FLIP,
  allLink: '/category/training',
  allLabel: t('Alle trainingsmaterialen', 'All training gear', 'Cały sprzęt treningowy'),
  defaultIndex: 0,
  items: [
    { key: 'mitts', id: 'oct-5652', name: 'Pro Series', sub: t('Focus mitts', 'Focus mitts', 'Łapy trenerskie'), tag: t('Leer', 'Leather', 'Skóra'), accent: '#ff2533', imgA: '/showcase/training-5652-a.webp', imgB: '/showcase/training-5652-b.webp', features: [LEATHER, t('Harde schuimvulling', 'Firm foam filling', 'Twarde wypełnienie'), t('Extra vingerbescherming', 'Extra finger protection', 'Ochrona palców')] },
    { key: 'pads', id: 'oct-5659', name: 'Matrix', sub: t('Thai pads', 'Thai pads', 'Tarcze Thai'), tag: t('Set van 2', 'Set of 2', 'Zestaw 2 szt.'), accent: '#ff9d1a', imgA: '/showcase/training-5659-a.webp', imgB: '/showcase/training-5659-b.webp', features: [LEATHER, t('42 × 21 × 12 cm', '42 × 21 × 12 cm', '42 × 21 × 12 cm'), t('12 mnd garantie', '12-month warranty', '12 mies. gwarancji')] },
    { key: 'atlas', id: 'oct-6084', name: 'Atlas', sub: t('Bokszak 30 kg', 'Punch bag 30 kg', 'Worek 30 kg'), tag: 'Premium', accent: '#2f8bff', imgA: '/showcase/training-6084-a.webp', imgB: '/showcase/training-6084-b.webp', features: [t('Peervorm', 'Pear shape', 'Kształt gruszki'), t('Stalen kettingen', 'Steel chains', 'Stalowe łańcuchy'), t('Boksen · MMA · Muay Thai', 'Boxing · MMA · Muay Thai', 'Boks · MMA · Muay Thai')] },
    { key: 'ball', id: 'oct-4901', name: 'Medicijnbal', rosterLabel: 'Med Ball', sub: t('3 kg · leer', '3 kg · leather', '3 kg · skóra'), tag: '3 kg', accent: '#a3e635', imgA: '/showcase/training-4901-a.webp', imgB: '/showcase/training-4901-b.webp', features: [LEATHER, t('Kracht & explosiviteit', 'Power & explosiveness', 'Siła i dynamika'), t('12 mnd garantie', '12-month warranty', '12 mies. gwarancji')] },
  ],
};

/* ---------------- ACCESSOIRES ---------------- */
const accessories: SpotConfig = {
  id: 'accessories',
  theme: 'minimal',
  eyebrow: 'Legion Octagon · Accessoires',
  title: t('Details maken de fighter', 'Details make the fighter', 'Detale tworzą wojownika'),
  badge: 'ESSENTIALS',
  kind: 'product',
  flipLabels: PRODUCT_FLIP,
  allLink: '/category/accessoires',
  allLabel: t('Alle accessoires', 'All accessories', 'Wszystkie akcesoria'),
  defaultIndex: 0,
  items: [
    { key: 'shadow', id: 'oct-6028', name: 'Shadow', sub: t('Rugzak / sporttas', 'Backpack / gym bag', 'Plecak / torba'), tag: '2-in-1', accent: '#9fc2ff', imgA: '/showcase/acc-6028-a.webp', imgB: '/showcase/acc-6028-b.webp', features: [t('Rugzak én sporttas', 'Backpack and gym bag', 'Plecak i torba'), t('Ruim hoofdvak', 'Roomy main compartment', 'Pojemna komora'), t('Vochtbestendig', 'Moisture-resistant', 'Odporny na wilgoć')] },
    { key: 'cap', id: 'oct-6107', name: 'Worldwide', sub: t('Pet · Est. 2010', 'Cap · Est. 2010', 'Czapka · Est. 2010'), tag: 'Six-panel', accent: '#ff2533', imgA: '/showcase/acc-6107-a.webp', imgB: '/showcase/acc-6107-b.webp', features: [t('Geborduurd 3D-logo', 'Embroidered 3D logo', 'Haftowane logo 3D'), t('Ventilatiegaatjes', 'Ventilation holes', 'Otwory wentylacyjne'), t('Verstelbaar', 'Adjustable', 'Regulowana')] },
    { key: 'kastet', id: 'oct-4373', name: 'Kastet', sub: t('Bivakmuts', 'Balaclava', 'Kominiarka'), tag: 'One size', accent: '#c0c8d8', imgA: '/showcase/acc-4373-a.webp', imgB: '/showcase/acc-4373-b.webp', features: [t('Elastisch materiaal', 'Stretch fabric', 'Elastyczny materiał'), t('Tegen kou & schuren', 'Against cold & chafing', 'Chroni przed zimnem'), MADE_PL] },
    { key: 'shaker', id: 'oct-6123', name: 'Basic', rosterLabel: 'Shaker', sub: t('Shaker 600 ml', 'Shaker 600 ml', 'Shaker 600 ml'), tag: '600 ml', accent: '#a3e635', imgA: '/showcase/acc-6123-a.webp', imgB: '/showcase/acc-6123-b.webp', features: [t('BPA-vrij', 'BPA-free', 'Bez BPA'), t('Mengzeef', 'Mixing sieve', 'Sitko do mieszania'), t('Lekbestendig', 'Leak-proof', 'Szczelny')] },
  ],
};

/* ---------------- NIEUW ---------------- */
const newDrops: SpotConfig = {
  id: 'new',
  theme: 'street',
  eyebrow: 'Legion Octagon · New Drop',
  title: t('Net binnen', 'Just dropped', 'Właśnie wjechało'),
  badge: 'NEW',
  popWord: 'NEW!',
  kind: 'product',
  flipLabels: PRODUCT_FLIP,
  allLink: '/nieuw',
  allLabel: t('Alle nieuwe items', 'All new items', 'Wszystkie nowości'),
  defaultIndex: 0,
  items: [
    { key: 'arctic', id: 'oct-6250', name: 'Arctic', sub: t('Muay Thai shorts', 'Muay Thai shorts', 'Spodenki Muay Thai'), tag: 'Premium OPS', accent: '#2ec5ff', imgA: '/showcase/new-6250-a.webp', imgB: '/showcase/new-6250-b.webp', features: [t('Zeer licht', 'Very light', 'Bardzo lekkie'), t('Extra splitten', 'Extra side splits', 'Dodatkowe rozcięcia'), t('Getest door K-1-vechters', 'Tested by K-1 fighters', 'Testowane przez zawodników K-1')] },
    { key: 'escape', id: 'oct-6049', name: 'Escape', sub: t('Rashguard lange mouw', 'Long-sleeve rashguard', 'Rashguard z długim rękawem'), tag: 'Premium', accent: '#ff2533', imgA: '/showcase/new-6049-a.webp', imgB: '/showcase/new-6049-b.webp', features: [t('Thermoactief', 'Thermo-active', 'Termoaktywny'), t('Sneldrogend', 'Quick-drying', 'Szybkoschnący'), t('Platte naden', 'Flat seams', 'Płaskie szwy')] },
    { key: 'memento', id: 'oct-6270', name: 'Memento Mori', rosterLabel: 'Memento', sub: t('Sweater', 'Sweatshirt', 'Bluza'), tag: '420 g/m²', accent: '#e0a040', imgA: '/showcase/new-6270-a.webp', imgB: '/showcase/new-6270-b.webp', features: [t('420 g/m²', '420 g/m²', '420 g/m²'), t('80% katoen', '80% cotton', '80% bawełny'), MADE_PL] },
    { key: 'hft', id: 'oct-6241', name: 'HFT', sub: t('Polo beige', 'Polo beige', 'Polo beżowe'), tag: 'Polo', accent: '#d8c3a0', imgA: '/showcase/new-6241-a.webp', imgB: '/showcase/new-6241-b.webp', features: [t('100% katoen', '100% cotton', '100% bawełny'), t('230 g/m²', '230 g/m²', '230 g/m²'), MADE_PL] },
  ],
};

export const SPOTLIGHTS = { kids, men, women, fightGear, training, accessories, newDrops };

/** Karta dla podstrony kategorii (ścieżka /category/... lub /nieuw) */
export const spotlightForCategory = (category: string, isNew: boolean): SpotConfig | null => {
  if (isNew) return newDrops;
  return ({ kids, heren: men, dames: women, 'fight-gear': fightGear, training, accessoires: accessories } as Record<string, SpotConfig>)[category] || null;
};
