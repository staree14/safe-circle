import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileDown, Check } from 'lucide-react';
import type { Incident } from '../../types';
import { useGuardian } from '../../context/GuardianContext';

interface IncidentActionsProps {
  incident: Incident;
}

export const IncidentActions: React.FC<IncidentActionsProps> = ({ incident }) => {
  const navigate = useNavigate();
  const { acknowledgeIncident, resolveIncident, guardian } = useGuardian();

  const isResolved = incident.status === 'RESOLVED';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';

  const handleAcknowledge = () => {
    acknowledgeIncident(incident.id, `${guardian.displayName} (Sister / Primary Contact)`);
  };

  const handleResolve = () => {
    resolveIncident(incident.id, `Incident marked resolved by ${guardian.displayName}. Victim safely assisted.`);
  };

  const handleDownloadPdf = () => {
    navigate(`/reports?incidentId=${incident.id}`);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DFDA] pb-3">
        <div>
          <h3 className="font-serif text-base font-bold text-[#1F1A1C] leading-none">
            Guardian Action Bar
          </h3>
          <p className="text-[11px] text-[#6E6265] mt-1">
            Formal response dispatch & legal forensic export
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6F3] border border-[#E8DFDA] text-[#6E6265] font-semibold uppercase">
          Authorized Contact
        </span>
      </div>

      {/* Action Buttons Stack */}
      <div className="space-y-2.5">
        {/* Prominent Acknowledge Button */}
        {isAcknowledged || isResolved ? (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E8F5E9] border-2 border-[#C8E6C9] text-xs font-bold text-[#2D6A4F] shadow-xs">
            <Check className="w-4 h-4 text-[#2D6A4F]" />
            <span>Alert Acknowledged by {incident.acknowledgedBy || 'Aditi Sharma'}</span>
          </div>
        ) : (
          <button
            onClick={handleAcknowledge}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Acknowledge Alert (Dispatch Response)</span>
          </button>
        )}

        {/* Secondary Action Row: Resolve & Download PDF */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleResolve}
            disabled={isResolved}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              isResolved
                ? 'bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] cursor-default'
                : 'bg-[#FAF6F3] hover:bg-[#F3ECE8] text-[#1F1A1C] border border-[#E8DFDA] cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{isResolved ? 'Resolved' : 'Resolve Incident'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] text-[#1F1A1C] border border-[#E8DFDA] text-xs font-bold transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#C84B53]" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] text-[#6E6265] pt-1">
        Acknowledging notifies the victim's Circle and records your cryptographic signature in the Section 65B forensic audit trail.
      </div>
    </div>
  );
};
