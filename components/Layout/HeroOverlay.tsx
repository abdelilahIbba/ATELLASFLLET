import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';

interface HeroOverlayProps {
  isDark: boolean;
  onViewFleet?: () => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ isDark, onViewFleet }) => {
  return (
    <div className="relative z-10 w-full h-screen pointer-events-none flex flex-col md:flex-row items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full h-full flex flex-col md:flex-row">
        
        {/* Adjusted padding: pt-40 for mobile, pt-28 for tablet/desktop to clear fixed Navbar */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start md:justify-center h-full pt-40 md:pt-28 pointer-events-none">
          
          <div className="pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 relative"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-brand-navy dark:text-white leading-[0.95] mb-6 font-['Space_Grotesk'] tracking-tight transition-colors duration-700">
                Pure <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-teal to-brand-blue animate-gradient-x">
                  Adrenaline
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-8 max-w-lg leading-relaxed font-light transition-colors duration-700"
            >
              Engineering that defies physics. Design that captures the soul. 
              The all-new electric hypercar fleet has arrived at Atellas.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {/* Primary CTA - RED */}
              <button 
                onClick={onViewFleet}
                className="group relative px-8 py-4 bg-brand-red text-white rounded-lg font-bold overflow-hidden shadow-xl shadow-brand-red/20 transition-all hover:bg-red-600 hover:shadow-red-600/30 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  View Fleet
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              {/* Secondary CTA - Teal Outline */}
              <button className="px-8 py-4 bg-white/50 dark:bg-brand-navy/50 backdrop-blur-md text-brand-teal dark:text-brand-teal border border-brand-teal/30 hover:border-brand-teal rounded-lg font-bold hover:bg-brand-teal/5 transition-all flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Watch Film
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-8 max-w-md"
            >
              <div>
                  <p className="text-3xl font-bold text-brand-navy dark:text-white font-['Space_Grotesk'] transition-colors duration-700">1.9s</p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">0-60 MPH</p>
              </div>
              <div>
                  <p className="text-3xl font-bold text-brand-navy dark:text-white font-['Space_Grotesk'] transition-colors duration-700">600<span className="text-lg text-slate-500">mi</span></p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Range</p>
              </div>
              <div>
                  <p className="text-3xl font-bold text-brand-navy dark:text-white font-['Space_Grotesk'] transition-colors duration-700">1200<span className="text-lg text-slate-500">hp</span></p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Power</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroOverlay;