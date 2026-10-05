import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Search, Edit, Trash2, Power, Mail, X, Save,
  Loader2, Lock, ScrollText, Eye, ArrowUpCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  userManagementApi, clientAccountsApi, rolesApi, auditLogApi,
  ManagedUser, ClientAccount, ClientBooking, RoleRecord, RolePayload,
  PermissionCatalogResponse, AuditLogEntry, StaffUserPayload,
} from '../../../services/api';

type SubTab = 'staff' | 'clients' | 'roles' | 'audit';

const card = 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl';
const input = 'w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue dark:text-white';
const label = 'block text-xs font-bold text-slate-500 uppercase mb-2';
const btnPrimary = 'flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50';
const btnGhost = 'p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 disabled:opacity-40';

const errMsg = (e: unknown): string => {
  const err = e as { status?: number; message?: string; errors?: Record<string, string[]> };
  if (err?.status === 403) return 'Accès refusé : vous n\'avez pas la permission pour cette action.';
  if (err?.errors) return Object.values(err.errors).flat().join(' ');
  return err?.message || 'Une erreur est survenue.';
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

const Pager: React.FC<{ page: number; last: number; onChange: (p: number) => void }> = ({ page, last, onChange }) =>
  last > 1 ? (
    <div className="flex items-center justify-end gap-2 mt-4 text-sm text-slate-500">
      <button className={btnGhost} disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button>
      <span>{page} / {last}</span>
      <button className={btnGhost} disabled={page >= last} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button>
    </div>
  ) : null;

const Banner: React.FC<{ kind: 'error' | 'success'; text: string; onClose: () => void }> = ({ kind, text, onClose }) => (
  <div className={`flex items-start justify-between gap-3 p-3 mb-4 rounded-lg text-sm ${kind === 'error'
    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
    : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
    <span>{text}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className={`bg-white dark:bg-brand-navy w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-navy dark:text-white">{title}</h3>
        <button className={btnGhost} onClick={onClose}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

/* ───────────────────────── Staff users ───────────────────────── */

const StaffUsers: React.FC<{ roles: RoleRecord[] }> = ({ roles }) => {
  const [rows, setRows] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<ManagedUser | null | 'new'>(null);
  const [form, setForm] = useState<StaffUserPayload>({ name: '', email: '', phone: '', password: '', role_id: 0 });
  const [saving, setSaving] = useState(false);

  const staffRoles = useMemo(() => roles.filter(r => r.slug !== 'client'), [roles]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userManagementApi.list({ search, role_id: roleId, is_active: active, page, per_page: 15 });
      setRows(res.data);
      setLast(res.meta?.last_page ?? 1);
      setError('');
    } catch (e) { setError(errMsg(e)); setRows([]); }
    finally { setLoading(false); }
  }, [search, roleId, active, page]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const openNew = () => {
    setForm({ name: '', email: '', phone: '', password: '', role_id: staffRoles[0]?.id ?? 0 });
    setEditing('new');
  };
  const openEdit = (u: ManagedUser) => {
    setForm({ name: u.name, email: u.email, phone: u.phone ?? '', password: '', role_id: u.role_id ?? 0 });
    setEditing(u);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: StaffUserPayload = { ...form, role_id: Number(form.role_id) };
      if (!payload.password) delete payload.password;
      if (editing === 'new') {
        const res = await userManagementApi.create(payload);
        setSuccess(res.reset_link_sent
          ? 'Utilisateur créé. Un lien pour définir le mot de passe a été envoyé par e-mail.'
          : 'Utilisateur créé.');
      } else if (editing) {
        await userManagementApi.update(editing.id, payload);
        setSuccess('Utilisateur mis à jour.');
      }
      setEditing(null);
      load();
    } catch (e) { setError(errMsg(e)); }
    finally { setSaving(false); }
  };

  const act = async (fn: () => Promise<unknown>, ok: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try { await fn(); setSuccess(ok); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className={card}>
      {error && <Banner kind="error" text={error} onClose={() => setError('')} />}
      {success && <Banner kind="success" text={success} onClose={() => setSuccess('')} />}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Rechercher (nom, e-mail, téléphone)…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className={`${input} w-auto`} value={roleId} onChange={e => { setRoleId(e.target.value); setPage(1); }}>
          <option value="">Tous les roles</option>
          {staffRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className={`${input} w-auto`} value={active} onChange={e => { setActive(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="1">Actifs</option>
          <option value="0">Désactivés</option>
        </select>
        <button className={btnPrimary} onClick={openNew}><UserPlus size={16} /> Nouvel utilisateur</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-white/10">
              <th className="py-2 pr-3">Nom</th><th className="py-2 pr-3">E-mail</th><th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Accès admin</th><th className="py-2 pr-3">Statut</th><th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="py-6 text-center text-slate-400"><Loader2 className="inline animate-spin" size={18} /></td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">Aucun utilisateur admin.</td></tr>}
            {!loading && rows.map(u => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-white/5 dark:text-slate-200">
                <td className="py-2 pr-3 font-semibold">{u.name}{u.is_super_admin && <ShieldCheck size={14} className="inline ml-1 text-brand-blue" />}</td>
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3">{u.role_name ?? u.role}</td>
                <td className="py-2 pr-3">{u.admin_access ? 'Oui' : 'Non'}</td>
                <td className="py-2 pr-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                    {u.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button title="Modifier" className={btnGhost} onClick={() => openEdit(u)}><Edit size={15} /></button>
                  <button title="Envoyer un lien de réinitialisation" className={btnGhost}
                    onClick={() => act(() => userManagementApi.sendResetLink(u.id), 'Lien de réinitialisation envoyé.')}><Mail size={15} /></button>
                  <button title={u.is_active ? 'Désactiver' : 'Activer'} className={btnGhost}
                    onClick={() => act(() => (u.is_active ? userManagementApi.deactivate(u.id) : userManagementApi.activate(u.id)),
                      u.is_active ? 'Utilisateur désactivé.' : 'Utilisateur activé.')}><Power size={15} /></button>
                  <button title="Supprimer" className={`${btnGhost} hover:text-red-600`}
                    onClick={() => act(() => userManagementApi.remove(u.id), 'Utilisateur supprimé.', `Supprimer définitivement ${u.name} ?`)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} last={last} onChange={setPage} />

      {editing && (
        <Modal title={editing === 'new' ? 'Nouvel utilisateur admin' : `Modifier ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div><label className={label}>Nom</label><input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className={label}>E-mail</label><input type="email" className={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className={label}>Téléphone</label><input className={input} value={form.phone ?? ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div>
              <label className={label}>Role</label>
              <select className={input} value={form.role_id} onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}>
                {staffRoles.map(r => <option key={r.id} value={r.id}>{r.name}{r.admin_access ? ' (admin)' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Mot de passe {editing === 'new' ? '(optionnel)' : '(laisser vide pour ne pas changer)'}</label>
              <input type="password" autoComplete="new-password" className={input} value={form.password ?? ''}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              {editing === 'new' && <p className="text-xs text-slate-400 mt-1">Sans mot de passe, un lien pour le définir est envoyé par e-mail.</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 text-sm rounded-lg text-slate-500" onClick={() => setEditing(null)}>Annuler</button>
              <button className={btnPrimary} disabled={saving || !form.name || !form.email || !form.role_id} onClick={save}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ───────────────────────── Clients ───────────────────────── */

const Clients: React.FC<{ roles: RoleRecord[] }> = ({ roles }) => {
  const [rows, setRows] = useState<ClientAccount[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [kyc, setKyc] = useState('');
  const [hasBookings, setHasBookings] = useState('');
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detail, setDetail] = useState<{ client: ClientAccount; bookings: ClientBooking[] } | null>(null);
  const [promoteRole, setPromoteRole] = useState('');

  const staffRoles = useMemo(() => roles.filter(r => r.slug !== 'client'), [roles]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientAccountsApi.list({ search, kyc_status: kyc, has_bookings: hasBookings, is_active: active, page, per_page: 15 });
      setRows(res.data);
      setLast(res.meta?.last_page ?? 1);
      setTotal(res.meta?.total ?? res.data.length);
      setError('');
    } catch (e) { setError(errMsg(e)); setRows([]); }
    finally { setLoading(false); }
  }, [search, kyc, hasBookings, active, page]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const open = async (c: ClientAccount) => {
    try {
      const res = await clientAccountsApi.show(c.id);
      setDetail(res.data);
      setPromoteRole('');
    } catch (e) { setError(errMsg(e)); }
  };

  const promote = async () => {
    if (!detail || !promoteRole) return;
    const role = staffRoles.find(r => r.id === Number(promoteRole));
    if (!window.confirm(`Promouvoir ${detail.client.name} au role « ${role?.name} » ? Ce client deviendra un utilisateur admin/agence.`)) return;
    try {
      await clientAccountsApi.promote(detail.client.id, Number(promoteRole));
      setSuccess(`${detail.client.name} a été promu(e).`);
      setDetail(null);
      load();
    } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className={card}>
      {error && <Banner kind="error" text={error} onClose={() => setError('')} />}
      {success && <Banner kind="success" text={success} onClose={() => setSuccess('')} />}
      <p className="text-xs text-slate-500 mb-4">
        Liste alimentée automatiquement par les inscriptions et réservations sur le site. {total} client(s).
      </p>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Rechercher un client…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className={`${input} w-auto`} value={kyc} onChange={e => { setKyc(e.target.value); setPage(1); }}>
          <option value="">KYC : tous</option>
          <option value="pending">En attente</option>
          <option value="verified">Vérifié</option>
          <option value="rejected">Rejeté</option>
        </select>
        <select className={`${input} w-auto`} value={hasBookings} onChange={e => { setHasBookings(e.target.value); setPage(1); }}>
          <option value="">Réservations : toutes</option>
          <option value="1">Avec réservation</option>
          <option value="0">Sans réservation</option>
        </select>
        <select className={`${input} w-auto`} value={active} onChange={e => { setActive(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="1">Actifs</option>
          <option value="0">Désactivés</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-white/10">
              <th className="py-2 pr-3">Client</th><th className="py-2 pr-3">Téléphone</th><th className="py-2 pr-3">KYC</th>
              <th className="py-2 pr-3">Réservations</th><th className="py-2 pr-3">Total</th><th className="py-2 pr-3">Inscrit le</th><th className="py-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-6 text-center text-slate-400"><Loader2 className="inline animate-spin" size={18} /></td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-400">Aucun client.</td></tr>}
            {!loading && rows.map(c => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-white/5 dark:text-slate-200">
                <td className="py-2 pr-3"><div className="font-semibold">{c.name}</div><div className="text-xs text-slate-400">{c.email}</div></td>
                <td className="py-2 pr-3">{c.phone || '—'}</td>
                <td className="py-2 pr-3">{c.kyc_status || '—'}</td>
                <td className="py-2 pr-3">{c.bookings_count}</td>
                <td className="py-2 pr-3">{Number(c.total_spent || 0).toLocaleString('fr-FR')} MAD</td>
                <td className="py-2 pr-3">{fmtDate(c.created_at)}</td>
                <td className="py-2 text-right"><button title="Détails" className={btnGhost} onClick={() => open(c)}><Eye size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} last={last} onChange={setPage} />

      {detail && (
        <Modal title={detail.client.name} onClose={() => setDetail(null)} wide>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 dark:text-slate-200">
            <div><span className={label}>E-mail</span>{detail.client.email}</div>
            <div><span className={label}>Téléphone</span>{detail.client.phone || '—'}</div>
            <div><span className={label}>KYC</span>{detail.client.kyc_status || '—'}</div>
            <div><span className={label}>Statut</span>{detail.client.is_active ? 'Actif' : 'Désactivé'}</div>
          </div>
          <h4 className="font-bold text-brand-navy dark:text-white mb-2">Réservations</h4>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-white/10">
                  <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Véhicule</th><th className="py-2 pr-3">Du</th>
                  <th className="py-2 pr-3">Au</th><th className="py-2 pr-3">Montant</th><th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {detail.bookings.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-slate-400">Aucune réservation.</td></tr>}
                {detail.bookings.map(b => (
                  <tr key={b.id} className="border-b border-slate-100 dark:border-white/5 dark:text-slate-200">
                    <td className="py-2 pr-3">{b.id}</td>
                    <td className="py-2 pr-3">{typeof b.car === 'string' ? b.car : (b.car as { name?: string } | null | undefined)?.name ?? '—'}</td>
                    <td className="py-2 pr-3">{fmtDate(b.start_date)}</td>
                    <td className="py-2 pr-3">{fmtDate(b.end_date)}</td>
                    <td className="py-2 pr-3">{b.amount != null ? `${Number(b.amount).toLocaleString('fr-FR')} MAD` : '—'}</td>
                    <td className="py-2">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 dark:border-white/10 pt-4">
            <h4 className="font-bold text-brand-navy dark:text-white mb-2 flex items-center gap-2"><ArrowUpCircle size={16} /> Promouvoir en utilisateur admin</h4>
            <p className="text-xs text-slate-500 mb-3">Action explicite : le client obtiendra le role choisi et ses accès.</p>
            <div className="flex gap-3">
              <select className={input} value={promoteRole} onChange={e => setPromoteRole(e.target.value)}>
                <option value="">Choisir un role…</option>
                {staffRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button className={btnPrimary} disabled={!promoteRole} onClick={promote}>Promouvoir</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ───────────────────────── Roles ───────────────────────── */

const emptyRole: RolePayload = { name: '', description: '', admin_access: false, website_access: true, permissions: [] };

const Roles: React.FC<{ roles: RoleRecord[]; reload: () => void; rolesError: string }> = ({ roles, reload, rolesError }) => {
  const [catalog, setCatalog] = useState<PermissionCatalogResponse | null>(null);
  const [editing, setEditing] = useState<RoleRecord | 'new' | null>(null);
  const [form, setForm] = useState<RolePayload>(emptyRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState<RoleRecord | null>(null);
  const [reassign, setReassign] = useState('');

  useEffect(() => {
    rolesApi.catalog().then(r => setCatalog(r.data)).catch(e => setError(errMsg(e)));
  }, []);

  const granted = useMemo(() => new Set(catalog?.granted ?? []), [catalog]);
  const perms = useMemo(() => new Set(form.permissions), [form.permissions]);

  const toggle = (key: string) => {
    const next = new Set(perms);
    next.has(key) ? next.delete(key) : next.add(key);
    setForm({ ...form, permissions: [...next] });
  };
  const toggleRow = (keys: string[]) => {
    const allowed = keys.filter(k => granted.has(k));
    const allOn = allowed.every(k => perms.has(k));
    const next = new Set(perms);
    allowed.forEach(k => (allOn ? next.delete(k) : next.add(k)));
    setForm({ ...form, permissions: [...next] });
  };

  const openNew = () => { setForm(emptyRole); setEditing('new'); };
  const openEdit = (r: RoleRecord) => {
    setForm({ name: r.name, description: r.description ?? '', admin_access: r.admin_access, website_access: r.website_access, permissions: [...r.permissions] });
    setEditing(r);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await rolesApi.create(form);
      else if (editing) await rolesApi.update(editing.id, form);
      setSuccess(editing === 'new' ? 'Role créé.' : 'Role mis à jour.');
      setEditing(null);
      reload();
    } catch (e) { setError(errMsg(e)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await rolesApi.remove(deleting.id, reassign ? Number(reassign) : undefined);
      setSuccess('Role supprimé.');
      setDeleting(null);
      reload();
    } catch (e) { setError(errMsg(e)); }
  };

  const isSuperAdminRole = editing !== 'new' && editing?.slug === 'super-admin';

  return (
    <div className={card}>
      {(error || rolesError) && <Banner kind="error" text={error || rolesError} onClose={() => setError('')} />}
      {success && <Banner kind="success" text={success} onClose={() => setSuccess('')} />}
      <div className="flex justify-end mb-4">
        <button className={btnPrimary} onClick={openNew}><Shield size={16} /> Nouveau role</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {roles.map(r => (
          <div key={r.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-brand-navy dark:text-white flex items-center gap-2">
                  {r.name}{r.is_protected && <Lock size={13} className="text-amber-500" />}
                </div>
                <div className="text-xs text-slate-400">{r.slug}</div>
              </div>
              <div className="flex">
                <button title="Modifier" className={btnGhost} onClick={() => openEdit(r)}><Edit size={15} /></button>
                <button title={r.is_protected ? 'Role protégé' : 'Supprimer'} className={`${btnGhost} hover:text-red-600`} disabled={r.is_protected}
                  onClick={() => { setDeleting(r); setReassign(''); }}><Trash2 size={15} /></button>
              </div>
            </div>
            {r.description && <p className="text-xs text-slate-500 mt-2">{r.description}</p>}
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${r.admin_access ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-200 text-slate-500 dark:bg-white/10'}`}>
                Admin : {r.admin_access ? 'oui' : 'non'}</span>
              <span className={`px-2 py-0.5 rounded-full ${r.website_access ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-200 text-slate-500 dark:bg-white/10'}`}>
                Site : {r.website_access ? 'oui' : 'non'}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {r.users_count} utilisateur(s)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {r.permissions.length} permission(s)</span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Nouveau role' : `Modifier le role ${editing.name}`} onClose={() => setEditing(null)} wide>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div><label className={label}>Nom</label><input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className={label}>Description</label><input className={input} value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="flex flex-wrap gap-6 mb-6 text-sm dark:text-slate-200">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.admin_access} disabled={isSuperAdminRole}
                onChange={e => setForm({ ...form, admin_access: e.target.checked })} /> Accès au panneau admin
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.website_access}
                onChange={e => setForm({ ...form, website_access: e.target.checked })} /> Accès au site (client)
            </label>
          </div>
          {isSuperAdminRole && <p className="text-xs text-amber-600 mb-4">Le role Super Admin a toujours toutes les permissions.</p>}

          {catalog && !isSuperAdminRole && (
            <>
              <h4 className="font-bold text-brand-navy dark:text-white mb-2">Permissions admin (par page et action)</h4>
              <div className={`overflow-x-auto mb-6 ${form.admin_access ? '' : 'opacity-50 pointer-events-none'}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-white/10">
                      <th className="py-2 pr-3">Page</th>
                      {catalog.actions.map(a => <th key={a} className="py-2 px-2 text-center">{a}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.admin.map(p => (
                      <tr key={p.slug} className="border-b border-slate-100 dark:border-white/5 dark:text-slate-200">
                        <td className="py-1.5 pr-3">
                          <button className="hover:text-brand-blue text-left" onClick={() => toggleRow(p.actions.map(a => a.key))}>{p.label}</button>
                        </td>
                        {catalog.actions.map(a => {
                          const entry = p.actions.find(x => x.action === a);
                          return (
                            <td key={a} className="py-1.5 px-2 text-center">
                              {entry ? (
                                <input type="checkbox" checked={perms.has(entry.key)} disabled={!granted.has(entry.key)}
                                  title={granted.has(entry.key) ? entry.key : 'Vous ne possédez pas cette permission'}
                                  onChange={() => toggle(entry.key)} />
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="font-bold text-brand-navy dark:text-white mb-2">Permissions site</h4>
              <div className={`grid md:grid-cols-2 gap-2 mb-6 text-sm dark:text-slate-200 ${form.website_access ? '' : 'opacity-50 pointer-events-none'}`}>
                {catalog.website.map(w => (
                  <label key={w.key} className="flex items-center gap-2">
                    <input type="checkbox" checked={perms.has(w.key)} disabled={!granted.has(w.key)} onChange={() => toggle(w.key)} /> {w.label}
                  </label>
                ))}
              </div>
            </>
          )}
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 text-sm rounded-lg text-slate-500" onClick={() => setEditing(null)}>Annuler</button>
            <button className={btnPrimary} disabled={saving || !form.name} onClick={save}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title={`Supprimer le role ${deleting.name}`} onClose={() => setDeleting(null)}>
          {deleting.users_count > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                {deleting.users_count} utilisateur(s) ont ce role. Choisissez le role à leur réattribuer :
              </p>
              <select className={input} value={reassign} onChange={e => setReassign(e.target.value)}>
                <option value="">Choisir un role…</option>
                {roles.filter(r => r.id !== deleting.id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          ) : <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Cette action est irréversible.</p>}
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 text-sm rounded-lg text-slate-500" onClick={() => setDeleting(null)}>Annuler</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
              disabled={deleting.users_count > 0 && !reassign} onClick={confirmDelete}>Supprimer</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ───────────────────────── Audit log ───────────────────────── */

const AuditLog: React.FC = () => {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogApi.list({ search, action, page, per_page: 20 });
      setRows(res.data);
      setLast(res.meta?.last_page ?? 1);
      setError('');
    } catch (e) { setError(errMsg(e)); setRows([]); }
    finally { setLoading(false); }
  }, [search, action, page]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div className={card}>
      {error && <Banner kind="error" text={error} onClose={() => setError('')} />}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Rechercher…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <input className={`${input} w-56`} placeholder="Action (ex. user.created)" value={action} onChange={e => { setAction(e.target.value); setPage(1); }} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-white/10">
              <th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Auteur</th><th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">Cible</th><th className="py-2 pr-3">Détails</th><th className="py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="py-6 text-center text-slate-400"><Loader2 className="inline animate-spin" size={18} /></td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">Aucune entrée.</td></tr>}
            {!loading && rows.map(l => (
              <tr key={l.id} className="border-b border-slate-100 dark:border-white/5 dark:text-slate-200 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-2 pr-3">{l.actor?.name ?? 'Système'}</td>
                <td className="py-2 pr-3 font-mono text-xs">{l.action}</td>
                <td className="py-2 pr-3">{l.target_type ? `${l.target_type.split('\\').pop()} #${l.target_id}` : '—'}</td>
                <td className="py-2 pr-3 text-xs text-slate-500 max-w-xs break-words">{l.meta ? JSON.stringify(l.meta) : '—'}</td>
                <td className="py-2 text-xs">{l.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} last={last} onChange={setPage} />
    </div>
  );
};

/* ───────────────────────── Container ───────────────────────── */

const UserManagement: React.FC = () => {
  const [tab, setTab] = useState<SubTab>('staff');
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [rolesError, setRolesError] = useState('');

  const loadRoles = useCallback(() => {
    rolesApi.list().then(r => { setRoles(r.data); setRolesError(''); }).catch(e => setRolesError(errMsg(e)));
  }, []);
  useEffect(loadRoles, [loadRoles]);

  const tabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: 'staff', label: 'Utilisateurs admin', icon: Users },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'audit', label: "Journal d'audit", icon: ScrollText },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-brand-navy dark:text-white">Gestion des utilisateurs</h2>
        <p className="text-sm text-slate-500">Utilisateurs admin / agence, clients du site, roles et permissions.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t.id
              ? 'bg-brand-blue text-white shadow-md'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'staff' && <StaffUsers roles={roles} />}
      {tab === 'clients' && <Clients roles={roles} />}
      {tab === 'roles' && <Roles roles={roles} reload={loadRoles} rolesError={rolesError} />}
      {tab === 'audit' && <AuditLog />}
    </div>
  );
};

export default UserManagement;
