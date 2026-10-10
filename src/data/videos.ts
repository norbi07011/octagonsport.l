// =====================================================================
// Rolki / filmy na stronie głównej (sekcja „Octagon in actie”)
//
// Jak dodać nowy film:
//  1. Wrzuć plik do public/video/ (najlepiej pionowy 9:16, 720×1280, MP4 H.264,
//     do ok. 15 MB) oraz kadr podglądu .jpg (opcjonalnie).
//  2. Dopisz nowy wpis na końcu listy poniżej.
// Kolejność na liście = kolejność w karuzeli.
// =====================================================================
export interface ShopVideo {
  src: string;
  poster?: string;
  title: { nl: string; en: string; pl: string };
  subtitle: string;
}

export const SHOP_VIDEOS: ShopVideo[] = [
  {
    src: '/video/octagon-training-1.mp4',
    poster: '/video/octagon-training-1-poster.jpg',
    title: { nl: 'Kickboks training', en: 'Kickboxing training', pl: 'Trening kickboxingu' },
    subtitle: 'Marris Gym × Patryk MMA',
  },
  {
    src: '/video/octagon-training-2.mp4',
    poster: '/video/octagon-training-2-poster.jpg',
    title: { nl: 'Sparring & pads', en: 'Sparring & pads', pl: 'Sparingi i tarcze' },
    subtitle: 'Marris Gym × Patryk MMA',
  },
];
