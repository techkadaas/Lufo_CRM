import React from 'react';

export const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </span>
      <div className="my-1.5 sm:my-2">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 truncate">{value}</h3>
      </div>
      {subtitle && <span className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">{subtitle}</span>}
    </div>
  );
};
