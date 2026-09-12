import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Quick Action Modal states
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isCreateStockOpen, setIsCreateStockOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Refresh tickers
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [dashboardFilter, setDashboardFilter] = useState({
    timeRange: 'this_month',
    startDate: '',
    endDate: '',
  });

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async (filters = dashboardFilter) => {
    try {
      setLoadingDashboard(true);
      const res = await api.getDashboardStats(filters);
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [dashboardFilter]);

  useEffect(() => {
    fetchDashboardStats(dashboardFilter);
  }, [fetchDashboardStats, refreshKey, dashboardFilter]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        toasts,
        showToast,
        removeToast,
        dashboardData,
        loadingDashboard,
        dashboardFilter,
        setDashboardFilter,
        fetchDashboardStats,
        refreshKey,
        triggerRefresh,
        isCreateOrderOpen,
        setIsCreateOrderOpen,
        isCreateStockOpen,
        setIsCreateStockOpen,
        isCreateExpenseOpen,
        setIsCreateExpenseOpen,
        selectedInvoiceOrder,
        setSelectedInvoiceOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
