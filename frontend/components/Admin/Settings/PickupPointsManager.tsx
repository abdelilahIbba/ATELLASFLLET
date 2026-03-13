import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Pencil, Trash2, CheckCircle, XCircle, Loader2,
  AlertCircle, Save, X, ToggleLeft, ToggleRight, Navigation,
} from 'lucide-react';
import { adminPickupPointsApi, PickupPoint } from '../../../services/api';

const TYPE_LABELS: Record<PickupPoint['type'], string> = {
  pickup:  'Prise en charge',
  dropoff: 'Dépôt uniquement',
  both:    'Les deux',
};

const TYPE_COLORS: Record<PickupPoint['type'], string> = {
  pickup:  'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  dropoff: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  both:    'bg-green-500/10 text-green-600 border-green-500/20',
};

const empty: Omit<PickupPoint, 'id'> = {
  name: '', address: '', latitude: null, longitude: null,
  type: 'both', is_active: true, notes: null,
};

const PickupPointsManager: React.FC = () => {
  const [points,  setPoints]  = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state: null = closed, -1 = creating new, id = editing
  const [editingId, setEditingId] = useState<number | null | -1>(null);
  const [form, setForm] = useState<Omit<PickupPoint, 'id'>>(empty);

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminPickupPointsApi.list();
      setPoints(data);
    } catch {
      flash('Impossible de charger les points.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...empty });
    setEditingId(-1);
  };

  const openEdit = (p: PickupPoint) => {
    setForm({
      name: p.name, address: p.address,
      latitude: p.latitude, longitude: p.longitude,
      type: p.type, is_active: p.is_active, notes: p.notes,
    });
    setEditingId(p.id);
  };

  const closeForm = () => { setEditingId(null); setForm({ ...empty }); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      flash('Le nom et l\'adresse sont obligatoires.', true);
      return;
    }
    setSaving(true);
    try {
      if (editingId === -1) {
        const created = await adminPickupPointsApi.create(form);
        setPoints(prev => [...prev, created]);
        flash('Point créé avec succès.');
      } else if (editingId !== null) {
        const updated = await adminPickupPointsApi.update(editingId, form);
        setPoints(prev => prev.map(p => p.id === editingId ? updated : p));
        flash('Point mis à jour.');
      }
      closeForm();
    } catch {
      flash('Erreur lors de la sauvegarde.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce point de prise en charge ?')) return;
    setDeleting(id);
    try {
      await adminPickupPointsApi.destroy(id);
      setPoints(prev => prev.filter(p => p.id !== id));
      flash('Point supprimé.');
    } catch {
      flash('Erreur lors de la suppression.', true);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (p: PickupPoint) => {
    try {
      const updated = await adminPickupPointsApi.update(p.id, { is_active: !p.is_active });
      setPoints(prev => prev.map(x => x.id === p.id ? updated : x));
    } catch {
      flash('Impossible de modifier le statut.', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-blue" />
            Points de Prise en Charge & Dépôt
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les lieux disponibles que le client peut sélectionner lors de sa réservation.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Ajouter un Point
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {editingId !== null && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-brand-navy dark:text-white text-base">
                {editingId === -1 ? 'Nouveau Point' : 'Modifier le Point'}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nom du Point *</label>
                <input
                  type="text" placeholder="Ex: Agence Principale — Rabat Agdal"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value as PickupPoint['type'] }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                >
                  <option value="both">Prise en charge & Dépôt</option>
                  <option value="pickup">Prise en charge uniquement</option>
                  <option value="dropoff">Dépôt uniquement</option>
                </select>
              </div>

              {/* Address — full width */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Adresse complète *</label>
                <input
                  type="text" placeholder="Ex: 12 Avenue Mohammed V, Rabat 10000"
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              {/* Lat / Lng */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  <Navigation className="w-3 h-3 inline mr-1" />Latitude (optionnel)
                </label>
                <input
                  type="number" step="0.0000001" placeholder="34.0209"
                  value={form.latitude ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, latitude: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  <Navigation className="w-3 h-3 inline mr-1" />Longitude (optionnel)
                </label>
                <input
                  type="number" step="0.0000001" placeholder="-6.8416"
                  value={form.longitude ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, longitude: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors font-mono"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes internes</label>
                <input
                  type="text" placeholder="Horaires, instructions de stationnement..."
                  value={form.notes ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              {/* Active toggle */}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.is_active ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-white/20'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-brand-navy dark:text-white">
                  {form.is_active ? 'Point actif — visible pour les clients' : 'Point inactif — masqué pour les clients'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl text-sm font-bold uppercase tracking-wide hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId === -1 ? 'Créer le Point' : 'Sauvegarder'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Chargement des points...</span>
        </div>
      ) : points.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-brand-navy dark:text-white font-bold mb-1">Aucun point défini</p>
          <p className="text-sm text-slate-500 mb-6">Créez votre premier point de prise en charge ou de dépôt.</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-brand-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Créer le premier point
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {points.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className={`relative bg-white dark:bg-white/5 border rounded-2xl p-5 shadow-sm transition-all ${
                  p.is_active
                    ? 'border-slate-200 dark:border-white/10'
                    : 'border-slate-200 dark:border-white/5 opacity-60'
                }`}
              >
                {/* Type badge */}
                <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${TYPE_COLORS[p.type]} mb-3`}>
                  {TYPE_LABELS[p.type]}
                </span>

                <h4 className="font-bold text-brand-navy dark:text-white text-sm leading-tight mb-1">{p.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{p.address}</p>

                {(p.latitude !== null && p.longitude !== null) && (
                  <p className="text-[10px] font-mono text-slate-400 mb-3">
                    {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}
                  </p>
                )}

                {p.notes && (
                  <p className="text-[10px] text-slate-400 italic mb-3 line-clamp-1">{p.notes}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(p)}
                    title={p.is_active ? 'Désactiver' : 'Activer'}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
                  >
                    {p.is_active
                      ? <ToggleRight className="w-4 h-4 text-brand-blue" />
                      : <ToggleLeft  className="w-4 h-4 text-slate-400" />}
                    {p.is_active ? 'Actif' : 'Inactif'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deleting === p.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PickupPointsManager;
