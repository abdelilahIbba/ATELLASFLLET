import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate: (path: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  pendingRequests: number;
  unreadMessages: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onNavigate, 
  isDark,
  toggleTheme,
  pendingRequests,
  unreadMessages
}) => {
  return (
    <div className={`h-screen w-full flex overflow-hidden ${isDark ? 'bg-brand-navy' : 'bg-slate-100'} p-4 gap-4 transition-colors duration-500`}>
         
         <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onNavigate={onNavigate} 
            pendingRequests={pendingRequests} 
            unreadMessages={unreadMessages}
         />

         {/* Main Content Area */}
         <div className="flex-grow bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative flex flex-col z-10">
            
            <Header activeTab={activeTab} isDark={isDark} toggleTheme={toggleTheme} />

            {/* Content Body */}
            <div className={`flex-grow ${activeTab === 'gps' ? 'p-0' : 'p-6 overflow-y-auto custom-scrollbar'} relative`}>
               {children}
            </div>
         </div>
    </div>
  );
};

export default AdminLayout;
