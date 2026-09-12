import React from 'react';
import { Modal } from '../common/Modal';
import { DollarSign, Calendar, Tag, Trash2, Plus } from 'lucide-react';

export const PartnerLedgerModal = ({
  isOpen,
  onClose,
  partner,
  contributions,
  onDeleteContribution,
  onAddMoreMoney,
}) => {
  if (!partner) return null;

  const partnerContributions = contributions.filter((c) => c.partnerId === partner.id);
  const totalPartnerMoney = partnerContributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${partner.name} - Capital Statement`}
      subtitle="Complete ledger of funds and income put in by this partner."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Partner Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider block">
              Total Capital Put In
            </span>
            <h3 className="text-2xl font-bold font-mono text-white">
              ₹{totalPartnerMoney.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {partnerContributions.length} Total Deposits Recorded
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              onAddMoreMoney(partner.id);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Money for {partner.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Contributions Table */}
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-xs">
          {partnerContributions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No income entries recorded yet for this partner.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Purpose / Purchase Use</th>
                    <th className="py-2.5 px-4">Payment Mode</th>
                    <th className="py-2.5 px-4 text-right">Amount Put In</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {partnerContributions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(c.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.purpose}</div>
                        {c.referenceNo && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {c.referenceNo}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.paymentMode}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                        ₹{(c.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteContribution(c.id, c.amount)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close Statement
          </button>
        </div>
      </div>
    </Modal>
  );
};
