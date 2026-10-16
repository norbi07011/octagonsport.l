import { KidsFighterSelect } from '../components/showcase/KidsFighterSelect';
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, getLocalizedProduct, productInCategory, getSubcategoriesFor } from '../data/products';
import { ProductGrid } from '../components/commerce/ProductGrid';
import { Filter, X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { ProductCategory, SportDiscipline } from '../types';

interface CategoryPageProps {
  categoryName?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryName }) => {
  const { currentPath, language, t, products: storeProducts } = useStore();
  const activeProducts = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
  
  // Extract path and query params
  const [pathname, searchStr] = currentPath.split('?');
  const params = new URLSearchParams(searchStr || '');
  const subParam = params.get('sub');
  const sportParam = params.get('sport');

  // Determine current active category from path
  const inferredCategory: ProductCategory | 'all' = useMemo(() => {
    if (pathname.includes('/category/heren')) return 'heren';
    if (pathname.includes('/category/dames')) return 'dames';
    if (pathname.includes('/category/kids')) return 'kids';
    if (pathname.includes('/category/fight-gear')) return 'fight-gear';
    if (pathname.includes('/category/training')) return 'training';
    if (pathname.includes('/category/accessoires')) return 'accessoires';
    return 'all';
  }, [pathname]);
  const isNewPage = pathname === '/nieuw';
  const PAGE_SIZE = 48;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const PRICE_CEIL = useMemo(() => Math.ceil(Math.max(...activeProducts.map(p => p.price)) / 10) * 10, [activeProducts]);

  // Filters State
  const [selectedSport, setSelectedSport] = useState<string>(sportParam || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subParam || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [saleOnly, setSaleOnly] = useState<boolean>(pathname === '/sale');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available Filter Options derived from catalog
  const allSubcategories = useMemo(
    () => getSubcategoriesFor(inferredCategory).map(sc => [sc.key, sc.label[language]] as [string, string]),
    [inferredCategory, language]
  );

  // Rozmiary dostępne w bieżącej kategorii
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    activeProducts.forEach(p => {
      if (inferredCategory === 'all' || productInCategory(p, inferredCategory)) p.sizes.forEach(sz => set.add(sz));
    });
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'S/M', 'L/XL'];
    return Array.from(set)
      .filter(sz => sz !== 'One size')
      .sort((a, b) => {
        const ia = order.indexOf(a), ib = order.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return a.localeCompare(b, undefined, { numeric: true });
      });
  }, [inferredCategory, activeProducts]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      // Category check
      if (inferredCategory !== 'all' && !productInCategory(p, inferredCategory)) return false;
      if (isNewPage && !p.isNew) return false;
      // Subcategory check
      if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) return false;
      // Sport check
      if (selectedSport !== 'all' && !p.sport.includes(selectedSport as SportDiscipline)) return false;
      // Size check
      if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) return false;
      // Color check
      if (selectedColor !== 'all' && !p.colors.some(c => c.name.toLowerCase().includes(selectedColor.toLowerCase()))) return false;
      // Price check
      if (p.price > maxPrice) return false;
      // Sale check
      if (saleOnly && !p.isSale) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return getLocalizedProduct(a, language).name.localeCompare(getLocalizedProduct(b, language).name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [inferredCategory, isNewPage, selectedSubcategory, selectedSport, selectedSize, selectedColor, maxPrice, saleOnly, sortBy, activeProducts, language]);

  // Reset paginacji przy zmianie filtrów / kategorii
  React.useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filteredProducts]);
  // Synchronizacja filtrów z adresem (menu zmienia ?sub= / ?sport=)
  React.useEffect(() => {
    setSelectedSubcategory(subParam || 'all');
    setSelectedSport(sportParam || 'all');
  }, [subParam, sportParam, pathname]);

  const categoryTitles: Record<string, Record<string, { title: string; desc: string }>> = {
    'heren': {
      nl: { title: 'HEREN', desc: 'Rashguards, MMA- en kickboksshorts, T-shirts, hoodies, broeken en jassen van Octagon.' },
      en: { title: 'MEN', desc: 'Octagon rashguards, MMA and kickboxing shorts, T-shirts, hoodies, trousers and jackets.' },
      pl: { title: 'MĘSKIE', desc: 'Rashguardy, spodenki MMA i kickboxing, koszulki, bluzy, spodnie i kurtki Octagon.' }
    },
    'dames': {
      nl: { title: 'DAMES', desc: 'Dameskleding en vechtsportuitrusting van Octagon: handschoenen, scheenbeschermers, leggings en shirts.' },
      en: { title: 'WOMEN', desc: 'Octagon women’s apparel and combat gear: gloves, shin guards, leggings and tops.' },
      pl: { title: 'DAMSKIE', desc: 'Odzież i sprzęt damski Octagon: rękawice, ochraniacze, legginsy i koszulki.' }
    },
    'kids': {
      nl: { title: 'KIDS', desc: 'Kinderkleding en beschermende uitrusting voor jonge vechtsporters.' },
      en: { title: 'KIDS', desc: 'Kids’ apparel and protective gear for young athletes.' },
      pl: { title: 'DZIECI', desc: 'Odzież i sprzęt ochronny dla młodych zawodników.' }
    },
    'fight-gear': {
      nl: { title: 'FIGHT GEAR & BESCHERMING', desc: 'Bokshandschoenen, MMA-handschoenen, scheenbeschermers, bokshelmen, bitjes en bandages.' },
      en: { title: 'FIGHT GEAR & PROTECTION', desc: 'Boxing gloves, MMA gloves, shin guards, head guards, mouthguards and hand wraps.' },
      pl: { title: 'SPRZĘT I OCHRANIACZE', desc: 'Rękawice bokserskie i MMA, ochraniacze, kaski, szczęki i owijki.' }
    },
    'training': {
      nl: { title: 'TRAINING', desc: 'Focus mitts, Thai pads, trapkussens, bokszakken en medicijnballen.' },
      en: { title: 'TRAINING', desc: 'Focus mitts, Thai pads, kick shields, punching bags and medicine balls.' },
      pl: { title: 'TRENING', desc: 'Łapy trenerskie, tarcze, worki treningowe i piłki lekarskie.' }
    },
    'accessoires': {
      nl: { title: 'ACCESSOIRES', desc: 'Tassen en rugzakken, petten, mutsen, bivakmutsen, shakers en handdoeken.' },
      en: { title: 'ACCESSORIES', desc: 'Bags and backpacks, caps, beanies, balaclavas, shakers and towels.' },
      pl: { title: 'AKCESORIA', desc: 'Torby i plecaki, czapki, kominiarki, shakery i ręczniki.' }
    },
    'all': {
      nl: { title: 'ALLE PRODUCTEN', desc: 'Het volledige Octagon-assortiment.' },
      en: { title: 'ALL PRODUCTS', desc: 'The full Octagon range.' },
      pl: { title: 'WSZYSTKIE PRODUKTY', desc: 'Pełna oferta Octagon.' }
    },
    'nieuw': {
      nl: { title: 'NIEUW', desc: 'De nieuwste producten van Octagon.' },
      en: { title: 'NEW IN', desc: 'The latest Octagon products.' },
      pl: { title: 'NOWOŚCI', desc: 'Najnowsze produkty Octagon.' }
    }
  };

  const headerInfo = categoryTitles[isNewPage ? 'nieuw' : inferredCategory]?.[language] || categoryTitles.all[language] || categoryTitles.all.nl;

  const resetFilters = () => {
    setSelectedSport('all');
    setSelectedSubcategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setMaxPrice(1000);
    setSaleOnly(false);
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white">
      {/* Category Hero Banner */}
      <div className="bg-[#0B0B0B] border-b border-neutral-800 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
            OCTAGON SPORT NL / {(isNewPage ? 'nieuw' : inferredCategory).toUpperCase()}
          </span>
          <h1 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide">
            {headerInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-2xl font-body">
            {headerInfo.desc}
          </p>
        </div>
      </div>

      {/* Legion Kids – interaktywny wybór koszulki (tylko kategoria kids, bez filtra podkategorii) */}
      {inferredCategory === 'kids' && !subParam && <KidsFighterSelect />}

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Controls Bar: Item count, Mobile filter trigger, Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-[#141414] border border-neutral-700 text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#D71920]" />
              <span>Filters ({[selectedSport !== 'all', selectedSubcategory !== 'all', selectedSize !== 'all', saleOnly].filter(Boolean).length})</span>
            </button>
            <span className="text-xs font-mono text-neutral-400">
              {filteredProducts.length} {t('filters.found')}
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-condensed uppercase tracking-wider">
            <span className="text-neutral-500 font-mono">{t('filters.sort')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#111111] border border-neutral-700 text-white px-3 py-1.5 focus:outline-none focus:border-[#D71920]"
            >
              <option value="featured">{t('filters.sort.featured')}</option>
              <option value="newest">{t('filters.sort.newest')}</option>
              <option value="price-asc">{t('filters.sort.priceAsc')}</option>
              <option value="price-desc">{t('filters.sort.priceDesc')}</option>
              <option value="rating">{t('filters.sort.rating')}</option>
            </select>
          </div>
        </div>

        {/* Content Layout: Left Filter Sidebar (Desktop) + Right Products Grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6 bg-[#0B0B0B] border border-neutral-800/80 p-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="font-bebas text-lg tracking-wider text-white">{t('filters.title')}</span>
              <button
                onClick={resetFilters}
                className="text-[11px] font-mono text-neutral-400 hover:text-[#D71920] underline"
              >
                {t('filters.clear')}
              </button>
            </div>

            {/* Subcategories Filter */}
            {allSubcategories.length > 0 && (
              <div>
                <label className="block text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                  {t('mega.fightwear')}
                </label>
                <div className="space-y-1.5 text-xs text-neutral-400">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`block w-full text-left py-1 hover:text-white ${selectedSubcategory === 'all' ? 'text-[#D71920] font-bold' : ''}`}
                  >
                    {t('filters.allSub')}
                  </button>
                  {allSubcategories.map(([dutchKey, locLabel]) => (
                    <button
                      key={dutchKey}
                      onClick={() => setSelectedSubcategory(dutchKey)}
                      className={`block w-full text-left py-1 hover:text-white ${selectedSubcategory === dutchKey ? 'text-[#D71920] font-bold' : ''}`}
                    >
                      {locLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sport Discipline Filter */}
            <div className="border-t border-neutral-800 pt-4">
              <label className="block text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                {t('filters.sport')}
              </label>
              <div className="space-y-1.5 text-xs text-neutral-400">
                {[
                  { id: 'all', label: t('filters.allSub') },
                  { id: 'mma', label: t('discipline.mma') },
                  { id: 'boxing', label: t('discipline.boxing') },
                  { id: 'kickboxing', label: t('discipline.kickboxing') },
                  { id: 'muay-thai', label: t('discipline.muayThai') },
                  { id: 'grappling', label: t('discipline.grappling') }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSport(s.id)}
                    className={`block w-full text-left py-1 hover:text-white ${selectedSport === s.id ? 'text-[#D71920] font-bold' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="border-t border-neutral-800 pt-4">
              <label className="block text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                {t('filters.size')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`px-2 py-1 text-[11px] font-mono border ${selectedSize === 'all' ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
                >
                  ALL
                </button>
                {allSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2 py-1 text-[11px] font-mono border ${selectedSize === sz ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Range Slider */}
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex justify-between items-center text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                <span>{t('filters.maxPrice')}:</span>
                <span className="font-mono text-[#D71920]">€{Math.min(maxPrice, PRICE_CEIL)}</span>
              </div>
              <input
                type="range"
                min="5"
                max={PRICE_CEIL}
                step="5"
                value={Math.min(maxPrice, PRICE_CEIL)}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#D71920] cursor-pointer"
              />
            </div>

            {/* Sale Only Toggle */}
            <div className="border-t border-neutral-800 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-condensed font-bold uppercase text-neutral-300">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => setSaleOnly(e.target.checked)}
                  className="accent-[#D71920] w-4 h-4"
                />
                <span>{t('filters.saleOnly')}</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            <ProductGrid products={filteredProducts.slice(0, visibleCount)} columns={3} />
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="px-8 py-3 bg-[#141414] border border-neutral-700 hover:border-[#D71920] text-white font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {language === 'pl' ? 'Pokaż więcej' : language === 'en' ? 'Show more' : 'Meer tonen'} ({filteredProducts.length - visibleCount})
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Slide-Out Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#0C0C0C] border-r border-neutral-800 h-full p-5 flex flex-col justify-between overflow-y-auto z-50">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <span className="font-bebas text-xl text-white">{t('filters.title')}</span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Subcategories */}
              <div className="mb-4">
                <label className="block text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                  {t('filters.subcategories')}
                </label>
                <div className="space-y-1 text-xs text-neutral-400 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`block w-full text-left py-1 ${selectedSubcategory === 'all' ? 'text-[#D71920] font-bold' : ''}`}
                  >
                    {t('filters.allSub')}
                  </button>
                  {allSubcategories.map(([dutchKey, locLabel]) => (
                    <button
                      key={dutchKey}
                      onClick={() => setSelectedSubcategory(dutchKey)}
                      className={`block w-full text-left py-1 ${selectedSubcategory === dutchKey ? 'text-[#D71920] font-bold' : ''}`}
                    >
                      {locLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discipline */}
              <div className="mb-4 border-t border-neutral-800 pt-3">
                <label className="block text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                  {t('filters.sport')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: t('filters.allSub') },
                    { id: 'mma', label: t('discipline.mma') },
                    { id: 'boxing', label: t('discipline.boxing') },
                    { id: 'kickboxing', label: t('discipline.kickboxing') },
                    { id: 'muay-thai', label: t('discipline.muayThai') },
                    { id: 'grappling', label: t('discipline.grappling') }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSport(s.id)}
                      className={`px-2.5 py-1 text-xs font-mono uppercase border ${selectedSport === s.id ? 'bg-[#D71920] text-white border-[#D71920]' : 'border-neutral-800 text-neutral-400'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div className="mb-4 border-t border-neutral-800 pt-3">
                <div className="flex justify-between items-center text-xs font-condensed font-bold uppercase text-neutral-300 mb-2">
                  <span>{t('filters.maxPrice')}: €{Math.min(maxPrice, PRICE_CEIL)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={PRICE_CEIL}
                  step="5"
                  value={Math.min(maxPrice, PRICE_CEIL)}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#D71920]"
                />
              </div>

              {/* Sale toggle */}
              <div className="border-t border-neutral-800 pt-3">
                <label className="flex items-center gap-2 text-xs font-condensed font-bold uppercase text-neutral-300">
                  <input
                    type="checkbox"
                    checked={saleOnly}
                    onChange={(e) => setSaleOnly(e.target.checked)}
                    className="accent-[#D71920] w-4 h-4"
                  />
                  <span>{t('filters.saleOnly')}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 bg-neutral-900 text-neutral-400 text-xs font-condensed font-bold uppercase"
              >
                {t('filters.clear')}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-[#D71920] text-white text-xs font-condensed font-bold uppercase"
              >
                {t('filters.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
