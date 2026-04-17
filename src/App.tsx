import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import MailingListPopup from './components/MailingListPopup';
import CloverRewardsLanding from './components/CloverRewardsLanding';
import NutritionalFacts from './components/NutritionalFacts';
import AdminPanel from './components/AdminPanel';

function useHomeHashScroll() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
}

function HomePage() {
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  useHomeHashScroll();
  useEffect(() => {
    if (location.hash === '#about') {
      navigate('/about', { replace: true });
    }
  }, [location.hash, navigate]);
  return (
    <>
      {config.showHero ? <Hero /> : null}
      {config.showMenu ? <Menu /> : null}
      {config.showGallery ? <Gallery /> : null}
      {config.showContact ? <Contact /> : null}
    </>
  );
}

function AboutPage() {
  const { config } = useSiteConfig();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!config.showAbout) {
    return <Navigate to="/" replace />;
  }
  return <About />;
}

function WishingWallPage() {
  const { config } = useSiteConfig();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!config.showWishingWall) {
    return <Navigate to="/" replace />;
  }
  return <WishingWall />;
}

function AppContent() {
  const [isNutritionalFactsOpen, setIsNutritionalFactsOpen] = useState(false);

  return (
    <>
      <AdminPanel />
      <HotBeveragePopup />
      <MailingListPopup />
      <NutritionalFacts
        isOpen={isNutritionalFactsOpen}
        onClose={() => setIsNutritionalFactsOpen(false)}
      />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/wishing-wall" element={<WishingWallPage />} />
        <Route path="/rewards" element={<CloverRewardsLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
