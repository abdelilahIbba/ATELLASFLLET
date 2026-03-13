import React from 'react';
import { FileSignature, Edit, Trash2 } from 'lucide-react';
import { Booking } from '../../types';

interface BookingTableProps {
  bookings: Booking[];
  selectedBookingIds: string[];
  setSelectedBookingIds: (ids: string[]) => void;
  toggleBookingSelection: (id: string) => void;
  handleOpenContract: (booking: Booking) => void;
  openModal: (type: string, item: any) => void;
  handleDelete: (id: string) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  selectedBookingIds,
  setSelectedBookingIds,
  toggleBookingSelection,
  handleOpenContract,
  openModal,
  handleDelete
}) => {
  const allSelected = bookings.length > 0 && selectedBookingIds.length === bookings.length;

  return (
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
                                    setSelectedBookingIds(bookings.map(b => b.id));
                                } else {
                                    setSelectedBookingIds([]);
                                }
                            }}
                            checked={allSelected}
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
                {bookings.length > 0 ? bookings.map((booking) => (
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
                                {{
                                    'Active': 'Actif',
                                    'Pending': 'En Attente',
                                    'Cancelled': 'Annulé',
                                    'Completed': 'Terminé'
                                }[booking.status] || booking.status}
                            </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenContract(booking)} className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors" title="Voir Contrat">
                                <FileSignature className="w-4 h-4" />
                            </button>
                            <button onClick={() => openModal('booking_form', booking)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="Modifier">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(booking.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                )) : (
                <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 italic">Aucune réservation trouvée correspondant à vos critères.</td>
                </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};

export default BookingTable;
