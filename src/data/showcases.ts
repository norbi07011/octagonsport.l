import { Shield, Lock, Hand, Users, Layers, Ear, Flame, BadgeCheck, Droplets, Ruler } from 'lucide-react';
import type React from 'react';

/*
 * Serie produktów pokazywane na stronie głównej jako premium showcase
 * (karuzela 3D + przewijana historia). Zdjęcia bez tła: public/showcase,
 * generowane skryptem scripts/showcase/cutout.py ze zdjęć dostawcy.
 * Teksty cech pochodzą z opisów produktów (scripts/catalog/source/nl_desc.json).
 */

export type ShowcaseLang = 'nl' | 'en' | 'pl';
export type T3 = Record<ShowcaseLang, string>;

export interface ShowcaseVariant {
  key: string;
  /** id produktu w katalogu (src/data/catalog.json) */
  id: string;
  /** kolor poświaty / akcentu */
  accent: string;
  /** kolor kółka w wyborze koloru (domyślnie accent) */
  swatch?: string;
  label: T3;
  /** zdjęcie w karuzeli i na końcu historii (front) */
  hero: string;
  /** zdjęcie w trakcie przewijania (bok / detal) */
  detail: string;
}

export interface ShowcaseFeature {
  icon: React.FC<{ className?: string }>;
  title: T3;
  text: T3;
}

export interface ShowcaseConfig {
  id: string;
  eyebrow: string;
  title: T3;
  /** krótka linijka pod nazwą koloru w karuzeli */
  specLine: string;
  storyTitle: string;
  storyTagline: T3;
  bigText: string;
  /** rozmiary pokazane na końcu historii; domyślnie z produktu */
  sizesLine?: string;
  allLink: string;
  allLabel: T3;
  variants: ShowcaseVariant[];
  defaultIndex: number;
  features: ShowcaseFeature[];
  /** po której stronie stoi produkt w historii (desktop) */
  side: 'left' | 'right';
  motion: {
    /** obrót przy wejściu */
    enterRz: number;
    rzFrom: number;
    rzTo: number;
    /** pełny obrót 360° w trakcie cech */
    spin?: boolean;
    /** skala na końcu historii */
    finalScale: number;
  };
  carousel: { itemW: number; spacing: number; mobileItemW: number; mobileSpacing: number };
  story: { width: number; maxW: number; mobileWidth: number; mobileMaxW: number };
}

const W: ShowcaseVariant['label'] = { nl: 'Wit', en: 'White', pl: 'Biały' };
const BL: ShowcaseVariant['label'] = { nl: 'Blauw', en: 'Blue', pl: 'Niebieski' };
const R: ShowcaseVariant['label'] = { nl: 'Rood', en: 'Red', pl: 'Czerwony' };
const Z: ShowcaseVariant['label'] = { nl: 'Zwart', en: 'Black', pl: 'Czarny' };
const G: ShowcaseVariant['label'] = { nl: 'Goud', en: 'Gold', pl: 'Złoty' };

const ACC = { white: '#9fc2ff', blue: '#2f6bff', red: '#ff2533', black: '#8c96a8', gold: '#e8b730' };
const SW = { white: '#f2f2f2', black: '#111111' };

/* ---------------------------------------------------------------- */

