"""Wycina białe tło ze zdjęć produktów (flood fill od krawędzi) -> WebP z przezroczystością.
Użycie: python3 scripts/showcase/cutout.py <wejście.webp> <wyjście.webp> [max_px] [tolerancja] [holes]
  holes = także białe prześwity w środku produktu (np. otwory w kasku) stają się przezroczyste"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
max_px = int(sys.argv[3]) if len(sys.argv) > 3 else 900
tol = int(sys.argv[4]) if len(sys.argv) > 4 else 14  # dla białych produktów ~4-6
holes = len(sys.argv) > 5 and sys.argv[5] == 'holes'
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.int16)
dist = 255 - a.min(axis=2)            # 0 = czysta biel
chroma = a.max(axis=2) - a.min(axis=2)
near_white = (dist < tol) & (chroma < 12)
lab, _ = ndimage.label(near_white)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
if holes:  # duże białe obszary zamknięte w produkcie (prześwity) też jako tło
    sizes = ndimage.sum(near_white, lab, index=np.arange(lab.max() + 1))
    big = np.where(sizes > near_white.size * 0.002)[0]
    bg |= np.isin(lab, [b for b in big if b != 0])
fg = ~bg
fg = ndimage.binary_opening(fg, iterations=1)
# usuń drobne plamki szumu – zostaw tylko większe elementy
flab, fn = ndimage.label(fg)
if fn > 1:
    fs = ndimage.sum(fg, flab, index=np.arange(fn + 1))
    keep = [i for i in range(1, fn + 1) if fs[i] > fs[1:].max() * 0.02]
    fg = np.isin(flab, keep)
fg = ndimage.binary_fill_holes(fg) if tol < 8 else fg  # białe produkty: łatamy prześwity w jasnych partiach
alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert('RGBA'); out.putalpha(alpha)
bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
out = out.crop(bbox)
out.thumbnail((max_px, max_px), Image.LANCZOS)
out.save(dst, 'WEBP', quality=86, method=6)
print(dst, out.size)
