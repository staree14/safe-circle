import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Film } from 'lucide-react';
import type { Incident } from '../../types';
import { useGuardian } from '../../context/GuardianContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface IncidentActionsProps {
  incident: Incident;
}

export const IncidentActions: React.FC<IncidentActionsProps> = ({ incident }) => {
  const { acknowledgeIncident, resolveIncident, simulateIncomingEvidence, guardian } = useGuardian();

  const [showAckDialog, setShowAckDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const isResolved = incident.status === 'RESOLVED';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-4 md:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-[#F3F6FC] flex items-center gap-2">
          <span>Primary Command Actions</span>
          <span className="text-[10px] font-normal uppercase px-2 py-0.5 rounded bg-[#1B2740] text-[#71809A]">
            Guardian Controls
          </span>
        </h3>
        <p className="text-xs text-[#A0AEC4]">
          {isResolved
            ? 'This incident has been finalized and archived in the tamper-evident vault.'
            : isAcknowledged
            ? 'Alert is acknowledged. Ongoing coordination active. Mark resolved when victim is safe.'
            : 'Alert is unacknowledged. Immediate verification recommended.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Simulate Incoming Evidence Chunk */}
        {!isResolved && (
          <button
            onClick={() => simulateIncomingEvidence(incident.id)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#6EA8FE] transition-colors cursor-pointer shadow-sm hover:border-[#6EA8FE]/40"
            title="Simulate device transmitting an incoming 4.0s stealth chunk"
          >
            <Film className="w-4 h-4 text-[#6EA8FE]" />
            <span>Simulate Incoming Chunk</span>
          </button>
        )}

        {/* Acknowledge Action */}
        {!isResolved && (
          <button
            onClick={() => setShowAckDialog(true)}
            disabled={isAcknowledged}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer ${
              isAcknowledged
                ? 'bg-[#1E2538] text-[#71809A] border border-[#29364F] cursor-not-allowed'
                : 'bg-[#E8B65C] hover:bg-[#D4A349] text-[#0B1020] hover:shadow-[#E8B65C]/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAcknowledged ? 'Alert Acknowledged' : 'Acknowledge Alert'}</span>
          </button>
        )}

        {/* Resolve Action */}
        <button
          onClick={() => setShowResolveDialog(true)}
          disabled={isResolved}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer ${
            isResolved
              ? 'bg-[#14232B] text-[#38C6A3] border border-[#38C6A3]/40 cursor-default'
              : 'bg-[#38C6A3] hover:bg-[#2EB090] text-[#0B1020] hover:shadow-[#38C6A3]/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isResolved ? 'Incident Resolved' : 'Resolve Incident'}</span>
        </button>
      </div>

      {/* Confirmation Dialog: Acknowledge */}
      <ConfirmDialog
        isOpen={showAckDialog}
        onClose={() => setShowAckDialog(false)}
        onConfirm={() => acknowledgeIncident(incident.id, `${guardian.displayName} (${guardian.role})`)}
        title="Formally Acknowledge Alert?"
        description={`You are acknowledging the emergency SOS for ${incident.victimDisplayName}. This simulated action will update the incident state to ACKNOWLEDGED, record your timestamp in the forensic audit trail, and notify trusted contacts.`}
        incidentId={incident.id}
        confirmLabel="Confirm Acknowledgment"
        confirmVariant="primary"
        icon="shield"
        subNote="Simulated action for frontend demo. In production, this notifies backend via /api/incidents/token/:token/acknowledge."
      />

      {/* Confirmation Dialog: Resolve */}
      <ConfirmDialog
        isOpen={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={() => resolveIncident(incident.id, `Incident marked resolved by ${guardian.displayName}. Victim verified safe.`)}
        title="Mark Incident as Resolved?"
        description={`Confirming resolution will change the incident status to RESOLVED, seal all recorded evidence chunks in the forensic vault, and mark victim ${incident.victimDisplayName} as safe.`}
        incidentId={incident.id}
        confirmLabel="Confirm Resolution"
        confirmVariant="success"
        icon="check"
        subNote="In production, this finalizes the Section 65B forensic chain-of-custody report."
      />
    </div>
  );
};
