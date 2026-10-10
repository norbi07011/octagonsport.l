import { Language } from '../types';

export interface MediaItem {
  id: string;
  title: string;
  title_en?: string;
  title_pl?: string;
  subtitle: string;
  subtitle_en?: string;
  subtitle_pl?: string;
  category: 'commercial' | 'reel' | 'trailer' | 'docu' | 'lab';
  duration: string;
  views: string;
  likes: number;
  thumbnail: string;
  videoPlaceholderText: string;
  description: string;
  description_en?: string;
  description_pl?: string;
  aspectRatio: '16:9' | '9:16' | '4:3';
  taggedProductIds: string[];
  directorOrAthlete?: string;
  year?: string;
  resolution?: string;
  audioTrack?: string;
}

export const CAMPAIGN_TRAILER_IMG = '/images/media_campaign_trailer.webp';
export const REEL_ACTION_IMG = '/images/reel_striking_action.webp';
export const HERO_ARENA_IMG = '/images/hero_fighter_arena.webp';
export const GLOVES_IMG = '/products/rekawice-bokserskie-legion-oc_20121.webp';
export const RASHGUARD_IMG = '/products/rashguard-octagon-premium-blo_15259.webp';
export const SHIN_GUARDS_IMG = '/products/ochraniacze-legion-octagon-pi_18713.webp';

export const FEATURED_MAIN_FILM: MediaItem = {
  id: 'film-born-in-the-cage',
  title: 'OCTAGON: BORN IN THE CAGE',
  title_en: 'OCTAGON: BORN IN THE CAGE',
  title_pl: 'OCTAGON: BORN IN THE CAGE',
  subtitle: 'Officiële Merkfilm & Fight Film (4K Anamorphic)',
  subtitle_en: 'Official Brand Commercial & Combat Film (4K Anamorphic)',
  subtitle_pl: 'Oficjalny Film Marki & Spot Walki (4K Anamorphic)',
  category: 'commercial',
  duration: '02:45',
  views: '248.5K',
  likes: 18420,
  thumbnail: CAMPAIGN_TRAILER_IMG,
  videoPlaceholderText: 'BORN IN THE CAGE — OFFICIAL COMMERCIAL 2026',
  description: 'Geschoten in de rauwe ondergrondse vechtsportgyms van Rotterdam en Amsterdam. Een ode aan de vechters die om 06:00 uur opstaan, duizenden combinaties stoten en geen excuses tolereren. Geregisseerd door Jan van Houten.',
  description_en: 'Shot in the raw underground combat gyms of Rotterdam and Amsterdam. A tribute to fighters who rise at 06:00 AM, drill thousands of combinations, and tolerate zero excuses. Directed by Jan van Houten.',
  description_pl: 'Nakręcony w surowych salach sportów walki w Rotterdamie i Amsterdamie. Hołd dla zawodników, którzy wstają o 6 rano, wyprowadzają tysiące kombinacji i nie szukają wymówek. Reżyseria: Jan van Houten.',
  aspectRatio: '16:9',
  taggedProductIds: ['oct-fg-01', 'oct-fg-02', 'oct-fg-03', 'oct-app-06'],
  directorOrAthlete: 'Regie: Jan van Houten · DOP: Mark de Leeuw',
  year: '2026',
  resolution: '4K ULTRA HD / 60 FPS',
  audioTrack: 'Original Score: "Echoes of the Arena" (Heavy Bass & War Drums)'
};

