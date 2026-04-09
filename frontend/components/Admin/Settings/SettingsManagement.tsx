import React, { useState, useEffect, useRef } from 'react';
import RoleManagement from './RoleManagement';
import PickupPointsManager from './PickupPointsManager';
import { adminSettingsApi, adminDemoApi, DemoAccountResource } from '../../../services/api';
import {
  COMPANY_SETTINGS_KEY,
  DEFAULT_COMPANY_SETTINGS,
  ContractCompanySettings,
} from '../Contracts/ContractModal';
import { 
  Save, 
  Bell, 
  Shield, 
  Building, 
  Globe, 
  Mail, 
  Lock, 
  Server,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Trash2,
  Clock,
  Copy,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Send,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ClipboardCheck,
  FileText,
  Phone,
  X,
  Plus,
  CalendarDays,
  ShieldCheck,
  Edit3,
  TimerReset,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

interface DemoAccount {
  id: number | string;
  clientName: string;
  email: string;
  plan: string;
  expiresAt: string;
  daysLeft: number;
  status: 'Active' | 'Expired';
  accessKey: string;
  permissions: string[];
}

interface SettingsManagementProps {
  activeTab: 'general' | 'notifications' | 'security' | 'team' | 'demo' | 'roles' | 'pickup-points' | 'contracts';
  onTabChange: (tab: 'general' | 'notifications' | 'security' | 'team' | 'demo' | 'roles' | 'pickup-points' | 'contracts') => void;
}

// All modules available for demo access
const DEMO_MODULES = [
  { id: 'overview',     label: 'Tableau de Bord' },
  { id: 'analytics',   label: 'Analytique & Rapports' },
  { id: 'fleet',       label: 'Flotte & Inventaire' },
  { id: 'bookings',    label: 'Réservations' },
  { id: 'contracts',   label: 'Contrats & Factures' },
  { id: 'clients',     label: 'Clients (KYC)' },
  { id: 'expenses',    label: 'Dépenses Agence' },
  { id: 'messages',    label: 'Messagerie' },
  { id: 'gps',         label: 'Suivi GPS' },
  { id: 'infractions', label: 'Infractions' },
  { id: 'reviews',     label: 'Avis & Réputation' },
  { id: 'blog',        label: 'Blog & Contenu' },
];

const SettingsManagement: React.FC<SettingsManagementProps> = ({ activeTab, onTabChange }) => {
  const [loading, setLoading] = useState(false);
  const [modelInputType, setModelInputType] = useState<'url' | 'upload'>('url');

  // ─── Contract / Company settings ────────────────────────────────────────
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [contractSettings, setContractSettings] = useState<ContractCompanySettings>(() => {
    try {
      const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
      return raw ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) } : DEFAULT_COMPANY_SETTINGS;
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  });
  const [contractSaved, setContractSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setContractSettings(prev => ({ ...prev, logo: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveContractSettings = () => {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(contractSettings));
    setContractSaved(true);
    setTimeout(() => setContractSaved(false), 3000);
  };

  // ─── Notification / email settings ─────────────────────────────────────
  const [notifSettings, setNotifSettings] = useState({
    notifications_reply_email_enabled:      '1' as string,
    notifications_mail_from_address:        'contact@atellasfleet.ma',
    notifications_mail_from_name:           'Atellas Fleet',
    notifications_new_contact_admin_alert:  '1' as string,
    notifications_new_booking_alert:        '1' as string,
  });
  const [notifLoading, setNotifLoading]   = useState(false);
  const [notifSaving,  setNotifSaving]    = useState(false);
  const [notifSaved,   setNotifSaved]     = useState(false);
  const [notifError,   setNotifError]     = useState<string | null>(null);
  const [testSending,  setTestSending]    = useState(false);
  const [testResult,   setTestResult]     = useState<'ok' | 'err' | null>(null);

  // Load notification settings when the notifications tab is active
  useEffect(() => {
    if (activeTab !== 'notifications') return;
    setNotifLoading(true);
    adminSettingsApi.get()
      .then((res: any) => {
        const s = res.settings ?? {};
        setNotifSettings(prev => ({
          ...prev,
          notifications_reply_email_enabled:     s.notifications_reply_email_enabled     ?? prev.notifications_reply_email_enabled,
          notifications_mail_from_address:       s.notifications_mail_from_address       ?? prev.notifications_mail_from_address,
          notifications_mail_from_name:          s.notifications_mail_from_name          ?? prev.notifications_mail_from_name,
          notifications_new_contact_admin_alert: s.notifications_new_contact_admin_alert ?? prev.notifications_new_contact_admin_alert,
          notifications_new_booking_alert:       s.notifications_new_booking_alert       ?? prev.notifications_new_booking_alert,
        }));
      })
      .catch(() => setNotifError('Impossible de charger les paramètres.'))
      .finally(() => setNotifLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSaveNotifSettings = async () => {
    setNotifSaving(true);
    setNotifError(null);
    setNotifSaved(false);
    try {
      await adminSettingsApi.update(notifSettings as any);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } catch {
      setNotifError('Erreur lors de la sauvegarde.');
    } finally {
      setNotifSaving(false);
    }
  };

  // ─── Generic settings toggle helper ────────────────────────────────────
  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: prev[key] === '1' ? '0' : '1' }));
  };
  
  // --- TEAM STATE ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Yassine O.', email: 'admin@atellas.ma', role: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Sarah K.', email: 'support@atellas.ma', role: 'Support Agent', status: 'Active' },
    { id: '3', name: 'Karim B.', email: 'fleet@atellas.ma', role: 'Fleet Manager', status: 'Inactive' },
  ]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Support Agent' });

  // --- DEMO ACCOUNTS STATE ---
  const [demoAccounts,  setDemoAccounts]  = useState<DemoAccount[]>([]);
  const [demoLoading,   setDemoLoading]   = useState(false);
  const [demoError,     setDemoError]     = useState<string | null>(null);
  const [demoCreating,  setDemoCreating]  = useState(false);
  const [demoSuccess,   setDemoSuccess]   = useState<string | null>(null);
  const [resendingId,   setResendingId]   = useState<number | string | null>(null);
  const [copiedId,      setCopiedId]      = useState<number | string | null>(null);
  const [showDemoForm,  setShowDemoForm]  = useState(false);
  const [newDemo,       setNewDemo]       = useState({ clientName: '', email: '', duration: '14', customDuration: '', permissions: ['overview', 'fleet', 'bookings', 'clients', 'contracts', 'analytics'] });
  // Trial period presets (stored in localStorage)
  const [trialPresets,    setTrialPresets]    = useState<number[]>(() => {
    try { const r = localStorage.getItem('demo_trial_presets'); return r ? JSON.parse(r) : [3, 7, 14, 30]; }
    catch { return [3, 7, 14, 30]; }
  });
  const [newPresetInput,  setNewPresetInput]  = useState('');
  // Extend period
  const [extendingId,     setExtendingId]     = useState<number | string | null>(null);
  const [extendDays,      setExtendDays]      = useState(7);
  const [extendLoading,   setExtendLoading]   = useState(false);
  // Edit permissions
  const [editPermsId,     setEditPermsId]     = useState<number | string | null>(null);
  const [editPerms,       setEditPerms]       = useState<string[]>([]);
  const [editPermsLoading,setEditPermsLoading]= useState(false);

  // Load demo accounts when tab becomes active
  useEffect(() => {
    if (activeTab !== 'demo') return;
    setDemoLoading(true);
    setDemoError(null);
    adminDemoApi.list()
      .then((res: any) => setDemoAccounts(res.data ?? []))
      .catch(() => setDemoError('Impossible de charger les comptes démo.'))
      .finally(() => setDemoLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'Pending'
    };
    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', email: '', role: 'Support Agent' });
    setShowInviteForm(false);
  };

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoCreating(true);
    setDemoError(null);
    setDemoSuccess(null);
    const dur = newDemo.duration === 'custom' ? parseInt(newDemo.customDuration) : parseInt(newDemo.duration);
    if (!dur || dur < 1) { setDemoError('Durée invalide.'); setDemoCreating(false); return; }
    try {
      const res: any = await adminDemoApi.create({
        client_name: newDemo.clientName,
        email:       newDemo.email,
        duration:    dur,
        permissions: newDemo.permissions,
      });
      setDemoAccounts(prev => [res.data, ...prev]);
      setNewDemo({ clientName: '', email: '', duration: '14', customDuration: '', permissions: ['overview', 'fleet', 'bookings', 'clients', 'contracts', 'analytics'] });
      setShowDemoForm(false);
      setDemoSuccess('Compte démo créé — identifiants envoyés par email ✓');
      setTimeout(() => setDemoSuccess(null), 5000);
    } catch (err: any) {
      setDemoError(err?.message ?? 'Erreur lors de la création du compte démo.');
    } finally {
      setDemoCreating(false);
    }
  };

  const handleAddTrialPreset = () => {
    const n = parseInt(newPresetInput);
    if (!n || n < 1 || n > 365 || trialPresets.includes(n)) return;
    const updated = [...trialPresets, n].sort((a, b) => a - b);
    setTrialPresets(updated);
    localStorage.setItem('demo_trial_presets', JSON.stringify(updated));
    setNewPresetInput('');
  };

  const handleRemoveTrialPreset = (days: number) => {
    const updated = trialPresets.filter(p => p !== days);
    setTrialPresets(updated);
    localStorage.setItem('demo_trial_presets', JSON.stringify(updated));
  };

  const handleExtendDemo = async (id: number | string) => {
    setExtendLoading(true);
    try {
      const res: any = await adminDemoApi.extend(id, extendDays);
      setDemoAccounts(prev => prev.map(d => d.id === id ? res.data : d));
      setExtendingId(null);
      setDemoSuccess(`Période prolongée de ${extendDays} jour(s) ✓`);
      setTimeout(() => setDemoSuccess(null), 4000);
    } catch {
      setDemoError("Erreur lors de l'extension.");
    } finally {
      setExtendLoading(false);
    }
  };

  const handleUpdatePermissions = async (id: number | string) => {
    if (editPerms.length === 0) { setDemoError('Sélectionnez au moins un module.'); return; }
    setEditPermsLoading(true);
    try {
      const res: any = await adminDemoApi.updatePermissions(id, editPerms);
      setDemoAccounts(prev => prev.map(d => d.id === id ? res.data : d));
      setEditPermsId(null);
      setDemoSuccess('Permissions mises à jour ✓');
      setTimeout(() => setDemoSuccess(null), 4000);
    } catch {
      setDemoError('Erreur lors de la mise à jour des permissions.');
    } finally {
      setEditPermsLoading(false);
    }
  };

  const togglePermission = (moduleId: string, currentPerms: string[], setter: (p: string[]) => void) => {
    setter(currentPerms.includes(moduleId)
      ? currentPerms.filter(p => p !== moduleId)
      : [...currentPerms, moduleId]
    );
  };

  const handleDeleteDemo = async (id: number | string) => {
    try {
      await adminDemoApi.delete(id);
      setDemoAccounts(prev => prev.filter(d => d.id !== id));
    } catch {
      setDemoError('Impossible de supprimer ce compte démo.');
    }
  };

  const handleResendDemo = async (id: number | string) => {
    setResendingId(id);
    try {
      await adminDemoApi.resend(id);
      setDemoSuccess('Email renvoyé avec succès ✓');
      setTimeout(() => setDemoSuccess(null), 4000);
    } catch {
      setDemoError('Erreur lors du renvoi de l\'email.');
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyDemoCredentials = (account: DemoAccount) => {
    const text = [
      `Bonjour ${account.clientName},`,
      ``,
      `Voici votre accès démo au tableau de bord AtellasFleet :`,
      ``,
      `  URL            : ${window.location.origin}/login`,
      `  Onglet login   : Admin / Gérant`,
      `  Email          : ${account.email}`,
      `  Mot de passe   : ${account.accessKey}`,
      ``,
      `Plan : ${account.plan}  |  Expire le : ${account.expiresAt}`,
      ``,
      `⚠️ Important : sur la page de connexion, sélectionnez l'onglet « Admin / Gérant » avant de saisir vos identifiants.`,
      ``,
      `Cordialement,`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Paramètres Système</h2>
          <p className="text-xs text-slate-500 mt-1">Gérer les configurations globales et les préférences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold uppercase flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              {[
                { id: 'general', label: 'Général & Marque', icon: Building },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Sécurité & Accès', icon: Shield },
                { id: 'roles', label: 'Rôles & Permissions', icon: Lock },
                { id: 'team', label: "Gestion d'Équipe", icon: UserPlus },
                { id: 'demo', label: 'Accès Démo', icon: Clock },
                { id: 'pickup-points', label: 'Points de Prise en Charge', icon: MapPin },
                { id: 'contracts', label: 'Contrats & Logo', icon: FileText },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? 'bg-brand-blue text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-navy dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Détails de l'Établissement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom de la Société</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" defaultValue="Atellas Fleet Inc." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Support</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="email" defaultValue="support@atellas.ma" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Paramètres Régionaux</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Devise</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors">
                        <option>Dirham Marocain (MAD)</option>
                        <option>Dollar Américain (USD)</option>
                        <option>Euro (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fuseau Horaire</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors">
                          <option>Casablanca (GMT+1)</option>
                          <option>Londres (GMT+0)</option>
                          <option>Paris (GMT+1)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Loading state */}
                {notifLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                    <span className="ml-2 text-sm text-slate-500">Chargement des paramètres…</span>
                  </div>
                )}

                {/* Error banner */}
                {notifError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                    {notifError}
                  </div>
                )}

                {/* Success banner */}
                {notifSaved && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl p-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Paramètres sauvegardés avec succès.
                  </div>
                )}

                {!notifLoading && (
                  <>
                    {/* SMTP info box */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 h-fit">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy dark:text-white text-sm">Configuration SMTP</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Le serveur d'envoi SMTP est configuré via les variables d'environnement backend (<code className="font-mono bg-slate-100 dark:bg-white/10 px-1 rounded">MAIL_HOST</code>, <code className="font-mono bg-slate-100 dark:bg-white/10 px-1 rounded">MAIL_USERNAME</code>, etc.).
                        </p>
                      </div>
                    </div>

                    {/* Section: Reply email notifications */}
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4">Réponses Messagerie</h3>
                      <div className="space-y-4">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                          <div>
                            <p className="font-bold text-sm text-brand-navy dark:text-white">Envoyer un email au client lors d'une réponse admin</p>
                            <p className="text-xs text-slate-500">Lorsqu'un admin répond dans la messagerie, le client reçoit un email.</p>
                          </div>
                          <button
                            onClick={() => toggleNotif('notifications_reply_email_enabled')}
                            className="transition-colors"
                          >
                            {notifSettings['notifications_reply_email_enabled'] === '1'
                              ? <ToggleRight className="w-8 h-8 text-brand-blue" />
                              : <ToggleRight className="w-8 h-8 text-slate-300 dark:text-slate-600" />}
                          </button>
                        </div>

                        {/* Sender fields — shown only when enabled */}
                        {notifSettings['notifications_reply_email_enabled'] === '1' && (
                          <div className="ml-4 space-y-3 border-l-2 border-brand-blue/30 pl-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Adresse email expéditeur</label>
                              <input
                                type="email"
                                value={notifSettings['notifications_mail_from_address'] ?? ''}
                                onChange={e => setNotifSettings(prev => ({ ...prev, notifications_mail_from_address: e.target.value }))}
                                placeholder="noreply@votredomaine.com"
                                className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-brand-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nom de l'expéditeur</label>
                              <input
                                type="text"
                                value={notifSettings['notifications_mail_from_name'] ?? ''}
                                onChange={e => setNotifSettings(prev => ({ ...prev, notifications_mail_from_name: e.target.value }))}
                                placeholder="Atellas Fleet"
                                className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-brand-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section: Admin alert emails */}
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4">Alertes Email Admin</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'notifications_new_contact_admin_alert', title: 'Nouveau message client', desc: 'Recevoir un email quand un client envoie un message via le formulaire de contact.' },
                          { key: 'notifications_new_booking_alert', title: 'Nouvelle demande de réservation', desc: 'Recevoir un email quand une nouvelle réservation est créée.' },
                        ].map(({ key, title, desc }) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                            <div>
                              <p className="font-bold text-sm text-brand-navy dark:text-white">{title}</p>
                              <p className="text-xs text-slate-500">{desc}</p>
                            </div>
                            <button onClick={() => toggleNotif(key)} className="transition-colors">
                              {notifSettings[key] === '1'
                                ? <ToggleRight className="w-8 h-8 text-brand-blue" />
                                : <ToggleRight className="w-8 h-8 text-slate-300 dark:text-slate-600" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveNotifSettings}
                        disabled={notifSaving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        {notifSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {notifSaving ? 'Sauvegarde…' : 'Sauvegarder les notifications'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div>
                    <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4">Mot de passe & Auth</h3>
                    <div className="max-w-md space-y-4">
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
                          <div className="text-left">
                            <p className="font-bold text-sm text-brand-navy dark:text-white">Changer Mot de Passe Admin</p>
                            <p className="text-xs text-slate-500">Changé il y a 30 jours</p>
                          </div>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                         <div className="flex items-center gap-3">
                           <Shield className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
                           <div className="text-left">
                             <p className="font-bold text-sm text-brand-navy dark:text-white">Authentification à Deux Facteurs</p>
                             <p className="text-xs text-slate-500">Actuellement Désactivé</p>
                           </div>
                         </div>
                         <ToggleLeft className="w-8 h-8 text-slate-300" />
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy dark:text-white">Gestion d'Équipe</h3>
                    <p className="text-xs text-slate-500 mt-1">Gérer le contrôle d'accès et les rôles d'équipe.</p>
                  </div>
                  <button onClick={() => setShowInviteForm(!showInviteForm)} className="px-4 py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-sm font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <UserPlus className="w-4 h-4" /> {showInviteForm ? 'Annuler' : 'Inviter Utilisateur'}
                  </button>
                </div>

                {showInviteForm && (
                  <form onSubmit={handleAddMember} className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-xl mb-6">
                    <h4 className="font-bold text-brand-navy dark:text-white text-sm mb-4">Inviter Nouveau Membre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom Complet</label>
                        <input value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse Email</label>
                        <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rôle</label>
                        <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue">
                          <option value="Admin">Admin</option>
                          <option value="Fleet Manager">Gestionnaire de Flotte</option>
                          <option value="Support Agent">Agent de Support</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold uppercase hover:bg-blue-600 transition-colors">Envoyer Invitation</button>
                    </div>
                  </form>
                )}

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white dark:bg-white/5 text-xs font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-white/5">
                      <tr>
                        <th className="p-4">Utilisateur</th>
                        <th className="p-4">Rôle</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                      {teamMembers.map((user) => (
                        <tr key={user.id} className="group hover:bg-white dark:hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-brand-navy dark:text-white">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase">{user.role}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              user.status === 'Active' ? 'text-green-600 bg-green-100' : 
                              user.status === 'Pending' ? 'text-orange-600 bg-orange-100' :
                              'text-red-600 bg-red-100'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                             {user.role !== 'Super Admin' && (
                               <button onClick={() => handleDeleteMember(user.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DEMO ACCESS TAB */}
            {activeTab === 'demo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy dark:text-white">Accès Démo & Contrôle d'Accès</h3>
                    <p className="text-xs text-slate-500 mt-1">Gérez les comptes démo, leurs droits d'accès aux modules et les périodes d'essai.</p>
                  </div>
                  <button onClick={() => setShowDemoForm(!showDemoForm)} className="px-4 py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-sm font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" /> {showDemoForm ? 'Annuler' : 'Créer Démo'}
                  </button>
                </div>

                {/* ── Trial period presets config ────────────────────────── */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-brand-navy dark:text-white mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-blue" /> Préréglages de Période d'Essai
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Choisissez les durées disponibles lors de la création d'un compte démo. Ces préréglages apparaîtront dans le formulaire de création.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trialPresets.map(days => (
                      <div key={days} className="flex items-center gap-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full px-3 py-1 text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        {days === 1 ? '1 jour' : `${days} jours`}
                        <button
                          onClick={() => handleRemoveTrialPreset(days)}
                          className="ml-1 hover:text-red-500 transition-colors"
                          title="Supprimer ce préréglage"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center max-w-xs">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={newPresetInput}
                      onChange={e => setNewPresetInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTrialPreset()}
                      placeholder="Ex: 3"
                      className="w-24 px-3 py-2 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue dark:text-white"
                    />
                    <span className="text-xs text-slate-500">jours</span>
                    <button
                      onClick={handleAddTrialPreset}
                      disabled={!newPresetInput || parseInt(newPresetInput) < 1}
                      className="flex items-center gap-1 px-3 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  </div>
                </div>

                {/* ── Banners ───────────────────────────────────────────── */}
                {demoSuccess && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />{demoSuccess}
                  </div>
                )}
                {demoError && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />{demoError}
                    <button onClick={() => setDemoError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                  </div>
                )}

                {/* ── Create form ────────────────────────────────────────── */}
                {showDemoForm && (
                  <form onSubmit={handleCreateDemo} className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-xl space-y-5">
                    <h4 className="font-bold text-brand-navy dark:text-white text-sm">Configurer Nouveau Compte Démo</h4>

                    {/* Row 1: identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client / Nom de la Société</label>
                        <input value={newDemo.clientName} onChange={e => setNewDemo({...newDemo, clientName: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse Email</label>
                        <input type="email" value={newDemo.email} onChange={e => setNewDemo({...newDemo, email: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue dark:text-white" required />
                      </div>
                    </div>

                    {/* Row 2: duration */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Durée de l'Essai</label>
                      <div className="flex flex-wrap gap-2">
                        {trialPresets.map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setNewDemo({...newDemo, duration: String(days), customDuration: ''})}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${newDemo.duration === String(days) && newDemo.duration !== 'custom' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-blue/50'}`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {days === 1 ? '1 jour' : `${days} jours`}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setNewDemo({...newDemo, duration: 'custom'})}
                          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${newDemo.duration === 'custom' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-blue/50'}`}
                        >
                          Personnalisé
                        </button>
                        {newDemo.duration === 'custom' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={365}
                              value={newDemo.customDuration}
                              onChange={e => setNewDemo({...newDemo, customDuration: e.target.value})}
                              placeholder="Nb jours"
                              className="w-24 px-3 py-2 bg-white dark:bg-white/10 border border-brand-blue rounded-lg text-sm outline-none dark:text-white"
                            />
                            <span className="text-xs text-slate-500">jours</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 3: permissions matrix */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-2">
                        <ShieldCheck className="w-3 h-3" /> Modules Accessibles par ce Compte Démo
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {DEMO_MODULES.map(mod => {
                          const checked = newDemo.permissions.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => togglePermission(mod.id, newDemo.permissions, (p) => setNewDemo({...newDemo, permissions: p}))}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${checked ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue dark:text-blue-400' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300'}`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'}`}>
                                {checked && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                              {mod.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">{newDemo.permissions.length} module(s) sélectionné(s) · La page de paramètres système n'est jamais accessible aux comptes démo.</p>
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" disabled={demoCreating} className="px-5 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold uppercase hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-60">
                        {demoCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {demoCreating ? 'Envoi en cours…' : 'Générer & Envoyer'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Loading state */}
                {demoLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                    <span className="ml-2 text-sm text-slate-500">Chargement des comptes démo…</span>
                  </div>
                )}

                {/* Empty state */}
                {!demoLoading && demoAccounts.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun compte démo créé pour l'instant.</p>
                  </div>
                )}

                {/* ── Demo account cards ─────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {demoAccounts.map((account) => {
                    const isExpired = account.status === 'Expired';
                    const isEditingPerms = editPermsId === account.id;
                    const isExtending   = extendingId  === account.id;
                    return (
                      <div key={account.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                        {/* Colored status bar */}
                        <div className={`h-1.5 w-full ${isExpired ? 'bg-red-500' : account.daysLeft <= 3 ? 'bg-amber-400' : 'bg-green-500'}`} />

                        <div className="p-5">
                          {/* Header row */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-brand-navy dark:text-white text-base">{account.clientName}</h4>
                              <p className="text-xs text-slate-500">{account.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : account.daysLeft <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                {isExpired ? 'Expiré' : `${account.daysLeft}j restants`}
                              </span>
                              <button onClick={() => handleDeleteDemo(account.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Plan + expiry */}
                          <div className="flex gap-4 mb-3 text-xs">
                            <div>
                              <p className="text-slate-400 uppercase font-bold mb-0.5">Plan</p>
                              <p className="font-mono font-bold text-brand-navy dark:text-white">{account.plan}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase font-bold mb-0.5">Expire le</p>
                              <p className="font-mono font-bold text-brand-navy dark:text-white">{account.expiresAt}</p>
                            </div>
                          </div>

                          {/* Permissions pills */}
                          {!isEditingPerms && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(account.permissions ?? []).map(pId => {
                                const mod = DEMO_MODULES.find(m => m.id === pId);
                                return mod ? (
                                  <span key={pId} className="text-[10px] font-bold bg-brand-blue/10 text-brand-blue dark:text-blue-400 px-2 py-0.5 rounded-full">
                                    {mod.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}

                          {/* ── Edit permissions panel ── */}
                          {isEditingPerms && (
                            <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-brand-blue/20 space-y-2">
                              <p className="text-xs font-bold text-brand-navy dark:text-white mb-2">Modifier les modules accessibles :</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {DEMO_MODULES.map(mod => {
                                  const checked = editPerms.includes(mod.id);
                                  return (
                                    <button
                                      key={mod.id}
                                      type="button"
                                      onClick={() => togglePermission(mod.id, editPerms, setEditPerms)}
                                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-colors ${checked ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue dark:text-blue-400' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                    >
                                      <div className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${checked ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'}`}>
                                        {checked && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                                      </div>
                                      {mod.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleUpdatePermissions(account.id)}
                                  disabled={editPermsLoading || editPerms.length === 0}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-blue-600 transition-colors"
                                >
                                  {editPermsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  Sauvegarder
                                </button>
                                <button onClick={() => setEditPermsId(null)} className="px-3 py-1.5 text-slate-500 text-xs rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── Extend period panel ── */}
                          {isExtending && (
                            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-2">
                              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">Prolonger la période d'essai :</p>
                              <div className="flex flex-wrap gap-1.5">
                                {trialPresets.map(days => (
                                  <button key={days} type="button" onClick={() => setExtendDays(days)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${extendDays === days ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-white/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 hover:border-amber-400'}`}>
                                    +{days}j
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="number" min={1} max={365} value={extendDays} onChange={e => setExtendDays(parseInt(e.target.value) || 1)} className="w-20 px-2 py-1.5 bg-white dark:bg-white/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-sm outline-none dark:text-white text-center font-bold" />
                                <span className="text-xs text-amber-700 dark:text-amber-300">jours</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleExtendDemo(account.id)} disabled={extendLoading} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-amber-600 transition-colors">
                                  {extendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TimerReset className="w-3 h-3" />}
                                  Prolonger de {extendDays}j
                                </button>
                                <button onClick={() => setExtendingId(null)} className="px-3 py-1.5 text-slate-500 text-xs rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Access key */}
                          <div className="bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer mb-3 hover:border-brand-blue/30 transition-colors" onClick={() => copyToClipboard(account.accessKey)}>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase mb-0.5 font-bold">Clé d'Accès</p>
                              <code className="text-brand-blue font-bold font-mono text-sm">{account.accessKey}</code>
                            </div>
                            <Copy className="w-4 h-4 text-slate-400 hover:text-brand-blue transition-colors" />
                          </div>

                          {/* Action buttons */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {/* Copy credentials */}
                            <button
                              onClick={() => copyDemoCredentials(account)}
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-colors ${copiedId === account.id ? 'border-green-400 text-green-600 bg-green-50' : 'border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:border-brand-blue/50 hover:text-brand-blue'}`}
                              title="Copier identifiants"
                            >
                              {copiedId === account.id ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {/* Resend email */}
                            <button
                              onClick={() => handleResendDemo(account.id)}
                              disabled={resendingId === account.id}
                              title="Renvoyer l'email"
                              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 text-xs font-bold hover:border-brand-blue/50 hover:text-brand-blue disabled:opacity-50 transition-colors"
                            >
                              {resendingId === account.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>

                            {/* Edit permissions */}
                            <button
                              onClick={() => { setEditPermsId(isEditingPerms ? null : account.id); setEditPerms(account.permissions ?? []); setExtendingId(null); }}
                              title="Modifier les permissions"
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-colors ${isEditingPerms ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue' : 'border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:border-brand-blue/50 hover:text-brand-blue'}`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Extend period */}
                            <button
                              onClick={() => { setExtendingId(isExtending ? null : account.id); setExtendDays(7); setEditPermsId(null); }}
                              title="Prolonger la période"
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-colors ${isExtending ? 'bg-amber-100 border-amber-400 text-amber-600' : 'border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600'}`}
                            >
                              <TimerReset className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RoleManagement />
              </div>
            )}

            {/* PICKUP POINTS TAB */}
            {activeTab === 'pickup-points' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PickupPointsManager />
              </div>
            )}

            {/* CONTRACTS TAB */}
            {activeTab === 'contracts' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    Logo de la Société
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Preview */}
                    <div className="w-40 h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/20 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 flex-shrink-0">
                      {contractSettings.logo ? (
                        <img
                          src={contractSettings.logo}
                          alt="logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300 dark:text-slate-600">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">Aucun logo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-slate-500">
                        Ce logo apparaîtra en haut de chaque contrat généré.
                        Taille recommandée : 400×120 px (PNG ou JPEG).
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          <UploadCloud className="w-4 h-4" /> Importer Logo
                        </button>
                        {contractSettings.logo && (
                          <button
                            type="button"
                            onClick={() => setContractSettings(prev => ({ ...prev, logo: null }))}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-500/30"
                          >
                            <X className="w-4 h-4" /> Supprimer
                          </button>
                        )}
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    Informations de la Société (en-tête du contrat)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom de la Société</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={contractSettings.name}
                          onChange={e => setContractSettings(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={contractSettings.email}
                          onChange={e => setContractSettings(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@societe.ma"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={contractSettings.address}
                          onChange={e => setContractSettings(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Casablanca, Maroc"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={contractSettings.phone}
                          onChange={e => setContractSettings(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+212 6XX XXX XXX"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ICE (Identifiant Commun de l'Entreprise)</label>
                      <input
                        type="text"
                        value={contractSettings.ice}
                        onChange={e => setContractSettings(prev => ({ ...prev, ice: e.target.value }))}
                        placeholder="000000000000000"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {contractSaved && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl text-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" /> Paramètres du contrat sauvegardés.
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                    Conditions Générales (texte du contrat)
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Ce texte apparaît dans la section "Conditions Générales" de chaque contrat imprimé. Saisissez une clause par ligne.
                  </p>
                  <textarea
                    value={contractSettings.conditionsText ?? ''}
                    onChange={e => setContractSettings(prev => ({ ...prev, conditionsText: e.target.value }))}
                    rows={8}
                    placeholder="Une clause par ligne..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-brand-blue dark:text-white resize-y leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveContractSettings}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* --- HERO 3D MODEL --- */}
            {/* Removed 3D Model Config */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;

