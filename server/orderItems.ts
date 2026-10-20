// Pozycje zamówienia ze zdjęciami – wspólne dla panelu /beheer i maili.
// Źródła: pozycje płatności w Mollie (lines) + skrót koszyka w metadanych (`i`), dopasowane do katalogu sklepu.
import { COMPANY, COMPANY_ADDRESS_LINE } from '../src/config/company';
import { PRODUCTS } from '../src/data/products';
import { escapeHtml as e } from './shared';

export interface OrderItem {
  productId: string;
  name: string;
  image: string; // pełny adres zdjęcia
  url: string;
  sku: string;
  size: string;
  color: string;
  qty: number;
  unit: number;
  total: number;
}

const abs = (site: string, path?: string) => (!path ? '' : path.startsWith('http') ? path : `${site}${path.startsWith('/') ? '' : '/'}${path}`);
const firstPhoto = (images: string[] = []) => images.find(i => !/tabel|size|chart/i.test(i)) || images[0] || '';

/** Skrót koszyka do metadanych płatności: "oct-6035|S|Black|1;…" (Mollie: metadane max 1 KB). */
export const packItems = (cart: { id: string; size?: string; color?: string; qty: number }[]) => {
  const clean = (v = '') => v.replace(/[|;]/g, ' ').slice(0, 30);
  let out = '';
  for (const c of cart) {
    const part = `${c.id}|${clean(c.size)}|${clean(c.color)}|${c.qty}`;
    if ((out + ';' + part).length > 700) break;
    out = out ? `${out};${part}` : part;
  }
  return out;
};

export const linesToItems = (lines: any[] = [], packed: string | undefined, site: string): OrderItem[] => {
  const physical = (lines || []).filter(l => l.type !== 'shipping_fee' && l.type !== 'discount');
  if (packed) {
    return packed.split(';').filter(Boolean).map((row, idx) => {
      const [id, size = '', color = '', q = '1'] = row.split('|');
      const product = PRODUCTS.find(p => p.id === id);
      const line = physical[idx];
      const qty = Number(q) || line?.quantity || 1;
      const unit = Number(line?.unitPrice?.value ?? product?.price ?? 0);
      return {
        productId: id,
        name: product?.name || line?.description || id,
        image: line?.imageUrl || abs(site, firstPhoto(product?.images)),
        url: line?.productUrl || (product ? `${site}/product/${product.slug}` : ''),
        sku: product?.sku || line?.sku || '',
        size, color, qty, unit,
        total: Number(line?.totalAmount?.value ?? unit * qty),
      };
    });
  }
  return physical.map(l => {
    const product = PRODUCTS.find(p => p.sku === l.sku);
    const m = String(l.description || '').match(/\(([^)]*)\)\s*$/);
    const [size = '', color = ''] = m ? m[1].split(',').map((s: string) => s.trim()) : [];
    return {
      productId: product?.id || '',
      name: product?.name || String(l.description || '').replace(/\s*\([^)]*\)\s*$/, ''),
      image: l.imageUrl || abs(site, firstPhoto(product?.images)),
      url: l.productUrl || (product ? `${site}/product/${product.slug}` : ''),
      sku: l.sku || '',
      size, color,
      qty: l.quantity || 1,
      unit: Number(l.unitPrice?.value || 0),
      total: Number(l.totalAmount?.value || 0),
    };
  });
};

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;

/** Wiersze tabeli w mailu: zdjęcie, nazwa, rozmiar/kolor, SKU, ilość, cena. */
export const itemRowsHtml = (items: OrderItem[]) =>
  items
    .map(
      i => `<tr>
<td style="padding:10px 12px 10px 0;border-bottom:1px solid #eee;width:76px;vertical-align:top">${i.image ? `<a href="${e(i.url)}"><img src="${e(i.image)}" width="72" height="90" alt="" style="display:block;width:72px;height:90px;object-fit:contain;background:#fff;border:1px solid #eee;border-radius:6px"></a>` : ''}</td>
<td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top">
<div style="font-weight:bold;font-size:14px;line-height:1.3">${e(i.name)}</div>
${i.size || i.color ? `<div style="margin-top:4px">${i.size ? `<span style="display:inline-block;background:#111;color:#fff;font-weight:bold;font-size:13px;padding:2px 8px;border-radius:4px;margin-right:4px">${e(i.size)}</span>` : ''}${i.color ? `<span style="font-size:12px;color:#555">${e(i.color)}</span>` : ''}</div>` : ''}
${i.sku ? `<div style="font-size:11px;color:#888;margin-top:4px">SKU: ${e(i.sku)}</div>` : ''}
</td>
<td style="padding:10px 0 10px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;vertical-align:top;font-size:14px"><strong>× ${i.qty}</strong><br>${eur(i.total)}</td>
</tr>`
    )
    .join('');

export const emailLayout = (inner: string) => `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111">
<div style="max-width:560px;margin:0 auto;background:#fff">
<div style="background:#050505;color:#fff;padding:18px 24px;font-size:20px;letter-spacing:2px;font-weight:bold">OCTAGON <span style="color:#D71920;font-size:12px">SPORT NL</span></div>
<div style="padding:24px;font-size:14px;line-height:1.6">${inner}</div>
<div style="padding:16px 24px;background:#fafafa;color:#777;font-size:11px;line-height:1.5">${e(COMPANY.name)} · ${e(COMPANY_ADDRESS_LINE)} · KvK ${e(COMPANY.kvk)} · BTW ${e(COMPANY.btw)}<br>${e(COMPANY.email)} · ${e(COMPANY.phone)} · ${e(COMPANY.website)}</div>
</div></body></html>`;
