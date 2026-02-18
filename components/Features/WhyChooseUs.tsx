import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const values = [
    'Service local à Rabat et régions proches',
    'Tarification claire sans frais cachés',
    'Support client réactif 7j/7',
    'Véhicules contrôlés et entretenus',
    'Solutions dédiées aux entreprises',
    'Livraison domicile et aéroport'
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#080E1C] transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white font-space mb-4">
                Pourquoi choisir atellaFleet ?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-10">
                Une agence de location à Rabat pensée pour la performance opérationnelle : processus simples,
                véhicules fiables et accompagnement professionnel.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((val, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-5">
              <div className="flex items-start gap-3 text-brand-navy dark:text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-brand-teal mt-0.5 shrink-0" />
                <span>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;