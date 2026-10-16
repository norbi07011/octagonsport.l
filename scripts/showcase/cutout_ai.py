"""
Wycinanie tła modelem AI (ISNet / BiRefNet, ONNX) -> WebP z przezroczystością.

Dokładniejsze niż cutout.py: rozpoznaje produkt/osobę, a nie tylko białe piksele,
więc nie zostawia białych prześwitów i nie obcina jasnych fragmentów produktu.
Na krawędziach usuwa białą „obwódkę” (dekontaminacja koloru względem białego tła).

Model (ok. 175 MB, nie trzymamy go w repozytorium), domyślnie ISNet (DIS):
  https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
(BiRefNet daje jeszcze lepsze krawędzie, ale potrzebuje > 6 GB RAM.)
Wymaga: onnxruntime, numpy, pillow

Użycie:
  python3 scripts/showcase/cutout_ai.py MODEL.onnx wejście.webp wyjście.webp [max_px] [wejście2 wyjście2 ...]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
import onnxruntime as ort
from scipy import ndimage

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
SIZE = 1024


def load_session(path):
    so = ort.SessionOptions()
    # oszczędnie z pamięcią (model jest duży, a obraz wejściowy 1024×1024)
    so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
    so.enable_cpu_mem_arena = False
    so.enable_mem_pattern = False
    so.intra_op_num_threads = 2
    return ort.InferenceSession(path, so, providers=['CPUExecutionProvider'])


ISNET = True


def predict_mask(sess, im):
    x = im.convert('RGB').resize((SIZE, SIZE), Image.BICUBIC)
    if ISNET:  # normalizacja ISNet (jak w rembg)
        a = np.asarray(x).astype(np.float32) / 255.0 - 0.5
    else:      # BiRefNet: ImageNet
        a = (np.asarray(x).astype(np.float32) / 255.0 - MEAN) / STD
    a = a.transpose(2, 0, 1)[None]
    out = sess.run(None, {sess.get_inputs()[0].name: a})[0]
    m = out[0, 0] if out.ndim == 4 else out[0]
    if not ISNET:
        m = 1 / (1 + np.exp(-m))  # sigmoid
    m = (m - m.min()) / max(m.max() - m.min(), 1e-6)
    mask = Image.fromarray((m * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC)
    return mask


def cutout(sess, src, dst, max_px=900, holes=False, holes_max=0.85, merge_flood=0):
    im = Image.open(src).convert('RGB')
    mask = predict_mask(sess, im)
    a = np.asarray(mask).astype(np.float32) / 255.0
    # lekkie „docięcie” miękkich krawędzi: usuń mgiełkę tła, wzmocnij pewne piksele
    a = np.clip((a - 0.04) / 0.92, 0, 1)
    # wnętrze produktu ma być pełne: model bywa niepewny na białych elementach (logo, wyściółka),
    # więc w środku sylwetki (dalej niż kilka px od zewnętrznej krawędzi) wszystko, co nie jest
    # pewnym otworem (alpha < 0.12), staje się w pełni kryjące
    if merge_flood:
        # połącz z maską „zalewania białego tła” (dla produktów, gdzie AI podcina białe logo przy krawędzi);
        # tylko w pobliżu produktu, żeby nie dodać cieni z podłogi
        px = np.asarray(im).astype(np.int16)
        nw = ((255 - px.min(axis=2)) < merge_flood) & ((px.max(axis=2) - px.min(axis=2)) < 14)
        lab, _ = ndimage.label(nw)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        flood_fg = ~np.isin(lab, list(border))
        flood_fg = ndimage.binary_opening(flood_fg, iterations=2)
        near = ndimage.distance_transform_edt(~(a > 0.5)) < max(6, min(im.size) * 0.03)
        a = np.where(flood_fg & near, np.maximum(a, 1.0), a)
    solid = a > 0.5
    # mgiełka: miękkie piksele daleko (> ~8 px) od pewnego produktu to szum tła -> usuń
    far = ndimage.distance_transform_edt(~solid) > max(8, min(im.size) * 0.008)
    a = np.where(far, 0.0, a)
    filled = ndimage.binary_fill_holes(solid)
    dist = ndimage.distance_transform_edt(filled)
    inner = dist > max(3, min(im.size) * 0.004)
    a = np.where(inner & (a >= 0.12), 1.0, a)
    if holes:
        # prześwity: duże, prawie białe obszary w środku produktu, które model uznał za niepewne
        # (np. otwory maski kasku) -> przezroczyste
        px = np.asarray(im).astype(np.int16)
        near_white = (px.min(axis=2) > 225) & ((px.max(axis=2) - px.min(axis=2)) < 18)
        lab, nlab = ndimage.label(near_white & filled)
        if nlab:
            raw = np.asarray(mask).astype(np.float32) / 255.0
            idx = np.arange(1, nlab + 1)
            sizes = ndimage.sum(np.ones_like(raw), lab, idx)
            mean_a = ndimage.mean(raw, lab, idx)
            kill = idx[(sizes > a.size * 0.0015) & (mean_a < holes_max)]
            if len(kill):
                hole = np.isin(lab, kill)
                hole = ndimage.binary_dilation(hole, iterations=1)
                a = np.where(hole, 0.0, a)
    rgb = np.asarray(im).astype(np.float32) / 255.0
    # tło (jasne) estymowane z pikseli pewnego tła; domyślnie biel
    bgmask = a < 0.02
    bg = rgb[bgmask].mean(axis=0) if bgmask.sum() > 100 else np.array([1.0, 1.0, 1.0])
    # dekontaminacja koloru: C = (I - (1-a)*B) / a  (tylko na krawędziach)
    edge = (a > 0.02) & (a < 0.98)
    aa = np.maximum(a, 1e-3)[..., None]
    clean = (rgb - (1 - aa) * bg) / aa
    rgb = np.where(edge[..., None], np.clip(clean, 0, 1), rgb)
    out = np.dstack([rgb, a])
    img = Image.fromarray((out * 255).round().astype(np.uint8), 'RGBA')
    bbox = Image.fromarray((a > 0.05).astype(np.uint8) * 255).getbbox()
    if bbox:
        pad = 4
        bbox = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0), min(bbox[2] + pad, img.width), min(bbox[3] + pad, img.height))
        img = img.crop(bbox)
    img.thumbnail((max_px, max_px), Image.LANCZOS)
    img.save(dst, 'WEBP', quality=88, method=6)
    return img.size


if __name__ == '__main__':
    model = sys.argv[1]
    ISNET = 'isnet' in model.lower()
    args = sys.argv[2:]
    max_px = 900
    if len(args) % 2 == 1:
        max_px = int(args.pop(-1)) if args[-1].isdigit() else max_px
    sess = load_session(model)
    for i in range(0, len(args), 2):
        size = cutout(sess, args[i], args[i + 1], max_px)
        print(args[i + 1], size)
