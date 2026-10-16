import React, { useState, useEffect } from 'react';
import { initSmoothScroll } from './lib/smoothScroll';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/commerce/CartDrawer';
import { QuickViewModal } from './components/commerce/QuickViewModal';
import { SizeGuideModal } from './components/commerce/SizeGuideModal';
import { PredictiveSearchModal } from './components/commerce/PredictiveSearchModal';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { SalePage } from './pages/SalePage';
import { ClubsPage } from './pages/ClubsPage';
import { WholesalePage } from './pages/WholesalePage';
import { CustomTeamwearPage } from './pages/CustomTeamwearPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { ComparePage } from './pages/ComparePage';
import { PartnersPage } from './pages/PartnersPage';
import { LegalPage } from './pages/LegalPage';
import { findLegalDoc } from './data/legal';
import { FloatingCartWidget } from './components/commerce/FloatingCartWidget';
import { ComparisonFloatingBar } from './components/commerce/ComparisonFloatingBar';
import { WhatsAppWidget } from './components/layout/WhatsAppWidget';
import { CookieNotice } from './components/layout/CookieNotice';

import { CheckCircle2, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, openSizeGuide, toast } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Płynne przewijanie z bezwładnością (tylko komputer)
  useEffect(() => initSmoothScroll(), []);

  // Router view selector based on path
  const renderCurrentView = () => {
    const cleanPath = currentPath.split('?')[0];

    if (cleanPath === '/' || cleanPath === '') {
      return <HomePage />;
    }

    if (cleanPath === '/cart' || cleanPath === '/koszyk' || cleanPath === '/winkelwagen') {
      return <CartPage />;
    }

    if (cleanPath === '/compare' || cleanPath === '/porownaj' || cleanPath === '/vergelijken') {
      return <ComparePage />;
    }

    // Strona /media (wideo i "reels") ukryta do czasu dodania prawdziwych materiałów

    if (cleanPath === '/fight-system') {
      return (
        <div>
          <HomePage />
        </div>
      );
    }

    if (cleanPath.startsWith('/product/')) {
      const slug = cleanPath.replace('/product/', '');
      return <ProductPage slug={slug} />;
    }

    if (cleanPath.startsWith('/category/') || cleanPath === '/nieuw') {
      return <CategoryPage />;
    }

    if (cleanPath === '/sale') {
      return <SalePage />;
    }

    if (cleanPath === '/partners' || cleanPath === '/samenwerkingen' || cleanPath === '/partnerzy') {
      return <PartnersPage />;
    }

    if (cleanPath === '/clubs') {
      return <ClubsPage />;
    }

    if (cleanPath === '/wholesale' || cleanPath === '/hurt') {
      return <WholesalePage />;
    }

    if (cleanPath === '/custom-teamwear') {
      return <CustomTeamwearPage />;
    }

    if (cleanPath === '/bedankt' || cleanPath === '/thank-you' || cleanPath === '/dziekujemy') {
      return <ThankYouPage />;
    }

    if (cleanPath === '/checkout') {
      return <CheckoutPage />;
    }

    const legalDoc = findLegalDoc(cleanPath);
    if (legalDoc) {
      return <LegalPage doc={legalDoc} />;
    }

    if (cleanPath === '/wishlist') {
      return <WishlistPage />;
    }

    if (cleanPath === '/about' || cleanPath === '/over-ons') {
      return <AboutPage />;
    }

    if (cleanPath === '/contact') {
      return <ContactPage />;
    }

    if (cleanPath === '/size-guide') {
      return (
        <div>
          <HomePage />
          <div className="hidden">{(() => { setTimeout(() => openSizeGuide(), 50); return null; })()}</div>
        </div>
      );
    }

    // Default fallback to home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-body selection:bg-[#D71920] selection:text-white">
      {/* 1. Rotating Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Sticky Header with Mega Menu */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      {/* 3. Mobile Navigation Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* 4. Main Page View */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* 5. Combat Sports Footer */}
      <Footer />

      {/* 6. Overlays & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <SizeGuideModal />
      <PredictiveSearchModal />
      <FloatingCartWidget />
      <ComparisonFloatingBar />
      <WhatsAppWidget />
      <CookieNotice />

      {/* 7. Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] border border-neutral-700 text-white px-4 py-3 shadow-2xl flex items-center gap-2.5 font-condensed tracking-wider text-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#D71920] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
