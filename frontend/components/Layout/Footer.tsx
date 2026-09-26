import React from 'react';
import { Phone, Instagram, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <footer className="bg-slate-900 dark:bg-neutral-900 text-white pt-20 pb-10 relative z-10 border-t border-slate-800 dark:border-white/5 transition-colors duration-700">
      <div className="w-full lg:px-16 xl:px-20 2xl:px-28 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => handleNav('home')}>
                <img src="/rlv-emblem.png" alt="RLV Rahimi Car" className="h-10 w-auto object-contain" />
                <span className="text-xl font-extrabold tracking-tight font-space">
                    <span className="text-brand-red">RLV</span> <span className="text-white">RAHIMI CAR</span>
                </span>
            </div>
            <p className="text-slate-400 dark:text-neutral-400 text-sm leading-relaxed mb-5">
              Location de voitures à Tanger pour particuliers et professionnels. Service premium, réservation rapide et suivi professionnel.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a href="tel:0677813718" className="flex items-center gap-2 hover:text-brand-red transition-colors">
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                <span className="font-semibold text-sm">06 77 81 37 18</span>
              </a>
              <a href="https://www.instagram.com/location_rahimi_car/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#E4405F] transition-colors">
                <Instagram className="w-4 h-4 text-[#E4405F] shrink-0" />
                <span className="font-medium">@location_rahimi_car</span>
              </a>
              <a href="https://maps.app.goo.gl/UuuWUo23BkbPAaDX8" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-snug">LOT EL NAHDA RUE 37 N°12 BLOC 38, Tanger</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-xs tracking-widest uppercase">Découvrir</h4>
            <ul className="space-y-3 text-slate-400 dark:text-neutral-500 text-sm">
              <li onClick={() => handleNav('fleet')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Notre Flotte</li>
              <li onClick={() => handleNav('#agency')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Agence à Tanger</li>
              <li onClick={() => handleNav('#services')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Services</li>
              <li onClick={() => handleNav('#offers')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Offres Spéciales</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-xs tracking-widest uppercase">Entreprise</h4>
            <ul className="space-y-3 text-slate-400 dark:text-neutral-500 text-sm">
              <li onClick={() => handleNav('contact')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Comptes Entreprise</li>
              <li onClick={() => handleNav('tracking')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Suivi Location</li>
              <li onClick={() => handleNav('contact')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Demande Devis</li>
              <li onClick={() => handleNav('contact')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

          <div>
             <h4 className="text-white font-bold mb-6 text-xs tracking-widest uppercase">Newsletter</h4>
             <p className="text-slate-400 dark:text-neutral-500 text-sm mb-4">Recevez nos offres de location à Tanger et nos disponibilités en priorité.</p>
             <div className="flex">
               <input type="email" placeholder="Adresse E-mail" className="bg-slate-800 dark:bg-neutral-800 border-none rounded-l-md px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-blue w-full placeholder:text-slate-500 dark:placeholder:text-neutral-600" />
               <button className="bg-brand-blue hover:bg-blue-600 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-5 py-3 rounded-r-md text-xs font-bold transition-colors uppercase tracking-wider">OK</button>
             </div>
          </div>
        </div>

        <div className="border-t border-slate-800 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 dark:text-neutral-600 text-xs">© 2026 RLV Rahimi Car : Location de voitures. Tous droits réservés.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
                <span className="text-slate-500 hover:text-white cursor-pointer text-xs">Conditions d'Utilisation</span>
                <span className="text-slate-500 hover:text-white cursor-pointer text-xs">Politique de Confidentialité</span>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;