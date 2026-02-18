import React from 'react';
import { Search, Plus } from 'lucide-react';

interface FleetToolbarProps {
  vehicleSearch: string;
  setVehicleSearch: (s: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (s: string) => void;
  onAddVehicle: () => void;
}

const FleetToolbar: React.FC<FleetToolbarProps> = ({
  vehicleSearch,
  setVehicleSearch,
  vehicleFilter,
  setVehicleFilter,
  onAddVehicle
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue" />
            <input 
                type="text" 
                placeholder="Rechercher Véhicule, Plaque..." 
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
            />
            </div>
            <div className="flex gap-2">
            {[
                { val: 'All', label: 'Tous' },
                { val: 'Available', label: 'Disponible' },
                { val: 'Rented', label: 'Loué' },
                { val: 'Maintenance', label: 'Maintenance' }
            ].map(({ val, label }) => (
                <button 
                    key={val}
                    onClick={() => setVehicleFilter(val)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                        vehicleFilter === val 
                            ? 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                    {label}
                </button>
            ))}
            </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
            <button 
            onClick={onAddVehicle}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
            >
                <Plus className="w-4 h-4" /> Ajouter Véhicule
            </button>
        </div>
    </div>
  );
};

export default FleetToolbar;
