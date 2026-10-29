// =====================================================================
// Partnerzy i influencerzy – podstrona /partners
// Nowego partnera lub influencera dodajesz, dopisując obiekt do listy.
// Logo wrzuć do public/images/partners/ (najlepiej kwadrat, WebP/PNG).
// =====================================================================
import { Language } from '../types';

type T = Record<Language, string>;

export interface PartnerLink {
  type: 'instagram' | 'facebook' | 'website' | 'tiktok' | 'youtube' | 'whatsapp';
  url: string;
  /** Tekst wyświetlany przy linku, np. @nazwa albo domena */
  label: string;
}

export interface Partner {
  id: string;
  name: string;
  /** np. "Hoofdpartner", "Sportschool", "Atleet" */
  role: T;
  description: T;
  logo: string;
  /** 'round' – okrągłe logo (np. herb klubu), 'wide' – poziome logo marki */
  logoShape?: 'round' | 'wide' | 'square' | 'photo';
  /** Kolor poświaty za logo (rgba), np. w barwach marki */
  glow?: string;
  /** Dyscypliny / zajęcia – krótkie etykiety */
  tags?: T[];
  links: PartnerLink[];
  featured?: boolean;
}

export const PARTNERS: Partner[] = [
  {
    id: 'marris-gym',
    name: 'Sportcentrum Marris Gym',
    featured: true,
    role: { nl: 'Hoofdpartner', en: 'Main partner', pl: 'Główny partner' },
    description: {
      nl: 'Sportcentrum Marris Gym is een vechtsportschool met de focus op kickboksen en thaiboksen, voor kinderen, jongeren en volwassenen. Naast de vaste lessen is er een eigen Poolse kickboksgroep, een Women Only-les, Taekwon-Do en personal training. Een proefles boek je via hun website.',
      en: 'Sportcentrum Marris Gym is a combat sports gym focused on kickboxing and Thai boxing, for children, teens and adults. Next to the regular classes there is a dedicated Polish kickboxing group, a Women Only class, Taekwon-Do and personal training. Book a trial class through their website.',
      pl: 'Sportcentrum Marris Gym to klub sportów walki skupiony na kickboxingu i boksie tajskim – dla dzieci, młodzieży i dorosłych. Oprócz stałych zajęć działa tu Polska Grupa Kickboxingu, zajęcia Women Only, Taekwon-Do i treningi personalne. Lekcję próbną umówisz przez ich stronę.',
    },
    logo: '/images/partners/marris-gym-logo.webp',
    tags: [
      { nl: 'Kickboksen & thaiboksen', en: 'Kickboxing & Thai boxing', pl: 'Kickboxing i boks tajski' },
      { nl: 'Polska Grupa Kickboxing', en: 'Polska Grupa Kickboxing', pl: 'Polska Grupa Kickboxing' },
      { nl: 'Jeugd vanaf 6 jaar', en: 'Kids from 6', pl: 'Dzieci od 6 lat' },
      { nl: 'Women Only', en: 'Women Only', pl: 'Women Only' },
      { nl: 'Taekwon-Do', en: 'Taekwon-Do', pl: 'Taekwon-Do' },
      { nl: 'Personal training', en: 'Personal training', pl: 'Treningi personalne' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/marris.gym.polska.grupa/', label: '@marris.gym.polska.grupa' },
      { type: 'facebook', url: 'https://www.facebook.com/share/14xRCVExCWY/', label: 'Marris Gym' },
      { type: 'website', url: 'https://marrisgym.nl/rooster.html', label: 'marrisgym.nl' },
    ],
  },
  {
    id: 'king-protein',
    name: 'King Protein',
    logoShape: 'wide',
    role: { nl: 'Partner · Sportvoeding', en: 'Partner · Sports nutrition', pl: 'Partner · Suplementy' },
    description: {
      nl: 'King Protein is een Nederlandse webshop in sportvoeding en supplementen: eiwitten, creatine, pre-workouts en gezonde snacks van merken als Optimum Nutrition, OstroVit, Olimp, DZIK en Applied Nutrition. Gratis verzending in Nederland vanaf €80.',
      en: 'King Protein is a Dutch online store for sports nutrition and supplements: protein, creatine, pre-workouts and healthy snacks from brands such as Optimum Nutrition, OstroVit, Olimp, DZIK and Applied Nutrition. Free shipping in the Netherlands from €80.',
      pl: 'King Protein to holenderski sklep internetowy z odżywkami i suplementami dla sportowców: białka, kreatyna, przedtreningówki i zdrowe przekąski marek takich jak Optimum Nutrition, OstroVit, Olimp, DZIK czy Applied Nutrition. Darmowa dostawa w Holandii od 80 €.',
    },
    logo: '/images/partners/king-protein-logo.webp',
    tags: [
      { nl: 'Eiwitten', en: 'Protein', pl: 'Białko' },
      { nl: 'Creatine', en: 'Creatine', pl: 'Kreatyna' },
      { nl: 'Pre-workout', en: 'Pre-workout', pl: 'Przedtreningówki' },
      { nl: 'Snacks & repen', en: 'Snacks & bars', pl: 'Przekąski i batony' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/king_protein.nl/', label: '@king_protein.nl' },
      { type: 'facebook', url: 'https://www.facebook.com/share/18FZn1n1u2/', label: 'King Protein' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@king_protein', label: '@king_protein' },
      { type: 'website', url: 'https://king-protein.nl/nl', label: 'king-protein.nl' },
    ],
  },  {
    id: 'nassau-grappling',
    name: 'Nassau Grappling',
    logoShape: 'photo',
    glow: 'rgba(235,235,235,.16)',
    role: { nl: 'Partner · Grappling gym', en: 'Partner · Grappling gym', pl: 'Partner · Sala treningowa grapplingu' },
    description: {
      nl: 'Nassau Grappling – „Republic of Pirates” – is een trainingszaal voor grappling. Volg de club op Instagram voor trainingen, roosters en nieuws van de mat.',
      en: 'Nassau Grappling – “Republic of Pirates” – is a grappling training gym. Follow the club on Instagram for training, schedules and news from the mat.',
      pl: 'Nassau Grappling – „Republic of Pirates” – to sala treningowa grapplingu. Obserwuj klub na Instagramie: treningi, grafik zajęć i wieści z maty.',
    },
    logo: '/images/partners/nassau-grappling-logo.webp',
    tags: [
      { nl: 'Grappling', en: 'Grappling', pl: 'Grappling' },
      { nl: 'Trainingszaal', en: 'Training gym', pl: 'Sala treningowa' },
    ],
    links: [{ type: 'instagram', url: 'https://www.instagram.com/nassau.grappling/', label: '@nassau.grappling' }],
  },  {
    id: 'fly-high-tattoo',
    name: 'Fly High Tattoo',
    logoShape: 'square',
    glow: 'rgba(210,210,210,.16)',
    role: { nl: 'Partner · Tattoostudio', en: 'Partner · Tattoo studio', pl: 'Partner · Studio tatuażu' },
    description: {
      nl: 'Fly High Ink Tattoo Studio is een tattoostudio, opgericht in 2020. Bekijk hun werk op Instagram en Facebook.',
      en: 'Fly High Ink Tattoo Studio is a tattoo studio, established in 2020. See their work on Instagram and Facebook.',
      pl: 'Fly High Ink Tattoo Studio to studio tatuażu działające od 2020 roku. Zobacz ich prace na Instagramie i Facebooku.',
    },
    logo: '/images/partners/fly-high-tattoo-logo.webp',
    tags: [
      { nl: 'Tattoostudio', en: 'Tattoo studio', pl: 'Studio tatuażu' },
      { nl: 'Sinds 2020', en: 'Since 2020', pl: 'Od 2020' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/flyhighinktattoostudio/', label: '@flyhighinktattoostudio' },
      { type: 'facebook', url: 'https://www.facebook.com/share/18e7x5QvcR/', label: 'Fly High Tattoo' },
    ],
  },
  {
    id: 'norbs-service',
    name: 'Norbs Service',
    logoShape: 'square',
    glow: 'rgba(160,80,255,.30)',
    role: { nl: 'Partner · Websites & marketing', en: 'Partner · Websites & marketing', pl: 'Partner · Strony internetowe i marketing' },
    description: {
      nl: 'Norbs Service – Creative Digital Solutions. Websites en webshops op maat, Instagram-reels en trainingsvideo’s voor sportscholen en sporters, en online marketing. Ook de webshop van OctagonSportNL is door Norbs Service gebouwd.',
      en: 'Norbs Service – Creative Digital Solutions. Custom websites and webshops, Instagram reels and training videos for gyms and athletes, and online marketing. The OctagonSportNL webshop was also built by Norbs Service.',
      pl: 'Norbs Service – Creative Digital Solutions. Strony internetowe i sklepy na zamówienie, rolki na Instagram i filmy treningowe dla klubów i zawodników oraz marketing internetowy. Sklep OctagonSportNL też zbudował Norbs Service.',
    },
    logo: '/images/partners/norbs-service-logo.webp',
    tags: [
      { nl: 'Websites & webshops', en: 'Websites & webshops', pl: 'Strony i sklepy' },
      { nl: 'Instagram-reels', en: 'Instagram reels', pl: 'Rolki na Instagram' },
      { nl: 'Trainingsvideo’s', en: 'Training videos', pl: 'Filmy treningowe' },
      { nl: 'Marketing', en: 'Marketing', pl: 'Marketing' },
    ],
    links: [
      { type: 'whatsapp', url: 'https://wa.me/31642474314', label: '+31 6 42474314' },
    ],
  },
  {
    id: 'evi-fashion',
    name: 'Evi Fashion NL',
    logoShape: 'square',
    glow: 'rgba(212,170,80,.30)',
    role: { nl: 'Partner · Mode', en: 'Partner · Fashion', pl: 'Partner · Moda' },
    description: {
      nl: 'Evi Fashion NL – mode voor vrouwen in Nederland. Volg Evi Fashion op Facebook en TikTok voor de nieuwste collecties en looks.',
      en: 'Evi Fashion NL – women’s fashion in the Netherlands. Follow Evi Fashion on Facebook and TikTok for the latest collections and looks.',
      pl: 'Evi Fashion NL – moda damska w Holandii. Obserwuj Evi Fashion na Facebooku i TikToku, żeby zobaczyć najnowsze kolekcje i stylizacje.',
    },
    logo: '/images/partners/evi-fashion-logo.webp',
    tags: [
      { nl: 'Damesmode', en: 'Women’s fashion', pl: 'Moda damska' },
      { nl: 'Nieuwe collecties', en: 'New collections', pl: 'Nowe kolekcje' },
    ],
    links: [
      { type: 'facebook', url: 'https://www.facebook.com/share/19hfUL3tsS/', label: 'Evi Fashion NL' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@evifashionnl', label: '@evifashionnl' },
    ],
  },
];

/** Influencerzy / ambasadorzy – na razie pusto, sekcja pokaże "wkrótce". */
export const INFLUENCERS: Partner[] = [
  {
    id: 'dj-zibi',
    name: 'DJ Zibi',
    logoShape: 'square',
    glow: 'rgba(150,70,255,.28)',
    role: { nl: 'DJ & creator', en: 'DJ & creator', pl: 'DJ i twórca' },
    description: {
      nl: 'DJ Zibi is DJ en content creator en werkt samen met OctagonSportNL. Volg hem op Instagram, TikTok en Facebook voor zijn sets en nieuwe video’s.',
      en: 'DJ Zibi is a DJ and content creator working with OctagonSportNL. Follow him on Instagram, TikTok and Facebook for his sets and new videos.',
      pl: 'DJ Zibi to DJ i twórca internetowy, który współpracuje z OctagonSportNL. Obserwuj go na Instagramie, TikToku i Facebooku, żeby nie przegapić jego setów i nowych filmów.',
    },
    logo: '/images/partners/dj-zibi-logo.webp',
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/dj.zibi5/', label: '@dj.zibi5' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@dj.zibi8', label: '@dj.zibi8' },
      { type: 'facebook', url: 'https://www.facebook.com/share/1JXsgwTQmf/', label: 'DJ Zibi' },
    ],
  },
  {
    id: 'dominik-kunz',
    name: 'Dominik Kunz',
    logoShape: 'photo',
    glow: 'rgba(40,170,200,.22)',
    role: { nl: 'Personal trainer · Akademia Kunza', en: 'Personal trainer · Akademia Kunza', pl: 'Trener personalny · Akademia Kunza' },
    description: {
      nl: 'Dominik Kunz is personal trainer en geeft training in boksen, kickboksen, crossfit en functionele training in Tilburg en omgeving, ook voor bedrijven. Zijn trainingen en website zijn in het Pools.',
      en: 'Dominik Kunz is a personal trainer coaching boxing, kickboxing, CrossFit and functional training in and around Tilburg, including sessions for companies. His training and website are in Polish.',
      pl: 'Dominik Kunz to trener personalny – prowadzi treningi boksu, kickboxingu, crossfitu i treningu funkcjonalnego w Tilburgu i okolicach, także dla firm. Treningi prowadzi po polsku.',
    },
    logo: '/images/partners/dominik-kunz.webp',
    tags: [
      { nl: 'Personal training 1-op-1', en: '1:1 personal training', pl: 'Trening personalny 1:1' },
      { nl: 'Boksen', en: 'Boxing', pl: 'Boks' },
      { nl: 'Kickboksen', en: 'Kickboxing', pl: 'Kickboxing' },
      { nl: 'Crossfit & functioneel', en: 'CrossFit & functional', pl: 'Crossfit i trening funkcjonalny' },
      { nl: 'Tilburg', en: 'Tilburg', pl: 'Tilburg' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/kick_dominik/', label: '@kick_dominik' },
      { type: 'website', url: 'https://akademiakunza.com/', label: 'akademiakunza.com' },
    ],
  },
  {
    id: 'patryk-mma',
    name: 'Patryk MMA',
    logoShape: 'square',
    glow: 'rgba(200,70,40,.25)',
    role: { nl: 'Personal trainer · Kickboksclub', en: 'Personal trainer · Kickboxing club', pl: 'Trener personalny · Klub kickboxingu' },
    description: {
      nl: 'Patryk is personal trainer en leidt zijn eigen kickboksclub. Volg hem op Instagram, Facebook en TikTok voor trainingen, technieken en clubnieuws.',
      en: 'Patryk is a personal trainer who runs his own kickboxing club. Follow him on Instagram, Facebook and TikTok for training, technique and club news.',
      pl: 'Patryk to trener personalny prowadzący własny klub kickboxingu. Obserwuj go na Instagramie, Facebooku i TikToku – treningi, technika i wieści z klubu.',
    },
    logo: '/images/partners/patryk-mma-logo.webp',
    tags: [
      { nl: 'Personal training', en: 'Personal training', pl: 'Trening personalny' },
      { nl: 'Kickboksen', en: 'Kickboxing', pl: 'Kickboxing' },
      { nl: 'MMA', en: 'MMA', pl: 'MMA' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/patrykmma/', label: '@patrykmma' },
      { type: 'facebook', url: 'https://www.facebook.com/share/14thjFpJ8aP/', label: 'Patryk MMA' },
      { type: 'tiktok', url: 'https://www.tiktok.com/@patryk.mma', label: '@patryk.mma' },
    ],
  },
  {
    id: 'kuba-balagan',
    name: 'Kuba Bałagan',
    logoShape: 'square',
    glow: 'rgba(215,25,32,.28)',
    role: { nl: 'Personal trainer · Bałagan Team Lelystad', en: 'Personal trainer · Bałagan Team Lelystad', pl: 'Trener personalny · Bałagan Team Lelystad' },
    description: {
      nl: 'Kuba Bałagan is personal trainer en leidt zijn eigen vechtsportschool Bałagan Team in Lelystad, met training in boksen en kickboksen. Volg hem op Instagram en Facebook.',
      en: 'Kuba Bałagan is a personal trainer who runs his own martial arts school, Bałagan Team in Lelystad, coaching boxing and kickboxing. Follow him on Instagram and Facebook.',
      pl: 'Kuba Bałagan to trener personalny prowadzący własną szkołę sztuk walki Bałagan Team w Lelystad – boks i kickboxing. Obserwuj go na Instagramie i Facebooku.',
    },
    logo: '/images/partners/kuba-balagan.webp',
    tags: [
      { nl: 'Personal training', en: 'Personal training', pl: 'Trening personalny' },
      { nl: 'Boksen', en: 'Boxing', pl: 'Boks' },
      { nl: 'Kickboksen', en: 'Kickboxing', pl: 'Kickboxing' },
      { nl: 'Lelystad', en: 'Lelystad', pl: 'Lelystad' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/balagankuba/', label: '@balagankuba' },
      { type: 'facebook', url: 'https://www.facebook.com/share/1KC79T2CLf/', label: 'Kuba Bałagan' },
    ],
  },  {
    id: 'magda-power-hour',
    name: 'Magda Power Hour',
    logoShape: 'photo',
    glow: 'rgba(40,90,190,.30)',
    role: { nl: 'Personal trainer & coach · MPH', en: 'Personal trainer & coach · MPH', pl: 'Trenerka personalna i coach · MPH' },
    description: {
      nl: 'Magda is personal trainer en coach – MPH Personal Training & Coaching. Volg haar op Instagram en Facebook voor trainingen, tips en motivatie.',
      en: 'Magda is a personal trainer and coach – MPH Personal Training & Coaching. Follow her on Instagram and Facebook for workouts, tips and motivation.',
      pl: 'Magda to trenerka personalna i coach – MPH Personal Training & Coaching. Obserwuj ją na Instagramie i Facebooku: treningi, porady i motywacja.',
    },
    logo: '/images/partners/magda-power-hour-logo.webp',
    tags: [
      { nl: 'Personal training', en: 'Personal training', pl: 'Trening personalny' },
      { nl: 'Coaching', en: 'Coaching', pl: 'Coaching' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/magdapowerhour/', label: '@magdapowerhour' },
      { type: 'facebook', url: 'https://www.facebook.com/share/19QvdGEnUr/', label: 'Magda Power Hour' },
    ],
  },  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    logoShape: 'photo',
    glow: 'rgba(200,210,230,.18)',
    role: { nl: 'Manuele therapie · Sportmassage', en: 'Manual therapy · Sports massage', pl: 'Terapia manualna · Masaż sportowy' },
    description: {
      nl: 'Diamond Hands Manual Therapy biedt massage en manuele therapie voor sporters – voor herstel na zware trainingen en wedstrijden. Volg op Instagram en Facebook.',
      en: 'Diamond Hands Manual Therapy offers massage and manual therapy for athletes – for recovery after hard training and fights. Follow on Instagram and Facebook.',
      pl: 'Diamond Hands Manual Therapy to masaże i terapia manualna dla sportowców – regeneracja po ciężkich treningach i walkach. Obserwuj na Instagramie i Facebooku.',
    },
    logo: '/images/partners/diamond-hands-logo.webp',
    tags: [
      { nl: 'Sportmassage', en: 'Sports massage', pl: 'Masaż sportowy' },
      { nl: 'Manuele therapie', en: 'Manual therapy', pl: 'Terapia manualna' },
      { nl: 'Herstel', en: 'Recovery', pl: 'Regeneracja' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/diamond.hands.manual.therapy/', label: '@diamond.hands.manual.therapy' },
      { type: 'facebook', url: 'https://www.facebook.com/share/1Dom5mZNJq/', label: 'Diamond Hands' },
    ],
  },  {
    id: 'berkano',
    name: 'Berkano',
    logoShape: 'photo',
    glow: 'rgba(200,220,40,.22)',
    role: { nl: 'Internetartiest · Creator', en: 'Online artist · Creator', pl: 'Artysta internetowy · Twórca' },
    description: {
      nl: 'Berkano is een Poolse internetartiest en contentmaker. Volg hem op Instagram en YouTube voor zijn nieuwste video’s en projecten.',
      en: 'Berkano is a Polish online artist and content creator. Follow him on Instagram and YouTube for his latest videos and projects.',
      pl: 'Berkano to polski artysta internetowy i twórca. Obserwuj go na Instagramie i YouTube – najnowsze filmy i projekty.',
    },
    logo: '/images/partners/berkano.webp',
    tags: [
      { nl: 'Creator', en: 'Creator', pl: 'Twórca' },
      { nl: 'YouTube', en: 'YouTube', pl: 'YouTube' },
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/berkanopoland_official/', label: '@berkanopoland_official' },
      { type: 'youtube', url: 'https://www.youtube.com/@berkanoofficial', label: '@berkanoofficial' },
    ],
  },
  {
    id: 'trener-miro-sw',
    name: 'Trener Miro',
    logoShape: 'photo',
    glow: 'rgba(255,150,40,.24)',
    role: { nl: 'Trainer · Partner', en: 'Trainer · Partner', pl: 'Trener · Partner' },
    description: {
      nl: 'Trener Miro – trainer en partner van OctagonSportNL. Volg Miro op Instagram voor trainingen en motivatie.',
      en: 'Trener Miro – trainer and partner of OctagonSportNL. Follow Miro on Instagram for training and motivation.',
      pl: 'Trener Miro – trener i partner OctagonSportNL. Obserwuj Miro na Instagramie: treningi i motywacja.',
    },
    logo: '/images/partners/trener-miro-sw.webp',
    tags: [
      { nl: 'Training', en: 'Training', pl: 'Treningi' },
    ],
    links: [{ type: 'instagram', url: 'https://www.instagram.com/trener_miro_sw/', label: '@trener_miro_sw' }],
  },
];

export const PARTNERS_HERO_IMAGE = '/images/partners/marris-gym-groep.webp';
