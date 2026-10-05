import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  className?: string;
}

const FR_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const FR_WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const toDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (s: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDisplayDate = (s: string): string => {
  const d = parseDateString(s);
  if (!d) return '';
  return `${d.getDate()} ${FR_MONTHS[d.getMonth()].slice(0, 4)}. ${d.getFullYear()}`;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = 'Sélectionner une période',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month currently displayed in calendar view
  const [viewDate, setViewDate] = useState<Date>(() => {
    return parseDateString(startDate) || new Date();
  });

  // Temporary selection state when picking 2 clicks
  const [pickingStart, setPickingStart] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Update viewDate when startDate changes externally
  useEffect(() => {
    if (startDate) {
      const d = parseDateString(startDate);
      if (d) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [startDate]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setPickingStart(null);
        setHoverDate(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Days in the current calendar month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as index 0 (getDay() gives 0 for Sunday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        dateStr: toDateString(d),
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        dateStr: toDateString(d),
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        dateStr: toDateString(d),
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const handleDateClick = (dateStr: string) => {
    if (!pickingStart) {
      // First click: select start
      setPickingStart(dateStr);
    } else {
      // Second click: select end
      if (dateStr < pickingStart) {
        onChange(dateStr, pickingStart);
      } else {
        onChange(pickingStart, dateStr);
      }
      setPickingStart(null);
      setHoverDate(null);
      setIsOpen(false);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange('', '');
    setPickingStart(null);
    setHoverDate(null);
  };

  // Presets
  const applyPreset = (type: 'today' | 'this_week' | 'this_month' | 'next_30') => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (type === 'today') {
      // start and end are today
    } else if (type === 'this_week') {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diffToMonday));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (type === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === 'next_30') {
      end = new Date(now);
      end.setDate(now.getDate() + 30);
    }

    const sStr = toDateString(start);
    const eStr = toDateString(end);
    onChange(sStr, eStr);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
    setPickingStart(null);
    setHoverDate(null);
    setIsOpen(false);
  };

  // Effective start and end for styling
  const effectiveStart = pickingStart || startDate;
  const effectiveEnd = pickingStart ? (hoverDate || pickingStart) : endDate;
  const isRangeSelected = Boolean(startDate && endDate);

  // Calculate day count if selected
  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = parseDateString(startDate);
    const e = parseDateString(endDate);
    if (!s || !e) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diff, 1);
  }, [startDate, endDate]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 shadow-sm ${
          isRangeSelected
            ? 'bg-brand-blue/5 border-brand-blue/30 text-brand-navy dark:text-white dark:bg-brand-blue/15'
            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
        }`}
      >
        <CalendarIcon className={`w-4 h-4 shrink-0 ${isRangeSelected ? 'text-brand-blue' : 'text-slate-400'}`} />
        
        {isRangeSelected ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-navy dark:text-white">
              {formatDisplayDate(startDate)}
            </span>
            <span className="text-slate-300 dark:text-white/30 font-bold select-none">→</span>
            <span className="font-semibold text-brand-navy dark:text-white">
              {formatDisplayDate(endDate)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/25 text-brand-blue font-bold text-[10px]">
              {daysCount}j
            </span>
          </div>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
        )}

        {isRangeSelected && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-white/15 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ml-1"
            title="Effacer le filtre"
          >
            <X className="w-3.5 h-3.5" />
          </div>
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 w-72 md:w-80 select-none animate-in fade-in-0 zoom-in-95 duration-150">
          
          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-1.5 mb-3.5 pb-3 border-b border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => applyPreset('today')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors text-left"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => applyPreset('this_week')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors text-left"
            >
              Cette semaine
            </button>
            <button
              type="button"
              onClick={() => applyPreset('this_month')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors text-left"
            >
              Ce mois-ci
            </button>
            <button
              type="button"
              onClick={() => applyPreset('next_30')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors text-left"
            >
              Prochains 30 jours
            </button>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-brand-navy dark:text-white uppercase tracking-wider">
              {FR_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {FR_WEEKDAYS.map((wd, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map(({ dateStr, dayNum, isCurrentMonth }) => {
              const isStart = effectiveStart === dateStr;
              const isEnd = effectiveEnd === dateStr;
              
              // Normalize range for middle days
              let inRange = false;
              if (effectiveStart && effectiveEnd) {
                const s = effectiveStart < effectiveEnd ? effectiveStart : effectiveEnd;
                const e = effectiveStart < effectiveEnd ? effectiveEnd : effectiveStart;
                inRange = dateStr >= s && dateStr <= e;
              }

              const isEdge = isStart || isEnd;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => pickingStart && setHoverDate(dateStr)}
                  className={`h-8 w-full text-xs font-medium rounded-lg transition-all duration-150 relative flex items-center justify-center ${
                    !isCurrentMonth 
                      ? 'text-slate-300 dark:text-slate-600 opacity-40' 
                      : 'text-slate-700 dark:text-slate-200'
                  } ${
                    isEdge
                      ? 'bg-brand-blue text-white font-bold shadow-md z-10'
                      : inRange
                      ? 'bg-brand-blue/15 text-brand-blue dark:bg-brand-blue/25 dark:text-blue-300 rounded-none'
                      : 'hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer note & Clear button */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              {pickingStart ? 'Cliquez sur la date de fin' : 'Cliquez pour sélectionner'}
            </span>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
