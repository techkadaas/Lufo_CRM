import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { LowStockAlerts } from '../components/dashboard/LowStockAlerts';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { Sparkles } from 'lucide-react';

export const DashboardPage = () => {
  const { dashboardData, dashboardFilter, setDashboardFilter, loadingDashboard } = useApp();

  const overview = dashboardData?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    totalStockUnits: 0,
    totalStockRetailValue: 0,
    netProfit: 0,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Overview</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {dashboardData?.activeFilter || 'This Month'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time boutique metrics, revenue, and inventory health</p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangeFilter
            value={dashboardFilter.timeRange}
            customRange={{
              startDate: dashboardFilter.startDate,
              endDate: dashboardFilter.endDate,
            }}
            onChange={(newFilter) => setDashboardFilter(newFilter)}
          />
        </div>
      </div>

      {/* 4 Clean Key Metrics */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${loadingDashboard ? 'opacity-60 pointer-events-none' : ''}`}>
        <StatCard
          title="Total Revenue"
          value={`₹${(overview.totalRevenue || 0).toLocaleString()}`}
          subtitle="Fulfilled boutique sales"
        />
        <StatCard
          title="Orders Placed"
          value={overview.totalOrders || 0}
          subtitle="Total customer bills"
        />
        <StatCard
          title="Stock Inventory"
          value={`${overview.totalStockUnits || 0} pcs`}
          subtitle={`₹${(overview.totalStockRetailValue || 0).toLocaleString()} value`}
        />
        <StatCard
          title="Net Profit"
          value={`₹${(overview.netProfit || 0).toLocaleString()}`}
          subtitle={`${overview.profitMargin || 0}% margin`}
        />
      </div>

      {/* Clean Analytics Area Chart */}
      <AnalyticsCharts monthlyTrends={dashboardData?.monthlyTrends || []} />

      {/* Clean Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable recentOrders={dashboardData?.recentOrders || []} />
        <LowStockAlerts lowStockItems={dashboardData?.lowStockItems || []} />
      </div>
    </div>
  );
};
