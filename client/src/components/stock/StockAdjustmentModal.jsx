import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';

export const StockAdjustmentModal = ({ stockItem, isOpen, onClose }) => {
  const { showToast, triggerRefresh } = useApp();
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Restock shipment received');
  const [loading, setLoading] = useState(false);

  if (!stockItem) return null;

  const currentQty = stockItem.quantity || 0;
  const numQty = Number(qty) || 0;
  const calculatedNewQty =
    adjustmentType === 'add' ? currentQty + numQty : Math.max(0, currentQty - numQty);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numQty || numQty <= 0) {
      showToast('Please enter a valid quantity', 'warning');
      return;
    }

    const finalAdjustment = adjustmentType === 'add' ? numQty : -numQty;

    try {
      setLoading(true);
      const res = await api.adjustStock(stockItem._id, finalAdjustment, reason);
      if (res.success) {
        showToast(`Stock for ${stockItem.name} updated to ${res.data.quantity} units`);
        triggerRefresh();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock Level"
      subtitle={`SKU: ${stockItem.sku} • ${stockItem.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs New Quantity Preview */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-center">
            <span className="text-[11px] text-slate-500 block font-semibold uppercase">Current Stock</span>
            <span className="font-mono text-xl font-bold text-slate-900">{currentQty} units</span>
          </div>

          <div className="text-slate-400 font-bold">➔</div>

          <div className="text-center">
            <span className="text-[11px] text-slate-500 block font-semibold uppercase">Adjusted Stock</span>
            <span className="font-mono text-xl font-bold text-amber-700">
              {calculatedNewQty} units
            </span>
          </div>
        </div>

        {/* Action Type: Add or Deduct */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setAdjustmentType('add');
              setReason('Restock shipment received');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              adjustmentType === 'add'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Add Stock (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAdjustmentType('subtract');
              setReason('Damaged / Display piece / Discard');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              adjustmentType === 'subtract'
                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <MinusCircle className="w-4 h-4 text-rose-600" />
            <span>Deduct Stock (-)</span>
          </button>
        </div>

        {/* Quantity to adjust */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">
            Quantity to {adjustmentType === 'add' ? 'Add' : 'Deduct'}
          </label>
          <input
            type="number"
            min="1"
            required
            placeholder="e.g. 10"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:border-amber-500 focus:bg-white outline-none"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">Adjustment Reason</label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Apply Stock Change'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
