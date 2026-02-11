import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome, ChevronRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 2000);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[600px] bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-brand-navy dark:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Panel - Visuals */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-brand-navy items-center justify-center">
           {/* Dynamic Background Image */}
           <motion.div 
             key={isLogin ? 'login-img' : 'register-img'}
             initial={{ scale: 1.1, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.2 }}
             className="absolute inset-0 z-0"
           >
              <img 
                src={isLogin 
                  ? "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000" 
                  : "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=1000"
                }
                alt="Auth Background" 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent"></div>
           </motion.div>

           {/* Content */}
           <div className="relative z-10 p-12 text-white">
              <motion.div
                key={isLogin ? 'login-text' : 'register-text'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 backdrop-blur-md border border-brand-blue/50 flex items-center justify-center mb-6 text-brand-blue">
                   {isLogin ? <User className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin-slow" />}
                </div>
                <h2 className="text-4xl font-bold font-space mb-4 leading-tight">
                  {isLogin ? "Welcome Back to the Cockpit." : "Join the Elite Driver's Club."}
                </h2>
                <p className="text-slate-400 leading-relaxed max-w-sm">
                  {isLogin 
                    ? "Access your personalized fleet, manage reservations, and unlock exclusive member benefits." 
                    : "Create an account to experience seamless booking, priority vehicle access, and bespoke concierge services."
                  }
                </p>
              </motion.div>
           </div>
           
           {/* Decoration */}
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-blue/30 rounded-full blur-[80px]"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-[#0B1120] relative flex flex-col justify-center">
           
           <div className="max-w-md mx-auto w-full">
             <div className="mb-8">
                <h3 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isLogin ? "Enter your credentials to continue." : "Fill in your details to get started."}
                </p>
             </div>

             <AnimatePresence mode="wait">
               <motion.form 
                 key={isLogin ? 'login-form' : 'register-form'}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
                 onSubmit={handleSubmit}
                 className="space-y-4"
               >
                  {!isLogin && (
                    <div className="group relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        required
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-brand-navy dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="group relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      required
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-brand-navy dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="group relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                    <input 
                      type="password" 
                      placeholder="Password"
                      required
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-brand-navy dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  
                  {isLogin && (
                    <div className="flex justify-end">
                      <a href="#" className="text-xs font-bold text-brand-blue hover:text-brand-teal transition-colors">Forgot Password?</a>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3.5 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
               </motion.form>
             </AnimatePresence>

             <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium uppercase">Or continue with</span>
                <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                   <Chrome className="w-4 h-4 text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors" />
                   <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                   <Github className="w-4 h-4 text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors" />
                   <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Apple</span>
                </button>
             </div>

             <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={toggleMode}
                    className="ml-2 font-bold text-brand-navy dark:text-white hover:text-brand-blue transition-colors inline-flex items-center gap-1"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </p>
             </div>

           </div>
        </div>

      </motion.div>
    </div>
  );
};

export default AuthModal;