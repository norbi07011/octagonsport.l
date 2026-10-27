import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Lock, MapPin, Package, Phone, Printer, RefreshCw, Search, Truck, Undo2, Mail } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { BRAND_MARK } from '../components/layout/BrandMark';

/*
 * Prywatny panel zamówień – /beheer (po polsku, dla właściciela sklepu).
 * Wygodny na telefonie jak aplikacja Shopify: lista zamówień z miniaturami produktów,
 * szczegóły z dużymi zdjęciami, rozmiarem, kolorem i SKU, adres do skopiowania, telefon/WhatsApp,
 * „Oznacz jako wysłane” z numerem Track & Trace (+ mail do klienta).
 * Dane: /api/admin-orders (Mollie). Hasło: zmienna ADMIN_PASSWORD w Netlify.
 * Wskazówka: w telefonie „Dodaj do ekranu głównego” – panel otwiera się jak aplikacja.
 */

interface Item { productId: string; name: string; image: string; url: string; sku: string; size: string; color: string; qty: number; unit: number; total: number }
interface Order {
  id: string; order: string; status: string; method: string; mode: string; createdAt: string; paidAt: string | null;
  amount: number; refunded: number; shippingFee: number; discount: number; code: string; codePartner?: string; delivery: 'home' | 'pickup'; notes: string; kvk: string; vat: string; lang: string;
  shippedAt: string | null; tracking: string;
  customer: { name: string; company: string; street: string; postalCode: string; city: string; country: string; email: string; phone: string };
  items: Item[];
}
type Tab = 'todo' | 'shipped' | 'all' | 'codes';
interface CodeDef { code: string; percent: number; minSubtotal: number; firstOrderOnly: boolean; active: boolean; partner: string }

const KEY = 'oct-admin-key';
const SEEN = 'oct-admin-seen';
const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const isPaid = (o: Order) => o.status === 'paid' || o.status === 'authorized';
const isRefunded = (o: Order) => o.refunded > 0 && o.refunded >= o.amount;
const readLS = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const writeLS = (k: string, v: string) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} };

