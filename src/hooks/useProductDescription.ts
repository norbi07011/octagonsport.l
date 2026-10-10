import { useEffect, useState } from 'react';
import { Language } from '../types';

// Opisy produktów są w osobnych plikach (public/data/desc-{lang}.json),
// żeby nie spowalniać pierwszego ładowania sklepu.
const cache: Partial<Record<Language, Promise<Record<string, string>>>> = {};

const load = (lang: Language) => {
  if (!cache[lang]) {
    cache[lang] = fetch(`/data/desc-${lang}.json`)
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => {
        delete cache[lang];
        return {};
      });
  }
  return cache[lang]!;
};

export const useProductDescription = (descKey: string | undefined, lang: Language) => {
  const [html, setHtml] = useState<string>('');
  useEffect(() => {
    let alive = true;
    setHtml('');
    if (!descKey) return;
    load(lang).then(map => {
      if (alive) setHtml(map[descKey] || '');
    });
    return () => {
      alive = false;
    };
  }, [descKey, lang]);
  return html;
};
