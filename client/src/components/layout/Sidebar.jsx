import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Receipt,
  Handshake,
  Plus,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activeTab, setActiveTab, setIsCreateOrderOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'stocks', label: 'Stock', icon: Layers },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'partners', label: 'Partners', icon: Handshake },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-sans font-bold text-sm tracking-wider shadow-xs">
              LF
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-wider text-slate-900 block leading-tight">
                LUFO CLOTHING
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Create Order Button */}
        <div className="px-5 mb-4">
          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-xs tracking-wide transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Minimal Footer */}
        <div className="p-5 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400 font-medium">LUFO CLOTHING v1.0</span>
        </div>
      </aside>
    </>
  );
};
