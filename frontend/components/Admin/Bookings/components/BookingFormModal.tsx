import React from 'react';
import { 
  X, 
  Save, 
  Zap, 
  Calendar, 
  Car, 
  User, 
  DollarSign, 
  Calculator, 
  MapPin, 
  AlertTriangle,
  FileText,
  Clock,
  CreditCard
} from 'lucide-react';
import { Booking, Vehicle, Client } from '../../types';
import type { PickupPoint } from '../../../../services/api';
import RichSelect from '../../../UI/RichSelect';
import AvailabilityCalendar from '../../../UI/AvailabilityCalendar';

interface BookingFormModalProps {
  selectedItem: Booking | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  quickFlow: { clientId: string; clientName: string } | null;
  clients: Client[];
  vehicles: Vehicle[];
  pickupPoints: PickupPoint[];
  // Form field bindings
  bfClientId: string;
  setBfClientId: (id: string) => void;
  bfCarId: string;
  setBfCarId: (id: string) => void;
  bfStart: string;
  setBfStart: (d: string) => void;
  bfEnd: string;
  setBfEnd: (d: string) => void;
  bfDailyRate: string;
  setBfDailyRate: (r: string) => void;
  bfAmount: string;
  setBfAmount: (a: string) => void;
  bfPickupId: number | '';
  setBfPickupId: (id: number | '') => void;
  bfDropoffId: number | '';
  setBfDropoffId: (id: number | '') => void;
  bfConflict: { message: string; suggestedStart: string; suggestedEnd: string } | null;
  setBfConflict: (c: { message: string; suggestedStart: string; suggestedEnd: string } | null) => void;
  bfBookedPeriods: { total_units: number; booked_periods: { start: string; end: string }[] } | null;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  selectedItem,
  onClose,
  onSubmit,
  isSaving,
  quickFlow,
  clients,
  vehicles,
  pickupPoints,
  bfClientId,
  setBfClientId,
  bfCarId,
  setBfCarId,
  bfStart,
  setBfStart,
  bfEnd,
  setBfEnd,
  bfDailyRate,
  setBfDailyRate,
  bfAmount,
  setBfAmount,
  bfPickupId,
  setBfPickupId,
  bfDropoffId,
  setBfDropoffId,
  bfConflict,
  setBfConflict,
  bfBookedPeriods,
}) => {
  // Client options for RichSelect
  const clientOptions = clients.map(c => ({
    value: String(c.id),
    label: c.name,
    sublabel: c.email || 'Pas de courriel enregistré',
    secondaryBadge: c.cin ? `CIN: ${c.cin}` : undefined,
  }));

  // Vehicle options for RichSelect
  const vehicleOptions = vehicles.map(v => ({
    value: String(v.id),
    label: v.name,
    secondaryBadge: v.plate || undefined,
    badge: v.pricePerDay ? `${v.pricePerDay.toLocaleString('fr-MA')} MAD/j` : undefined,
  }));

  // Calculation details
  const daysDiff = React.useMemo(() => {
    if (!bfStart || !bfEnd) return 0;
    const ms = new Date(bfEnd).getTime() - new Date(bfStart).getTime();
    if (ms < 0) return 0;
    return Math.floor(ms / 86400000) + 1;
  }, [bfStart, bfEnd]);

  const activeVehicle = vehicles.find(v => String(v.id) === String(bfCarId || selectedItem?.carId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-[#0b1929] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy dark:text-white">
                {selectedItem ? `Modifier Réservation #${selectedItem.id}` : 'Nouvelle Réservation'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedItem ? 'Ajustez les détails de la réservation' : 'Planifiez une location et assignez un véhicule'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form key={selectedItem?.id ?? 'new'} onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* Automated Flow Banner (Client → Réservation → Contrat) */}
          {quickFlow && !selectedItem && (
            <div className="flex items-start gap-3 rounded-2xl border border-brand-blue/30 bg-brand-blue/5 dark:bg-brand-blue/10 p-4">
              <Zap className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-brand-navy dark:text-white">Flux automatique activé</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  Le client <strong>{quickFlow.clientName}</strong> vient d'être enregistré et est sélectionné. Choisissez le véhicule et la période, puis validez : le contrat sera préparé instantanément.
                </p>
              </div>
            </div>
          )}

          {/* Row 1: Vehicle & Client in CSS Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client Combobox */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-brand-blue" /> Client <span className="text-red-500">*</span>
              </label>
              {selectedItem ? (
                <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-brand-navy dark:text-white flex items-center justify-between">
                  <span>{selectedItem.clientName}</span>
                  <span className="text-xs text-slate-400 font-normal">Verrouillé</span>
                </div>
              ) : (
                <RichSelect
                  name="clientId"
                  options={clientOptions}
                  value={bfClientId}
                  onChange={setBfClientId}
                  placeholder="— Sélectionner un client —"
                  searchPlaceholder="Rechercher par nom, email..."
                  required
                />
              )}
            </div>

            {/* Vehicle Combobox */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Car className="w-3.5 h-3.5 text-brand-blue" /> Véhicule <span className="text-red-500">*</span>
              </label>
              {selectedItem ? (
                <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-brand-navy dark:text-white flex items-center justify-between">
                  <span>{selectedItem.vehicleName}</span>
                  <span className="text-xs text-slate-400 font-normal">Verrouillé</span>
                </div>
              ) : (
                <RichSelect
                  name="carId"
                  options={vehicleOptions}
                  value={bfCarId}
                  onChange={(val) => {
                    setBfCarId(val);
                    const veh = vehicles.find(v => String(v.id) === val);
                    if (veh?.pricePerDay) setBfDailyRate(String(veh.pricePerDay));
                  }}
                  placeholder="— Sélectionner un véhicule —"
                  searchPlaceholder="Rechercher par modèle, matricule..."
                  required
                />
              )}
            </div>
          </div>

          {/* Row 2: Dates (Start & End) in CSS Grid with embedded calendar icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Date de Début <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  name="startDate"
                  type="date"
                  value={bfStart}
                  required
                  onChange={e => setBfStart(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-brand-blue" /> Date de Fin <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  name="endDate"
                  type="date"
                  min={bfStart || undefined}
                  value={bfEnd}
                  required
                  onChange={e => setBfEnd(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Pickup & Dropoff Points (if configured) */}
          {pickupPoints.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" /> Lieu de Prise en Charge
                </label>
                <select
                  value={bfPickupId}
                  onChange={e => setBfPickupId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer"
                >
                  <option value="">— Aucun point sélectionné —</option>
                  {pickupPoints
                    .filter(p => p.is_active && (p.type === 'pickup' || p.type === 'both'))
                    .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" /> Lieu de Retour
                </label>
                <select
                  value={bfDropoffId}
                  onChange={e => setBfDropoffId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer"
                >
                  <option value="">— Aucun point sélectionné —</option>
                  {pickupPoints
                    .filter(p => p.is_active && (p.type === 'dropoff' || p.type === 'both'))
                    .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                  }
                </select>
              </div>
            </div>
          )}

          {/* Availability Calendar (when booked periods loaded) */}
          {bfBookedPeriods !== null && activeVehicle && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-brand-navy dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  Planning d'occupation — {activeVehicle.name} {activeVehicle.plate ? `· ${activeVehicle.plate}` : ''}
                </p>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {bfBookedPeriods.total_units} unité{bfBookedPeriods.total_units > 1 ? 's' : ''} au total
                </span>
              </div>
              <AvailabilityCalendar
                totalUnits={bfBookedPeriods.total_units}
                bookedPeriods={bfBookedPeriods.booked_periods}
                pickupDate={bfStart}
                returnDate={bfEnd}
                months={3}
              />
            </div>
          )}

          {/* Row 4: Prix/Jour & Montant Total (in 1 row with distinctive Auto-Calculated badge & styling) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Daily Rate */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Prix/Jour (MAD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={bfDailyRate}
                onChange={e => setBfDailyRate(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-semibold"
                placeholder="Tarif journalier"
              />
              {activeVehicle?.pricePerDay && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Catalogue : <span className="font-semibold text-slate-600 dark:text-slate-300">{activeVehicle.pricePerDay.toLocaleString('fr-MA')} MAD/j</span>
                </p>
              )}
            </div>

            {/* Total Amount (DISTINCTIVE AUTO-CALCULATED STYLING) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5 text-brand-blue" /> Montant Total (MAD)
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-brand-blue dark:text-blue-300">
                  Auto-calculé
                </span>
              </div>
              <div className="relative">
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={bfAmount}
                  onChange={e => setBfAmount(e.target.value)}
                  className="w-full bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-200/80 dark:border-blue-800/60 rounded-xl p-2.5 text-base font-bold text-brand-blue dark:text-blue-300 focus:outline-none focus:border-brand-blue transition-all"
                  placeholder="0.00"
                />
              </div>
              {daysDiff > 0 && bfDailyRate && (
                <p className="mt-1 text-[11px] text-brand-blue/80 dark:text-blue-300/80 font-medium">
                  {daysDiff} jour{daysDiff > 1 ? 's' : ''} × {parseFloat(bfDailyRate).toLocaleString('fr-MA')} MAD
                </p>
              )}
            </div>

            {/* Payment Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Statut Paiement
              </label>
              <select
                name="paymentStatus"
                defaultValue={selectedItem?.paymentStatus || 'Unpaid'}
                className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer"
              >
                <option value="Paid">Payé</option>
                <option value="Deposit Only">Acompte seulement</option>
                <option value="Unpaid">Impayé</option>
              </select>
            </div>
          </div>

          {/* Row 5: Booking Status & Internal Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Statut Réservation
              </label>
              <select
                name="status"
                defaultValue={selectedItem?.status || 'Pending'}
                className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer"
              >
                <option value="Pending">En Attente</option>
                <option value="Confirmed">Confirmé</option>
                <option value="Active">Actif (En Voyage)</option>
                <option value="Completed">Terminé</option>
                <option value="Cancelled">Annulé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes Internes
              </label>
              <input
                name="notes"
                defaultValue={selectedItem?.notes || ''}
                className="w-full bg-slate-50/70 hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                placeholder="Ex: Siège bébé requis, vol AT540..."
              />
            </div>
          </div>

          {/* Conflict Suggestion Banner (if backend returned 422 slot suggestion) */}
          {bfConflict && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-900/20 p-4 animate-in fade-in-0 duration-150">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    Véhicule indisponible pour cette période exacte
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Créneau suggéré le plus proche : <strong>{bfConflict.suggestedStart} → {bfConflict.suggestedEnd}</strong>.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBfStart(bfConflict.suggestedStart);
                        setBfEnd(bfConflict.suggestedEnd);
                        setBfConflict(null);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Ajuster vers {bfConflict.suggestedStart} → {bfConflict.suggestedEnd}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBfConflict(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      Ignorer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{selectedItem ? 'Enregistrer les modifications' : 'Créer Réservation'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;
