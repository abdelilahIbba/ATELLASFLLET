import React, { useState } from 'react';
import { Shield, Check, X, Edit2, Plus, Users, Save, Trash2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'Général' | 'Flotte' | 'Réservations' | 'Utilisateurs' | 'Système';
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem?: boolean;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // General
  { id: 'view_dashboard', name: 'Voir Tableau de Bord', description: 'Accès au tableau de bord principal', category: 'Général' },
  
  // Fleet
  { id: 'view_fleet', name: 'Voir Flotte', description: 'Voir l\'inventaire des véhicules', category: 'Flotte' },
  { id: 'manage_fleet', name: 'Gérer Flotte', description: 'Ajouter/Modifier/Supprimer véhicules', category: 'Flotte' },
  { id: 'manage_maintenance', name: 'Gérer Maintenance', description: 'Planifier et suivre la maintenance', category: 'Flotte' },

  // Bookings
  { id: 'view_bookings', name: 'Voir Réservations', description: 'Voir toutes les réservations', category: 'Réservations' },
  { id: 'manage_bookings', name: 'Gérer Réservations', description: 'Créer et modifier les réservations', category: 'Réservations' },
  { id: 'approve_bookings', name: 'Approuver/Rejeter', description: 'Approuver ou rejeter les demandes', category: 'Réservations' },

  // Users
  { id: 'view_clients', name: 'Voir Clients', description: 'Accès à la base de données clients', category: 'Utilisateurs' },
  { id: 'manage_clients', name: 'Gérer Clients', description: 'Modifier les profils clients et KYC', category: 'Utilisateurs' },
  { id: 'view_staff', name: 'Voir Personnel', description: 'Voir les membres de l\'équipe', category: 'Utilisateurs' },
  { id: 'manage_staff', name: 'Gérer Personnel', description: 'Ajouter/Modifier membres du personnel', category: 'Utilisateurs' },

  // System
  { id: 'manage_settings', name: 'Paramètres Système', description: 'Configurer les paramètres globaux', category: 'Système' },
  { id: 'view_logs', name: 'Journaux d\'Audit', description: 'Voir les journaux d\'activité système', category: 'Système' },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrateur',
    description: 'Accès complet au système avec toutes les permissions',
    usersCount: 2,
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isSystem: true
  },
  {
    id: 'fleet_manager',
    name: 'Gestionnaire de Flotte',
    description: 'Gérer les véhicules et les calendriers de maintenance',
    usersCount: 1,
    permissions: ['view_dashboard', 'view_fleet', 'manage_fleet', 'manage_maintenance', 'view_bookings'],
    isSystem: false
  },
  {
    id: 'support',
    name: 'Agent de Support',
    description: 'Gérer les réservations et les demandes clients',
    usersCount: 3,
    permissions: ['view_dashboard', 'view_fleet', 'view_bookings', 'manage_bookings', 'view_clients', 'view_staff'],
    isSystem: false
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Accès client standard',
    usersCount: 156,
    permissions: ['view_fleet', 'view_bookings'], // Implicitly their own
    isSystem: true
  }
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(INITIAL_ROLES[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEditedPermissions(role.permissions);
    setIsEditing(false);
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!isEditing) return;
    
    setEditedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSaveRole = () => {
    setRoles(prev => prev.map(r => 
      r.id === selectedRole.id 
        ? { ...r, permissions: editedPermissions }
        : r
    ));
    setSelectedRole(prev => ({ ...prev, permissions: editedPermissions }));
    setIsEditing(false);
  };

  const categories = Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-1">Contrôle d'Accès Basé sur les Rôles</h3>
          <p className="text-sm text-slate-500">Gérez les permissions et les niveaux d'accès pour les différents rôles du système.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold uppercase hover:bg-brand-blue/20 transition-colors">
          <Plus className="w-4 h-4" /> Créer un Rôle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Roles List */}
        <div className="lg:col-span-4 space-y-3">
          {roles.map((role) => (
            <div 
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`group p-4 rounded-xl border cursor-pointer transition-all ${
                selectedRole.id === role.id
                  ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-brand-blue/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold ${selectedRole.id === role.id ? 'text-white' : 'text-brand-navy dark:text-white'}`}>
                    {role.name}
                  </h4>
                  {role.isSystem && (
                    <Lock className={`w-3 h-3 ${selectedRole.id === role.id ? 'text-white/60' : 'text-slate-400'}`} />
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedRole.id === role.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  {role.usersCount} utilisateurs
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${selectedRole.id === role.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {role.description}
              </p>
            </div>
          ))}
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-8">
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                   <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy dark:text-white text-lg">Permissions {selectedRole.name}</h4>
                  <p className="text-xs text-slate-500">
                    {isEditing ? 'Sélectionnez les permissions à attribuer à ce rôle' : `${selectedRole.permissions.length} permissions actives`}
                  </p>
                </div>
              </div>

              {selectedRole.id !== 'admin' && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedPermissions(selectedRole.permissions);
                        }}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition-colors"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleSaveRole}
                        className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-brand-blue/20"
                      >
                        <Save className="w-3 h-3" /> Enregistrer
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setEditedPermissions(selectedRole.permissions);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Modifier Permissions
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Modules {category}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.filter(p => p.category === category).map(permission => {
                      const isActive = isEditing 
                        ? editedPermissions.includes(permission.id)
                        : selectedRole.permissions.includes(permission.id);
                      
                      return (
                        <div 
                          key={permission.id}
                          onClick={() => handleTogglePermission(permission.id)}
                          className={`
                            relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
                            ${isEditing ? 'cursor-pointer hover:border-brand-blue/50' : 'cursor-default'}
                            ${isActive 
                              ? 'bg-white dark:bg-white/5 border-brand-blue/30 shadow-sm' 
                              : 'bg-transparent border-transparent opacity-60 grayscale'
                            }
                          `}
                        >
                          <div className={`
                            mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors
                            ${isActive ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}
                          `}>
                            {isActive && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className={`block text-sm font-bold ${isActive ? 'text-brand-navy dark:text-white' : 'text-slate-500'}`}>
                              {permission.name}
                            </span>
                            <span className="text-xs text-slate-400 leading-tight block mt-0.5">
                              {permission.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleManagement;

