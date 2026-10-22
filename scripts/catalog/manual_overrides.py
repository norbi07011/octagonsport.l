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
  - dziecięce sportshirty: 29,99
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

BY_SLUG = {
    **{s: 49.99 for s in RASHGUARDS_4999},
    'dames-t-shirt-octagon-oct-zwart': 29.99,
    'dames-t-shirt-octagon-oct-wit': 29.99,
    'mma-handschoenen-octagon-gold-edition-1-0-goud': 49.99,
}


def rule_price(p):
    slug, cat, sub = p['slug'], p.get('category'), p.get('subcategory')
    if slug in BY_SLUG:
        return BY_SLUG[slug]
    if cat == 'heren' and sub == 't-shirts':
        return 39.99
    if sub == 'tanktops':
        return 29.99
    if sub == 'hoodies' and 'met-capuchon' in slug:
        return 64.99
    if sub == 'bandages':
        return 19.99
    if cat == 'kids' and sub == 'sportshirts':
        return 29.99
    return None


HIDE_SALE = True  # ukryj produkty z wyprzedaży bez ręcznej ceny


def apply(cat):
    priced = hidden = 0
    missing = [s for s in BY_SLUG if not any(p['slug'] == s for p in cat['products'])]
    for p in cat['products']:
        price = rule_price(p)
        if price is not None:
            p['priceEur'] = price
            p.pop('compareAtEur', None)
            p['isSale'] = False
            priced += 1
        elif HIDE_SALE and (p.get('isSale') or p.get('compareAtEur')) and p.get('published'):
            p['published'] = False
            p['hiddenReason'] = 'sale-ended-2026-10'
            hidden += 1
    return priced, hidden, missing


if __name__ == '__main__':
    cat = json.load(open(CAT, encoding='utf-8'))
    priced, hidden, missing = apply(cat)
    json.dump(cat, open(CAT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'ręczne ceny: {priced}, ukryte z wyprzedaży: {hidden}, brakujące slugi: {missing}')
