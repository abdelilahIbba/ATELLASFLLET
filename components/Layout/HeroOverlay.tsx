import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Battery, Zap, Gauge, X } from 'lucide-react';

interface HeroOverlayProps {
  isDark: boolean;
  onViewFleet?: () => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ isDark, onViewFleet }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
    <div className="relative z-20 w-full h-full pointer-events-none flex flex-col justify-between pt-24 md:pt-32 pb-10 lg:pb-14 px-4 sm:px-6 md:px-8">
      
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-between">
      {/* Top Section: Brand Statement - Floating Top Left */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-auto max-w-sm hidden md:block"
      >
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-red mb-2 block">
          Agence Premium à Rabat
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-gray-300 leading-relaxed backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/10 shadow-lg">
          Location de voitures premium pour particuliers et entreprises : réservation simple, livraison rapide et service professionnel.
        </p>
      </motion.div>

      <div className="w-full pb-36 lg:pb-44 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-8 lg:gap-10">
        
        {/* Main Title Area - Bottom Left */}
        <div className="lg:col-span-7 xl:col-span-8 w-full flex flex-col justify-end pointer-events-none z-20 pb-2 lg:pb-0">
          <div className="pointer-events-auto">
             <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-7 lg:mb-8 font-['Space_Grotesk'] drop-shadow-2xl">
                LOCATION <span className="text-brand-red">
                  PREMIUM
                </span><br className="block" />
                À RABAT
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 mt-3"
            >
              <button 
                onClick={onViewFleet}
                className="group relative px-6 py-3 md:px-8 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-brand-red/50"
              >
                <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Réserver
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-900/20 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md flex items-center justify-center group hover:bg-white/20 transition-all"
              >
                <Play className="w-5 h-5 text-slate-900 dark:text-white fill-current opacity-80 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats Cards - Horizontal Layout aligned with bottom */}
        <div className="lg:col-span-5 xl:col-span-4 w-full flex lg:justify-end pointer-events-auto z-30">
          <div className="w-full lg:max-w-[460px] flex flex-row gap-4 items-end justify-start lg:justify-end overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 pr-4 lg:pr-0">
           
           {/* Stat Card 2 */}
           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.7 }}
             className="min-w-[180px] md:min-w-[200px] lg:min-w-[210px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex-shrink-0 hover:bg-white/90 dark:hover:bg-black/60 transition-colors"
           >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Autonomie</span>
                <Battery className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">620</span>
                <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">km</span>
              </div>
           </motion.div>

           {/* Stat Card 3 */}
            <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.8 }}
             className="min-w-[180px] md:min-w-[200px] lg:min-w-[210px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex-shrink-0 hover:bg-white/90 dark:hover:bg-black/60 transition-colors"
           >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Top Speed</span>
                <Gauge className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">230</span>
                <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">km/h</span>
              </div>
           </motion.div>
          </div>
        </div>

      </div>
      </div>
      </div>
    </div>

    <AnimatePresence>
      {isVideoOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 pointer-events-auto"
           onClick={() => setIsVideoOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors"
            onClick={() => setIsVideoOpen(false)}
          >
            <X className="w-8 h-8 md:w-10 md:h-10" />
          </button>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/tSGW7Hb3X3s?si=3gwZaAFWjV3dULAQ&autoplay=1" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default HeroOverlay;