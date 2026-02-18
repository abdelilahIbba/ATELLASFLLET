import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Battery, Zap, Gauge } from 'lucide-react';

interface HeroOverlayProps {
  isDark: boolean;
  onViewFleet?: () => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ isDark, onViewFleet }) => {
  return (
    <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between pt-24 pb-8 md:pb-16 px-6 md:px-12">
      
      {/* Top Section: Brand Statement - Floating Top Left */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-auto max-w-sm mt-4 hidden md:block"
      >
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-red mb-2 block">
          Depuis 2026
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-gray-300 leading-relaxed backdrop-blur-sm bg-white/10 p-3 rounded-lg border border-white/10">
          Redéfinir la mobilité de luxe avec une flotte exclusive de véhicules électriques hyper-performants.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row items-end justify-between w-full pb-8 md:pb-0 gap-8">
        
        {/* Main Title Area - Bottom Left */}
        <div className="w-full lg:w-3/5 flex flex-col justify-start lg:justify-end pointer-events-none z-10">
          <div className="pointer-events-auto">
             <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-6 font-['Space_Grotesk'] drop-shadow-2xl">
                LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-red to-orange-500">
                  FLOTTE
                </span><br/>
                DU FUTUR
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 mt-2 mb-4 lg:mb-0"
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
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-slate-900/20 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md flex items-center justify-center group hover:bg-white/20 transition-all"
              >
                <Play className="w-5 h-5 text-slate-900 dark:text-white fill-current opacity-80 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats Cards - Horizontal Layout aligned with bottom */}
        <div className="w-full lg:w-2/5 flex flex-row gap-3 items-end justify-start lg:justify-end pointer-events-auto overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
           {/* Stat Card 1 */}
           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.6 }}
             className="min-w-[140px] md:min-w-[180px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex-shrink-0"
           >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Accélération</span>
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-brand-red" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">1.9</span>
                <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">sec</span>
              </div>
           </motion.div>

           {/* Stat Card 2 */}
           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.7 }}
             className="min-w-[140px] md:min-w-[180px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex-shrink-0"
           >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Autonomie</span>
                <Battery className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">620</span>
                <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">mi</span>
              </div>
           </motion.div>

           {/* Stat Card 3 */}
            <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.8 }}
             className="min-w-[140px] md:min-w-[180px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex-shrink-0"
           >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Top Speed</span>
                <Gauge className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">258</span>
                <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">mph</span>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default HeroOverlay;