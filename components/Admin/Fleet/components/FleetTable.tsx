import React from 'react';
import { Fuel, Gauge, Edit, Trash2 } from 'lucide-react';
import { Vehicle } from '../../types';
import { getExpiryStatus } from '../../utils';

interface FleetTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

const FleetTable: React.FC<FleetTableProps> = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase">
                <tr>
                    <th className="p-4">Détails du Véhicule</th>
                    <th className="p-4">Immatriculation</th>
                    <th className="p-4">Agence</th>
                    <th className="p-4">Stats</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {vehicles.length > 0 ? vehicles.map((vehicle) => {
                    // Check expiry for row alert
                    const dates = Object.values(vehicle.documents) as string[];
                    let warningStatus = null;
                    try {
                        // @ts-ignore
                        warningStatus = dates.map(d => getExpiryStatus(d)).find(s => s?.label !== 'Valid');
                    } catch (e) {
                         // ignore errors in date parsing
                    }
                    
                    return (
                    <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center gap-4">
                                <img src={vehicle.image} alt={vehicle.name} className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-white/10" />
                                <div>
                                    <p className="font-bold text-brand-navy dark:text-white flex items-center gap-2">
                                        {vehicle.name}
                                        {/* @ts-ignore */}
                                        {warningStatus && (
                                            /* @ts-ignore */
                                            <span className={`w-2 h-2 rounded-full ${warningStatus.color.split(' ')[0].replace('text', 'bg')}`} title={`Document ${warningStatus.status}`}></span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500">{vehicle.category}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className="font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-xs">{vehicle.plate}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{vehicle.branch}</td>
                        <td className="p-4">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1" title="Niveau Carburant">
                                    <Fuel className="w-3 h-3 text-slate-400" /> {vehicle.fuel}%
                                </div>
                                <div className="flex items-center gap-1" title="Odomètre">
                                    <Gauge className="w-3 h-3 text-slate-400" /> {vehicle.odometer.toLocaleString()} km
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                vehicle.status === 'Available' ? 'bg-green-100 text-green-600' :
                                vehicle.status === 'Rented' ? 'bg-blue-100 text-blue-600' :
                                vehicle.status === 'Maintenance' ? 'bg-red-100 text-red-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {{
                                    'Available': 'Disponible',
                                    'Rented': 'Loué',
                                    'Maintenance': 'Maintenance',
                                    'Impounded': 'Fourrière'
                                }[vehicle.status] || vehicle.status}
                            </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button onClick={() => onEdit(vehicle)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="Modifier">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(vehicle.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                )}) : (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">Aucun véhicule trouvé correspondant aux critères.</td>
                </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};

export default FleetTable;
