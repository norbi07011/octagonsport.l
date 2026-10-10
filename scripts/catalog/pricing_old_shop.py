"""
Ceny w stylu starego sklepu octagonsport.nl (Shopify).

Zasada (kategoriami):
  1. Dla każdej podkategorii bierzemy progi cenowe, które były w starym sklepie
     (np. T-shirty 19,99 / 29,99 / 34,99 / 39,99; rashguardy 49,99).
  2. Cena szacunkowa = cena dostawcy w PLN × typowy przelicznik starego sklepu
     dla tej podkategorii; potem „przyklejamy” ją do najbliższego progu.
  3. Gdy produkt jest w starym sklepie prawie na pewno ten sam (bardzo wysokie
     dopasowanie nazwy i ta sama podkategoria) – bierzemy jego dokładną cenę.
  4. Kategorie, których stary sklep nie miał – przelicznik ogólny i ładne
     zaokrąglenie do ,99 (np. 29,99 / 34,99).

Wynik: pole priceEur w src/data/catalog.json (+ raport w scripts/catalog/pricing_report.csv).
Uruchom ponownie po każdej aktualizacji katalogu:  python3 scripts/catalog/pricing_old_shop.py
"""
import csv, json, math, re, statistics as st
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CAT = ROOT / 'src/data/catalog.json'
OLD = ROOT / 'scripts/catalog/source/old-shop-prices.csv'
REPORT = ROOT / 'scripts/catalog/pricing_report.csv'

# Progi cenowe – ze starego sklepu, uzupełnione tam, gdzie go brakowało
POINTS = {
    'bokshandschoenen': [34.99, 49.99, 69.99, 99.99],
    'mma-handschoenen': [34.99, 49.99],
    'scheenbeschermers': [14.99, 49.99, 54.99, 59.99, 69.99],
    'bokshelmen': [44.99, 49.99],
    'gebitsbeschermers': [9.99, 14.99],
    'bandages': [14.99, 19.99],
    'overige-bescherming': [24.99, 34.99],
    'stootkussens': [44.99, 54.99, 69.99, 109.99],
    'bokszakken': [49.99, 64.99, 94.99],
    'rashguards': [49.99],
    'mma-shorts': [49.99],
    'kickboxing-shorts': [44.99, 49.99],
    'compressieshorts': [49.99],
    'shorts': [29.99, 39.99],
    't-shirts': [19.99, 29.99, 34.99, 39.99],
    'sportshirts': [29.99, 34.99, 39.99],
    'polo': [39.99],
    'tanktops': [29.99, 34.99],
    'hoodies': [54.99, 59.99, 64.99],
    'broeken': [49.99, 54.99],
    'jassen': [74.99, 84.99, 89.99, 94.99],
    'leggings': [49.99],
    'caps': [39.99],
    'mutsen': [9.99, 19.99],
    'bivakmutsen': [9.99],
    'tassen': [12.00, 14.99, 19.99, 24.99, 29.99, 39.99, 45.00, 59.99, 64.99, 74.99],
    'shakers': [4.99],
    'handdoeken': [30.00],
}

GLOBAL_RATIO = 0.30  # typowo: stary sklep ≈ 30% ceny w PLN

# Ręczne przeliczniki tam, gdzie dopasowania były zaburzone promocjami
RATIO_OVERRIDE = {'bandages': 0.30, 'mma-handschoenen': 0.33, 'bokszakken': 0.45}

SRC = ROOT / 'scripts/catalog/source/octagonshop-katalog.json'


def norm(s: str) -> str:
    s = s.lower()
    for a, b in [('zwart', 'black'), ('wit', 'white'), ('rood', 'red'), ('grijs', 'grey'), ('roze', 'pink'),
                 ('paars', 'purple'), ('groen', 'green'), ('blauw', 'blue'), ('goud', 'gold'), ('bruin', 'brown'),
                 ('+ gratis gymbag!', '')]:
        s = s.replace(a, b)
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    return ' '.join(s.split())


PLN_PER_EUR = 4.25


def floor_price(pln: float) -> float:
    """Minimalna cena: cena dostawcy w PLN przeliczona na EUR (bez sprzedaży poniżej ceny dostawcy)."""
    return pretty(pln / PLN_PER_EUR)


