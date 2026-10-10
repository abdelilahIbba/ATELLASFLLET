import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Fuel,
  Gauge,
  MapPin,
  Maximize2,
  Navigation,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminGpsApi, type AdminGpsVehicle } from '../../../services/api';
import {
  buildVehicleReport,
  type VehicleReportData,
  type TripSegment,
  type DailyReportStat,
} from './trajectoryService';
import { AGENCY_CONFIG } from './reverseGeocodingService';

interface VehicleReportsViewProps {
  vehicles: AdminGpsVehicle[];
  initialDeviceId?: string | null;
  initialVehicleId?: string | null;
  onBackToMap?: () => void;
  onFocusVehicleOnMap?: (deviceId: string) => void;
  onSelectVehicleOnMap?: (deviceId: string) => void;
}

const formatNumber = (value: number | null): string =>
  value === null ? 'N/D' : new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 1 }).format(value);

/** Formats Moroccan matricules cleanly (e.g. 40-D-27399 -> 27399 | د | 40) */
export const formatMoroccanPlate = (plate: string | null | undefined): string => {
  if (!plate) return 'Matricule N/D';
  const clean = plate.trim();
  // Pattern matching: Region - Letter - Number (e.g. 40-D-27399 or 40-A-12345)
  const parts = clean.match(/^(\d{1,2})-([A-Za-z\u0600-\u06FF])-(\d{1,6})$/);
  if (parts) {
    const region = parts[1];
    let letter = parts[2].toUpperCase();
    // Convert common Latin letters to Arabic Moroccan plate letters
    const ARABIC_LETTERS: Record<string, string> = {
      A: 'أ',
      B: 'ب',
      D: 'د',
      H: 'هـ',
      J: 'ج',
      W: 'و',
    };
    letter = ARABIC_LETTERS[letter] || letter;
    const serial = parts[3];
    return `${serial} | ${letter} | ${region}`;
  }
  return clean;
};

