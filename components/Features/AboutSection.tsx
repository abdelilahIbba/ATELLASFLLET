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
                <span className="text-brand-red font-bold tracking-widest text-xs uppercase mb-4 block">Our Story</span>
                <h2 className="text-4xl font-bold text-brand-navy dark:text-white font-space mb-6">
                    Redefining <br/> Modern Mobility
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Founded in 2024, Atellas was born from a simple belief: that the journey should be as exceptional as the destination. We bridge the gap between digital convenience and physical luxury.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Our fleet represents the cutting edge of automotive technology. We are committed to a sustainable future, with over 60% of our fleet being electric or hybrid vehicles.
                </p>
                
                <div className="flex gap-12 border-t border-slate-200 dark:border-white/10 pt-8">
                    <div>
                        <div className="text-3xl font-bold text-brand-navy dark:text-white font-space">50+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Global Cities</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-brand-navy dark:text-white font-space">12k+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Happy Clients</div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;