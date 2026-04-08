import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SiteConfigProvider, useSiteConfig } from './context/SiteConfigContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import WishingWall from './components/WishingWall';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import HotBeveragePopup from './components/HotBeveragePopup';
import NutritionalFacts from './components/NutritionalFacts';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { config } = useSiteConfig();
  const [isNutritionalFactsOpen, setIsNutritionalFactsOpen] = useState(false);

  return (
    <>
      <AdminPanel />
      <HotBeveragePopup />
      <NutritionalFacts
        isOpen={isNutritionalFactsOpen}
        onClose={() => setIsNutritionalFactsOpen(false)}
      />
      <Header />
      {config.showHero ? <Hero /> : null}
      {config.showMenu ? <Menu /> : null}
      {config.showAbout ? <About /> : null}
      {config.showWishingWall ? <WishingWall /> : null}
      {config.showGallery ? <Gallery /> : null}
      {config.showContact ? <Contact /> : null}
      <Footer onShowNutritionalFacts={() => setIsNutritionalFactsOpen(true)} />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <SiteConfigProvider>
          <AppContent />
        </SiteConfigProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
