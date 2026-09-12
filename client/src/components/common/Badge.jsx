import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-300',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    rose: 'bg-rose-50 text-rose-800 border-rose-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    blue: 'bg-blue-50 text-blue-800 border-blue-300',
    purple: 'bg-purple-50 text-purple-800 border-purple-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
};
