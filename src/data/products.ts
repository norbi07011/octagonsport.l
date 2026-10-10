// =====================================================================
// Katalog produktów OctagonSportNL
// Źródło danych: src/data/catalog.json (wygenerowany z oferty dostawcy
// octagonshop.pl – nazwy, zdjęcia, rozmiary, opisy NL/EN/PL).
// Pełne opisy są w public/data/desc-{nl,en,pl}.json i ładują się
// dopiero na stronie produktu (useProductDescription).
// =====================================================================
import catalog from './catalog.json';
import { Product, Language, ProductCategory, SportDiscipline } from '../types';
import { calcPriceEur } from '../config/pricing';

interface RawCatalogProduct {
  id: string;
  supplierId: string;
  slug: string;
  name: string;
  name_en: string;
  name_pl: string;
  brand: string;
  descKey: string;
  category: string;
  subcategory: string;
  sport: string[];
  gender: 'men' | 'women' | 'unisex' | 'kids';
  material: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  pricePln: number;
  /** Cena w EUR w stylu starego sklepu (scripts/catalog/pricing_old_shop.py). */
  priceEur?: number;
  /** Cena regularna, gdy produkt jest w promocji. */
  compareAtEur?: number;
  isSale: boolean;
  stock: number;
  images: string[];
  isNew: boolean;
  published: boolean;
  group: string;
  short: { nl: string; en: string; pl: string };
}

export interface SubcategoryInfo {
  category: string;
  nl: string;
  en: string;
  pl: string;
}

export const SUBCATEGORIES: Record<string, SubcategoryInfo> = (catalog as any).subcategories;

const toProduct = (r: RawCatalogProduct): Product => {
  const sub = SUBCATEGORIES[r.subcategory];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    name_en: r.name_en,
    name_pl: r.name_pl,
    brand: r.brand,
    description: '',
    shortDescription: r.short.nl,
    shortDescription_en: r.short.en,
    shortDescription_pl: r.short.pl,
    descKey: r.descKey,
    price: r.priceEur ?? calcPriceEur(r.pricePln),
    compareAtPrice: r.compareAtEur,
    currency: 'EUR',
    images: r.images,
    category: r.category as ProductCategory,
    subcategory: r.subcategory,
    subcategoryLabel: sub?.nl ?? r.subcategory,
    subcategory_en: sub?.en,
    subcategory_pl: sub?.pl,
    sport: r.sport as SportDiscipline[],
    gender: r.gender,
    material: r.material,
    colors: r.colors,
    sizes: r.sizes,
    stock: r.stock,
    sku: `OCT-${r.supplierId}`,
    supplierId: r.supplierId,
    variantGroup: r.group,
    badges: [
      ...(r.isSale ? [{ type: 'sale' as const, label: 'SALE' }] : []),
      ...(r.isNew ? [{ type: 'new' as const, label: 'NIEUW' }] : []),
    ],
    isNew: r.isNew,
    isSale: r.isSale,
    rating: 0,
    reviewCount: 0,
  };
};

const RAW = (catalog as any).products as RawCatalogProduct[];

/** Wszystkie opublikowane produkty (z co najmniej jednym zdjęciem). */
export const PRODUCTS: Product[] = RAW.filter(r => r.published && r.images.length > 0).map(toProduct);

const BY_GROUP = new Map<string, Product[]>();
PRODUCTS.forEach(p => {
  const g = p.variantGroup || p.id;
  if (!BY_GROUP.has(g)) BY_GROUP.set(g, []);
  BY_GROUP.get(g)!.push(p);
});

/** Inne warianty kolorystyczne tego samego modelu. */
export const getVariants = (product: Product): Product[] =>
  (BY_GROUP.get(product.variantGroup || product.id) || []).filter(p => p.id !== product.id);

