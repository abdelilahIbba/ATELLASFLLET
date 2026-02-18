import React, { useState } from 'react';
import RoleManagement from './RoleManagement';
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
  UploadCloud
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

interface DemoAccount {
  id: string;
  clientName: string;
  email: string;
  plan: '2 Weeks' | '1 Month' | 'Custom';
  expiresAt: string;
  status: 'Active' | 'Expired';
  accessKey: string;
}

const SettingsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'team' | 'demo' | 'roles'>('general');
  const [loading, setLoading] = useState(false);
  const [modelInputType, setModelInputType] = useState<'url' | 'upload'>('url');
  
  // --- TEAM STATE ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Yassine O.', email: 'admin@atellas.ma', role: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Sarah K.', email: 'support@atellas.ma', role: 'Support Agent', status: 'Active' },
    { id: '3', name: 'Karim B.', email: 'fleet@atellas.ma', role: 'Fleet Manager', status: 'Inactive' },
  ]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Support Agent' });

  // --- DEMO ACCOUNTS STATE ---
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([
    { id: 'D-101', clientName: 'Luxury Tours Inc.', email: 'contact@luxurytours.ma', plan: '2 Weeks', expiresAt: '2024-11-15', status: 'Active', accessKey: 'demo_8x92nm' },
  ]);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [newDemo, setNewDemo] = useState({ clientName: '', email: '', duration: '14' }); // 14 days default

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

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(newDemo.duration);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    const demo: DemoAccount = {
      id: `D-${Math.floor(Math.random() * 1000)}`,
      clientName: newDemo.clientName,
      email: newDemo.email,
      plan: days === 14 ? '2 Weeks' : days === 30 ? '1 Month' : 'Custom',
      expiresAt: expiryDate.toISOString().split('T')[0],
      status: 'Active',
      accessKey: `demo_${Math.random().toString(36).substr(2, 6)}`
    };
    setDemoAccounts([demo, ...demoAccounts]);
    setNewDemo({ clientName: '', email: '', duration: '14' });
    setShowDemoForm(false);
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleDeleteDemo = (id: string) => {
    setDemoAccounts(demoAccounts.filter(d => d.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
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
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 h-fit">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy dark:text-white text-sm">Statut Serveur Email</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Services SMTP opérationnels. Dernière vérification : il y a 2 min.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-4">Alertes Email</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Nouvelle Demande de Réservation', desc: 'Recevoir un email lors d\'une nouvelle réservation.' },
                      { title: 'Maintenance Véhicule Requise', desc: 'Être notifié 3 jours avant la maintenance.' },
                      { title: 'Expiration Document', desc: 'Résumé hebdomadaire des documents expirants.' },
                      { title: 'Confirmation de Paiement', desc: 'Copie des reçus de paiement envoyés aux clients.' },
                    ].map((setting, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <div>
                          <p className="font-bold text-sm text-brand-navy dark:text-white">{setting.title}</p>
                          <p className="text-xs text-slate-500">{setting.desc}</p>
                        </div>
                        <button className="text-brand-blue hover:text-blue-600 transition-colors">
                          <ToggleRight className="w-8 h-8" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
                <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy dark:text-white">Comptes Démo</h3>
                    <p className="text-xs text-slate-500 mt-1">Générer un accès temporaire pour les clients potentiels.</p>
                  </div>
                  <button onClick={() => setShowDemoForm(!showDemoForm)} className="px-4 py-2 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-lg text-sm font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Clock className="w-4 h-4" /> {showDemoForm ? 'Annuler' : 'Créer Démo'}
                  </button>
                </div>

                {showDemoForm && (
                  <form onSubmit={handleCreateDemo} className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-xl mb-6">
                    <h4 className="font-bold text-brand-navy dark:text-white text-sm mb-4">Configurer Nouveau Compte Démo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client / Nom de la Société</label>
                        <input value={newDemo.clientName} onChange={e => setNewDemo({...newDemo, clientName: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse Email</label>
                        <input type="email" value={newDemo.email} onChange={e => setNewDemo({...newDemo, email: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Durée de l'Essai</label>
                        <select value={newDemo.duration} onChange={e => setNewDemo({...newDemo, duration: e.target.value})} className="w-full p-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-brand-blue">
                          <option value="14">Essai 2 Semaines</option>
                          <option value="30">Essai 1 Mois</option>
                          <option value="7">7 Jours (Express)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold uppercase hover:bg-blue-600 transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Générer Compte
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoAccounts.map((account) => {
                    const isExpired = new Date(account.expiresAt) < new Date();
                    return (
                      <div key={account.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-all relative overflow-hidden group">
                        {isExpired && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1">Expiré</div>}
                        {!isExpired && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-3 py-1">Actif</div>}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-brand-navy dark:text-white text-lg">{account.clientName}</h4>
                            <p className="text-xs text-slate-500">{account.email}</p>
                          </div>
                          <button onClick={() => handleDeleteDemo(account.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                          <div>
                            <p className="text-slate-400 uppercase font-bold mb-1">Durée du Plan</p>
                            <p className="font-mono font-bold text-brand-navy dark:text-white">{account.plan}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 uppercase font-bold mb-1">Expire Le</p>
                            <p className="font-mono font-bold text-brand-navy dark:text-white">{account.expiresAt}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-slate-100 dark:border-white/5 flex items-center justify-between group-hover:border-brand-blue/30 transition-colors cursor-pointer" onClick={() => copyToClipboard(account.accessKey)}>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase mb-1 font-bold">Clé d'Accès</p>
                            <code className="text-brand-blue font-bold font-mono">{account.accessKey}</code>
                          </div>
                          <Copy className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
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

            {/* --- HERO 3D MODEL --- */}
            {/* Removed 3D Model Config */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;

