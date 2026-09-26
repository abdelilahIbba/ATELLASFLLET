import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, User, Sun, Moon, ShieldCheck, LogOut, Phone, Instagram } from 'lucide-react';
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

// Authentic WhatsApp SVG Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.71 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
    { name: 'Contact', href: 'contact' },
    { name: 'Agence', href: '#agency' },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.splice(4, 0, { name: 'Admin', href: 'admin' });
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'bg-white/95 dark:bg-[#080E1A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 py-3 shadow-md' 
            : 'bg-transparent py-4 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center gap-4">
          
          {/* Logo Brand: Compact, clean and proportional */}
          <button 
            onClick={() => handleNav('home')} 
            className="flex-shrink-0 flex items-center gap-2.5 group relative z-50 outline-none text-left"
            aria-label="Accueil RLV Rahimi Car"
          >
            <img 
              src="/rlv-emblem.png" 
              alt="RLV Rahimi Car" 
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" 
            />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-space text-brand-red tracking-tight">RLV</span>
                <span className="text-sm sm:text-base font-bold font-space text-slate-900 dark:text-white tracking-tight">RAHIMI CAR</span>
              </div>
              <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">Location de Voitures</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.href);
                }}
                className={`relative px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors group/link whitespace-nowrap rounded-lg ${
                  link.name === 'Admin' 
                    ? 'text-brand-red font-bold hover:bg-brand-red/10' 
                    : 'text-slate-700 dark:text-slate-200 hover:text-brand-red dark:hover:text-brand-red hover:bg-slate-100/70 dark:hover:bg-white/5'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {link.name === 'Admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Desktop Action Icons: WhatsApp, Call, Instagram, Theme, Profile */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {/* Quick Contact Icons Trio */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-white/5 rounded-full border border-slate-200/60 dark:border-white/10">
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/212677813718" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-none hover:shadow-sm"
                title="WhatsApp: 06 77 81 37 18"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>

              {/* Direct Call Button */}
              <a 
                href="tel:0677813718"
                className="w-8 h-8 rounded-full flex items-center justify-center text-brand-red dark:text-red-400 hover:bg-brand-red hover:text-white transition-all shadow-none hover:shadow-sm"
                title="Appeler: 06 77 81 37 18"
                aria-label="Appel téléphonique"
              >
                <Phone className="w-4 h-4" />
              </a>

              {/* Instagram Button */}
              <a 
                href="https://www.instagram.com/location_rahimi_car/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#E4405F] hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all shadow-none hover:shadow-sm"
                title="Instagram @location_rahimi_car"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              aria-label="Changer de thème"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-2 cursor-pointer group" 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  title={`${currentUser.firstName} (${currentUser.role})`}
                >
                  <div className="text-right hidden 2xl:block">
                    <p className="text-xs font-bold text-brand-navy dark:text-white leading-none truncate max-w-[90px]">{currentUser.firstName}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${currentUser.role === 'admin' ? 'text-brand-red' : 'text-brand-teal'}`}>
                      {currentUser.role === 'admin' ? 'Admin' : 'Membre'}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 overflow-hidden relative group-hover:border-opacity-100 transition-colors shadow-sm ${currentUser.role === 'admin' ? 'border-brand-red/80' : 'border-brand-teal/80'}`}>
                    {currentUser.photo ? (
                      <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-navy dark:bg-white text-white dark:text-brand-navy flex items-center justify-center text-xs font-bold">
                        {currentUser.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0B1120] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[60]"
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
                            onLoginClick();
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
                className="text-xs font-bold text-brand-navy dark:text-slate-300 hover:text-brand-red dark:hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <User className="w-4 h-4" />
                <span>Connexion</span>
              </button>
            )}
          </div>

          {/* Mobile & Tablet Header Controls (Visible on screen < lg) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* Direct WhatsApp Callout for Mobile */}
            <a 
              href="https://wa.me/212677813718" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>

            {/* Direct Call Button for Mobile */}
            <a 
              href="tel:0677813718"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-brand-red dark:bg-brand-red/10 dark:text-red-400"
              title="Appeler"
              aria-label="Appeler"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Theme Toggle Mobile */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300"
              aria-label="Changer de thème"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hamburger Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-50 text-slate-900 dark:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile & Tablet Full-Screen Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white dark:bg-[#080E1A] flex flex-col pt-24 px-6 pb-10 overflow-y-auto"
          >
            <div className="flex flex-col space-y-2 relative z-10 max-w-lg mx-auto w-full">
              
              {/* User card in mobile drawer if logged in */}
              {currentUser ? (
                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${currentUser.role === 'admin' ? 'border-brand-red' : 'border-brand-teal'}`}>
                    {currentUser.photo ? (
                      <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white text-lg font-bold">
                        {currentUser.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 px-2 py-0.5 rounded w-fit ${currentUser.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-teal/10 text-brand-teal'}`}>
                      {currentUser.role === 'admin' ? 'SYSTEM ADMIN' : 'Client VIP'}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full py-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm mb-4 shadow-md flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Se Connecter
                </button>
              )}

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    handleNav(link.href);
                  }}
                  className="flex items-center justify-between py-3.5 px-4 rounded-xl border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`text-xl font-bold font-space ${link.name === 'Admin' ? 'text-brand-red' : 'text-slate-900 dark:text-white'}`}>
                    {link.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              ))}

              {/* Direct Quick Action Contact Cards in Mobile Drawer */}
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold px-1">Contact Rapide</p>
                
                <a
                  href="https://wa.me/212677813718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Discuter sur WhatsApp</span>
                  </div>
                  <span className="text-xs opacity-90 font-mono">06 77 81 37 18</span>
                </a>

                <a
                  href="tel:0677813718"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-brand-red text-white font-bold text-sm shadow-md hover:bg-red-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4" />
                    <span>Appeler Directement</span>
                  </div>
                  <span className="text-xs opacity-90 font-mono">06 77 81 37 18</span>
                </a>

                <a
                  href="https://www.instagram.com/location_rahimi_car/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity"
                >
                  <div className="flex items-center gap-2.5">
                    <Instagram className="w-5 h-5" />
                    <span>Instagram Officiel</span>
                  </div>
                  <span className="text-xs opacity-90">@location_rahimi_car</span>
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;