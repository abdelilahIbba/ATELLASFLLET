import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white dark:bg-black relative overflow-hidden transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="lg:w-1/2">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                    <img 
                        src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=1200" 
                        alt="Atellas Philosophy" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-brand-navy/30"></div>
                </div>
            </div>

            <div className="lg:w-1/2">
                <span className="text-brand-red font-bold tracking-widest text-xs uppercase mb-4 block">Notre Histoire</span>
                <h2 className="text-4xl font-bold text-brand-navy dark:text-white font-space mb-6">
                    Redéfinir <br/> la Mobilité Moderne
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Fondée en 2024, Atellas est née d'une conviction simple : le voyage doit être aussi exceptionnel que la destination. Nous comblons le fossé entre la commodité numérique et le luxe physique.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Notre flotte représente la pointe de la technologie automobile. Nous nous engageons pour un avenir durable, avec plus de 60 % de notre flotte composée de véhicules électriques ou hybrides.
                </p>
                
                <div className="flex gap-12 border-t border-slate-200 dark:border-white/10 pt-8">
                    <div>
                        <div className="text-3xl font-bold text-brand-navy dark:text-white font-space">50+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Villes Mondiales</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-brand-navy dark:text-white font-space">12k+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Clients Satisfaits</div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;