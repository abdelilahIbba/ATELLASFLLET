import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { useVehicleAddress } from './reverseGeocodingService';

interface VehicleSidebarAddressRowProps {
  latitude: number;
  longitude: number;
  isStopped: boolean;
  isHovered?: boolean;
}

export const VehicleSidebarAddressRow: React.FC<VehicleSidebarAddressRowProps> = ({
  latitude,
  longitude,
  isStopped,
  isHovered = false,
}) => {
  const { address, loading } = useVehicleAddress(latitude, longitude, true);

  return (
    <div className={`mt-2 flex items-start gap-1.5 rounded-xl p-2 text-xs border transition-all ${
      address?.isAgencyParking
        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-100 dark:border-slate-800'
    }`}>
      <MapPin className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
        address?.isAgencyParking ? 'text-emerald-600 dark:text-emerald-400' : isStopped ? 'text-amber-500' : 'text-emerald-500'
      }`} />
      <div className="min-w-0 flex-1">
        <span className={`block text-[10px] font-black uppercase tracking-wider ${
          address?.isAgencyParking ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {address?.isAgencyParking ? '🅿️ Au Parking Agence :' : isStopped ? 'Stationnée à :' : 'Position :'}
        </span>
        {loading && !address ? (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
            <RefreshCw className="h-2.5 w-2.5 animate-spin text-amber-500" />
            <span>Localisation de l’adresse…</span>
          </span>
        ) : address ? (
          <span className={`block text-[11px] font-bold line-clamp-1 group-hover:line-clamp-none transition-all ${
            address.isAgencyParking ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-200'
          }`} title={address.formattedAddress}>
            {address.formattedAddress}
          </span>
        ) : (
          <span className="block text-[11px] text-slate-500 font-mono">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
};