export const REELS_DATA: MediaItem[] = [
  {
    id: 'reel-01',
    title: 'Roundhouse Kick Destruction Check',
    title_en: 'Roundhouse Kick Destruction Check',
    title_pl: 'Test Ochraniaczy na Ciężkim Kopnięciu',
    subtitle: 'Impact Shield Pro Scheenbeschermers in actie tegen zware trapkussens',
    subtitle_en: 'Impact Shield Pro Shin Guards in action against heavy Thai pads',
    subtitle_pl: 'Ochraniacze Impact Shield Pro w starciu z ciężkimi tarczami',
    category: 'reel',
    duration: '0:28',
    views: '412K',
    likes: 34100,
    thumbnail: REEL_ACTION_IMG,
    videoPlaceholderText: 'ROUNDHOUSE HIGH SPEED IMPACT DRILL',
    description: 'Geen blauwe plekken, maximale energie-absorptie dankzij multi-layer EVA impact foam. Getest door K-1 zwaargewichten.',
    description_en: 'Zero bruising, maximum kinetic absorption thanks to multi-layer EVA impact foam. Tested by K-1 heavyweights.',
    description_pl: 'Brak siniaków i maksymalne pochłanianie energii dzięki wielowarstwowej piance EVA. Przetestowane przez zawodników K-1 wagi ciężkiej.',
    aspectRatio: '9:16',
    taggedProductIds: ['oct-fg-03', 'oct-sal-10'],
    audioTrack: 'Original Sound - Octagon Arena Drill',
    directorOrAthlete: 'Semih "The Lion" Kaya'
  },
  {
    id: 'reel-02',
    title: 'How to Wrap Hands for Heavy Sparring (4.5m)',
    title_en: 'How to Wrap Hands for Heavy Sparring (4.5m)',
    title_pl: 'Jak Wiązać Owijki Bokserskie do Ciężkich Sparingów (4.5m)',
    subtitle: 'Stap-voor-stap techniek voor knokkelbescherming en polsfixatie',
    subtitle_en: 'Step-by-step tutorial for knuckle protection and wrist locking',
    subtitle_pl: 'Technika krok po kroku: ochrona kostek i stabilizacja nadgarstka',
    category: 'reel',
    duration: '0:45',
    views: '680K',
    likes: 58200,
    thumbnail: GLOVES_IMG,
    videoPlaceholderText: 'MEXICAN STRETCH HAND WRAP MASTERCLASS',
    description: 'Ontdek hoe pro boksers hun handen inzwachtelen om blessures aan de middenhandsbeentjes en polsen te voorkomen.',
    description_en: 'Discover how professional pugilists wrap their hands to avoid metacarpal fractures and wrist sprains.',
    description_pl: 'Zobacz, jak profesjonalni zawodnicy bandażują dłonie, aby zapobiec kontuzjom kości śródręcza i nadgarstka.',
    aspectRatio: '9:16',
    taggedProductIds: ['oct-acc-07', 'oct-fg-01'],
    audioTrack: 'Atmospheric Gym Beats Vol. 4',
    directorOrAthlete: 'Coach Marco (Pro Boxing NL)'
  },
  {
    id: 'reel-03',
    title: 'MMA Hex-Lock 7oz Sparring Test',
    title_en: 'MMA Hex-Lock 7oz Sparring Test',
    title_pl: 'Test Rękawic MMA Hex-Lock 7oz w Klatce',
    subtitle: 'Kooi grappling transities met handschoenen aan',
    subtitle_en: 'Cage grappling transitions with gloves on',
    subtitle_pl: 'Przejścia parterowe i zapasy w klatce w rękawicach',
    category: 'reel',
    duration: '0:32',
    views: '295K',
    likes: 21900,
    thumbnail: HERO_ARENA_IMG,
    videoPlaceholderText: 'GRAPPLING & CLINCH TRANSITION DEMO',
    description: 'Vrijheid in de vingers voor guillotines en takedowns, gecombineerd met 7oz demping voor stoten.',
    description_en: 'Finger dexterity for deep guillotines and takedowns, combined with 7oz padding for striking protection.',
    description_pl: 'Pełna swoboda palców do gilotyn i sprowadzeń, połączona z amortyzacją 7oz do ciosów.',
    aspectRatio: '9:16',
    taggedProductIds: ['oct-fg-05', 'oct-fg-04'],
    audioTrack: 'Trap & Combat Instrumental',
    directorOrAthlete: 'Daan de Jong (Black Belt BJJ)'
  },
  {
    id: 'reel-04',
    title: 'Armor Compression Rashguard Sweat Test',
    title_en: 'Armor Compression Rashguard Sweat Test',
    title_pl: 'Test Rashguarda Armor Compression w Walce na Macie',
    subtitle: '2 uur durende No-Gi grappling sessie: 0% opkruipen',
    subtitle_en: '2-hour relentless No-Gi grappling session: zero ride-up',
    subtitle_pl: '2 godziny intensywnego No-Gi: 0% podwijania materiału',
    category: 'reel',
    duration: '0:22',
    views: '185K',
    likes: 16700,
    thumbnail: RASHGUARD_IMG,
    videoPlaceholderText: 'SILICONE GRIP WAISTBAND LIVE TEST',
    description: 'Siliconen gripband houdt de rashguard strak op zijn plek tijdens de wildste scrambles en bergbeklimmingen op de mat.',
    description_en: 'Silicone anti-slip waistband locks rashguard firmly down during aggressive scrambles and inversions.',
    description_pl: 'Silikonowy pasek antypoślizgowy trzyma rashguard idealnie na miejscu podczas najcięższych kotłów w parterze.',
    aspectRatio: '9:16',
    taggedProductIds: ['oct-fg-02', 'oct-fg-04'],
    audioTrack: 'Heavy 808 Training Vibe',
    directorOrAthlete: 'Team Octagon BJJ'
  },
  {
    id: 'reel-05',
    title: 'Streetwear Drop: Heavyweight Hoodie 460 GSM',
    title_en: 'Streetwear Drop: Heavyweight Hoodie 460 GSM',
    title_pl: 'Streetwear Drop: Gruba Bluza Hoodie 460 GSM',
    subtitle: 'Walkout esthetiek voor koude arena avonden',
    subtitle_en: 'Walkout fight aesthetics for chilly arena evenings',
    subtitle_pl: 'Klimat wyjścia do ringu i miejski styl na chłodne wieczory',
    category: 'reel',
    duration: '0:19',
    views: '340K',
    likes: 29500,
    thumbnail: HERO_ARENA_IMG,
    videoPlaceholderText: 'FIGHT CLUB HOODIE DRIP & DETAILS',
    description: 'Zware 460 grams katoenkwaliteit zonder koorden voor een compromisloze, strakke MMA look.',
    description_en: 'Heavyweight 460 GSM combed cotton without drawstrings for an uncompromising, clean combat aesthetic.',
    description_pl: 'Gruba bawełna czesana 460 GSM bez sznurków dla bezkompromisowego, minimalistycznego stylu fightera.',
    aspectRatio: '9:16',
    taggedProductIds: ['oct-app-06'],
    audioTrack: 'Dark Cinematic Bass',
    directorOrAthlete: 'Robin Bakker'
  }
];

