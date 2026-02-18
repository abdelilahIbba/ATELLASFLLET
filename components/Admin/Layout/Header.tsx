import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  isDark: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, isDark, toggleTheme }) => {
  if (activeTab === 'gps') return null;

  return (
    <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-brand-navy dark:text-white uppercase tracking-wider">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-brand-navy dark:text-slate-400 hover:bg-brand-blue/10 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal/10 rounded-full">
              <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-brand-teal uppercase">Casablanca HQ</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-navy dark:bg-white flex items-center justify-center text-white dark:text-brand-navy font-bold text-xs">
              AD
          </div>
        </div>
    </div>
  );
};

export default Header;
