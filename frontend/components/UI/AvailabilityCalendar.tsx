import React from 'react';

const MONTH_NAMES_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const WEEK_DAYS_FR   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

export interface AvailabilityCalendarProps {
  totalUnits: number;
  bookedPeriods: { start: string; end: string }[];
  /** Selected / highlighted range start (YYYY-MM-DD) */
  pickupDate: string;
  /** Selected / highlighted range end (YYYY-MM-DD) */
  returnDate: string;
  /** How many future months to render (default 3) */
  months?: number;
}

type DayStatus = 'past' | 'full' | 'partial' | 'selected' | 'selected-full' | 'available';

const cellCls: Record<DayStatus, string> = {
  past:           'text-slate-300 dark:text-slate-700',
  available:      'text-brand-navy dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full cursor-default',
  partial:        'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full font-semibold',
  full:           'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full font-bold',
  selected:       'bg-brand-blue text-white rounded-full font-bold shadow-sm',
  'selected-full':'bg-red-500 text-white rounded-full font-bold shadow-sm',
};

const pad = (n: number) => String(n).padStart(2, '0');

const getMonthDays = (year: number, month: number): (number | null)[] => {
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = (firstDay + 6) % 7; // Mon = 0
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
};

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  totalUnits,
  bookedPeriods,
  pickupDate,
  returnDate,
  months: numMonths = 3,
}) => {
  const today = new Date(); today.setHours(0,0,0,0);

  const monthList = Array.from({ length: numMonths }, (_, offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const countOverlap = (dateStr: string) =>
    bookedPeriods.filter(p => p.start <= dateStr && p.end >= dateStr).length;

  const getDayStatus = (year: number, month: number, day: number): DayStatus => {
    const date = new Date(year, month, day); date.setHours(0,0,0,0);
    if (date < today) return 'past';
    const ds = `${year}-${pad(month + 1)}-${pad(day)}`;
    const count = countOverlap(ds);
    const full  = count >= totalUnits;
    if (pickupDate && returnDate && ds >= pickupDate && ds <= returnDate) {
      return full ? 'selected-full' : 'selected';
    }
    if (full) return 'full';
    if (count > 0) return 'partial';
    return 'available';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-500 uppercase">Calendrier de disponibilité</p>
        <div className="flex items-center gap-2.5">
          {(pickupDate && returnDate) && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-brand-blue inline-block"/>Sélectionné
            </span>
          )}
          {totalUnits > 1 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Partiel
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Réservé
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {monthList.map(({ year, month }) => (
          <div key={`${year}-${month}`}>
            <p className="text-[11px] font-bold text-brand-navy dark:text-white mb-1">
              {MONTH_NAMES_FR[month]} {year}
            </p>
            <div className="grid grid-cols-7 mb-0.5">
              {WEEK_DAYS_FR.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {getMonthDays(year, month).map((day, idx) => (
                <div
                  key={idx}
                  className={`h-6 flex items-center justify-center text-[11px] transition-colors ${
                    day === null ? '' : cellCls[getDayStatus(year, month, day)]
                  }`}
                >
                  {day !== null && day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
