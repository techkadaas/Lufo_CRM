import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, RefreshCw, UserCheck } from 'lucide-react';

export const Header = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab, triggerRefresh, loadingDashboard } = useApp();
  const { user } = useAuth();

  const titleMap = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    stocks: 'Stock & Inventory',
    expenses: 'Expenses',
    partners: 'Partners',
    settings: 'Settings & Team Accounts',
  };

  const title = titleMap[activeTab] || 'Dashboard';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 sticky top-0 z-30 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline-block text-slate-400 font-medium">{todayFormatted}</span>

          <button
            onClick={triggerRefresh}
            className={`p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors ${
              loadingDashboard ? 'animate-spin text-amber-600' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden sm:flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              title="Account Settings"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                {user.name ? user.name.slice(0, 1).toUpperCase() : 'A'}
              </div>
              <span className="font-semibold text-slate-700 text-xs truncate max-w-[120px]">
                {user.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

