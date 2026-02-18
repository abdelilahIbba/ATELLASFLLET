import React from 'react';
import { OFFERS } from '../../constants';
import { ArrowRight, Tag } from 'lucide-react';

interface OffersSectionProps {
  onBook: () => void;
}

const OffersSection: React.FC<OffersSectionProps> = ({ onBook }) => {
  return (
    <section id="offers" className="py-20 bg-brand-light dark:bg-brand-navy transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-6">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-brand-navy dark:text-white font-space">
                Offres <span className="text-brand-red">Spéciales</span>
            </h3>
            <a href="#" className="text-sm font-bold text-brand-navy dark:text-white hover:text-brand-blue flex items-center gap-2">
                Tout Voir <ArrowRight className="w-4 h-4" />
            </a>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {OFFERS.map((offer) => (
                <div key={offer.id} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer" onClick={onBook}>
                    <img 
                        src={offer.image} 
                        alt={offer.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-lg">
                        <div className="bg-brand-red text-white text-[10px] font-bold uppercase px-3 py-1 rounded w-fit mb-3 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> {offer.discount}
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2 font-space">{offer.title}</h4>
                        <p className="text-slate-300 text-sm mb-6 max-w-xs">{offer.description}</p>
                        <button className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                          Voir l'offre <ArrowRight className="w-4 h-4 text-brand-teal" />
                        </button>
                    </div>

                    {/* Neon Border Effect */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-brand-teal/50 transition-colors duration-300"></div>
                </div>
            ))}
         </div>
      </div>
    </section>
  );
};

export default OffersSection;