import React from 'react';
import { SERVICES } from '../../constants';
import { Shield, Map, User, Zap, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: any = {
  Shield: Shield,
  Map: Map,
  Cpu: User,
  Zap: Zap,
};

const BentoCard: React.FC<{ service: any; index: number; className?: string }> = ({ service, index, className }) => {
  const Icon = iconMap[service.icon] || Zap;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 hover:border-brand-teal/30 dark:hover:border-brand-teal/30 p-8 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-brand-teal/5 dark:shadow-none rounded-xl ${className}`}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 bg-brand-teal/10 dark:bg-brand-teal/10 rounded-full flex items-center justify-center mb-6 text-brand-teal group-hover:text-white group-hover:bg-brand-teal transition-all duration-300">
           <Icon className="w-6 h-6" />
        </div>
        
        <h4 className="text-xl font-space font-bold text-brand-navy dark:text-white mb-3 transition-colors">
          {service.title}
        </h4>
        <p className="text-slate-500 dark:text-neutral-500 text-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-neutral-300 transition-colors">
          {service.description}
        </p>
      </div>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <Plus className="text-brand-teal" />
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[50px] group-hover:bg-brand-teal/20 dark:group-hover:bg-brand-teal/10 transition-colors duration-500"></div>
    </motion.div>
  );
};

const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-brand-light dark:bg-brand-navy relative z-10 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 border-l-2 border-brand-teal pl-6">
           <h3 className="text-3xl font-bold text-brand-navy dark:text-white font-space mb-2 transition-colors">Concierge Services</h3>
           <p className="text-slate-500 dark:text-neutral-500 text-sm">Beyond just a rental. A lifestyle management solution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
          <BentoCard service={SERVICES[0]} index={0} className="md:col-span-2 md:row-span-1" />
          <BentoCard service={SERVICES[1]} index={1} className="md:col-span-1" />
          <BentoCard service={SERVICES[2]} index={2} className="md:col-span-1" />
          <BentoCard service={SERVICES[3]} index={3} className="md:col-span-4 bg-gradient-to-r from-white to-slate-50 dark:from-[#0B1120] dark:to-[#0F172A]" />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;