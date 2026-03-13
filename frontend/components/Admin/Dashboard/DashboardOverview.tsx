import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Car, 
  Users, 
  FileText,
  CalendarRange,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  totalRevenue: number;
  activeRentals: number;
  pendingRequests: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  setActiveTab, 
  totalRevenue, 
  activeRentals, 
  pendingRequests 
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl overflow-hidden h-64 flex items-center px-10 shadow-lg group bg-brand-navy">
            <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1532931932314-e5917e76150c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Morocco" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-transparent"></div>
            <div className="relative z-10 text-white max-w-lg">
                <h1 className="text-3xl font-bold font-space mb-2">Marhaba, Admin.</h1>
                <p className="text-slate-300 mb-6 text-sm">Today's Fleet Status: <span className="text-green-400 font-bold">94% Operational</span></p>
                <div className="flex gap-3">
                    <button onClick={() => setActiveTab('bookings')} className="px-4 py-2 bg-brand-blue text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors">
                        <CalendarRange className="w-4 h-4" /> View Bookings
                    </button>
                    <button onClick={() => setActiveTab('messages')} className="px-4 py-2 bg-white/10 text-white border border-white/20 font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-white/20 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Check Messages
                    </button>
                </div>
            </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Revenue (MAD)', val: totalRevenue.toLocaleString(), icon: DollarSign, color: 'text-green-500', sub: '+12% vs last mo' },
                { label: 'Active Rentals', val: activeRentals.toString(), icon: Car, color: 'text-brand-blue', sub: 'Across 5 cities' },
                { label: 'Pending Requests', val: pendingRequests.toString(), icon: Users, color: 'text-brand-teal', sub: 'Requires Review' },
                { label: 'Unpaid Fines', val: '3', icon: FileText, color: 'text-brand-red', sub: 'Action required' },
            ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-white dark:bg-white/10 shadow-sm ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                    <h4 className="text-3xl font-bold text-brand-navy dark:text-white font-space mb-1">{stat.val}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-[10px] text-slate-400">{stat.sub}</p>
                </div>
            ))}
        </div>
    </motion.div>
  );
};

export default DashboardOverview;
