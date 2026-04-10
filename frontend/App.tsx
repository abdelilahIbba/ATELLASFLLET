import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import BookingModal from './components/Booking/BookingModal';
import AuthModal from './components/Auth/AuthModal';
import FleetPage from './components/Pages/FleetPage';
import BookingTrackingPage from './components/Pages/BookingTrackingPage';
import ContactPage from './components/Pages/ContactPage';
import AdminDashboard from './components/Pages/AdminDashboard';
import { Car, Booking, UserInfo } from './types';
import { authApi, setToken, clearToken, getToken, ApiError } from './services/api';

/** Translate common Laravel validation error strings to French. */
function translateRegisterError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already been taken') || m.includes('unique')) {
    return 'Cet email est déjà utilisé. Essayez de vous connecter ou utilisez une autre adresse.';
  }
  if (m.includes('at least 8') || m.includes('minimum') || m.includes('min:8')) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  if (m.includes('must contain at least one uppercase') || m.includes('mixed case')) {
    return 'Le mot de passe doit contenir des majuscules et des minuscules.';
  }
  if (m.includes('must contain at least one number') || m.includes('numbers')) {
    return 'Le mot de passe doit contenir au moins un chiffre.';
  }
  if (m.includes('must contain at least one symbol') || m.includes('symbols')) {
    return 'Le mot de passe doit contenir au moins un symbole spécial.';
  }
  if (m.includes('password')) {
    return 'Le mot de passe ne respecte pas les critères de sécurité requis.';
  }
  if (m.includes('email') && (m.includes('invalid') || m.includes('valid'))) {
    return 'Adresse email invalide.';
  }
  if (m.includes('required')) {
    return 'Tous les champs obligatoires doivent être remplis.';
  }
  if (m.includes('server') || m.includes('500') || m.includes('network')) {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion et réessayez.';
  }
  return msg;
}

