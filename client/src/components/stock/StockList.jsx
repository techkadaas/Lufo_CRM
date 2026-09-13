import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CreateStockModal } from './CreateStockModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { EmptyState } from '../common/EmptyState';
import { Search, Plus, Edit2, Trash2, Layers } from 'lucide-react';

export const StockList = () => {
  const { showToast, triggerRefresh, refreshKey, isCreateStockOpen, setIsCreateStockOpen } = useApp();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [editStockItem, setEditStockItem] = useState(null);
  const [adjustStockItem, setAdjustStockItem] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, [search, categoryFilter, refreshKey]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.getStocks({ search, category: categoryFilter });
      let currentStocks = res.success ? res.data : [];

      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_stocks') || '[]');
        if (cached && cached.length > 0) {
          const serverSkus = new Set(currentStocks.map((s) => s.sku || s._id));
          const missingLocals = cached.filter((c) => !serverSkus.has(c.sku || c._id));
          if (missingLocals.length > 0) {
            currentStocks = [...missingLocals, ...currentStocks];
          }
        }
        if (currentStocks.length > 0) {
          localStorage.setItem('lufo_crm_cached_stocks', JSON.stringify(currentStocks));
        }
      } catch (e) {}

      setStocks(currentStocks);
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_stocks') || '[]');
        if (cached && cached.length > 0) {
          setStocks(cached);
          return;
        }
      } catch (e) {}
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} from stock?`)) return;

    try {
      const res = await api.deleteStock(id);
      if (res.success) {
        showToast(`Item removed`);
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_stocks') || '[]');
          const updated = cached.filter((s) => s._id !== id);
          localStorage.setItem('lufo_crm_cached_stocks', JSON.stringify(updated));
        } catch (e) {}
        fetchStocks();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const categories = [
    'All',
    'Shirts',
    'T-Shirts',
    'Trousers',
    'Denim',
    'Jackets & Blazers',
    'Dresses',
    'Hoodies & Sweatshirts',
    'Accessories',
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock, SKU, fabric..."
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
            onClick={() => setIsCreateStockOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading inventory...</div>
        ) : stocks.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No inventory items found"
            description="Add your first clothing product to track stock."
            actionText="Add Stock Item"
            onAction={() => setIsCreateStockOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Item & SKU</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-center">Variant</th>
                  <th className="py-3 px-5 text-right">Price</th>
                  <th className="py-3 px-5 text-center">In Stock</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {stocks.map((item) => {
                  const isLow = item.quantity <= (item.lowStockThreshold || 5);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-amber-700">{item.sku}</div>
                      </td>

                      <td className="py-4 px-5 text-slate-500 font-medium">
                        {item.category}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs">
                          {item.size}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">{item.color}</span>
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{(item.sellingPrice || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isLow ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setAdjustStockItem(item)}
                            className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold px-1.5"
                            title="Adjust quantity"
                          >
                            +/-
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditStockItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateStockOpen && (
        <CreateStockModal isOpen={isCreateStockOpen} onClose={() => setIsCreateStockOpen(false)} />
      )}

      {editStockItem && (
        <CreateStockModal
          isOpen={!!editStockItem}
          editItem={editStockItem}
          onClose={() => setEditStockItem(null)}
        />
      )}

      {adjustStockItem && (
        <StockAdjustmentModal
          stockItem={adjustStockItem}
          isOpen={!!adjustStockItem}
          onClose={() => setAdjustStockItem(null)}
        />
      )}
    </div>
  );
};
