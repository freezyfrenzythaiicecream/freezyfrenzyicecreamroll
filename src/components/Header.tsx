import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import EditablePhoto from './EditablePhoto';

const Header: React.FC = () => {
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const announcement = config.announcement.trim();

  const navItems = useMemo(
    () =>
      [
        { id: 'home', label: 'Home', show: config.showHero },
        { id: 'menu', label: 'Menu', show: config.showMenu },
        { id: 'about', label: 'About', show: config.showAbout },
        { id: 'wishing-wall', label: 'Wishing Wall', show: config.showWishingWall },
        { id: 'gallery', label: 'Gallery', show: config.showGallery },
        { id: 'contact', label: 'Contact', show: config.showContact },
      ].filter((item) => item.show),
    [config]
  );

  const goToNavTarget = (sectionId: string) => {
    setIsMenuOpen(false);
    if (sectionId === 'wishing-wall') {
      navigate('/wishing-wall');
      return;
    }
    if (sectionId === 'about') {
      navigate('/about');
      return;
    }
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: `#${sectionId}` });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goHome = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }
    const element = document.getElementById('home');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      {announcement ? (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-950 text-center text-sm py-2 px-4">
          {announcement}
        </div>
      ) : null}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-28 py-3">
          <div className="flex items-center space-x-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => goHome()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goHome();
                }
              }}
              className="flex items-center transition-transform hover:scale-105 flex-shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
              aria-label="Go to home"
            >
              <div className="h-24 w-24 rounded-full border-4 border-black overflow-hidden flex items-center justify-center bg-white shadow-md">
                <EditablePhoto
                  canonicalSrc="/images/logo.png"
                  alt="Freezy Frenzy Thai Ice Cream Roll"
                  className="relative group h-full w-full"
                  imgClassName="h-full w-full object-contain"
                />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800 hidden sm:inline leading-tight ml-2">Freezy Frenzy Thai Ice Cream Roll</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 ml-4 lg:ml-8 flex-wrap gap-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToNavTarget(item.id)}
                className="text-gray-700 hover:text-yellow-500 font-medium transition-colors py-2 px-2"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4 ml-8">
            <div className="flex items-center space-x-2 text-gray-700 text-sm bg-gray-50 px-4 py-2 rounded-lg">
              <Phone className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">(832) 230-3830</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 text-sm bg-gray-50 px-4 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Jersey Village, TX</span>
            </div>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-yellow-500 transition-colors ml-4"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-6">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToNavTarget(item.id)}
                  className="text-gray-700 hover:text-yellow-500 hover:bg-yellow-50 font-medium py-3 px-4 text-left transition-colors rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center space-x-2 text-gray-700 text-sm bg-gray-50 px-4 py-3 rounded-lg">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">(832) 230-3830</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 text-sm bg-gray-50 px-4 py-3 rounded-lg">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Jersey Village, TX</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;