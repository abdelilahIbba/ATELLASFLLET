import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1614200187524-dc411a4f01b3?auto=format&fit=crop&q=80&w=2000',
    alt: 'Audi RS E-tron GT',
    title: 'Adrénaline Pure',
    subtitle: "Découvrez la puissance brute de l'ingénierie allemande."
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&q=80&w=2000',
    alt: 'Audi RS Dark',
    title: 'Coureur Nocturne',
    subtitle: 'Dominez les rues avec furtivité et précision.'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=2000',
    alt: 'Audi RS Luxury',
    title: 'Luxe Sans Compromis',
    subtitle: 'Là où la performance rencontre un confort inégalé.'
  }
];

const HeroSlider: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dark mode images (the ones we set up)
  const DARK_IMAGES = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1614200187524-dc411a4f01b3?auto=format&fit=crop&q=80&w=2000',
      alt: 'Audi RS E-tron GT'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&q=80&w=2000',
      alt: 'Audi RS Dark'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=2000',
      alt: 'Audi RS Luxury'
    }
  ];

  // Light mode images (NEW: brighter, daylight, clean)
  const LIGHT_IMAGES = [
    {
       id: 1,
       url: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=2000&auto=format&fit=crop', // Audi Silver/White
       alt: 'Audi RS Daylight'
    },
    {
       id: 2,
       url: 'https://images.unsplash.com/photo-1606152421811-aa911307c696?q=80&w=2000&auto=format&fit=crop', // Clean studio or road
       alt: 'Audi RS Motion'
    },
    {
       id: 3,
       url: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2000&auto=format&fit=crop', // Interior or detail light
       alt: 'Audi RS Detail'
    }
  ];

  const images = isDark ? DARK_IMAGES : LIGHT_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Slower interval for better UX
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-700 ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isDark ? 'dark' : 'light'}-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }} // Smoother, no scale for performance
          className="absolute inset-0 w-full h-full will-change-opacity"
        >
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt}
            loading="eager"
            className={`w-full h-full object-cover transition-opacity duration-700 ${isDark ? 'opacity-60' : 'opacity-90'}`} 
          />
          {/* Overlay Gradient - Adapted for mode */}
          <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-700 ${
              isDark 
              ? 'from-brand-navy via-brand-navy/50 to-transparent opacity-90' 
              : 'from-white via-white/60 to-transparent opacity-80'
          }`} />
        </motion.div>
      </AnimatePresence>

      
      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? (isDark ? 'w-8 bg-brand-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-8 bg-brand-blue shadow-lg')
                : (isDark ? 'w-2 bg-white/20 hover:bg-white/40' : 'w-2 bg-slate-300 hover:bg-slate-400')
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
