import React from 'react';
import { 
  AlertTriangle, 
  Siren, 
  CheckCircle2, 
  Trash2, 
  Plus 
} from 'lucide-react';
import type { Infraction } from '../../../types';

export const INF_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Radar',             label: 'Radar / Excès de vitesse' },
  { value: 'Speeding',          label: 'Vitesse excessive' },
  { value: 'Parking',           label: 'Stationnement interdit' },
  { value: 'Police Check',      label: 'Contrôle routier' },
  { value: 'insurance_expired', label: 'Assurance expirée' },
  { value: 'visite_expired',    label: 'Visite technique expirée' },
  { value: 'seatbelt',          label: 'Non-port de ceinture' },
  { value: 'phone',             label: 'Usage téléphone au volant' },
  { value: 'overtaking',        label: 'Dépassement dangereux' },
  { value: 'missing_docs',      label: 'Documents manquants' },
  { value: 'unpaid_toll',       label: 'Péage impayé' },
];

export const INF_TYPE_META: Record<string, { label: string; color: string }> = {
  'Radar':             { label: 'Radar',         color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'Speeding':          { label: 'Vitesse',        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'Parking':           { label: 'Parking',        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'Police Check':      { label: 'Contrôle',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'insurance_expired': { label: 'Assurance',      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'visite_expired':    { label: 'Visite Tech.',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'seatbelt':          { label: 'Ceinture',       color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'phone':             { label: 'Téléphone',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'overtaking':        { label: 'Dépassement',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'missing_docs':      { label: 'Documents',      color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  'unpaid_toll':       { label: 'Péage',          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

interface VehicleInfractionsTabProps {
  selectedItem: any | null;
  modalInfractions: Infraction[];
  modalInfLoading: boolean;
  infFormVisible: boolean;
  setInfFormVisible: (v: boolean) => void;
  infFormSaving: boolean;
  infForm: any;
  setInfForm: React.Dispatch<React.SetStateAction<any>>;
  handleMarkInfPaid: (id: string) => void;
  handleDeleteInfraction: (id: string) => void;
  handleAddInfraction: () => void;
  blankInfForm: any;
}

export const VehicleInfractionsTab: React.FC<VehicleInfractionsTabProps> = ({
  selectedItem,
  modalInfractions,
  modalInfLoading,
  infFormVisible,
  setInfFormVisible,
  infFormSaving,
  infForm,
  setInfForm,
  handleMarkInfPaid,
  handleDeleteInfraction,
  handleAddInfraction,
  blankInfForm
}) => {
  if (!selectedItem?.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <AlertTriangle className="w-10 h-10 opacity-40" />
        <p className="text-sm font-medium">Enregistrez d'abord le véhicule pour gérer ses infractions</p>
        <p className="text-xs text-slate-400">Les infractions sont liées à un véhicule existant dans le système.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Unpaid alert banner ── */}
      {modalInfractions.some(i => i.status !== 'Paid') && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl shadow-xs">
          <Siren className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
              {modalInfractions.filter(i => i.status !== 'Paid').length} infraction(s) non-réglée(s) — Action requise
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5 font-medium">
              Total impayé : {modalInfractions.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0).toLocaleString('fr-MA')} MAD
            </p>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {modalInfLoading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Chargement des infractions…</div>
      ) : modalInfractions.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {modalInfractions.map(inf => {
            const meta = INF_TYPE_META[inf.type] ?? { label: inf.type, color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' };
            const isPaid = inf.status === 'Paid';
            const today = new Date().toISOString().slice(0, 10);
            const isOverdue = !isPaid && !!inf.due_date && inf.due_date < today;
            return (
              <div key={inf.id} className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
                isPaid 
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20' 
                  : isOverdue 
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
              }`}>
                <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold leading-none whitespace-nowrap ${meta.color}`}>
                  {meta.label}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {inf.amount.toLocaleString('fr-MA')} MAD
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{inf.date}</span>
                    {inf.location && <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={inf.location}>{inf.location}</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {inf.due_date && (
                      <span className={`text-[10px] font-mono ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        Échéance: {inf.due_date}{isOverdue ? ' ⚠' : ''}
                      </span>
                    )}
                    {inf.notification_ref && (
                      <span className="text-[10px] text-slate-400 font-mono">Réf: {inf.notification_ref}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPaid 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                      : inf.status === 'Disputed' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                  }`}>
                    {isPaid ? 'Payée' : inf.status === 'Disputed' ? 'Contestée' : 'Impayée'}
                  </span>
                  {!isPaid && (
                    <button 
                      type="button" 
                      onClick={() => handleMarkInfPaid(inf.id)} 
                      title="Marquer comme payée" 
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-600 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => handleDeleteInfraction(inf.id)} 
                    title="Supprimer" 
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : !infFormVisible ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <CheckCircle2 className="w-10 h-10 opacity-40 text-emerald-500" />
          <p className="text-sm font-medium">Aucune infraction enregistrée</p>
          <p className="text-xs">Ce véhicule est parfaitement en règle</p>
        </div>
      ) : null}

      {/* ── Add infraction form ── */}
      {infFormVisible ? (
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Siren className="w-3.5 h-3.5 text-rose-500" /> Nouvelle infraction
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type d'infraction</label>
              <select 
                value={infForm.type} 
                onChange={e => setInfForm((p: any) => ({ ...p, type: e.target.value }))} 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"
              >
                {INF_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date de l'infraction</label>
              <input 
                type="date" 
                value={infForm.date} 
                onChange={e => setInfForm((p: any) => ({ ...p, date: e.target.value }))} 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Montant de l'amende (MAD)</label>
              <input 
                type="number" 
                min="0" 
                value={infForm.amount} 
                onChange={e => setInfForm((p: any) => ({ ...p, amount: e.target.value }))} 
                placeholder="ex: 700" 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date d'échéance paiement</label>
              <input 
                type="date" 
                value={infForm.due_date} 
                onChange={e => setInfForm((p: any) => ({ ...p, due_date: e.target.value }))} 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lieu de l'infraction</label>
              <input 
                type="text" 
                value={infForm.location} 
                onChange={e => setInfForm((p: any) => ({ ...p, location: e.target.value }))} 
                placeholder="ex: Autoroute A3, Km 45" 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Réf. notification / PV</label>
              <input 
                type="text" 
                value={infForm.notification_ref} 
                onChange={e => setInfForm((p: any) => ({ ...p, notification_ref: e.target.value }))} 
                placeholder="ex: PV/2026/00123" 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-mono text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Statut</label>
              <select 
                value={infForm.status} 
                onChange={e => setInfForm((p: any) => ({ ...p, status: e.target.value }))} 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="Unpaid">Impayée</option>
                <option value="Paid">Payée</option>
                <option value="Disputed">Contestée</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notes / Observations</label>
              <input 
                type="text" 
                value={infForm.notes} 
                onChange={e => setInfForm((p: any) => ({ ...p, notes: e.target.value }))} 
                placeholder="Informations complémentaires..." 
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => { setInfFormVisible(false); setInfForm({ ...blankInfForm }); }} 
              className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button 
              type="button" 
              onClick={handleAddInfraction} 
              disabled={infFormSaving || !infForm.date || !infForm.amount} 
              className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {infFormSaving ? 'Enregistrement…' : <><Plus className="w-3.5 h-3.5" /> Enregistrer l'infraction</>}
            </button>
          </div>
        </div>
      ) : (
        <button 
          type="button" 
          onClick={() => setInfFormVisible(true)} 
          className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter une infraction
        </button>
      )}

      {/* Legend */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
          Les infractions correspondent aux procès-verbaux officiels reçus (radar, stationnement, etc.). Marquez-les comme payées une fois réglées pour maintenir la conformité du véhicule.
        </p>
      </div>
    </div>
  );
};
