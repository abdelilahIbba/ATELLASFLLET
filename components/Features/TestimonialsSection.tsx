import React from 'react';
import { TESTIMONIALS } from '../../constants';
import { Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-light dark:bg-brand-navy transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-brand-teal font-bold tracking-widest text-xs uppercase mb-2 block">Avis vérifiés</span>
            <h3 className="text-3xl font-bold text-brand-navy dark:text-white font-space">Avis Clients Maroc</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative"
            >
              <Quote className="w-8 h-8 text-brand-blue/20 absolute top-5 right-5" />
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-brand-navy dark:text-white font-bold text-sm">{testimonial.name}</h4>
                  <p className="text-slate-400 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
