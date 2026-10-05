import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Search,
  AlertTriangle, Info, X, Edit, Trash2, FileSignature,
  Calendar, Car, User, Clock, Filter,
  CalendarDays,
} from 'lucide-react';
import { Booking, Vehicle } from '../types';
import DateRangePicker from '../../UI/DateRangePicker';

// ─── Types ──────────────────────────────────────────────────────────────────

type ZoomLevel = 'week' | '2weeks' | 'month';
type StatusFilter = 'All' | 'Active' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

interface UnitRow {
  vehicleId: string;
  vehicleName: string;
  unitIndex: number;  // 1-based
  quantity: number;
  plate: string;      // licence plate for this specific unit
  bookings: Booking[];
}

interface ConflictAlert {
  vehicleName: string;
  date: string;
  count: number;
  max: number;
}

interface BookingPlannerProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  openModal: (type: string, item: any) => void;
  handleBookingDelete: (id: string) => void;
  handleOpenContract: (booking: Booking) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
const parseDate = (s: string) => new Date(s + 'T00:00:00');
const diffDays = (a: string, b: string) =>
  Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);

const ZOOM_DAYS: Record<ZoomLevel, number> = { week: 7, '2weeks': 14, month: 30 };
const ZOOM_LABELS: Record<ZoomLevel, string> = { week: '7 jours', '2weeks': '2 semaines', month: '1 mois' };

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Active:    { bg: 'bg-emerald-500 text-white',  border: 'border-emerald-600/50 shadow-sm shadow-emerald-500/20',  text: 'text-white', dot: 'bg-emerald-400' },
  Confirmed: { bg: 'bg-blue-600 text-white',     border: 'border-blue-700/50 shadow-sm shadow-blue-500/20',        text: 'text-white', dot: 'bg-blue-400' },
  Pending:   { bg: 'bg-amber-400 text-slate-900', border: 'border-amber-500/50 shadow-sm shadow-amber-500/20',    text: 'text-slate-900 font-bold', dot: 'bg-amber-500' },
  Completed: { bg: 'bg-slate-400 text-white',    border: 'border-slate-500/50',                                    text: 'text-white', dot: 'bg-slate-400' },
  Cancelled: { bg: 'bg-red-400 text-white',      border: 'border-red-500/50',                                      text: 'text-white', dot: 'bg-red-400' },
};

