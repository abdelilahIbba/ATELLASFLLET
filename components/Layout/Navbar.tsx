import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, User, Sun, Moon, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo } from '../../types';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  currentUser?: UserInfo | null;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onLoginClick, onNavigate, onLogout, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string) => {
    if (onNavigate) {
        onNavigate(path);
    } else {
        const el = document.querySelector(path);
        el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Flotte', href: 'flotte' },
    { name: 'Services', href: '#services' },
    { name: 'Suivi', href: 'tracking' },
    { name: 'Contact', href: 'contact' },
    { name: 'Agence', href: '#agency' },
  ];

  // Conditionally add Admin link if user is authorized
  if (currentUser?.role === 'admin') {
      navLinks.splice(4, 0, { name: 'Admin', href: 'admin' });
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'bg-white/95 dark:bg-brand-navy/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 py-4 shadow-lg dark:shadow-2xl' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex justify-between items-center">
          
          <button onClick={() => handleNav('home')} className="flex-shrink-0 flex items-center gap-4 group relative z-50 outline-none">
            <svg 
              viewBox="0 0 240 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            >
                {/* SVG Definitions for Gradient */}
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" /> {/* brand-red */}
                    <stop offset="100%" stopColor="#F97316" /> {/* orange-500 */}
                  </linearGradient>
                </defs>

                <path d="M5 10 L55 10 L45 17 L0 17 Z" className="fill-slate-900 dark:fill-white" />
                <path d="M12 21 L62 21 L52 28 L8 28 Z" className="fill-brand-red" style={{ fill: 'url(#logoGradient)' }} />
                <path d="M22 32 L50 32 L45 37 L18 37 Z" className="fill-orange-600" /> 
                <text x="68" y="33" className="fill-slate-900 dark:fill-white transition-colors duration-500 shadow-xl" fontSize="36" fontFamily="Space Grotesk, sans-serif" fontWeight="bold" letterSpacing="-1">Atellas</text>
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <div className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-full bg-teal-50 dark:bg-brand-teal/10 border border-teal-200 dark:border-brand-teal/20 text-teal-800 dark:text-brand-teal text-[10px] font-bold tracking-widest uppercase whitespace-nowrap shadow-sm dark:shadow-none">
                 <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-brand-teal animate-pulse"></span>
                 2026 Model Series
            </div>

            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                      e.preventDefault();
                      handleNav(link.href);
                  }}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-bold transition-colors group/link ${
                    link.name === 'Admin' 
                      ? 'text-brand-red font-bold' 
                      : 'text-slate-800 dark:text-gray-100 hover:text-brand-blue dark:hover:text-brand-blue tracking-wide drop-shadow-sm dark:drop-shadow-none'
                  }`}
                >
                  <span className="relative z-10 transition-colors duration-300 flex items-center gap-2">
                      {link.name === 'Admin' && <ShieldCheck className="w-3 h-3" />}
                      {link.name}
                  </span>
                  <span className="absolute inset-0 bg-brand-blue/5 dark:bg-white/5 rounded-lg opacity-0 group-hover/link:opacity-100 scale-95 group-hover/link:scale-100 transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>

            <div className="flex items-center gap-4 lg:gap-5">
               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-full text-brand-navy dark:text-slate-400 hover:bg-brand-blue/10 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white transition-all"
               >
                 {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>

               {currentUser ? (
                 <div className="relative" ref={dropdownRef}>
                   <div 
                      className="flex items-center gap-3 pl-2 cursor-pointer group" 
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                   >
                      <div className="text-right hidden lg:block">
                          <p className="text-xs font-bold text-brand-navy dark:text-white leading-none">{currentUser.firstName} {currentUser.lastName.charAt(0)}.</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${currentUser.role === 'admin' ? 'text-brand-red' : 'text-brand-teal'}`}>
                              {currentUser.role === 'admin' ? 'System Admin' : 'Elite Member'}
                          </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full border-2 overflow-hidden relative group-hover:border-opacity-100 transition-colors shadow-lg ${currentUser.role === 'admin' ? 'border-brand-red/50 group-hover:border-brand-red' : 'border-brand-teal/50 group-hover:border-brand-teal'}`}>
                          {currentUser.photo ? (
                              <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white font-bold">
                                  {currentUser.firstName.charAt(0)}
                              </div>
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                      </div>
                   </div>

                   <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-brand-navy border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[60]"
                        >
                          <div className="p-3 border-b border-gray-100 dark:border-white/5">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                              {currentUser.firstName} {currentUser.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                          
                          <div className="p-1">
                            <button
                               onClick={() => {
                                 setProfileDropdownOpen(false);
                                 onLoginClick(); // Navigate to Dashboard
                               }}
                               className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                            >
                               <User className="w-4 h-4" />
                               Dashboard
                            </button>
                            {onLogout && (
                              <button
                                onClick={() => {
                                   setProfileDropdownOpen(false);
                                   onLogout();
                                }}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 mt-1"
                              >
                                 <LogOut className="w-4 h-4" />
                                 Déconnexion
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                 </div>
               ) : (
                 <button 
                   onClick={onLoginClick}
                   className="text-sm font-bold text-brand-navy dark:text-slate-300 hover:text-brand-blue dark:hover:text-white transition-colors flex items-center gap-2 group"
                 >
                    <User className="w-4 h-4 group-hover:text-brand-blue transition-colors" />
                    <span className="hidden lg:inline">Login</span>
                 </button>
               )}
            </div>
          </div>

          <div className="flex items-center gap-4 md:hidden">
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full text-brand-navy dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
             >
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-50 text-brand-navy dark:text-white p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-light dark:bg-brand-navy flex flex-col pt-32 px-6 pb-12 overflow-y-auto custom-scrollbar"
          >
             <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
             <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/20 dark:bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

             <div className="flex flex-col space-y-2 relative z-10">
               
               {currentUser ? (
                   <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/10 shadow-xl">
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${currentUser.role === 'admin' ? 'border-brand-red' : 'border-brand-teal'}`}>
                            {currentUser.photo ? (
                                <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white text-xl font-bold">
                                    {currentUser.firstName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-bold text-brand-navy dark:text-white">{currentUser.firstName}</p>
                            <p className={`text-xs uppercase tracking-widest font-bold mt-1 px-2 py-1 rounded w-fit ${currentUser.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-teal/10 text-brand-teal'}`}>
                                {currentUser.role === 'admin' ? 'SYSTEM ADMIN' : `Key: ${currentUser.accessKey}`}
                            </p>
                        </div>
                   </div>
               ) : (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-lg mb-8 shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Se Connecter
                  </motion.button>
               )}

               {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                  onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      handleNav(link.href);
                  }}
                  className="group flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] rounded-2xl transition-all duration-300"
                >
                  <span className={`text-4xl font-bold font-['Space_Grotesk'] ${link.name === 'Admin' ? 'text-brand-red' : 'text-brand-navy dark:text-white'}`}>
                    {link.name}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white dark:text-white transition-all duration-300">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;