import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onLoginClick, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string) => {
    if (onNavigate) {
        onNavigate(path);
    } else {
        // Fallback for direct anchor usage if no handler
        const el = document.querySelector(path);
        el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Fleet', href: '#fleet' },
    { name: 'Services', href: '#services' },
    { name: 'Track', href: 'tracking' },
    { name: 'Contact', href: 'contact' },
    { name: 'About', href: '#about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'bg-brand-light/80 dark:bg-brand-navy/80 backdrop-blur-xl border-b border-brand-blue/10 dark:border-white/5 py-4 shadow-lg dark:shadow-2xl' 
            : 'bg-transparent py-6'
        }`}
      >
        {/* Container aligned with HeroOverlay */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex justify-between items-center">
          
          {/* Logo Section */}
          <button onClick={() => handleNav('home')} className="flex-shrink-0 flex items-center gap-4 group relative z-50 outline-none">
            <svg 
              viewBox="0 0 240 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            >
                {/* Stylized Speed Wings - Brand Colors */}
                <path d="M5 10 L55 10 L45 17 L0 17 Z" className="fill-brand-navy dark:fill-white" />
                <path d="M12 21 L62 21 L52 28 L8 28 Z" className="fill-brand-blue dark:fill-brand-blue" />
                <path d="M22 32 L50 32 L45 37 L18 37 Z" className="fill-brand-red dark:fill-brand-red" /> 
                
                {/* Brand Name - Clean, no subtext */}
                <text x="68" y="33" className="fill-brand-navy dark:fill-white transition-colors duration-500" fontSize="36" fontFamily="Space Grotesk, sans-serif" fontWeight="bold" letterSpacing="-1">Atellas</text>
            </svg>
          </button>

          {/* Desktop Navigation & Actions - Aligned Right */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            
            {/* Model Series Badge - Desktop */}
            <div className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-full bg-brand-teal/10 dark:bg-brand-teal/10 border border-brand-teal/20 text-brand-teal dark:text-brand-teal text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></span>
                 2026 Model Series
            </div>

            {/* Links */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                      e.preventDefault();
                      handleNav(link.href);
                  }}
                  className="relative px-3 lg:px-4 py-2 text-sm font-medium text-brand-navy dark:text-slate-300 hover:text-brand-blue dark:hover:text-white transition-colors group/link"
                >
                  <span className="relative z-10 transition-colors duration-300">{link.name}</span>
                  {/* Hover Effect */}
                  <span className="absolute inset-0 bg-brand-blue/5 dark:bg-white/5 rounded-lg opacity-0 group-hover/link:opacity-100 scale-95 group-hover/link:scale-100 transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-5">
               {/* Theme Toggle */}
               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-full text-brand-navy dark:text-slate-400 hover:bg-brand-blue/10 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white transition-all"
                 aria-label="Toggle Theme"
               >
                 {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>

               {/* Login Link */}
               <button 
                 onClick={onLoginClick}
                 className="text-sm font-bold text-brand-navy dark:text-slate-300 hover:text-brand-blue dark:hover:text-white transition-colors flex items-center gap-2 group"
               >
                  <User className="w-4 h-4 group-hover:text-brand-blue transition-colors" />
                  <span className="hidden lg:inline">Login</span>
               </button>

               {/* Portal Button - Primary RED */}
               <button 
                 onClick={onLoginClick}
                 className="group relative px-5 py-2.5 rounded-lg overflow-hidden bg-brand-red text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-red/20 hover:bg-red-600 hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
               >
                 <span className="relative z-10 flex items-center gap-2">
                   Portal
                   <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
               </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
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

      {/* Immersive Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-light dark:bg-brand-navy flex flex-col pt-32 px-6 pb-12 overflow-hidden"
          >
             {/* Background Gradients */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/20 dark:bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

             {/* Navigation Links */}
             <div className="flex flex-col space-y-2 relative z-10">
               
               {/* Mobile Model Badge */}
               <div className="flex items-center gap-2 py-2 px-4 mb-4 rounded-full bg-brand-teal/10 dark:bg-brand-teal/10 border border-brand-teal/20 text-brand-teal dark:text-brand-teal text-xs font-bold tracking-widest uppercase w-fit">
                    <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse"></span>
                    2026 Model Series
               </div>

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
                  <span className="text-4xl font-bold text-brand-navy dark:text-white font-['Space_Grotesk']">
                    {link.name}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white dark:text-white transition-all duration-300">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.a>
              ))}

              <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="mt-6 w-full py-4 bg-brand-red text-white font-bold rounded-xl text-lg uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                Client Portal <User className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;