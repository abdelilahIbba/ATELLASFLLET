import React, { useState } from 'react';
import { Search, Calendar, MapPin, Car } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationBarProps {
  onBook: (data?: any) => void;
}

const ReservationBar: React.FC<ReservationBarProps> = ({ onBook }) => {
  const [location, setLocation] = useState('Los Angeles (LAX)');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSearch = () => {
    onBook({
      location,
      pickupDate,
      returnDate
    });
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30 -mt-16 sm:-mt-20 md:-mt-32 mb-16"
    >
      <div className="bg-white/90 dark:bg-[#0f172a]/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-brand-blue/10 ring-1 ring-black/5 dark:ring-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            
            {/* Location */}
            <div className="lg:col-span-3 space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Lieu de Prise en Charge</label>
                <div className="relative group transistion-all duration-300">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-brand-red group-hover:scale-110 transition-transform" />
                    </div>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full pl-10 pr-10 py-4 text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border-0 rounded-xl focus:ring-2 focus:ring-brand-red transition-all cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                        <option>Los Angeles (LAX)</option>
                        <option>New York (JFK)</option>
                        <option>Miami (MIA)</option>
                        <option>Londres (LHR)</option>
                    </select>
                </div>
            </div>

            {/* Dates */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Date de Prise en Charge</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-brand-red group-hover:scale-110 transition-transform" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Sélectionnez une Date" 
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          onFocus={(e) => e.target.type = 'date'}
                          className="block w-full pl-10 pr-3 py-4 text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border-0 rounded-xl focus:ring-2 focus:ring-brand-red transition-all placeholder:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Date de Restitution</label>
                    <div className="relative group">
                         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-brand-red group-hover:scale-110 transition-transform" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Sélectionnez une Date" 
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          onFocus={(e) => e.target.type = 'date'}
                          className="block w-full pl-10 pr-3 py-4 text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border-0 rounded-xl focus:ring-2 focus:ring-brand-red transition-all placeholder:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10" 
                        />
                    </div>
                </div>
            </div>

            {/* Car Type */}
            <div className="lg:col-span-3 space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Type de Véhicule</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-brand-red group-hover:scale-110 transition-transform" />
                    </div>
                    <select className="block w-full pl-10 pr-10 py-4 text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border-0 rounded-xl focus:ring-2 focus:ring-brand-red transition-all cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-white/10">
                        <option>Toutes Catégories</option>
                        <option>Hyper Sport</option>
                        <option>SUV de Luxe</option>
                        <option>Berline Exécutive</option>
                    </select>
                </div>
            </div>

            {/* Action Button */}
            <div className="lg:col-span-2">
                <button 
                  onClick={handleSearch}
                  className="w-full h-[56px] mt-auto bg-brand-red hover:bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 transition-all flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                >
                    <Search className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Rechercher</span>
                </button>
            </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ReservationBar;