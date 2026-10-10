// =====================================================================
// Koszty wysyłki – liczone automatycznie z wagi paczki
//
// Skąd ceny (stan: październik 2026):
//  • PostNL (NL → NL), cennik od 12.07.2026: brievenbuspakje+ €4,55,
//    pakket do 10 kg €7,45, 10–23 kg €17,45 (do domu, etykieta online, z btw);
//    do punktu PostNL €0,50 taniej. Zakelijk (Mijn PostNL) ok. €7,40 / paczkę.
//  • Z Polski do NL (gdy towaru nie ma w magazynie w NL):
//    InPost do 25 kg ≈ 41–44 zł netto, GLS 25–30 kg 129 zł, 30–40 kg 170 zł netto.
//  • Powyżej 40 kg potrzebna jest paleta (DHL ≈ 1 200 zł) – takich
//    produktów nie wysyłamy automatycznie, tylko na zapytanie.
//
// Cena dla klienta NIE zależy od tego, czy paczka idzie z NL czy z PL –
// klient płaci jedną stawkę, różnicę bierze sklep.
// Wszystkie ceny poniżej są cenami dla klienta, z 21% btw.
// =====================================================================
import { CartItem, Product } from '../types';

/** Darmowa dostawa od tej kwoty (zwykłe paczki do 23 kg). */
export const FREE_SHIPPING_THRESHOLD = 99;

/** Maksymalna waga jednej zwykłej paczki (limit PostNL). */
export const MAX_PARCEL_KG = 23;

export type ParcelTier = 'letterbox' | 'small' | 'medium' | 'heavy' | 'xheavy';

export const TIERS: Record<ParcelTier, { maxKg: number; home: number; pickup: number; label: { nl: string; en: string; pl: string } }> = {
  letterbox: { maxKg: 2, home: 4.95, pickup: 4.95, label: { nl: 'Brievenbuspakje (tot 2 kg)', en: 'Letterbox parcel (up to 2 kg)', pl: 'Paczka do skrzynki (do 2 kg)' } },
  small: { maxKg: 10, home: 7.95, pickup: 7.45, label: { nl: 'Pakket tot 10 kg', en: 'Parcel up to 10 kg', pl: 'Paczka do 10 kg' } },
  medium: { maxKg: 23, home: 17.95, pickup: 17.45, label: { nl: 'Pakket 10–23 kg', en: 'Parcel 10–23 kg', pl: 'Paczka 10–23 kg' } },
  heavy: { maxKg: 31.5, home: 34.95, pickup: 34.95, label: { nl: 'Zwaar pakket 23–31,5 kg', en: 'Heavy parcel 23–31.5 kg', pl: 'Ciężka paczka 23–31,5 kg' } },
  xheavy: { maxKg: 40, home: 49.95, pickup: 49.95, label: { nl: 'Extra zwaar pakket 31,5–40 kg', en: 'Extra heavy parcel 31.5–40 kg', pl: 'Bardzo ciężka paczka 31,5–40 kg' } },
};

/** Powyżej tej wagi (jeden produkt) – tylko transport paletowy, na zapytanie. */
export const FREIGHT_KG = 40;

export interface ShippingProfile {
  /** Szacowana waga z opakowaniem (kg). */
  kg: number;
  /** Mieści się w skrzynce na listy (brievenbus, max 38 × 26,5 × 3,2 cm). */
  letterbox: boolean;
}

