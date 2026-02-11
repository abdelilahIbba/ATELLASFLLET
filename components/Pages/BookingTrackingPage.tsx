import React, { useState } from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Clock, MapPin, Calendar, Car as CarIcon, ArrowRight, Loader2, AlertCircle, Package, Key } from 'lucide-react';
import { CARS } from '../../constants';

interface BookingTrackingPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate: (path: string) => void;
}

const BookingTrackingPage: React.FC<BookingTrackingPageProps> = ({ isDark, toggleTheme, onLoginClick, onNavigate }) => {
  const [refCode, setRefCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode) return;

    setStatus('searching');
    
    // Simulate API search - Always found for demo purposes
    setTimeout(() => {
      setStatus('found');
    }, 1000);
  };

  const bookingData = {
    id: refCode || '#AERO-8821', // Use entered code or default
    car: CARS[0], // Atellas GT Stradale
    pickupDate: 'Oct 24, 2024',
    returnDate: 'Oct 27, 2024',
    location: 'Los Angeles (LAX)',
    status: 'preparing', // confirmed, preparing, ready, completed
    steps: [
      { id: 1, label: 'Order Placed', time: 'Oct 20, 10:30 AM', completed: true },
      { id: 2, label: 'Confirmed', time: 'Oct 20, 10:35 AM', completed: true },
      { id: 3, label: 'Vehicle Prep', time: 'In Progress', completed: true, current: true },
      { id: 4, label: 'Ready for Pickup', time: 'Est. Oct 24, 09:00 AM', completed: false },
    ]
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'} transition-colors duration-700`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick}
        onNavigate={onNavigate} 
      />

      <div className="flex-grow pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-brand-teal font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Concierge Status</span>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-navy dark:text-white font-space mb-4">
              Track Your <span className="text-brand-blue">Reservation</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Enter your booking reference to view real-time status updates, vehicle preparation details, and pickup instructions.
            </p>
          </div>

          {/* Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0B1120] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-white/5 mb-12"
          >
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end justify-center">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirmation Code</label>
                <div className="relative group">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-blue group-focus-within:text-brand-teal transition-colors" />
                   <input 
                      type="text" 
                      placeholder="e.g. #AERO-8821" 
                      value={refCode}
                      onChange={(e) => setRefCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-all uppercase"
                   />
                </div>
              </div>
              
              <div className="md:col-span-4">
                <button 
                  type="submit"
                  disabled={status === 'searching'}
                  className="w-full py-4 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                  {status === 'searching' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Status'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Error Message - Kept just in case, though currently unreachable due to forced success */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="text-sm font-medium">Reservation not found. Please check your confirmation code and try again.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Card */}
          <AnimatePresence>
            {status === 'found' && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0B1120] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5"
              >
                {/* Header Strip */}
                <div className="bg-slate-50 dark:bg-white/5 p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Booking Reference</span>
                    <span className="text-2xl font-mono font-bold text-brand-navy dark:text-white tracking-wider">{bookingData.id}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-full">
                     <Clock className="w-4 h-4 animate-pulse" />
                     <span className="text-xs font-bold uppercase tracking-wider">In Preparation</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                   {/* Left: Car & Details */}
                   <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group">
                         <img src={bookingData.car.image} alt={bookingData.car.name} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                            <div>
                               <h3 className="text-white font-bold text-xl font-space">{bookingData.car.name}</h3>
                               <p className="text-slate-300 text-sm">{bookingData.car.category} Series</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                               <Calendar className="w-4 h-4 text-brand-navy dark:text-slate-400" />
                            </div>
                            <div>
                               <span className="text-[10px] font-bold text-slate-500 uppercase block">Timeline</span>
                               <p className="text-sm font-medium text-brand-navy dark:text-white">{bookingData.pickupDate} — {bookingData.returnDate}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                               <MapPin className="w-4 h-4 text-brand-navy dark:text-slate-400" />
                            </div>
                            <div>
                               <span className="text-[10px] font-bold text-slate-500 uppercase block">Pickup Location</span>
                               <p className="text-sm font-medium text-brand-navy dark:text-white">{bookingData.location}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right: Timeline */}
                   <div className="p-8 bg-slate-50/50 dark:bg-transparent">
                      <h4 className="text-sm font-bold text-brand-navy dark:text-white uppercase tracking-widest mb-8">Status Timeline</h4>
                      
                      <div className="relative space-y-8 pl-2">
                         {/* Connecting Line */}
                         <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-slate-200 dark:bg-white/10"></div>

                         {bookingData.steps.map((step, idx) => (
                           <div key={step.id} className="relative flex items-start gap-6 group">
                              {/* Dot */}
                              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ${
                                 step.current 
                                   ? 'bg-brand-blue border-brand-blue/30 shadow-lg shadow-brand-blue/30 scale-110' 
                                   : step.completed 
                                      ? 'bg-brand-teal border-brand-teal/30' 
                                      : 'bg-slate-200 dark:bg-white/5 border-slate-100 dark:border-white/5'
                              }`}>
                                 {step.completed || step.current ? (
                                    step.current ? <Package className="w-4 h-4 text-white animate-pulse" /> : <CheckCircle className="w-4 h-4 text-white" />
                                 ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                 )}
                              </div>
                              
                              <div className={`${step.completed || step.current ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                 <h5 className="font-bold text-brand-navy dark:text-white text-sm">{step.label}</h5>
                                 <p className="text-xs text-slate-500 mt-1 font-mono">{step.time}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
                         <button 
                            onClick={() => onNavigate('contact')}
                            className="w-full py-3 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                            Contact Support <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingTrackingPage;