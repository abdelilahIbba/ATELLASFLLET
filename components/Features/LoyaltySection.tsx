import React from 'react';
import { Crown, Star, Key, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoyaltySection: React.FC = () => {
  const benefits = [
    { icon: Crown, title: "Accès Prioritaire", desc: "Accès en avant-première aux nouveautés et éditions limitées." },
    { icon: Star, title: "Multiplicateur de Points", desc: "Gagnez 2x plus de points à chaque kilomètre parcouru." },
    { icon: Key, title: "Accès Sans Clé", desc: "Déverrouillez n'importe quelle voiture via l'application mobile Atellas." },
    { icon: ShieldCheck, title: "Couverture Complète", desc: "Assurance premium incluse gratuitement." }
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
                    <span className="text-brand-red font-bold tracking-widest text-xs uppercase mb-2 block flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Club Aero Elite
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-space mb-6 leading-tight">
                        Débloquez les Privilèges <br/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">de Conduite Ultimes</span>
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-md">
                        Rejoignez notre programme d'adhésion exclusif conçu pour le conducteur exigeant. 
                        Profitez de réservations fluides, de surclassements gratuits et d'invitations à des événements lifestyle exclusifs.
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
                        Rejoindre Aero Elite
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
                             <div className="text-2xl font-bold font-space text-white tracking-widest">ATELLAS</div>
                             <div className="text-xs font-bold text-brand-teal uppercase border border-brand-teal/30 px-2 py-1 rounded">Membre Elite</div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-8 bg-brand-red/20 rounded flex items-center justify-center border border-white/10">
                                    <div className="w-6 h-4 border border-brand-red/50 rounded-sm"></div>
                                </div>
                                <div className="text-white/50 text-xl tracking-[0.2em] font-mono">•••• •••• •••• 8821</div>
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase mb-1">Titulaire de la carte</div>
                                    <div className="text-sm text-white font-bold tracking-wider">ALEXANDER PIERCE</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 uppercase mb-1">Valide jusqu'au</div>
                                    <div className="text-sm text-white font-bold">12/28</div>
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