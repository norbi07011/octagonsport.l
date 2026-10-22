/**
 * SEO po buildzie (uruchamiane automatycznie w `npm run build`, także na Netlify).
 *
 * Sklep to aplikacja jednostronicowa (SPA), więc bez tego każdy link – w Google, WhatsAppie,
 * na Facebooku czy Instagramie – pokazywałby ten sam tytuł i obrazek. Ten skrypt tworzy
 * w dist/ osobny plik index.html dla każdej kategorii, podstrony i każdego produktu z:
 *  - własnym <title>, opisem, obrazkiem (og:image), adresem kanonicznym,
 *  - danymi strukturalnymi produktu (JSON-LD: cena, dostępność, marka, zdjęcia) dla Google,
 * oraz plik sitemap.xml i robots.txt. Aplikacja React działa dalej normalnie.
 *
 * Adres sklepu: zmienna SITE_URL (Netlify), inaczej URL (Netlify), inaczej https://www.octagonsport.nl
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(ROOT, process.argv[2] || 'dist');
const SITE = (process.env.SITE_URL || process.env.URL || 'https://www.octagonsport.nl').replace(/\/$/, '');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/catalog.json'), 'utf8'));
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = p => (p.startsWith('http') ? p : SITE + (p.startsWith('/') ? p : '/' + p));
const clip = (s, n = 155) => {
  const t = String(s || '').replace(/\s+/g, ' ').replace(/…$/, '').trim();
  return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t;
};

function render({ title, description, image, url, type = 'website', jsonld }) {
  let h = template;
  const set = (re, val) => { h = h.replace(re, val); };
  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  set(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);
  set(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`);
  set(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`);
  set(/<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${type}" />`);
  set(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  set(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  set(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(abs(image))}" />`);
  const extra = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta name="twitter:image" content="${esc(abs(image))}" />`,
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n    ');
  h = h.replace('</head>', `    ${extra}\n  </head>`);
  return h;
}

function write(route, html) {
  const dir = path.join(DIST, route.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const products = catalog.products.filter(p => p.published && p.images && p.images.length);
const firstImageOf = cat => (products.find(p => p.category === cat) || products[0]).images[0];
const ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OctagonSportNL',
  url: SITE,
  logo: abs('/brand/octagon-badge-512.png'),
};

// Strona główna – adres kanoniczny + dane organizacji
fs.writeFileSync(
  path.join(DIST, 'index.html'),
  render({
    title: 'OctagonSportNL | Octagon Fightwear & Vechtsport Uitrusting',
    description: 'Fightwear en vechtsportuitrusting van het Poolse merk Octagon: bokshandschoenen, scheenbeschermers, rashguards, MMA- en kickboksshorts. Gratis verzending in Nederland vanaf €99.',
    image: '/brand/og-image.png',
    url: SITE + '/',
    jsonld: ORG,
  })
);

const PAGES = [
  ['/category/heren', 'Heren – fightwear, T-shirts, rashguards & shorts', 'Octagon fightwear voor heren: grafische T-shirts, rashguards, kickboks- en MMA-shorts, hoodies en meer. Gratis verzending in Nederland vanaf €99.', firstImageOf('heren')],
  ['/category/dames', 'Dames – leggings, T-shirts & sportkleding', 'Octagon voor dames: ribbed leggings, oversized T-shirts en sportkleding voor training en dagelijks gebruik.', firstImageOf('dames')],
  ['/category/kids', 'Kids – T-shirts, bokshandschoenen & bescherming', 'Octagon voor kinderen: Brainrot T-shirts, bokshandschoenen, helmen en scheenbeschermers met dierenprints.', '/showcase/kids-bull-back.webp'],
  ['/category/fight-gear', 'Fight gear – bokshandschoenen, helmen & scheenbeschermers', 'Legion Octagon fight gear: Kevlar bokshandschoenen, Guardox 2-in-1 helmen, scheenbeschermers, bandages en meer.', firstImageOf('fight-gear')],
  ['/category/training', 'Training – stootkussens, bokszakken & medicijnballen', 'Trainingsmateriaal van Legion Octagon: focus mitts, Thai pads, bokszakken en medicijnballen van echt leer.', firstImageOf('training')],
  ['/category/accessoires', 'Accessoires – tassen, petten, shakers & meer', 'Octagon accessoires: sporttassen en rugzakken, petten, bivakmutsen, handdoeken en shakers.', firstImageOf('accessoires')],
  ['/nieuw', 'Nieuw binnen', 'De nieuwste Octagon drops: T-shirts 2026, rashguards, shorts, sweaters en fight gear.', firstImageOf('heren')],
  ['/partners', 'Partners & samenwerkingen', 'De sportscholen, clubs, vechters en creators waarmee OctagonSportNL samenwerkt.', '/images/partners/marris-gym-groep.webp'],
  ['/over-ons', 'Over ons – Octagon in Nederland', 'OctagonSportNL brengt de fightwear en vechtsportuitrusting van het Poolse merk Octagon naar Nederland.', '/images/arena-marris-gym-octagon.webp'],
  ['/clubs', 'Voor clubs & teams', 'Aanbod voor sportscholen, clubs en teams: Octagon gear en kleding op aanvraag.', '/images/arena-marris-gym-octagon.webp'],
  ['/wholesale', 'Groothandel & B2B', 'Groothandel en B2B voor winkels en sportscholen: Octagon producten in grotere aantallen.', '/brand/og-image.png'],
  ['/custom-teamwear', 'Custom teamwear', 'Teamkleding met je eigen clublogo en ontwerp.', '/brand/og-image.png'],
  ['/contact', 'Contact & klantenservice', 'Vragen over maten, levertijden of je bestelling? Neem contact op met OctagonSportNL.', '/brand/og-image.png'],
];
for (const [route, t, d, img] of PAGES) {
  write(route, render({ title: `${t} | OctagonSportNL`, description: d, image: img, url: SITE + route }));
}

// Produkty
let count = 0;
for (const p of products) {
  const route = `/product/${p.slug}`;
  const desc = clip(`${(p.short && p.short.nl) || p.name}`, 140) + ` – €${Number(p.priceEur).toFixed(2).replace('.', ',')}`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images.filter(i => !/tabel|size|chart/i.test(i)).slice(0, 4).map(abs),
    description: clip((p.short && p.short.nl) || p.name, 300),
    sku: p.supplierId || p.id,
    brand: { '@type': 'Brand', name: p.brand === 'OCTAGON' ? 'Octagon' : p.brand || 'Octagon' },
    offers: {
      '@type': 'Offer',
      url: SITE + route,
      priceCurrency: 'EUR',
      price: Number(p.priceEur).toFixed(2),
      availability: Number(p.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'OctagonSportNL' },
    },
  };
  write(route, render({ title: `${p.name} | OctagonSportNL`, description: desc, image: p.images[0], url: SITE + route, type: 'product', jsonld }));
  count++;
}

// sitemap.xml + robots.txt
const urls = ['/', ...PAGES.map(r => r[0]), ...products.map(p => `/product/${p.slug}`)];
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${esc(SITE + u)}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /bedankt\nDisallow: /beheer\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`[seo] ${PAGES.length} pagina's + ${count} producten + sitemap (${urls.length} URL's) → ${SITE}`);
