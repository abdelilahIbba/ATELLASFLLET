import React, { useMemo, useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Plus, 
  Edit, 
  FileSignature,
  DollarSign,
  LayoutList,
  CalendarDays,
  Calendar,
  X,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { Booking, Vehicle } from '../types';
import BookingPlanner from './BookingPlanner';
import DateRangePicker from '../../UI/DateRangePicker';

interface BookingManagementProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  bookingSearch: string;
  setBookingSearch: (s: string) => void;
  bookingFilter: string;
  setBookingFilter: (s: string) => void;
  selectedBookingIds: string[];
  setSelectedBookingIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleBookingDelete: (id: string) => void;
  handleBulkDelete: () => void;
  openModal: (type: string, item: any) => void;
  handleOpenContract: (booking: Booking) => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ 
  bookings,
  vehicles,
  bookingSearch, 
  setBookingSearch, 
  bookingFilter, 
  setBookingFilter, 
  selectedBookingIds, 
  setSelectedBookingIds, 
  handleBookingDelete, 
  handleBulkDelete, 
  openModal, 
  handleOpenContract 
}) => {

  const [view, setView] = useState<'list' | 'planner'>('list');
  /** Period filter for list view — both optional */
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo,   setFilterTo]   = useState('');

  const totalRevenue = useMemo(() => bookings.reduce((acc, curr) => acc + curr.amount, 0), [bookings]);
  const activeRentals = useMemo(() => bookings.filter(b => b.status === 'Active').length, [bookings]);
  const pendingRequests = useMemo(() => bookings.filter(b => b.status === 'Pending').length, [bookings]);

  const statusCounts = useMemo(() => ({
    All: bookings.length,
    Active: bookings.filter(b => b.status === 'Active').length,
    Pending: bookings.filter(b => b.status === 'Pending').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
  }), [bookings]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                            b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.vehicleName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesFilter = bookingFilter === 'All' ? true : b.status === bookingFilter;
      // Period overlap: booking overlaps [filterFrom, filterTo] iff start ≤ filterTo AND end ≥ filterFrom
      const matchesPeriod = (!filterFrom || b.endDate >= filterFrom) && (!filterTo || b.startDate <= filterTo);
      return matchesSearch && matchesFilter && matchesPeriod;
  }), [bookings, bookingSearch, bookingFilter, filterFrom, filterTo]);

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const statusTabs = [
    { 
      id: 'All', 
      label: 'Tous', 
      count: statusCounts.All,
      activeClass: 'bg-brand-navy text-white dark:bg-white dark:text-brand-navy shadow-sm'
    },
    { 
      id: 'Active', 
      label: 'Actif', 
      count: statusCounts.Active,
      activeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-500/20'
    },
    { 
      id: 'Pending', 
      label: 'En Attente', 
      count: statusCounts.Pending,
      activeClass: 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-2 ring-amber-500/20'
    },
    { 
      id: 'Completed', 
      label: 'Terminé', 
      count: statusCounts.Completed,
      activeClass: 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
    },
  ];

  return (
    <div className="space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-brand-blue uppercase tracking-wider">Revenu Total</p>
                    <p className="text-2xl font-black text-brand-navy dark:text-white mt-1">{totalRevenue.toLocaleString('fr-MA')} <span className="text-sm font-semibold text-slate-400">MAD</span></p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <DollarSign className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Locations Actives</p>
                    <p className="text-2xl font-black text-brand-navy dark:text-white mt-1">{activeRentals}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">En Attente</p>
                    <p className="text-2xl font-black text-brand-navy dark:text-white mt-1">{pendingRequests}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock className="w-6 h-6" />
                </div>
            </div>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === 'list'
                  ? 'bg-white dark:bg-brand-navy shadow text-brand-blue'
                  : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-4 h-4" /> Liste
            </button>
            <button
              onClick={() => setView('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === 'planner'
                  ? 'bg-white dark:bg-brand-navy shadow text-brand-blue'
                  : 'text-slate-500 hover:text-brand-navy dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Planning Gantt
            </button>
          </div>
          <button
            onClick={() => openModal('booking_form', null)}
            className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md hover:shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" /> Nouvelle Réservation
          </button>
        </div>

        {/* ── PLANNER VIEW ── */}
        {view === 'planner' && (
          <BookingPlanner
            bookings={bookings}
            vehicles={vehicles}
            openModal={openModal}
            handleBookingDelete={handleBookingDelete}
            handleOpenContract={handleOpenContract}
          />
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (<>
        <div className="flex flex-col gap-4">
          
          {/* Controls Row: Search + Status Pills + Date Picker + Bulk Delete */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
            
            <div className="flex flex-wrap items-center gap-3 flex-1 w-full xl:w-auto">
              {/* Search */}
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  type="text" 
                  placeholder="Rechercher ID, Client, Véhicule..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl">
                {statusTabs.map(tab => {
                  const isActive = bookingFilter === tab.id;
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setBookingFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                        isActive 
                          ? tab.activeClass 
                          : 'text-slate-600 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive 
                          ? 'bg-black/20 text-white dark:bg-white/20' 
                          : 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Range Picker */}
              <div className="flex items-center gap-2">
                <DateRangePicker
                  startDate={filterFrom}
                  endDate={filterTo}
                  onChange={(s, e) => {
                    setFilterFrom(s);
                    setFilterTo(e);
                  }}
                  placeholder="Filtrer par dates..."
                />

                {(filterFrom || filterTo) && (
                  <span className="text-xs font-medium text-slate-400">
                    ({filteredBookings.length} trouvé{filteredBookings.length > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>

            {/* Bulk Action */}
            {selectedBookingIds.length > 0 && (
              <div className="flex items-center gap-2 self-end xl:self-center">
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm shadow-red-500/25"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer ({selectedBookingIds.length})
                </button>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                  <thead className="bg-slate-50/80 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                      <tr>
                          <th className="p-4 w-10">
                              <div className="flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedBookingIds(filteredBookings.map(b => b.id));
                                        } else {
                                            setSelectedBookingIds([]);
                                        }
                                    }}
                                    checked={selectedBookingIds.length === filteredBookings.length && filteredBookings.length > 0}
                                  />
                              </div>
                          </th>
                          <th className="p-4">ID</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Véhicule</th>
                          <th className="p-4">Dates</th>
                          <th className="p-4">Montant</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                      {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                          <tr key={booking.id} className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors ${selectedBookingIds.includes(booking.id) ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                              <td className="p-4">
                                  <div className="flex items-center justify-center">
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                                        checked={selectedBookingIds.includes(booking.id)}
                                        onChange={() => toggleBookingSelection(booking.id)}
                                      />
                                  </div>
                              </td>
                              <td className="p-4 font-mono text-slate-500 text-xs font-semibold">#{booking.id}</td>
                              <td className="p-4 font-bold text-brand-navy dark:text-white">{booking.clientName}</td>
                              <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{booking.vehicleName}</td>
                              <td className="p-4 text-slate-500 text-xs font-medium">
                                  {booking.startDate} <span className="text-slate-300 dark:text-white/20 mx-1">→</span> {booking.endDate}
                              </td>
                              <td className="p-4 font-bold text-brand-navy dark:text-white">{booking.amount.toLocaleString('fr-MA')} MAD</td>
                              <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                      booking.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30' :
                                      booking.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/30' :
                                      booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200/60 dark:border-red-500/30' :
                                      'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/30'
                                  }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        booking.status === 'Active' ? 'bg-emerald-500' :
                                        booking.status === 'Pending' ? 'bg-amber-500' :
                                        booking.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'
                                      }`} />
                                      {booking.status === 'Active' ? 'Actif' :
                                       booking.status === 'Pending' ? 'En Attente' :
                                       booking.status === 'Cancelled' ? 'Annulé' :
                                       booking.status === 'Completed' ? 'Terminé' : booking.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => handleOpenContract(booking)} className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-xl transition-colors" title="Voir Contrat">
                                      <FileSignature className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => openModal('booking_form', booking)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-colors" title="Modifier">
                                      <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleBookingDelete(booking.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Supprimer">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                          </tr>
                      )) : (
                      <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                            Aucune réservation trouvée correspondant à vos critères de recherche.
                          </td>
                      </tr>
                      )}
                  </tbody>
              </table>
          </div>
        </div>
        </>)}
    </div>
  );
};

export default BookingManagement;