const gloves: ShowcaseConfig = {
  id: 'kevlar',
  eyebrow: 'Legion Octagon · Kevlar',
  title: { nl: 'Kies jouw kleur', en: 'Choose your colour', pl: 'Wybierz swój kolor' },
  specLine: 'Kevlar · 8–16 oz',
  storyTitle: 'Kevlar',
  storyTagline: { nl: 'Gemaakt om te vechten', en: 'Built to fight', pl: 'Zbudowane do walki' },
  bigText: 'KEVLAR · OCTAGON · KEVLAR',
  sizesLine: '8 · 10 · 12 · 14 · 16 oz',
  allLink: '/category/fight-gear?sub=bokshandschoenen',
  allLabel: { nl: 'Alle bokshandschoenen', en: 'All boxing gloves', pl: 'Wszystkie rękawice' },
  defaultIndex: 2,
  variants: [
    { key: 'white', id: 'oct-5631', accent: ACC.white, swatch: SW.white, label: W, hero: '/showcase/kevlar-white-pair.webp', detail: '/showcase/kevlar-white-side.webp' },
    { key: 'blue', id: 'oct-5632', accent: ACC.blue, label: BL, hero: '/showcase/kevlar-blue-pair.webp', detail: '/showcase/kevlar-blue-side.webp' },
    { key: 'red', id: 'oct-5633', accent: ACC.red, label: R, hero: '/showcase/kevlar-red-pair.webp', detail: '/showcase/kevlar-red-side.webp' },
    { key: 'black', id: 'oct-5630', accent: ACC.black, swatch: SW.black, label: Z, hero: '/showcase/kevlar-black-pair.webp', detail: '/showcase/kevlar-black-side.webp' },
    { key: 'gold', id: 'oct-5801', accent: ACC.gold, label: G, hero: '/showcase/kevlar-gold-pair.webp', detail: '/showcase/kevlar-gold-side.webp' },
  ],
  features: [
    {
      icon: Shield,
      title: { nl: 'Kevlar-coating', en: 'Kevlar coating', pl: 'Powłoka Kevlar' },
      text: {
        nl: 'Een sterke buitenlaag met KEVLAR-coating – gemaakt voor sparring én wedstrijden.',
        en: 'A tough outer layer with KEVLAR coating – built for sparring and competition.',
        pl: 'Wytrzymała warstwa zewnętrzna z powłoką KEVLAR – do sparingów i zawodów.',
      },
    },
    {
      icon: Lock,
      title: { nl: 'Brede klittenband', en: 'Wide hook & loop strap', pl: 'Szeroki rzep' },
      text: {
        nl: 'Brede klittenbandsluiting die je eenvoudig aanpast aan je hand en pols.',
        en: 'Wide hook-and-loop closure that adjusts easily to your hand and wrist.',
        pl: 'Szerokie zapięcie na rzep, które łatwo dopasujesz do dłoni i nadgarstka.',
      },
    },
    {
      icon: Hand,
      title: { nl: 'Gevormde duim', en: 'Shaped thumb', pl: 'Wyprofilowany kciuk' },
      text: {
        nl: 'De duim is verbonden met de bovenkant van de handschoen en wordt zo beschermd.',
        en: 'The thumb is attached to the top of the glove, keeping it protected.',
        pl: 'Kciuk połączony z górą rękawicy – lepiej chroniony przy każdym ciosie.',
      },
    },
    {
      icon: Users,
      title: { nl: 'Perfecte pasvorm', en: 'Perfect fit', pl: 'Idealne dopasowanie' },
      text: {
        nl: 'Sluit perfect aan op de hand voor comfort en veiligheid – voor beginners en gevorderden.',
        en: 'Fits the hand perfectly for comfort and safety – for beginners and advanced fighters.',
        pl: 'Idealnie przylega do dłoni – komfort i bezpieczeństwo dla początkujących i zaawansowanych.',
      },
    },
  ],
  side: 'right',
  motion: { enterRz: -48, rzFrom: -14, rzTo: 16, finalScale: 0.7 },
  carousel: { itemW: 300, spacing: 260, mobileItemW: 0.5, mobileSpacing: 0.3 },
  story: { width: 38, maxW: 560, mobileWidth: 78, mobileMaxW: 360 },
};

/* ---------------------------------------------------------------- */

