import React from 'react';
import { TESTIMONIALS } from '../../constants';
import { CheckCircle2, Quote } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const values = [
    "24/7 Global Support",
    "Premium Fleet Guarantee",
    "Transparent Pricing",
    "Curated Driving Routes"
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#080E1C] transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Value Props */}
            <div className="lg:col-span-4">
                <h2 className="text-3xl font-bold text-brand-navy dark:text-white font-space mb-6">
                    Why Choose <br/> Atellas?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    We don't just rent cars. We engineer experiences. Every interaction is designed to respect your time and elevate your journey.
                </p>
                <ul className="space-y-4">
                    {values.map((val, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-brand-navy dark:text-slate-200 font-medium">
                            <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                            {val}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Testimonials */}
            <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-2xl relative">
                            <Quote className="w-8 h-8 text-brand-blue/20 absolute top-6 right-6" />
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                                "{t.text}"
                            </p>
                            <div className="flex items-center gap-3">
                                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h5 className="text-brand-navy dark:text-white font-bold text-xs">{t.name}</h5>
                                    <p className="text-slate-400 text-[10px] uppercase">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;