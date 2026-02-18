import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome, ChevronRight, Loader2, ShieldCheck, UserCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string, password: string, role: 'client' | 'admin') => boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (onLogin && isLogin) {
          const success = onLogin(formData.email, formData.password, role);
          if (success) {
            onClose();
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          } else {
            setError("Invalid credentials");
          }
      } else {
        // Registration mode
        onClose();
      }
    }, 1500);
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
        className="relative w-full max-w-5xl min-h-[600px] bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10"
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
                  {isLogin ? "Bienvenue dans le Cockpit." : "Rejoignez le Club des Pilotes d'Élite."}
                </h2>
                <p className="text-slate-400 leading-relaxed max-w-sm">
                  {isLogin 
                    ? "Accédez à votre flotte personnalisée, gérez vos réservations et débloquez des avantages membres exclusifs." 
                    : "Créez un compte pour profiter d'une réservation fluide, d'un accès prioritaire aux véhicules et de services de conciergerie sur mesure."
                  }
                </p>
              </motion.div>
           </div>
           
           {/* Decoration */}
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-blue/30 rounded-full blur-[80px]"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-[#0B1120] relative flex flex-col justify-center overflow-y-auto">
           
           <div className="max-w-md mx-auto w-full">
             <div className="mb-8 text-center md:text-left">
                <h3 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-2">
                  {isLogin ? 'Se Connecter' : 'Créer un Compte'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isLogin ? "Entrez vos identifiants pour continuer." : "Remplissez vos coordonnées pour commencer."}
                </p>
             </div>

             {/* Role Selector Toggle */}
             {isLogin && (
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-8">
                   <button 
                     onClick={() => setRole('client')}
                     className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'client' ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                   >
                      <UserCircle2 className="w-4 h-4" /> Accès Membre
                   </button>
                   <button 
                     onClick={() => setRole('admin')}
                     className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'admin' ? 'bg-white dark:bg-brand-red text-brand-red dark:text-white shadow-sm' : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'}`}
                   >
                      <ShieldCheck className="w-4 h-4" /> Accès Système
                   </button>
                </div>
             )}

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
                        placeholder="Nom Complet"
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
                      placeholder="Adresse Email"
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
                      placeholder="Mot de Passe"
                      required
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-brand-navy dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                      value={formData.password}
                      onChange={e => {
                        setFormData({...formData, password: e.target.value});
                        if (error) setError(null);
                      }}
                    />
                  </div>
                  
                   {isLogin && error && (
                    <div className="text-center text-[14px] text-[#d9534f] mt-2">
                       Identifiants admin invalides. Veuillez réessayer ou <a href="mailto:contact@devnapp.com" className="text-[#007bff] hover:underline">Contactez l'Admin</a>.
                    </div>
                  )}
                  
                  {isLogin && (
                    <div className="flex justify-end">
                      <a href="#" className="text-xs font-bold text-brand-blue hover:text-brand-teal transition-colors">Mot de Passe Oublié ?</a>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg ${role === 'admin' && isLogin ? 'bg-brand-red text-white' : 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy'}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? (role === 'admin' ? 'Accès Autorisé' : 'Se Connecter') : 'Créer un Compte'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
               </motion.form>
             </AnimatePresence>

             <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium uppercase">Ou continuer avec</span>
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
                  {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                  <button 
                    onClick={toggleMode}
                    className="ml-2 font-bold text-brand-navy dark:text-white hover:text-brand-blue transition-colors inline-flex items-center gap-1"
                  >
                    {isLogin ? "S'inscrire" : "Se Connecter"}
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