const helmets: ShowcaseConfig = {
  id: 'guardox',
  eyebrow: 'Legion Octagon · Guardox 2-in-1',
  title: { nl: 'Bescherming zonder compromis', en: 'Protection without compromise', pl: 'Ochrona bez kompromisów' },
  specLine: '2-in-1 · Sparring',
  storyTitle: 'Guardox',
  storyTagline: { nl: '2-in-1 sparringhelm', en: '2-in-1 sparring helmet', pl: 'Kask sparingowy 2w1' },
  bigText: 'GUARDOX · 2-IN-1 · GUARDOX',
  allLink: '/category/fight-gear?sub=bokshelmen',
  allLabel: { nl: 'Alle bokshelmen', en: 'All head guards', pl: 'Wszystkie kaski' },
  defaultIndex: 2,
  variants: [
    { key: 'black', id: 'oct-6070', accent: ACC.black, swatch: SW.black, label: Z, hero: '/showcase/guardox-black-hero.webp', detail: '/showcase/guardox-black-detail.webp' },
    { key: 'blue', id: 'oct-6075', accent: ACC.blue, label: BL, hero: '/showcase/guardox-blue-hero.webp', detail: '/showcase/guardox-blue-detail.webp' },
    { key: 'red', id: 'oct-6074', accent: ACC.red, label: R, hero: '/showcase/guardox-red-hero.webp', detail: '/showcase/guardox-red-detail.webp' },
    { key: 'white', id: 'oct-6073', accent: ACC.white, swatch: SW.white, label: W, hero: '/showcase/guardox-white-hero.webp', detail: '/showcase/guardox-white-detail.webp' },
  ],
  features: [
    {
      icon: Shield,
      title: { nl: 'Volledig gezichtsmasker', en: 'Full face mask', pl: 'Pełna osłona twarzy' },
      text: {
        nl: 'Het frontmasker beschermt het midden van het gezicht zonder je zicht wezenlijk te beperken.',
        en: 'The front mask protects the centre of the face without really limiting your view.',
        pl: 'Maska chroni środek twarzy, praktycznie nie ograniczając pola widzenia.',
      },
    },
    {
      icon: Layers,
      title: { nl: 'Meerlaags schuim', en: 'Multi-layer foam', pl: 'Wielowarstwowa pianka' },
      text: {
        nl: 'Sterk absorberend, meerlaags schuim dat klappen effectief opvangt.',
        en: 'Highly absorbent multi-layer foam that effectively takes the impact.',
        pl: 'Mocno amortyzująca, wielowarstwowa pianka skutecznie pochłania uderzenia.',
      },
    },
    {
      icon: Ear,
      title: { nl: 'Oren & achterhoofd', en: 'Ears & back of head', pl: 'Uszy i potylica' },
      text: {
        nl: 'Gesloten ontwerp: voorhoofd, wangen, neus, kin, oren en achterhoofd zijn beschermd.',
        en: 'Closed design: forehead, cheeks, nose, chin, ears and back of the head are protected.',
        pl: 'Zamknięta konstrukcja chroni czoło, policzki, nos, brodę, uszy i potylicę.',
      },
    },
    {
      icon: Lock,
      title: { nl: 'Stabiele pasvorm', en: 'Stable fit', pl: 'Stabilne dopasowanie' },
      text: {
        nl: 'Ergonomische vorm met verstelbaar klittenband – zit stabiel, ook tijdens snelle uitwisselingen.',
        en: 'Ergonomic shape with adjustable strap – stays put, even in fast exchanges.',
        pl: 'Ergonomiczny kształt i regulowany rzep – kask trzyma się nawet w szybkich wymianach.',
      },
    },
  ],
  side: 'left',
  motion: { enterRz: 30, rzFrom: 10, rzTo: -10, finalScale: 0.62 },
  carousel: { itemW: 270, spacing: 270, mobileItemW: 0.46, mobileSpacing: 0.3 },
  story: { width: 34, maxW: 500, mobileWidth: 70, mobileMaxW: 330 },
};

/* ---------------------------------------------------------------- */

