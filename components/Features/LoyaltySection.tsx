import React from 'react';
import { CreditCard, Radio, Building2, Receipt, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoyaltySection: React.FC = () => {
  const benefits = [
        { icon: Radio, title: 'Réservation via Badge NFC', desc: 'Accès rapide aux réservations pour vos équipes autorisées.' },
        { icon: Building2, title: 'Suivi Flotte Entreprise', desc: 'Vision centralisée des véhicules, conducteurs et statuts en temps réel.' },
        { icon: Receipt, title: 'Facturation Centralisée', desc: 'Une facturation mensuelle claire pour simplifier votre gestion interne.' },
        { icon: ShieldCheck, title: 'Accès Prioritaire', desc: 'Priorité sur la disponibilité des véhicules pour vos missions business.' }
  ];

  return (
        <section className="py-24 bg-[#050A14] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-brand-red/5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Content */}
                <div>
                    <span className="text-brand-red font-bold tracking-widest text-xs uppercase mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Carte NFC Business atellaFleet
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-space mb-6 leading-tight">
                        Une Solution Corporate <br/> 
                        <span className="text-brand-teal">simple et professionnelle</span>
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-md">
                        Conçue pour les entreprises à Rabat, la carte NFC Business facilite la réservation, 
                        le suivi des déplacements et la gestion administrative de votre flotte louée.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        {benefits.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-brand-teal shrink-0">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="px-8 py-3 bg-brand-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal-500 transition-colors shadow-lg shadow-brand-teal/20">
                        Demander une démo entreprise
                    </button>
                </div>

                {/* Card Graphic */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="relative z-10 bg-gradient-to-br from-slate-800 to-black border border-white/10 rounded-2xl p-8 aspect-[1.586/1] shadow-2xl flex flex-col justify-between overflow-hidden group hover:scale-105 transition-transform duration-500">
                        {/* Card Texture */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[60px] rounded-full"></div>

                        <div className="relative z-10 flex justify-between items-start">
                                <div className="text-2xl font-bold font-space text-white tracking-widest">ATELLAFLEET</div>
                                <div className="text-xs font-bold text-brand-teal uppercase border border-brand-teal/30 px-2 py-1 rounded">NFC BUSINESS</div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-8 bg-brand-red/20 rounded flex items-center justify-center border border-white/10">
                                    <div className="w-6 h-4 border border-brand-red/50 rounded-sm"></div>
                                </div>
                                <div className="text-white/50 text-xl tracking-[0.2em] font-mono">•••• •••• •••• 2401</div>
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase mb-1">Compte entreprise</div>
                                    <div className="text-sm text-white font-bold tracking-wider">SOCIÉTÉ RABAT BUSINESS</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 uppercase mb-1">Support dédié</div>
                                    <div className="text-sm text-white font-bold">24/7</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    </section>
  );
};

export default LoyaltySection;