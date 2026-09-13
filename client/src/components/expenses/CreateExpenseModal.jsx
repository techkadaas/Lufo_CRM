import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Receipt, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';

export const CreateExpenseModal = ({ isOpen, onClose }) => {
  const { showToast, triggerRefresh } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Raw Materials & Fabric',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    receiptNumber: '',
    notes: '',
  });

  const categories = [
    'Raw Materials & Fabric',
    'Stitching & Tailoring',
    'Logistics & Courier',
    'Packaging & Tags',
    'Marketing & Ads',
    'Store Rent & Maintenance',
    'Staff & Salary',
    'Utilities & Electricity',
    'Software & Tools',
    'Miscellaneous',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Expense title is required', 'warning');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('Please enter a valid expense amount', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createExpense({
        ...formData,
        amount: Number(formData.amount),
      });

      if (res.success) {
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_expenses') || '[]');
          const updated = [res.data, ...cached.filter((e) => e._id !== res.data._id)];
          localStorage.setItem('lufo_crm_cached_expenses', JSON.stringify(updated));
        } catch (e) {}
        showToast(`Expense of ₹${Number(formData.amount).toLocaleString()} recorded`);
        triggerRefresh();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Operating Expense"
      subtitle="Log fabrics, stitching, courier shipments, showroom overheads & marketing spend"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">
            Expense Description / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Silk fabric yardage purchase from Surat mills"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono font-bold text-rose-700 focus:border-amber-500 focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Date Incurred</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Payment Mode</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none"
            >
              <option value="UPI">UPI / QR</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Cash">Cash Voucher</option>
              <option value="Credit Card">Corporate Credit Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Receipt Number */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">
            Receipt / Invoice Reference # <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. REC-TEX-8921"
            value={formData.receiptNumber}
            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">Internal Notes</label>
          <textarea
            rows={2}
            placeholder="Vendor details, terms or project notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Record Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