// Szacowana waga wysyłkowa (z opakowaniem) dla każdej podkategorii.
// Dostawca nie podaje wag – to wartości typowe dla tych produktów.
const BY_SUBCATEGORY: Record<string, ShippingProfile> = {
  bokshandschoenen: { kg: 1.1, letterbox: false },
  'mma-handschoenen': { kg: 0.6, letterbox: false },
  scheenbeschermers: { kg: 1.2, letterbox: false },
  bokshelmen: { kg: 1.0, letterbox: false },
  gebitsbeschermers: { kg: 0.1, letterbox: true },
  bandages: { kg: 0.15, letterbox: true },
  'overige-bescherming': { kg: 0.5, letterbox: false },
  kimonos: { kg: 2.2, letterbox: false },
  stootkussens: { kg: 1.6, letterbox: false },
  bokszakken: { kg: 8, letterbox: false },
  medicijnballen: { kg: 5.5, letterbox: false },
  rashguards: { kg: 0.3, letterbox: true },
  'mma-shorts': { kg: 0.3, letterbox: true },
  'kickboxing-shorts': { kg: 0.25, letterbox: true },
  compressieshorts: { kg: 0.2, letterbox: true },
  shorts: { kg: 0.35, letterbox: true },
  sportshirts: { kg: 0.3, letterbox: true },
  't-shirts': { kg: 0.3, letterbox: true },
  polo: { kg: 0.35, letterbox: true },
  tanktops: { kg: 0.25, letterbox: true },
  hoodies: { kg: 0.8, letterbox: false },
  broeken: { kg: 0.7, letterbox: false },
  jassen: { kg: 1.0, letterbox: false },
  leggings: { kg: 0.3, letterbox: true },
  ondergoed: { kg: 0.2, letterbox: true },
  caps: { kg: 0.25, letterbox: false },
  mutsen: { kg: 0.15, letterbox: true },
  bivakmutsen: { kg: 0.15, letterbox: true },
  tassen: { kg: 1.2, letterbox: false },
  shakers: { kg: 0.3, letterbox: false },
  handdoeken: { kg: 0.6, letterbox: false },
  'overige-accessoires': { kg: 0.2, letterbox: true },
};

const DEFAULT_PROFILE: ShippingProfile = { kg: 1, letterbox: false };

/** Waga i rodzaj paczki dla jednego produktu (z wyjątkami po nazwie). */
export const getShippingProfile = (product: Pick<Product, 'subcategory' | 'name'> & { name_pl?: string }): ShippingProfile => {
  const name = (product.name_pl || product.name || '').toLowerCase();
  const base = BY_SUBCATEGORY[product.subcategory] ?? DEFAULT_PROFILE;

  // Worki bokserskie – waga z nazwy / opisu dostawcy
  if (product.subcategory === 'bokszakken') {
    if (name.includes('niewypełniony') || name.includes('unfilled') || name.includes('ongevuld')) return { kg: 7, letterbox: false };
    if (name.includes('75kg') || name.includes('75 kg') || name.includes('180x45')) return { kg: 57, letterbox: false };
    if (name.includes('55kg') || name.includes('55 kg') || name.includes('180x35') || name.includes('phantom')) return { kg: 57, letterbox: false };
    if (name.includes('30 kg') || name.includes('30kg')) return { kg: 32, letterbox: false };
    return base;
  }
  // Piłki lekarskie – 3 / 5 / 8 kg + opakowanie
  const kgInName = name.match(/(\d+(?:[.,]\d+)?)\s?kg/);
  if (product.subcategory === 'medicijnballen' && kgInName) {
    return { kg: parseFloat(kgInName[1].replace(',', '.')) + 0.5, letterbox: false };
  }
  // Portfele, saszetki i nerki są lżejsze niż torby
  if (product.subcategory === 'tassen') {
    if (name.includes('portfel')) return { kg: 0.25, letterbox: true };
    if (name.includes('saszetka') || name.includes('torebka') || name.includes('workoplecak')) return { kg: 0.4, letterbox: false };
    if (name.includes('big') || name.includes('predator') || name.includes('fighting division') || name.includes('shadow')) return { kg: 2.0, letterbox: false };
  }
  return base;
};

/** Czy produkt da się wysłać zwykłą paczką (bez palety). */
export const isFreightOnly = (product: Pick<Product, 'subcategory' | 'name'> & { name_pl?: string }) =>
  getShippingProfile(product).kg > FREIGHT_KG;

export type DeliveryMethod = 'home' | 'pickup';

export interface Parcel {
  kg: number;
  tier: ParcelTier;
  price: number;
  /** Zwykła paczka (do 23 kg) – objęta darmową dostawą od €99. */
  standard: boolean;
}

