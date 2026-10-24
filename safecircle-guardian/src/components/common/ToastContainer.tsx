import React from 'react';
import { useGuardian } from '../../context/GuardianContext';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGuardian();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let borderClass = 'border-[#E8DFDA]';
        let bgClass = 'bg-[#FFFFFF]';
        let icon = <Info className="w-4 h-4 text-[#C84B53] shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          borderClass = 'border-[#C8E6C9]';
          bgClass = 'bg-[#FFFFFF]';
          icon = <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />;
        } else if (toast.type === 'emergency') {
          borderClass = 'border-[#F7D0D4]';
          bgClass = 'bg-[#FFFFFF]';
          icon = <ShieldAlert className="w-4 h-4 text-[#C84B53] shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-[#FFE082]';
          bgClass = 'bg-[#FFFFFF]';
          icon = <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 text-sm ${bgClass} ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[#1F1A1C] text-xs leading-tight mb-0.5">{toast.title}</h4>
              <p className="text-[#6E6265] text-xs leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6E6265] hover:text-[#1F1A1C] p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
