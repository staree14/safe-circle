import React from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  incidentId: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'emergency' | 'success';
  icon?: 'shield' | 'check' | 'warning';
  subNote?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  incidentId,
  confirmLabel,
  confirmVariant = 'primary',
  icon = 'shield',
  subNote,
}) => {
  if (!isOpen) return null;

  let confirmBtnClass = 'bg-[#6EA8FE] hover:bg-[#5B96EC] text-[#0B1020] font-semibold';
  if (confirmVariant === 'emergency') {
    confirmBtnClass = 'bg-[#F0525F] hover:bg-[#D9404D] text-white font-semibold';
  } else if (confirmVariant === 'success') {
    confirmBtnClass = 'bg-[#38C6A3] hover:bg-[#2EB090] text-[#0B1020] font-semibold';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#151F35] border border-[#29364F] rounded-2xl max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#71809A] hover:text-[#F3F6FC] hover:bg-[#1B2740] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#F3F6FC]">
            {icon === 'shield' && <ShieldCheck className="w-6 h-6 text-[#E8B65C]" />}
            {icon === 'check' && <CheckCircle2 className="w-6 h-6 text-[#38C6A3]" />}
            {icon === 'warning' && <AlertTriangle className="w-6 h-6 text-[#F0525F]" />}
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#71809A]">
              Incident {incidentId}
            </span>
            <h3 id="dialog-title" className="text-base font-semibold text-[#F3F6FC]">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-[#A0AEC4] leading-relaxed">
          {description}
        </p>

        {subNote && (
          <div className="p-3 rounded-lg bg-[#0E1426] border border-[#29364F] text-xs text-[#71809A]">
            <span className="font-semibold text-[#A0AEC4]">Demo Note: </span>
            {subNote}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#29364F] text-sm text-[#A0AEC4] hover:bg-[#1B2740] hover:text-[#F3F6FC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-sm transition-all shadow-lg ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