// Wyróżnione modele na stronie głównej (dopasowanie po fragmencie slugu, pierwszy pasujący produkt)
const FEATURED_SLUG_PARTS = [
  'bokshandschoenen-legion-octagon-limited-edition',
  'scheenbeschermers-legion-octagon-kevlar',
  'bokshelm-legion-octagon-guardox',
  'mma-handschoenen-legion-octagon-kevlar',
  'kickboks-muay-thai-shorts-legion-octagon-kevlar-premium',
  'rashguard-octagon-premium',
  'mma-shorts-legion-octagon',
  'rugzak-sporttas-legion-octagon-shadow',
  'boksbandages-legion-octagon-supreme',
  'hoodie-octagon-small-logo',
  'polo',
  'thai-pads-legion-octagon-matrix',
];

const pickFirst = (part: string) => PRODUCTS.find(p => p.slug.includes(part));
const FEATURED_IDS = new Set(
  FEATURED_SLUG_PARTS.map(pickFirst).filter((p): p is Product => !!p).map(p => p.id)
);
PRODUCTS.forEach(p => {
  if (FEATURED_IDS.has(p.id)) p.featured = true;
});

// Pomocnicze tłumaczenie produktu na wybrany język
export const getLocalizedProduct = (product: Product, lang: Language): Product => {
  if (lang === 'pl') {
    return {
      ...product,
      name: product.name_pl || product.name,
      shortDescription: product.shortDescription_pl || product.shortDescription,
      subcategoryLabel: product.subcategory_pl || product.subcategoryLabel,
    };
  }
  if (lang === 'en') {
    return {
      ...product,
      name: product.name_en || product.name,
      shortDescription: product.shortDescription_en || product.shortDescription,
      subcategoryLabel: product.subcategory_en || product.subcategoryLabel,
    };
  }
  return product;
};

export const getFeaturedProducts = (lang: Language = 'nl') =>
  PRODUCTS.filter(p => p.featured).map(p => getLocalizedProduct(p, lang));

/** Jeden produkt na model (bez powielania wariantów kolorystycznych). */
const onePerGroup = (list: Product[]) => {
  const seen = new Set<string>();
  return list.filter(p => {
    const g = p.variantGroup || p.id;
    if (seen.has(g)) return false;
    seen.add(g);
    return true;
  });
};

export const getNewProducts = (lang: Language = 'nl') =>
  onePerGroup(PRODUCTS.filter(p => p.isNew)).slice(0, 12).map(p => getLocalizedProduct(p, lang));

/** Brak danych o sprzedaży – zwracamy produkty wyróżnione. */
export const getBestsellers = (lang: Language = 'nl') => getFeaturedProducts(lang);

export const getSaleProducts = (lang: Language = 'nl') =>
  PRODUCTS.filter(p => p.isSale).map(p => getLocalizedProduct(p, lang));

export const getProductBySlug = (slug: string, lang: Language = 'nl') => {
  const p = PRODUCTS.find(prod => prod.slug === slug);
  return p ? getLocalizedProduct(p, lang) : undefined;
};

export const getProductsBySport = (sport: string, lang: Language = 'nl') =>
  PRODUCTS.filter(p => p.sport.includes(sport as SportDiscipline)).map(p => getLocalizedProduct(p, lang));

// Zestawy "Fight kit" – dobierane automatycznie z podkategorii (pierwszy dostępny model)
const kit = (subs: string[]) =>
  subs
    .map(
      s =>
        PRODUCTS.find(p => p.subcategory === s && (p.gender === 'unisex' || p.gender === 'men') && p.stock > 0) ||
        PRODUCTS.find(p => p.subcategory === s && p.gender !== 'kids' && p.stock > 0)
    )
    .filter((p): p is Product => !!p)
    .map(p => p.id);

