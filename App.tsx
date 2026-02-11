import React, { useState, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import HeroScene from './components/3d/HeroScene';
import HeroOverlay from './components/Layout/HeroOverlay';
import ReservationBar from './components/Features/ReservationBar';
import FleetSection from './components/Features/FleetSection';
import ServicesSection from './components/Features/ServicesSection';
import OffersSection from './components/Features/OffersSection';
import LoyaltySection from './components/Features/LoyaltySection';
import GallerySection from './components/Features/GallerySection';
import WhyChooseUs from './components/Features/WhyChooseUs';
import LocationsSection from './components/Features/LocationsSection';
import AboutSection from './components/Features/AboutSection';
import Footer from './components/Layout/Footer';
import AssistantModal from './components/AI/AssistantModal';
import BookingModal from './components/Booking/BookingModal';
import AuthModal from './components/Auth/AuthModal';
import FleetPage from './components/Pages/FleetPage';
import BookingTrackingPage from './components/Pages/BookingTrackingPage';
import ContactPage from './components/Pages/ContactPage';
import { Car } from './types';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'fleet' | 'tracking' | 'contact'>('home');
  
  // Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState<{ car?: Car, location?: string } | undefined>(undefined);

  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleBookNow = (data?: { car?: Car, location?: string }) => {
    setBookingData(data);
    setIsBookingOpen(true);
  };

  const handleLoginClick = () => {
    setIsAuthOpen(true);
  };

  // Centralized Navigation Handler
  const handleNavigation = (path: string) => {
    if (path === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'fleet') {
      setCurrentView('fleet');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'tracking') {
      setCurrentView('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'contact') {
      setCurrentView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path.startsWith('#')) {
      // Handle Anchor Links
      if (currentView !== 'home') {
        setCurrentView('home');
        // Allow state update to propagate before scrolling
        setTimeout(() => {
          const el = document.querySelector(path);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(path);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-teal selection:text-white transition-colors duration-700 ${isDark ? 'bg-brand-navy text-white' : 'bg-brand-light text-brand-navy'}`}>
      
      {currentView === 'home' && (
        <>
          <Navbar 
            isDark={isDark} 
            toggleTheme={toggleTheme} 
            onLoginClick={handleLoginClick} 
            onNavigate={handleNavigation}
          />

          {/* Hero Section */}
          <section className="relative h-screen w-full overflow-hidden transition-colors duration-700 bg-brand-light dark:bg-brand-navy">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-brand-light dark:from-black/20 dark:via-transparent dark:to-brand-navy z-1 pointer-events-none transition-colors duration-700"></div>

            <div className="absolute inset-0 z-0">
              <HeroScene isDark={isDark} />
            </div>
            
            <HeroOverlay isDark={isDark} onViewFleet={() => handleNavigation('fleet')} />
          </section>

          {/* Main Content Sections */}
          <main className="relative z-10 transition-colors duration-700 bg-brand-light dark:bg-brand-navy">
            
            {/* Floating Reservation Bar */}
            <ReservationBar onBook={handleBookNow} />
            
            <ServicesSection />
            
            <FleetSection onBook={handleBookNow} />
            
            <OffersSection onBook={handleBookNow} />
            
            <LoyaltySection />
            
            <GallerySection />
            
            <WhyChooseUs />
            
            <LocationsSection />
            
            <AboutSection />
            
          </main>

          <Footer onNavigate={handleNavigation} />
        </>
      )}

      {currentView === 'fleet' && (
        <FleetPage 
          isDark={isDark}
          toggleTheme={toggleTheme}
          onLoginClick={handleLoginClick}
          onBook={handleBookNow}
          onNavigateHome={() => handleNavigation('home')}
        />
      )}

      {currentView === 'tracking' && (
        <BookingTrackingPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onLoginClick={handleLoginClick}
          onNavigate={handleNavigation}
        />
      )}

      {currentView === 'contact' && (
        <ContactPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onLoginClick={handleLoginClick}
          onNavigate={handleNavigation}
        />
      )}

      <AssistantModal />
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        initialData={bookingData} 
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default App;