const shinGuards: ShowcaseConfig = {
  id: 'shin-kevlar',
  eyebrow: 'Legion Octagon · Kevlar',
  title: { nl: 'Kick zonder twijfel', en: 'Kick without doubt', pl: 'Kopnij bez obaw' },
  specLine: 'Scheen & voet · K-1 · Muay Thai',
  storyTitle: 'Kevlar',
  storyTagline: { nl: 'Scheen- & voetbeschermers', en: 'Shin & instep guards', pl: 'Ochraniacze goleń i stóp' },
  bigText: 'KICK · KEVLAR · KICK',
  allLink: '/category/fight-gear?sub=scheenbeschermers',
  allLabel: { nl: 'Alle scheenbeschermers', en: 'All shin guards', pl: 'Wszystkie ochraniacze' },
  defaultIndex: 2,
  variants: [
    { key: 'white', id: 'oct-5675', accent: ACC.white, swatch: SW.white, label: W, hero: '/showcase/shin-kevlar-white-hero.webp', detail: '/showcase/shin-kevlar-white-detail.webp' },
    { key: 'blue', id: 'oct-5677', accent: ACC.blue, label: BL, hero: '/showcase/shin-kevlar-blue-hero.webp', detail: '/showcase/shin-kevlar-blue-detail.webp' },
    { key: 'red', id: 'oct-5676', accent: ACC.red, label: R, hero: '/showcase/shin-kevlar-red-hero.webp', detail: '/showcase/shin-kevlar-red-detail.webp' },
    { key: 'black', id: 'oct-5678', accent: ACC.black, swatch: SW.black, label: Z, hero: '/showcase/shin-kevlar-black-hero.webp', detail: '/showcase/shin-kevlar-black-detail.webp' },
    { key: 'gold', id: 'oct-5804', accent: ACC.gold, label: G, hero: '/showcase/shin-kevlar-gold-hero.webp', detail: '/showcase/shin-kevlar-gold-detail.webp' },
  ],
  features: [
    {
      icon: Shield,
      title: { nl: 'Kevlar-coating', en: 'Kevlar coating', pl: 'Powłoka Kevlar' },
      text: {
        nl: 'Zeer hoogwaardig kunstleer met KEVLAR-coating – comfortabel en gemaakt voor training.',
        en: 'Premium synthetic leather with KEVLAR coating – comfortable and made for training.',
        pl: 'Wysokiej jakości skóra syntetyczna z powłoką KEVLAR – wygodna i stworzona do treningu.',
      },
    },
    {
      icon: Layers,
      title: { nl: 'Verdicht schuim', en: 'Dense foam', pl: 'Zagęszczona pianka' },
      text: {
        nl: 'Versterkt, verdicht schuim dat effectief beschermt tegen blessures.',
        en: 'Reinforced, dense foam that protects effectively against injuries.',
        pl: 'Wzmocniona, zagęszczona pianka skutecznie chroni przed kontuzjami.',
      },
    },
    {
      icon: Flame,
      title: { nl: 'K-1 & Muay Thai', en: 'K-1 & Muay Thai', pl: 'K-1 i Muay Thai' },
      text: {
        nl: 'Populair bij K-1- en Muay Thai-beoefenaars – scheen én voet beschermd.',
        en: 'Popular with K-1 and Muay Thai athletes – shin and instep protected.',
        pl: 'Popularne wśród zawodników K-1 i Muay Thai – chronią goleń i stopę.',
      },
    },
    {
      icon: BadgeCheck,
      title: { nl: '12 maanden garantie', en: '12-month warranty', pl: '12 miesięcy gwarancji' },
      text: {
        nl: '12 maanden fabrieksgarantie op deze sportuitrusting.',
        en: '12-month manufacturer warranty on this sports equipment.',
        pl: '12 miesięcy gwarancji producenta na ten sprzęt.',
      },
    },
  ],
  side: 'right',
  motion: { enterRz: -30, rzFrom: -8, rzTo: 8, finalScale: 0.66 },
  carousel: { itemW: 210, spacing: 220, mobileItemW: 0.36, mobileSpacing: 0.27 },
  story: { width: 24, maxW: 360, mobileWidth: 52, mobileMaxW: 250 },
};

/* ---------------------------------------------------------------- */

