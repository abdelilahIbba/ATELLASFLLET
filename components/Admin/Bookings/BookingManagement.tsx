import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Plus, 
  Edit, 
  FileSignature,
  DollarSign 
} from 'lucide-react';
import { Booking } from '../types';

interface BookingManagementProps {
  bookings: Booking[];
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

  const totalRevenue = useMemo(() => bookings.reduce((acc, curr) => acc + curr.amount, 0), [bookings]);
  const activeRentals = useMemo(() => bookings.filter(b => b.status === 'Active').length, [bookings]);
  const pendingRequests = useMemo(() => bookings.filter(b => b.status === 'Pending').length, [bookings]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(bookingSearch.toLowerCase()) || b.clientName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesFilter = bookingFilter === 'All' ? true : b.status === bookingFilter;
      return matchesSearch && matchesFilter;
  }), [bookings, bookingSearch, bookingFilter]);

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-brand-blue uppercase">Total Revenue</p>
                    <p className="text-2xl font-bold text-brand-navy dark:text-white">{totalRevenue.toLocaleString()} MAD</p>
                </div>
                <DollarSign className="w-8 h-8 text-brand-blue" />
            </div>
            <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Active Rentals</p>
                    <p className="text-2xl font-bold text-brand-navy dark:text-white">{activeRentals}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-brand-navy dark:text-white">{pendingRequests}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue" />
                <input 
                    type="text" 
                    placeholder="Search ID, Client..." 
                    className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                />
                </div>
                <div className="flex gap-2">
                {['All', 'Active', 'Pending', 'Completed'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setBookingFilter(status)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                            bookingFilter === status 
                                ? 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy' 
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        {status}
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
                        <Trash2 className="w-4 h-4" /> Delete ({selectedBookingIds.length})
                    </button>
                )}
                <button 
                onClick={() => openModal('booking_form', null)}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Add Reservation
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase">
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
                        <th className="p-4">Vehicle</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                    {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                        <tr key={booking.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedBookingIds.includes(booking.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
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
                            <td className="p-4 font-mono text-slate-500 text-xs">{booking.id}</td>
                            <td className="p-4 font-bold text-brand-navy dark:text-white">{booking.clientName}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">{booking.vehicleName}</td>
                            <td className="p-4 text-slate-500 text-xs">
                                {booking.startDate} <span className="text-slate-300 mx-1">→</span> {booking.endDate}
                            </td>
                            <td className="p-4 font-bold text-brand-navy dark:text-white">{booking.amount.toLocaleString()} MAD</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    booking.status === 'Active' ? 'bg-green-100 text-green-600' :
                                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenContract(booking)} className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors" title="View Contract">
                                    <FileSignature className="w-4 h-4" />
                                </button>
                                <button onClick={() => openModal('booking_form', booking)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="Edit">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleBookingDelete(booking.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    )) : (
                    <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 italic">No bookings found matching your criteria.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default BookingManagement;
