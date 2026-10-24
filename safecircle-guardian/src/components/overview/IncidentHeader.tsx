import React from 'react';
import { Radio, RefreshCw, Clock, MapPin, ShieldAlert, FolderOpen } from 'lucide-react';
import type { Incident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useGuardian } from '../../context/GuardianContext';
import { formatIncidentId } from '../../utils/formatters';

interface IncidentHeaderProps {
  incident: Incident;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({ incident }) => {
  const { simulateLocationRefresh, activeIncidentId, setActiveIncidentId } = useGuardian();

  const isPhysical = incident.type === 'PHYSICAL_SOS';
  const isActive = incident.status === 'ACTIVE';
  const isAck = incident.status === 'ACKNOWLEDGED';

  return (
    <div className="rounded-2xl border border-[#E8DFDA] p-6 bg-[#FFFFFF] shadow-sm relative overflow-hidden transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Titles & Incident Indicators */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDECEE] border border-[#F7D0D4] text-[#C84B53] text-xs font-bold tracking-wider uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#C84B53] animate-ping" />
                Active Emergency
              </span>
            ) : isAck ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                Acknowledged Dossier
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F3] border border-[#E8DFDA] text-[#6E6265] text-xs font-bold tracking-wider uppercase">
                Archived Dossier
              </span>
            )}

            <StatusBadge status={incident.status} size="md" />

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FAF6F3] border border-[#E8DFDA] text-[#1F1A1C]">
              {formatIncidentId(incident.id)}
            </span>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1F1A1C] leading-snug">
            {isPhysical
              ? 'Physical Emergency SOS — Shreya'
              : 'Digital Threat & Harassment Report — Shreya'}
          </h2>

          <p className="text-xs md:text-sm text-[#6E6265] max-w-3xl leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Right: Refresh button (clean subtle control) */}
        {isPhysical && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => simulateLocationRefresh(incident.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-xs font-semibold text-[#1F1A1C] transition-colors cursor-pointer"
              title="Refresh device telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6E6265]" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-bar: Timestamps and Route Guidance */}
      <div className="mt-5 pt-4 border-t border-[#E8DFDA] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E6265]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#C84B53]" />
            Triggered:{' '}
            <strong className="text-[#1F1A1C] font-semibold">
              {isPhysical ? '5:09 PM IST' : '20 Oct, 9:41 PM IST'}
            </strong>
          </span>

          <span className="flex items-center gap-1.5 tabular-nums">
            <Radio className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Telemetry Status:{' '}
            <strong className="text-[#2D6A4F] font-semibold">
              Live Stream Synchronized
            </strong>
          </span>
        </div>

        <div className="text-[11px] text-[#6E6265] font-medium">
          Bengaluru Metro Transit Corridor • Guardian Companion Active
        </div>
      </div>
    </div>
  );
};
