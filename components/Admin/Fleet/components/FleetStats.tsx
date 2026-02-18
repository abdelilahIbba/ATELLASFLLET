import React from 'react';
import { Car, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { Vehicle } from '../../types';
import { getExpiryStatus } from '../../utils';

interface FleetStatsProps {
  vehicles: Vehicle[];
}

const FleetStats: React.FC<FleetStatsProps> = ({ vehicles }) => {
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
  
  const expiringDocsCount = vehicles.reduce((acc, v) => {
      const dates = Object.values(v.documents) as string[];
      // Defensive check if documents exist
      if (!dates) return acc;
      
      const hasExpiring = dates.some(d => {
        try {
            const status = getExpiryStatus(d);
            return status && status.label !== 'Valid';
        } catch (e) {
            return false;
        }
      });
      return hasExpiring ? acc + 1 : acc;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-brand-blue uppercase">Flotte Totale</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{totalVehicles} Véhicules</p>
            </div>
            <Car className="w-8 h-8 text-brand-blue" />
        </div>
        <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Disponible</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{availableVehicles}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Maintenance</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{maintenanceVehicles}</p>
            </div>
            <Wrench className="w-8 h-8 text-red-500" />
        </div>
        <div className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${expiringDocsCount > 0 ? 'bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
            <div>
                <p className={`text-xs font-bold uppercase ${expiringDocsCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>Docs Expirant</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{expiringDocsCount}</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${expiringDocsCount > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
        </div>
    </div>
  );
};

export default FleetStats;
