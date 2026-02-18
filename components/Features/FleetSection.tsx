import React, { useState } from 'react';
import { CARS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Zap, Gauge, Fuel, Filter } from 'lucide-react';
import { Car } from '../../types';

interface FleetSectionProps {
  onBook: (data: { car: Car }) => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ onBook }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Hyper', 'SUV', 'Sedan', 'Convertible'];

  const filteredCars = activeCategory === 'All' 
    ? CARS 
    : CARS.filter(car => car.category === activeCategory);

  return (
    <section id="fleet" className="py-32 bg-brand-light dark:bg-brand-navy relative z-10 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">Notre Collection</span>
            <h2 className="text-4xl md:text-6xl font-bold text-brand-navy dark:text-white font-space leading-none transition-colors duration-700">
              Arrivées <br /><span className="text-brand-blue">En Vedette</span>
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy shadow-lg' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence>
            {filteredCars.map((car) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={car.id}
                className="group relative h-[400px] md:h-[500px] w-full overflow-hidden bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl shadow-brand-blue/5 dark:shadow-none"
              >
                {/* Image Background */}
                <div className="absolute inset-0">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out dark:grayscale group-hover:grayscale-0"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-80 dark:opacity-90 dark:from-black dark:via-black/50 transition-opacity duration-500"></div>
                </div>

                {/* Hover Glow Border */}
                <div className="absolute inset-0 border-2 border-brand-teal/0 group-hover:border-brand-teal/50 transition-colors duration-500 pointer-events-none rounded-2xl"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                  
                  {/* Top Tags */}
                  <div className="flex justify-between items-start">
                     <span className="bg-brand-teal/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-lg">
                       {car.category}
                     </span>
                     <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                        <ArrowUpRight className="text-white w-5 h-5" />
                     </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <h3 className="text-3xl font-space font-bold text-white mb-2 leading-tight drop-shadow-md">
                       {car.name}
                     </h3>
                     
                     <div className="flex items-center gap-6 mt-4 text-slate-200 dark:text-neutral-300 text-xs font-medium border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-brand-teal" />
                          <span>{car.speed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Gauge className="w-4 h-4 text-brand-teal" />
                           <span>{car.range}</span>
                        </div>
                     </div>
                     
                     <div className="mt-4 flex justify-between items-end">
                        <div>
                          <span className="text-2xl font-bold text-white">${car.pricePerDay}</span>
                          <span className="text-slate-300 dark:text-neutral-500 text-xs uppercase ml-1">/ Day</span>
                        </div>
                        <button 
                          onClick={() => onBook({ car })}
                          className="text-xs font-bold text-brand-red uppercase tracking-widest hover:text-red-400 transition-colors"
                        >
                          Reserve Now
                        </button>
                     </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default FleetSection;