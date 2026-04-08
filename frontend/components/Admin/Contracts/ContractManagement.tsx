import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSignature, Plus, Search, Eye, Edit, Trash2, Download,
  CheckCircle2, Clock, AlertCircle, XCircle,
  RefreshCw, X, Receipt, Printer, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import { adminContractsApi, adminBookingsApi } from '../../../services/api';
import ContractModal, { loadCompanySettings } from './ContractModal';
import type { Booking } from '../types';
// ─── Map a Contract to the Booking shape expected by ContractModal ───────────────────

const contractStatusToBookingStatus = (s: string): Booking['status'] => {
  if (s === 'active')    return 'Active';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  return 'Confirmed';  // draft
};

const contractToBooking = (c: Contract): Booking => ({
  id:            c.booking_id,
  clientName:    c.client_name,
  vehicleName:   c.vehicle_name,
  startDate:     c.start_date,
  endDate:       c.end_date,
  status:        contractStatusToBookingStatus(c.status),
  amount:        c.total_amount,
  paymentStatus: 'Paid',  // ContractModal only shows this for reference
  unitNumber:    c.unit_number,
  unitPlate:     c.vehicle_plate || undefined,
});
// ─── Types ───────────────────────────────────────────────────────────────────

export interface Contract {
  id: string;
  contract_number: string;
  booking_id: string;
  user_id: string;
  car_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  client_id_number?: string;
  client_license_number?: string;
  client_license_expiry?: string;
  client_address?: string;
  client_nationality?: string;
  vehicle_name: string;
  vehicle_plate: string;
  unit_number?: number;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  currency: string;
  insurance_type?: string;
  mileage_start?: number;
  mileage_end?: number;
  fuel_level_start?: string;
  fuel_level_end?: string;
  condition_start?: any;
  condition_end?: any;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  signature_client_start?: string;
  signature_agent_start?: string;
  signature_client_end?: string;
  signature_agent_end?: string;
  signature_city?: string;
  signed_at?: string;
  extra_charges?: { label: string; amount: number }[];
  notes?: string;
  conditions_text?: string;
  invoices?: any[];
  booking?: any;
  created_at: string;
}