const wraps: ShowcaseConfig = {
  id: 'supreme',
  eyebrow: 'Legion Octagon · Supreme',
  title: { nl: 'Wrap in kleur', en: 'Wrap in colour', pl: 'Owiń w kolorze' },
  specLine: 'Velcro Quick · 95% katoen',
  storyTitle: 'Supreme',
  storyTagline: { nl: 'Eerste bescherming van je hand', en: 'Your hand’s first protection', pl: 'Pierwsza ochrona dłoni' },
  bigText: 'SUPREME · WRAPS · SUPREME',
  sizesLine: '3 m · 4 m · 5 m',
  allLink: '/category/fight-gear?sub=bandages',
  allLabel: { nl: 'Alle bandages', en: 'All hand wraps', pl: 'Wszystkie owijki' },
  defaultIndex: 5,
  variants: [
    { key: 'black', id: 'oct-5892', accent: '#8c96a8', swatch: SW.black, label: Z, hero: '/showcase/supreme-black-hero.webp', detail: '/showcase/supreme-black-detail.webp' },
    { key: 'bordeaux', id: 'oct-5856', accent: '#c0142f', label: { nl: 'Bordeaux', en: 'Burgundy', pl: 'Bordowy' }, hero: '/showcase/supreme-bordeaux-hero.webp', detail: '/showcase/supreme-bordeaux-detail.webp' },
    { key: 'red', id: 'oct-5850', accent: '#ff2533', label: R, hero: '/showcase/supreme-red-hero.webp', detail: '/showcase/supreme-red-detail.webp' },
    { key: 'yellow', id: 'oct-5844', accent: '#ffd400', label: { nl: 'Geel', en: 'Yellow', pl: 'Żółty' }, hero: '/showcase/supreme-yellow-hero.webp', detail: '/showcase/supreme-yellow-detail.webp' },
    { key: 'green', id: 'oct-5880', accent: '#1fae5b', label: { nl: 'Donkergroen', en: 'Dark green', pl: 'Ciemnozielony' }, hero: '/showcase/supreme-green-hero.webp', detail: '/showcase/supreme-green-detail.webp' },
    { key: 'lime', id: 'oct-5874', accent: '#5cff3d', label: { nl: 'Lichtgroen', en: 'Light green', pl: 'Jasnozielony' }, hero: '/showcase/supreme-lime-hero.webp', detail: '/showcase/supreme-lime-detail.webp' },
    { key: 'lightblue', id: 'oct-5862', accent: '#6cc4ff', label: { nl: 'Lichtblauw', en: 'Light blue', pl: 'Błękitny' }, hero: '/showcase/supreme-lightblue-hero.webp', detail: '/showcase/supreme-lightblue-detail.webp' },
    { key: 'blue', id: 'oct-5868', accent: '#4b4bff', label: { nl: 'Donkerblauw', en: 'Navy', pl: 'Granatowy' }, hero: '/showcase/supreme-blue-hero.webp', detail: '/showcase/supreme-blue-detail.webp' },
  ],
  features: [
    {
      icon: Lock,
      title: { nl: 'Velcro Quick', en: 'Velcro Quick', pl: 'Velcro Quick' },
      text: {
        nl: 'Velcro Quick-sluiting voor een perfecte pasvorm en eenvoudige verstelling.',
        en: 'Velcro Quick closure for a perfect fit and easy adjustment.',
        pl: 'Zapięcie Velcro Quick – idealne dopasowanie i łatwa regulacja.',
      },
    },
    {
      icon: Hand,
      title: { nl: 'Stevige pols', en: 'Solid wrist', pl: 'Stabilny nadgarstek' },
      text: {
        nl: 'Eerste bescherming van de hand: verstevigt en stabiliseert de pols.',
        en: 'The first protection for your hand: reinforces and stabilises the wrist.',
        pl: 'Pierwsza ochrona dłoni: wzmacnia i stabilizuje nadgarstek.',
      },
    },
    {
      icon: Droplets,
      title: { nl: 'Zweetabsorberend', en: 'Sweat-absorbing', pl: 'Chłonie pot' },
      text: {
        nl: 'Zachte stof die zweet opneemt, schuren voorkomt en je handschoenen langer mee laat gaan.',
        en: 'Soft fabric that absorbs sweat, prevents chafing and keeps your gloves fresh for longer.',
        pl: 'Miękki materiał chłonie pot, zapobiega otarciom i chroni rękawice przed potem.',
      },
    },
    {
      icon: Ruler,
      title: { nl: 'Blijft in vorm', en: 'Keeps its shape', pl: 'Trzyma kształt' },
      text: {
        nl: '95% katoen, 5% elastaan, 5 cm breed – en na het wassen nog steeds in vorm.',
        en: '95% cotton, 5% elastane, 5 cm wide – and still in shape after washing.',
        pl: '95% bawełny, 5% elastanu, 5 cm szerokości – po praniu nadal trzymają kształt.',
      },
    },
  ],
  side: 'left',
  motion: { enterRz: -90, rzFrom: 0, rzTo: 360, spin: true, finalScale: 0.68 },
  carousel: { itemW: 260, spacing: 210, mobileItemW: 0.46, mobileSpacing: 0.27 },
  story: { width: 34, maxW: 500, mobileWidth: 74, mobileMaxW: 340 },
};

export const SHOWCASES = { gloves, helmets, shinGuards, wraps };
