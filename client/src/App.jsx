import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { OrderInvoiceModal } from './components/orders/OrderInvoiceModal';
import { CreateOrderModal } from './components/orders/CreateOrderModal';
import { CreateStockModal } from './components/stock/CreateStockModal';
import { CreateExpenseModal } from './components/expenses/CreateExpenseModal';

import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { StockPage } from './pages/StockPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PartnersPage } from './pages/PartnersPage';

const MainLayout = () => {
  const {
    activeTab,
    selectedInvoiceOrder,
    setSelectedInvoiceOrder,
    isCreateOrderOpen,
    setIsCreateOrderOpen,
    isCreateStockOpen,
    setIsCreateStockOpen,
    isCreateExpenseOpen,
    setIsCreateExpenseOpen,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'orders' && <OrdersPage />}
          {activeTab === 'stocks' && <StockPage />}
          {activeTab === 'expenses' && <ExpensesPage />}
          {activeTab === 'partners' && <PartnersPage />}
        </main>
      </div>

      {/* Global Invoice Preview / Print Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Quick Add Modals */}
      {isCreateOrderOpen && (
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
        />
      )}

      {isCreateStockOpen && (
        <CreateStockModal
          isOpen={isCreateStockOpen}
          onClose={() => setIsCreateStockOpen(false)}
        />
      )}

      {isCreateExpenseOpen && (
        <CreateExpenseModal
          isOpen={isCreateExpenseOpen}
          onClose={() => setIsCreateExpenseOpen(false)}
        />
      )}

      {/* Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
