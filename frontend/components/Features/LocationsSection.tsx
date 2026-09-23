import React from 'react';
import { LOCATIONS } from '../../constants';
import { MapPin, Phone, Clock3, Instagram, ExternalLink, Navigation } from 'lucide-react';

const LocationsSection: React.FC = () => {
  return (
      <section id="agency" className="py-24 bg-brand-light dark:bg-brand-navy border-t border-slate-100 dark:border-white/5 transition-colors duration-700">
         <div className="w-full lg:px-16 xl:px-20 2xl:px-28 mx-auto px-6">
            <div className="mb-10">
               <span className="text-brand-red font-bold tracking-widest text-xs uppercase mb-2 block">Localisation &amp; Contact</span>
               <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white font-space">Notre Agence à Tanger</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                 Retrouvez RLV Rahimi Car à Tanger pour vos locations de voitures avec livraison rapide à l'aéroport et en ville.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               <div className="lg:col-span-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                       <img src="/rlv-emblem.png" alt="RLV Rahimi Car" className="w-10 h-10 object-contain" />
                       <div>
                          <h3 className="text-xl font-bold text-brand-navy dark:text-white leading-tight">
                            RLV <span className="text-brand-red">Rahimi Car</span>
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Location de voitures · Tanger</span>
                       </div>
                    </div>

                    <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                       <li className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block text-brand-navy dark:text-white">Adresse Agence :</span>
                            <span>LOT EL NAHDA RUE 37 N°12 BLOC 38, Tanger, Maroc</span>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block text-brand-navy dark:text-white">Téléphone &amp; Réservations :</span>
                            <a href="tel:0677813718" className="text-brand-red hover:underline font-bold text-base">
                              06 77 81 37 18
                            </a>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <Instagram className="w-5 h-5 text-[#E4405F] mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block text-brand-navy dark:text-white">Instagram Officiel :</span>
                            <a 
                              href="https://www.instagram.com/location_rahimi_car/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#E4405F] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              @location_rahimi_car
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <Clock3 className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block text-brand-navy dark:text-white">Horaires d'Ouverture :</span>
                            <span>Lundi - Dimanche : 08:00 - 22:00 (Service 7j/7)</span>
                          </div>
                       </li>
                    </ul>

                    {/* Direct map link button */}
                    <div className="mt-6 flex flex-wrap gap-3">
                       <a
                          href="https://maps.app.goo.gl/UuuWUo23BkbPAaDX8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy dark:bg-white text-white dark:text-brand-navy font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
                       >
                          <Navigation className="w-4 h-4 text-brand-red" />
                          Itinéraire Google Maps
                          <ExternalLink className="w-3.5 h-3.5" />
                       </a>
                       <a
                          href="https://www.instagram.com/location_rahimi_car/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md"
                       >
                          <Instagram className="w-4 h-4" />
                          Suivez-nous
                       </a>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-bold">Points de Livraison à Tanger</p>
                     <div className="flex flex-wrap gap-2">
                        {LOCATIONS.map((loc, index) => (
                           <span key={index} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {loc.city}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 min-h-[440px] shadow-lg relative">
                  <iframe
                     title="Google Maps - RLV Rahimi Car : Location de voitures Tanger"
                     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1221.4052034165536!2d-5.7967684713771135!3d35.751870853831946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b81fadead90e9%3A0x1ea45b869ae7b2f0!2sRLV%20Rahimi%20Car%20%3A%20Location%20de%20voitures.!5e1!3m2!1sar!2sma!4v1790130295922!5m2!1sar!2sma"
                     width="100%"
                     height="100%"
                     style={{ border: 0, minHeight: '440px' }}
                     loading="lazy"
                     allowFullScreen={false}
                     referrerPolicy="strict-origin-when-cross-origin"
                  />
               </div>
            </div>
         </div>
    </section>
  );
};

export default LocationsSection;