"""
Generuje WSZYSTKIE wycięte zdjęcia do animacji (public/showcase/*.webp) modelem AI.

Użycie:
  python3 scripts/showcase/build_cutouts.py ŚCIEŻKA/isnet-general-use.onnx [filtr]
  (filtr = fragment nazwy pliku, np. "guardox", aby przetworzyć tylko część)

Model: https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import cutout_ai  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CAT = {p['id']: p for p in json.load(open(os.path.join(ROOT, 'src/data/catalog.json')))['products']}


def img(pid, idx):
    return os.path.join(ROOT, 'public' + CAT[pid]['images'][idx])


JOBS = []  # (plik_wyjściowy, źródło, opcje)


def add(name, pid, idx, **opts):
    JOBS.append((name, img(pid, idx), opts))


# Rękawice Kevlar (para + bok)
for c, pid in [('white', 'oct-5631'), ('blue', 'oct-5632'), ('red', 'oct-5633'), ('black', 'oct-5630'), ('gold', 'oct-5801')]:
    mf = 0 if c == 'white' else 14  # białe logo przy krawędzi: dołóż maskę zalewania tła
    add(f'kevlar-{c}-pair', pid, 0, merge_flood=mf)
    add(f'kevlar-{c}-side', pid, 1, merge_flood=mf)
# Kask Guardox
# (biały kask pominięty: biała wyściółka ma kolor tła zdjęcia – nie da się go czysto wyciąć)
for c, pid in [('black', 'oct-6070'), ('blue', 'oct-6075'), ('red', 'oct-6074')]:
    # białe tło widoczne przez otwory maski; dla białego kasku ostrożniej (biała wyściółka)
    hm = 0.3 if c == 'white' else 0.85
    add(f'guardox-{c}-hero', pid, 0, holes=True, holes_max=hm)
    add(f'guardox-{c}-detail', pid, 2, holes=True, holes_max=hm)
# Ochraniacze Kevlar
for c, pid in [('white', 'oct-5675'), ('blue', 'oct-5677'), ('red', 'oct-5676'), ('black', 'oct-5678'), ('gold', 'oct-5804')]:
    add(f'shin-kevlar-{c}-hero', pid, 2)
    add(f'shin-kevlar-{c}-detail', pid, 0)
# Owijki Supreme
for c, pid in [('black', 'oct-5892'), ('red', 'oct-5850'), ('blue', 'oct-5868'), ('lightblue', 'oct-5862'),
               ('green', 'oct-5880'), ('lime', 'oct-5874'), ('yellow', 'oct-5844'), ('bordeaux', 'oct-5856')]:
    add(f'supreme-{c}-hero', pid, 1)
    add(f'supreme-{c}-detail', pid, 0)
# Kids Brainrot (tył / przód)
for k, pid in [('bull', 'oct-6009'), ('croc', 'oct-6008'), ('gorilla', 'oct-6004'), ('tiger', 'oct-6010')]:
    add(f'kids-{k}-back', pid, 0)
    add(f'kids-{k}-front', pid, 1)
# Kids Gear Up – zwierzaki: rękawice (bok), kask (przód, otwory przezroczyste), ochraniacze (para)
for k, g, h, sh in [('bear', 'oct-5627', 'oct-6063', 'oct-6055'), ('bull', 'oct-5629', 'oct-6062', 'oct-6058'),
                    ('croc', 'oct-5628', 'oct-6059', 'oct-6054'), ('monkey', 'oct-5626', 'oct-6061', 'oct-6056'),
                    ('tiger', 'oct-5625', 'oct-6060', 'oct-6057')]:
    add(f'kidsgear-{k}-gloves', g, 1)
    add(f'kidsgear-{k}-helmet', h, 0, holes=True)
    add(f'kidsgear-{k}-shins', sh, 3)
# Karty kategorii
for prefix, items in {
    'men': [(6040, 0, 1), (6038, 0, 1), (6035, 0, 1), (6039, 0, 1)],
    'women': [(6209, 0, 1), (6207, 0, 1), (3528, 0, 2), (6234, 0, 1)],
    'training': [(5652, 0, 1), (5659, 0, 1), (6084, 0, 1), (4901, 0, 1)],
    'acc': [(6028, 0, 3), (6107, 0, 1), (4373, 0, 1), (6123, 0, 0)],
    'new': [(6250, 0, 1), (6049, 0, 1), (6270, 0, 1), (6241, 0, 2)],
}.items():
    for pid, a, b in items:
        opts = {'merge_flood': 80} if pid == 6028 else {}  # plecak na szarym tle: pełne białe logo (front)
        add(f'{prefix}-{pid}-a', f'oct-{pid}', a, **opts)
        add(f'{prefix}-{pid}-b', f'oct-{pid}', b)


if __name__ == '__main__':
    model = sys.argv[1]
    flt = sys.argv[2] if len(sys.argv) > 2 else ''
    cutout_ai.ISNET = 'isnet' in model.lower()
    sess = cutout_ai.load_session(model)
    out_dir = os.path.join(ROOT, 'public', 'showcase')
    todo = [j for j in JOBS if flt in j[0]]
    for i, (name, src, opts) in enumerate(todo, 1):
        size = cutout_ai.cutout(sess, src, os.path.join(out_dir, name + '.webp'), 900, **opts)
        print(f'[{i}/{len(todo)}] {name} {size}', flush=True)
