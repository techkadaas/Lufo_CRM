import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AnalyticsCharts = ({ monthlyTrends = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-900 mb-1">{label} 2026</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="text-slate-500 font-medium">{entry.name}:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Revenue Overview</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Monthly sales and operating expenditure</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-700">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-52 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              stroke="#cbd5e1"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `₹${val / 1000}k`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#d97706"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              fillOpacity={0}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
