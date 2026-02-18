import React from 'react';
import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingStatsProps {
  totalRevenue: number;
  activeRentals: number;
  pendingRequests: number;
}

const BookingStats: React.FC<BookingStatsProps> = ({ totalRevenue, activeRentals, pendingRequests }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-brand-blue uppercase">Revenu Total</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{totalRevenue.toLocaleString()} MAD</p>
            </div>
            <DollarSign className="w-8 h-8 text-brand-blue" />
        </div>
        <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Locations Actives</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{activeRentals}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div className="bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">En Attente</p>
                <p className="text-2xl font-bold text-brand-navy dark:text-white">{pendingRequests}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
        </div>
    </div>
  );
};

export default BookingStats;
