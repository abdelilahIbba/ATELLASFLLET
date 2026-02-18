import React from 'react';
import { LOCATIONS } from '../../constants';
import { MapPin, Phone, Clock3 } from 'lucide-react';

const LocationsSection: React.FC = () => {
  return (
      <section id="agency" className="py-24 bg-brand-light dark:bg-brand-navy border-t border-slate-100 dark:border-white/5 transition-colors duration-700">
         <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
               <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">Localisation</span>
               <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white font-space">Notre Agence à Rabat</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-4">Agence atellaFleet</h3>
                  <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                     <li className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-brand-red mt-0.5" />
                        <span>{LOCATIONS[0].address}, Rabat</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-brand-red mt-0.5" />
                        <span>+212 6 61 24 30 55</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <Clock3 className="w-5 h-5 text-brand-red mt-0.5" />
                        <span>Lundi - Samedi : 08:30 - 20:00<br />Dimanche : 10:00 - 16:00</span>
                     </li>
                  </ul>

                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Zones desservies</p>
                     <div className="flex flex-wrap gap-2">
                        {LOCATIONS.slice(1).map((loc, index) => (
                           <span key={index} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs text-slate-600 dark:text-slate-300">
                              {loc.city}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 min-h-[420px]">
                  <iframe
                     title="Google Maps - atellaFleet Rabat"
                     src="https://www.google.com/maps?q=Avenue%20Fal%20Ould%20Oumeir%20Agdal%20Rabat&output=embed"
                     width="100%"
                     height="100%"
                     style={{ border: 0, minHeight: '420px' }}
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                  />
               </div>
            </div>
         </div>
    </section>
  );
};

export default LocationsSection;