import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Clock, 
  Battery, 
  Car,
  Map as MapIcon,
  Shield,
  Radio,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { CARS } from '../../constants';
import { Booking, UserInfo } from '../../types';

interface BookingTrackingPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate: (path: string) => void;
  booking?: Booking | null;
  currentUser?: UserInfo | null;
}

const BookingTrackingPage: React.FC<BookingTrackingPageProps> = ({ 
  isDark, 
  toggleTheme, 
  onLoginClick, 
  onNavigate, 
  booking, 
  currentUser 
}) => {
  const [systemState, setSystemState] = useState<'initializing' | 'locating' | 'locked'>('initializing');
  const [now, setNow] = useState(new Date());
  const [deliveryTimer, setDeliveryTimer] = useState(12 * 60); // 12 minutes in seconds

  // Real-time Clock & Delivery Timer
  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    const deliveryInterval = setInterval(() => {
        setDeliveryTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
        clearInterval(clockInterval);
        clearInterval(deliveryInterval);
    };
  }, []);

  // Simulate System Boot Sequence
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setSystemState('locating');
    }, 1500);

    const locTimer = setTimeout(() => {
      setSystemState('locked');
    }, 3500);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(locTimer);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const car = booking?.car || CARS[0];
  const driver = {
      name: 'James C.',
      rating: 4.98,
      trips: 1242,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'} transition-colors duration-700`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick} 
        onNavigate={onNavigate}
        currentUser={currentUser} 
      />
      
      {/* Main Container - Fills space between Nav and Footer */}
      <main className="flex-grow relative w-full h-[85vh] lg:h-[80vh] bg-slate-50 dark:bg-[#050A14] overflow-hidden transition-colors duration-700">
          
          {/* --- TOP HUD OVERLAY --- */}
          <div className="absolute top-28 left-0 right-0 z-30 px-6 pointer-events-none">
              <div className="max-w-7xl mx-auto flex justify-between items-start">
                  
                  {/* Status Badge */}
                  <div className="bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full flex items-center gap-4 shadow-lg transition-colors">
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-500">Télémétrie en Direct</span>
                      </div>
                      <div className="h-4 w-px bg-slate-300 dark:bg-white/10"></div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-mono">{now.toLocaleTimeString()}</span>
                      </div>
                  </div>

                  {/* ETA Badge */}
                  <div className="bg-brand-red/90 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-lg shadow-brand-red/20 animate-pulse">
                      <span className="text-xs font-bold uppercase tracking-widest">Arrivée: {formatTimer(deliveryTimer)}</span>
                  </div>
              </div>
          </div>

          {/* --- MAP BACKGROUND LAYER --- */}
          <div className="absolute inset-0 bg-slate-100 dark:bg-[#050A14] z-0 transition-colors duration-700">
             {/* Grid Pattern */}
             <div className="absolute inset-0 opacity-20" 
                  style={{ 
                      backgroundImage: isDark 
                        ? 'radial-gradient(#1e293b 1px, transparent 1px)' 
                        : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                      backgroundSize: '32px 32px' 
                  }}>
             </div>
             
             {/* Abstract Map Path */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                 <path d="M 0 600 Q 400 400 800 600 T 1600 400" fill="none" stroke="#0D9488" strokeWidth="2" strokeDasharray="8 4" />
                 <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor:'#0D9488', stopOpacity:0.5}} />
                        <stop offset="100%" style={{stopColor: isDark ? '#050A14' : '#F1F5F9', stopOpacity:0}} />
                    </radialGradient>
                 </defs>
                 <circle cx="800" cy="600" r="300" fill="url(#grad1)" fillOpacity="0.2" />
             </svg>

             {/* Live User Location Pin */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                 <div className="w-4 h-4 bg-brand-blue dark:bg-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.8)] dark:shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse relative z-10 transition-colors"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-brand-blue/20 dark:border-white/20 rounded-full animate-ping"></div>
                 <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy px-2 py-1 rounded text-[10px] font-bold">VOUS</div>
             </div>
             
             {/* Moving Car Icon */}
             <motion.div 
                initial={{ x: -400, y: 150 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 30, ease: "linear" }}
                className="absolute top-1/2 left-1/2 z-20"
             >
                 <div className="relative">
                    <div className="bg-white dark:bg-brand-blue p-2.5 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] dark:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform -translate-x-1/2 -translate-y-1/2 border border-slate-200 dark:border-white/20 transition-colors">
                        <Car className="w-6 h-6 text-brand-blue dark:text-white" />
                    </div>
                    {/* Headlights effect */}
                    <div className="absolute top-1/2 left-full w-32 h-10 -translate-y-1/2 bg-gradient-to-r from-brand-blue/20 dark:from-white/30 to-transparent blur-md transform rotate-12 origin-left transition-colors"></div>
                 </div>
             </motion.div>
          </div>

          {/* --- CONTENT PANELS LAYER --- */}
          <div className="absolute inset-0 z-10 pointer-events-none p-6 pt-32 flex flex-col justify-end lg:flex-row lg:justify-between lg:items-end max-w-7xl mx-auto">
              
              {/* Left Panel: Vehicle Stats */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pointer-events-auto w-full lg:w-96 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-4 lg:mb-0 shadow-2xl transition-colors"
              >
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/20 dark:border-brand-blue/30">
                              <Car className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold font-space text-brand-navy dark:text-white leading-none">{car.name}</h3>
                              <p className="text-[10px] text-brand-teal uppercase tracking-wider font-bold mt-1">{car.category} CLASS</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">License</p>
                          <p className="text-sm font-mono text-brand-navy dark:text-white">8X-9921</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 transition-colors">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>Autonomie</span>
                              <Battery className="w-3 h-3 text-green-500 dark:text-green-400" />
                          </div>
                          <p className="text-lg font-mono font-bold text-brand-navy dark:text-white">88%</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5 transition-colors">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>Distance</span>
                              <Navigation className="w-3 h-3 text-brand-blue" />
                          </div>
                          <p className="text-lg font-mono font-bold text-brand-navy dark:text-white">4.2 mi</p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <Shield className="w-3 h-3 text-brand-teal" />
                      <span>Systèmes nominaux. Transport sécurisé actif.</span>
                  </div>
              </motion.div>

              {/* Right Panel: Driver & Comms */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pointer-events-auto w-full lg:w-96 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl transition-colors"
              >
                  <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                          <img src={driver.image} alt="Chauffeur" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0B1120] rounded-full"></div>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Valet Assigné</p>
                          <h3 className="text-lg font-bold text-brand-navy dark:text-white">{driver.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-yellow-500 mt-1">
                              <span className="flex items-center gap-1">★★★★★</span>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">({driver.trips} Trajets)</span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl transition-colors group">
                          <Phone className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-200">Appeler</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-brand-blue hover:bg-brand-blue/90 border border-transparent rounded-xl transition-colors shadow-lg shadow-brand-blue/20 group">
                          <MessageSquare className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-white">Message</span>
                      </button>
                  </div>
              </motion.div>

          </div>

          {/* Center Loading State (Initial) */}
          <AnimatePresence>
            {systemState !== 'locked' && (
                <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.9, opacity: 0 }}
                   className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                >
                    <div className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border border-brand-teal/30 px-8 py-6 rounded-2xl text-center shadow-[0_0_50px_rgba(13,148,136,0.2)]">
                        <div className="w-12 h-12 border-4 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold font-space text-brand-navy dark:text-white mb-2">Établissement du lien sécurisé</h2>
                        <p className="text-brand-teal font-mono text-sm tracking-widest animate-pulse">CHIFFREMENT DU FLUX DE DONNÉES...</p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BookingTrackingPage;