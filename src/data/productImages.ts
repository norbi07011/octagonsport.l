// Zdjęcia używane w banerach i menu – prawdziwe zdjęcia produktów od dostawcy (public/products).
// HERO_IMAGE to grafika dekoracyjna (wygenerowana) – do podmiany na własne zdjęcie/sesję.
export const HERO_IMAGE = '/images/hero_fighter_arena.webp';
/** Baner „Enter the Octagon” na stronie głównej – prawdziwe zdjęcie z Marris Gym. */
export const ARENA_BANNER_IMAGE = '/images/arena-marris-gym-octagon.webp';
/** Okładka strony głównej – sala Marris Gym × Legion Octagon Academy */
export const HOME_HERO_IMAGE = '/images/hero-marris-legion-academy.webp';

const P = (f: string) => `/products/${f}.webp`;
export const BOXING_GLOVES_IMAGE = P('rekawice-bokserskie-legion-oc_20121');
export const RASHGUARD_IMAGE = P('rashguard-octagon-premium-blo_15259');
export const SHIN_GUARDS_IMAGE = P('ochraniacze-legion-octagon-pi_18713');
export const HOODIE_IMAGE = P('bluza-octagon-small-logo-black_9973');
export const TSHIRT_IMAGE = P('t-shirt-octagon-be-quiet-or-b_17414');
export const JOGGER_IMAGE = P('spodnie-octagon-stripe-black_6470');
export const MMA_SHORTS_IMAGE = P('spodenki-szorty-mma-legion-oc_19018');
export const CAMO_GLOVES_IMAGE = P('rekawice-bokserskie-legion-oc_20447');
export const HEADGUARD_IMAGE = P('kask-bokserski-legion-octagon_20143');
export const DUFFLE_BAG_IMAGE = P('plecak-torba-sportowa-legion_19948');
export const LEGGINGS_IMAGE = P('legginsy-damskie-legion-octag_20539');
export const MUAY_THAI_SHORTS_IMAGE = P('spodenki-kickboxing-muay-thai_19564');
export const WAIST_BAG_IMAGE = P('saszetka-nerka-legion-octagon_19687');
export const SNAPBACK_IMAGE = P('czapka-z-daszkiem-legion-octa_20297');
export const THAI_PADS_IMAGE = P('thai-pad-pao-legion-octagon-m_18632');
export const HEAVY_BAG_IMAGE = P('worek-bokserski-legion-octago_20749');
export const WINDBREAKER_IMAGE = P('kurtka-przejsciowa-legion-oct_19626');
export const BACKPACK_IMAGE = P('plecak-legion-octagon-new-log_19489');
export const BEANIE_IMAGE = P('czapka-zimowa-octagon-fw-melan_8426');
