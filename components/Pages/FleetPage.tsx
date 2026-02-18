import React from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import FleetSection from '../Features/FleetSection';
import { Car, UserInfo } from '../../types';
import { motion } from 'framer-motion';

interface FleetPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onBook: (data: { car: Car }) => void;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  currentUser?: UserInfo | null;
}

const FleetPage: React.FC<FleetPageProps> = ({ isDark, toggleTheme, onLoginClick, onBook, onNavigate, onLogout, currentUser }) => {
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'}`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick}
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
               src="https://source.unsplash.com/2000x1200/?rabat,car,rental,street" 
                alt="Fleet Header" 
                className="w-full h-full object-cover opacity-20 dark:opacity-10"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-brand-light/90 to-brand-light dark:from-brand-navy/90 dark:to-brand-navy"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="text-brand-teal font-bold tracking-[0.2em] text-xs uppercase mb-4 block">atellaFleet Rabat</span>
                <h1 className="text-5xl md:text-7xl font-bold text-brand-navy dark:text-white font-space mb-6">
                  Toute la <span className="text-brand-blue">Flotte</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Découvrez tous nos véhicules disponibles à Rabat : citadines, SUV, berlines et utilitaires pour particuliers et entreprises.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Reuse Fleet Section but maybe we could have customized it more. 
          For now, reusing ensures consistency and functionality. */}
      <div className="flex-grow">
          <FleetSection onBook={onBook} />
      </div>

      <Footer />
    </div>
  );
};

export default FleetPage;