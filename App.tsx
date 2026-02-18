import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Layout/Navbar';
import HeroSlider from './components/Layout/HeroSlider';
import HeroOverlay from './components/Layout/HeroOverlay';
import ReservationBar from './components/Features/ReservationBar';
import FleetSection from './components/Features/FleetSection';
import ServicesSection from './components/Features/ServicesSection';
import OffersSection from './components/Features/OffersSection';
import LoyaltySection from './components/Features/LoyaltySection';
import WhyChooseUs from './components/Features/WhyChooseUs';
import TestimonialsSection from './components/Features/TestimonialsSection';
import LocationsSection from './components/Features/LocationsSection';
import Footer from './components/Layout/Footer';
import AssistantModal from './components/AI/AssistantModal';
import BookingModal from './components/Booking/BookingModal';
import AuthModal from './components/Auth/AuthModal';
import FleetPage from './components/Pages/FleetPage';
import BookingTrackingPage from './components/Pages/BookingTrackingPage';
import ContactPage from './components/Pages/ContactPage';
import AdminDashboard from './components/Pages/AdminDashboard';
import { Car, Booking, UserInfo } from './types';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  // Initialize state from localStorage if available
  const [currentView, setCurrentView] = useState<'home' | 'fleet' | 'tracking' | 'contact' | 'admin'>(() => {
    const savedView = localStorage.getItem('currentView');
    return (savedView as 'home' | 'fleet' | 'tracking' | 'contact' | 'admin') || 'home';
  });
  
  // User / Auth State
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Validation Effect: Prevent unauthorized access to admin view
  useEffect(() => {
    if (currentView === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
      setCurrentView('home');
    }
  }, [currentView, currentUser]);

  // Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState<{ car?: Car, location?: string } | undefined>(undefined);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

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

  const handleBookingSuccess = (booking: Booking) => {
    setCurrentBooking(booking);
    
    // Auto-login the user with the details provided during booking
    setCurrentUser({
        ...booking.user,
        role: 'client' // Explicitly a client after booking
    });

    // Switch to tracking view automatically
    setTimeout(() => {
        setIsBookingOpen(false);
        handleNavigation('tracking');
    }, 2000); 
  };

  const handleLoginClick = () => {
    if (currentUser) {
        if (currentUser.role === 'admin') {
            handleNavigation('admin');
        } else {
            handleNavigation('tracking');
        }
    } else {
        setIsAuthOpen(true);
    }
  };

  const handleAuthLogin = (email: string, password: string, role: 'client' | 'admin') => {
    if (role === 'admin') {
        // Check credentials
        if (email !== 'contact@devnapp.com' || password !== 'devnapp@123') {
            // alert('Identifiants admin invalides. Accès refusé.'); // Removed alert
            return false; // Return failure
        }
        
        // Admin Login
        setCurrentUser({
            firstName: 'Admin',
            lastName: 'System',
            role: 'admin',
            email: email,
            accessKey: 'SYS-ROOT-01',
            photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
        });
        setCurrentView('admin');
    } else {
        // Client Login
        setCurrentUser({
            firstName: 'Alexander',
            lastName: 'Pierce',
            role: 'client',
            email: email,
            accessKey: 'ELITE-8821',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
        });
        setCurrentView('home');
    }
    setIsAuthOpen(false);
    return true; // Return success
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    localStorage.removeItem('currentUser');
  };

  const handleNavigation = (path: string) => {
    if (path === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'fleet' || path === 'flotte') {
      setCurrentView('fleet');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'tracking') {
      setCurrentView('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'contact') {
      setCurrentView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path.startsWith('#')) {
      if (currentView !== 'home') {
        setCurrentView('home');
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
    <>
      <div className={`min-h-screen font-sans selection:bg-brand-red selection:text-white transition-colors duration-700 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-slate-900'}`}>
        
        {currentView === 'home' && (
          <>
            <Navbar 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              onLoginClick={handleLoginClick} 
              onNavigate={handleNavigation}
              onLogout={handleLogout}
              currentUser={currentUser}
            />

            <section className="relative h-screen w-full overflow-hidden transition-colors duration-700 bg-gray-50 dark:bg-brand-navy">
              {/* Subtle gradient for depth, but clearer in center for the car */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 to-transparent dark:from-black/40 dark:to-transparent z-[1] pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent dark:from-brand-navy dark:via-brand-navy/80 dark:to-transparent z-[1] pointer-events-none"></div>
              
              <div className="absolute inset-0 z-0">
                 <HeroSlider isDark={isDark} />
              </div>
              <HeroOverlay isDark={isDark} onViewFleet={() => handleNavigation('fleet')} />
            </section>

            <main className="relative z-10 transition-colors duration-700 bg-brand-light dark:bg-brand-navy">
              {/* Modern Spacer for Reservation Bar */}
                <div className="pt-16 md:pt-10 lg:pt-8">
                  <ReservationBar onBook={handleBookNow} />
              </div>

              <ServicesSection />
              <FleetSection 
                onBook={handleBookNow} 
                maxVisible={6}
                showViewAll={true}
                onViewAll={() => handleNavigation('flotte')}
              />
              <LoyaltySection />
              <OffersSection onBook={handleBookNow} />
              <WhyChooseUs />
              <TestimonialsSection />
              <LocationsSection />
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
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        )}

        {currentView === 'tracking' && (
          <BookingTrackingPage
            isDark={isDark}
            toggleTheme={toggleTheme}
            onLoginClick={handleLoginClick}
            onNavigate={handleNavigation}
            booking={currentBooking}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            isDark={isDark}
            toggleTheme={toggleTheme}
            onLoginClick={handleLoginClick}
            onNavigate={handleNavigation}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            isDark={isDark}
            toggleTheme={toggleTheme}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        )}

        {currentView !== 'admin' && <AssistantModal />}
        
        <BookingModal 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          initialData={bookingData} 
          onBookingSuccess={handleBookingSuccess}
        />

        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleAuthLogin}
        />
      </div>
    </>
  );
};

export default App;