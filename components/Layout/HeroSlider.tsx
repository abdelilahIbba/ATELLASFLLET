import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSlider: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'SUV Honda blanc'
    },
    {
      id: 2,
      url: 'https://plus.unsplash.com/premium_photo-1661288451211-b61d32db1d11?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Voiture premium 1'
    },
    {
      id: 3,
      url: 'https://plus.unsplash.com/premium_photo-1661277774967-7e1ed4df6c3d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Voiture premium 2'
    },
    {
      id: 4,
      url: 'https://plus.unsplash.com/premium_photo-1682097377171-08dcb78ec4c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Voiture premium 3'
    }
  ];

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
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isDark ? 'opacity-72' : 'opacity-96'}`} 
          />
          {/* Overlay Gradient - Adapted for mode */}
          <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-700 ${
              isDark 
              ? 'from-brand-navy/80 via-brand-navy/35 to-transparent opacity-78' 
              : 'from-white/30 via-white/12 to-transparent opacity-45'
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
