import React, { useState } from 'react';
import { CARS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Settings2, Users } from 'lucide-react';
import { Car } from '../../types';

interface FleetSectionProps {
  onBook: (data: { car: Car }) => void;
  maxVisible?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ onBook, maxVisible, showViewAll = false, onViewAll }) => {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const categories = ['Tous', 'Citadine', 'SUV', 'Berline', 'Utilitaire', 'Automatique', 'Diesel', 'Économique'];

  const hasEconomyFlag = (car: Car) =>
    car.features.some(feature => /économique|consommation/i.test(feature)) || car.pricePerDay <= 360;

  const filteredCars = activeCategory === 'Tous' 
    ? CARS 
    : CARS.filter(car => {
        if (['Citadine', 'SUV', 'Berline', 'Utilitaire'].includes(activeCategory)) {
          return car.category === activeCategory;
        }
        if (activeCategory === 'Automatique') {
          return /automatique/i.test(car.speed);
        }
        if (activeCategory === 'Diesel') {
          return /diesel/i.test(car.range);
        }
        if (activeCategory === 'Économique') {
          return hasEconomyFlag(car);
        }
        return true;
      });

  const displayedCars = maxVisible ? filteredCars.slice(0, maxVisible) : filteredCars;

  return (
    <section id="fleet" className="py-32 bg-brand-light dark:bg-brand-navy relative z-10 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="text-left w-full md:w-auto">
            <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">Nos Véhicules</span>
            <h2 className="text-4xl md:text-6xl font-bold text-brand-navy dark:text-white font-space leading-none transition-colors duration-700">
              Notre Flotte <br /><span className="text-brand-blue">à Rabat</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 max-w-xl">
              Des modèles fiables et demandés au Maroc, adaptés aux besoins quotidiens, professionnels et longue durée.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-start md:justify-end w-full md:w-auto">
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
            {displayedCars.map((car) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={car.id}
                className="group relative h-[420px] md:h-[460px] w-full overflow-hidden bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg"
              >
                {/* Image Background */}
                <div className="absolute inset-0">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/35 to-transparent opacity-90 dark:from-black dark:via-black/60 transition-opacity duration-500"></div>
                </div>

                <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-2xl"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-between z-20">
                  
                  {/* Top Tags */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                     <span className="bg-brand-blue/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                       {car.category}
                     </span>
                     <span className="bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                       Disponible immédiatement
                     </span>
                    </div>
                    {['c3', 'c6', 'c11'].includes(car.id) && (
                      <span className="bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                        -10% longue durée
                      </span>
                    )}
                  </div>

                  {/* Bottom Info */}
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                     <h3 className="text-2xl md:text-3xl font-space font-bold text-white mb-2 leading-tight drop-shadow-md">
                       {car.name}
                     </h3>

                     <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-100 text-xs font-medium border-t border-white/20 pt-4 opacity-100">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-brand-teal" />
                          <span>{car.speed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Fuel className="w-4 h-4 text-brand-teal" />
                           <span>{car.range}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Users className="w-4 h-4 text-brand-teal" />
                           <span>{car.features[0] || '5 places'}</span>
                        </div>
                     </div>

                     <p className="mt-3 text-xs text-slate-200">{car.features.slice(1).join(' • ')}</p>
                     
                     <div className="mt-4 flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-200 uppercase tracking-wider block">À partir de</span>
                          <span className="text-2xl font-bold text-white">{car.pricePerDay}</span>
                          <span className="text-slate-300 text-xs uppercase ml-1">DH / jour</span>
                        </div>
                        <button 
                          onClick={() => onBook({ car })}
                          className="px-4 py-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                        >
                          Réserver
                        </button>
                     </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {showViewAll && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={onViewAll}
              className="px-6 py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
            >
              Voir toute la flotte
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FleetSection;