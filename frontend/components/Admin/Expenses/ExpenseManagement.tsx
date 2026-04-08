import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, Plus, Search, Eye, Edit, Trash2,
  RefreshCw, X, CheckCircle2, Clock, XCircle,
  Users, Car, Wrench, ShieldCheck, Droplets,
  Building2, Zap, Megaphone, FileText, AlertTriangle,
  MoreHorizontal, ChevronDown, Wallet, CalendarDays,
  BarChart3, ArrowUpRight, Banknote, CreditCard,
  ArrowRightLeft, Filter,
} from 'lucide-react';
import { adminExpensesApi } from '../../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'salary' | 'vehicle_inspection' | 'maintenance' | 'insurance'
  | 'fuel' | 'rent' | 'utilities' | 'marketing' | 'tax' | 'fine' | 'other';

export type ExpenseStatus = 'paid' | 'pending' | 'cancelled';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  reference?: string;
  paid_by?: string;
  payment_method?: string;
  car_id?: string;
  car?: { id: string; full_name?: string; plate?: string } | null;
  status: ExpenseStatus;
  created_at: string;
}

// ─── Category metadata ────────────────────────────────────────────────────────

export const CATEGORY_META: Record<ExpenseCategory, {
  label: string; color: string; bg: string; icon: React.ElementType; description: string;
}> = {
  salary:             { label: 'Salaire',            color: 'text-violet-700 dark:text-violet-400',  bg: 'bg-violet-100 dark:bg-violet-900/30',  icon: Users,        description: 'Rémunération du personnel' },
  vehicle_inspection: { label: 'Visite Technique',   color: 'text-blue-700 dark:text-blue-400',      bg: 'bg-blue-100 dark:bg-blue-900/30',      icon: ShieldCheck,  description: 'Contrôle technique réglementaire' },
  maintenance:        { label: 'Entretien',           color: 'text-amber-700 dark:text-amber-400',    bg: 'bg-amber-100 dark:bg-amber-900/30',    icon: Wrench,       description: 'Révision, lavage, réparation' },
  insurance:          { label: 'Assurance',           color: 'text-teal-700 dark:text-teal-400',      bg: 'bg-teal-100 dark:bg-teal-900/30',      icon: ShieldCheck,  description: 'Primes d\'assurance véhicules' },
  fuel:               { label: 'Carburant',           color: 'text-orange-700 dark:text-orange-400',  bg: 'bg-orange-100 dark:bg-orange-900/30',  icon: Droplets,     description: 'Ravitaillement en carburant' },
  rent:               { label: 'Loyer',               color: 'text-indigo-700 dark:text-indigo-400',  bg: 'bg-indigo-100 dark:bg-indigo-900/30',  icon: Building2,    description: 'Loyer des locaux de l\'agence' },
  utilities:          { label: 'Charges',             color: 'text-cyan-700 dark:text-cyan-400',      bg: 'bg-cyan-100 dark:bg-cyan-900/30',      icon: Zap,          description: 'Électricité, eau, internet' },
  marketing:          { label: 'Marketing',           color: 'text-pink-700 dark:text-pink-400',      bg: 'bg-pink-100 dark:bg-pink-900/30',      icon: Megaphone,    description: 'Publicité, communication' },
  tax:                { label: 'Taxes & Impôts',      color: 'text-rose-700 dark:text-rose-400',      bg: 'bg-rose-100 dark:bg-rose-900/30',      icon: FileText,     description: 'TVA, IS, taxe professionnelle' },
  fine:               { label: 'Amende',              color: 'text-red-700 dark:text-red-400',        bg: 'bg-red-100 dark:bg-red-900/30',        icon: AlertTriangle,description: 'Contravention, pénalité' },
  other:              { label: 'Autre',               color: 'text-slate-600 dark:text-slate-400',    bg: 'bg-slate-100 dark:bg-white/10',        icon: MoreHorizontal,description: 'Dépense diverse' },
};

