import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, StickyNote, Flame, Heart, Users, Star } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

const WishingWall: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const hasAnnouncement = config.announcement.trim().length > 0;
  const topPad = hasAnnouncement ? 'pt-40 sm:pt-44' : 'pt-32';

  return (
    <section
      id="wishing-wall"
      className={`${topPad} py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/about')}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to About</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
              <StickyNote className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Wishing Wall
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your wishes, spread positivity, and connect with our community
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Wishing Wall Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <StickyNote className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Our Wishing Wall</h3>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              At Freezy Frenzy, we've created a special interactive Wishing Wall where customers can leave 
              sticky notes with their wishes, dreams, messages of encouragement, or simply share positive 
              thoughts with our community.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Heart className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Leave Your Mark</h4>
                  <p className="text-gray-600">
                    Write your wish or message on a sticky note and add it to our wall. It's a beautiful way 
                    to share your thoughts with others.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Read Others' Wishes</h4>
                  <p className="text-gray-600">
                    Take a moment to read the wishes and messages left by other customers. You'll be inspired 
                    by the positivity and dreams shared by our community.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Build Community</h4>
                  <p className="text-gray-600">
                    Our Wishing Wall is more than just notes on a wall - it's a symbol of connection, hope, 
                    and the shared joy of our ice cream experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Location:</strong> The Wishing Wall is located inside our shop. Feel free to add your 
                wish during your visit, or take time to read the messages from others.
              </p>
            </div>
          </div>

          {/* Marshmallow Toasting Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-full">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Toasted Marshmallows</h3>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Yes, we toast the marshmallows! When you order our hot coffee or hot chocolate, we don't just 
              add marshmallows - we carefully toast them to perfection, creating that warm, golden-brown 
              exterior with a gooey, melted interior.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Flame className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Perfectly Toasted</h4>
                  <p className="text-gray-600">
                    Each marshmallow is toasted to golden perfection, creating that classic campfire flavor 
                    that makes every sip extra special.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Heart className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Winter Warmth</h4>
                  <p className="text-gray-600">
                    Our toasted marshmallows add that extra touch of warmth and comfort, perfect for those 
                    chilly days when you need something cozy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Made to Order</h4>
                  <p className="text-gray-600">
                    Just like our ice cream rolls, our marshmallows are toasted fresh when you order, 
                    ensuring the perfect texture and flavor every time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Available on:</strong> Hot Coffee and Hot Chocolate. Perfect for warming up during 
                the cold winter months!
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Experience the Magic?</h3>
          <p className="text-xl mb-6 text-purple-100">
            Visit us to add your wish to our Wishing Wall and enjoy our delicious toasted marshmallow 
            beverages!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/#menu')}
              className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View Menu
            </button>
            <button
              type="button"
              onClick={() => navigate('/#contact')}
              className="bg-purple-700 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-800 transition-all duration-300 transform hover:scale-105 border-2 border-white"
            >
              Visit Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishingWall;