type ContractStatus = Contract['status'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<ContractStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',   icon: Clock },
  active:    { label: 'En cours',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: CheckCircle2 },
  completed: { label: 'Terminé',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       icon: XCircle },
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtAmount = (n: number) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(n) + ' MAD';

export const contractFromApi = (c: Record<string, any>): Contract => ({
  id:                    String(c.id),
  contract_number:       c.contract_number ?? '',
  booking_id:            String(c.booking_id),
  user_id:               String(c.user_id),
  car_id:                String(c.car_id),
  client_name:           c.client_name ?? '',
  client_phone:          c.client_phone ?? undefined,
  client_email:          c.client_email ?? undefined,
  client_id_number:      c.client_id_number ?? undefined,
  client_license_number: c.client_license_number ?? undefined,
  client_license_expiry: c.client_license_expiry?.slice(0, 10) ?? undefined,
  client_address:        c.client_address ?? undefined,
  client_nationality:    c.client_nationality ?? undefined,
  vehicle_name:          c.vehicle_name ?? '',
  vehicle_plate:         c.vehicle_plate ?? '',
  unit_number:           c.unit_number ?? undefined,
  start_date:            c.start_date?.slice(0, 10) ?? '',
  end_date:              c.end_date?.slice(0, 10) ?? '',
  daily_rate:            parseFloat(c.daily_rate) || 0,
  total_amount:          parseFloat(c.total_amount) || 0,
  deposit_amount:        parseFloat(c.deposit_amount) || 0,
  currency:              c.currency ?? 'MAD',
  insurance_type:        c.insurance_type ?? undefined,
  mileage_start:         c.mileage_start ?? undefined,
  mileage_end:           c.mileage_end ?? undefined,
  fuel_level_start:      c.fuel_level_start ?? undefined,
  fuel_level_end:        c.fuel_level_end ?? undefined,
  condition_start:       c.condition_start ?? undefined,
  condition_end:         c.condition_end ?? undefined,
  status:                (c.status ?? 'draft') as ContractStatus,
  signature_client_start: c.signature_client_start ?? undefined,
  signature_agent_start:  c.signature_agent_start ?? undefined,
  signature_client_end:   c.signature_client_end ?? undefined,
  signature_agent_end:    c.signature_agent_end ?? undefined,
  signature_city:        c.signature_city ?? undefined,
  signed_at:             c.signed_at ?? undefined,
  extra_charges:         Array.isArray(c.extra_charges) ? c.extra_charges : undefined,
  notes:                 c.notes ?? undefined,
  conditions_text:       c.conditions_text ?? undefined,
  invoices:              c.invoices ?? [],
  booking:               c.booking ?? undefined,
  created_at:            c.created_at ?? '',
});

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ─── Contract Form Modal ──────────────────────────────────────────────────────

interface ContractFormProps {
  contract?: Contract | null;
  rawBookings: any[];
  onSave: (contract: Contract) => void;
  onClose: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({ contract, rawBookings, onSave, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>(contract?.booking_id ?? '');
  const [extraCharges, setExtraCharges] = useState<{ label: string; amount: number }[]>(
    contract?.extra_charges ?? []
  );

  const booking = rawBookings.find(b => String(b.id) === selectedBooking);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const g = (k: string) => fd.get(k)?.toString() ?? '';

    const payload: Record<string, unknown> = {
      booking_id:            selectedBooking,
      client_name:           g('client_name'),
      client_phone:          g('client_phone') || undefined,
      client_email:          g('client_email') || undefined,
      client_id_number:      g('client_id_number') || undefined,
      client_license_number: g('client_license_number') || undefined,
      vehicle_name:          g('vehicle_name'),
      vehicle_plate:         g('vehicle_plate'),
      start_date:            g('start_date'),
      end_date:              g('end_date'),
      daily_rate:            parseFloat(g('daily_rate')) || 0,
      total_amount:          parseFloat(g('total_amount')) || 0,
      deposit_amount:        parseFloat(g('deposit_amount')) || 0,
      insurance_type:        g('insurance_type') || undefined,
      mileage_start:         parseInt(g('mileage_start')) || undefined,
      fuel_level_start:      g('fuel_level_start') || undefined,
      status:                g('status') || 'draft',
      extra_charges:         extraCharges.filter(c => c.label.trim()),
      notes:                 g('notes') || undefined,
    };

    setSaving(true);
    try {
      let res: any;
      if (contract) {
        res = await adminContractsApi.update(contract.id, payload);
      } else {
        res = await adminContractsApi.create(payload);
      }
      onSave(contractFromApi(res.contract));
      onClose();
    } catch (err: any) {
      const msg = err?.errors
        ? Object.values(err.errors as Record<string, string[]>).flat().join('\n')
        : err?.message ?? 'Erreur';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1';
  const inputClass = 'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5 flex-shrink-0">
          <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-brand-blue" />
            {contract ? `Modifier — ${contract.contract_number}` : 'Nouveau Contrat'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-grow">
          <div className="p-6 space-y-6">
            {/* Booking selector */}
            {!contract && (
              <div>
                <label className={labelClass}>Réservation liée *</label>
                <select
                  value={selectedBooking}
                  onChange={e => setSelectedBooking(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">— Choisir une réservation —</option>
                  {rawBookings.map(b => (
                    <option key={b.id} value={String(b.id)}>
                      #{b.id} — {b.user?.name ?? 'Client'} — {b.car?.full_name ?? b.car?.name ?? 'Véhicule'} ({b.start_date?.slice(0, 10) ?? '?'} → {b.end_date?.slice(0, 10) ?? '?'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Client info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du client *</label>
                <input name="client_name" className={inputClass} required
                  defaultValue={contract?.client_name ?? booking?.user?.name ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input name="client_phone" className={inputClass}
                  defaultValue={contract?.client_phone ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="client_email" type="email" className={inputClass}
                  defaultValue={contract?.client_email ?? ''} />
              </div>
              <div>
                <label className={labelClass}>N° CIN</label>
                <input name="client_id_number" className={inputClass}
                  defaultValue={contract?.client_id_number ?? ''} />
              </div>
              <div>
                <label className={labelClass}>N° Permis</label>
                <input name="client_license_number" className={inputClass}
                  defaultValue={contract?.client_license_number ?? ''} />
              </div>
            </div>

            {/* Vehicle & period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Véhicule *</label>
                <input name="vehicle_name" className={inputClass} required
                  defaultValue={contract?.vehicle_name ?? (booking ? (booking.car?.full_name ?? booking.car?.name ?? '') : '')} />
              </div>
              <div>
                <label className={labelClass}>Immatriculation *</label>
                <input name="vehicle_plate" className={inputClass} required
                  defaultValue={contract?.vehicle_plate ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Date début *</label>
                <input name="start_date" type="date" className={inputClass} required
                  defaultValue={contract?.start_date ?? booking?.start_date?.slice(0, 10) ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Date fin *</label>
                <input name="end_date" type="date" className={inputClass} required
                  defaultValue={contract?.end_date ?? booking?.end_date?.slice(0, 10) ?? ''} />
              </div>
            </div>

            {/* Financial */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Tarif / jour (MAD)</label>
                <input name="daily_rate" type="number" step="0.01" min="0" className={inputClass}
                  defaultValue={contract?.daily_rate ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Total (MAD)</label>
                <input name="total_amount" type="number" step="0.01" min="0" className={inputClass}
                  defaultValue={contract?.total_amount ?? booking?.amount ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Caution (MAD)</label>
                <input name="deposit_amount" type="number" step="0.01" min="0" className={inputClass}
                  defaultValue={contract?.deposit_amount ?? ''} />
              </div>
            </div>

            {/* Vehicle state */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Kilométrage départ</label>
                <input name="mileage_start" type="number" min="0" className={inputClass}
                  defaultValue={contract?.mileage_start ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Niveau carburant</label>
                <input name="fuel_level_start" className={inputClass} placeholder="ex: 3/4"
                  defaultValue={contract?.fuel_level_start ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Assurance</label>
                <input name="insurance_type" className={inputClass}
                  defaultValue={contract?.insurance_type ?? ''} />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" className={inputClass}
                  defaultValue={contract?.status ?? 'draft'}>
                  <option value="draft">Brouillon</option>
                  <option value="active">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            {/* Extra charges */}
            <div>
              <label className={labelClass}>Frais supplémentaires</label>
              <div className="space-y-2">
                {extraCharges.map((ch, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={`${inputClass} flex-grow`} placeholder="Description"
                      value={ch.label}
                      onChange={e => {
                        const next = [...extraCharges];
                        next[i] = { ...next[i], label: e.target.value };
                        setExtraCharges(next);
                      }} />
                    <input className={`${inputClass} w-32`} type="number" step="0.01" placeholder="Montant"
                      value={ch.amount}
                      onChange={e => {
                        const next = [...extraCharges];
                        next[i] = { ...next[i], amount: parseFloat(e.target.value) || 0 };
                        setExtraCharges(next);
                      }} />
                    <button type="button" onClick={() => setExtraCharges(extraCharges.filter((_, j) => j !== i))}
                      className="p-1.5 text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setExtraCharges([...extraCharges, { label: '', amount: 0 }])}
                  className="text-xs font-bold text-brand-blue hover:text-brand-navy dark:hover:text-white flex items-center gap-1 mt-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un frais
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <textarea name="notes" rows={2} className={inputClass}
                defaultValue={contract?.notes ?? ''} placeholder="Observations, remarques..." />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {contract ? 'Mettre à jour' : 'Créer le contrat'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Contract Detail Modal ────────────────────────────────────────────────────

export const ContractDetail: React.FC<{
  contract: Contract;
  onClose: () => void;
  onEdit: () => void;
  onGenerateInvoice: () => void;
}> = ({ contract, onClose, onEdit, onGenerateInvoice }) => {
  const fetchPdfBlob = async (): Promise<string | null> => {
    const token = localStorage.getItem('auth_token');
    const base  = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const url   = `${base}/admin/contracts/${contract.id}/pdf`;
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('PDF fetch failed', err);
      return null;
    }
  };

  const handleDownloadPdf = async () => {
    const objUrl = await fetchPdfBlob();
    if (!objUrl) return;
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `contrat-${contract.contract_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
  };

  const handleOpenPdf = async () => {
    const objUrl = await fetchPdfBlob();
    if (!objUrl) return;
    window.open(objUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
  };

  const days = Math.max(1, Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / 86400000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Contrat</p>
            <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space">{contract.contract_number}</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={contract.status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-grow p-6 space-y-5">
          {/* Client */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Client</p>
            <p className="font-bold text-brand-navy dark:text-white">{contract.client_name}</p>
            {contract.client_phone && <p className="text-sm text-slate-500 dark:text-slate-400">{contract.client_phone}</p>}
            {contract.client_email && <p className="text-sm text-slate-500 dark:text-slate-400">{contract.client_email}</p>}
            {contract.client_nationality && <p className="text-sm text-slate-500 dark:text-slate-400">Nationalité : {contract.client_nationality}</p>}
            {contract.client_address && <p className="text-sm text-slate-500 dark:text-slate-400">{contract.client_address}</p>}
            {contract.client_id_number && (
              <p className="text-xs mt-2 font-mono bg-slate-100 dark:bg-white/10 rounded px-2 py-1 inline-block">
                CIN : <span className="font-bold">{contract.client_id_number}</span>
              </p>
            )}
            {contract.client_license_number && (
              <p className="text-xs mt-1 font-mono bg-slate-100 dark:bg-white/10 rounded px-2 py-1 inline-block">
                Permis : <span className="font-bold">{contract.client_license_number}</span>
                {contract.client_license_expiry && <span className="text-slate-400 ml-1">(exp. {fmtDate(contract.client_license_expiry)})</span>}
              </p>
            )}
          </div>

          {/* Vehicle */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Véhicule</p>
            <p className="font-bold text-brand-navy dark:text-white">{contract.vehicle_name}</p>
            <p className="text-sm text-slate-500">{contract.vehicle_plate}{contract.unit_number ? ` · Unité #${contract.unit_number}` : ''}</p>
          </div>

          {/* Period & Finance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Période</p>
              <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">
                {fmtDate(contract.start_date)} → {fmtDate(contract.end_date)}
              </p>
              <p className="text-xs text-slate-400">{days} jour{days > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-brand-blue/10 rounded-xl p-3">
              <p className="text-[10px] font-bold text-brand-blue uppercase">Montant total</p>
              <p className="text-lg font-black text-brand-blue mt-1">{fmtAmount(contract.total_amount)}</p>
              {contract.deposit_amount > 0 && (
                <p className="text-xs text-slate-400">Caution : {fmtAmount(contract.deposit_amount)}</p>
              )}
            </div>
          </div>

          {/* Vehicle state */}
          {(contract.mileage_start || contract.fuel_level_start) && (
            <div className="grid grid-cols-2 gap-3">
              {contract.mileage_start !== undefined && (
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Kilométrage</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">
                    {contract.mileage_start} km {contract.mileage_end ? `→ ${contract.mileage_end} km` : ''}
                  </p>
                </div>
              )}
              {contract.fuel_level_start && (
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Carburant</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">
                    {contract.fuel_level_start} {contract.fuel_level_end ? `→ ${contract.fuel_level_end}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Invoices linked */}
          {contract.invoices && contract.invoices.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Factures associées</p>
              {contract.invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-2 mb-1">
                  <span className="font-mono text-xs font-bold text-brand-teal">{inv.invoice_number}</span>
                  <span className="text-xs font-bold text-brand-navy dark:text-white">{fmtAmount(parseFloat(inv.total))}</span>
                  <span className={`text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex gap-2 flex-wrap flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <button onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy dark:bg-white/10 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            title="Télécharger le PDF">
            <Download className="w-4 h-4" /> Télécharger
          </button>
          <button onClick={handleOpenPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 dark:bg-white/10 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            title="Ouvrir et imprimer">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button onClick={onGenerateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Receipt className="w-4 h-4" /> Générer Facture
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Edit className="w-4 h-4" /> Modifier
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── ContractManagement ────────────────────────────────────────────────────────

interface ContractManagementProps {
  onNavigateInvoices?: () => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ onNavigateInvoices }) => {
  const [contracts, setContracts]   = useState<Contract[]>([]);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm]     = useState(false);
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [generatingFromBooking, setGeneratingFromBooking] = useState<string | null>(null);
  const [activatingContract, setActivatingContract] = useState<string | null>(null);
  const [pendingOpen, setPendingOpen] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminContractsApi.list({ per_page: 200 }),
      adminBookingsApi.list({ per_page: 200 }),
    ]).then(([cRes, bRes]: any[]) => {
      setContracts((cRes.data ?? []).map((c: any) => contractFromApi(c)));
      setRawBookings(bRes.data ?? []);
    }).catch(err => console.error('[Contracts] Failed to load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce contrat ?')) return;
    try {
      await adminContractsApi.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleActivateContract = async (id: string) => {
    setActivatingContract(id);
    try {
      const res: any = await adminContractsApi.update(id, { status: 'active' });
      const updated = contractFromApi(res.contract);
      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la validation.');
    } finally {
      setActivatingContract(null);
    }
  };

  const handleCreateFromBooking = async (bookingId: string) => {
    setGeneratingFromBooking(bookingId);
    try {
      await adminContractsApi.createFromBooking(bookingId);
      load();
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la création du contrat.');
    } finally {
      setGeneratingFromBooking(null);
    }
  };

  const handleGenerateInvoice = async (contract: Contract) => {
    setGeneratingInvoice(contract.id);
    try {
      await adminContractsApi.generateInvoice(contract.id);
      load(); // Reload to show updated invoices
      if (onNavigateInvoices) onNavigateInvoices();
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la génération.');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const filtered = useMemo(() => contracts.filter(c => {
    const matchSearch =
      c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_name.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [contracts, search, statusFilter]);

  // Bookings that don't have a contract yet
  const bookingsWithoutContract = useMemo(() => {
    const contractedIds = new Set(contracts.map(c => c.booking_id));
    return rawBookings.filter(b => !contractedIds.has(String(b.id)));
  }, [rawBookings, contracts]);

  // Stats
  const total     = contracts.length;
  const active    = contracts.filter(c => c.status === 'active').length;
  const completed = contracts.filter(c => c.status === 'completed').length;
  const draft     = contracts.filter(c => c.status === 'draft').length;

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Contrats', value: total, color: 'bg-brand-blue/10', textColor: 'text-brand-blue' },
          { label: 'En cours',       value: active, color: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-400' },
          { label: 'Terminés',       value: completed, color: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-400' },
          { label: 'Brouillons',     value: draft, color: 'bg-slate-100 dark:bg-white/5', textColor: 'text-slate-600 dark:text-slate-400' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4`}>
            <p className={`text-xs font-bold ${stat.textColor} uppercase tracking-wide`}>{stat.label}</p>
            <p className={`text-xl font-black ${stat.textColor} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending: Reservations without a contract (collapsible) */}
      {bookingsWithoutContract.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/30 overflow-hidden">
          {/* Header — always visible */}
          <button
            onClick={() => setPendingOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {bookingsWithoutContract.length}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Réservations sans contrat
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-500">· Cliquez pour générer automatiquement</span>
            </div>
            {pendingOpen
              ? <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              : <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            }
          </button>

          {/* Compact card grid — shown when open */}
          {pendingOpen && (
            <div className="bg-amber-50/50 dark:bg-amber-900/5 p-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bookingsWithoutContract.map(b => (
                <div key={b.id}
                  className="flex items-center justify-between bg-white dark:bg-white/[0.03] border border-amber-100 dark:border-amber-800/20 rounded-xl px-3 py-2 gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-navy dark:text-white truncate">
                      {b.user?.name ?? 'Client inconnu'}
                      <span className="ml-1.5 text-[10px] font-normal text-slate-400">#R{b.id}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {b.car?.full_name ?? b.car?.name ?? 'Véhicule'}
                      {b.start_date ? ` · ${b.start_date.slice(0, 10)}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateFromBooking(String(b.id))}
                    disabled={generatingFromBooking === String(b.id)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generatingFromBooking === String(b.id)
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : <Plus className="w-3 h-3" />
                    }
                    Créer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent focus:border-brand-blue/50 focus:outline-none text-sm text-brand-navy dark:text-white placeholder-slate-400"
            placeholder="Rechercher par N° contrat, client, véhicule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-blue/50 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="active">En cours</option>
          <option value="completed">Terminés</option>
          <option value="cancelled">Annulés</option>
        </select>
        <button onClick={load} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-blue transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setEditContract(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouveau Contrat
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
            <p className="text-sm">Chargement des contrats...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <FileSignature className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">Aucun contrat trouvé</p>
            <p className="text-xs mt-1">Créez un contrat depuis une réservation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  {['N° Contrat', 'Client', 'Véhicule', 'Période', 'Montant', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-brand-blue">{c.contract_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-brand-navy dark:text-white">{c.client_name}</p>
                      {c.client_phone && <p className="text-xs text-slate-400">{c.client_phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-brand-navy dark:text-white">{c.vehicle_name}</p>
                      <p className="text-xs text-slate-400">{c.vehicle_plate}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm text-brand-navy dark:text-white">{fmtAmount(c.total_amount)}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewContract(c)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="Détails">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditContract(c); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="Modifier">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {c.status === 'draft' && (
                          <button
                            onClick={() => handleActivateContract(c.id)}
                            disabled={activatingContract === c.id}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-30"
                            title="Valider le contrat">
                            {activatingContract === c.id
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                        <button onClick={() => handleGenerateInvoice(c)}
                          disabled={generatingInvoice === c.id}
                          className="p-1.5 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors disabled:opacity-30"
                          title="Générer facture">
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ContractForm
            contract={editContract}
            rawBookings={rawBookings}
            onSave={saved => {
              setContracts(prev => {
                const idx = prev.findIndex(c => c.id === saved.id);
                return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
              });
            }}
            onClose={() => { setShowForm(false); setEditContract(null); }}
          />
        )}
      </AnimatePresence>

      {/* Full Contract Wizard Modal (eye icon) */}
      {viewContract && (
        <ContractModal
          booking={contractToBooking(viewContract)}
          onClose={() => setViewContract(null)}
          company={loadCompanySettings()}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default ContractManagement;
