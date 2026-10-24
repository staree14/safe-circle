import React from 'react';
import { Radio, RefreshCw, Clock, Sparkles } from 'lucide-react';
import type { Incident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useGuardian } from '../../context/GuardianContext';

interface IncidentHeaderProps {
  incident: Incident;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({ incident }) => {
  const { simulateLocationRefresh } = useGuardian();

  const isPhysical = incident.type === 'PHYSICAL_SOS';
  const isActive = incident.status === 'ACTIVE';

  return (
    <div
      className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xl relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-[#211424] via-[#151F35] to-[#151F35] border-[#F0525F]/50'
          : 'bg-[#151F35] border-[#29364F]'
      }`}
    >
      {/* Subtle background radar ring if active */}
      {isActive && (
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#F0525F]/5 blur-2xl pointer-events-none" />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Titles & IDs */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0525F]/20 border border-[#F0525F]/40 text-[#F0525F] text-xs font-bold tracking-wider uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#F0525F] animate-ping" />
                Active Emergency
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B2740] border border-[#29364F] text-[#A0AEC4] text-xs font-semibold tracking-wider uppercase">
                Archived Dossier
              </span>
            )}

            <StatusBadge status={incident.status} size="lg" />

            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#111A2E] border border-[#29364F] text-[#6EA8FE]">
              {incident.id}
            </span>

            <span className="text-[11px] px-2 py-0.5 rounded bg-[#1B2740] border border-[#29364F] text-[#E8B65C] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo Data
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC] flex items-center gap-2">
            {isPhysical ? 'Physical Emergency SOS Alert' : 'Digital Harassment Vault Dossier'}
          </h2>

          <p className="text-xs md:text-sm text-[#A0AEC4] max-w-3xl leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Right: Actions & Telemetry Replay */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <button
            onClick={() => simulateLocationRefresh(incident.id)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-medium text-[#F3F6FC] transition-colors cursor-pointer shadow-sm hover:border-[#6EA8FE]/40"
            title="Refresh GPS telemetry simulation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6EA8FE]" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Timestamps and Guidance */}
      <div className="mt-4 pt-3.5 border-t border-[#29364F]/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[#71809A]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#6EA8FE]" />
            Triggered:{' '}
            <strong className="text-[#A0AEC4] font-medium">
              {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </strong>{' '}
            (Simulated UTC)
          </span>

          <span className="flex items-center gap-1.5 tabular-nums">
            <Radio className="w-3.5 h-3.5 text-[#38C6A3]" />
            Last Telemetry Ping:{' '}
            <strong className="text-[#A0AEC4] font-medium">
              {new Date(incident.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </strong>
          </span>
        </div>

        <div className="text-[11px] text-[#A0AEC4] italic">
          "Review live location & incoming chunks, then formally acknowledge to coordinate emergency assistance."
        </div>
      </div>
    </div>
  );
};
