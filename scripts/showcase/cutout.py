"""Wycina białe tło ze zdjęć produktów (flood fill od krawędzi) -> WebP z przezroczystością.
Użycie: python3 scripts/showcase/cutout.py <wejście.webp> <wyjście.webp> [max_px] [tolerancja]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
max_px = int(sys.argv[3]) if len(sys.argv) > 3 else 900
tol = int(sys.argv[4]) if len(sys.argv) > 4 else 14  # dla białych produktów ~3
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.int16)
dist = 255 - a.min(axis=2)            # 0 = czysta biel
chroma = a.max(axis=2) - a.min(axis=2)
near_white = (dist < tol) & (chroma < 12)
lab, _ = ndimage.label(near_white)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fg = ~bg
fg = ndimage.binary_opening(fg, iterations=1)
fg = ndimage.binary_fill_holes(fg) if tol < 8 else fg  # białe produkty: łatamy prześwity w jasnych partiach
alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert('RGBA'); out.putalpha(alpha)
bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
out = out.crop(bbox)
out.thumbnail((max_px, max_px), Image.LANCZOS)
out.save(dst, 'WEBP', quality=86, method=6)
print(dst, out.size)