export const COMMERCIALS_LIBRARY: MediaItem[] = [
  {
    id: 'comm-01',
    title: 'FIGHT NIGHT AMSTERDAM 2026 (TV SPOT)',
    title_en: 'FIGHT NIGHT AMSTERDAM 2026 (TV SPOT)',
    title_pl: 'FIGHT NIGHT AMSTERDAM 2026 (SPOT TV)',
    subtitle: 'Officiële commercial uitgezonden tijdens kickboks gala gala-avonden',
    subtitle_en: 'Official commercial aired during major kickboxing championship galas',
    subtitle_pl: 'Oficjalny spot telewizyjny emitowany podczas gal kickboxingu',
    category: 'commercial',
    duration: '0:45',
    views: '142.3K',
    likes: 9800,
    thumbnail: CAMPAIGN_TRAILER_IMG,
    videoPlaceholderText: 'TV SPOT: THE ARENA DOES NOT FORGIVE',
    description: 'De arena kent geen genade. Zestig seconden pure adrenaline met Octagon atleten in de aanloop naar hun titelgevecht.',
    description_en: 'The arena knows no mercy. Pure adrenaline featuring Octagon athletes preparing for their world championship match.',
    description_pl: 'Arena nie wybacza błędów. Czysta adrenalina i przygotowania mistrzów Octagon do walki o pas.',
    aspectRatio: '16:9',
    taggedProductIds: ['oct-fg-01', 'oct-fg-03'],
    year: '2026',
    resolution: '4K BROADCAST MASTER'
  },
  {
    id: 'comm-02',
    title: 'OCTAGON PRO LEATHER: CRAFTED FOR IMPACT',
    title_en: 'OCTAGON PRO LEATHER: CRAFTED FOR IMPACT',
    title_pl: 'OCTAGON PRO LEATHER: STWORZONE DLA SIŁY CIOSU',
    subtitle: 'Close-up product commercial over volnerf runderleer en schuiminjectie',
    subtitle_en: 'Close-up macro commercial demonstrating genuine cowhide and multi-layer foam',
    subtitle_pl: 'Szczegółowy film produktowy o naturalnej skórze bydlęcej i rdzeniu piankowym',
    category: 'trailer',
    duration: '01:15',
    views: '98.7K',
    likes: 7420,
    thumbnail: GLOVES_IMG,
    videoPlaceholderText: 'PRODUCT FILM: 100% GENUINE COWHIDE',
    description: 'Een cinematografische macro-blik op het vakmanschap achter onze 16oz bokshandschoenen. Elk stiksel, elke schuimlaag, elk detail gewogen.',
    description_en: 'A cinematic macro study of the craftsmanship behind our 16oz boxing gloves. Every seam and density layer calibrated.',
    description_pl: 'Filmowe ujęcia kunsztu rzemieślniczego naszych 16-uncjowych rękawic. Każdy szew i warstwa pianki dopracowane do perfekcji.',
    aspectRatio: '16:9',
    taggedProductIds: ['oct-fg-01'],
    year: '2026',
    resolution: '4K CINEMA'
  },
  {
    id: 'comm-03',
    title: 'DURABILITY LAB: 50.000 STRIKES TEST',
    title_en: 'DURABILITY LAB: 50,000 STRIKES TEST',
    title_pl: 'DURABILITY LAB: TEST 50 000 UDERZEŃ',
    subtitle: 'Laboratorium test van ons IMF schuim tegen een pneumatische stootmachine',
    subtitle_en: 'Laboratory stress-test of our IMF core against a pneumatic robotic ram',
    subtitle_pl: 'Test laboratoryjny rdzenia IMF na pneumatycznym robocie uderzeniowym',
    category: 'lab',
    duration: '03:10',
    views: '315.4K',
    likes: 24100,
    thumbnail: SHIN_GUARDS_IMG,
    videoPlaceholderText: 'OCTAGON LAB EPISODE 04: PNEUMATIC IMPACT TESTING',
    description: 'Hoeveel stoten kan een Octagon handschoen doorstaan voordat de demping afneemt? We testen tot 50.000 impacts met 800 Newton stootkracht.',
    description_en: 'How many punches can an Octagon glove endure before foam deterioration? Tested up to 50,000 strikes at 800 Newtons.',
    description_pl: 'Ile ciosów wytrzyma rękawica Octagon bez utraty sprężystości? Badanie do 50 000 uderzeń z siłą 800 Newtonów.',
    aspectRatio: '16:9',
    taggedProductIds: ['oct-fg-01', 'oct-fg-03', 'oct-fg-08'],
    year: '2026',
    resolution: '1080P PRORES'
  },
  {
    id: 'comm-04',
    title: 'THE ROAD TO GLORY: DOCUMENTARY TRAILER',
    title_en: 'THE ROAD TO GLORY: DOCUMENTARY TRAILER',
    title_pl: 'THE ROAD TO GLORY: ZWIASTUN DOKUMENTU',
    subtitle: 'Miniserie over jonge Nederlandse kickbokstalenten op weg naar de wereldtop',
    subtitle_en: 'Docuseries spotlighting young European combat prospects reaching the world championship',
    subtitle_pl: 'Miniserial dokumentalny o młodych talentach sportów walki w drodze na szczyt',
    category: 'docu',
    duration: '04:20',
    views: '189.0K',
    likes: 15300,
    thumbnail: HERO_ARENA_IMG,
    videoPlaceholderText: 'MINI-DOCU: EPISODE 1 — BLOOD, MATS & GLORY',
    description: 'Exclusieve beelden achter de schermen van gymkampen in Utrecht en Rotterdam. Wat kost het om een professionele vechter te zijn?',
    description_en: 'Exclusive behind-the-scenes footage inside demanding fight camps. What does it truly take to live as a professional champion?',
    description_pl: 'Ekskluzywne ujęcia zza kulis najcięższych obozów sparingowych. Prawdziwa cena mistrzostwa w klatce i ringu.',
    aspectRatio: '16:9',
    taggedProductIds: ['oct-fg-02', 'oct-fg-04', 'oct-app-06'],
    year: '2026',
    resolution: '4K DOCUMENTARY'
  }
];

