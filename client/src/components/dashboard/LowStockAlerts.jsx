import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Plus } from 'lucide-react';
import { StockAdjustmentModal } from '../stock/StockAdjustmentModal';

export const LowStockAlerts = ({ lowStockItems = [] }) => {
  const { setActiveTab } = useApp();
  const [selectedItem, setSelectedItem] = useState(null);

  if (lowStockItems.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
        <h3 className="text-base font-bold text-slate-900 mb-4">Stock Alerts</h3>
        <div className="p-6 text-center text-slate-400 text-xs">
          All inventory items are sufficiently stocked.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Low Stock Notice</h3>
        <button
          onClick={() => setActiveTab('stocks')}
          className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
        >
          <span>Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {lowStockItems.slice(0, 4).map((item) => (
          <div
            key={item._id}
            className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {item.name}
              </span>
              <span className="text-[11px] text-slate-400">
                Size {item.size} • <span className="text-amber-700 font-bold">{item.quantity} left</span>
              </span>
            </div>

            <button
              onClick={() => setSelectedItem(item)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Restock</span>
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <StockAdjustmentModal
          stockItem={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
