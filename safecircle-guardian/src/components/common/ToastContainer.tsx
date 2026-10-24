import React from 'react';
import { useGuardian } from '../../context/GuardianContext';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGuardian();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let borderClass = 'border-[#29364F]';
        let bgClass = 'bg-[#151F35]';
        let icon = <Info className="w-4 h-4 text-[#6EA8FE] shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          borderClass = 'border-[#38C6A3]/60';
          icon = <CheckCircle2 className="w-4 h-4 text-[#38C6A3] shrink-0 mt-0.5" />;
        } else if (toast.type === 'emergency') {
          borderClass = 'border-[#F0525F]/60';
          bgClass = 'bg-[#271420]';
          icon = <ShieldAlert className="w-4 h-4 text-[#F0525F] shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-[#E8B65C]/60';
          icon = <AlertTriangle className="w-4 h-4 text-[#E8B65C] shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 text-sm ${bgClass} ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#F3F6FC] text-xs leading-tight mb-0.5">{toast.title}</h4>
              <p className="text-[#A0AEC4] text-xs leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#71809A] hover:text-[#F3F6FC] p-1 rounded-md transition-colors"
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
