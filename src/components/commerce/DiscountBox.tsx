import React, { useState } from 'react';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { formatEur } from '../../config/shipping';
import type { useDiscount } from '../../lib/discount';

type D = ReturnType<typeof useDiscount>;

/** Pole „Kortingscode” – wspólne dla koszyka i kasy. */
export const DiscountBox: React.FC<{ d: D; lang: string }> = ({ d, lang }) => {
  const [input, setInput] = useState('');
  const tr = (nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);

  if (d.applied) {
    return (
      <div className="oct-rise">
        <div className={`flex items-center justify-between gap-2 border px-3 py-2.5 text-xs ${d.belowMin ? 'border-amber-500/40 bg-amber-500/10' : 'border-emerald-700/60 bg-emerald-950/30'}`}>
          <span className={`flex min-w-0 items-center gap-2 font-mono ${d.belowMin ? 'text-amber-200' : 'text-emerald-300'}`}>
            <Check className="h-4 w-4 shrink-0" />
            <span className="truncate">
              <strong>{d.applied.code}</strong> · -{d.applied.percent}%{d.amount > 0 ? ` (-${formatEur(d.amount)})` : ''}
            </span>
          </span>
          <button type="button" onClick={d.remove} aria-label={tr('Code verwijderen', 'Remove code', 'Usuń kod')} className="shrink-0 text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        {d.belowMin && (
          <p className="mt-1.5 text-[11px] text-amber-200">
            {tr(`Geldt vanaf ${formatEur(d.applied.minSubtotal)} aan producten.`, `Applies from ${formatEur(d.applied.minSubtotal)} in products.`, `Działa od ${formatEur(d.applied.minSubtotal)} za produkty.`)}
          </p>
        )}
        {d.applied.firstOrderOnly && !d.belowMin && (
          <p className="mt-1.5 text-[11px] text-neutral-500">{tr('Alleen geldig bij je eerste bestelling.', 'Only valid on your first order.', 'Tylko przy pierwszym zamówieniu.')}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="oct-code" className="mb-1.5 flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-300">
        <Tag className="h-3.5 w-3.5 text-[#D71920]" /> {tr('Kortingscode', 'Discount code', 'Kod rabatowy')}
      </label>
      <form
        className="flex gap-2"
        onSubmit={async e => {
          e.preventDefault();
          if (await d.apply(input)) setInput('');
        }}
      >
        <input
          id="oct-code"
          value={input}
          onChange={e => { setInput(e.target.value); if (d.error) d.setError(''); }}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder={tr('Voer je code in', 'Enter your code', 'Wpisz kod')}
          className="min-w-0 flex-1 border border-neutral-700 bg-[#141414] px-3 py-2.5 font-mono text-xs uppercase text-white placeholder:normal-case placeholder:text-neutral-600 focus:border-[#D71920] focus:outline-none"
        />
        <button
          type="submit"
          disabled={d.busy || !input.trim()}
          className="flex shrink-0 items-center gap-1.5 bg-neutral-800 px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#D71920] disabled:opacity-50"
        >
          {d.busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {tr('Toepassen', 'Apply', 'Zastosuj')}
        </button>
      </form>
      {d.error && <p className="mt-1.5 text-[11px] text-[#ff5a62]">{d.error}</p>}
    </div>
  );
};