def pretty(x: float) -> float:
    """Zaokrąglenie w górę do …4,99 / …9,99 (jak w starym sklepie)."""
    if x < 10:
        return math.ceil(x) - 0.01
    return math.ceil(x / 5) * 5 - 0.01


def main():
    cat = json.load(open(CAT, encoding='utf-8'))
    prods = cat['products']
    old = list(csv.DictReader(open(OLD, encoding='utf-8'), delimiter=';'))

    # 1) dopasowania nazw → przeliczniki dla kategorii i ceny 1:1
    exact = {}
    ratios = defaultdict(list)
    for o in old:
        on = norm(o['title'])
        best = (0, None)
        for p in prods:
            if not p['published']:
                continue
            for n in (p['name'], p['name_en'], p['name_pl']):
                r = SequenceMatcher(None, on, norm(n)).ratio()
                if r > best[0]:
                    best = (r, p)
        r, p = best
        price = float(o['min'])
        if r >= 0.86 and p['pricePln'] > 0:
            ratios[p['subcategory']].append(price / p['pricePln'])
        if r >= 0.93:
            exact.setdefault(p['id'], price)

    cat_ratio = {k: st.median(v) for k, v in ratios.items() if len(v) >= 2}
    cat_ratio.update(RATIO_OVERRIDE)

    # cena regularna u dostawcy (przed promocją)
    src = json.load(open(SRC, encoding='utf-8'))
    regular_pln = {str(x['id']): max(x['prices']) for x in src['prods'] if x.get('prices')}

    # 2) cena każdego produktu
    rows = []

    def category_price(pid, sub, pln):
        ratio = cat_ratio.get(sub, GLOBAL_RATIO)
        est = pln * ratio
        pts = POINTS.get(sub)
        if pid in exact:
            return exact[pid], est, 'stary sklep 1:1'
        if pts and 0.7 * min(pts) <= est <= 1.3 * max(pts):
            return min(pts, key=lambda x: abs(x - est)), est, 'próg kategorii'
        return pretty(est), est, 'przelicznik'

    for p in prods:
        sub = p['subcategory']
        now_pln = p['pricePln']
        reg_pln = max(regular_pln.get(str(p['supplierId']), now_pln), now_pln)
        regular, est, how = category_price(p['id'], sub, reg_pln)
        regular = round(max(regular, floor_price(reg_pln)), 2)
        p.pop('compareAtEur', None)
        if reg_pln > now_pln * 1.02:
            # promocja u dostawcy → ten sam procent obniżki od naszej ceny regularnej
            sale = round(max(pretty(regular * now_pln / reg_pln), floor_price(now_pln)), 2)
            if sale < regular:
                p['priceEur'] = sale
                p['compareAtEur'] = regular
                how += ' + promocja'
            else:
                p['priceEur'] = regular
        else:
            p['priceEur'] = regular
        rows.append([p['id'], p['name'], sub, reg_pln, now_pln, f'{est:.2f}', f"{p.get('compareAtEur', '')}", f"{p['priceEur']:.2f}", how])

    # 3) warianty kolorystyczne tego samego modelu – ta sama cena (najczęstsza w grupie)
    groups = defaultdict(list)
    for p in prods:
        groups[p.get('group') or p['id']].append(p)
    for g in groups.values():
        if len({p['pricePln'] for p in g}) == 1 and len({p['priceEur'] for p in g}) > 1:
            common = st.mode([p['priceEur'] for p in g])
            src_p = next(p for p in g if p['priceEur'] == common)
            for p in g:
                p['priceEur'] = common
                if 'compareAtEur' in src_p:
                    p['compareAtEur'] = src_p['compareAtEur']
                else:
                    p.pop('compareAtEur', None)

    json.dump(cat, open(CAT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    with open(REPORT, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['id', 'naam', 'subcategorie', 'pln_regulier', 'pln_nu', 'schatting', 'eur_regulier_bij_actie', 'prijs_eur', 'methode'])
        w.writerows(rows)

    print('przeliczniki kategorii:', {k: round(v, 3) for k, v in sorted(cat_ratio.items())})
    print('ceny 1:1 ze starego sklepu:', len(exact))


if __name__ == '__main__':
    main()
