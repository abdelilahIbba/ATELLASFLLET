import React, { useState } from 'react';
import {
  Car,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Fuel,
  Gauge,
  MapPin,
  Navigation,
  RefreshCw,
  User,
  Zap,
} from 'lucide-react';
import type { AdminGpsVehicle } from '../../../services/api';
import { useVehicleAddress } from './reverseGeocodingService';

interface VehicleHoverTooltipCardProps {
  vehicle: AdminGpsVehicle & { latitude: number; longitude: number };
}

const formatNumber = (value: number | null): string =>
  value === null ? 'N/D' : new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString('fr-MA') : 'Date inconnue';

export const VehicleHoverTooltipCard: React.FC<VehicleHoverTooltipCardProps> = ({ vehicle }) => {
  const { address, loading } = useVehicleAddress(vehicle.latitude, vehicle.longitude, true);
  const [copied, setCopied] = useState(false);

  const isMoving = vehicle.is_moving;
  const isStopped = !isMoving && !vehicle.is_stale;
  const isStale = vehicle.is_stale;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = address?.formattedAddress
      ? `${vehicle.vehicle_name} (${vehicle.plate || 'N/D'}) - ${address.formattedAddress}`
      : `${vehicle.vehicle_name} (${vehicle.plate || 'N/D'}) - GPS: ${vehicle.latitude}, ${vehicle.longitude}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="w-72 sm:w-80 rounded-2xl border border-slate-700/90 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md text-white text-left font-sans select-text pointer-events-auto"
      style={{ minWidth: '270px' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Top Header: Car Name, Plate & Status Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="rounded-lg bg-emerald-500/20 p-1 text-emerald-400 shrink-0">
              <Car className="h-4 w-4" />
            </div>
            <h4 className="truncate text-sm font-black text-white" title={vehicle.vehicle_name}>
              {vehicle.vehicle_name}
            </h4>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-[11px] font-mono font-black text-white">
              {vehicle.plate || vehicle.provider_name}
            </span>
            {address?.isAgencyParking && (
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                🅿️ Parking Agence
              </span>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
            isMoving
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
              : address?.isAgencyParking
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-400/50'
              : isStopped
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : isStale
              ? 'bg-slate-700/50 text-slate-300 border-slate-600'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {isMoving
            ? '⚡ En mouvement'
            : address?.isAgencyParking
            ? '🅿️ Au Parking Agence'
            : isStopped
            ? '🅿️ À l’arrêt'
            : isStale
            ? 'Signal ancien'
            : 'Non associée'}
        </span>
      </div>

      {/* Primary Feature: Exact Parking Address Display */}
      <div className="mt-2.5 rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-900/70 border border-amber-500/30 p-2.5 shadow-inner">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            {isStopped ? 'Adresse où la voiture est garée :' : 'Position actuelle :'}
          </span>
          {address?.city && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
              {address.city}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-1.5 text-xs text-amber-200/80">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
            <span className="animate-pulse">Recherche de l’adresse exacte du stationnement…</span>
          </div>
        ) : address ? (
          <div>
            <p className="text-xs font-bold text-white leading-snug break-words">
              {address.formattedAddress}
            </p>
            {address.district && address.district !== address.city && (
              <p className="mt-1 text-[11px] text-slate-400">
                Secteur : <strong className="text-slate-300">{address.district}</strong>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-300">
            Coordonnées GPS : {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Location Booking Details if currently rented */}
      {vehicle.in_location && vehicle.location_booking && (
        <div className="mt-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Client : {vehicle.location_booking.client_name || 'Client N/D'}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-emerald-200/80">
            Réservation #{vehicle.location_booking.booking_id}
            {vehicle.location_booking.end_date ? ` · Retour prévu : ${vehicle.location_booking.end_date}` : ''}
          </p>
        </div>
      )}

      {/* Telemetry Metrics */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 px-2 py-1.5 border border-slate-800/80">
          <Gauge className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Vitesse</span>
            <span className="block font-mono text-xs font-black text-white">{formatNumber(vehicle.speed)} km/h</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 px-2 py-1.5 border border-slate-800/80">
          <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Kilométrage</span>
            <span className="block font-mono text-xs font-bold text-white">{formatNumber(vehicle.odometer)}</span>
          </div>
        </div>
      </div>

      {/* Reported Timestamp */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>Actualisé : {formatDate(vehicle.reported_at)}</span>
        </span>
      </div>

      {/* Bottom Actions: Copy Address & Open in Google Maps navigation */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition active:scale-95"
          title="Copier le nom et l'adresse exacte"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Adresse copiée !' : 'Copier adresse'}</span>
        </button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${vehicle.latitude},${vehicle.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition active:scale-95"
          title="Ouvrir l'emplacement dans Google Maps"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
    </div>
  );
};