function buildUserInfo(user: {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  demo_permissions?: string[] | null;
  demo_expires_at?: string | null;
}): UserInfo {
  const parts = (user.name ?? '').trim().split(' ').filter(Boolean);

  return {
    firstName: parts[0] || 'User',
    lastName: parts.slice(1).join(' '),
    role: user.role as 'client' | 'admin' | 'demo_admin',
    email: user.email,
    photo: user.avatar ?? undefined,
    accessKey: `ID-${user.id}`,
    demoPermissions: user.demo_permissions ?? undefined,
    demoExpiresAt: user.demo_expires_at ?? undefined,
  };
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  // User / Auth State
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser) as UserInfo;
    } catch {
      localStorage.removeItem('currentUser');
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setCurrentUser(null);
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;

    authApi.me()
      .then((resp) => {
        if (!isMounted || !resp?.user) return;
        setCurrentUser(buildUserInfo(resp.user));
      })
      .catch(() => {
        if (!isMounted) return;
        clearToken();
        setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Guard: redirect unauthenticated users away from /admin
  useEffect(() => {
    if (!isAuthReady) return;

    if (location.pathname.startsWith('/admin') && (!currentUser || !['admin', 'demo_admin'].includes(currentUser.role))) {
      navigate('/', { replace: true });
    }
  }, [isAuthReady, location.pathname, currentUser, navigate]);

  // Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState<{ car?: Car, location?: string } | undefined>(undefined);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  // When guest tries to book, we store the data and open it after auth
  const [pendingBookingAfterAuth, setPendingBookingAfterAuth] = useState(false);

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
    if (!getToken()) {
      // Not logged in — open auth modal and open booking modal after login
      setPendingBookingAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
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
        if (currentUser.role === 'admin' || currentUser.role === 'demo_admin') {
            handleNavigation('admin');
        } else {
            handleNavigation('tracking');
        }
    } else {
        setIsAuthOpen(true);
    }
  };

  const handleAuthLogin = async (
    email: string,
    password: string,
    role: 'client' | 'admin'
  ): Promise<boolean> => {
    console.log('[Auth] handleAuthLogin called →', { email, role });
    try {
      clearToken(); // ensure no stale token on each login attempt
      const resp = await authApi.login({ email, password });
      console.log('[Auth] API response →', resp);
      alert(`[DEBUG] API URL: ${import.meta.env.VITE_API_BASE_URL}\nResp: ${JSON.stringify(resp?.user?.role ?? resp)}`);

      if (!resp || !resp.user) {
        console.warn('[Auth] No resp or no user in response');
        return false;
      }
      const isAdminRole = resp.user.role === 'admin' || resp.user.role === 'demo_admin';
      if ((role === 'admin' && !isAdminRole) || (role === 'client' && resp.user.role !== 'client')) {
        console.warn(`[Auth] Role mismatch: API returned "${resp.user.role}", tab expects "${role}"`);
        return false;
      }

      setToken(resp.token);

      const userInfo = buildUserInfo(resp.user);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      setCurrentUser(userInfo);

      if (resp.user.role === 'admin' || resp.user.role === 'demo_admin') {
        navigate('/admin');
      }
      setIsAuthOpen(false);
      // Open pending booking if user initiated it before logging in
      if (pendingBookingAfterAuth && resp.user.role !== 'admin' && resp.user.role !== 'demo_admin') {
        setPendingBookingAfterAuth(false);
        setIsBookingOpen(true);
      }
      console.log('[Auth] Login successful, navigating to admin dashboard');
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`[DEBUG] Login FAILED\nAPI URL: ${import.meta.env.VITE_API_BASE_URL}\nError: ${errMsg}`);
      console.error('[Auth] login failed (exception):', err);
      return false;
    }
  };

  const handleAuthRegister = async (
    name: string,
    email: string,
    password: string
  ): Promise<string | null> => {
    try {
      clearToken();
      const resp = await authApi.register({
        name,
        email,
        password,
        password_confirmation: password,
      });

      if (!resp || !resp.user) return 'Réponse invalide du serveur. Veuillez réessayer.';

      setToken(resp.token);

      const parts     = (resp.user.name ?? '').trim().split(' ');
      const firstName = parts[0] || 'User';
      const lastName  = parts.slice(1).join(' ');

      setCurrentUser({
        firstName,
        lastName,
        role: 'client',
        email: resp.user.email,
        photo: resp.user.avatar ?? undefined,
        accessKey: `ID-${resp.user.id}`,
      });

      setIsAuthOpen(false);
      // Open pending booking if user initiated it before registering
      if (pendingBookingAfterAuth) {
        setPendingBookingAfterAuth(false);
        setIsBookingOpen(true);
      }
      return null; // null = success
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      // Extract the first field-level validation message from the `errors` map
      if (apiErr?.errors) {
        const firstMessages = Object.values(apiErr.errors)[0];
        if (firstMessages?.[0]) {
          return translateRegisterError(firstMessages[0]);
        }
      }
      return translateRegisterError(apiErr?.message ?? 'Erreur inconnue. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    // Fire-and-forget: revoke token on server
    authApi.logout().catch(() => {});
    clearToken();
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    const routeMap: Record<string, string> = {
      home: '/', fleet: '/flotte', flotte: '/flotte',
      tracking: '/suivi', contact: '/contact', admin: '/admin',
    };
    if (routeMap[path]) {
      navigate(routeMap[path]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
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

  const homePage = (
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
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/30 to-transparent dark:from-black/20 dark:to-transparent z-[1] pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-gray-50/25 via-gray-50/12 to-transparent dark:from-brand-navy/55 dark:via-brand-navy/28 dark:to-transparent z-[1] pointer-events-none"></div>
        <div className="absolute inset-0 z-0">
          <HeroSlider isDark={isDark} />
        </div>
        <HeroOverlay isDark={isDark} onViewFleet={() => handleNavigation('fleet')} />
      </section>
      <main className="relative z-10 transition-colors duration-700 bg-brand-light dark:bg-brand-navy">
        <div className="mt-16 md:mt-20 lg:mt-24">
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
  );

  return (
    <>
      {/* DEBUG BANNER – remove after confirming deployment works */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:9999,background:'#f00',color:'#fff',padding:'4px 12px',fontSize:'12px',textAlign:'center'}}>
        BUILD v2 | API: {import.meta.env.PROD ? 'PROD' : 'DEV'} | BASE_URL: {import.meta.env.VITE_API_BASE_URL ?? 'undefined'}
      </div>
      <div className={`min-h-screen font-sans selection:bg-brand-red selection:text-white transition-colors duration-700 ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-slate-900'}`}>
        <Routes>
          <Route path="/" element={homePage} />
          <Route
            path="/flotte"
            element={
              <FleetPage
                isDark={isDark}
                toggleTheme={toggleTheme}
                onLoginClick={handleLoginClick}
                onBook={handleBookNow}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/suivi"
            element={
              <BookingTrackingPage
                isDark={isDark}
                toggleTheme={toggleTheme}
                onLoginClick={handleLoginClick}
                onNavigate={handleNavigation}
                booking={currentBooking}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <ContactPage
                isDark={isDark}
                toggleTheme={toggleTheme}
                onLoginClick={handleLoginClick}
                onNavigate={handleNavigation}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          {/* Admin routes — three variants so useParams gets { tab } and { tab, subtab } correctly */}
          {['/admin', '/admin/:tab', '/admin/:tab/:subtab'].map(adminPath => (
            <Route
              key={adminPath}
              path={adminPath}
              element={
                !isAuthReady
                  ? null
                  : (currentUser?.role === 'admin' || currentUser?.role === 'demo_admin')
                  ? <AdminDashboard
                      isDark={isDark}
                      toggleTheme={toggleTheme}
                      onNavigate={handleNavigation}
                      onLogout={handleLogout}
                      currentUser={currentUser}
                    />
                  : <Navigate to="/" replace />
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialData={bookingData}
          onBookingSuccess={handleBookingSuccess}
          currentUser={currentUser}
          onNeedAuth={() => {
            setIsBookingOpen(false);
            setPendingBookingAfterAuth(true);
            setIsAuthOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleAuthLogin}
          onRegister={handleAuthRegister}
        />
      </div>
    </>
  );
};

export default App;