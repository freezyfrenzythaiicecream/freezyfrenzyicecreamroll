import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Instagram, Facebook, Mail, Phone, MapPin, Clock, Info } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import EditablePhoto from './EditablePhoto';

interface FooterProps {
  onShowNutritionalFacts?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowNutritionalFacts }) => {
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinks = useMemo(
    () =>
      [
        { id: 'home', label: 'Home', show: config.showHero },
        { id: 'menu', label: 'Menu', show: config.showMenu },
        { id: 'about', label: 'About Us', show: config.showAbout },
        { id: 'wishing-wall', label: 'Wishing Wall', show: config.showWishingWall },
        { id: 'gallery', label: 'Gallery', show: config.showGallery },
        { id: 'contact', label: 'Contact', show: config.showContact },
      ].filter((item) => item.show),
    [config]
  );

  const goToNavTarget = (sectionId: string) => {
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

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-20 w-20 rounded-full border-4 border-black overflow-hidden flex items-center justify-center bg-white">
                <EditablePhoto
                  canonicalSrc="/images/logo.png"
                  alt="Freezy Frenzy Thai Ice Cream Roll"
                  className="relative group h-full w-full"
                  imgClassName="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Freezy Frenzy Thai Ice Cream Roll</h3>
                <p className="text-gray-400 text-sm">Fresh Thai Ice Cream Rolls</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Experience the art of fresh Thai ice cream rolling. Every roll is crafted with premium ingredients 
              and made to order, with both traditional and keto-friendly options available. Creating perfect moments 
              of sweet delight for our Jersey Village community.
            </p>
            
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/freezyfrenzythaiicecreamroll/" className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-full hover:scale-110 transition-transform duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/freezyfrenzyicecreamroll/" className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-full hover:scale-110 transition-transform duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              {/* <a href="#" className="bg-gradient-to-r from-sky-400 to-sky-600 p-3 rounded-full hover:scale-110 transition-transform duration-300">
                <Twitter className="w-5 h-5" />
              </a> */}
              <a href="mailto:contact@freezyfrenzy.store" className="bg-gradient-to-r from-green-500 to-green-700 p-3 rounded-full hover:scale-110 transition-transform duration-300">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-3">
              {quickLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToNavTarget(item.id)}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>17458 Northwest Fwy<br />Jersey Village, TX 77040</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <p>(832) 230-3830</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <p>contact@freezyfrenzy.store</p>
              </div>
              <div className="text-sm">
                <div className="flex items-start space-x-2 mb-1">
                  <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">Hours:</p>
                    <p>Mon-Thu: 1:00 PM - 9:30 PM</p>
                    <p>Fri-Sat: 12:30 PM - 10:00 PM</p>
                    <p>Sun: 12:30 PM - 9:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-gray-300">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for ice cream lovers everywhere</span>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div className="text-gray-300 text-sm">
                © 2024 Freezy Frenzy Thai Ice Cream Roll. All rights reserved.
              </div>
              {onShowNutritionalFacts && (
                <button
                  onClick={onShowNutritionalFacts}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm underline"
                >
                  <Info className="w-4 h-4" />
                  <span>Nutritional Facts</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;