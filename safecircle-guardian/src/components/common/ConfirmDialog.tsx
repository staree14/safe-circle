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

  let confirmBtnClass = 'bg-[#C84B53] hover:bg-[#A8323B] text-white font-bold';
  if (confirmVariant === 'emergency') {
    confirmBtnClass = 'bg-[#C84B53] hover:bg-[#A8323B] text-white font-bold';
  } else if (confirmVariant === 'success') {
    confirmBtnClass = 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-[#1F1A1C]">
            {icon === 'shield' && <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />}
            {icon === 'check' && <CheckCircle2 className="w-6 h-6 text-[#2D6A4F]" />}
            {icon === 'warning' && <AlertTriangle className="w-6 h-6 text-[#C84B53]" />}
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#C84B53] font-bold">
              Incident {incidentId}
            </span>
            <h3 id="dialog-title" className="font-serif text-base font-bold text-[#1F1A1C]">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#6E6265] leading-relaxed">
          {description}
        </p>

        {subNote && (
          <div className="p-3 rounded-lg bg-[#FAF6F3] border border-[#E8DFDA] text-xs text-[#6E6265]">
            <span className="font-semibold text-[#1F1A1C]">Notice: </span>
            {subNote}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8DFDA] text-xs font-bold text-[#6E6265] hover:bg-[#FAF6F3] hover:text-[#1F1A1C] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
