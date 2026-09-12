import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const CreatePartnerModal = ({ isOpen, onClose, onSave, editingPartner = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Partner',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name || '',
        phone: editingPartner.phone || '',
        email: editingPartner.email || '',
        role: editingPartner.role || 'Partner',
        status: editingPartner.status || 'Active',
        notes: editingPartner.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: 'Partner',
        status: 'Active',
        notes: '',
      });
    }
  }, [editingPartner, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPartner ? 'Edit Partner Details' : 'Add New Partner'}
      subtitle="Add business partners who contribute capital/income for business purchases."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Partner Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role / Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Managing Partner / Co-Founder"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none cursor-pointer"
            >
              <option value="Active">Active Partner</option>
              <option value="Inactive">Inactive / Sleeping</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="partner@lufo.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes & Remarks
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Contributes working capital for fabric batches and bulk raw material procurement..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            {editingPartner ? 'Save Changes' : 'Add Partner'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
