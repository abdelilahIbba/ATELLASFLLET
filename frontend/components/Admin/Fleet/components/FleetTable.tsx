import React from 'react';
import { Fuel, Gauge, Edit, Trash2, Shield, Wrench, FileText, FileCheck } from 'lucide-react';
import { Vehicle } from '../../types';
import { getExpiryStatus } from '../../utils';

interface FleetTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

const docDefinitions = [
  { key: 'insurance',       label: 'Ass.', fullName: 'Assurance',        icon: Shield },
  { key: 'visiteTechnique', label: 'VT',   fullName: 'Visite Technique', icon: Wrench },
  { key: 'vignette',        label: 'Vig.', fullName: 'Vignette',         icon: FileText },
  { key: 'carteGrise',      label: 'CG',   fullName: 'Carte Grise',      icon: FileCheck },
] as const;

const FleetTable: React.FC<FleetTableProps> = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/90 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <tr>
                        <th className="p-4 pl-6">Détails du Véhicule</th>
                        <th className="p-4">Immatriculation</th>
                        <th className="p-4">Agence</th>
                        <th className="p-4">Stats</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Documents</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                    {vehicles.length > 0 ? vehicles.map((vehicle) => {
                        // Check overall document warning status for the vehicle
                        const dates = Object.values(vehicle.documents || {}) as string[];
                        let warningStatus: ReturnType<typeof getExpiryStatus> | null = null;
                        try {
                            warningStatus = dates.map(d => d ? getExpiryStatus(d) : null).find(s => s && s.label !== 'Valid') || null;
                        } catch (e) {
                            // Defensive parsing
                        }
                        
                        return (
                        <tr key={vehicle.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                            {/* 1. DÉTAILS DU VÉHICULE (Photo + Nom + Type fusionnés) */}
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-3.5">
                                    <div className="relative w-16 h-11 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-xs">
                                        <img 
                                            src={vehicle.image} 
                                            alt={vehicle.name} 
                                            onError={(e) => { 
                                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'; 
                                            }} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm leading-snug truncate">
                                            <span>{vehicle.name}</span>
                                            {warningStatus ? (
                                                <span 
                                                    className="w-2 h-2 rounded-full shrink-0 bg-amber-500 animate-pulse" 
                                                    title={`Document ${warningStatus.label}`}
                                                />
                                            ) : (
                                                <span 
                                                    className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" 
                                                    title="Documents conformes"
                                                />
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            {vehicle.category}
                                            {vehicle.fuel_type && ` • ${vehicle.fuel_type}`}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* 2. IMMATRICULATION */}
                            <td className="p-4 whitespace-nowrap">
                                <span className="font-mono bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/10">
                                    {vehicle.plate || '—'}
                                </span>
                            </td>

                            {/* 3. AGENCE */}
                            <td className="p-4 text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">
                                {vehicle.branch || 'Casablanca'}
                            </td>

                            {/* 4. STATS (Carburant, Odomètre, Quantité) */}
                            <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5" title="Niveau Carburant">
                                        <Fuel className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium">{vehicle.fuel}%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Odomètre">
                                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-mono font-medium">{Number(vehicle.odometer || 0).toLocaleString()} km</span>
                                    </div>
                                    {(vehicle.quantity ?? 1) > 1 && (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md text-[10px]" title="Quantité d'unités">
                                            ×{vehicle.quantity}
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* 5. STATUT */}
                            <td className="p-4 whitespace-nowrap">
                                {(() => {
                                    switch (vehicle.status) {
                                        case 'Available':
                                            return (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20">
                                                    Disponible
                                                </span>
                                            );
                                        case 'Rented':
                                            return (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20">
                                                    Loué
                                                </span>
                                            );
                                        case 'Maintenance':
                                            return (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/20">
                                                    Maintenance
                                                </span>
                                            );
                                        default:
                                            return (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                    {vehicle.status}
                                                </span>
                                            );
                                    }
                                })()}
                            </td>

                            {/* 6. DOCUMENTS (Pastilles / indicateurs avec point vert/rouge pour alléger la vue) */}
                            <td className="p-4">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 w-max">
                                    {docDefinitions.map(({ key, label, fullName }) => {
                                        const d = vehicle.documents?.[key] || '';
                                        let s: ReturnType<typeof getExpiryStatus> | null = null;
                                        try { s = d ? getExpiryStatus(d) : null; } catch {}
                                        
                                        const isValid = s?.status === 'Valid';
                                        const isWarning = s?.status === 'Warning' || s?.status === 'Notice' || s?.status === 'Critical';
                                        const isExpired = s?.status === 'Expired';
                                        
                                        return (
                                            <div 
                                                key={key} 
                                                title={`${fullName}: ${d ? d : 'Non renseigné'} (${s ? s.label : 'Manquant'})`}
                                                className="flex items-center gap-1.5 cursor-default group/doc"
                                            >
                                                {/* Point vert / rouge / orange */}
                                                <span className={`w-2 h-2 rounded-full shrink-0 transition-transform group-hover/doc:scale-125 ${
                                                    isValid 
                                                        ? 'bg-emerald-500 ring-2 ring-emerald-500/20' 
                                                        : isWarning
                                                            ? 'bg-amber-500 ring-2 ring-amber-500/20'
                                                            : isExpired
                                                                ? 'bg-rose-500 ring-2 ring-rose-500/20'
                                                                : 'bg-slate-300 dark:bg-slate-600'
                                                }`} />
                                                <span className={`text-[11px] font-semibold tracking-tight ${
                                                    isValid 
                                                        ? 'text-slate-600 dark:text-slate-300' 
                                                        : isWarning || isExpired
                                                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                            : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    {label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </td>

                            {/* 7. ACTIONS */}
                            <td className="p-4 pr-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                        type="button"
                                        onClick={() => onEdit(vehicle)} 
                                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20 rounded-xl transition-all" 
                                        title="Modifier le véhicule"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => onDelete(vehicle.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all" 
                                        title="Supprimer le véhicule"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                    }) : (
                    <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-slate-500 italic">
                            Aucun véhicule trouvé correspondant aux critères.
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default FleetTable;
