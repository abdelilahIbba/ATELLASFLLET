import React from 'react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => handleNav('home')}>
                <span className="text-2xl font-extrabold tracking-widest font-space">
                    ATELLAS<span className="font-light text-slate-400 dark:text-neutral-500">FLEET</span>
                </span>
            </div>
            <p className="text-slate-400 dark:text-neutral-500 text-sm leading-relaxed">
              Location de voitures à Rabat pour particuliers et entreprises. Service premium, réservation rapide et suivi professionnel.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-xs tracking-widest uppercase">Découvrir</h4>
            <ul className="space-y-3 text-slate-400 dark:text-neutral-500 text-sm">
              <li onClick={() => handleNav('fleet')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Notre Flotte</li>
              <li onClick={() => handleNav('#agency')} className="hover:text-brand-blue dark:hover:text-white cursor-pointer transition-colors">Agence à Rabat</li>
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
             <p className="text-slate-400 dark:text-neutral-500 text-sm mb-4">Recevez nos offres de location à Rabat et nos disponibilités en priorité.</p>
             <div className="flex">
               <input type="email" placeholder="Adresse E-mail" className="bg-slate-800 dark:bg-neutral-800 border-none rounded-l-md px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-blue w-full placeholder:text-slate-500 dark:placeholder:text-neutral-600" />
               <button className="bg-brand-blue hover:bg-blue-600 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-5 py-3 rounded-r-md text-xs font-bold transition-colors uppercase tracking-wider">OK</button>
             </div>
          </div>
        </div>

        <div className="border-t border-slate-800 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 dark:text-neutral-600 text-xs">© 2026 atellaFleet Rabat. Tous droits réservés.</p>
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