import React from 'react';
import { useStore } from '../context/StoreContext';
import { LEGAL_DOCS, LegalDoc, LegalLang } from '../data/legal';

const UI = {
  updated: { nl: 'Laatst bijgewerkt', en: 'Last updated', pl: 'Ostatnia aktualizacja' },
  print: { nl: 'Printen / opslaan als pdf', en: 'Print / save as PDF', pl: 'Drukuj / zapisz jako PDF' },
  eyebrow: { nl: 'Klantenservice & juridisch', en: 'Customer service & legal', pl: 'Obsługa klienta i informacje prawne' },
};

export const LegalPage: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  const { language, navigate } = useStore();
  const lang = (language === 'pl' || language === 'en' ? language : 'nl') as LegalLang;

  React.useEffect(() => {
    document.title = `${doc.title[lang]} | OctagonSportNL`;
    window.scrollTo(0, 0);
  }, [doc.slug, lang]);

  return (
    <div className="bg-[#050505] text-white">
      <div className="border-b border-neutral-800 bg-[#080808]">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D71920]">{UI.eyebrow[lang]}</p>
          <h1 className="mt-2 font-bebas text-5xl tracking-wide sm:text-6xl">{doc.title[lang]}</h1>
          <p className="mt-2 text-xs font-mono text-neutral-500">
            {UI.updated[lang]}: {doc.updated}
          </p>
          {/* zakładki między dokumentami */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Juridische pagina's">
            {LEGAL_DOCS.map(d => (
              <button
                key={d.slug}
                onClick={() => navigate(d.paths[0])}
                className={`px-3 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider border transition-colors ${
                  d.slug === doc.slug ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 text-neutral-300 hover:border-neutral-500 hover:text-white'
                }`}
              >
                {d.title[lang]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-5 text-sm leading-relaxed text-neutral-300 sm:text-[15px]">
          {doc.body[lang].map((b, i) => {
            if (b.t === 'h') return <h2 key={i} className="pt-4 font-bebas text-2xl tracking-wide text-white sm:text-3xl">{b.text}</h2>;
            if (b.t === 'p') return <p key={i}>{b.text}</p>;
            if (b.t === 'ul')
              return (
                <ul key={i} className="space-y-2">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#D71920]" aria-hidden="true" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              );
            return (
              <div key={i} className="border border-neutral-800 bg-[#0C0C0C] p-4 sm:p-5">
                <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#D71920]">{b.title}</p>
                <div className="space-y-1 font-mono text-[13px] text-neutral-200">
                  {b.lines.map((l, j) => (
                    <p key={j} className="break-words">{l}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => window.print()}
          className="mt-10 border border-neutral-700 px-5 py-3 text-[11px] font-condensed font-bold uppercase tracking-widest text-white transition-colors hover:border-white print:hidden"
        >
          {UI.print[lang]}
        </button>
      </article>
    </div>
  );
};
