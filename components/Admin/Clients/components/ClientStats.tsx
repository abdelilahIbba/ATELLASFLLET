import React from 'react';
import { Users, Crown, ShieldAlert } from 'lucide-react';

interface ClientStatsProps {
  totalClients: number;
  vipClients: number;
  blacklistedClients: number;
}

const ClientStats: React.FC<ClientStatsProps> = ({ totalClients, vipClients, blacklistedClients }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-brand-blue uppercase">Total Clients</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{totalClients}</p>
            </div>
            <Users className="w-8 h-8 text-brand-blue" />
        </div>
        <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Membres VIP</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{vipClients}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-500" />
        </div>
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Liste Noire</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{blacklistedClients}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
    </div>
  );
};

export default ClientStats;
