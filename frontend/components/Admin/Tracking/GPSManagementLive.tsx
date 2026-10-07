import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  Fuel,
  Gauge,
  Info,
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Unlink,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import * as ReactLeaflet from 'react-leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import L from 'leaflet';
import {
  adminGpsApi,
  type AdminGpsAssignableUnit,
  type AdminGpsLocationVehicle,
  type AdminGpsVehicle,
} from '../../../services/api';
import { interpolateGpsPosition, mergeGpsSnapshots } from './gpsLiveUpdates';
import {
  buildVehicleTrajectory,
  formatDurationHMS,
  formatDurationHuman,
  recordLivePoint,
  type TrajectoryPoint,
  type TrajectoryStop,
  type VehicleTrajectoryData,
} from './trajectoryService';

const PolylineComponent = (ReactLeaflet as any).Polyline || (() => null);

const DEFAULT_REFRESH_INTERVAL_SECONDS = 15;
const MIN_REFRESH_INTERVAL_SECONDS = 15;
const MAX_REFRESH_INTERVAL_SECONDS = 600;
const MARKER_ANIMATION_MS = 1_200;

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

const validLocation = (
  vehicle: AdminGpsVehicle,
): vehicle is AdminGpsVehicle & { latitude: number; longitude: number } =>
  vehicle.latitude !== null && vehicle.longitude !== null;

type MarkerKind = 'moving' | 'stopped' | 'unlinked' | 'stale';

const markerKind = (vehicle: AdminGpsVehicle): MarkerKind => {
  if (vehicle.is_stale) return 'stale';
  if (!vehicle.linked) return 'unlinked';
  return vehicle.is_moving ? 'moving' : 'stopped';
};

const markerColors: Record<MarkerKind, string> = {
  moving: '#16a34a',
  stopped: '#2563eb',
  unlinked: '#d97706',
  stale: '#64748b',
};

/** High-visibility pin icons matching ALLO GPS with white "P" for stopped cars and white car for moving cars */
const vehicleMarkerIcon = (
  kind: MarkerKind,
  inLocation: boolean,
  deviceId: string,
  isSelected: boolean = false,
  label: string | null = null,
): L.DivIcon => {
  const cleanDeviceId = deviceId.replace(/[^a-zA-Z0-9_-]/g, '');
  const color = markerColors[kind];
  const isMoving = kind === 'moving';
  const isStopped = kind === 'stopped';

  const pulseEffect = isMoving
    ? `<span style="position:absolute;top:2px;left:2px;width:34px;height:34px;border-radius:50%;background:${color};opacity:0.55;animation:gps-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></span>`
    : '';

  const labelHtml = label
    ? `<div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(15,23,42,0.92);color:#ffffff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.25);pointer-events:none;z-index:1000;">${label}</div>`
    : '';

  const html = `
    <div style="position:relative;width:38px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;${isSelected ? 'transform:scale(1.15);transition:transform 0.2s;' : ''}">
      ${pulseEffect}
      <span data-provider-device-id="${cleanDeviceId}" style="position:relative;display:block;width:38px;height:48px;border:${inLocation ? '3px solid #15803d' : '2px solid #fff'};border-radius:24px 24px 24px 0;transform:rotate(-45deg);background:${color};box-shadow:0 3px 8px rgba(0,0,0,0.45);box-sizing:border-box;margin-top:-6px;">
        <i style="display:none;background:${color}"></i>
      </span>
      <div style="position:absolute;top:0;left:0;width:38px;height:38px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;">
        ${isStopped ? '<span style="color:#ffffff;font-size:17px;font-weight:900;font-family:system-ui,-apple-system,sans-serif;margin-top:-4px;">P</span>' : ''}
        ${isMoving ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style="margin-top:-4px;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM7.5 15c-.83 0-1.5-.67-1.5-1.5S6.67 12 7.5 12s1.5.67 1.5 1.5S8.33 15 7.5 15zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>' : ''}
        ${!isStopped && !isMoving ? '<span style="color:#ffffff;font-size:15px;font-weight:bold;margin-top:-4px;">!</span>' : ''}
      </div>
      ${labelHtml}
    </div>
  `;

  return L.divIcon({
    className: 'gps-vehicle-marker',
    html,
    iconSize: [38, 48],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
  });
};

/** Blue teardrop pin marker with white "P" for intermediate parking stops along today's route */
const parkingStopMarkerIcon = (stop: TrajectoryStop): L.DivIcon => L.divIcon({
  className: 'gps-stop-marker',
  html: `
    <div style="position:relative;width:30px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <span style="position:relative;display:block;width:30px;height:38px;border:2px solid #ffffff;border-radius:18px 18px 18px 0;transform:rotate(-45deg);background:#2563eb;box-shadow:0 2px 6px rgba(0,0,0,0.45);box-sizing:border-box;margin-top:-4px;"></span>
      <div style="position:absolute;top:0;left:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;">
        <span style="color:#ffffff;font-size:14px;font-weight:900;font-family:system-ui,-apple-system,sans-serif;margin-top:-3px;">P</span>
      </div>
      <div style="position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(37,99,235,0.92);color:#ffffff;font-size:9px;font-weight:700;padding:0px 4px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.4);pointer-events:none;">${stop.durationFormatted}</div>
    </div>
  `,
  iconSize: [30, 38],
  iconAnchor: [15, 34],
  popupAnchor: [0, -32],
});

