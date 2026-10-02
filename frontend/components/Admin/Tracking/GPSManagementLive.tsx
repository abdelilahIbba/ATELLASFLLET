import React, { useEffect, useState } from 'react';
import { Activity, Car, Fuel, Gauge, Map as MapIcon, RefreshCw, Search, Unlink, Wifi, WifiOff } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { adminGpsApi, type AdminGpsAssignableUnit, type AdminGpsVehicle } from '../../../services/api';

const REFRESH_INTERVAL_MS = 30_000;

interface GPSManagementProps {
  canManageMappings: boolean;
}

const requestMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return error instanceof Error ? error.message : 'Impossible de charger les données GPS.';
};

const formatNumber = (value: number | null): string =>
  value === null ? 'N/D' : new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString('fr-MA') : 'Date inconnue';

const validLocation = (vehicle: AdminGpsVehicle): vehicle is AdminGpsVehicle & { latitude: number; longitude: number } =>
  vehicle.latitude !== null && vehicle.longitude !== null;

const MapViewport: React.FC<{ vehicles: AdminGpsVehicle[]; selected: AdminGpsVehicle | null }> = ({ vehicles, selected }) => {
  const map = useMap();
  const pointKey = vehicles.filter(validLocation).map(vehicle => `${vehicle.latitude},${vehicle.longitude}`).join('|');

  useEffect(() => {
    if (selected && validLocation(selected)) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 13), { duration: 0.5 });
      return;
    }

    const points = vehicles.filter(validLocation).map(vehicle => [vehicle.latitude, vehicle.longitude] as LatLngExpression);
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else if (points.length > 1) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [36, 36], maxZoom: 13 });
    }
  }, [map, pointKey, selected?.provider_device_id, selected?.latitude, selected?.longitude]);

  return null;
};

