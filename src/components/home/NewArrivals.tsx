import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getArrivals } from '../../data/products';
import { ProductCard } from '../commerce/ProductCard';
import { Reveal, VelocityMarquee } from '../fx/ScrollFx';

/*
 * „Net binnen” – ręcznie wybrane nowości (lista w src/data/newArrivals.ts), pod sekcją dyscyplin.
 * Gdy lista jest pusta, sekcja się nie pokazuje.
 */
export const NewArrivals: React.FC = () => {
  const { language, navigate } = useStore();
  const items = getArrivals(language).slice(0, 4);
  if (!items.length) return null;
  const tr = (nl: string, en: string, pl: string) => (language === 'pl' ? pl : language === 'en' ? en : nl);
  const few = items.length <= 2;

  return (
    <section aria-label={tr('Net binnen', 'Just in', 'Nowości')} className="relative overflow-hidden border-y border-neutral-800/80 bg-[#070707]">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 70% at 80% 40%, rgba(215,25,32,.16), transparent 70%)' }} />
      <VelocityMarquee
        items={[tr('NET BINNEN', 'JUST IN', 'NOWOŚCI'), 'LIMITED EDITION', 'OCTAGON']}
        outline
        className="pointer-events-none absolute inset-x-0 top-6 text-7xl opacity-60 sm:text-9xl"
      />
      <div className={`relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:py-24 ${few ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center' : ''}`}>
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#D71920]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#D71920]">{tr('Net binnen', 'Just in', 'Nowość')}</span>
          </div>
          <h2 className="mt-2 font-bebas text-5xl leading-[0.9] tracking-wide text-white sm:text-7xl">
            {tr('Nieuw in de shop', 'New in the shop', 'Nowość w sklepie')}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
            {tr(
              'De nieuwste drops van Octagon – als eerste hier. Op = op.',
              'The latest Octagon drops – here first. When it’s gone, it’s gone.',
              'Najnowsze dropy Octagon – najpierw tutaj. Do wyczerpania zapasów.'
            )}
          </p>
          <button
            onClick={() => navigate('/nieuw')}
            className="mt-6 inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-condensed text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-[#D71920] hover:text-[#D71920]"
          >
            {tr('Alle nieuwe items', 'All new items', 'Wszystkie nowości')} <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
        <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${few ? '' : 'md:grid-cols-4'}`}>
          {items.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
