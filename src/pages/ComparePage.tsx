import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { getLocalizedProduct } from '../data/products';
import { 
  Scale, 
  X, 
  Plus, 
  ShoppingBag, 
  Check, 
  AlertCircle, 
  Star, 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const {
    comparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    products,
    addToCart,
    navigate,
    language,
    t,
    showToast
  } = useStore();

  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const comparedProducts = useMemo(() => {
    return comparison
      .map(id => products.find(p => p.id === id || p.sku === id))
      .filter((p): p is Product => Boolean(p));
  }, [comparison, products]);

  // Set default sizes for items
  const getSelectedSize = (product: Product) => {
    if (selectedSizes[product.id]) return selectedSizes[product.id];
    return product.sizes[0] || 'Standard';
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product) => {
    const size = getSelectedSize(product);
    const color = product.colors[0]?.name || 'Standard';
    addToCart(product, size, color);
  };

  // Gotowe porównania – pierwsze modele z danej podkategorii
  const firstOf = (sub: string, n: number) => {
    const seen = new Set<string>();
    return products.filter(p => {
      const g = p.variantGroup || p.id;
      if (p.subcategory !== sub || seen.has(g)) return false;
      seen.add(g);
      return true;
    }).slice(0, n).map(p => p.id);
  };
  const presetComparisons = [
    { title: language === 'pl' ? 'Rękawice bokserskie' : language === 'en' ? 'Boxing gloves' : 'Bokshandschoenen', ids: firstOf('bokshandschoenen', 3) },
    { title: language === 'pl' ? 'Ochraniacze piszczeli' : language === 'en' ? 'Shin guards' : 'Scheenbeschermers', ids: firstOf('scheenbeschermers', 3) },
    { title: language === 'pl' ? 'Kaski bokserskie' : language === 'en' ? 'Head guards' : 'Bokshelmen', ids: firstOf('bokshelmen', 3) },
  ];

  const handleLoadPreset = (ids: string[]) => {
    clearComparison();
    ids.forEach(id => addToComparison(id));
  };

  // Filter available products for adding
  const availableToAdd = products.filter(p => !comparison.includes(p.id) && !comparison.includes(p.sku));
  const filteredAvailable = availableToAdd.filter(p => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
      (p.name_pl && p.name_pl.toLowerCase().includes(q)) || 
      p.category.toLowerCase().includes(q) ||
      p.subcategoryLabel.toLowerCase().includes(q);
  });

  // Specs definitions
  const specRows = [
    {
      id: 'price',
      label: language === 'pl' ? 'Cena detaliczna' : 'Prijs (incl. BTW)',
      getValue: (p: Product) => `€${p.price.toFixed(2)}`,
      highlightDiffer: true
    },
    {
      id: 'stock',
      label: language === 'pl' ? 'Stan magazynowy' : 'Voorraadstatus',
      getValue: (p: Product) => p.stock !== undefined && p.stock > 0 ? `Op voorraad (${p.stock} stuks)` : 'Uitverkocht',
      highlightDiffer: false
    },
    {
      id: 'category',
      label: language === 'pl' ? 'Kategoria & Podkategoria' : 'Categorie & Type',
      getValue: (p: Product) => `${p.category.toUpperCase()} · ${p.subcategoryLabel}`,
      highlightDiffer: true
    },
    {
      id: 'discipline',
      label: language === 'pl' ? 'Dyscypliny sportowe' : 'Vechtsport Disciplines',
      getValue: (p: Product) => p.sport.map(s => s.toUpperCase()).join(' · '),
      highlightDiffer: true
    },
    {
      id: 'gender',
      label: language === 'pl' ? 'Dedykowana płeć / krój' : 'Doelgroep & Pasvorm',
      getValue: (p: Product) => p.gender === 'men' ? 'Heren / Unisex' : p.gender === 'women' ? 'Dames' : 'Unisex',
      highlightDiffer: true
    },
    {
      id: 'material',
      label: language === 'pl' ? 'Główny materiał' : 'Hoofdmateriaal & Samenstelling',
      getValue: (p: Product) => p.material || 'Geselecteerde Octagon kwaliteit',
      highlightDiffer: true
    },
    {
      id: 'sizes',
      label: language === 'pl' ? 'Dostępne rozmiary' : 'Beschikbare Maten',
      getValue: (p: Product) => p.sizes.join(', '),
      highlightDiffer: true
    },
    {
      id: 'colors',
      label: language === 'pl' ? 'Warianty kolorystyczne' : 'Kleuruitvoeringen',
      getValue: (p: Product) => p.colors.map(c => c.name).join(', '),
      highlightDiffer: true
    },
    {
      id: 'sku',
      label: language === 'pl' ? 'Kod SKU' : 'Artikelnummer (SKU)',
      getValue: (p: Product) => p.sku || p.id,
      highlightDiffer: true
    }
  ];

  // Technical bullet details row
  const hasTechnicalDetails = comparedProducts.some(p => p.technicalDetails && p.technicalDetails.length > 0);

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] border-b border-neutral-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
              <button onClick={() => navigate('/')} className="hover:text-white cursor-pointer">HOME</button>
              <span>/</span>
              <span className="text-white uppercase font-bold">
                {language === 'pl' ? 'PORÓWNYWARKA SPRZĘTU' : 'SPECIFICATIE VERGELIJKER'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-950/40 border border-red-800/60 rounded flex items-center justify-center text-[#D71920]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
                  {language === 'pl' ? 'PORÓWNAJ PARAMETRY I SPECYFIKACJE' : 'VERGELIJK FIGHT GEAR SPECIFICATIES'}
                </h1>
                <p className="text-xs text-neutral-400 font-mono">
                  {language === 'pl'
                    ? 'Szczegółowe porównanie parametrów technicznych, materiałów i certyfikacji obok siebie'
                    : 'Zet technische eigenschappen, schuimdichtheid, pasvorm en materialen direct naast elkaar'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle show only differences */}
            {comparedProducts.length >= 2 && (
              <button
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                className={`px-3 py-2 text-xs font-condensed font-bold uppercase tracking-wider border flex items-center gap-2 transition-colors cursor-pointer ${
                  showOnlyDifferences
                    ? 'bg-[#D71920] border-[#D71920] text-white'
                    : 'bg-[#141414] border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {showOnlyDifferences
                    ? (language === 'pl' ? 'Pokaż wszystkie wiersze' : 'Alle specificaties tonen')
                    : (language === 'pl' ? 'Tylko różnice' : 'Alleen verschillen tonen')}
                </span>
              </button>
            )}

            {comparison.length > 0 && (
              <button
                onClick={() => clearComparison()}
                className="px-3 py-2 bg-[#141414] hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white text-xs font-condensed font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'pl' ? 'Wyczyść listę' : 'Wissen'}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/category/fight-gear')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-condensed font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'pl' ? 'Wróć do sklepu' : 'Naar webshop'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {comparedProducts.length === 0 ? (
          /* Empty Comparison State with Presets */
          <div className="bg-[#0C0C0C] border border-neutral-800 p-8 sm:p-14 text-center space-y-6">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Scale className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
                {language === 'pl' ? 'BRAK WYBRANYCH PRODUKTÓW DO PORÓWNANIA' : 'GEEN ARTIKELEN GESELECTEERD'}
              </h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2 font-mono leading-relaxed">
                {language === 'pl'
                  ? 'Kliknij ikonę wagi/porównania na karcie produktu w sklepie lub wybierz jeden z poniższych gotowych zestawów, aby natychmiast zobaczyć porównanie specyfikacji.'
                  : 'Klik op het weegschaal/vergelijkings-icoon bij elk product in de webshop, of kies direct een populaire vergelijking hieronder:'}
              </p>
            </div>

            {/* Popular Presets */}
            <div className="pt-4 max-w-xl mx-auto space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-[#D71920] font-bold">
                {language === 'pl' ? 'Szybkie gotowe porównania sprzętu:' : 'Directe vergelijkingssets:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {presetComparisons.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadPreset(preset.ids)}
                    className="p-3 bg-[#141414] hover:bg-neutral-800 border border-neutral-700 text-left text-xs text-neutral-200 hover:text-white transition-all cursor-pointer group"
                  >
                    <span className="font-condensed font-bold uppercase block group-hover:text-[#D71920]">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                      Klik om te vergelijken →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/category/fight-gear')}
                className="px-6 py-3.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest cursor-pointer inline-flex items-center gap-2"
              >
                <span>{language === 'pl' ? 'Przeglądaj katalog produktów' : 'Bekijk alle producten'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Side-by-Side Comparison Matrix */
          <div className="space-y-6">
            {/* Top Toolbar Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111111] border border-neutral-800 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-[#D71920] font-bold">
                  {comparedProducts.length} {language === 'pl' ? 'produktów w porównaniu' : 'artikelen in vergelijking'}
                </span>
                <span>(max 4)</span>
              </div>

              {/* Add More Product Dropdown Trigger */}
              {comparedProducts.length < 4 && (
                <div className="relative">
                  <button
                    onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                    className="px-3 py-1.5 bg-[#181818] hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-condensed font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D71920]" />
                    <span>{language === 'pl' ? 'Dodaj kolejny produkt' : 'Voeg artikel toe'}</span>
                    <ChevronDown className="w-3.5 h-3.5 ml-1 text-neutral-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAddDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-neutral-700 shadow-2xl z-50 p-3 space-y-2 text-left">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder={language === 'pl' ? 'Wyszukaj produkt...' : 'Zoek artikel om toe te voegen...'}
                        className="w-full bg-[#181818] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920] font-mono"
                        autoFocus
                      />
                      <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800">
                        {filteredAvailable.slice(0, 8).map(p => {
                          const loc = getLocalizedProduct(p, language);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                addToComparison(p.id);
                                setIsAddDropdownOpen(false);
                                setSearchFilter('');
                              }}
                              className="p-2 flex items-center gap-2.5 hover:bg-neutral-800 cursor-pointer transition-colors"
                            >
                              <img src={p.images[0]} alt={loc.name} className="w-9 h-11 object-contain bg-white shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-condensed font-bold text-xs text-white truncate">{loc.name}</p>
                                <p className="font-mono text-[10px] text-[#D71920]">€{p.price.toFixed(2)} · {p.subcategoryLabel}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-neutral-800 bg-[#0B0B0B]">
              <table className="w-full border-collapse text-left text-xs font-mono">
                {/* 1. Header Row with Sticky Product Cards */}
                <thead>
                  <tr className="border-b border-neutral-800 bg-[#0F0F0F]">
                    <th className="p-4 sm:p-5 w-48 sm:w-60 min-w-[160px] text-neutral-400 font-mono text-xs uppercase tracking-wider align-top bg-[#0A0A0A]">
                      <span className="font-bebas text-xl text-white block">OCTAGON MATRIX</span>
                      <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                        Zij-aan-zij vergelijking
                      </span>
                    </th>
                    {comparedProducts.map(product => {
                      const loc = getLocalizedProduct(product, language);
                      const activeSize = getSelectedSize(product);
                      return (
                        <th 
                          key={product.id}
                          className="p-4 sm:p-6 min-w-[240px] max-w-[320px] align-top border-l border-neutral-800 bg-[#0E0E0E]"
                        >
                          <div className="space-y-3">
                            {/* Card Top: Remove button */}
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                                SKU: {product.sku || product.id}
                              </span>
                              <button
                                onClick={() => removeFromComparison(product.id)}
                                className="p-1 text-neutral-400 hover:text-[#D71920] hover:bg-neutral-800 transition-colors cursor-pointer"
                                title="Verwijderen uit vergelijking"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Image */}
                            <div 
                              onClick={() => navigate(`/product/${product.slug}`)}
                              className="w-full aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer hover:border-neutral-600 transition-colors relative"
                            >
                              <img
                                src={product.images[0]}
                                alt={loc.name}
                                className="w-full h-full object-contain bg-white"
                              />
                              {product.badges.length > 0 && (
                                <span className="absolute top-2 left-2 text-[10px] font-condensed font-bold uppercase tracking-wider px-2 py-0.5 bg-[#D71920] text-white">
                                  {product.badges[0].label}
                                </span>
                              )}
                            </div>

                            {/* Name & Brand */}
                            <div>
                              <span className="text-[10px] uppercase font-mono text-neutral-400">
                                {product.brand} · {product.subcategoryLabel}
                              </span>
                              <h3 
                                onClick={() => navigate(`/product/${product.slug}`)}
                                className="font-condensed font-bold text-base text-white hover:text-[#D71920] cursor-pointer transition-colors line-clamp-2 mt-0.5"
                              >
                                {loc.name}
                              </h3>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-2xl font-black text-[#D71920] tabular-nums">
                                €{product.price.toFixed(2)}
                              </span>
                              {product.compareAtPrice && (
                                <span className="font-mono text-xs text-neutral-500 line-through">
                                  €{product.compareAtPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Size selector */}
                            <div>
                              <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                                {language === 'pl' ? 'Wybierz rozmiar:' : 'Kies maat:'}
                              </label>
                              <select
                                value={activeSize}
                                onChange={e => handleSizeChange(product.id, e.target.value)}
                                className="w-full bg-[#181818] border border-neutral-700 px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#D71920]"
                              >
                                {product.sizes.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            {/* Add to Cart CTA */}
                            <button
                              onClick={() => handleQuickAdd(product)}
                              className="w-full py-2.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-950/20"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{language === 'pl' ? 'Do koszyka' : 'In winkelwagen'}</span>
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* 2. Body Specifications Rows */}
                <tbody className="divide-y divide-neutral-800/80">
                  {specRows.map(row => {
                    const values = comparedProducts.map(p => row.getValue(p));
                    const isDifferent = new Set(values).size > 1;

                    if (showOnlyDifferences && !isDifferent) {
                      return null;
                    }

                    return (
                      <tr 
                        key={row.id} 
                        className={`hover:bg-[#111111] transition-colors ${
                          isDifferent ? 'bg-[#121212]/50' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-neutral-300 bg-[#0A0A0A]/80 border-r border-neutral-800 flex items-center justify-between">
                          <span>{row.label}</span>
                          {isDifferent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Waarden verschillen" />
                          )}
                        </td>
                        {comparedProducts.map((p, idx) => (
                          <td 
                            key={p.id}
                            className={`p-4 border-l border-neutral-800 text-xs ${
                              isDifferent ? 'text-white font-bold' : 'text-neutral-300'
                            }`}
                          >
                            {row.getValue(p)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* 3. Detailed Technical Bullets Row */}
                  {hasTechnicalDetails && (
                    <tr className="hover:bg-[#111111] transition-colors bg-[#0D0D0D]">
                      <td className="p-4 font-bold text-neutral-300 bg-[#0A0A0A]/80 border-r border-neutral-800 align-top">
                        <span className="block">{language === 'pl' ? 'Specyfikacja Techniczna' : 'Technische Eigenschappen'}</span>
                        <span className="text-[10px] text-neutral-500 font-normal block mt-1">
                          Kerntechnologie & constructie
                        </span>
                      </td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="p-4 border-l border-neutral-800 align-top">
                          {p.technicalDetails && p.technicalDetails.length > 0 ? (
                            <ul className="space-y-1.5 text-[11px] text-neutral-300">
                              {p.technicalDetails.map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#D71920] font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-neutral-500 italic text-[11px]">
                              {language === 'pl' ? 'Standardowa specyfikacja Octagon' : 'Standaard fabricagespecificatie'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* 4. Bottom Purchase Action Row */}
                  <tr className="bg-[#0F0F0F] border-t-2 border-neutral-800">
                    <td className="p-4 font-bold text-neutral-400 bg-[#0A0A0A] border-r border-neutral-800">
                      <span>{language === 'pl' ? 'Bezpośredni zakup' : 'Direct Bestellen'}</span>
                    </td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-4 border-l border-neutral-800">
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className="w-full py-2.5 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{language === 'pl' ? 'Kup teraz' : 'Bestel direct'}</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="p-6 bg-[#0B0B0B] border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>100% Origineel Octagon Fightwear (Officieel contract Polen)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>14 dagen bedenktijd</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Snelle PostNL verzending vanuit centraal Benelux magazijn</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
