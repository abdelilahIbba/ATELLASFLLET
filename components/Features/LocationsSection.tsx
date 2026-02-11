import React from 'react';
import { LOCATIONS } from '../../constants';
import { MapPin, ArrowUpRight } from 'lucide-react';

const LocationsSection: React.FC = () => {
  return (
    <section id="locations" className="py-20 bg-brand-light dark:bg-brand-navy border-t border-slate-100 dark:border-white/5 transition-colors duration-700">
       <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
             <h2 className="text-3xl font-bold text-brand-navy dark:text-white font-space">
                 Global <span className="text-brand-teal">Presence</span>
             </h2>
             <p className="text-slate-500 text-sm mt-4 md:mt-0">Find us in the world's most vibrant cities.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
             {LOCATIONS.map((loc, idx) => (
                <div key={idx} className="group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-all text-brand-navy dark:text-slate-400">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h4 className="text-brand-navy dark:text-white font-bold text-sm mb-1 flex items-center gap-1">
                        {loc.city}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-slate-400 text-xs">{loc.address}</p>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};

export default LocationsSection;