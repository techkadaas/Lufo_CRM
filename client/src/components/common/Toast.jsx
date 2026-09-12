import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${
              isSuccess
                ? 'bg-white/95 border-emerald-300 text-emerald-800 shadow-emerald-900/10'
                : isError
                ? 'bg-white/95 border-rose-300 text-rose-800 shadow-rose-900/10'
                : isWarning
                ? 'bg-white/95 border-amber-300 text-amber-800 shadow-amber-900/10'
                : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isError && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
              <span className="text-sm font-semibold text-slate-900">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
