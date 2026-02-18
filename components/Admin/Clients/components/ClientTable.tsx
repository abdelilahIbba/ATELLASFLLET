import React from 'react';
import { CheckCircle2, ScanLine, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Client } from '../../types';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  openModal: (type: string, item: any) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onDelete, openModal }) => {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase">
                <tr>
                    <th className="p-4">Client</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Statut KYC</th>
                    <th className="p-4">Dépense Totale</th>
                    <th className="p-4">Statut Compte</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {clients.length > 0 ? clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-slate-500 border border-transparent">
                                    {client.avatar ? (
                                        <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold">{client.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy dark:text-white">{client.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{client.cin}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-xs">
                            <div className="text-brand-navy dark:text-slate-300 font-medium">{client.email}</div>
                            <div className="text-slate-500">{client.phone}</div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex w-fit items-center gap-1 ${
                                client.kycStatus === 'Verified' ? 'bg-green-100 text-green-600' :
                                client.kycStatus === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                                {client.kycStatus === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                                {client.kycStatus === 'Pending' && <ScanLine className="w-3 h-3" />}
                                {client.kycStatus === 'Missing' && <AlertCircle className="w-3 h-3" />}
                                {{
                                    'Verified': 'Vérifié',
                                    'Pending': 'En Attente',
                                    'Missing': 'Manquant'
                                }[client.kycStatus] || client.kycStatus}
                            </span>
                        </td>
                        <td className="p-4 font-mono text-brand-navy dark:text-white">
                            {client.totalSpent.toLocaleString()} MAD
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                client.status === 'VIP' ? 'bg-purple-100 text-purple-600 border border-purple-200' :
                                client.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {{
                                    'VIP': 'VIP',
                                    'Active': 'Actif',
                                    'Inactive': 'Inactif',
                                    'Blacklisted': 'Liste Noire'
                                }[client.status] || client.status}
                            </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button onClick={() => onEdit(client)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="Modifier Profil">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(client.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                )) : (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">Aucun client trouvé.</td>
                </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};

export default ClientTable;
