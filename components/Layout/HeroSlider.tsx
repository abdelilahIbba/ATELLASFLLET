import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARS } from '../../constants';

const HeroSlider: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = CARS.map((car, index) => ({
    id: index + 1,
    url: car.image,
    alt: `${car.name} - atellaFleet`
  }));

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