export const FIGHT_SYSTEM_KITS = {
  mma: {
    title: { nl: 'MMA FIGHT KIT', en: 'MMA FIGHT KIT', pl: 'ZESTAW DO MMA' },
    subtitle: {
      nl: 'Handschoenen, shorts, rashguard en bescherming voor MMA-training',
      en: 'Gloves, shorts, rashguard and protection for MMA training',
      pl: 'Rękawice, spodenki, rashguard i ochraniacze do treningu MMA',
    },
    productIds: kit(['mma-handschoenen', 'mma-shorts', 'rashguards', 'scheenbeschermers', 'gebitsbeschermers', 'bandages']),
  },
  boxing: {
    title: { nl: 'BOKS KIT', en: 'BOXING KIT', pl: 'ZESTAW BOKSERSKI' },
    subtitle: {
      nl: 'Bokshandschoenen, bandages, helm en gebitsbeschermer',
      en: 'Boxing gloves, wraps, head guard and mouthguard',
      pl: 'Rękawice bokserskie, owijki, kask i ochraniacz na zęby',
    },
    productIds: kit(['bokshandschoenen', 'bandages', 'bokshelmen', 'gebitsbeschermers', 'stootkussens']),
  },
  kickboxing: {
    title: { nl: 'KICKBOKS KIT', en: 'KICKBOXING KIT', pl: 'ZESTAW KICKBOXING' },
    subtitle: {
      nl: 'Handschoenen, scheenbeschermers, shorts en bandages',
      en: 'Gloves, shin guards, shorts and hand wraps',
      pl: 'Rękawice, ochraniacze piszczeli, spodenki i owijki',
    },
    productIds: kit(['bokshandschoenen', 'scheenbeschermers', 'kickboxing-shorts', 'bandages', 'gebitsbeschermers']),
  },
  'muay-thai': {
    title: { nl: 'MUAY THAI KIT', en: 'MUAY THAI KIT', pl: 'ZESTAW MUAY THAI' },
    subtitle: {
      nl: 'Muay Thai shorts, handschoenen, scheenbeschermers en pads',
      en: 'Muay Thai shorts, gloves, shin guards and pads',
      pl: 'Spodenki Muay Thai, rękawice, ochraniacze i tarcze',
    },
    productIds: kit(['kickboxing-shorts', 'bokshandschoenen', 'scheenbeschermers', 'stootkussens', 'bandages']),
  },
  grappling: {
    title: { nl: 'NO-GI GRAPPLING KIT', en: 'NO-GI GRAPPLING KIT', pl: 'ZESTAW NO-GI' },
    subtitle: {
      nl: 'Rashguard, compressieshorts en bescherming voor op de mat',
      en: 'Rashguard, compression shorts and protection for the mat',
      pl: 'Rashguard, spodenki kompresyjne i ochraniacze na matę',
    },
    productIds: kit(['rashguards', 'compressieshorts', 'mma-shorts', 'overige-bescherming', 'gebitsbeschermers']),
  },
  karate: {
    title: { nl: 'KARATE KIT', en: 'KARATE KIT', pl: 'ZESTAW KARATE' },
    subtitle: {
      nl: 'Kimono, bescherming en accessoires voor karate',
      en: 'Gi, protection and accessories for karate',
      pl: 'Kimono, ochraniacze i akcesoria do karate',
    },
    productIds: kit(['kimonos', 'scheenbeschermers', 'gebitsbeschermers', 'overige-bescherming', 'tassen']),
  },
};

// ---------------------------------------------------------------------
// Kategorie sklepu
// heren/dames/kids – odzież + sprzęt danej grupy; pozostałe wg kategorii
// ---------------------------------------------------------------------
export const TOP_CATEGORIES = ['heren', 'dames', 'kids', 'fight-gear', 'training', 'accessoires'] as const;
export type TopCategory = (typeof TOP_CATEGORIES)[number];

export const productInCategory = (p: Product, cat: string): boolean => {
  if (cat === 'dames') return p.gender === 'women';
  if (cat === 'kids') return p.gender === 'kids';
  if (cat === 'heren') return p.category === 'heren';
  return p.category === cat;
};

/** Podkategorie występujące w danej kategorii wraz z liczbą modeli. */
export const getSubcategoriesFor = (cat: string) => {
  const counts = new Map<string, number>();
  PRODUCTS.forEach(p => {
    if (cat === 'all' || productInCategory(p, cat)) counts.set(p.subcategory, (counts.get(p.subcategory) || 0) + 1);
  });
  return Object.keys(SUBCATEGORIES)
    .filter(k => counts.has(k))
    .map(k => ({ key: k, count: counts.get(k)!, label: SUBCATEGORIES[k] }));
};

export const subcategoryLabel = (key: string, lang: Language) => {
  const s = SUBCATEGORIES[key];
  return s ? s[lang] : key;
};
