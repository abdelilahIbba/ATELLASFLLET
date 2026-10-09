import React, { useState } from 'react';
import { Check, Copy, ExternalLink, MapPin, Navigation, RefreshCw } from 'lucide-react';
import type { AdminGpsVehicle } from '../../../services/api';
import { useVehicleAddress } from './reverseGeocodingService';

interface VehicleHudAddressCardProps {
  vehicle: AdminGpsVehicle & { latitude: number; longitude: number };
}

export const VehicleHudAddressCard: React.FC<VehicleHudAddressCardProps> = ({ vehicle }) => {
  const { address, loading } = useVehicleAddress(vehicle.latitude, vehicle.longitude, true);
  const [copied, setCopied] = useState(false);

  const isMoving = vehicle.is_moving;
  const isStopped = !isMoving && !vehicle.is_stale;

  const handleCopy = () => {
    const textToCopy = address?.formattedAddress
      ? `${vehicle.vehicle_name} (${vehicle.plate || 'N/D'}) - ${address.formattedAddress}`
      : `${vehicle.vehicle_name} (${vehicle.plate || 'N/D'}) - GPS: ${vehicle.latitude}, ${vehicle.longitude}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 shadow-inner">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          {isStopped ? 'Adresse du stationnement (Parking)' : 'Position actuelle'}
        </span>
        {address?.city && (
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
            {address.city}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-1 text-xs text-amber-300/80">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
          <span className="animate-pulse">Recherche de l’adresse exacte du véhicule…</span>
        </div>
      ) : address ? (
        <div>
          <p className="text-xs font-bold text-white leading-snug">
            {address.formattedAddress}
          </p>
          {address.district && address.district !== address.city && (
            <p className="mt-1 text-[11px] text-slate-400">
              Quartier : <strong className="text-slate-200">{address.district}</strong>
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
            GPS : {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-300 font-mono">
          Coordonnées : {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
        </p>
      )}

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition active:scale-95"
          title="Copier l'adresse complète"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Adresse copiée !' : 'Copier l’adresse'}</span>
        </button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${vehicle.latitude},${vehicle.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
          title="Ouvrir dans Google Maps pour naviguer jusqu'à la voiture"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Itinéraire Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
    </div>
  );
};
