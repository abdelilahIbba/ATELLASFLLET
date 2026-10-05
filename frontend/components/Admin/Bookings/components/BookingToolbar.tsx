import React from 'react';
import { Search, Trash2, Plus } from 'lucide-react';

interface BookingToolbarProps {
  bookingSearch: string;
  setBookingSearch: (s: string) => void;
  bookingFilter: string;
  setBookingFilter: (s: string) => void;
  selectedBookingIds: string[];
  handleBulkDelete: () => void;
  onAddBooking: () => void;
}

const BookingToolbar: React.FC<BookingToolbarProps> = ({
  bookingSearch,
  setBookingSearch,
  bookingFilter,
  setBookingFilter,
  selectedBookingIds,
  handleBulkDelete,
  onAddBooking
}) => {
  const tabs = [
    { val: 'All', label: 'Tous', activeClass: 'bg-brand-navy text-white dark:bg-white dark:text-brand-navy shadow-sm' },
    { val: 'Active', label: 'Actif', activeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-500/20' },
    { val: 'Pending', label: 'En Attente', activeClass: 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-2 ring-amber-500/20' },
    { val: 'Completed', label: 'Terminé', activeClass: 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20' }
  ];

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
              <input 
                  type="text" 
                  placeholder="Rechercher ID, Client..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl">
              {tabs.map(({ val, label, activeClass }) => {
                const isActive = bookingFilter === val;
                return (
                  <button 
                      key={val}
                      onClick={() => setBookingFilter(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                          isActive 
                              ? activeClass 
                              : 'text-slate-600 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      }`}
                  >
                      {label}
                  </button>
                );
              })}
            </div>
        </div>

        <div className="flex gap-2 w-full xl:w-auto justify-end">
            {selectedBookingIds.length > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm shadow-red-500/25"
                >
                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedBookingIds.length})
                </button>
            )}
            <button 
              onClick={onAddBooking}
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md hover:shadow-blue-500/25"
            >
                <Plus className="w-4 h-4" /> Ajouter Réservation
            </button>
        </div>
    </div>
  );
};

export default BookingToolbar;
