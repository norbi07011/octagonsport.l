"""
Ręczne ceny i decyzje właściciela – nakładane NA KOŃCU (po pricing_old_shop.py), więc nie giną
przy ponownym przeliczeniu cen. Zmiana: edytuj listy poniżej i uruchom
    python3 scripts/catalog/manual_overrides.py

Ustalenia (22.10.2026):
  - męskie T-shirty: 39,99
  - wybrane rashguardy (lista RASHGUARDS_4999): 49,99
  - koszulki na ramiączkach (tanktops): 29,99
  - bluzy Z KAPTUREM (met capuchon): 64,99
  - bandaże (boks + żelowe): 19,99
  - damskie T-shirty Octagon OCT. (zwart / wit): 29,99
  - wszystkie koszulki dziecięce (T-shirty i sportshirty kids): 29,99
  - dresy (joggingbroeken): 54,99
  - bluzy BEZ kaptura (sweatery, zip bez kaptura, Utah): 59,99
  - rękawice MMA Gold Edition 1.0 złote: 49,99
  - koniec wyprzedaży: strona Sale usunięta; produkty z wyprzedaży, którym nie nadano ceny powyżej,
    są ukryte (published = False) – da się je przywrócić, usuwając je z HIDE_SALE lub wyłączając tę regułę.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CAT = ROOT / 'src/data/catalog.json'

RASHGUARDS_4999 = [
    'rashguard-octagon-premium-diamond-zwart-korte-mouw',
    'rashguard-octagon-premium-camo-forest-korte-mouw',
    'rashguard-octagon-premium-broken-line-khaki-korte-mouw',
    'rashguard-octagon-premium-broken-line-zwart-korte-mouw',
    'rashguard-octagon-premium-blocks-rood-korte-mouw',
    'rashguard-octagon-premium-blocks-groen-korte-mouw',
    'rashguard-octagon-premium-blocks-blauw-korte-mouw',
    'rashguard-octagon-premium-mesh-camo-lichtgroen-korte-mouw',
    'rashguard-octagon-premium-marble-camo-zwart-geel-korte-mouw',
    'rashguard-octagon-premium-marble-camo-zwart-rood-korte-mouw',
]

# Produkty dodane ręcznie (brak ich w eksporcie dostawcy) – wstawiane, jeśli nie ma ich w katalogu
EXTRA_PRODUCTS = [
    {
        'id': 'oct-4352', 'supplierId': '4352',
        'slug': 'sportshirt-octagon-polska-orzel-wit-limited-edition',
        'name': 'Sportshirt Octagon Polska Orzeł wit Limited Edition',
        'name_en': 'Octagon Poland Eagle White Limited Edition Sports T-shirt',
        'name_pl': 'Koszulka sportowa Octagon Polska Orzeł biała Limited Edition',
        'brand': 'OCTAGON', 'descKey': '92', 'category': 'heren', 'subcategory': 'sportshirts',
        'sport': ['fitness'], 'gender': 'men', 'material': '100% polyester',
        'colors': [{'name': 'wit', 'hex': '#ffffff'}], 'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
        'isSale': False, 'stock': 20, 'isNew': True, 'published': True, 'group': 'oct-5011', 'pricePln': 119,
        'images': [
            '/products/koszulka-sportowa-octagon-pol-biala_crop.webp',
            '/products/koszulka-sportowa-octagon-pol_16297.webp',
            '/products/koszulka-sportowa-octagon-mie_16239.webp',
        ],
        'short': {
            'nl': 'Sportshirt van Octagon uit de Limited Edition-collectie, van licht, ademend materiaal – ideaal voor elke sport.',
            'en': 'sports T-shirt from LIMITED EDITION',
            'pl': 'koszulkę sportową z LIMITOWANEJ EDYCJI',
        },
        'priceEur': 35.00,
    },
    {
        # Własny projekt (Octagon Sport × Berkano) – upamiętnienie wyzwolenia Bredy 29.10.1944 (dodano 12.11.2026)
        'id': 'oct-breda-1944', 'supplierId': 'BREDA1944',
        'slug': 'sportshirt-octagon-berkano-breda-1944-limited-edition',
        'name': 'Sportshirt Octagon Berkano Breda 1944 Limited Edition',
        'name_en': 'Octagon Berkano Breda 1944 Limited Edition Sports T-shirt',
        'name_pl': 'Koszulka sportowa Octagon Berkano Breda 1944 Limited Edition',
        'brand': 'OCTAGON', 'descKey': 'breda1944', 'category': 'heren', 'subcategory': 'sportshirts',
        'sport': ['fitness', 'mma'], 'gender': 'men', 'material': '',
        'colors': [{'name': 'zwart', 'hex': '#0a0a0a'}], 'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
        'isSale': False, 'stock': 20, 'isNew': True, 'published': True, 'group': 'oct-breda-1944', 'pricePln': 0,
        'images': [
            '/products/sportshirt-octagon-berkano-breda-1944-front.webp', '/products/sportshirt-octagon-berkano-breda-1944-back.webp', '/products/sportshirt-octagon-berkano-breda-1944-detail-back.webp',
            '/products/sportshirt-octagon-berkano-breda-1944-detail-front.webp', '/products/sportshirt-octagon-berkano-breda-1944-detail-82.webp', '/products/sportshirt-octagon-berkano-breda-1944-detail-flag.webp',
        ],
        'short': {
            'nl': 'Herdenkingsshirt voor de bevrijding van Breda op 29 oktober 1944 door de 1e Poolse Pantserdivisie van generaal Stanisław Maczek.',
            'en': 'Commemorative shirt for the liberation of Breda on 29 October 1944 by General Stanisław Maczek’s 1st Polish Armoured Division.',
            'pl': 'Koszulka upamiętniająca wyzwolenie Bredy 29 października 1944 r. przez 1. Dywizję Pancerną gen. Stanisława Maczka.',
        },
        'priceEur': 35.00,
    },
]

# Nowości: Polska Orzeł Limited Edition – 35,00 (zmiana 12.11.2026, wcześniej 39,99)
NEW_SLUGS = [
    'sportshirt-octagon-berkano-breda-1944-limited-edition',
    'sportshirt-octagon-polska-orzel-wit-limited-edition',
    'sportshirt-octagon-polska-orzel-rood-limited-edition',
]

BY_SLUG = {
    'sportshirt-octagon-berkano-breda-1944-limited-edition': 35.00,
    'sportshirt-octagon-polska-orzel-wit-limited-edition': 35.00,
    'sportshirt-octagon-polska-orzel-rood-limited-edition': 35.00,
    **{s: 49.99 for s in RASHGUARDS_4999},
    'dames-t-shirt-octagon-oct-zwart': 29.99,
    'dames-t-shirt-octagon-oct-wit': 29.99,
    'mma-handschoenen-octagon-gold-edition-1-0-goud': 49.99,
    # bluzy z kapturem na zamek – wyjątek od 64,99 (25.10.2026)
    'hoodie-octagon-small-logo-zip-met-capuchon-zwart': 69.99,
    'hoodie-octagon-zip-stripe-met-capuchon-zwart-wit': 69.99,
}


def rule_price(p):
    slug, cat, sub = p['slug'], p.get('category'), p.get('subcategory')
    if slug in BY_SLUG:
        return BY_SLUG[slug]
    if cat == 'heren' and sub == 't-shirts':
        return 39.99
    if sub == 'tanktops':
        return 29.99
    if sub == 'hoodies':
        return 64.99 if 'met-capuchon' in slug else 59.99
    if sub == 'broeken' and slug.startswith('joggingbroek'):
        return 54.99
    if cat == 'kids' and sub in ('t-shirts', 'sportshirts'):
        return 29.99
    if sub == 'bandages':
        return 19.99
    return None


# Produkty usunięte ze sklepu na prośbę właściciela (ukryte na stałe; żeby przywrócić – usuń slug z listy)
REMOVED = [
    'winterjas-octagon-hibernal',
    'jas-octagon-no-face',
    'hoodie-octagon-small-logo-zip-zonder-capuchon-zwart',
    'hoodie-octagon-zip-stripe-zonder-capuchon-zwart-wit',
]

HIDE_SALE = True  # ukryj produkty z wyprzedaży bez ręcznej ceny


def apply(cat):
    priced = hidden = 0
    have = {p['id'] for p in cat['products']}
    for extra in EXTRA_PRODUCTS:
        if extra['id'] not in have:
            cat['products'].append(dict(extra))
    for p in cat['products']:
        if p['slug'] in NEW_SLUGS:
            p['isNew'] = True
    missing = [s for s in BY_SLUG if not any(p['slug'] == s for p in cat['products'])]
    for p in cat['products']:
        price = rule_price(p)
        if price is not None:
            p['priceEur'] = price
            p.pop('compareAtEur', None)
            p['isSale'] = False
            # produkt ukryty wcześniej jako wyprzedaż, a teraz z ręczną ceną – wraca do sklepu
            if p.get('hiddenReason') == 'sale-ended-2026-10':
                p['published'] = True
                p.pop('hiddenReason', None)
            priced += 1
        elif HIDE_SALE and (p.get('isSale') or p.get('compareAtEur')) and p.get('published'):
            p['published'] = False
            p['hiddenReason'] = 'sale-ended-2026-10'
            hidden += 1
    for p in cat['products']:
        if p['slug'] in REMOVED:
            p['published'] = False
            p['hiddenReason'] = 'removed-by-owner'
            hidden += 1
    missing += [s for s in REMOVED if not any(p['slug'] == s for p in cat['products'])]
    return priced, hidden, missing


# Pełne opisy produktów dodanych ręcznie – dopisywane do public/data/desc-{nl,en,pl}.json
DESC_DIR = ROOT / 'public/data'
EXTRA_DESCS = {
    'breda1944': {
        'nl': '<p>Op 29 oktober 1944 bevrijdde de 1e Poolse Pantserdivisie onder leiding van generaal Stanisław Maczek de stad Breda. Dit Limited Edition-shirt van Octagon Sport × Berkano eert die gedeelde geschiedenis van Polen en Nederland.</p><ul><li>Voorkant: Octagon Sport Berkano-logo met huzarenhelm en vleugel</li><li>Achterkant: herdenkingsprint met de tekst „Za naszą i waszą wolność” (Voor onze en jullie vrijheid), 1. Dywizja Pancerna, gen. Stanisław Maczek, Breda 29.10.1944</li><li>Mouwen: nummer 82 in een octagon en de Poolse vlag</li><li>Limited Edition – op = op</li></ul>',
        'en': '<p>On 29 October 1944 the 1st Polish Armoured Division, led by General Stanisław Maczek, liberated the city of Breda. This Octagon Sport × Berkano Limited Edition shirt honours that shared history of Poland and the Netherlands.</p><ul><li>Front: Octagon Sport Berkano logo with hussar helmet and wing</li><li>Back: commemorative print with “Za naszą i waszą wolność” (For our freedom and yours), 1. Dywizja Pancerna, Gen. Stanisław Maczek, Breda 29.10.1944</li><li>Sleeves: number 82 in an octagon and the Polish flag</li><li>Limited Edition – when it’s gone, it’s gone</li></ul>',
        'pl': '<p>29 października 1944 roku 1. Dywizja Pancerna pod dowództwem gen. Stanisława Maczka wyzwoliła Bredę. Ta koszulka Limited Edition od Octagon Sport × Berkano upamiętnia wspólną historię Polski i Holandii.</p><ul><li>Przód: logo Octagon Sport Berkano z hełmem i skrzydłem husarskim</li><li>Tył: nadruk upamiętniający – „Za naszą i waszą wolność”, 1. Dywizja Pancerna, gen. Stanisław Maczek, Breda 29.10.1944</li><li>Rękawy: numer 82 w oktagonie i polska flaga</li><li>Limited Edition – do wyczerpania zapasów</li></ul>',
    },
}


def apply_descs():
    for lang in ('nl', 'en', 'pl'):
        f = DESC_DIR / f'desc-{lang}.json'
        d = json.load(open(f, encoding='utf-8'))
        for key, texts in EXTRA_DESCS.items():
            d[key] = texts[lang]
        json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    cat = json.load(open(CAT, encoding='utf-8'))
    priced, hidden, missing = apply(cat)
    apply_descs()
    json.dump(cat, open(CAT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'ręczne ceny: {priced}, ukryte z wyprzedaży: {hidden}, brakujące slugi: {missing}')
