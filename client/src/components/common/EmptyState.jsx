import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'Get started by creating a new entry.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-4">
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-amber-600 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold">
          {actionText}
        </button>
      )}
    </div>
  );
};