const GPSManagement: React.FC<GPSManagementProps> = ({ canManageMappings }) => {
  const [vehicles, setVehicles] = useState<AdminGpsVehicle[]>([]);
  const [assignableUnits, setAssignableUnits] = useState<AdminGpsAssignableUnit[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [associationError, setAssociationError] = useState('');
  const [associatingDevice, setAssociatingDevice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let disposed = false;
    let inFlight = false;

    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      setRefreshing(true);
      try {
        const response = await adminGpsApi.list();
        if (!disposed) {
          const nextVehicles = Array.isArray(response.vehicles) ? response.vehicles : [];
          setVehicles(nextVehicles);
          setAssignableUnits(Array.isArray(response.assignable_units) ? response.assignable_units : []);
          setFetchedAt(response.fetched_at ?? null);
          setError('');
          setSelectedDeviceId(current =>
            current && nextVehicles.some(vehicle => vehicle.provider_device_id === current)
              ? current
              : nextVehicles[0]?.provider_device_id ?? null,
          );
        }
      } catch (requestError) {
        if (!disposed) setError(requestMessage(requestError));
      } finally {
        inFlight = false;
        if (!disposed) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void load();
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [reloadKey]);

  const selectedVehicle = vehicles.find(vehicle => vehicle.provider_device_id === selectedDeviceId) ?? null;
  const unlinkedVehicles = vehicles.filter(vehicle => !vehicle.linked);
  const vehiclesWithLocation = vehicles.filter(validLocation);
  const query = search.trim().toLocaleLowerCase();
  const visibleVehicles = query
    ? vehicles.filter(vehicle =>
        [vehicle.vehicle_name, vehicle.provider_name, vehicle.plate ?? '']
          .some(value => value.toLocaleLowerCase().includes(query)),
      )
    : vehicles;

  const handleAssociate = async (deviceId: string, selection: string) => {
    if (!selection) return;
    const [carIdText, unitText] = selection.split(':');
    setAssociatingDevice(deviceId);
    setAssociationError('');
    try {
      await adminGpsApi.associate(deviceId, { car_id: Number(carIdText), unit_number: Number(unitText) });
      setReloadKey(value => value + 1);
    } catch (requestError) {
      setAssociationError(requestMessage(requestError));
    } finally {
      setAssociatingDevice(null);
    }
  };

  const handleUnassociate = async (deviceId: string) => {
    setAssociatingDevice(deviceId);
    setAssociationError('');
    try {
      await adminGpsApi.unassociate(deviceId);
      setReloadKey(value => value + 1);
    } catch (requestError) {
      setAssociationError(requestMessage(requestError));
    } finally {
      setAssociatingDevice(null);
    }
  };

  const retry = () => {
    setLoading(vehicles.length === 0);
    setReloadKey(value => value + 1);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <span>Chargement des voitures GPS…</span>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
        <WifiOff className="h-8 w-8 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Connexion GPS indisponible</h2>
        <p className="max-w-lg text-sm text-slate-500">{error}</p>
        <button onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="flex h-[calc(100vh-150px)] min-h-[560px] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600"><MapIcon className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Suivi GPS des voitures</h2>
            <p className="text-xs text-slate-500">
              {vehicles.length} appareils · {vehicles.length - unlinkedVehicles.length} associés · {unlinkedVehicles.length} non associés
              {fetchedAt ? ` · Actualisé ${formatDate(fetchedAt)}` : ''}
            </p>
          </div>
        </div>
        <button onClick={retry} disabled={refreshing} title="Actualiser les données GPS" className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {error && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <span>Actualisation impossible. Les dernières données restent affichées. {error}</span>
          <button onClick={retry} className="shrink-0 font-semibold underline">Réessayer</button>
        </div>
      )}
      {associationError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{associationError}</p>}

      {vehicles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-center dark:border-slate-700">
          <Car className="h-8 w-8 text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-white">Aucune voiture reçue</h3>
          <p className="text-sm text-slate-500">La liste GPS du fournisseur est vide.</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(150px,0.65fr)_minmax(280px,1fr)] gap-4 xl:grid-rows-1 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-3 dark:border-slate-800">
              <label className="relative block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une voiture…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
              {visibleVehicles.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500">Aucun résultat.</p>
              ) : visibleVehicles.map(vehicle => (
                <article key={vehicle.provider_device_id} className={`rounded-lg border p-3 transition-colors ${selectedDeviceId === vehicle.provider_device_id ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                  <button onClick={() => setSelectedDeviceId(vehicle.provider_device_id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{vehicle.vehicle_name}</h3>
                        <p className="truncate text-xs text-slate-500">
                          {vehicle.linked
                            ? [vehicle.plate, `GPS: ${vehicle.provider_name}`].filter(Boolean).join(' · ')
                            : `Appareil ${vehicle.provider_device_id}`}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold ${!vehicle.linked ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : vehicle.is_stale ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : vehicle.is_moving ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'}`}>
                        {!vehicle.linked ? 'Non associée' : vehicle.is_stale ? 'Données anciennes' : vehicle.is_moving ? 'En mouvement' : 'À l’arrêt'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Vitesse {formatNumber(vehicle.speed)}</span>
                      <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />Kilométrage {formatNumber(vehicle.odometer)}</span>
                      <span className="inline-flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />Carburant API {formatNumber(vehicle.fuel)}</span>
                      <span className="inline-flex items-center gap-1"><Wifi className="h-3.5 w-3.5" />Statut API {vehicle.status ?? 'N/D'}</span>
                    </div>
                  </button>

                  {canManageMappings && !vehicle.linked && (
                    <select
                      value=""
                      disabled={associatingDevice === vehicle.provider_device_id || assignableUnits.length === 0}
                      onChange={event => void handleAssociate(vehicle.provider_device_id, event.target.value)}
                      className="mt-3 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      aria-label={`Associer ${vehicle.provider_name} à une voiture`}
                    >
                      <option value="">{assignableUnits.length ? 'Associer à une voiture…' : 'Aucune unité disponible'}</option>
                      {assignableUnits.map(unit => (
                        <option key={`${unit.car_id}:${unit.unit_number}`} value={`${unit.car_id}:${unit.unit_number}`}>
                          {unit.vehicle_name} · Unité #{unit.unit_number}{unit.plate ? ` · ${unit.plate}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {canManageMappings && vehicle.linked && (
                    <button onClick={() => void handleUnassociate(vehicle.provider_device_id)} disabled={associatingDevice === vehicle.provider_device_id} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-50">
                      <Unlink className="h-3.5 w-3.5" /> Dissocier
                    </button>
                  )}
                </article>
              ))}
            </div>
          </aside>

          <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800">
            <MapContainer center={[0, 0] as LatLngExpression} zoom={2} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapViewport vehicles={vehicles} selected={selectedVehicle} />
              {vehiclesWithLocation.map(vehicle => (
                <Marker
                  key={vehicle.provider_device_id}
                  position={[vehicle.latitude, vehicle.longitude]}
                  eventHandlers={{ click: () => setSelectedDeviceId(vehicle.provider_device_id) }}
                >
                  <Popup>
                    <div className="min-w-48 space-y-1 text-sm">
                      <strong>{vehicle.vehicle_name}</strong>
                      {!vehicle.linked && <p>GPS non associé à une voiture</p>}
                      {vehicle.plate && <p>{vehicle.plate}{vehicle.unit_number ? ` · Unité #${vehicle.unit_number}` : ''}</p>}
                      {vehicle.linked && <p>Appareil GPS : {vehicle.provider_name}</p>}
                      <p>Vitesse API : {formatNumber(vehicle.speed)}</p>
                      <p>Kilométrage : {formatNumber(vehicle.odometer)}</p>
                      <p>Statut API : {vehicle.status ?? 'N/D'}</p>
                      <p>Dernière mise à jour : {formatDate(vehicle.reported_at)}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {vehiclesWithLocation.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6 text-center">
                <p className="rounded-lg bg-white/95 px-4 py-3 text-sm text-slate-600 shadow dark:bg-slate-900/95 dark:text-slate-300">Aucune coordonnée valide n’a été reçue pour les voitures GPS.</p>
              </div>
            )}
            {selectedVehicle && (
              <div className="absolute right-3 top-3 z-[500] w-64 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{selectedVehicle.vehicle_name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {selectedVehicle.linked
                    ? [selectedVehicle.plate, `GPS: ${selectedVehicle.provider_name}`].filter(Boolean).join(' · ')
                    : selectedVehicle.provider_name}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase text-slate-500">Kilométrage</p><p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(selectedVehicle.odometer)}</p><p className="text-[10px] text-slate-400">Valeur API</p></div>
                  <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase text-slate-500">Vitesse</p><p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(selectedVehicle.speed)}</p><p className="text-[10px] text-slate-400">Valeur API</p></div>
                  <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase text-slate-500">Carburant API</p><p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(selectedVehicle.fuel)}</p></div>
                  <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800"><p className="text-[10px] font-bold uppercase text-slate-500">Statut API</p><p className="text-sm font-bold text-slate-900 dark:text-white">{selectedVehicle.status ?? 'N/D'}</p></div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Dernière mise à jour : {formatDate(selectedVehicle.reported_at)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default GPSManagement;