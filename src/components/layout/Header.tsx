import React, { useState, useEffect } from 'react';
import { BrandMark } from './BrandMark';
import { useStore } from '../../context/StoreContext';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Globe, Scale, ArrowRight } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { getLocalizedProduct } from '../../data/products';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { 
    currentPath, 
    navigate, 
    cart,
    cartCount, 
    subtotal,
    wishlist, 
    comparison,
    setIsCartOpen, 
    setIsSearchOpen,
    language,
    setLanguage,
    t
  } = useStore();

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    setActiveMegaMenu(null);
    navigate(path);
  };

  const navItems = [
    { label: t('nav.men'), path: '/category/heren', mega: 'heren' },
    { label: t('nav.women'), path: '/category/dames', mega: 'dames' },
    { label: t('nav.kids'), path: '/category/kids', mega: 'kids' },
    { label: t('nav.fightGear'), path: '/category/fight-gear', mega: 'fight-gear' },
    { label: t('nav.training'), path: '/category/training', mega: 'training' },
    { label: t('nav.accessories'), path: '/category/accessoires', mega: 'accessoires' },
    { label: t('nav.new'), path: '/nieuw', highlight: true },
    { label: t('nav.sale'), path: '/sale', isSale: true },
    { label: t('nav.partners'), path: '/partners' },
  ];

  return (
    <header style={{ viewTransitionName: 'site-header' } as React.CSSProperties} className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#050505]/95 border-b border-neutral-800/80 shadow-2xl py-3' 
        : 'bg-[#050505] border-b border-neutral-800/50 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Hamburger */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Menu openen"
            className="p-2 -ml-2 text-neutral-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center min-w-0 shrink sm:shrink-0 mr-auto lg:mr-2 xl:mr-6">
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <BrandMark className="w-8 h-8 shrink-0 sm:w-11 sm:h-11 transition-transform duration-300 group-hover:rotate-[22.5deg]" alt="" />
            <div className="flex flex-col">
              <span className="font-bebas text-xl sm:text-3xl tracking-wider text-white leading-none group-hover:text-neutral-100">
                OCTAGON
              </span>
              <span className="text-[9px] font-condensed font-bold tracking-[0.25em] text-[#D71920] uppercase leading-none mt-0.5">
                SPORT NL
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.mega && currentPath.includes(item.mega));
            return (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => item.mega && setActiveMegaMenu(item.mega)}
              >
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`px-3 py-2 text-xs xl:text-sm font-condensed font-bold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-1 ${
                    item.isSale
                      ? 'text-[#D71920] hover:text-white'
                      : item.highlight
                      ? 'text-white hover:text-[#D71920]'
                      : isActive
                      ? 'text-white border-b-2 border-[#D71920]'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.isSale && (
                    <span className="bg-[#D71920] text-white text-[9px] px-1 py-0.2 rounded font-mono">
                      %
                    </span>
                  )}
                  {item.mega && (
                    <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-white transition-transform" />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Right Actions: Search, Lang, Wishlist, Account, Cart */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Zoeken"
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded transition-colors"
            title="Zoeken"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-label="Taal selecteren"
              className="p-1.5 sm:px-2 sm:py-1 text-xs font-mono uppercase text-neutral-300 hover:text-white hover:bg-neutral-900 rounded flex items-center gap-1 transition-colors"
            >
              <Globe className="w-4 h-4 text-neutral-400" />
              <span className="hidden sm:inline font-semibold">{language.toUpperCase()}</span>
            </button>

            {isLangDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-32 bg-[#0B0B0B] border border-neutral-800 rounded shadow-2xl py-1 z-50 text-xs"
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                <button
                  onClick={() => { setLanguage('nl'); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-900 ${
                    language === 'nl' ? 'text-[#D71920] font-bold' : 'text-neutral-300'
                  }`}
                >
                  <span>🇳🇱 Nederlands</span>
                </button>
                <button
                  onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-900 ${
                    language === 'en' ? 'text-[#D71920] font-bold' : 'text-neutral-300'
                  }`}
                >
                  <span>🇬🇧 English</span>
                </button>
                <button
                  onClick={() => { setLanguage('pl'); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-900 ${
                    language === 'pl' ? 'text-[#D71920] font-bold' : 'text-neutral-300'
                  }`}
                >
                  <span>🇵🇱 Polski</span>
                </button>
              </div>
            )}
          </div>

          {/* Comparison */}
          <button
            onClick={() => handleNavClick('/compare')}
            aria-label="Specificaties vergelijken"
            className="hidden sm:block p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded relative transition-colors"
            title="Vergelijk specificaties"
          >
            <Scale className="w-5 h-5" />
            {comparison.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#141414] border border-[#D71920] text-[#D71920] text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {comparison.length}
              </span>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleNavClick('/wishlist')}
            aria-label="Verlanglijst"
            className="hidden sm:block p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded relative transition-colors"
            title="Verlanglijst"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#141414] border border-[#D71920] text-[#D71920] text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Cart Button with Mini-Cart Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Winkelwagen openen"
              className="p-2 bg-[#141414] hover:bg-[#D71920] border border-neutral-800 hover:border-[#D71920] text-white rounded transition-colors flex items-center gap-2 cursor-pointer group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-[#D71920] group-hover:bg-black text-white rounded">
                {cartCount}
              </span>
            </button>

            {/* Hover Mini-Cart Dropdown Preview */}
            {isCartHovered && cart.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0C0C0C] border border-neutral-700 shadow-2xl p-4 z-50 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
                  <span className="text-xs font-bebas text-white tracking-wider">
                    {language === 'pl' ? 'KOSZYK ZAKUPOWY' : 'JOUW WINKELWAGEN'} ({cartCount})
                  </span>
                  <span className="font-mono text-xs text-[#D71920] font-bold">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Items preview list */}
                <div className="max-h-52 overflow-y-auto divide-y divide-neutral-800/80 pr-1 space-y-2">
                  {cart.slice(0, 3).map((item, idx) => {
                    const loc = getLocalizedProduct(item.product, language);
                    return (
                      <div key={idx} className="flex gap-2.5 pt-2 items-center text-xs">
                        <img 
                          src={item.product.images[0]} 
                          alt={loc.name} 
                          className="w-10 h-12 object-contain bg-white shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-condensed font-bold text-white truncate text-xs">{loc.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {item.selectedSize} · {item.quantity}x
                          </p>
                        </div>
                        <span className="font-mono text-xs text-white tabular-nums shrink-0 font-bold">
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {cart.length > 3 && (
                    <p className="text-[10px] text-neutral-500 font-mono pt-1 text-center">
                      +{cart.length - 3} {language === 'pl' ? 'kolejnych produktów...' : 'overige artikelen...'}
                    </p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="pt-3 border-t border-neutral-800 mt-3 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsCartHovered(false);
                      navigate('/cart');
                    }}
                    className="w-full py-2 bg-[#181818] hover:bg-neutral-800 text-white font-condensed font-bold text-xs uppercase tracking-wider text-center cursor-pointer border border-neutral-700 block transition-colors"
                  >
                    {language === 'pl' ? 'Otwórz pełny koszyk' : 'Bekijk winkelwagen'}
                  </button>
                  <button
                    onClick={() => {
                      setIsCartHovered(false);
                      navigate('/checkout');
                    }}
                    className="w-full py-2 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow"
                  >
                    <span>{language === 'pl' ? 'Przejdź do kasy' : 'Direct afrekenen'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Mega Menu Panel */}
      {activeMegaMenu && (
        <MegaMenu 
          category={activeMegaMenu} 
          onClose={() => setActiveMegaMenu(null)} 
        />
      )}
    </header>
  );
};
