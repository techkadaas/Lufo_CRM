import React, { useState } from 'react';
import { Calendar, ChevronDown, Check, X, ArrowRight } from 'lucide-react';

export const FILTER_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_3_months', label: 'Last 3 Months' },
  { id: 'custom', label: 'Custom Range' },
];

export const DateRangeFilter = ({
  value = 'this_month',
  customRange = { startDate: '', endDate: '' },
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customRange.startDate || '');
  const [tempEnd, setTempEnd] = useState(customRange.endDate || '');
  const [isCustomEditing, setIsCustomEditing] = useState(value === 'custom');

  const selectedOption = FILTER_OPTIONS.find((opt) => opt.id === value) || FILTER_OPTIONS[3];

  const handleSelectPreset = (id) => {
    if (id === 'custom') {
      setIsCustomEditing(true);
      setIsOpen(true);
    } else {
      setIsCustomEditing(false);
      setIsOpen(false);
      onChange({ timeRange: id, startDate: '', endDate: '' });
    }
  };

  const handleApplyCustom = (e) => {
    if (e) e.preventDefault();
    if (!tempStart || !tempEnd) return;
    setIsCustomEditing(true);
    setIsOpen(false);
    onChange({ timeRange: 'custom', startDate: tempStart, endDate: tempEnd });
  };

  const getDisplayText = () => {
    if (value === 'custom' && customRange.startDate && customRange.endDate) {
      return `${customRange.startDate} → ${customRange.endDate}`;
    }
    return selectedOption.label;
  };

  return (
    <div className={`relative inline-block text-xs ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 shadow-2xs transition-all cursor-pointer select-none"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold text-slate-800">{getDisplayText()}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {value === 'custom' && customRange.startDate && customRange.endDate && (
          <button
            type="button"
            onClick={() => handleSelectPreset('this_month')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to This Month"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Filter by Period
            </div>

            <div className="space-y-0.5">
              {FILTER_OPTIONS.map((option) => {
                const isSelected = value === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectPreset(option.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Date Pickers */}
            {(isCustomEditing || value === 'custom') && (
              <form onSubmit={handleApplyCustom} className="pt-2 mt-1 border-t border-slate-100 space-y-2 p-1">
                <div className="text-[11px] font-semibold text-slate-500">Pick Date Range</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">From</label>
                    <input
                      type="date"
                      value={tempStart}
                      onChange={(e) => setTempStart(e.target.value)}
                      className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">To</label>
                    <input
                      type="date"
                      value={tempEnd}
                      onChange={(e) => setTempEnd(e.target.value)}
                      className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-amber-600"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!tempStart || !tempEnd}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Apply Range</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};