const ago = (iso: string) => {
  const d = (Date.now() - Date.parse(iso)) / 60000;
  if (d < 1) return 'przed chwilą';
  if (d < 60) return `${Math.round(d)} min temu`;
  if (d < 60 * 24) return `${Math.round(d / 60)} godz. temu`;
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Zdjęcie: najpierw z katalogu sklepu (działa też w podglądzie), potem z serwera. */
const photoOf = (i: Item) => {
  const p = PRODUCTS.find(x => x.id === i.productId) || PRODUCTS.find(x => x.sku === i.sku);
  const local = p?.images.find(im => !/tabel|size|chart/i.test(im)) || p?.images[0];
  return local || i.image;
};

const STATUS: Record<string, [string, string]> = {
  paid: ['Opłacone', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'],
  authorized: ['Autoryzowane', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'],
  open: ['Nieopłacone', 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30'],
  pending: ['W toku', 'bg-amber-500/15 text-amber-300 border-amber-500/30'],
  canceled: ['Anulowane', 'bg-neutral-500/15 text-neutral-400 border-neutral-600/30'],
  expired: ['Wygasłe', 'bg-neutral-500/15 text-neutral-400 border-neutral-600/30'],
  failed: ['Nieudane', 'bg-red-500/15 text-red-300 border-red-500/30'],
};

const Badge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${className}`}>{children}</span>
);

const Badges: React.FC<{ o: Order }> = ({ o }) => {
  const [label, cls] = STATUS[o.status] || [o.status, 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30'];
  return (
    <div className="flex flex-wrap gap-1.5">
      {isPaid(o) && !isRefunded(o) && (o.shippedAt
        ? <Badge className="border-sky-500/30 bg-sky-500/15 text-sky-300"><Truck className="h-3 w-3" /> Wysłane</Badge>
        : <Badge className="border-amber-400/40 bg-amber-400/20 text-amber-200"><Package className="h-3 w-3" /> Do wysłania</Badge>)}
      {isRefunded(o) ? <Badge className="border-red-500/30 bg-red-500/15 text-red-300">Zwrócone</Badge> : <Badge className={cls}>{label}</Badge>}
      {o.code && <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">{o.code}{o.codePartner ? ` · ${o.codePartner}` : ''}</Badge>}
      {o.mode === 'test' && <Badge className="border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300">TEST</Badge>}
    </div>
  );
};

const Thumbs: React.FC<{ items: Item[] }> = ({ items }) => (
  <div className="flex shrink-0 -space-x-3">
    {items.slice(0, 3).map((i, k) => (
      <div key={k} className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-[#111] bg-white" style={{ zIndex: 3 - k }}>
        <img src={photoOf(i)} alt="" className="h-full w-full object-contain" loading="lazy" />
        {i.qty > 1 && <span className="absolute bottom-0 right-0 rounded-tl bg-black/80 px-1 text-[10px] font-bold text-white">×{i.qty}</span>}
      </div>
    ))}
    {items.length > 3 && <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[#111] bg-neutral-800 text-xs font-bold text-white">+{items.length - 3}</div>}
  </div>
);

export const AdminOrdersPage: React.FC = () => {
  const [key, setKey] = useState(readLS(KEY));
  const [input, setInput] = useState('');
  const [remember, setRemember] = useState(true);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [codeDefs, setCodeDefs] = useState<CodeDef[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('todo');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(() => (typeof location !== 'undefined' ? location.hash.replace('#', '') : ''));
  const [toast, setToast] = useState('');
  const seen = useRef<Set<string>>(new Set(readLS(SEEN).split(',').filter(Boolean)));
  const first = useRef(true);

  useEffect(() => {
    document.title = 'Zamówienia · OctagonSportNL';
    let m = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
    m.content = 'noindex, nofollow';
  }, []);

  const flash = (t: string) => { setToast(t); window.setTimeout(() => setToast(''), 2200); };

  const load = useCallback(async (k = key) => {
    if (!k) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/admin-orders', { headers: { 'x-admin-key': k } });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { setError('Złe hasło.'); setKey(''); writeLS(KEY, ''); return; }
      if (d.error === 'no-password') { setError('W Netlify brakuje zmiennej ADMIN_PASSWORD (min. 8 znaków).'); return; }
      if (d.error === 'no-mollie') { setError('W Netlify brakuje zmiennej MOLLIE_API_KEY.'); return; }
      if (!r.ok) { setError(`Błąd serwera (${r.status}). ${d.detail || ''}`); return; }
      const list: Order[] = d.orders || [];
      // nowe opłacone zamówienia → powiadomienie + wibracja
      const fresh = list.filter(o => isPaid(o) && !seen.current.has(o.id));
      if (!first.current && fresh.length) {
        try { navigator.vibrate?.([80, 60, 120]); } catch {}
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            const o = fresh[0];
            new Notification(`Nowe zamówienie ${o.order} – ${eur(o.amount)}`, { body: o.items.map(i => `${i.qty}× ${i.name}${i.size ? ` (${i.size})` : ''}`).join('\n'), icon: photoOf(o.items[0]) || BRAND_MARK });
          }
        } catch {}
      }
      list.filter(isPaid).forEach(o => seen.current.add(o.id));
      writeLS(SEEN, [...seen.current].slice(-300).join(','));
      first.current = false;
      setOrders(list);
      setCodeDefs(d.codes || []);
    } catch {
      setError('Brak połączenia z serwerem. Panel działa tylko na stronie z Netlify.');
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { if (key) load(key); }, [key]);
  useEffect(() => {
    if (!key) return;
    const t = window.setInterval(() => load(), 60000);
    const vis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', vis);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', vis); };
  }, [key, load]);
  useEffect(() => {
    const on = () => setOpenId(location.hash.replace('#', ''));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const open = (id: string) => { history.pushState(null, '', `#${id}`); setOpenId(id); window.scrollTo(0, 0); };
  const close = () => { history.pushState(null, '', location.pathname + location.search); setOpenId(''); };

  const counts = useMemo(() => {
    const l = orders || [];
    return {
      todo: l.filter(o => isPaid(o) && !o.shippedAt && !isRefunded(o)).length,
      shipped: l.filter(o => isPaid(o) && !!o.shippedAt).length,
      all: l.length,
      codes: new Set(l.filter(o => o.code && isPaid(o)).map(o => o.code)).size,
    };
  }, [orders]);

  const shown = useMemo(() => {
    const l = (orders || []).filter(o =>
      tab === 'todo' ? isPaid(o) && !o.shippedAt && !isRefunded(o) : tab === 'shipped' ? isPaid(o) && !!o.shippedAt : true
    );
    const s = q.trim().toLowerCase();
    return s ? l.filter(o => [o.order, o.customer.name, o.customer.city, o.customer.email, ...o.items.map(i => i.name)].join(' ').toLowerCase().includes(s)) : l;
  }, [orders, tab, q]);

  const current = orders?.find(o => o.id === openId);

  // ---------- logowanie ----------
  if (!key) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#050505] px-5 text-white">
        <form
          className="w-full max-w-sm space-y-5"
          onSubmit={ev => {
            ev.preventDefault();
            const v = input.trim();
            if (!v) return;
            if (remember) writeLS(KEY, v);
            setKey(v);
          }}
        >
          <div className="flex items-center gap-3">
            <img src={BRAND_MARK} alt="" className="h-10 w-10" />
            <div>
              <p className="font-bebas text-3xl leading-none tracking-wide">Zamówienia</p>
              <p className="text-xs text-neutral-500">OctagonSportNL · panel właściciela</p>
            </div>
          </div>
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-400"><Lock className="h-3.5 w-3.5" /> Hasło</span>
            <input type="password" autoComplete="current-password" value={input} onChange={ev => setInput(ev.target.value)} className="w-full rounded-lg border border-neutral-700 bg-[#111] px-4 py-3.5 text-base outline-none focus:border-[#D71920]" />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={remember} onChange={ev => setRemember(ev.target.checked)} className="h-4 w-4 accent-[#D71920]" /> Zapamiętaj na tym telefonie
          </label>
          <button className="w-full rounded-lg bg-[#D71920] py-3.5 font-semibold uppercase tracking-widest">Zaloguj</button>
        </form>
      </div>
    );
  }

  // ---------- szczegóły zamówienia ----------
  if (current) return <OrderDetail o={current} adminKey={key} onBack={close} onChanged={o => setOrders(l => (l || []).map(x => (x.id === o.id ? o : x)))} flash={flash} toast={toast} />;

  // ---------- lista ----------
  return (
    <div className="min-h-[100svh] bg-[#050505] pb-10 text-white">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#050505]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-4 pb-3">
          <img src={BRAND_MARK} alt="" className="h-8 w-8" />
          <h1 className="font-bebas text-3xl leading-none tracking-wide">Zamówienia</h1>
          <div className="ml-auto flex items-center gap-2">
            {'Notification' in window && Notification.permission === 'default' && (
              <button onClick={() => Notification.requestPermission().then(() => flash('Powiadomienia ustawione'))} className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs">🔔 Powiadomienia</button>
            )}
            <button onClick={() => load()} aria-label="Odśwież" className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3">
          {([['todo', 'Do wysłania'], ['shipped', 'Wysłane'], ['all', 'Wszystkie'], ['codes', 'Kody']] as [Tab, string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-white text-black' : 'border border-neutral-700 text-neutral-300'}`}>
              {l} <span className={tab === t ? 'text-neutral-500' : 'text-neutral-500'}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className={`mx-auto max-w-3xl px-4 pb-3 ${tab === 'codes' ? 'hidden' : ''}`}>
          <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-[#0d0d0d] px-3">
            <Search className="h-4 w-4 text-neutral-500" />
            <input value={q} onChange={ev => setQ(ev.target.value)} placeholder="Szukaj: numer, klient, produkt…" className="w-full bg-transparent py-2.5 text-sm outline-none" />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-3">
        {error && <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        {!orders && !error && <p className="py-16 text-center text-neutral-500">Ładowanie zamówień…</p>}
        {orders && tab === 'codes' && <CodesView orders={orders} defs={codeDefs} onOpen={open} />}
        {orders && tab !== 'codes' && !shown.length && <p className="py-16 text-center text-neutral-500">{tab === 'todo' ? 'Wszystko wysłane 💪' : 'Brak zamówień.'}</p>}
        <ul className={`space-y-2.5 ${tab === 'codes' ? 'hidden' : ''}`}>
          {shown.map(o => (
            <li key={o.id}>
              <button onClick={() => open(o.id)} className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-[#0d0d0d] p-3 text-left active:bg-[#151515]">
                {o.items.length ? <Thumbs items={o.items} /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-900"><Package className="h-5 w-5 text-neutral-600" /></div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{o.order}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{eur(o.amount)}</span>
                  </div>
                  <p className="truncate text-sm text-neutral-400">{o.customer.name || '—'}{o.customer.city ? ` · ${o.customer.city}` : ''}</p>
                  <p className="truncate text-xs text-neutral-500">{o.items.map(i => `${i.qty}× ${i.name}${i.size ? ` (${i.size})` : ''}`).join(', ')}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <Badges o={o} />
                    <span className="shrink-0 text-[11px] text-neutral-500">{ago(o.paidAt || o.createdAt)}</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
      {toast && <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-black shadow-2xl">{toast}</div>}
    </div>
  );
};

const OrderDetail: React.FC<{ o: Order; adminKey: string; onBack: () => void; onChanged: (o: Order) => void; flash: (t: string) => void; toast: string }> = ({ o, adminKey, onBack, onChanged, flash, toast }) => {
  const [tracking, setTracking] = useState(o.tracking);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const c = o.customer;
  const addressText = [c.company, c.name, c.street, `${c.postalCode} ${c.city}`, c.country === 'NL' ? 'Nederland' : c.country].filter(Boolean).join('\n');
  const phoneDigits = c.phone.replace(/[^\d]/g, '');
  const subtotal = o.items.reduce((s, i) => s + i.total, 0);

  const copy = async (t: string, label: string) => {
    try { await navigator.clipboard.writeText(t); flash(`${label} skopiowany`); } catch { flash('Nie udało się skopiować'); }
  };

  const act = async (action: 'ship' | 'unship') => {
    setBusy(true);
    try {
      const r = await fetch('/api/admin-orders', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: o.id, action, tracking, notify: action === 'ship' && notify }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { flash(`Błąd: ${d.detail || r.status}`); return; }
      onChanged(d.order);
      flash(action === 'ship' ? (d.mailed ? 'Wysłane ✓ Klient dostał maila' : 'Oznaczone jako wysłane ✓') : 'Cofnięto');
    } catch {
      flash('Brak połączenia');
    } finally {
      setBusy(false);
    }
  };

  const row = 'flex items-center justify-between py-1.5 text-sm';
  return (
    <div className="min-h-[100svh] bg-[#050505] pb-28 text-white">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#050505]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={onBack} aria-label="Wstecz" className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700"><ArrowLeft className="h-4 w-4" /></button>
          <span className="font-semibold">{o.order}</span>
          <button onClick={() => window.print()} aria-label="Drukuj" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700"><Printer className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-4 print:text-black">
        <section>
          <h1 className="font-bebas text-4xl leading-none tracking-wide">{o.order}</h1>
          <p className="mt-1 text-xs text-neutral-500">{new Date(o.paidAt || o.createdAt).toLocaleString('pl-PL')} · {o.method || '—'} · {o.delivery === 'pickup' ? 'Punkt PostNL' : 'Dostawa do domu'}</p>
          <div className="mt-2"><Badges o={o} /></div>
        </section>

        {/* Produkty – duże zdjęcia, rozmiar, kolor, SKU */}
        <section className="rounded-xl border border-neutral-800 bg-[#0d0d0d] p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Do spakowania · {o.items.reduce((s, i) => s + i.qty, 0)} szt.</p>
          <ul className="divide-y divide-neutral-800">
            {o.items.map((i, k) => (
              <li key={k} className="flex gap-3 py-3">
                <a href={i.url || undefined} target="_blank" rel="noreferrer" className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-white">
                  <img src={photoOf(i)} alt={i.name} className="h-full w-full object-contain" />
                </a>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{i.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {i.size && <span className="rounded-md bg-white px-2 py-0.5 text-sm font-bold text-black">{i.size}</span>}
                    {i.color && i.color.toLowerCase() !== 'standard' && <span className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">{i.color}</span>}
                  </div>
                  {i.sku && <p className="mt-1.5 text-xs text-neutral-500">SKU: {i.sku}</p>}
                  <p className="mt-1 text-sm text-neutral-400">{eur(i.unit)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold">× {i.qty}</p>
                  <p className="text-sm text-neutral-400">{eur(i.total)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-neutral-800 px-1 pt-2">
            <div className={`${row} text-neutral-400`}><span>Produkty</span><span>{eur(subtotal)}</span></div>
            {o.discount > 0 && <div className={`${row} text-emerald-300`}><span>Kod rabatowy {o.code}{o.codePartner ? ` (${o.codePartner})` : ''}</span><span>-{eur(o.discount)}</span></div>}
            <div className={`${row} text-neutral-400`}><span>Wysyłka</span><span>{o.shippingFee ? eur(o.shippingFee) : 'gratis'}</span></div>
            <div className={`${row} text-base font-bold`}><span>Zapłacono</span><span>{eur(o.amount)}</span></div>
            {o.refunded > 0 && <div className={`${row} text-red-300`}><span>Zwrócono</span><span>-{eur(o.refunded)}</span></div>}
          </div>
        </section>

        {/* Klient */}
        <section className="rounded-xl border border-neutral-800 bg-[#0d0d0d] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Klient i adres wysyłki</p>
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{addressText}</p>
          {(o.kvk || o.vat) && <p className="mt-2 text-xs text-neutral-400">Firma: KvK {o.kvk || '—'} · BTW {o.vat || '—'}</p>}
          {o.notes && <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">💬 {o.notes}</p>}
          <div className="mt-3 grid grid-cols-2 gap-2 print:hidden">
            <button onClick={() => copy(addressText, 'Adres')} className="flex items-center justify-center gap-2 rounded-lg border border-neutral-700 py-2.5 text-sm"><Copy className="h-4 w-4" /> Kopiuj adres</button>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.street}, ${c.postalCode} ${c.city}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-neutral-700 py-2.5 text-sm"><MapPin className="h-4 w-4" /> Mapa</a>
            {c.phone && <a href={`tel:${c.phone}`} className="flex items-center justify-center gap-2 rounded-lg border border-neutral-700 py-2.5 text-sm"><Phone className="h-4 w-4" /> Zadzwoń</a>}
            {phoneDigits && <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-[#25D366]/50 py-2.5 text-sm text-[#25D366]">WhatsApp</a>}
            {c.email && <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Je bestelling ${o.order}`)}`} className="col-span-2 flex items-center justify-center gap-2 truncate rounded-lg border border-neutral-700 py-2.5 text-sm"><Mail className="h-4 w-4 shrink-0" /> {c.email}</a>}
          </div>
        </section>

        {/* Wysyłka */}
        {isPaid(o) && !isRefunded(o) && (
          <section className="rounded-xl border border-neutral-800 bg-[#0d0d0d] p-4 print:hidden">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Wysyłka</p>
            {o.shippedAt ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm text-sky-300"><Check className="h-4 w-4" /> Wysłane {new Date(o.shippedAt).toLocaleString('pl-PL')}</p>
                {o.tracking && (
                  <a href={`https://jouw.postnl.nl/track-and-trace/${encodeURIComponent(o.tracking)}-NL-${encodeURIComponent(c.postalCode.replace(/\s+/g, ''))}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline">
                    <Truck className="h-4 w-4" /> {o.tracking}
                  </a>
                )}
                <button disabled={busy} onClick={() => act('unship')} className="flex items-center gap-2 text-xs text-neutral-400 underline"><Undo2 className="h-3.5 w-3.5" /> Cofnij „wysłane”</button>
              </div>
            ) : (
              <div className="space-y-3">
                <input value={tracking} onChange={ev => setTracking(ev.target.value.toUpperCase())} placeholder="Numer Track & Trace (opcjonalnie), np. 3SABCD1234567" className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-3 text-sm outline-none focus:border-[#D71920]" />
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" checked={notify} onChange={ev => setNotify(ev.target.checked)} className="h-4 w-4 accent-[#D71920]" /> Wyślij klientowi maila, że paczka jest w drodze
                </label>
              </div>
            )}
          </section>
        )}

        <a href={`https://my.mollie.com/dashboard/payments/${o.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-500 underline print:hidden">
          Otwórz w Mollie (zwroty, szczegóły płatności) <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </main>

      {isPaid(o) && !isRefunded(o) && !o.shippedAt && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-800 bg-[#050505]/95 p-3 backdrop-blur print:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button disabled={busy} onClick={() => act('ship')} className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-xl bg-[#D71920] py-4 font-semibold uppercase tracking-widest disabled:opacity-60">
            <Truck className="h-5 w-5" /> {busy ? 'Zapisywanie…' : 'Oznacz jako wysłane'}
          </button>
        </div>
      )}
      {toast && <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-black shadow-2xl">{toast}</div>}
    </div>
  );
};

/* ---------- Zakładka „Kody”: zestawienie kodów rabatowych per partner ---------- */
type Period = 'month' | 'prev' | 'year' | 'all';
const PERIODS: [Period, string][] = [['month', 'Ten miesiąc'], ['prev', 'Poprzedni miesiąc'], ['year', 'Ten rok'], ['all', 'Wszystko']];

const inPeriod = (iso: string | null, p: Period) => {
  if (!iso) return false;
  if (p === 'all') return true;
  const d = new Date(iso);
  const now = new Date();
  if (p === 'year') return d.getFullYear() === now.getFullYear();
  const ref = p === 'month' ? now : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

const CodesView: React.FC<{ orders: Order[]; defs: CodeDef[]; onOpen: (id: string) => void }> = ({ orders, defs, onOpen }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [openCode, setOpenCode] = useState('');

  const stats = useMemo(() => {
    const used = orders.filter(o => o.code && isPaid(o) && !isRefunded(o) && inPeriod(o.paidAt || o.createdAt, period));
    // wszystkie kody z listy + ewentualne stare kody, które pojawiły się w zamówieniach
    const all: CodeDef[] = [...defs];
    used.forEach(o => { if (!all.some(d => d.code === o.code)) all.push({ code: o.code, percent: 0, minSubtotal: 0, firstOrderOnly: false, active: false, partner: '' }); });
    return all
      .map(d => {
        const list = used.filter(o => o.code === d.code).sort((a, b) => Date.parse(b.paidAt || b.createdAt) - Date.parse(a.paidAt || a.createdAt));
        return {
          def: d,
          list,
          count: list.length,
          revenue: list.reduce((s, o) => s + o.amount - o.refunded, 0),
          discount: list.reduce((s, o) => s + o.discount, 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue || Number(b.def.active) - Number(a.def.active));
  }, [orders, defs, period]);

  const sum = stats.reduce((s, x) => ({ count: s.count + x.count, revenue: s.revenue + x.revenue, discount: s.discount + x.discount }), { count: 0, revenue: 0, discount: 0 });
  const totalPaid = orders.filter(o => isPaid(o) && !isRefunded(o) && inPeriod(o.paidAt || o.createdAt, period)).length;

  return (
    <div className="space-y-3 pb-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map(([p, l]) => (
          <button key={p} onClick={() => setPeriod(p)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${period === p ? 'bg-[#D71920] text-white' : 'border border-neutral-700 text-neutral-300'}`}>{l}</button>
        ))}
      </div>

      {/* Podsumowanie */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-neutral-800 bg-[#0d0d0d] p-3 text-center">
        <div><p className="text-2xl font-bold">{sum.count}</p><p className="text-[11px] text-neutral-500">zamówień z kodem{totalPaid ? ` (z ${totalPaid})` : ''}</p></div>
        <div><p className="text-2xl font-bold">{eur(sum.revenue)}</p><p className="text-[11px] text-neutral-500">obrót z kodów</p></div>
        <div><p className="text-2xl font-bold text-emerald-300">{eur(sum.discount)}</p><p className="text-[11px] text-neutral-500">rabatów dla klientów</p></div>
      </div>

      {/* Kody / partnerzy */}
      {stats.map(({ def, list, count, revenue, discount }) => {
        const open = openCode === def.code;
        return (
          <div key={def.code} className={`rounded-xl border bg-[#0d0d0d] ${count ? 'border-neutral-700' : 'border-neutral-800'}`}>
            <button onClick={() => setOpenCode(open ? '' : def.code)} className="w-full p-3.5 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{def.partner || <span className="text-neutral-500">(partner nieprzypisany)</span>}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">{def.code}</span>
                    {def.percent > 0 && <span className="text-[11px] text-neutral-400">-{def.percent}%{def.minSubtotal ? ` · od ${eur(def.minSubtotal)}` : ''}{def.firstOrderOnly ? ' · tylko 1. zamówienie' : ''}</span>}
                    {!def.active && <span className="rounded-md border border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-500">nieaktywny</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold leading-none">{count}</p>
                  <p className="text-[10px] text-neutral-500">zamówień</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-black/40 px-3 py-2"><p className="text-[10px] uppercase tracking-wider text-neutral-500">Obrót (zapłacone)</p><p className="font-semibold">{eur(revenue)}</p></div>
                <div className="rounded-lg bg-black/40 px-3 py-2"><p className="text-[10px] uppercase tracking-wider text-neutral-500">Rabat udzielony</p><p className="font-semibold text-emerald-300">{eur(discount)}</p></div>
              </div>
            </button>
            {open && (
              <ul className="divide-y divide-neutral-800 border-t border-neutral-800">
                {list.length === 0 && <li className="px-3.5 py-3 text-sm text-neutral-500">Brak zamówień z tym kodem w tym okresie.</li>}
                {list.map(o => (
                  <li key={o.id}>
                    <button onClick={() => onOpen(o.id)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-[#151515]">
                      {o.items[0] && <img src={photoOf(o.items[0])} alt="" className="h-10 w-10 shrink-0 rounded bg-white object-contain" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{o.order} · {o.customer.name}</p>
                        <p className="text-[11px] text-neutral-500">{new Date(o.paidAt || o.createdAt).toLocaleDateString('pl-PL')} · rabat -{eur(o.discount)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{eur(o.amount - o.refunded)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <p className="px-1 text-[11px] leading-relaxed text-neutral-600">Liczone tylko opłacone i niezwrócone zamówienia. Obrót = kwota zapłacona przez klienta (z wysyłką, po rabacie). Nowe kody i partnerów dopisuje się w pliku server/discounts.ts.</p>
    </div>
  );
};
