/**
 * BookingContractModal
 *
 * Opened from the Reservations page when an admin clicks "Voir Contrat".
 * - Looks up the existing backend contract for the booking.
 * - If none exists, auto-creates one via `createFromBooking`.
 * - Renders ContractDetail, with an inline Edit mode using ContractForm.
 * - No more frontend-only HTML contract creation.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { adminContractsApi, adminInvoicesApi } from '../../../services/api';
import {
  Contract,
  contractFromApi,
  ContractDetail,
  ContractForm,
} from './ContractManagement';

/** Minimal booking shape passed in from AdminDashboard / BookingManagement. */
export interface BookingRef {
  id: string;
  clientName: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  unitNumber?: number;
}

interface BookingContractModalProps {
  booking: BookingRef;
  onClose: () => void;
}

const BookingContractModal: React.FC<BookingContractModalProps> = ({ booking, onClose }) => {
  const [contract, setContract]   = useState<Contract | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [editing, setEditing]     = useState(false);
  const [rawBookings, setRawBookings] = useState<any[]>([]);

  // Load existing contract for this booking (or create one)
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all contracts and find the one linked to this booking
      const res = await adminContractsApi.list();
      const all: any[] = (res as any)?.data ?? [];
      const existing = all.find((c: any) => String(c.booking_id) === String(booking.id));

      if (existing) {
        setContract(contractFromApi(existing));
      } else {
        // Auto-create from booking
        const created = await adminContractsApi.createFromBooking(booking.id);
        const raw = (created as any)?.contract ?? created;
        setContract(contractFromApi(raw));
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du chargement du contrat');
    } finally {
      setLoading(false);
    }
  }, [booking.id]);

  useEffect(() => { load(); }, [load]);

  // Raw bookings list for the edit form (just the current booking is enough)
  useEffect(() => {
    // Provide the current booking in raw API shape so ContractForm can pre-select it
    setRawBookings([{
      id:          booking.id,
      start_date:  booking.startDate,
      end_date:    booking.endDate,
      user:        { name: booking.clientName },
      car:         { full_name: booking.vehicleName, name: booking.vehicleName },
      unit_number: (booking as any).unitNumber ?? null,
    }]);
  }, [booking]);

  const handleSaved = (updated: Contract) => {
    setContract(updated);
    setEditing(false);
  };

  const handleGenerateInvoice = async () => {
    if (!contract) return;
    try {
      await adminInvoicesApi.createFromContract(contract.id);
      // Reload contract to show linked invoice
      const res = await adminContractsApi.get(contract.id);
      const raw = (res as any)?.contract ?? res;
      setContract(contractFromApi(raw));
    } catch (e: any) {
      alert(e?.message ?? 'Erreur génération facture');
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
          <RefreshCw className="w-8 h-8 text-brand-blue animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Chargement du contrat…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !contract) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl max-w-sm text-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <p className="text-sm font-bold text-red-600">{error ?? 'Contrat introuvable'}</p>
          <div className="flex gap-3">
            <button onClick={load}
              className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90">
              Réessayer
            </button>
            <button onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:opacity-90">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <ContractForm
        contract={contract}
        rawBookings={rawBookings}
        onSave={handleSaved}
        onClose={() => setEditing(false)}
      />
    );
  }

  // ── Detail mode ───────────────────────────────────────────────────────────
  return (
    <ContractDetail
      contract={contract}
      onClose={onClose}
      onEdit={() => setEditing(true)}
      onGenerateInvoice={handleGenerateInvoice}
    />
  );
};

export default BookingContractModal;