export const VehicleReportsView: React.FC<VehicleReportsViewProps> = ({
  vehicles,
  initialDeviceId,
  initialVehicleId,
  onBackToMap,
  onFocusVehicleOnMap,
  onSelectVehicleOnMap,
}) => {
  const targetInitialId = initialVehicleId || initialDeviceId;
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => {
    if (targetInitialId && vehicles.some(v => v.provider_device_id === targetInitialId)) {
      return targetInitialId;
    }
    return vehicles[0]?.provider_device_id || '';
  });

  const [backendReport, setBackendReport] = useState<VehicleReportData | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);
  const [backendSyncedAt, setBackendSyncedAt] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'custom'>('day');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [segmentFilter, setSegmentFilter] = useState<'all' | 'trip' | 'stop' | 'speeding'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected vehicle object
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.provider_device_id === selectedDeviceId) || vehicles[0] || null;
  }, [vehicles, selectedDeviceId]);

  // Fallback client-side report calculation
  const fallbackReport: VehicleReportData | null = useMemo(() => {
    if (!selectedVehicle) return null;
    return buildVehicleReport(selectedVehicle, period, customStart, customEnd);
  }, [selectedVehicle, period, customStart, customEnd]);

  // Fetch live telemetry report from the backend API (AlloGPS live integration)
  useEffect(() => {
    if (!selectedDeviceId) return;

    let isCurrent = true;
    setIsLoadingBackend(true);

    adminGpsApi
      .report(selectedDeviceId, period, customStart, customEnd)
      .then((res: any) => {
        if (!isCurrent) return;
        if (res && typeof res === 'object' && res.totalDistanceKm !== undefined) {
          setBackendReport(res as VehicleReportData);
          setBackendSyncedAt(res.syncedAt ? new Date(res.syncedAt).toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR'));
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn('Backend report endpoint fallback to local trajectory simulation:', err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingBackend(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedDeviceId, period, customStart, customEnd, refreshCounter]);

  // Combined report: prefer backend API report, smoothly fall back to local calculation
  const report: VehicleReportData | null = backendReport || fallbackReport;

  const handleFocusOnMap = useCallback(() => {
    if (selectedVehicle) {
      if (onSelectVehicleOnMap) {
        onSelectVehicleOnMap(selectedVehicle.provider_device_id);
      } else if (onFocusVehicleOnMap) {
        onFocusVehicleOnMap(selectedVehicle.provider_device_id);
      } else if (onBackToMap) {
        onBackToMap();
      }
    }
  }, [selectedVehicle, onSelectVehicleOnMap, onFocusVehicleOnMap, onBackToMap]);

  // Filtered segments in table
  const filteredSegments = useMemo(() => {
    if (!report) return [];
    return report.segments.filter(seg => {
      if (segmentFilter === 'trip' && seg.type !== 'trip') return false;
      if (segmentFilter === 'stop' && seg.type !== 'stop') return false;
      if (segmentFilter === 'speeding' && seg.maxSpeed < 80) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchLoc =
          seg.startAddress.toLowerCase().includes(query) ||
          seg.endAddress.toLowerCase().includes(query);
        return matchLoc;
      }
      return true;
    });
  }, [report, segmentFilter, searchQuery]);

  // Export report to CSV
  const handleExportCSV = () => {
    if (!report || !selectedVehicle) return;
    const headers = [
      'Date',
      'Type',
      'Heure Debut',
      'Heure Fin',
      'Duree (min)',
      'Distance (km)',
      'Vitesse Max (km/h)',
      'Vitesse Moy (km/h)',
      'Lieu Depart',
      'Lieu Arrivee',
    ];
    const rows = report.segments.map(s => [
      s.date,
      s.type === 'trip' ? 'Trajet' : 'Arret',
      s.startTime,
      s.endTime,
      s.durationMinutes,
      s.distanceKm,
      s.maxSpeed,
      s.avgSpeed,
      `"${s.startAddress.replace(/"/g, '""')}"`,
      `"${s.endAddress.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_gps_${selectedVehicle.plate || selectedVehicle.provider_device_id}_${report.startDate}.csv`;
    link.click();
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  if (!selectedVehicle || !report) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center text-slate-500">
        <Car className="h-10 w-10 text-slate-400 mb-2" />
        <p className="font-semibold text-slate-700 dark:text-slate-200">Aucun véhicule sélectionné</p>
      </div>
    );
  }

  const speedExceeded = report.maxSpeedKmH > 80;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 pb-20">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la carte</span>
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Rapports & Télémétrie Flotte</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AlloGPS Live
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyse complète des trajets, vitesses de pointe, arrêts et distances parcourues
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Backend & API connectés {backendSyncedAt ? `(${backendSyncedAt})` : ''}</span>
                <button
                  type="button"
                  onClick={() => setRefreshCounter(c => c + 1)}
                  disabled={isLoadingBackend}
                  title="Rafraîchir les données depuis AlloGPS"
                  className="p-0.5 hover:text-emerald-900 dark:hover:text-white transition"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingBackend ? 'animate-spin text-brand-blue' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFocusOnMap}
            title="Localiser ce véhicule sur la carte en direct"
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
          >
            <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Voir sur la carte</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Exporter CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-blue-500/20 transition hover:brightness-110"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer le rapport officiel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Vehicle Selector & Period Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Vehicle Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Véhicule :
            </label>
            <div className="relative min-w-[280px]">
              <select
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {vehicles.map(v => (
                  <option key={v.provider_device_id} value={v.provider_device_id}>
                    {v.vehicle_name} ({v.plate || v.provider_name})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Quick Badge info of selected car */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 dark:bg-slate-800/80">
              <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {formatMoroccanPlate(selectedVehicle.plate)}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  selectedVehicle.is_moving ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {selectedVehicle.is_moving ? 'En mouvement' : 'À l’arrêt'}
              </span>
            </div>
          </div>

          {/* Timeframe selector: Day / Week / Month / Custom */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              Période :
            </span>
            <button
              type="button"
              onClick={() => setPeriod('day')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                period === 'day'
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                period === 'week'
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Cette semaine (7j)
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                period === 'month'
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Ce mois (30j)
            </button>
            <button
              type="button"
              onClick={() => setPeriod('custom')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                period === 'custom'
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Personnalisée
            </button>
          </div>
        </div>

        {/* Custom date range inputs */}
        {period === 'custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Plage de dates :</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span className="text-xs text-slate-400">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">RLV RAHIMI CAR</h1>
            <p className="text-xs text-slate-600 font-semibold">{AGENCY_CONFIG.address}</p>
            <p className="text-xs text-slate-500">Tél : +212 539 00 00 00 · Email : contact@rahimicar.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold text-slate-900">RAPPORT OFFICIEL DE TÉLÉMÉTRIE GPS</h2>
            <p className="text-xs text-slate-600">Généré le : {new Date().toLocaleString('fr-MA')}</p>
            <p className="text-xs font-bold text-emerald-700">Période : {report.periodLabel}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-3 text-xs">
          <div>
            <span className="text-slate-500">Véhicule :</span> <strong>{selectedVehicle.vehicle_name}</strong>
          </div>
          <div>
            <span className="text-slate-500">Matricule :</span> <strong>{formatMoroccanPlate(selectedVehicle.plate)}</strong>
          </div>
          <div>
            <span className="text-slate-500">ID Tracker :</span> <strong>{selectedVehicle.provider_device_id}</strong>
          </div>
        </div>
      </div>

      {/* Key Metric KPI Cards (Highlights vitesse max, distance, temps mouvement, temps arret) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vitesse Maximale Atteinte */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition ${
            speedExceeded
              ? 'border-rose-400 bg-gradient-to-br from-rose-50/80 to-white dark:border-rose-900/60 dark:bg-gradient-to-br dark:from-rose-950/40 dark:to-slate-900'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vitesse Maximale
            </span>
            <div
              className={`rounded-xl p-2 ${
                speedExceeded
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Zap className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-black ${
                speedExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {report.maxSpeedKmH}
            </span>
            <span className="text-sm font-bold text-slate-500">km/h</span>
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p className="truncate font-semibold text-slate-700 dark:text-slate-300">
              📍 {report.maxSpeedLocation}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Pointe relevée : {report.maxSpeedTime}</p>
          </div>
        </div>

        {/* Distance Totale Parcourue */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Distance Totale
            </span>
            <div className="rounded-xl bg-blue-500/20 p-2 text-blue-600 dark:text-blue-400">
              <Compass className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(report.totalDistanceKm)}
            </span>
            <span className="text-sm font-bold text-slate-500">km</span>
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex items-center justify-between">
            <span>Compteur actuel :</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">
              {formatNumber(selectedVehicle.odometer)} km
            </strong>
          </div>
        </div>

        {/* Temps de Déplacement (Conduite) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Temps de Déplacement
            </span>
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {report.movingDurationFormatted}
            </span>
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex items-center justify-between">
            <span>Vitesse moyenne :</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">{report.avgSpeedKmH} km/h</strong>
          </div>
        </div>

        {/* Temps d'Arrêt Total (Stationnement) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Temps d'Arrêt (Parking)
            </span>
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {report.stoppedDurationFormatted}
            </span>
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex items-center justify-between">
            <span>Nombre d'arrêts :</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold">
              🅿️ {report.stopsCount} arrêts
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:hidden">
        {/* Speed timeline chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="h-4 w-4 text-brand-blue" />
                <span>Profil de Vitesse au Fil de la Journée</span>
              </h3>
              <p className="text-xs text-slate-400">Variation de vitesse et détection des pointes d'accélération</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Vitesse Max : {report.maxSpeedKmH} km/h
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.speedTimeline}>
                <defs>
                  <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" km/h" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white shadow-xl">
                          <p className="font-mono text-slate-400">Heure : {data.time}</p>
                          <p className="mt-1 font-bold text-blue-400">Vitesse : {data.speed} km/h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Limite 80 km/h', fill: '#f43f5e', fontSize: 10 }} />
                <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#speedGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driving vs Stopped Pie Breakdown & Daily km */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Répartition du Temps</span>
            </h3>
            <p className="text-xs text-slate-400">Conduite active vs Stationnement</p>

            <div className="mt-4 flex items-center justify-center h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'En déplacement', value: report.movingDurationMinutes, color: '#10b981' },
                      { name: 'À l’arrêt (Parking)', value: report.stoppedDurationMinutes, color: '#3b82f6' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Math.round(Number(val) / 60)}h ${Number(val) % 60}m`, 'Durée']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-emerald-50 p-2 text-center dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Conduite</span>
                <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-300">
                  {report.movingDurationFormatted}
                </span>
              </div>
              <div className="rounded-xl bg-blue-50 p-2 text-center dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40">
                <span className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">Stationné</span>
                <span className="font-mono text-sm font-black text-blue-700 dark:text-blue-300">
                  {report.stoppedDurationFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Trajets : <strong>{report.tripsCount}</strong></span>
            <span>Arrêts (P) : <strong>{report.stopsCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Multi-day breakdown if week or month */}
      {period !== 'day' && report.dailyBreakdown.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">
            Distance Parcourue par Jour (km)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" km" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyReportStat;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white shadow-xl">
                          <p className="font-bold text-slate-200">{data.date}</p>
                          <p className="mt-1 text-emerald-400 font-bold">Distance : {data.distanceKm} km</p>
                          <p className="text-rose-400">Vitesse max : {data.maxSpeed} km/h</p>
                          <p className="text-slate-400">Trajets : {data.tripsCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="distanceKm" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chronological Detailed Log Table of Trips & Parking Stops */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-blue" />
              <span>Journal Chronologique des Déplacements et Arrêts</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historique détaillé de chaque trajet et de chaque stationnement parking
            </p>
          </div>

          {/* Quick Segment Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={() => setSegmentFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                segmentFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Tous ({report.segments.length})
            </button>
            <button
              type="button"
              onClick={() => setSegmentFilter('trip')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                segmentFilter === 'trip'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              🚗 Trajets uniquement
            </button>
            <button
              type="button"
              onClick={() => setSegmentFilter('stop')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                segmentFilter === 'stop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
              }`}
            >
              🅿️ Arrêts uniquement
            </button>
            <button
              type="button"
              onClick={() => setSegmentFilter('speeding')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                segmentFilter === 'speeding'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              ⚡ Vitesse &gt; 80 km/h
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Heure</th>
                <th className="py-3 px-4">Durée</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Vitesse Max</th>
                <th className="py-3 px-4">Itinéraire / Adresse</th>
                <th className="py-3 px-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSegments.map(seg => {
                const isTrip = seg.type === 'trip';
                const isSpeeding = seg.maxSpeed >= 80;

                return (
                  <tr
                    key={seg.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isTrip ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          🚗 Trajet
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                          🅿️ Arrêt Parking
                        </span>
                      )}
                    </td>

                    {/* Time Window */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                      {seg.startTime} → {seg.endTime}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">
                      {seg.durationFormatted}
                    </td>

                    {/* Distance */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {isTrip ? `${seg.distanceKm} km` : '—'}
                    </td>

                    {/* Speed */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isTrip ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold ${
                              isSpeeding ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {seg.maxSpeed} km/h
                          </span>
                          {isSpeeding && (
                            <span className="rounded bg-rose-100 px-1 text-[9px] font-black text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                              Excès
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">0 km/h</span>
                      )}
                    </td>

                    {/* Location / Route */}
                    <td className="py-3 px-4">
                      {isTrip ? (
                        <div className="space-y-0.5 max-w-md">
                          <p className="text-slate-700 dark:text-slate-200 truncate">
                            <span className="font-bold text-slate-400">De :</span> {seg.startAddress}
                          </p>
                          <p className="text-slate-700 dark:text-slate-200 truncate">
                            <span className="font-bold text-emerald-500">Vers :</span> {seg.endAddress}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-md">{seg.startAddress}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions: Google Maps */}
                    <td className="py-3 px-4 text-right whitespace-nowrap print:hidden">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${seg.endLat},${seg.endLon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        title="Ouvrir l'adresse dans Google Maps"
                      >
                        <Navigation className="h-3 w-3 text-emerald-500" />
                        <span>Carte</span>
                      </a>
                    </td>
                  </tr>
                );
              })}

              {filteredSegments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun enregistrement ne correspond aux filtres actuels.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Signature Footer (Visible only when printing) */}
      <div className="hidden print:block mt-12 pt-6 border-t border-slate-300">
        <div className="grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold">Responsable Flotte & Télémétrie :</p>
            <p className="mt-8 border-t border-slate-400 pt-1 text-[10px]">Nom et Signature</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Cachet de l'Agence RLV RAHIMI CAR :</p>
            <div className="mt-8 h-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleReportsView;
