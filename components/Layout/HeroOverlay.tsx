import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Battery, Gauge, X } from 'lucide-react';

interface HeroOverlayProps {
  isDark: boolean;
  onViewFleet?: () => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ isDark, onViewFleet }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
    <div className="relative z-20 w-full h-full pointer-events-none px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 pt-24 md:pt-28 pb-12 md:pb-14">
        <div className="lg:col-span-7 xl:col-span-8 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 md:mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-red mb-2 block">
              Agence Premium à Rabat
            </span>
            <p className="max-w-xl text-sm md:text-base font-medium text-slate-800 dark:text-gray-200 leading-relaxed backdrop-blur-sm bg-white/20 dark:bg-black/25 px-3 py-2.5 rounded-xl border border-white/20 shadow-lg">
              Location de voitures premium pour particuliers et entreprises : réservation simple, livraison rapide et service professionnel.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem] font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-6 md:mb-7 font-['Space_Grotesk'] drop-shadow-xl">
              LOCATION <span className="text-brand-red">PREMIUM</span><br className="block" />
              À RABAT
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={onViewFleet}
              className="group relative px-6 md:px-7 py-3 md:py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold overflow-hidden transition-all hover:scale-[1.03] shadow-2xl hover:shadow-brand-red/40"
            >
              <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors" />
              <span className="relative z-10 flex items-center gap-2">
                Réserver
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-12 h-12 md:w-13 md:h-13 rounded-full border border-slate-900/20 dark:border-white/20 bg-white/15 dark:bg-black/25 backdrop-blur-md flex items-center justify-center group hover:bg-white/25 transition-all"
            >
              <Play className="w-5 h-5 text-slate-900 dark:text-white fill-current opacity-85 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 pointer-events-auto w-full">
          <div className="flex flex-row lg:flex-col xl:flex-row gap-3 md:gap-4 justify-start lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.6 }}
              className="w-full min-w-[10.5rem] max-w-[13rem] lg:max-w-none lg:w-full xl:w-[12rem] bg-white/82 dark:bg-black/45 backdrop-blur-xl border border-white/25 p-3 md:p-3.5 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Autonomie</span>
                <Battery className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-[2rem] font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">620</span>
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">km</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.72 }}
              className="w-full min-w-[10.5rem] max-w-[13rem] lg:max-w-none lg:w-full xl:w-[12rem] bg-white/82 dark:bg-black/45 backdrop-blur-xl border border-white/25 p-3 md:p-3.5 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Top Speed</span>
                <Gauge className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-[2rem] font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">230</span>
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">km/h</span>
              </div>
            </motion.div>
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