export const FIGHT_PLAYLISTS = [
  {
    title: 'OCTAGON FIGHT NIGHT WARMUP 2026',
    tracksCount: '34 Tracks · 1h 52m',
    genre: 'Hard Techno / Phonk / Heavy Hip-Hop',
    curator: 'Curated by Team Octagon Pro Fighters',
    streams: '84.2K Listeners'
  },
  {
    title: 'BAG WORK & HIGH INTENSITY DRILLS',
    tracksCount: '28 Tracks · 1h 36m',
    genre: 'Aggressive Bass / Grime / Fast BPM',
    curator: 'Curated by Coach Marco van Dijk',
    streams: '62.9K Listeners'
  },
  {
    title: 'NO-GI MAT ROLLING & FLOW',
    tracksCount: '42 Tracks · 2h 15m',
    genre: 'Deep Dark Lo-Fi / Instrumental Trap',
    curator: 'Curated by Octagon BJJ Academy',
    streams: '51.4K Listeners'
  }
];

export const getLocalizedMediaItem = (item: MediaItem, lang: Language = 'nl'): MediaItem => {
  if (lang === 'pl') {
    return {
      ...item,
      title: item.title_pl || item.title,
      subtitle: item.subtitle_pl || item.subtitle,
      description: item.description_pl || item.description
    };
  }
  if (lang === 'en') {
    return {
      ...item,
      title: item.title_en || item.title,
      subtitle: item.subtitle_en || item.subtitle,
      description: item.description_en || item.description
    };
  }
  return item;
};
