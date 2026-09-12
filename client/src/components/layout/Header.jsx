import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Plus, RefreshCw } from 'lucide-react';

export const Header = ({ onOpenMobileMenu }) => {
  const { activeTab, triggerRefresh, setIsCreateOrderOpen, loadingDashboard } = useApp();

  const titleMap = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    stocks: 'Stock & Inventory',
    expenses: 'Expenses',
    partners: 'Partners',
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
        </div>
      </div>
    </header>
  );
};
