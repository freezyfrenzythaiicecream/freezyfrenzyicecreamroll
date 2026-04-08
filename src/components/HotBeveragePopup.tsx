import React, { useState, useEffect } from 'react';
import { X, Coffee, Snowflake, ArrowRight, Sparkles } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

const HotBeveragePopup: React.FC = () => {
  const { config } = useSiteConfig();
  const popupEnabled = config.showHotBeveragePopup;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!popupEnabled) return;
    // Check if popup was already shown in this session
    // Using sessionStorage so it shows again when the browser tab is closed and reopened
    const popupShown = sessionStorage.getItem('hotBeveragePopupShown');
    if (!popupShown) {
      // Delay popup appearance slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hotBeveragePopupShown', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [popupEnabled]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const scrollToMenu = () => {
    const element = document.getElementById('menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsVisible(false);
  };

  if (!popupEnabled || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Card */}
      <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 rounded-3xl shadow-2xl max-w-md w-full border-4 border-yellow-400 animate-bounce-subtle transform">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        {/* Animated Background Sparkles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-10 left-10 animate-pulse">
            <Sparkles className="w-8 h-8 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute top-20 right-16 animate-pulse delay-200">
            <Sparkles className="w-6 h-6 text-orange-400 opacity-60" />
          </div>
          <div className="absolute bottom-16 left-20 animate-pulse delay-300">
            <Sparkles className="w-7 h-7 text-red-400 opacity-60" />
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Snowflake Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Snowflake className="w-16 h-16 text-blue-400 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee className="w-10 h-10 text-amber-700" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent animate-gradient">
            🍫 Winter Warmth! ❄️
          </h2>
          
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4 rounded-full"></div>

          {/* Subheading */}
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Hot Coffee & Hot Chocolate
          </h3>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-2 font-semibold">
            marshmallow Topped 🧁
          </p>
          <p className="text-base text-gray-600 mb-6">
            Perfect for chilly days! Warm up with our special winter beverages.
          </p>

          {/* Call to Action Button */}
          <button
            onClick={scrollToMenu}
            className="group relative w-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 border-4 border-white overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>View Menu</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Special Offer Badge */}
          <div className="mt-6 inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-full border-2 border-black animate-pulse">
            ⭐ Limited Time Winter Special ⭐
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default HotBeveragePopup;
