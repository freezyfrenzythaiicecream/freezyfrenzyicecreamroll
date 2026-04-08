import React, { useState } from 'react';
import { Heart, Clock, Thermometer, Leaf, Zap, Star, Info, Sprout } from 'lucide-react';
import EditablePhoto from './EditablePhoto';
import { menuItemImageOverrideKey } from '../imageUrls';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  popular?: boolean;
  prepTime: string;
  netCarbs?: string;
  sugarFree?: boolean;
  ketoFriendly?: boolean;
  traditional?: boolean;
}

const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('thai-ice-cream');

  // Image mapping for ice cream roll flavors - only using images you actually have
  const iceCreamImages: { [key: string]: string } = {
    "Berry Blast": "/images/rolls/berryblast.png",
    "Coffee Break": "/images/rolls/coffeebreak.png",
    "Cookie Monster": "/images/rolls/cookiemonster.png", // Most popular
    "DIY": "/images/logo.png", // No image - using logo
    "Emerald City": "/images/logo.png", // No image - using logo
    "Girl's Best Friend": "/images/rolls/girlsbestfriend.png",
    "Honey Boo Boo": "/images/rolls/honeybooboo.png",
    "Mango Tango": "/images/logo.png", // No image - using logo
    "Matcha Madness": "/images/rolls/matchamadness.png",
    "Matte Black": "/images/rolls/matteblack.png",
    "Mean Green": "/images/logo.png", // No image - using logo
    "Ruby": "/images/logo.png", // No image - using logo
    "S'mores Galore": "/images/rolls/smoresgalore.png",
    "Thai Me Up": "/images/rolls/thaimeup.png",
    "Tropical Passion": "/images/logo.png", // No image - using logo
  };

  // Get image based on category
  const getImageForItem = (itemName: string, category: string): string => {
    // Thai Ice Cream Rolls - use specific images if available, otherwise logo.png
    if (category === 'thai-ice-cream') {
      return iceCreamImages[itemName] || "/images/logo.png";
    }
    // Smoothies - use smoothie.jpg
    if (category === 'smoothies') {
      return "/images/smoothie.jpg";
    }
    // Hot Beverages - use hotbev.jpg
    if (category === 'hot-beverages') {
      return "/images/hotbev.jpg";
    }
    // Milk Tea - use milktea.jpg
    if (category === 'milk-tea') {
      return "/images/milktea.jpg";
    }
    // All other categories (tea, ice-cream-scoop, etc.) - use logo.png
    return "/images/logo.png";
  };

  const menuItems: MenuItem[] = [
    // Thai Ice Cream Rolls
    {
      id: 1,
      name: "Berry Blast",
      description: "Blueberry, strawberry, raspberry, orange syrup. Topped with whipped cream, cherry, Oreo, blueberry, raspberry, strawberry, raspberry syrup.",
      price: "$7.99",
      image: getImageForItem("Berry Blast", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 2,
      name: "Coffee Break",
      description: "Classy coffee, vanilla wafer, chocolate syrup. Topped with whipped cream, vanilla wafer, pocky sticks, M&M, crushed Oreo, caramel syrup.",
      price: "$7.99",
      image: getImageForItem("Coffee Break", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 3,
      name: "Cookie Monster",
      description: "Oreo, chocolate syrup. Topped with whipped cream, rainbow sprinkles, Oreo, M&M, pocky sticks, chocolate syrup.",
      price: "$7.99",
      image: getImageForItem("Cookie Monster", "thai-ice-cream"),
      category: "thai-ice-cream",
      popular: true, // Most popular flavor
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 4,
      name: "DIY",
      description: "Create your own Thai ice cream roll with custom flavors and toppings.",
      price: "$7.99",
      image: getImageForItem("DIY", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 5,
      name: "Emerald City",
      description: "Green tea, kiwi, banana, strawberry syrup. Topped with whipped cream, cherry, strawberry, kiwi, marshmallows, pocky sticks, orange syrup.",
      price: "$7.99",
      image: getImageForItem("Emerald City", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 6,
      name: "Girl's Best Friend",
      description: "Strawberry, banana, strawberry syrup. Topped with whipped cream, cherry, rainbow sprinkles, kiwi, banana, wafer sticks, strawberry syrup.",
      price: "$7.99",
      image: getImageForItem("Girl's Best Friend", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 7,
      name: "Honey Boo Boo",
      description: "Lychee, peach, peach syrup. Topped with whipped cream, cherry, mango, kiwi, graham cracker, pocky sticks, marshmallow, lychee syrup.",
      price: "$7.99",
      image: getImageForItem("Honey Boo Boo", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 8,
      name: "Mango Tango",
      description: "Mango, vanilla wafer, mango syrup. Topped with mango, kiwi, strawberry, orange syrup, wafer sticks.",
      price: "$7.99",
      image: getImageForItem("Mango Tango", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 9,
      name: "Matcha Madness",
      description: "Green tea, strawberry, strawberry syrup. Topped with strawberry, mango, graham cracker, coconut flakes, pocky sticks, strawberry syrup.",
      price: "$7.99",
      image: getImageForItem("Matcha Madness", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 10,
      name: "Matte Black",
      description: "Coconut flavored charcoal mix, orange syrup. Topped with whipped cream, coconut flakes, Oreo, strawberry, mango, blueberry, wafer sticks, passion fruit syrup.",
      price: "$7.99",
      image: getImageForItem("Matte Black", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 11,
      name: "Mean Green",
      description: "Pistachio, banana, caramel syrup. Topped with whipped cream, pistachio, strawberry, marshmallows, pocky sticks, chocolate syrup.",
      price: "$7.99",
      image: getImageForItem("Mean Green", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 12,
      name: "Ruby",
      description: "Raspberry, Oreo, caramel syrup. Topped with whipped cream, cherry, crushed Oreo, strawberry, blueberry, pocky sticks, mango syrup.",
      price: "$7.99",
      image: getImageForItem("Ruby", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 13,
      name: "S'mores Galore",
      description: "Graham cracker, chocolate syrup. Topped with whipped cream, chocolate syrup, marshmallows, pocky sticks, graham cracker, chocolate syrup.",
      price: "$7.99",
      image: getImageForItem("S'mores Galore", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 14,
      name: "Thai Me Up",
      description: "Thai tea, peach, lychee syrup. Topped with whipped cream, cherry, rainbow sprinkles, wafer sticks, pocky sticks, coconut flakes, peach syrup.",
      price: "$7.99",
      image: getImageForItem("Thai Me Up", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "4-6 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    {
      id: 15,
      name: "Tropical Passion",
      description: "Strawberry, mango, kiwi, peach syrup. Topped with whipped cream, cherry, rainbow sprinkles, marshmallow, wafer sticks, passion fruit syrup.",
      price: "$7.99",
      image: getImageForItem("Tropical Passion", "thai-ice-cream"),
      category: "thai-ice-cream",
      prepTime: "3-5 min",
      sugarFree: true,
      ketoFriendly: true,
      traditional: true
    },
    // Smoothies - using logo as fallback
    {
      id: 16,
      name: "Kiwi Watermelon",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Kiwi Watermelon", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 17,
      name: "Mango Pineapple",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Mango Pineapple", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 18,
      name: "Mango Sunrise",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Mango Sunrise", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 19,
      name: "Strawberry Banana",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Strawberry Banana", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 20,
      name: "Strawberry Raspberry",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Strawberry Raspberry", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 21,
      name: "Very Berry",
      description: "Refreshing fruit smoothie",
      price: "$5.45",
      image: getImageForItem("Very Berry", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    {
      id: 22,
      name: "Custom Smoothie",
      description: "Create your own custom smoothie",
      price: "$5.45",
      image: getImageForItem("Custom Smoothie", "smoothies"),
      category: "smoothies",
      prepTime: "2-3 min"
    },
    // Tea - using logo as fallback
    {
      id: 23,
      name: "Honey Tea",
      description: "Refreshing tea with honey and passionfruit",
      price: "$5.45",
      image: getImageForItem("Honey Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    {
      id: 24,
      name: "Lychee Tea",
      description: "Refreshing tea with lychee flavor",
      price: "$5.45",
      image: getImageForItem("Lychee Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    {
      id: 25,
      name: "Mango Tea",
      description: "Refreshing tea with mango flavor",
      price: "$5.45",
      image: getImageForItem("Mango Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    {
      id: 26,
      name: "Passion Fruit Tea",
      description: "Refreshing tea with passion fruit flavor",
      price: "$5.45",
      image: getImageForItem("Passion Fruit Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    {
      id: 27,
      name: "Peach Tea",
      description: "Refreshing tea with peach flavor",
      price: "$5.45",
      image: getImageForItem("Peach Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    {
      id: 28,
      name: "Strawberry Lemon Tea",
      description: "A refreshing blend of green or black tea infused with the sweet flavor of strawberries and the tangy zest of lemon. Perfect for a revitalizing tea experience any time of the day.",
      price: "$5.45",
      image: getImageForItem("Strawberry Lemon Tea", "tea"),
      category: "tea",
      prepTime: "1-2 min"
    },
    // Milk Tea - using logo as fallback
    {
      id: 29,
      name: "Almond Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Almond Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    {
      id: 30,
      name: "Classic Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Classic Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    {
      id: 31,
      name: "Coconut Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Coconut Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    {
      id: 32,
      name: "Matcha Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Matcha Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    {
      id: 33,
      name: "Taro Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Taro Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    {
      id: 34,
      name: "Thai Tea Milk Tea",
      description: "Creamy milk tea",
      price: "$5.45",
      image: getImageForItem("Thai Tea Milk Tea", "milk-tea"),
      category: "milk-tea",
      prepTime: "2-3 min"
    },
    // Ice Cream Scoops - using logo as fallback
    {
      id: 35,
      name: "Butter Pecan",
      description: "Rich and creamy butter pecan ice cream",
      price: "$7.99",
      image: getImageForItem("Butter Pecan", "ice-cream-scoop"),
      category: "ice-cream-scoop",
      prepTime: "1-2 min"
    },
    {
      id: 36,
      name: "Strawberry",
      description: "Fresh strawberry ice cream",
      price: "$7.99",
      image: getImageForItem("Strawberry", "ice-cream-scoop"),
      category: "ice-cream-scoop",
      prepTime: "1-2 min"
    },
    {
      id: 37,
      name: "Coffee",
      description: "Rich coffee flavored ice cream",
      price: "$7.99",
      image: getImageForItem("Coffee", "ice-cream-scoop"),
      category: "ice-cream-scoop",
      prepTime: "1-2 min"
    },
    // Hot Beverages - using logo as fallback
    {
      id: 38,
      name: "Hot Chocolate",
      description: "Rich and creamy hot chocolate topped with marshmallows. Perfect for cold weather!",
      price: "$5.45",
      image: getImageForItem("Hot Chocolate", "hot-beverages"),
      category: "hot-beverages",
      prepTime: "2-3 min"
    },
    {
      id: 39,
      name: "Coffee",
      description: "Warm, comforting coffee topped with marshmallows. Perfect for cold weather!",
      price: "$5.45",
      image: getImageForItem("Coffee", "hot-beverages"),
      category: "hot-beverages",
      prepTime: "2-3 min"
    }
  ];

  const categories = [
    { id: 'thai-ice-cream', name: 'Thai Ice Cream Roll', count: 15 },
    { id: 'smoothies', name: 'Smoothies', count: 7 },
    { id: 'tea', name: 'Tea', count: 6 },
    { id: 'milk-tea', name: 'Milk Tea', count: 6 },
    { id: 'ice-cream-scoop', name: 'Ice Cream Scoop', count: 3 },
    { id: 'hot-beverages', name: 'Hot Beverages', count: 2 }
  ];

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Delicious <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500">Menu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every item is made fresh to order using premium ingredients. 
            Thai Ice Cream Rolls are available with a vegan coconut cream base, or in keto, diabetic, and low carb versions with allulose sweetener.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full border border-amber-200">
              <Sprout className="w-5 h-5 text-amber-700" />
              <span className="text-amber-900 font-semibold">Vegan Coconut Base</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-semibold">Keto Options Available</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Allulose Sweetener</span>
            </div>
            <div className="flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full border border-pink-200">
              <Star className="w-5 h-5 text-pink-600" />
              <span className="text-pink-800 font-semibold">Made Fresh Daily</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">Important: Check Allulose Availability</p>
              <p className="text-sm text-yellow-800">
                Please verify that the allulose (sugar-free) version is available before ordering. Call us at <a href="tel:8322303830" className="font-semibold underline">(832) 230-3830</a> or check our <a href="https://www.instagram.com/freezyfrenzyicecreamroll/" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Instagram</a> or <a href="https://www.facebook.com/freezyfrenzyicecreamroll/" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Facebook</a> for current availability.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg border-2 border-black'
                  : 'bg-white text-gray-600 hover:text-yellow-500 border border-gray-200 hover:border-yellow-300'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="relative group">
                <EditablePhoto
                  canonicalSrc={item.image}
                  overrideKey={menuItemImageOverrideKey(item.id)}
                  alt={item.name}
                  className="relative"
                  imgClassName="w-full h-48 object-cover"
                />
                {item.popular && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🔥 Most Popular
                  </div>
                )}
                <div className="absolute top-4 right-4 flex flex-col space-y-1">
                  {item.sugarFree && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Keto Available
                    </div>
                  )}
                  {item.ketoFriendly && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Allulose Sweetener
                    </div>
                  )}
                </div>
                <button className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.prepTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4" />
                      <span>Made Fresh</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-pink-500">{item.price}</span>
                  <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-black">
                  <a
  href="https://order.ogentai.com/freezyfrenzyicetx/#menu"
  target="_blank"
  rel="noopener noreferrer"
>Order Now</a>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Try our DIY option or create a custom smoothie!</p>
          <a href="https://order.ogentai.com/freezyfrenzyicetx/#menu" target="_blank" rel="noopener noreferrer">
            <button className="bg-white text-pink-500 border-2 border-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-pink-500 hover:text-white transition-all duration-300">
              Create Custom Order
            </button>
          </a>
        </div>

        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-pink-50 p-8 rounded-2xl border border-yellow-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Special Dietary Options</h3>
            <p className="text-lg text-gray-600 mb-6 max-w-4xl mx-auto">
              Ask for our vegan base (coconut cream, your choice of sweetener, and cornstarch) or go keto-friendly with allulose. 
              Perfect for plant-based diets, ketogenic eating, or managing blood sugar levels—confirm options when you order.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-amber-200 text-amber-900 px-4 py-2 rounded-full font-semibold">Vegan Base</span>
              <span className="bg-green-200 text-green-800 px-4 py-2 rounded-full font-semibold">Keto-Friendly</span>
              <span className="bg-blue-200 text-blue-800 px-4 py-2 rounded-full font-semibold">Diabetic-Friendly</span>
              <span className="bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold">Low Carb</span>
              <span className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-semibold">Allulose Sweetener</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;