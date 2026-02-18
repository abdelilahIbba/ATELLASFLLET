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
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue" />
            <input 
                type="text" 
                placeholder="Rechercher ID, Client..." 
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
            />
            </div>
            <div className="flex gap-2">
            {[
                { val: 'All', label: 'Tous' },
                { val: 'Active', label: 'Actif' },
                { val: 'Pending', label: 'En Attente' },
                { val: 'Completed', label: 'Terminé' }
            ].map(({ val, label }) => (
                <button 
                    key={val}
                    onClick={() => setBookingFilter(val)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                        bookingFilter === val 
                            ? 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                    {label}
                </button>
            ))}
            </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
            {selectedBookingIds.length > 0 && (
                <button 
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-red-200 transition-colors"
                >
                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedBookingIds.length})
                </button>
            )}
            <button 
            onClick={onAddBooking}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
            >
                <Plus className="w-4 h-4" /> Ajouter Réservation
            </button>
        </div>
    </div>
  );
};

export default BookingToolbar;
