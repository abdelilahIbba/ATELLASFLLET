import React, { useState } from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { LOCATIONS } from '../../constants';

interface ContactPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate: (path: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ isDark, toggleTheme, onLoginClick, onNavigate }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'Reservations',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'} transition-colors duration-700`}>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onLoginClick={onLoginClick}
        onNavigate={onNavigate} 
      />

      <div className="flex-grow pt-32 pb-20 px-4 sm:px-6 relative">
         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Header */}
            <div className="text-center mb-16">
               <motion.span 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-brand-teal font-bold tracking-[0.2em] text-xs uppercase mb-4 block"
               >
                 Global Connectivity
               </motion.span>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-6xl font-bold text-brand-navy dark:text-white font-space mb-6"
               >
                 Connect with <span className="text-brand-blue">Atellas</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"
               >
                 Our concierge team is available 24/7 to assist with reservations, fleet inquiries, and bespoke travel arrangements.
               </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
               
               {/* Contact Form */}
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-white dark:bg-[#0B1120] rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden"
               >
                  {isSubmitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                       <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                       </div>
                       <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-2">Message Transmitted</h3>
                       <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                         Our team has received your inquiry. A concierge will respond via secure channel within 15 minutes.
                       </p>
                       <button 
                         onClick={() => setIsSubmitted(false)}
                         className="text-sm font-bold text-brand-blue hover:text-brand-navy dark:hover:text-white transition-colors"
                       >
                         Send Another Message
                       </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                             <MessageSquare className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-brand-navy dark:text-white font-space">Direct Line</h3>
                             <p className="text-xs text-slate-500 uppercase tracking-wider">Priority Support Channel</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="group">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Name</label>
                             <input 
                               type="text" 
                               required
                               className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                               placeholder="Alexander Pierce"
                               value={formState.name}
                               onChange={(e) => setFormState({...formState, name: e.target.value})}
                             />
                          </div>
                          <div className="group">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Email</label>
                             <input 
                               type="email" 
                               required
                               className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                               placeholder="alexander@example.com"
                               value={formState.email}
                               onChange={(e) => setFormState({...formState, email: e.target.value})}
                             />
                          </div>
                       </div>

                       <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Inquiry Type</label>
                          <select 
                             className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all appearance-none cursor-pointer"
                             value={formState.subject}
                             onChange={(e) => setFormState({...formState, subject: e.target.value})}
                          >
                             <option>Reservation Inquiry</option>
                             <option>Corporate Accounts</option>
                             <option>Press & Media</option>
                             <option>Support & Assistance</option>
                          </select>
                       </div>

                       <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Message</label>
                          <textarea 
                             rows={4}
                             required
                             className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all resize-none"
                             placeholder="How can we assist you today?"
                             value={formState.message}
                             onChange={(e) => setFormState({...formState, message: e.target.value})}
                          ></textarea>
                       </div>

                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="w-full py-4 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg group"
                       >
                         {isSubmitting ? 'Transmitting...' : (
                           <>
                             Send Message <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                           </>
                         )}
                       </button>
                    </form>
                  )}
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-bl-[100px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-red/5 rounded-tr-[60px] pointer-events-none"></div>
               </motion.div>

               {/* Info Side */}
               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 }}
                 className="flex flex-col justify-center"
               >
                  <div className="mb-12">
                     <h3 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-8 flex items-center gap-3">
                        <Globe className="w-6 h-6 text-brand-teal" /> Global Headquarters
                     </h3>
                     
                     <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                              <MapPin className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-brand-navy dark:text-white text-sm">Main Office</p>
                              <p className="text-slate-500 text-sm mt-1">15 Hudson Yards, Level 88<br/>New York, NY 10001, USA</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                              <Phone className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-brand-navy dark:text-white text-sm">Concierge Desk</p>
                              <p className="text-slate-500 text-sm mt-1">+1 (888) AERO-FLY<br/>Mon-Sun, 24 Hours</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                              <Mail className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-brand-navy dark:text-white text-sm">Email Support</p>
                              <p className="text-slate-500 text-sm mt-1">concierge@atellas.com<br/>press@atellas.com</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Regional Offices Mini Grid */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Regional Hubs</h4>
                     <div className="grid grid-cols-2 gap-4">
                        {LOCATIONS.slice(1, 5).map((loc, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-brand-teal opacity-70" />
                              <div>
                                 <p className="font-bold text-brand-navy dark:text-white text-xs">{loc.city}</p>
                                 <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{loc.address}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                     <button 
                        onClick={() => onNavigate('#locations')}
                        className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-teal font-bold text-sm uppercase tracking-wider transition-colors">
                        View All Locations on Map <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </motion.div>

            </div>
         </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ContactPage;