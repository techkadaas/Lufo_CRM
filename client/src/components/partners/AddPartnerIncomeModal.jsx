import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const AddPartnerIncomeModal = ({
  isOpen,
  onClose,
  partners,
  onSaveIncome,
  defaultPartnerId = null,
}) => {
  const [partnerId, setPartnerId] = useState(
    defaultPartnerId || (partners && partners.length > 0 ? partners[0].id : '')
  );
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [purpose, setPurpose] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  useEffect(() => {
    if (defaultPartnerId) {
      setPartnerId(defaultPartnerId);
    } else if (partners && partners.length > 0 && !partnerId) {
      setPartnerId(partners[0].id);
    }
  }, [defaultPartnerId, partners]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!partnerId || !amount) return;

    onSaveIncome({
      partnerId,
      amount: parseFloat(amount) || 0,
      date,
      paymentMode,
      purpose: purpose.trim() || 'General Business Purchase / Capital Inflow',
      referenceNo: referenceNo.trim(),
    });

    // Reset form
    setAmount('');
    setPurpose('');
    setReferenceNo('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Partner Income / Capital"
      subtitle="Record money put in by a partner to be used for purchases and inventory."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Partner *
          </label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none cursor-pointer"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.role ? `(${p.role})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount Put In (₹) *
          </label>
          <input
            type="number"
            min="1"
            step="any"
            required
            placeholder="e.g. 250000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none font-mono font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit / Income Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none cursor-pointer"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Intended Purchase / Usage Purpose *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. For Linen Fabric Lot Purchase / Workshop advance"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / UTR No. (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. UPI Ref / UTR-83921938"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
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
            Record Income Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
