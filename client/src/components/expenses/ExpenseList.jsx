import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CreateExpenseModal } from './CreateExpenseModal';
import { EmptyState } from '../common/EmptyState';
import { Search, Plus, Trash2, Receipt } from 'lucide-react';

export const ExpenseList = () => {
  const { showToast, triggerRefresh, refreshKey, isCreateExpenseOpen, setIsCreateExpenseOpen } = useApp();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchExpenses();
  }, [search, categoryFilter, refreshKey]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.getExpenses({ search, category: categoryFilter });
      let currentExpenses = res.success ? res.data : [];

      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_expenses') || '[]');
        if (cached && cached.length > 0) {
          const serverIds = new Set(currentExpenses.map((e) => e._id || e.receiptNumber));
          const missingLocals = cached.filter((c) => !serverIds.has(c._id || c.receiptNumber));
          if (missingLocals.length > 0) {
            currentExpenses = [...missingLocals, ...currentExpenses];
          }
        }
        if (currentExpenses.length > 0) {
          localStorage.setItem('lufo_crm_cached_expenses', JSON.stringify(currentExpenses));
        }
      } catch (e) {}

      setExpenses(currentExpenses);
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_expenses') || '[]');
        if (cached && cached.length > 0) {
          setExpenses(cached);
          return;
        }
      } catch (e) {}
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;

    try {
      const res = await api.deleteExpense(id);
      if (res.success) {
        showToast('Expense deleted');
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_expenses') || '[]');
          const updated = cached.filter((e) => e._id !== id);
          localStorage.setItem('lufo_crm_cached_expenses', JSON.stringify(updated));
        } catch (e) {}
        fetchExpenses();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const totalFilteredExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const categories = [
    'All',
    'Raw Materials & Fabric',
    'Stitching & Tailoring',
    'Logistics & Courier',
    'Packaging & Tags',
    'Marketing & Ads',
    'Store Rent & Maintenance',
    'Staff & Salary',
    'Utilities & Electricity',
    'Miscellaneous',
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 outline-none shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateExpenseOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses logged"
            description="Record fabric, courier, and marketing costs."
            actionText="Record Expense"
            onAction={() => setIsCreateExpenseOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Title</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {expenses.map((expense) => {
                  const dateStr = new Date(expense.date || expense.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                    }
                  );

                  return (
                    <tr key={expense._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{expense.title}</div>
                        {expense.notes && (
                          <div className="text-[11px] text-slate-400">{expense.notes}</div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-500 font-medium">
                        {expense.category}
                      </td>

                      <td className="py-4 px-5 text-slate-400">{dateStr}</td>

                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{(expense.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDelete(expense._id, expense.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateExpenseOpen && (
        <CreateExpenseModal
          isOpen={isCreateExpenseOpen}
          onClose={() => setIsCreateExpenseOpen(false)}
        />
      )}
    </div>
  );
};
