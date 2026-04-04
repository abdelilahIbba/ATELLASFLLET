import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  Car as CarIcon,
} from 'lucide-react';
import { adminFinesApi } from '../../../services/api';
import type { Infraction, InfractionType } from '../types';

// ─── Type display helpers ─────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  Radar:              'Radar',
  Speeding:           'Vitesse excessive',
  Parking:            'Stationnement',
  'Police Check':     'Contrôle routier',
  insurance_expired:  'Assurance expirée',
  visite_expired:     'Visite technique',
  seatbelt:           'Ceinture de sécurité',
  phone:              'Téléphone au volant',
  overtaking:         'Dépassement',
  missing_docs:       'Documents manquants',
  unpaid_toll:        'Péage impayé',
};

const TYPE_COLORS: Record<string, string> = {
  Radar:              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Speeding:           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Parking:            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Police Check':     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  insurance_expired:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  visite_expired:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  seatbelt:           'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  phone:              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  overtaking:         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  missing_docs:       'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  unpaid_toll:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// ─── Local types ──────────────────────────────────────────────────────────────

interface InfractionRow extends Infraction {
  car_name: string;
  car_plate: string;
  user_name: string;
}

interface VehicleOpt {
  id: string;
  name: string;
  plate: string;
}

interface FormData {
  car_id: string;
  driver_name: string;
  date: string;
  due_date: string;
  type: string;
  amount: string;
  location: string;
  status: 'Paid' | 'Unpaid' | 'Disputed';
  notification_ref: string;
  notes: string;
}

const BLANK: FormData = {
  car_id: '', driver_name: '', date: '', due_date: '',
  type: 'Radar', amount: '', location: '', status: 'Unpaid',
  notification_ref: '', notes: '',
};

interface Props {
  vehicles: VehicleOpt[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const InfractionsManagement: React.FC<Props> = ({ vehicles }) => {
  const [rows,        setRows]       = useState<InfractionRow[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [fStatus,     setFStatus]    = useState('All');
  const [fCar,        setFCar]       = useState('All');
  const [fAgent,      setFAgent]     = useState('All');
  const [search,      setSearch]     = useState('');
  const [modal,       setModal]      = useState(false);
  const [editId,      setEditId]     = useState<string | null>(null);
  const [form,        setForm]       = useState<FormData>({ ...BLANK });
  const [saving,      setSaving]     = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminFinesApi.list({ per_page: 200 });
      setRows(
        (res.data ?? []).map((f: any): InfractionRow => ({
          id:               String(f.id),
          car_id:           f.car_id ?? f.vehicle_id,
          driver_name:      f.driver_name ?? '',
          date:             f.date ?? '',
          due_date:         f.due_date ?? '',
          type:             f.type as InfractionType,
          amount:           Number(f.amount ?? 0),
          location:         f.location ?? '',
          status:           (f.status ?? 'Unpaid') as Infraction['status'],
          notification_ref: f.notification_ref ?? '',
          notes:            f.notes ?? '',
          car_name:         f.car?.name ?? `Véhicule #${f.car_id ?? f.vehicle_id}`,
          car_plate:        f.car?.plate ?? '',
          user_name:        f.user?.name ?? '—',
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const agents = useMemo(() => {
    const s = new Set(rows.map(r => r.user_name).filter(n => n && n !== '—'));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (fStatus !== 'All' && r.status !== fStatus) return false;
    if (fCar    !== 'All' && String(r.car_id) !== fCar) return false;
    if (fAgent  !== 'All' && r.user_name !== fAgent) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.car_name.toLowerCase().includes(q) ||
        r.car_plate.toLowerCase().includes(q) ||
        (r.location ?? '').toLowerCase().includes(q) ||
        r.user_name.toLowerCase().includes(q) ||
        (r.notification_ref ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  }), [rows, fStatus, fCar, fAgent, search]);

  const unpaid     = useMemo(() => rows.filter(r => r.status === 'Unpaid'),   [rows]);
  const paid       = useMemo(() => rows.filter(r => r.status === 'Paid'),     [rows]);
  const disputed   = useMemo(() => rows.filter(r => r.status === 'Disputed'), [rows]);
  const unpaidAmt  = useMemo(() => unpaid.reduce((s, r) => s + r.amount, 0),  [unpaid]);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openAdd = () => { setEditId(null); setForm({ ...BLANK }); setModal(true); };

  const openEdit = (r: InfractionRow) => {
    setEditId(r.id);
    setForm({
      car_id: String(r.car_id), driver_name: r.driver_name ?? '',
      date: r.date, due_date: r.due_date ?? '', type: r.type,
      amount: String(r.amount), location: r.location ?? '',
      status: r.status, notification_ref: r.notification_ref ?? '', notes: r.notes ?? '',
    });
    setModal(true);
  };

  // ── CRUD handlers ───────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.car_id || !form.date || !form.amount) return;
    setSaving(true);
    try {
      const payload = {
        car_id:           form.car_id,
        driver_name:      form.driver_name || 'Conducteur',
        date:             form.date,
        due_date:         form.due_date || null,
        type:             form.type,
        amount:           parseFloat(form.amount) || 0,
        location:         form.location || null,
        status:           form.status,
        notification_ref: form.notification_ref || null,
        notes:            form.notes || null,
      };
      if (editId) {
        await adminFinesApi.update(editId, payload);
      } else {
        await adminFinesApi.create(payload);
      }
      await load();
      setModal(false);
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id: string) => {
    try {
      await adminFinesApi.update(id, { status: 'Paid' });
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'Paid' } : r));
    } catch { /* silent */ }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Supprimer cette infraction définitivement ?')) return;
    try {
      await adminFinesApi.delete(id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch { /* silent */ }
  };

  // ── Field change helper ─────────────────────────────────────────────────────

  const f = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  // ── Shared style shorthands ─────────────────────────────────────────────────

  const inputCls = 'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue';
  const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1';
  const selectCls = 'py-2 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
          <ShieldAlert className="w-6 h-6 text-brand-blue mb-3" />
          <p className="text-2xl font-bold text-brand-navy dark:text-white font-space">{rows.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Total Infractions</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5">
          <AlertTriangle className="w-6 h-6 text-red-500 mb-3" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-space">{unpaid.length}</p>
          <p className="text-xs text-red-500 uppercase tracking-widest font-bold mt-1">
            Non payées&nbsp;—&nbsp;{unpaidAmt.toLocaleString('fr-MA')}&nbsp;MAD
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-5">
          <CheckCircle2 className="w-6 h-6 text-green-500 mb-3" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-space">{paid.length}</p>
          <p className="text-xs text-green-600 uppercase tracking-widest font-bold mt-1">Payées</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5">
          <CarIcon className="w-6 h-6 text-amber-500 mb-3" />
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-space">{disputed.length}</p>
          <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mt-1">Contestées</p>
        </div>
      </div>

      {/* ── Filter toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue w-44"
            />
          </div>

          {/* Car filter */}
          <select value={fCar} onChange={e => setFCar(e.target.value)} className={selectCls}>
            <option value="All">Tous les véhicules</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.plate} — {v.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} className={selectCls}>
            <option value="All">Tous les statuts</option>
            <option value="Unpaid">Non payées</option>
            <option value="Paid">Payées</option>
            <option value="Disputed">Contestées</option>
          </select>

          {/* Agent filter — only shown when agents are present */}
          {agents.length > 0 && (
            <select value={fAgent} onChange={e => setFAgent(e.target.value)} className={selectCls}>
              <option value="All">Tous les agents</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}

          <button
            onClick={load}
            title="Actualiser"
            className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouvelle Infraction
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Chargement des infractions…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <ShieldAlert className="w-10 h-10 mb-3 opacity-25" />
            <p className="font-medium text-sm">Aucune infraction trouvée</p>
            <p className="text-xs mt-1 text-slate-400">Modifiez les filtres ou ajoutez une infraction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.03]">
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Véhicule</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Montant</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Agent</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Réf. PV</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Vehicle */}
                    <td className="p-4">
                      <div className="font-bold text-brand-navy dark:text-white text-sm">{r.car_name}</div>
                      {r.car_plate && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{r.car_plate}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-sm">
                      {r.date}
                      {r.due_date && (
                        <div className="text-[11px] text-slate-400 mt-0.5">Échéance&nbsp;: {r.due_date}</div>
                      )}
                    </td>

                    {/* Type badge */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${TYPE_COLORS[r.type] ?? 'bg-slate-100 text-slate-700'}`}>
                        {TYPE_LABELS[r.type] ?? r.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right font-bold text-brand-navy dark:text-white whitespace-nowrap">
                      {r.amount.toLocaleString('fr-MA')}&nbsp;MAD
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                        r.status === 'Paid'     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        r.status === 'Disputed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {r.status === 'Paid' ? 'Payée' : r.status === 'Disputed' ? 'Contestée' : 'Non payée'}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">{r.user_name}</td>

                    {/* Ref */}
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {r.notification_ref || '—'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== 'Paid' && (
                          <button
                            onClick={() => markPaid(r.id)}
                            title="Marquer comme payée"
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(r)}
                          title="Modifier"
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          title="Supprimer"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-brand-navy dark:text-white">
                  {editId ? 'Modifier l\'infraction' : 'Nouvelle infraction'}
                </h3>
              </div>
              <button
                onClick={() => setModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">

              {/* Vehicle */}
              <div>
                <label className={labelCls}>Véhicule *</label>
                <select value={form.car_id} onChange={f('car_id')} required className={inputCls}>
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date *</label>
                  <input type="date" value={form.date} onChange={f('date')} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Échéance paiement</label>
                  <input type="date" value={form.due_date} onChange={f('due_date')} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type d'infraction *</label>
                  <select value={form.type} onChange={f('type')} required className={inputCls}>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Montant (MAD) *</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.amount} onChange={f('amount')}
                    required className={inputCls}
                    placeholder="ex: 500"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Lieu</label>
                <input
                  type="text" value={form.location} onChange={f('location')}
                  className={inputCls}
                  placeholder="ex: Boulevard Hassan II, Casablanca"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Statut</label>
                  <select value={form.status} onChange={f('status')} className={inputCls}>
                    <option value="Unpaid">Non payée</option>
                    <option value="Paid">Payée</option>
                    <option value="Disputed">Contestée</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Réf. PV / Notification</label>
                  <input
                    type="text" value={form.notification_ref} onChange={f('notification_ref')}
                    className={inputCls}
                    placeholder="ex: PV-2026-00123"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Nom du conducteur</label>
                <input
                  type="text" value={form.driver_name} onChange={f('driver_name')}
                  className={inputCls}
                  placeholder="Nom du conducteur impliqué"
                />
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  value={form.notes} onChange={f('notes')}
                  rows={3} className={inputCls}
                  placeholder="Observations, contexte…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfractionsManagement;
