import React from 'react';
import { ArrowRight, Star, Leaf, Heart, Info } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import EditablePhoto from './EditablePhoto';

const Hero: React.FC = () => {
  const { config } = useSiteConfig();
  const hasAnnouncement = config.announcement.trim().length > 0;

  const scrollToMenu = () => {
    const element = document.getElementById('menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
        hasAnnouncement ? 'pt-40 sm:pt-44' : 'pt-32'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-pink-50 to-gray-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-gray-600 ml-2">4.8 (200+ reviews)</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Fresh Ice Cream
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500"> Rolls</span>
              <br />Made to Order
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Indulge in our delicious ice cream rolls made fresh to order! Choose from our 
              <span className="font-semibold text-green-600"> sugar-free keto options</span> or 
              <span className="font-semibold text-pink-600"> traditional sweet treats</span> - 
              we have something for everyone's taste and dietary preferences.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Sugar-Free Options</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-blue-800 font-semibold">Keto-Friendly</span>
              </div>
              <div className="flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full border border-pink-200">
                <Heart className="w-5 h-5 text-pink-600" />
                <span className="text-pink-800 font-semibold">Traditional Sweet</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Important Notice</p>
                  <p className="text-sm text-yellow-800">
                    Please check if the allulose (sugar-free) version is available by calling us at <a href="tel:8322303830" className="font-semibold underline">(832) 230-3830</a> or checking our social media before ordering.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={scrollToMenu}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-black"
              >
                <span>View Menu</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border-2 border-black text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-pink-500 hover:text-pink-500 transition-all duration-300">
                Call (832) 230-3830
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">37+</div>
                <div className="text-gray-600">Flavors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-2">4.8★</div>
                <div className="text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">1000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 group">
              <EditablePhoto
                canonicalSrc="/images/rolls/cookiemonster.png"
                alt="Cookie Monster - Our Most Popular Ice Cream Roll"
                className="relative"
                imgClassName="rounded-2xl shadow-2xl w-full h-[600px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-gray-800">Cookie Monster</div>
                <div className="text-gray-600">Most Popular</div>
              </div>
            </div>
            
            <div className="absolute top-4 -left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg z-20">
              🔥 Most Popular
            </div>
            
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
