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
        className="w-full max-w-6xl mx-auto px-6 relative z-30 -mt-20 md:-mt-24 mb-10"
    >
      <div className="bg-white/80 dark:bg-brand-navy/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl shadow-brand-blue/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Location */}
            <div className="md:col-span-3 relative group">
                <label className="block text-[10px] uppercase font-bold text-brand-teal mb-1">Pick-up Location</label>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-transparent group-hover:border-brand-blue/30 transition-all">
                    <MapPin className="w-5 h-5 text-brand-navy dark:text-slate-400" />
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-transparent w-full text-sm font-semibold text-brand-navy dark:text-white outline-none cursor-pointer"
                    >
                        <option>Los Angeles (LAX)</option>
                        <option>New York (JFK)</option>
                        <option>Miami (MIA)</option>
                        <option>London (LHR)</option>
                    </select>
                </div>
            </div>

            {/* Dates */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
                 <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-brand-teal mb-1">Pick-up Date</label>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-transparent group-hover:border-brand-blue/30 transition-all">
                        <Calendar className="w-5 h-5 text-brand-navy dark:text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Select Date" 
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          onFocus={(e) => e.target.type = 'date'}
                          className="bg-transparent w-full text-sm font-semibold text-brand-navy dark:text-white outline-none placeholder:text-slate-500" 
                        />
                    </div>
                </div>
                <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-brand-teal mb-1">Return Date</label>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-transparent group-hover:border-brand-blue/30 transition-all">
                        <Calendar className="w-5 h-5 text-brand-navy dark:text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Select Date" 
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          onFocus={(e) => e.target.type = 'date'}
                          className="bg-transparent w-full text-sm font-semibold text-brand-navy dark:text-white outline-none placeholder:text-slate-500" 
                        />
                    </div>
                </div>
            </div>

            {/* Car Type */}
            <div className="md:col-span-3 relative group">
                <label className="block text-[10px] uppercase font-bold text-brand-teal mb-1">Vehicle Type</label>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-transparent group-hover:border-brand-blue/30 transition-all">
                    <Car className="w-5 h-5 text-brand-navy dark:text-slate-400" />
                    <select className="bg-transparent w-full text-sm font-semibold text-brand-navy dark:text-white outline-none cursor-pointer">
                        <option>All Categories</option>
                        <option>Hyper Sport</option>
                        <option>Luxury SUV</option>
                        <option>Executive Sedan</option>
                    </select>
                </div>
            </div>

            {/* Action Button */}
            <div className="md:col-span-2 h-full flex items-end">
                <button 
                  onClick={handleSearch}
                  className="w-full h-[52px] bg-brand-red hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 transition-all flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    <span>Book Now</span>
                </button>
            </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ReservationBar;