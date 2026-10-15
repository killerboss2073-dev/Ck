import React from 'react';
import { CheckCircle2, AlertCircle, Info, Zap, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'bet';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-800 bg-slate-900/95 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-cyan-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-emerald-500/20';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/40 bg-slate-900/95 text-slate-100 shadow-red-500/20';
          Icon = AlertCircle;
          iconColor = 'text-red-400';
        } else if (toast.type === 'bet') {
          borderClass = 'border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-amber-500/20';
          Icon = Zap;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-fade-in ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-100">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