const FR_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const FR_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// Column & Stub Widths (must be exact for alignment)
const COL_WIDTH  = 44;  // px
const STUB_WIDTH = 224; // px (w-56)
const ROW_HEIGHT = 56;  // px (h-14)

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState { booking: Booking; x: number; y: number }

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingPlanner: React.FC<BookingPlannerProps> = ({
  bookings, vehicles, openModal, handleBookingDelete, handleOpenContract,
}) => {
  // View state
  const [zoom, setZoom] = useState<ZoomLevel>('2weeks');
  const [periodStart, setPeriodStart] = useState<Date>(() => new Date());
  
  // Custom date-range filter
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const isCustom = Boolean(customFrom && customTo && customFrom <= customTo);
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [carFilter, setCarFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Days in current view
  const days = useMemo<string[]>(() => {
    if (isCustom) {
      const total = Math.min(diffDays(customFrom, customTo) + 1, 365);
      return Array.from({ length: total }, (_, i) => toDateStr(addDays(parseDate(customFrom), i)));
    }
    const total = ZOOM_DAYS[zoom];
    return Array.from({ length: total }, (_, i) => toDateStr(addDays(periodStart, i)));
  }, [isCustom, customFrom, customTo, periodStart, zoom]);

  const periodEnd = days[days.length - 1];
  const today = toDateStr(new Date());

  // Navigate by 1 day at a time
  const navigate = (dir: -1 | 1) => {
    if (isCustom) return;
    setPeriodStart(prev => addDays(prev, dir));
  };
  const goToday = () => {
    setCustomFrom('');
    setCustomTo('');
    setPeriodStart(new Date());
  };

  // Build vehicle → unit rows
  const unitRows = useMemo<UnitRow[]>(() => {
    return vehicles
      .filter(v => !carFilter || v.name.toLowerCase().includes(carFilter.toLowerCase()))
      .flatMap(v => {
        const qty = Math.max(1, v.quantity ?? 1);
        const vBookings = bookings.filter(b => {
          const nameMatch = (b.carId && b.carId !== 'undefined' && b.carId !== 'null'
            ? String(b.carId) === String(v.id)
            : b.vehicleName === v.name);
          const statusMatch = statusFilter === 'All' || b.status === statusFilter;
          const clientMatch = !clientFilter || b.clientName.toLowerCase().includes(clientFilter.toLowerCase());
          const visible = b.startDate <= periodEnd && b.endDate >= days[0];
          return nameMatch && statusMatch && clientMatch && visible;
        });

        return Array.from({ length: qty }, (_, i) => ({
          vehicleId: String(v.id),
          vehicleName: v.name,
          unitIndex: i + 1,
          quantity: qty,
          plate: v.unitPlates?.[i] ?? v.plate ?? '',
          bookings: vBookings.filter(b => (b.unitNumber ?? 1) === i + 1),
        }));
      });
  }, [vehicles, bookings, carFilter, statusFilter, clientFilter, periodEnd, days]);

  // Conflict detection
  const conflicts = useMemo<ConflictAlert[]>(() => {
    const alerts: ConflictAlert[] = [];
    vehicles.forEach(v => {
      const qty = Math.max(1, v.quantity ?? 1);
      days.forEach(day => {
        const active = bookings.filter(b => {
          const nameMatch = (b.carId && b.carId !== 'undefined' && b.carId !== 'null')
            ? String(b.carId) === String(v.id)
            : b.vehicleName === v.name;
          return nameMatch && b.startDate <= day && b.endDate >= day &&
            b.status !== 'Cancelled' && b.status !== 'Completed';
        });
        if (active.length > qty) {
          alerts.push({ vehicleName: v.name, date: day, count: active.length, max: qty });
        }
      });
    });
    const seen = new Set<string>();
    return alerts.filter(a => {
      if (seen.has(a.vehicleName)) return false;
      seen.add(a.vehicleName); return true;
    });
  }, [vehicles, bookings, days]);

  // Block position helpers
  const blockStyle = (b: Booking): React.CSSProperties => {
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const clampedStart = b.startDate < firstDay ? firstDay : b.startDate;
    const clampedEnd   = b.endDate > lastDay ? lastDay : b.endDate;
    const totalDays = days.length;
    const startOffset = diffDays(firstDay, clampedStart);
    const span = diffDays(clampedStart, clampedEnd) + 1;
    const left = (startOffset / totalDays) * 100;
    const width = Math.max(0.8, (span / totalDays) * 100);
    return { left: `${left}%`, width: `${width}%` };
  };

  // Export handlers
  const exportCSV = () => {
    const header = ['ID', 'Client', 'Véhicule', 'Début', 'Fin', 'Statut', 'Montant MAD', 'Paiement', 'Notes'];
    const rows = bookings.map(b => [
      b.id, b.clientName, b.vehicleName, b.startDate, b.endDate,
      b.status, b.amount, b.paymentStatus, b.notes ?? '',
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url;
    a.download = `reservations_${toDateStr(new Date())}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-4 print:space-y-2">

      {/* ── Top Toolbar ── */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">

        {/* Search / Filters */}
        <div className="flex flex-wrap gap-2.5 items-center w-full xl:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              value={carFilter}
              onChange={e => setCarFilter(e.target.value)}
              placeholder="Filtrer véhicule…"
              className="pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue w-36 sm:w-44"
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              placeholder="Filtrer client…"
              className="pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue w-36 sm:w-44"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-8 pr-6 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {(['All', 'Active', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as StatusFilter[]).map(s => (
                <option key={s} value={s}>{s === 'All' ? 'Tous statuts' : s}</option>
              ))}
            </select>
          </div>
          {conflicts.length > 0 && (
            <button
              onClick={() => setShowConflicts(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {conflicts.length} Conflit{conflicts.length > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Period nav + zoom + export */}
        <div className="flex flex-wrap gap-2.5 items-center w-full xl:w-auto justify-end">
          
          {/* Custom Date Range Picker */}
          <DateRangePicker
            startDate={customFrom}
            endDate={customTo}
            onChange={(s, e) => {
              setCustomFrom(s);
              setCustomTo(e);
            }}
            placeholder="Période personnalisée..."
          />

          {/* Period navigation — disabled in custom mode */}
          <div className={`flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 transition-opacity ${isCustom ? 'opacity-30 pointer-events-none' : ''}`}>
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors" title="Jour précédent">
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button onClick={goToday} className="px-3 py-1 text-xs font-bold text-brand-blue hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Aujourd'hui
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors" title="Jour suivant">
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Period label */}
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap px-1">
            {new Date(days[0]).getDate()} {FR_MONTHS[new Date(days[0]).getMonth()]}
            {' — '}
            {new Date(days[days.length - 1]).getDate()} {FR_MONTHS[new Date(days[days.length - 1]).getMonth()]} {new Date(days[days.length - 1]).getFullYear()}
          </span>

          {/* Zoom */}
          <div className={`flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-0.5 gap-0.5 transition-opacity ${isCustom ? 'opacity-30 pointer-events-none' : ''}`}>
            {(Object.keys(ZOOM_DAYS) as ZoomLevel[]).map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  zoom === z
                    ? 'bg-white dark:bg-brand-navy shadow text-brand-blue'
                    : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'
                }`}
              >
                {ZOOM_LABELS[z]}
              </button>
            ))}
          </div>

          {/* Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Exporter
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 w-44 animate-in fade-in-0 zoom-in-95 duration-100">
                <button onClick={() => { exportCSV(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-emerald-500" /> Excel / CSV
                </button>
                <button onClick={() => { exportPDF(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-red-500" /> PDF (Impression)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Conflict Alerts ── */}
      {showConflicts && conflicts.length > 0 && (
        <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 space-y-2 animate-in fade-in-0 duration-150">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Conflits de sur-réservation détectés
            </h4>
            <button onClick={() => setShowConflicts(false)} className="text-slate-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
              <span className="font-bold">{c.vehicleName}</span>
              <span>·</span>
              <span>{new Date(c.date).toLocaleDateString('fr-MA')}</span>
              <span>·</span>
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-lg font-mono font-bold">
                {c.count} réservations / {c.max} unité{c.max > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Gantt Grid ── */}
      <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-clip shadow-sm print:shadow-none">

        {/* Scroll Container */}
        <div
          ref={gridRef}
          className="overflow-auto max-h-[620px] custom-scrollbar"
        >
          {/* Minimum width guarantees alignment between headers and row tracks */}
          <div style={{ minWidth: `${STUB_WIDTH + days.length * COL_WIDTH}px` }}>

            {/* Header Row */}
            <div className="flex border-b border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-white/5 sticky top-0 z-[25]">
              {/* Left Stub */}
              <div 
                className="shrink-0 px-4 py-3 border-r border-slate-200/80 dark:border-white/10 sticky left-0 z-[30] bg-slate-50 dark:bg-[#0b1929] flex items-center justify-between"
                style={{ width: `${STUB_WIDTH}px` }}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-brand-blue" /> Véhicule / Unité
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  {unitRows.length} u.
                </span>
              </div>

              {/* Day Headers */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, ${COL_WIDTH}px)` }}>
                {days.map(day => {
                  const d = new Date(day + 'T00:00:00');
                  const isToday = day === today;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={day}
                      className={`py-2 text-center border-r border-slate-100 dark:border-white/5 last:border-r-0 transition-colors ${
                        isToday ? 'bg-brand-blue/10 dark:bg-brand-blue/20' : ''
                      }`}
                    >
                      <div className={`text-[9px] font-bold uppercase ${isToday ? 'text-brand-blue' : isWeekend ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {FR_DAYS[d.getDay()]}
                      </div>
                      <div className={`text-[12px] font-extrabold mt-0.5 ${isToday ? 'text-brand-blue' : isWeekend ? 'text-slate-400' : 'text-brand-navy dark:text-white'}`}>
                        {d.getDate()}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {FR_MONTHS[d.getMonth()]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Rows: STRICT PIXEL HEIGHT MATCHING FOR PERFECT ALIGNMENT */}
            <div>
              {unitRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Calendar className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">Aucun véhicule ou réservation correspondant à cette sélection</p>
                </div>
              ) : (
                unitRows.map((row) => {
                  const hasConflict = conflicts.some(c => c.vehicleName === row.vehicleName);
                  return (
                    <div 
                      key={`${row.vehicleId}-${row.unitIndex}`} 
                      className="flex border-b border-slate-100 dark:border-white/5 last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group"
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >

                      {/* Left Column Stub (Sticky, Exactly STUB_WIDTH and ROW_HEIGHT) */}
                      <div 
                        className="shrink-0 px-3.5 border-r border-slate-100 dark:border-white/5 flex flex-col justify-center sticky left-0 z-[15] bg-white dark:bg-[#0b1929] group-hover:bg-slate-50/60 dark:group-hover:bg-[#0e2034] transition-colors"
                        style={{ width: `${STUB_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {hasConflict && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          <span className="text-xs font-bold text-brand-navy dark:text-white truncate" title={row.vehicleName}>
                            {row.vehicleName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            #{row.unitIndex}
                          </span>
                          {row.plate ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold truncate">
                              {row.plate}
                            </span>
                          ) : null}
                          {row.quantity > 1 && (
                            <span className="text-[9px] text-slate-400 ml-auto font-mono">
                              ({row.unitIndex}/{row.quantity})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timeline Track (Exactly ROW_HEIGHT) */}
                      <div 
                        className="relative overflow-visible flex items-center" 
                        style={{ width: `${days.length * COL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                      >
                        {/* Day Grid Lines */}
                        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${days.length}, ${COL_WIDTH}px)` }}>
                          {days.map(day => {
                            const isToday = day === today;
                            const d = new Date(day + 'T00:00:00');
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                              <div
                                key={day}
                                className={`h-full border-r border-slate-100 dark:border-white/5 last:border-r-0 ${
                                  isToday ? 'bg-brand-blue/5' : isWeekend ? 'bg-slate-50/50 dark:bg-white/[0.01]' : ''
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Today Marker Line */}
                        {days.includes(today) && (() => {
                          const idx = days.indexOf(today);
                          const left = ((idx + 0.5) / days.length) * 100;
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-brand-blue z-10 pointer-events-none"
                              style={{ left: `${left}%` }}
                            />
                          );
                        })()}

                        {/* Rounded Reservation Bars with Inside Details */}
                        {row.bookings.map(b => {
                          const style = blockStyle(b);
                          if (parseFloat(style.width as string) <= 0) return null;
                          const colors = STATUS_COLORS[b.status] ?? STATUS_COLORS['Pending'];
                          const days2 = diffDays(
                            b.startDate < days[0] ? days[0] : b.startDate,
                            b.endDate > days[days.length - 1] ? days[days.length - 1] : b.endDate
                          ) + 1;
                          
                          return (
                            <div
                              key={b.id}
                              className={`absolute top-2 bottom-2 rounded-xl border cursor-pointer z-10
                                ${colors.bg} ${colors.border} ${colors.text}
                                shadow-sm hover:shadow-lg hover:scale-[1.01] hover:brightness-105 hover:z-20
                                transition-all duration-150 select-none flex items-center overflow-hidden`}
                              style={{ ...style, minWidth: '10px' }}
                              onMouseEnter={e => setTooltip({ booking: b, x: e.clientX, y: e.clientY })}
                              onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setTooltip(null)}
                              onClick={() => setSelectedBooking(b)}
                            >
                              <div className="w-full px-2.5 flex items-center justify-between gap-1 overflow-hidden">
                                <span className="text-[11px] font-bold truncate leading-tight tracking-tight">
                                  {b.clientName}
                                </span>
                                {days2 >= 3 && (
                                  <span className="text-[9px] font-mono opacity-85 whitespace-nowrap shrink-0">
                                    #{b.id}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statuts :</span>
          {Object.entries(STATUS_COLORS).map(([status, c]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {status === 'Active' ? 'Actif' :
                 status === 'Pending' ? 'En Attente' :
                 status === 'Confirmed' ? 'Confirmé' :
                 status === 'Completed' ? 'Terminé' :
                 status === 'Cancelled' ? 'Annulé' : status}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            <span className="text-xs font-medium text-slate-400">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* ── Polished Floating Tooltip ── */}
      {tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none bg-white/95 dark:bg-[#0d1b2a]/95 backdrop-blur-md border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ 
            left: Math.min(tooltip.x + 16, typeof window !== 'undefined' ? window.innerWidth - 300 : tooltip.x), 
            top: Math.min(tooltip.y - 20, typeof window !== 'undefined' ? window.innerHeight - 240 : tooltip.y) 
          }}
        >
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-white/10">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[tooltip.booking.status]?.bg ?? ''}`}>
              {tooltip.booking.status}
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">#{tooltip.booking.id}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-brand-navy dark:text-white font-bold text-sm">
              <User className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="truncate">{tooltip.booking.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <Car className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{tooltip.booking.vehicleName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tooltip.booking.startDate}</span>
              <span className="text-slate-300 dark:text-white/20">→</span>
              <span>{tooltip.booking.endDate}</span>
              <span className="ml-auto text-[10px] bg-brand-blue/10 text-brand-blue font-bold px-1.5 py-0.5 rounded">
                {diffDays(tooltip.booking.startDate, tooltip.booking.endDate) + 1}j
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Montant</span>
                <span className="text-sm font-black text-brand-navy dark:text-white">{tooltip.booking.amount.toLocaleString('fr-MA')} MAD</span>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase ${
                tooltip.booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                tooltip.booking.paymentStatus === 'Deposit Only' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              }`}>
                {tooltip.booking.paymentStatus === 'Paid' ? 'Payé' :
                 tooltip.booking.paymentStatus === 'Deposit Only' ? 'Acompte' : 'Impayé'}
              </span>
            </div>
            {tooltip.booking.notes && (
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-white/5 truncate">
                {tooltip.booking.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Drawer (click on block) ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-end pointer-events-none">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in-0 duration-200"
            onClick={() => setSelectedBooking(null)}
          />
          <div className="relative w-full sm:w-96 bg-white dark:bg-[#0d1b2a] border-l border-slate-200 dark:border-white/10 shadow-2xl pointer-events-auto h-full overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white dark:bg-[#0d1b2a] border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-brand-navy dark:text-white">Réservation #{selectedBooking.id}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[selectedBooking.status]?.bg ?? ''}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-xl text-slate-400 hover:text-brand-navy hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Client + Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-brand-blue" /> Client</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-white">{selectedBooking.clientName}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-brand-blue" /> Véhicule</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-white">{selectedBooking.vehicleName}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-blue" /> Période</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Début</p>
                    <p className="text-sm font-bold text-brand-navy dark:text-white">{new Date(selectedBooking.startDate).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Fin</p>
                    <p className="text-sm font-bold text-brand-navy dark:text-white">{new Date(selectedBooking.endDate).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="ml-auto bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-xl text-xs font-bold">
                    {diffDays(selectedBooking.startDate, selectedBooking.endDate) + 1} jour{diffDays(selectedBooking.startDate, selectedBooking.endDate) >= 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Amount + payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Montant</p>
                  <p className="text-lg font-black text-brand-navy dark:text-white">{selectedBooking.amount.toLocaleString('fr-MA')} <span className="text-xs font-normal text-slate-400">MAD</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paiement</p>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedBooking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                    selectedBooking.paymentStatus === 'Deposit Only' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{selectedBooking.paymentStatus}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Notes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => { openModal('booking_form', selectedBooking); setSelectedBooking(null); }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md"
                >
                  <Edit className="w-4 h-4" /> Modifier la Réservation
                </button>
                <button
                  onClick={() => { handleOpenContract(selectedBooking); setSelectedBooking(null); }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-teal/10 text-brand-teal rounded-xl text-sm font-bold hover:bg-brand-teal/20 transition-all border border-brand-teal/20"
                >
                  <FileSignature className="w-4 h-4" /> Voir Contrat
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Annuler/supprimer la réservation #${selectedBooking.id} ?`)) {
                      handleBookingDelete(selectedBooking.id);
                      setSelectedBooking(null);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-200/60 dark:border-red-900/30"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPlanner;
