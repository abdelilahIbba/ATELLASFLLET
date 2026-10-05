import React from 'react';
import { Car, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { Vehicle } from '../../types';
import { getExpiryStatus } from '../../utils';

interface FleetStatsProps {
  vehicles: Vehicle[];
  onFilterExpiringDocs?: () => void;
}

const FleetStats: React.FC<FleetStatsProps> = ({ vehicles, onFilterExpiringDocs }) => {
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
  
  const expiringDocsCount = vehicles.reduce((acc, v) => {
      const dates = Object.values(v.documents || {}) as string[];
      if (!dates || dates.length === 0) return acc;
      
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fleet */}
        <div className="bg-[#EEF5FF] dark:bg-blue-950/20 border border-[#D0E2FF] dark:border-blue-900/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(24,94,224,0.05)] transition-all hover:shadow-md">
            <div>
                <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Flotte Totale</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{totalVehicles} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Véhicules</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <Car className="w-6 h-6" />
            </div>
        </div>

        {/* Available */}
        <div className="bg-[#EDFDF3] dark:bg-emerald-950/20 border border-[#C2F4D5] dark:border-emerald-900/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(16,185,129,0.05)] transition-all hover:shadow-md">
            <div>
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Disponible</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{availableVehicles}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
            </div>
        </div>

        {/* Maintenance */}
        <div className="bg-[#FEF2F2] dark:bg-rose-950/20 border border-[#FECDD3] dark:border-rose-900/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(244,63,94,0.05)] transition-all hover:shadow-md">
            <div>
                <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Maintenance</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{maintenanceVehicles}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-rose-900/40 border border-rose-200/50 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
                <Wrench className="w-6 h-6" />
            </div>
        </div>

        {/* Expiring Documents */}
        <button
          type="button"
          onClick={onFilterExpiringDocs}
          title="Filtrer les véhicules avec documents expirants"
          className={`border rounded-2xl p-5 flex items-center justify-between transition-all text-left w-full shadow-[0_2px_12px_rgba(245,158,11,0.05)] ${
            expiringDocsCount > 0
              ? 'bg-[#FFFBEB] dark:bg-amber-950/20 border-[#FDE68A] dark:border-amber-900/30 hover:border-amber-400 hover:shadow-md cursor-pointer'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 cursor-default'
          }`}
        >
            <div>
                <p className={`text-[11px] font-black uppercase tracking-wider mb-1 ${expiringDocsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                    Docs Expirant
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{expiringDocsCount}</p>
                {expiringDocsCount > 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                    Cliquer pour filtrer →
                  </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${
                expiringDocsCount > 0
                  ? 'bg-white/80 dark:bg-amber-900/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-400'
            }`}>
                <AlertTriangle className="w-6 h-6" />
            </div>
        </button>
    </div>
  );
};

export default FleetStats;
