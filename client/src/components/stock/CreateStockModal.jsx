import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Layers, Sparkles, Tag, DollarSign, Archive, Hash } from 'lucide-react';

export const CreateStockModal = ({ isOpen, onClose, editItem = null }) => {
  const { showToast, triggerRefresh } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Shirts',
    size: 'M',
    color: 'Midnight Black',
    fabric: 'Combed Cotton',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    lowStockThreshold: 5,
    description: '',
  });

  const getShortSkuPrefix = (cat) => {
    switch (cat) {
      case 'Shirts': return 'S';
      case 'T-Shirts': return 'TS';
      case 'Trousers': return 'TR';
      case 'Denim': return 'DN';
      case 'Jackets & Blazers': return 'JK';
      case 'Dresses': return 'DR';
      case 'Hoodies & Sweatshirts': return 'HD';
      case 'Accessories': return 'AC';
      default: return cat ? cat.substring(0, 2).toUpperCase() : 'S';
    }
  };

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        sku: editItem.sku || '',
        category: editItem.category || 'Shirts',
        size: editItem.size || 'M',
        color: editItem.color || '',
        fabric: editItem.fabric || '',
        costPrice: editItem.costPrice || '',
        sellingPrice: editItem.sellingPrice || '',
        quantity: editItem.quantity || 0,
        lowStockThreshold: editItem.lowStockThreshold || 5,
        description: editItem.description || '',
      });
    } else {
      const num = Math.floor(10 + Math.random() * 90);
      setFormData({
        name: '',
        sku: `S-${num}`,
        category: 'Shirts',
        size: 'M',
        color: 'Midnight Black',
        fabric: '100% Supima Cotton',
        costPrice: '',
        sellingPrice: '',
        quantity: '',
        lowStockThreshold: 5,
        description: '',
      });
    }
  }, [editItem, isOpen]);

  const handleCategoryChange = (cat) => {
    const prefix = getShortSkuPrefix(cat);
    const num = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({
      ...prev,
      category: cat,
      sku: editItem ? prev.sku : `${prefix}-${num}`,
    }));
  };

  const cost = Number(formData.costPrice) || 0;
  const selling = Number(formData.sellingPrice) || 0;
  const marginAmt = selling - cost;
  const marginPct = selling > 0 ? ((marginAmt / selling) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Item name is required', 'warning');
      return;
    }
    if (!formData.costPrice || !formData.sellingPrice) {
      showToast('Cost price and Selling price are required', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
      };

      if (editItem) {
        const res = await api.updateStock(editItem._id, payload);
        if (res.success) {
          try {
            const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_stocks') || '[]');
            const updated = cached.map((s) => (s._id === editItem._id ? { ...s, ...payload } : s));
            localStorage.setItem('lufo_crm_cached_stocks', JSON.stringify(updated));
          } catch (e) {}
          showToast(`Stock item updated successfully`);
        }
      } else {
        const res = await api.createStock(payload);
        if (res.success) {
          try {
            const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_stocks') || '[]');
            const updated = [res.data, ...cached.filter((s) => s.sku !== res.data.sku && s._id !== res.data._id)];
            localStorage.setItem('lufo_crm_cached_stocks', JSON.stringify(updated));
          } catch (e) {}
          showToast(`Apparel "${res.data.name}" added to inventory`);
        }
      }

      triggerRefresh();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save stock item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Shirts',
    'T-Shirts',
    'Trousers',
    'Denim',
    'Jackets & Blazers',
    'Dresses',
    'Hoodies & Sweatshirts',
    'Accessories',
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Apparel Item' : 'Add New Apparel to Inventory'}
      subtitle="Register stock variants, cost vs. retail pricing, and minimum threshold limits"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">
            Apparel Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. LUFO Sartorial Linen Mandarin Shirt"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
          />
        </div>

        {/* SKU & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              SKU Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-amber-700 focus:border-amber-500 focus:bg-white outline-none uppercase"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Apparel Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Size, Color, Fabric */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Size</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none font-bold"
            >
              {sizes.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Color Tone</label>
            <input
              type="text"
              placeholder="e.g. Midnight Black"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Fabric / Material</label>
            <input
              type="text"
              placeholder="e.g. Mulberry Silk"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Pricing & Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              Cost Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="1200"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              Selling Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="2999"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 outline-none font-bold text-amber-700"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">
              Initial Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="25"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Low Stock Alert at</label>
            <input
              type="number"
              min="1"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Real-time Profit Preview */}
          <div className="sm:col-span-4 flex items-center justify-between text-xs pt-2 border-t border-slate-200">
            <span className="text-slate-600 font-medium">Projected Margin per Unit:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold font-mono ${marginAmt >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                ₹{marginAmt.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-semibold text-slate-700 border border-slate-200">
                {marginPct}% markup
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-semibold">Apparel Description / Notes</label>
          <textarea
            rows={2}
            placeholder="Atelier cut, stitching details, styling suggestions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            {loading ? 'Saving...' : editItem ? 'Update Stock Item' : 'Add Stock Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