/** Start of route checkered flag icon */
const startFlagMarkerIcon = (): L.DivIcon => L.divIcon({
  className: 'gps-start-flag-marker',
  html: `
    <div style="position:relative;width:32px;height:40px;display:flex;align-items:center;justify-content:center;">
      <div style="width:24px;height:24px;border:2px solid #ffffff;border-radius:4px;transform:rotate(45deg);background:repeating-conic-gradient(#ef4444 0% 25%, #ffffff 0% 50%) 50% / 12px 12px;box-shadow:0 3px 6px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#dc2626;color:#ffffff;font-size:9px;font-weight:800;padding:1px 5px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.4);">DÉPART</div>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 36],
  popupAnchor: [0, -34],
});

const MapViewport: React.FC<{
  vehicles: AdminGpsVehicle[];
  focusVehicle: AdminGpsVehicle | null;
  focusSequence: number;
}> = ({ vehicles, focusVehicle, focusSequence }) => {
  const map = useMap();
  const initialViewSet = useRef(false);
  const lastFocusSequence = useRef(0);
  const pointKey = vehicles
    .filter(validLocation)
    .map(vehicle => `${vehicle.latitude},${vehicle.longitude}`)
    .join('|');

  useEffect(() => {
    if (focusSequence !== lastFocusSequence.current) {
      lastFocusSequence.current = focusSequence;
      if (focusVehicle && validLocation(focusVehicle)) {
        map.flyTo([focusVehicle.latitude, focusVehicle.longitude], Math.max(map.getZoom(), 13), { duration: 0.5 });
      }
      return;
    }

    if (initialViewSet.current) return;
    const points = vehicles.filter(validLocation).map(vehicle => [vehicle.latitude, vehicle.longitude] as LatLngExpression);
    if (points.length === 0) return;
    initialViewSet.current = true;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else if (points.length > 1) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [36, 36], maxZoom: 13 });
    }
  }, [map, pointKey, focusSequence, focusVehicle?.provider_device_id, focusVehicle?.latitude, focusVehicle?.longitude]);

  return null;
};

const AnimatedGpsMarker: React.FC<{
  vehicle: AdminGpsVehicle & { latitude: number; longitude: number };
  isSelected: boolean;
  onSelect: () => void;
}> = ({ vehicle, isSelected, onSelect }) => {
  const markerRef = useRef<L.Marker | null>(null);
  const initialPosition = useRef<LatLngExpression>([vehicle.latitude, vehicle.longitude]);
  const currentPosition = useRef<[number, number]>([vehicle.latitude, vehicle.longitude]);

  useEffect(() => {
    const marker = markerRef.current;
    const target: [number, number] = [vehicle.latitude, vehicle.longitude];
    if (!marker) {
      currentPosition.current = target;
      return;
    }

    const from = currentPosition.current;
    if (from[0] === target[0] && from[1] === target[1]) return;

    let frame = 0;
    const startedAt = performance.now();
    const animate = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / MARKER_ANIMATION_MS);
      const position = interpolateGpsPosition(from, target, progress);
      marker.setLatLng(position);
      currentPosition.current = position;
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        currentPosition.current = target;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [vehicle.latitude, vehicle.longitude]);

  return (
    <Marker
      ref={markerRef}
      position={initialPosition.current}
      icon={vehicleMarkerIcon(
        markerKind(vehicle),
        vehicle.in_location,
        vehicle.provider_device_id,
        isSelected,
        vehicle.plate || vehicle.vehicle_name,
      )}
      eventHandlers={{ click: onSelect }}
    >
      <Popup>
        <div className="min-w-48 space-y-1 text-sm">
          <strong className="text-base text-slate-900">{vehicle.vehicle_name}</strong>
          <p className="font-semibold text-emerald-700">matricule : {vehicle.plate ?? 'Non fourni par API'}</p>
          {!vehicle.linked && <p className="text-amber-600 font-medium">GPS non associé à une voiture</p>}
          {vehicle.unit_identity && <p className="text-slate-600">{vehicle.unit_identity}</p>}
          {vehicle.linked && <p className="text-slate-500">Appareil GPS : {vehicle.provider_name}</p>}
          {vehicle.in_location && vehicle.location_booking && (
            <p className="font-semibold text-emerald-800">
              En location · {vehicle.location_booking.client_name || 'Client N/D'} · Réservation #{vehicle.location_booking.booking_id}
            </p>
          )}
          <div className="mt-2 grid grid-cols-2 gap-1 border-t border-slate-200 pt-2 text-xs text-slate-600">
            <p>Vitesse API : <strong>{formatNumber(vehicle.speed)} km/h</strong></p>
            <p>Kilométrage : <strong>{formatNumber(vehicle.odometer)}</strong></p>
            <p>Statut API : {vehicle.status ?? 'N/D'}</p>
            <p>État : {markerKind(vehicle) === 'moving' ? 'En mouvement' : 'À l’arrêt'}</p>
          </div>
          <p className="text-[11px] text-slate-400">Dernière mise à jour : {formatDate(vehicle.reported_at)}</p>
        </div>
      </Popup>
    </Marker>
  );
};

const MapResizeHandler: React.FC<{ isFullscreen: boolean; isSidebarCollapsed: boolean }> = ({
  isFullscreen,
  isSidebarCollapsed,
}) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        (map as any).invalidateSize?.();
      } catch {
        // Safe fallback in test mock
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isFullscreen, isSidebarCollapsed]);
  return null;
};

const GPSManagement: React.FC<GPSManagementProps> = ({ canManageMappings }) => {
  const [vehicles, setVehicles] = useState<AdminGpsVehicle[]>([]);
  const vehiclesRef = useRef<AdminGpsVehicle[]>([]);
  const [assignableUnits, setAssignableUnits] = useState<AdminGpsAssignableUnit[]>([]);
  const [locationVehicles, setLocationVehicles] = useState<AdminGpsLocationVehicle[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [focusSequence, setFocusSequence] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [associationError, setAssociationError] = useState('');
  const [associatingDevice, setAssociatingDevice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Map layer toggle: Realistic Satellite vs Plan (Streets)
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets'>('satellite');

  // Fullscreen & layout sizing states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);

  // Trajectory view: active when user clicks on a vehicle
  const [activeTrajectoryDeviceId, setActiveTrajectoryDeviceId] = useState<string | null>(null);

  // Trajectory view & playback controls
  const [showStops, setShowStops] = useState(true);
  const [playbackActive, setPlaybackActive] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeedMultiplier, setPlaybackSpeedMultiplier] = useState<number>(300);
  const [showTripModal, setShowTripModal] = useState(false);

  // Keyboard shortcut: Escape exits fullscreen mode or closes trip modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setShowTripModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let disposed = false;
    let inFlight = false;
    let requestSequence = 0;
    let timer: number | undefined;
    let activeRequest: AbortController | null = null;
    let refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_SECONDS * 1000;

    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    const scheduleNext = () => {
      if (disposed || document.hidden) return;
      clearTimer();
      timer = window.setTimeout(() => void load(), refreshIntervalMs);
    };

    const load = async () => {
      if (disposed || document.hidden || inFlight) return;
      inFlight = true;
      const thisRequest = ++requestSequence;
      const controller = new AbortController();
      activeRequest = controller;
      setRefreshing(true);
      try {
        const response = await adminGpsApi.list(controller.signal);
        if (!disposed && thisRequest === requestSequence) {
          const incoming = Array.isArray(response.vehicles) ? response.vehicles : [];
          const nextVehicles = mergeGpsSnapshots(vehiclesRef.current, incoming);
          vehiclesRef.current = nextVehicles;
          setVehicles(nextVehicles);
          setAssignableUnits(Array.isArray(response.assignable_units) ? response.assignable_units : []);
          setLocationVehicles(Array.isArray(response.location_vehicles) ? response.location_vehicles : []);
          setFetchedAt(response.fetched_at ?? null);
          const configuredInterval = Number(response.refresh_interval_seconds);
          refreshIntervalMs = (Number.isFinite(configuredInterval)
            ? Math.max(MIN_REFRESH_INTERVAL_SECONDS, Math.min(MAX_REFRESH_INTERVAL_SECONDS, configuredInterval))
            : DEFAULT_REFRESH_INTERVAL_SECONDS) * 1000;
          setError('');

          // Record live points for trajectory continuity
          incoming.forEach(v => recordLivePoint(v));

          setSelectedDeviceId(current =>
            current && nextVehicles.some(vehicle => vehicle.provider_device_id === current)
              ? current
              : nextVehicles[0]?.provider_device_id ?? null,
          );
        }
      } catch (requestError) {
        if (!disposed && thisRequest === requestSequence && !controller.signal.aborted) {
          setError(requestMessage(requestError));
        }
      } finally {
        if (thisRequest === requestSequence) {
          inFlight = false;
          activeRequest = null;
        }
        if (!disposed && thisRequest === requestSequence) {
          setLoading(false);
          setRefreshing(false);
          scheduleNext();
        }
      }
    };

    const handleVisibilityChange = () => {
      clearTimer();
      if (document.hidden) {
        requestSequence++;
        inFlight = false;
        activeRequest?.abort();
        activeRequest = null;
        setRefreshing(false);
      } else {
        void load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) void load();

    return () => {
      disposed = true;
      requestSequence++;
      clearTimer();
      activeRequest?.abort();
      activeRequest = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // Build today's trajectory data for the selected vehicle when trajectory view is active
  const trajectory: VehicleTrajectoryData | null = useMemo(() => {
    if (!activeTrajectoryDeviceId) return null;
    const targetVehicle = vehicles.find(v => v.provider_device_id === activeTrajectoryDeviceId);
    if (!targetVehicle || !validLocation(targetVehicle)) return null;
    return buildVehicleTrajectory(targetVehicle);
  }, [activeTrajectoryDeviceId, vehicles]);

  // Positions array for the red line
  const trajectoryPositions: [number, number][] = useMemo(() => {
    if (!trajectory || trajectory.points.length === 0) return [];
    return trajectory.points.map(p => [p.latitude, p.longitude]);
  }, [trajectory]);

  // Playback timer animation
  useEffect(() => {
    if (!playbackActive || !trajectory || trajectory.points.length === 0) return;

    const intervalTime = Math.max(30, Math.floor(1000 / (playbackSpeedMultiplier > 10 ? 10 : playbackSpeedMultiplier)));
    const timer = setInterval(() => {
      setPlaybackIndex(prev => {
        if (prev >= trajectory.points.length - 1) {
          setPlaybackActive(false);
          return trajectory.points.length - 1;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [playbackActive, trajectory, playbackSpeedMultiplier]);

  // When switching selected vehicle, reset playback to the end (current position)
  useEffect(() => {
    if (trajectory) {
      setPlaybackIndex(trajectory.points.length - 1);
      setPlaybackActive(false);
    }
  }, [selectedDeviceId]);

  const currentPlaybackPoint: TrajectoryPoint | null = useMemo(() => {
    if (!trajectory || trajectory.points.length === 0) return null;
    const idx = Math.min(playbackIndex, trajectory.points.length - 1);
    return trajectory.points[idx] || null;
  }, [trajectory, playbackIndex]);

  const handleAssociate = async (deviceId: string, selection: string) => {
    if (!selection) return;
    setAssociatingDevice(deviceId);
    setAssociationError('');
    try {
      if (selection.startsWith('matricule:')) {
        await adminGpsApi.associate(deviceId, { matricule: selection.slice('matricule:'.length) });
      } else {
        const [carIdText, unitText] = selection.split(':');
        await adminGpsApi.associate(deviceId, { car_id: Number(carIdText), unit_number: Number(unitText) });
      }
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

  const focusVehicle = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setActiveTrajectoryDeviceId(deviceId);
    setFocusSequence(value => value + 1);
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
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="flex h-[calc(100vh-150px)] min-h-[560px] flex-col gap-3 font-sans">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 text-white shadow-md shadow-emerald-500/20">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Suivi GPS des voitures</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                AlloGPS Live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {vehicles.length} appareils GPS · {vehicles.length - unlinkedVehicles.length} associés · {unlinkedVehicles.length} non associés · {assignableUnits.length} unités de voiture disponibles
              {fetchedAt ? ` · Actualisé ${formatDate(fetchedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(v => !v)}
            title={isSidebarCollapsed ? "Afficher la liste des voitures" : "Masquer la liste des voitures pour agrandir la carte"}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {isSidebarCollapsed ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Afficher liste ({vehicles.length})</span>
              </>
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
                <span>Masquer liste</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="Agrandir la carte en plein écran"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-600/40 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Agrandir la carte</span>
          </button>

          <button
            onClick={retry}
            disabled={refreshing}
            title="Actualiser les données GPS"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </header>

      {/* Legend Bar */}
      <div
        aria-label="Légende de la map"
        className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-extrabold text-slate-900 dark:text-white">Légende</span>
          {([
            ['moving', 'En mouvement'],
            ['stopped', 'À l’arrêt'],
            ['unlinked', 'GPS non associé'],
            ['stale', 'Données GPS anciennes'],
          ] as const).map(([kind, label]) => (
            <span key={kind} className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: markerColors[kind] }}
              />
              <span className="font-medium">{label}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-[3px] border-emerald-700 bg-white shadow-sm" />
            <span className="font-medium">Voiture en location</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>Ligne rouge = Trajet parcouru aujourd'hui</span>
        </div>
      </div>

      {error && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <span>Actualisation impossible. Les dernières données restent affichées. {error}</span>
          <button onClick={retry} className="shrink-0 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}
      {associationError && (
        <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {associationError}
        </p>
      )}

      {vehicles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-center dark:border-slate-700">
          <Car className="h-8 w-8 text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-white">Aucune voiture reçue</h3>
          <p className="text-sm text-slate-500">La liste GPS du fournisseur est vide.</p>
        </div>
      ) : (
        <div className={`grid min-h-0 flex-1 gap-4 xl:gap-6 transition-all ${
          isSidebarCollapsed
            ? 'grid-cols-1'
            : 'grid-rows-[minmax(180px,0.65fr)_minmax(320px,1fr)] lg:grid-rows-1 lg:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]'
        }`}>
          {/* Left Vehicles Sidebar */}
          <aside className={`min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
              <label className="relative block flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Rechercher une voiture…"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                title="Masquer la liste pour agrandir la carte"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Masquer</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
              {visibleVehicles.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500">Aucun résultat.</p>
              ) : (
                visibleVehicles.map(vehicle => {
                  const isSelected = selectedDeviceId === vehicle.provider_device_id;
                  const kind = markerKind(vehicle);
                  return (
                    <article
                      data-provider-device-id={vehicle.provider_device_id}
                      key={vehicle.provider_device_id}
                      className={`group relative rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30 dark:bg-emerald-950/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:hover:border-slate-600'
                      }`}
                    >
                      <button onClick={() => focusVehicle(vehicle.provider_device_id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{vehicle.vehicle_name}</h3>
                            <p className="truncate text-xs text-slate-500">
                              {vehicle.linked
                                ? `${vehicle.unit_identity} · GPS: ${vehicle.provider_name}`
                                : `GPS: ${vehicle.provider_name} · Appareil ${vehicle.provider_device_id}`}
                            </p>
                            <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                              matricule : {vehicle.plate ?? 'Non fourni par API'}
                            </p>
                            {vehicle.in_location && vehicle.location_booking && (
                              <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                En location · {vehicle.location_booking.client_name || 'Client N/D'} · Réservation #{vehicle.location_booking.booking_id}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                              kind === 'unlinked'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                : kind === 'stale'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                : kind === 'moving'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 animate-pulse'
                                : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
                            }`}
                          >
                            {kind === 'unlinked'
                              ? 'Non associée'
                              : kind === 'stale'
                              ? 'Données anciennes'
                              : kind === 'moving'
                              ? 'En mouvement'
                              : 'À l’arrêt'}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Activity className="h-3.5 w-3.5 text-emerald-600" />
                            Vitesse {formatNumber(vehicle.speed)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Gauge className="h-3.5 w-3.5 text-sky-600" />
                            Kilométrage {formatNumber(vehicle.odometer)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Fuel className="h-3.5 w-3.5 text-amber-500" />
                            Carburant API {formatNumber(vehicle.fuel)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Wifi className="h-3.5 w-3.5 text-indigo-500" />
                            Statut API {vehicle.status ?? 'N/D'}
                          </span>
                        </div>
                      </button>

                      {vehicle.linked &&
                        (vehicle.association_mode === 'matricule' || vehicle.association_mode === 'manual_matricule') && (
                          <p className="mt-2 text-xs text-slate-500">association par matricule · {vehicle.plate}</p>
                        )}

                      {canManageMappings && !vehicle.linked && (
                        <select
                          value=""
                          disabled={
                            associatingDevice === vehicle.provider_device_id ||
                            (assignableUnits.length === 0 && (vehicle.assignable_matricules?.length ?? 0) === 0)
                          }
                          onChange={event => void handleAssociate(vehicle.provider_device_id, event.target.value)}
                          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          aria-label={`Associer ${vehicle.provider_name} à une voiture`}
                        >
                          <option value="">Associer cette voiture…</option>
                          {(vehicle.assignable_matricules ?? []).map(plate => (
                            <option key={`matricule:${plate}`} value={`matricule:${plate}`}>
                              Matricule {plate}
                              {plate === vehicle.plate ? ' · Correspondance API' : ''}
                            </option>
                          ))}
                          {assignableUnits.map(unit => (
                            <option key={`${unit.car_id}:${unit.unit_number}`} value={`${unit.car_id}:${unit.unit_number}`}>
                              {unit.unit_label}
                            </option>
                          ))}
                        </select>
                      )}

                      {canManageMappings && vehicle.linked && vehicle.association_mode !== 'matricule' && (
                        <button
                          onClick={() => void handleUnassociate(vehicle.provider_device_id)}
                          disabled={associatingDevice === vehicle.provider_device_id}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-50"
                        >
                          <Unlink className="h-3.5 w-3.5" /> Dissocier
                        </button>
                      )}
                    </article>
                  );
                })
              )}

              {/* Voitures en location section */}
              <section aria-label="Voitures en location" role="region" className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Voitures en location
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                    {locationVehicles.length}
                  </span>
                </div>
                {locationVehicles.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">
                    Aucune voiture en location actuellement.
                  </p>
                ) : (
                  locationVehicles.map(locationVehicle => (
                    <button
                      key={locationVehicle.location_id}
                      type="button"
                      disabled={!locationVehicle.gps_device_id}
                      onClick={() => locationVehicle.gps_device_id && focusVehicle(locationVehicle.gps_device_id)}
                      className="mb-2 w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-left transition hover:border-emerald-500 disabled:cursor-default dark:border-emerald-900/60 dark:bg-emerald-950/20"
                    >
                      <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                        {locationVehicle.unit_identity}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-slate-600 dark:text-slate-300">
                        Client : {locationVehicle.client_name || 'N/D'}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Réservation #{locationVehicle.booking_id} · {locationVehicle.start_date || 'N/D'} → {locationVehicle.end_date || 'N/D'}
                      </span>
                      <span
                        className={`mt-1 block text-[11px] font-bold ${
                          locationVehicle.gps_available
                            ? locationVehicle.is_stale
                              ? 'text-slate-500'
                              : 'text-emerald-700 dark:text-emerald-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {locationVehicle.gps_available
                          ? `GPS ${locationVehicle.is_stale ? 'ancien' : 'actif'} · Kilométrage ${formatNumber(locationVehicle.odometer)}`
                          : 'Position GPS indisponible'}
                      </span>
                    </button>
                  ))
                )}
              </section>
            </div>
          </aside>

          {/* Right Map Canvas & Live HUD */}
          <div
            className={
              isFullscreen
                ? 'fixed inset-0 z-[9999] flex flex-col bg-slate-950 p-2 sm:p-4 text-white overflow-hidden shadow-2xl'
                : 'relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-md dark:border-slate-800'
            }
          >
            {/* Top Control Bar in Fullscreen mode */}
            {isFullscreen && (
              <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-2 text-white shadow-md shadow-emerald-500/20">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Suivi GPS des voitures</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400">
                        Plein écran
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {vehicles.length} appareils GPS actifs · Tangier AlloGPS Live
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Map Layer switcher */}
                  <div className="flex items-center rounded-xl border border-white/20 bg-slate-950 p-1">
                    <button
                      type="button"
                      onClick={() => setMapLayer('satellite')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                        mapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🛰️ Satellite</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapLayer('streets')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                        mapLayer === 'streets' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🗺️ Plan</span>
                    </button>
                  </div>

                  {/* Close Fullscreen button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-xl transition active:scale-95"
                    title="Quitter le plein écran (Échap)"
                  >
                    <X className="h-4 w-4" />
                    <span>Fermer le plein écran (Échap)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inner Map Viewport & Controls Canvas */}
            <div className={isFullscreen ? 'relative flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl' : 'relative w-full h-full'}>
              {/* Top-Left Map Controls in Normal mode */}
              {!isFullscreen && (
                <div className="absolute left-14 top-3 z-[500] flex flex-wrap items-center gap-2">
                  {/* Layer toggle */}
                  <div className="flex items-center rounded-xl border border-white/20 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setMapLayer('satellite')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        mapLayer === 'satellite'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>🛰️ Satellite</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapLayer('streets')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        mapLayer === 'streets'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>🗺️ Plan</span>
                    </button>
                  </div>

                  {/* Fullscreen Maximize Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md transition hover:bg-slate-800 hover:border-emerald-400 active:scale-95"
                    title="Agrandir la carte en plein écran"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Agrandir la carte</span>
                  </button>

                  {/* Show sidebar button when collapsed */}
                  {isSidebarCollapsed && (
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-2xl backdrop-blur-md transition hover:bg-slate-800 hover:border-cyan-400 active:scale-95"
                      title="Afficher la liste des voitures"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Afficher la liste ({vehicles.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Top-Right Maximize button in Normal mode when no vehicle is selected */}
              {!selectedVehicle && !isFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/90 px-3.5 py-2 text-xs font-black text-white shadow-2xl backdrop-blur-md transition hover:bg-slate-800 hover:border-emerald-500 hover:text-emerald-400 active:scale-95"
                  title="Agrandir la carte en plein écran"
                >
                  <Maximize2 className="h-4 w-4 text-emerald-400" />
                  <span>Agrandir la carte</span>
                </button>
              )}

              {/* Map Container */}
              <MapContainer
                center={[35.76, -5.82] as LatLngExpression}
                zoom={13}
                scrollWheelZoom
                style={{ width: '100%', height: '100%' }}
              >
                {mapLayer === 'satellite' ? (
                  <>
                    {/* Google Hybrid Satellite TileLayer (Photorealistic satellite imagery of Tangier with roads and labels) */}
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution='&copy; Google Maps'
                      maxZoom={20}
                    />
                  </>
                ) : (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                )}

                <MapViewport vehicles={vehicles} focusVehicle={selectedVehicle} focusSequence={focusSequence} />
                <MapResizeHandler isFullscreen={isFullscreen} isSidebarCollapsed={isSidebarCollapsed} />

              {/* Red Line Trajectory for selected vehicle */}
              {PolylineComponent && trajectoryPositions.length > 1 && (
                <>
                  {/* Glow shadow line */}
                  <PolylineComponent
                    positions={trajectoryPositions}
                    pathOptions={{
                      color: '#dc2626',
                      weight: 8,
                      opacity: 0.35,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  {/* Vibrant red trajectory line */}
                  <PolylineComponent
                    positions={trajectoryPositions}
                    pathOptions={{
                      color: '#ef4444',
                      weight: 4.5,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </>
              )}

              {/* Start point checkered flag */}
              {trajectory && trajectory.startPoint && (
                <Marker
                  position={[trajectory.startPoint.latitude, trajectory.startPoint.longitude]}
                  icon={startFlagMarkerIcon()}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="block text-rose-600 font-bold">🏁 Point de Départ du Jour</strong>
                      <p className="text-slate-600 font-medium">Heure : {trajectory.startPoint.timeFormatted}</p>
                      <p className="text-slate-500">Coordonnées : {trajectory.startPoint.latitude.toFixed(4)}, {trajectory.startPoint.longitude.toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Intermediate "P" parking stops along the red route */}
              {showStops &&
                trajectory &&
                trajectory.stops.map(stop => (
                  <Marker
                    key={stop.id}
                    position={[stop.latitude, stop.longitude]}
                    icon={parkingStopMarkerIcon(stop)}
                  >
                    <Popup>
                      <div className="p-1 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-blue-600">
                          <span className="rounded bg-blue-600 text-white px-1 text-[10px]">P</span>
                          <span>{stop.name}</span>
                        </div>
                        <p className="text-slate-700">Durée d'arrêt : <strong>{stop.durationFormatted}</strong></p>
                        <p className="text-slate-500">Arrivée : {stop.arrivedAt} · Départ : {stop.departedAt}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Vehicles Live / Animated Markers */}
              {vehiclesWithLocation.map(vehicle => {
                const isSelected = selectedDeviceId === vehicle.provider_device_id;
                // If playback is active on this vehicle, position marker at playback scrubber position
                const isThisPlayback = isSelected && currentPlaybackPoint;
                const displayVehicle = isThisPlayback
                  ? {
                      ...vehicle,
                      latitude: currentPlaybackPoint.latitude,
                      longitude: currentPlaybackPoint.longitude,
                      speed: currentPlaybackPoint.speed,
                    }
                  : vehicle;

                return (
                  <AnimatedGpsMarker
                    key={vehicle.provider_device_id}
                    vehicle={displayVehicle}
                    isSelected={isSelected}
                    onSelect={() => focusVehicle(vehicle.provider_device_id)}
                  />
                );
              })}
            </MapContainer>

            {vehiclesWithLocation.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6 text-center">
                <p className="rounded-xl bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-xl dark:bg-slate-900/95 dark:text-slate-300">
                  Aucune coordonnée valide n’a été reçue pour les voitures GPS.
                </p>
              </div>
            )}

            {/* Top-Right HUD Card / Pill (ALLO GPS inspired: LED digital display + speed gauge + distance) */}
            {selectedVehicle && hudCollapsed && (
              <aside
                aria-label="Informations véhicule sélectionné"
                className="absolute right-3 top-3 z-[500] flex max-w-[90vw] items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/95 px-3.5 py-2 shadow-2xl backdrop-blur-md text-white transition-all"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    markerKind(selectedVehicle) === 'moving' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                  }`}
                />
                <span className="truncate text-xs font-black max-w-[120px] sm:max-w-[170px]">
                  {selectedVehicle.vehicle_name}
                </span>
                {trajectory && (
                  <>
                    <span className="hidden sm:inline text-slate-500">·</span>
                    <span className="hidden sm:inline font-mono text-xs font-bold text-cyan-400">
                      ⏱ {currentPlaybackPoint ? currentPlaybackPoint.timeFormatted : trajectory.durationFormatted}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ⚡ {currentPlaybackPoint ? currentPlaybackPoint.speed : (selectedVehicle.speed ?? 0)} km/h
                    </span>
                    <span className="hidden md:inline font-bold text-rose-400">
                      {trajectory.totalDistanceKm} km
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setHudCollapsed(false)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-cyan-400 transition"
                  title="Afficher les détails"
                >
                  Détails ▾
                </button>
                {!isFullscreen && (
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 p-1 text-emerald-400 hover:text-emerald-300 transition"
                    title="Agrandir la carte en plein écran"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTrajectoryDeviceId(null)}
                  className="rounded-lg bg-slate-800 hover:bg-rose-900/60 p-1 text-slate-400 hover:text-rose-300 transition"
                  title="Masquer le trajet"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </aside>
            )}

            {selectedVehicle && !hudCollapsed && (
              <aside
                aria-label="Informations véhicule sélectionné"
                className="absolute right-3 top-3 z-[500] w-72 sm:w-80 max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md text-white transition-all"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{selectedVehicle.vehicle_name}</p>
                    <p className="truncate text-xs font-semibold text-emerald-400">
                      {selectedVehicle.plate ? `Matricule ${selectedVehicle.plate}` : selectedVehicle.provider_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        markerKind(selectedVehicle) === 'moving'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {markerKind(selectedVehicle) === 'moving' ? 'En mouvement' : 'À l’arrêt'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHudCollapsed(true)}
                      className="rounded-lg bg-slate-800/90 hover:bg-slate-700 p-1 text-slate-300 hover:text-white transition"
                      title="Réduire pour voir toute la carte"
                    >
                      <Minimize2 className="h-3.5 w-3.5" />
                    </button>
                    {!isFullscreen && (
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="rounded-lg bg-slate-800/90 hover:bg-slate-700 p-1 text-emerald-400 hover:text-emerald-300 transition"
                        title="Agrandir la carte en plein écran"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTrajectoryDeviceId(null)}
                      className="rounded-lg bg-slate-800/90 hover:bg-rose-900/60 p-1 text-slate-400 hover:text-rose-300 transition"
                      title="Masquer le trajet et fermer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {trajectory ? (
                  <>
                    {/* Glowing LED display: Duration & Speed like in AlloGPS */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          Durée du jour
                        </p>
                        <p className="mt-0.5 font-mono text-base font-black tracking-wider text-cyan-400">
                          {currentPlaybackPoint ? currentPlaybackPoint.timeFormatted : trajectory.durationFormatted}
                        </p>
                        <p className="text-[9px] text-slate-500">Heure trajet</p>
                      </div>

                      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                          <Zap className="h-3 w-3 text-emerald-400" />
                          Vitesse
                        </p>
                        <p className="mt-0.5 font-mono text-base font-black tracking-wider text-emerald-400">
                          {currentPlaybackPoint ? currentPlaybackPoint.speed : (selectedVehicle.speed ?? 0)}{' '}
                          <span className="text-xs font-normal text-slate-400">km/h</span>
                        </p>
                        <p className="text-[9px] text-slate-500">Vitesse API</p>
                      </div>
                    </div>

                    {/* Distance & Kilométrage stats */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Distance Aujourd'hui</p>
                        <p className="text-sm font-black text-rose-400">{trajectory.totalDistanceKm} km</p>
                        <p className="text-[9px] text-slate-500">Trajet rouge</p>
                      </div>

                      <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Kilométrage</p>
                        <p className="text-sm font-bold text-white">{formatNumber(selectedVehicle.odometer)}</p>
                        <p className="text-[9px] text-slate-500">Valeur API</p>
                      </div>
                    </div>

                    {/* Additional metrics */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Carburant API : {formatNumber(selectedVehicle.fuel)}</span>
                      <span>Statut API : {selectedVehicle.status ?? '1'}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Arrêts parking : {trajectory.stops.length} (P)</span>
                      <span>Vitesse max : {trajectory.maxSpeedKmH} km/h</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <p className="text-[10px] text-slate-400">
                        Dernière mise à jour : {formatDate(selectedVehicle.reported_at)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTrajectoryDeviceId(null)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Masquer trajet ✕
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Telemetry card before trajectory click */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-slate-900/80 border border-slate-800 p-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Kilométrage</p>
                        <p className="text-sm font-bold text-white">{formatNumber(selectedVehicle.odometer)}</p>
                        <p className="text-[10px] text-slate-500">Valeur API</p>
                      </div>
                      <div className="rounded-md bg-slate-900/80 border border-slate-800 p-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Vitesse</p>
                        <p className="text-sm font-bold text-white">{formatNumber(selectedVehicle.speed)}</p>
                        <p className="text-[10px] text-slate-500">Valeur API</p>
                      </div>
                      <div className="rounded-md bg-slate-900/80 border border-slate-800 p-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Carburant API</p>
                        <p className="text-sm font-bold text-white">{formatNumber(selectedVehicle.fuel)}</p>
                      </div>
                      <div className="rounded-md bg-slate-900/80 border border-slate-800 p-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Statut API</p>
                        <p className="text-sm font-bold text-white">{selectedVehicle.status ?? 'N/D'}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTrajectoryDeviceId(selectedVehicle.provider_device_id)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-black text-white shadow-md shadow-red-600/30 transition hover:brightness-110"
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-white animate-ping" />
                      <span>Afficher le trajet rouge du jour (Allogps)</span>
                    </button>

                    <p className="mt-2 text-[10px] text-slate-400">
                      État : {markerKind(selectedVehicle) === 'moving' ? 'En mouvement' : markerKind(selectedVehicle) === 'stopped' ? 'À l’arrêt' : markerKind(selectedVehicle) === 'unlinked' ? 'GPS non associé' : 'Données anciennes'}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Dernière mise à jour : {formatDate(selectedVehicle.reported_at)}
                    </p>
                  </>
                )}
              </aside>
            )}

            {/* Bottom Playback & Trajectory Scrubber (like AlloGPS bottom player) */}
            {selectedVehicle && trajectory && (
              <div className="absolute bottom-3 left-1/2 z-[500] w-[95%] max-w-2xl -translate-x-1/2 rounded-2xl border border-slate-700/80 bg-slate-950/92 p-3 shadow-2xl backdrop-blur-md text-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlaybackIndex(0)}
                      title="Revenir au départ"
                      className="rounded-lg bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaybackActive(v => !v)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/30 transition hover:brightness-110"
                    >
                      {playbackActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                      <span>{playbackActive ? 'Pause' : 'Rejouer trajet'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPlaybackSpeedMultiplier(m => (m === 1 ? 10 : m === 10 ? 300 : 1))
                      }
                      title="Vitesse de lecture"
                      className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-extrabold text-cyan-400 transition hover:bg-slate-700"
                    >
                      {playbackSpeedMultiplier === 300 ? 'Slow x 300' : `${playbackSpeedMultiplier}x`}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowStops(v => !v)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        showStops ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                      title="Afficher/Masquer les arrêts P"
                    >
                      <span>🅿️ Arrêts ({trajectory.stops.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTripModal(true)}
                      className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                      title="Détails du trajet"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Timeline scrubber slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {trajectory.startPoint.timeFormatted}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={trajectory.points.length - 1}
                    value={playbackIndex}
                    onChange={e => {
                      setPlaybackActive(false);
                      setPlaybackIndex(Number(e.target.value));
                    }}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {trajectory.endPoint.timeFormatted}
                  </span>
                </div>
              </div>
            )}

            {/* Trip Details Modal */}
            {showTripModal && trajectory && (
              <div className="absolute inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-black">Rapport de trajet d'aujourd'hui</h3>
                    <button
                      onClick={() => setShowTripModal(false)}
                      className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-800/80 p-3">
                        <p className="text-slate-400">Distance parcourue</p>
                        <p className="text-lg font-black text-rose-400">{trajectory.totalDistanceKm} km</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/80 p-3">
                        <p className="text-slate-400">Durée totale</p>
                        <p className="text-lg font-black text-cyan-400">{formatDurationHuman(trajectory.totalDurationMinutes)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/80 p-3">
                        <p className="text-slate-400">Vitesse maximale</p>
                        <p className="text-base font-bold text-white">{trajectory.maxSpeedKmH} km/h</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/80 p-3">
                        <p className="text-slate-400">Vitesse moyenne</p>
                        <p className="text-base font-bold text-white">{trajectory.avgSpeedKmH} km/h</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <h4 className="font-bold text-slate-200 mb-2">Arrêts enregistrés (🅿️) :</h4>
                      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                        {trajectory.stops.map((stop, i) => (
                          <div key={stop.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-2">
                            <div>
                              <p className="font-bold text-slate-200">{stop.name}</p>
                              <p className="text-[10px] text-slate-400">{stop.arrivedAt} → {stop.departedAt}</p>
                            </div>
                            <span className="rounded bg-blue-600/30 px-2 py-1 font-mono font-bold text-blue-300">
                              {stop.durationFormatted}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTripModal(false)}
                    className="mt-4 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GPSManagement;