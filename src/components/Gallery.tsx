import React from 'react';
import EditablePhoto from './EditablePhoto';

const Gallery: React.FC = () => {
  const images = [
    {
      src: "/images/rolls/berryblast.png",
      alt: "Berry Blast ice cream roll"
    },
    {
      src: "/images/rolls/cookiemonster.png",
      alt: "Cookie Monster ice cream roll"
    },
    {
      src: "/images/rolls/matchamadness.png",
      alt: "Matcha Madness ice cream roll"
    },
    {
      src: "/images/rolls/thaimeup.png",
      alt: "Thai Me Up ice cream roll"
    },
    {
      src: "/images/rolls/smoresgalore.png",
      alt: "S'mores Galore ice cream roll"
    },
    {
      src: "/images/rolls/girlsbestfriend.png",
      alt: "Girl's Best Friend ice cream roll"
    },
    {
      src: "/images/rolls/honeybooboo.png",
      alt: "Honey Boo Boo ice cream roll"
    },
    {
      src: "/images/rolls/matteblack.png",
      alt: "Matte Black ice cream roll"
    },
    {
      src: "/images/rolls/coffeebreak.png",
      alt: "Coffee Break ice cream roll"
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500">Gallery</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a look at some of our most popular ice cream rolls. Each one is a work of art, 
            crafted with love and the finest ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <EditablePhoto
                canonicalSrc={image.src}
                alt={image.alt}
                className="relative w-full h-64"
                imgClassName="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{image.alt}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;