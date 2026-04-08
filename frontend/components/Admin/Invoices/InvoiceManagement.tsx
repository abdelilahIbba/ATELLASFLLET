import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, Search, Eye, Edit, Trash2, Download,
  CheckCircle2, Clock, AlertCircle, XCircle, Send,
  RefreshCw, X, CreditCard, Banknote, ArrowRightLeft, FileText,
  TrendingUp, DollarSign, AlertTriangle,
} from 'lucide-react';
import { adminInvoicesApi } from '../../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  label: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id?: string;
  booking_id?: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_method?: 'cash' | 'card' | 'transfer' | 'check';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date?: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  contract?: { id: string; contract_number: string } | null;
  created_at: string;
}

export type InvoiceStatus = Invoice['status'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon',  color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',     icon: Clock },
  sent:      { label: 'Envoyée',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     icon: Send },
  paid:      { label: 'Payée',      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  overdue:   { label: 'En retard',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',         icon: AlertCircle },
  cancelled: { label: 'Annulée',    color: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',     icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Espèces', card: 'Carte', transfer: 'Virement', check: 'Chèque',
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtAmount = (n: number) =>
  new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(n) + ' MAD';

const round2 = (n: number) => Math.round(n * 100) / 100;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ─── API mapper ───────────────────────────────────────────────────────────────

export const invoiceFromApi = (i: Record<string, any>): Invoice => ({
  id:              String(i.id),
  invoice_number:  i.invoice_number ?? '',
  contract_id:     i.contract_id ? String(i.contract_id) : undefined,
  booking_id:      i.booking_id ? String(i.booking_id) : undefined,
  user_id:         String(i.user_id),
  client_name:     i.client_name ?? '',
  client_email:    i.client_email ?? undefined,
  client_phone:    i.client_phone ?? undefined,
  client_address:  i.client_address ?? undefined,
  items:           Array.isArray(i.items) ? i.items : [],
  subtotal:        parseFloat(i.subtotal) || 0,
  tax_rate:        parseFloat(i.tax_rate) || 20,
  tax_amount:      parseFloat(i.tax_amount) || 0,
  discount_amount: parseFloat(i.discount_amount) || 0,
  total:           parseFloat(i.total) || 0,
  currency:        i.currency ?? 'MAD',
  payment_method:  i.payment_method ?? undefined,
  status:          (i.status ?? 'draft') as InvoiceStatus,
  issue_date:      i.issue_date?.slice(0, 10) ?? undefined,
  due_date:        i.due_date?.slice(0, 10) ?? undefined,
  paid_at:         i.paid_at ?? undefined,
  notes:           i.notes ?? undefined,
  contract:        i.contract ?? null,
  created_at:      i.created_at ?? '',
});

// ─── Mark Paid Modal ──────────────────────────────────────────────────────────

const MarkPaidModal: React.FC<{
  invoice: Invoice;
  onConfirm: (method: string) => void;
  onClose: () => void;
}> = ({ invoice, onConfirm, onClose }) => {
  const [method, setMethod] = useState<string>('cash');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0B1120] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <h4 className="font-bold text-brand-navy dark:text-white">Marquer comme payée</h4>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Facture <strong className="text-brand-navy dark:text-white">{invoice.invoice_number}</strong> —
            Total : <strong className="text-brand-teal">{fmtAmount(invoice.total)}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'cash', label: 'Espèces', Icon: Banknote },
                { value: 'card', label: 'Carte', Icon: CreditCard },
                { value: 'transfer', label: 'Virement', Icon: ArrowRightLeft },
                { value: 'check', label: 'Chèque', Icon: FileText },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                    method === value
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-brand-blue/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onConfirm(method)}
            className="w-full py-2.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmer le paiement
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Invoice Form ─────────────────────────────────────────────────────────────

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSave: (inv: Invoice) => void;
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items?.length ? invoice.items : [{ label: '', quantity: 1, unit_price: 0, tax_rate: 20, line_total: 0 }]
  );
  const [taxRate, setTaxRate] = useState(invoice?.tax_rate ?? 20);
  const [discount, setDiscount] = useState(invoice?.discount_amount ?? 0);

  const updateItem = (i: number, field: keyof InvoiceItem, val: string | number) => {
    const next = [...items];
    const item = { ...next[i], [field]: field === 'label' ? val : (parseFloat(String(val)) || 0) };
    if (field === 'quantity' || field === 'unit_price') {
      item.line_total = round2(item.quantity * item.unit_price);
    }
    next[i] = item;
    setItems(next);
  };

  const subtotal  = round2(items.reduce((s, it) => s + it.line_total, 0));
  const taxable   = round2(Math.max(0, subtotal - discount));
  const taxAmount = round2(taxable * taxRate / 100);
  const total     = round2(taxable + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const fd = new FormData(e.target as HTMLFormElement);
    const g = (k: string) => fd.get(k)?.toString() ?? '';
    const payload: Record<string, unknown> = {
      user_id:         invoice?.user_id ?? '',
      client_name:     g('client_name'),
      client_email:    g('client_email') || undefined,
      client_phone:    g('client_phone') || undefined,
      client_address:  g('client_address') || undefined,
      items:           items.filter(it => it.label.trim()),
      tax_rate:        taxRate,
      discount_amount: discount,
      payment_method:  g('payment_method') || undefined,
      status:          g('status') || 'draft',
      issue_date:      g('issue_date') || undefined,
      due_date:        g('due_date') || undefined,
      notes:           g('notes') || undefined,
    };
    setSaving(true);
    try {
      let res: any;
      if (invoice) {
        res = await adminInvoicesApi.update(invoice.id, payload);
      } else {
        res = await adminInvoicesApi.create(payload);
      }
      onSave(invoiceFromApi(res.invoice));
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
            <Receipt className="w-5 h-5 text-brand-teal" />
            {invoice ? `Modifier — ${invoice.invoice_number}` : 'Nouvelle Facture'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-grow">
          <div className="p-6 space-y-6">
            {/* Client */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du client *</label>
                <input name="client_name" className={inputClass} required
                  defaultValue={invoice?.client_name ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="client_email" type="email" className={inputClass}
                  defaultValue={invoice?.client_email ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input name="client_phone" className={inputClass}
                  defaultValue={invoice?.client_phone ?? ''} />
              </div>
              <div>
                <label className={labelClass}>Adresse</label>
                <input name="client_address" className={inputClass}
                  defaultValue={invoice?.client_address ?? ''} />
              </div>
            </div>

            {/* Line items */}
            <div>
              <label className={labelClass}>Lignes de facturation *</label>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase px-1">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-right">Qté</span>
                  <span className="col-span-3 text-right">Prix unit.</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className={`${inputClass} col-span-5 text-xs`}
                      placeholder="Description de la prestation"
                      value={item.label}
                      onChange={e => updateItem(i, 'label', e.target.value)}
                    />
                    <input
                      className={`${inputClass} col-span-2 text-xs text-right`}
                      type="number" min="0" step="0.01"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                    />
                    <input
                      className={`${inputClass} col-span-3 text-xs text-right`}
                      type="number" min="0" step="0.01"
                      value={item.unit_price}
                      onChange={e => updateItem(i, 'unit_price', e.target.value)}
                    />
                    <div className="col-span-1 text-right text-xs font-bold text-brand-navy dark:text-white">
                      {fmtAmount(item.line_total)}
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))}
                        className="col-span-1 p-1 text-red-400 hover:text-red-600 flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button"
                  onClick={() => setItems([...items, { label: '', quantity: 1, unit_price: 0, tax_rate: 20, line_total: 0 }])}
                  className="text-xs font-bold text-brand-blue hover:text-brand-navy dark:hover:text-white flex items-center gap-1 mt-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>TVA (%)</label>
                  <input type="number" min="0" max="100" step="0.01" className={inputClass}
                    value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelClass}>Remise (MAD)</label>
                  <input type="number" min="0" step="0.01" className={inputClass}
                    value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                {[
                  { label: 'Sous-total HT', value: fmtAmount(subtotal) },
                  ...(discount > 0 ? [{ label: 'Remise', value: `- ${fmtAmount(discount)}` }] : []),
                  { label: `TVA (${taxRate}%)`, value: fmtAmount(taxAmount) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                    <span className="font-bold text-brand-navy dark:text-white">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                  <span className="text-sm font-black text-brand-navy dark:text-white">TOTAL TTC</span>
                  <span className="text-sm font-black text-brand-teal">{fmtAmount(total)}</span>
                </div>
              </div>
            </div>

            {/* Status, dates, payment */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" className={inputClass} defaultValue={invoice?.status ?? 'draft'}>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date d'émission</label>
                <input name="issue_date" type="date" className={inputClass}
                  defaultValue={invoice?.issue_date ?? new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <label className={labelClass}>Date d'échéance</label>
                <input name="due_date" type="date" className={inputClass}
                  defaultValue={invoice?.due_date ?? ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mode de paiement</label>
                <select name="payment_method" className={inputClass} defaultValue={invoice?.payment_method ?? ''}>
                  <option value="">—</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="check">Chèque</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={2} className={inputClass}
                  defaultValue={invoice?.notes ?? ''} placeholder="Informations complémentaires..." />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-brand-teal text-white rounded-xl hover:bg-brand-teal/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {invoice ? 'Mettre à jour' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────

const InvoiceDetail: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onMarkPaid: () => void;
}> = ({ invoice, onClose, onEdit, onMarkPaid }) => {
  const handleDownloadPdf = async () => {
    const token = localStorage.getItem('auth_token');
    const base  = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    try {
      const res = await fetch(`${base}/admin/invoices/${invoice.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `facture-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('PDF download failed', err);
      alert('Erreur lors du téléchargement du PDF.');
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
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Facture</p>
            <h3 className="text-lg font-bold text-brand-navy dark:text-white font-space">{invoice.invoice_number}</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-grow p-6 space-y-5">
          {/* Client */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Client</p>
            <p className="font-bold text-brand-navy dark:text-white">{invoice.client_name}</p>
            {invoice.client_email && <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.client_email}</p>}
            {invoice.client_phone && <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.client_phone}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Émission</p>
              <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">{fmtDate(invoice.issue_date ?? invoice.created_at)}</p>
            </div>
            {invoice.due_date && (
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Échéance</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">{fmtDate(invoice.due_date)}</p>
              </div>
            )}
            {invoice.paid_at && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Payée le</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white mt-1">{fmtDate(invoice.paid_at)}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Lignes de facturation</p>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="px-4 py-2 text-left text-[11px] font-bold text-slate-400 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-slate-400 uppercase">Qté</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-slate-400 uppercase">P.U.</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold text-slate-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                      <td className="px-4 py-2 text-brand-navy dark:text-white">{item.label}</td>
                      <td className="px-4 py-2 text-right text-slate-500 dark:text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-slate-500 dark:text-slate-400">{fmtAmount(item.unit_price)}</td>
                      <td className="px-4 py-2 text-right font-bold text-brand-navy dark:text-white">{fmtAmount(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Sous-total HT</span>
                <span className="font-bold text-brand-navy dark:text-white">{fmtAmount(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Remise</span>
                  <span className="font-bold text-red-600">- {fmtAmount(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">TVA ({invoice.tax_rate}%)</span>
                <span className="font-bold text-brand-navy dark:text-white">{fmtAmount(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                <span className="font-black text-brand-navy dark:text-white">TOTAL TTC</span>
                <span className="font-black text-brand-teal text-lg">{fmtAmount(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          {invoice.payment_method && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Paiement reçu</p>
                <p className="text-sm font-bold text-brand-navy dark:text-white">
                  {PAYMENT_LABELS[invoice.payment_method] ?? invoice.payment_method}
                  {invoice.paid_at && ` · ${fmtDate(invoice.paid_at)}`}
                </p>
              </div>
            </div>
          )}

          {invoice.contract && (
            <div className="text-xs text-slate-400">
              Réf. Contrat : <span className="font-bold text-brand-blue">{invoice.contract.contract_number}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex gap-2 flex-wrap flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <button onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy dark:bg-white/10 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> PDF
          </button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button onClick={onMarkPaid}
              className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
              <CheckCircle2 className="w-4 h-4" /> Marquer Payée
            </button>
          )}
          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Edit className="w-4 h-4" /> Modifier
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── InvoiceManagement ────────────────────────────────────────────────────────

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm]     = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<Invoice | null>(null);

  const load = () => {
    setLoading(true);
    adminInvoicesApi.list({ per_page: 200 })
      .then((res: any) => setInvoices((res.data ?? []).map((i: any) => invoiceFromApi(i))))
      .catch(err => console.error('[Invoices] Failed to load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    try {
      await adminInvoicesApi.delete(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleMarkPaid = async (invoice: Invoice, method: string) => {
    try {
      const res: any = await adminInvoicesApi.markPaid(invoice.id, method);
      const updated = invoiceFromApi(res.invoice);
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      setMarkPaidInvoice(null);
      setViewInvoice(null);
    } catch (err: any) {
      alert(err?.message ?? 'Erreur.');
    }
  };

  const filtered = useMemo(() => invoices.filter(inv => {
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }), [invoices, search, statusFilter]);

  // Financial stats
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Revenus encaissés
          </p>
          <p className="text-xl font-black text-green-700 dark:text-green-400 mt-1">{fmtAmount(totalRevenue)}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> En attente
          </p>
          <p className="text-xl font-black text-yellow-700 dark:text-yellow-400 mt-1">{fmtAmount(totalPending)}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> En retard ({overdueCount})
          </p>
          <p className="text-xl font-black text-red-700 dark:text-red-400 mt-1">{fmtAmount(totalOverdue)}</p>
        </div>
        <div className="bg-brand-blue/10 rounded-2xl p-4">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-wide flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Total factures
          </p>
          <p className="text-xl font-black text-brand-blue mt-1">{invoices.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent focus:border-brand-blue/50 focus:outline-none text-sm text-brand-navy dark:text-white placeholder-slate-400"
            placeholder="Rechercher par client, N° facture..."
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
          <option value="sent">Envoyées</option>
          <option value="paid">Payées</option>
          <option value="overdue">En retard</option>
          <option value="cancelled">Annulées</option>
        </select>
        <button onClick={load} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-blue transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setEditInvoice(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-bold hover:bg-brand-teal/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouvelle Facture
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
            <p className="text-sm">Chargement des factures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">Aucune facture trouvée</p>
            <p className="text-xs mt-1">Générez une facture depuis un contrat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  {['N° Facture', 'Client', 'Contrat', 'Émission', 'Échéance', 'Total TTC', 'Paiement', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-brand-teal">{inv.invoice_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-brand-navy dark:text-white">{inv.client_name}</p>
                      {inv.client_phone && <p className="text-xs text-slate-400">{inv.client_phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {inv.contract ? (
                        <span className="font-mono text-xs text-brand-blue">{inv.contract.contract_number}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{fmtDate(inv.issue_date ?? inv.created_at)}</td>
                    <td className="px-4 py-3">
                      {inv.due_date ? (
                        <span className={`text-xs font-bold ${
                          inv.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {fmtDate(inv.due_date)}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm text-brand-navy dark:text-white">{fmtAmount(inv.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.payment_method ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          {PAYMENT_LABELS[inv.payment_method]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button onClick={() => setMarkPaidInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Marquer payée">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => { setEditInvoice(inv); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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

      {/* Modals */}
      <AnimatePresence>
        {markPaidInvoice && (
          <MarkPaidModal
            invoice={markPaidInvoice}
            onConfirm={method => handleMarkPaid(markPaidInvoice, method)}
            onClose={() => setMarkPaidInvoice(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <InvoiceForm
            invoice={editInvoice}
            onSave={saved => {
              setInvoices(prev => {
                const idx = prev.findIndex(i => i.id === saved.id);
                return idx >= 0 ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev];
              });
            }}
            onClose={() => { setShowForm(false); setEditInvoice(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewInvoice && (
          <InvoiceDetail
            invoice={viewInvoice}
            onClose={() => setViewInvoice(null)}
            onEdit={() => { setEditInvoice(viewInvoice); setViewInvoice(null); setShowForm(true); }}
            onMarkPaid={() => setMarkPaidInvoice(viewInvoice)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceManagement;