const STATUS_META: Record<ExpenseStatus, { label: string; color: string; icon: React.ElementType }> = {
  paid:      { label: 'Payée',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: CheckCircle2 },
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  cancelled: { label: 'Annulée',  color: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',       icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Espèces', card: 'Carte', transfer: 'Virement', check: 'Chèque',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtAmount = (n: number) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(n) + ' MAD';

export const expenseFromApi = (e: Record<string, any>): Expense => ({
  id:             String(e.id),
  title:          e.title ?? '',
  category:       (e.category ?? 'other') as ExpenseCategory,
  amount:         parseFloat(e.amount) || 0,
  date:           e.date?.slice(0, 10) ?? '',
  description:    e.description ?? undefined,
  reference:      e.reference ?? undefined,
  paid_by:        e.paid_by ?? undefined,
  payment_method: e.payment_method ?? undefined,
  car_id:         e.car_id ? String(e.car_id) : undefined,
  car:            e.car ?? null,
  status:         (e.status ?? 'paid') as ExpenseStatus,
  created_at:     e.created_at ?? '',
});

// ─── Badges ─────────────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ category: ExpenseCategory }> = ({ category }) => {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

const StatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META.paid;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ─── Expense Form Modal ───────────────────────────────────────────────────────

interface ExpenseFormProps {
  expense?: Expense | null;
  onSave: (exp: Expense) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSave, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'other');

  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1';
  const inputClass = 'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-navy dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const g = (k: string) => fd.get(k)?.toString() ?? '';

    const payload: Record<string, unknown> = {
      title:          g('title'),
      category,
      amount:         parseFloat(g('amount')) || 0,
      date:           g('date'),
      description:    g('description') || undefined,
      reference:      g('reference') || undefined,
      paid_by:        g('paid_by') || undefined,
      payment_method: g('payment_method') || undefined,
      car_id:         g('car_id') || undefined,
      status:         g('status') || 'paid',
    };

    setSaving(true);
    try {
      let res: any;
      if (expense) {
        res = await adminExpensesApi.update(expense.id, payload);
      } else {
        res = await adminExpensesApi.create(payload);
      }
      onSave(expenseFromApi(res.expense));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5 flex-shrink-0">
          <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            {expense ? 'Modifier la dépense' : 'Nouvelle Dépense'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-grow">
          <div className="p-6 space-y-5">

            {/* Category picker */}
            <div>
              <label className={labelClass}>Catégorie *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(Object.entries(CATEGORY_META) as [ExpenseCategory, typeof CATEGORY_META[ExpenseCategory]][]).map(([key, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all text-xs font-bold ${
                        category === key
                          ? `${meta.bg} ${meta.color} border-current shadow-sm scale-[1.02]`
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="leading-tight">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <label className={labelClass}>Intitulé *</label>
                <input name="title" required className={inputClass}
                  placeholder={`ex : ${CATEGORY_META[category].description}`}
                  defaultValue={expense?.title ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Montant (MAD) *</label>
                <input name="amount" type="number" step="0.01" min="0" required className={inputClass}
                  placeholder="0.00"
                  defaultValue={expense?.amount ?? ''} />
              </div>
            </div>

            {/* Date + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date *</label>
                <input name="date" type="date" required className={inputClass}
                  defaultValue={expense?.date ?? new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" className={inputClass} defaultValue={expense?.status ?? 'paid'}>
                  <option value="paid">Payée</option>
                  <option value="pending">En attente</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>

            {/* Paid by + Payment method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Payé par</label>
                <input name="paid_by" className={inputClass}
                  placeholder="ex : Directeur, Comptable..."
                  defaultValue={expense?.paid_by ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Mode de paiement</label>
                <select name="payment_method" className={inputClass} defaultValue={expense?.payment_method ?? ''}>
                  <option value="">—</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="check">Chèque</option>
                </select>
              </div>
            </div>

            {/* Reference + Car */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>N° Référence / Facture</label>
                <input name="reference" className={inputClass}
                  placeholder="ex : FACT-2026-001"
                  defaultValue={expense?.reference ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Véhicule concerné (ID)</label>
                <input name="car_id" className={inputClass}
                  placeholder="ex : 3"
                  defaultValue={expense?.car_id ?? ''} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description / Notes</label>
              <textarea name="description" rows={3} className={inputClass}
                placeholder="Détails supplémentaires sur cette dépense..."
                defaultValue={expense?.description ?? ''} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {expense ? 'Mettre à jour' : 'Enregistrer la dépense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Expense Detail Modal ─────────────────────────────────────────────────────

const ExpenseDetail: React.FC<{
  expense: Expense;
  onClose: () => void;
  onEdit: () => void;
}> = ({ expense, onClose, onEdit }) => {
  const meta = CATEGORY_META[expense.category] ?? CATEGORY_META.other;
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-xl ${meta.bg}`}>
              <Icon className={`w-5 h-5 ${meta.color}`} />
            </span>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">{meta.label}</p>
              <h3 className="text-base font-bold text-brand-navy dark:text-white">{expense.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={expense.status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount highlight */}
          <div className={`${meta.bg} rounded-xl p-4 flex items-center justify-between`}>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Montant de la dépense</p>
            <p className={`text-2xl font-black ${meta.color}`}>{fmtAmount(expense.amount)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Date
              </p>
              <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">{fmtDate(expense.date)}</p>
            </div>
            {expense.payment_method && (
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mode de paiement</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">
                  {PAYMENT_LABELS[expense.payment_method] ?? expense.payment_method}
                </p>
              </div>
            )}
            {expense.paid_by && (
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Payé par</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">{expense.paid_by}</p>
              </div>
            )}
            {expense.reference && (
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Référence</p>
                <p className="text-sm font-mono font-bold text-brand-blue mt-1">{expense.reference}</p>
              </div>
            )}
          </div>

          {expense.car && (
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <Car className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Véhicule concerné</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white">
                  {expense.car.full_name ?? `Véhicule #${expense.car_id}`}
                  {expense.car.plate && <span className="ml-2 font-mono text-xs text-slate-400">{expense.car.plate}</span>}
                </p>
              </div>
            </div>
          )}

          {expense.description && (
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{expense.description}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex gap-2 bg-slate-50/50 dark:bg-white/[0.02]">
          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Edit className="w-4 h-4" /> Modifier
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState<{ total_paid: number; total_pending: number; by_category: Record<string, number> }>({ total_paid: 0, total_pending: 0, by_category: {} });
  const [search, setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter]     = useState<string>('all');
  const [monthFilter, setMonthFilter]       = useState<string>('');
  const [showForm, setShowForm]     = useState(false);
  const [editExpense, setEditExpense]   = useState<Expense | null>(null);
  const [viewExpense, setViewExpense]   = useState<Expense | null>(null);

  const load = (params?: Record<string, string>) => {
    setLoading(true);
    adminExpensesApi.list({ per_page: 500, ...params })
      .then((res: any) => {
        setExpenses((res.data ?? []).map((e: any) => expenseFromApi(e)));
        if (res.stats) setStats(res.stats);
      })
      .catch(err => console.error('[Expenses] Failed to load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense définitivement ?')) return;
    try {
      await adminExpensesApi.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => expenses.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.reference ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.paid_by ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat    = categoryFilter === 'all' || e.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchMonth  = !monthFilter || e.date.startsWith(monthFilter);
    return matchSearch && matchCat && matchStatus && matchMonth;
  }), [expenses, search, categoryFilter, statusFilter, monthFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalFiltered = filtered
    .filter(e => e.status !== 'cancelled')
    .reduce((s, e) => s + e.amount, 0);

  // Top 3 categories by amount
  const topCategories = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};
    expenses.filter(e => e.status !== 'cancelled').forEach(e => {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4) as [ExpenseCategory, number][];
  }, [expenses]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const totalThisMonth = expenses
    .filter(e => e.date.startsWith(thisMonth) && e.status !== 'cancelled')
    .reduce((s, e) => s + e.amount, 0);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> Total payées
          </p>
          <p className="text-xl font-black text-red-700 dark:text-red-400 mt-1">{fmtAmount(stats.total_paid)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Toutes catégories confondues</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> En attente
          </p>
          <p className="text-xl font-black text-yellow-700 dark:text-yellow-400 mt-1">{fmtAmount(stats.total_pending)}</p>
          <p className="text-[10px] text-slate-400 mt-1">À régler</p>
        </div>
        <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-wide flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Ce mois-ci
          </p>
          <p className="text-xl font-black text-brand-blue mt-1">{fmtAmount(totalThisMonth)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Total dépenses
          </p>
          <p className="text-xl font-black text-brand-navy dark:text-white mt-1">{expenses.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">{filtered.length} affichées</p>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {topCategories.length > 0 && (
        <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Répartition par catégorie
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {topCategories.map(([cat, total]) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const pct = stats.total_paid > 0 ? Math.round((total / stats.total_paid) * 100) : 0;
              return (
                <div key={cat} className={`${meta.bg} rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className={`text-[10px] font-bold ${meta.color}`}>{pct}%</span>
                  </div>
                  <p className={`text-xs font-bold ${meta.color}`}>{meta.label}</p>
                  <p className={`text-base font-black ${meta.color} mt-0.5`}>{fmtAmount(total)}</p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-current transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent focus:border-brand-blue/50 focus:outline-none text-sm text-brand-navy dark:text-white placeholder-slate-400"
            placeholder="Rechercher par titre, référence, payé par..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-blue/50 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none"
        >
          <option value="all">Toutes catégories</option>
          {(Object.entries(CATEGORY_META) as [ExpenseCategory, typeof CATEGORY_META[ExpenseCategory]][]).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-blue/50 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="paid">Payées</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulées</option>
        </select>

        {/* Month filter */}
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-blue/50 rounded-xl text-sm text-brand-navy dark:text-white focus:outline-none"
        />

        <button onClick={() => load()} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-blue transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => { setEditExpense(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nouvelle Dépense
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        {/* Table summary bar */}
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-brand-navy dark:text-white">{filtered.length}</span> dépense{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs font-bold text-red-600 dark:text-red-400">
              Total : {fmtAmount(totalFiltered)}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
            <p className="text-sm">Chargement des dépenses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">Aucune dépense enregistrée</p>
            <p className="text-xs mt-1">Cliquez sur « Nouvelle Dépense » pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  {['Date', 'Catégorie', 'Intitulé', 'Véhicule', 'Mode', 'Montant', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {fmtDate(exp.date)}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={exp.category} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-brand-navy dark:text-white">{exp.title}</p>
                      {exp.paid_by && <p className="text-xs text-slate-400">{exp.paid_by}</p>}
                      {exp.reference && <p className="text-xs font-mono text-slate-400">{exp.reference}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {exp.car ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Car className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium">{exp.car.full_name ?? `#${exp.car_id}`}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {exp.payment_method ? (
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                          {PAYMENT_LABELS[exp.payment_method] ?? exp.payment_method}
                        </span>
                      ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${exp.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-red-600 dark:text-red-400'}`}>
                        {fmtAmount(exp.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="Voir détails">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditExpense(exp); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="Modifier">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {showForm && (
          <ExpenseForm
            expense={editExpense}
            onSave={saved => {
              setExpenses(prev => {
                const idx = prev.findIndex(e => e.id === saved.id);
                return idx >= 0 ? prev.map(e => e.id === saved.id ? saved : e) : [saved, ...prev];
              });
              // Refresh stats
              load();
            }}
            onClose={() => { setShowForm(false); setEditExpense(null); }}
          />
        )}
      </AnimatePresence>

      {viewExpense && (
        <ExpenseDetail
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onEdit={() => { setEditExpense(viewExpense); setViewExpense(null); setShowForm(true); }}
        />
      )}
    </div>
  );
};

export default ExpenseManagement;
