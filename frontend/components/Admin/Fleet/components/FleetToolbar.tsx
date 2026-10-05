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
  const filterPills = [
    { val: 'All',          label: 'Tous' },
    { val: 'Available',    label: 'Disponible' },
    { val: 'Rented',       label: 'Loué' },
    { val: 'Maintenance',  label: 'Maintenance' },
    { val: 'ExpiringDocs', label: 'Docs Expirant', isWarning: true },
  ];

  return (
    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
        {/* Left Section: Search and Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative group min-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                <input 
                    type="text" 
                    placeholder="Rechercher Véhicule, Plaque..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 shadow-xs transition-all"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {filterPills.map(({ val, label, isWarning }) => {
                    const isActive = vehicleFilter === val;
                    return (
                        <button 
                            key={val}
                            type="button"
                            onClick={() => setVehicleFilter(val)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 select-none ${
                                isActive
                                  ? isWarning
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/15'
                                  : isWarning
                                    ? 'bg-amber-50/90 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/30 hover:bg-amber-100/90'
                                    : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200/70 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {isWarning && <span className="text-[11px]">⚠</span>}
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Right Section: Add Vehicle Button */}
        <div className="flex justify-end">
            <button 
                type="button"
                onClick={onAddVehicle}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-brand-blue/20 transition-all active:scale-[0.98]"
            >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Ajouter Véhicule</span>
            </button>
        </div>
    </div>
  );
};

export default FleetToolbar;