export interface ShippingQuote {
  /** Do zapłaty przez klienta (z btw). */
  fee: number;
  /** Koszt przed darmową dostawą. */
  fullFee: number;
  parcels: Parcel[];
  totalKg: number;
  letterbox: boolean;
  freeApplied: boolean;
  /** Dopłata za ciężkie paczki (>23 kg), której nie obejmuje darmowa dostawa. */
  heavyFee: number;
  /** Produkty, których nie wysyłamy automatycznie (paleta). */
  freightItems: string[];
}

const tierFor = (kg: number, letterbox: boolean): ParcelTier => {
  if (letterbox && kg <= TIERS.letterbox.maxKg) return 'letterbox';
  if (kg <= TIERS.small.maxKg) return 'small';
  if (kg <= TIERS.medium.maxKg) return 'medium';
  if (kg <= TIERS.heavy.maxKg) return 'heavy';
  return 'xheavy';
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Liczy koszt wysyłki dla koszyka.
 * Produkty do 23 kg pakujemy razem (paczki po max 23 kg),
 * cięższe produkty (np. worek 30 kg) idą osobną paczką.
 */
export const calcShipping = (cart: CartItem[], subtotal: number, method: DeliveryMethod = 'home'): ShippingQuote => {
  const units: { kg: number; letterbox: boolean; name: string }[] = [];
  const freightItems: string[] = [];

  cart.forEach(item => {
    const prof = getShippingProfile(item.product);
    for (let i = 0; i < item.quantity; i++) {
      if (prof.kg > FREIGHT_KG) {
        if (!freightItems.includes(item.product.name)) freightItems.push(item.product.name);
      } else {
        units.push({ kg: prof.kg, letterbox: prof.letterbox, name: item.product.name });
      }
    }
  });

  if (units.length === 0) {
    return { fee: 0, fullFee: 0, parcels: [], totalKg: 0, letterbox: false, freeApplied: false, heavyFee: 0, freightItems };
  }

  // 1) produkty cięższe niż 23 kg – każdy osobno
  const heavyUnits = units.filter(u => u.kg > MAX_PARCEL_KG);
  const normalUnits = units.filter(u => u.kg <= MAX_PARCEL_KG).sort((a, b) => b.kg - a.kg);

  // 2) reszta – pakowanie do paczek po max 23 kg (first-fit decreasing)
  const bins: { kg: number; letterbox: boolean }[] = [];
  normalUnits.forEach(u => {
    const bin = bins.find(b => b.kg + u.kg <= MAX_PARCEL_KG);
    if (bin) {
      bin.kg += u.kg;
      bin.letterbox = bin.letterbox && u.letterbox;
    } else bins.push({ kg: u.kg, letterbox: u.letterbox });
  });

  const parcels: Parcel[] = [
    ...bins.map(b => {
      const tier = tierFor(b.kg, b.letterbox);
      return { kg: round2(b.kg), tier, price: TIERS[tier][method], standard: true };
    }),
    ...heavyUnits.map(u => {
      const tier = tierFor(u.kg, false);
      return { kg: round2(u.kg), tier, price: TIERS[tier][method], standard: false };
    }),
  ];

  const fullFee = round2(parcels.reduce((s, p) => s + p.price, 0));
  const heavyFee = round2(parcels.filter(p => !p.standard).reduce((s, p) => s + p.price, 0));
  const freeApplied = subtotal >= FREE_SHIPPING_THRESHOLD;
  const fee = freeApplied ? heavyFee : fullFee;

  return {
    fee,
    fullFee,
    parcels,
    totalKg: round2(units.reduce((s, u) => s + u.kg, 0)),
    letterbox: parcels.length === 1 && parcels[0].tier === 'letterbox',
    freeApplied,
    heavyFee,
    freightItems,
  };
};

/** Koszt wysyłki samego produktu (1 szt.) – do pokazania na karcie produktu. */
export const quoteForProduct = (product: Product, method: DeliveryMethod = 'home') => {
  const prof = getShippingProfile(product);
  if (prof.kg > FREIGHT_KG) return { freight: true as const, kg: prof.kg };
  const tier = tierFor(prof.kg, prof.letterbox);
  return { freight: false as const, kg: prof.kg, tier, price: TIERS[tier][method], heavy: prof.kg > MAX_PARCEL_KG };
};

export const formatEur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
