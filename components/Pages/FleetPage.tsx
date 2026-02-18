import React from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import FleetSection from '../Features/FleetSection';
import { Car } from '../../types';
import { motion } from 'framer-motion';

interface FleetPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onBook: (data: { car: Car }) => void;
  onNavigateHome: () => void;
}

const FleetPage: React.FC<FleetPageProps> = ({ isDark, toggleTheme, onLoginClick, onBook, onNavigateHome }) => {
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'}`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick}
        onNavigate={onNavigateHome} // Ensure Navbar logo/links can navigate back home if needed
      />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
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
                <span className="text-brand-teal font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Le Garage</span>
                <h1 className="text-5xl md:text-7xl font-bold text-brand-navy dark:text-white font-space mb-6">
                    Chefs-d'œuvre en <span className="text-brand-blue">Mouvement</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Découvrez notre collection exclusive de véhicules haute performance. Des hypercars prêtes pour la piste aux SUV de direction, trouvez le compagnon idéal pour votre voyage.
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