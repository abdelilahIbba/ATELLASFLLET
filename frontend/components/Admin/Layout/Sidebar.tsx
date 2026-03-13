import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Car, 
  CalendarRange, 
  Users, 
  MessageSquare, 
  Star, 
  PenTool,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate: (path: string) => void;
  pendingRequests: number;
  unreadMessages: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNavigate, 
  pendingRequests, 
  unreadMessages 
}) => {
  
  const TabButton = ({ id, icon: Icon, label, alertCount }: { id: string, icon: any, label: string, alertCount?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${activeTab !== id && 'group-hover:text-brand-blue transition-colors'}`} />
        <span className="font-bold text-sm">{label}</span>
      </div>
      {alertCount !== undefined && alertCount > 0 && (
        <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            {alertCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-xl z-20">
        <div className="px-4 py-4 mb-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-xl font-bold font-space text-brand-navy dark:text-white tracking-tight">ATLAS <span className="text-brand-teal">FLEET</span></h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Admin Maroc v3.0</p>
        </div>

        <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          <TabButton id="overview" icon={LayoutDashboard} label="Tableau de Bord" />
          <TabButton id="fleet" icon={Car} label="Flotte & Stock" />
          <TabButton id="bookings" icon={CalendarRange} label="Réservations" alertCount={pendingRequests} />
          <TabButton id="clients" icon={Users} label="Clients (KYC)" />
          <TabButton id="gps" icon={MapIcon} label="Suivi GPS en Direct" />
          <TabButton id="messages" icon={MessageSquare} label="Messages" alertCount={unreadMessages} />
          <TabButton id="reviews" icon={Star} label="Avis & Réputation" />
          <TabButton id="blog" icon={PenTool} label="Blog & Contenu" />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Paramètres Système</span>
          </button>
          <button 
              onClick={() => onNavigate('home')}
              className="w-full flex items-center gap-3 px-4 py-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
          >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm">Déconnexion</span>
          </button>
        </div>
    </div>
  );
};

export default Sidebar;
