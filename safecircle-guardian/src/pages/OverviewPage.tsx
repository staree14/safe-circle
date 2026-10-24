import React, { useState, useEffect } from 'react';
import {
  Clock,
  Battery,
  ShieldCheck,
  Lock,
  Check
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { LocationMap } from '../components/overview/LocationMap';
import { AudioWaveformCard } from '../components/evidence/AudioWaveformCard';
import { DigitalReportView } from '../components/overview/DigitalReportView';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';
import { VaultPreviewCard } from '../components/overview/VaultPreviewCard';

export const OverviewPage: React.FC = () => {
  const {
    activeIncident,
    getIncidentTimeline,
    acknowledgeIncident,
    resolveIncident,
    guardian,
  } = useGuardian();

  // Elapsed time ticker since SOS
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(27);

  useEffect(() => {
    if (!activeIncident) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeIncident?.id]);

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  if (!activeIncident) {
    return (
      <div className="py-20 text-center text-[#6E6265]">
        No active incident selected.
      </div>
    );
  }

  const incidentTimeline = getIncidentTimeline(activeIncident.id);
  const isPhysical = activeIncident.id.includes('0142') || activeIncident.type === 'PHYSICAL_SOS';
  const isActive = activeIncident.status === 'ACTIVE';
  const isAck = activeIncident.status === 'ACKNOWLEDGED';
  const isResolved = activeIncident.status === 'RESOLVED';

  const handleAcknowledge = () => {
    acknowledgeIncident(activeIncident.id, `${guardian.displayName} (Sister)`);
  };

  const handleResolve = () => {
    resolveIncident(activeIncident.id, `Resolved by ${guardian.displayName}. Victim safe.`);
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* 1. COMPACT STATUS STRIP (Sleek Horizontal Header with Stats & Actions) */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status Badge & Victim Route Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDECEE] border border-[#F7D0D4] text-[#C84B53] text-xs font-bold uppercase tracking-wider shrink-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#C84B53] animate-ping" />
              Active SOS
            </span>
          ) : isAck ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs font-bold uppercase tracking-wider shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
              Acknowledged
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F3] border border-[#E8DFDA] text-[#6E6265] text-xs font-bold uppercase tracking-wider shrink-0">
              Resolved
            </span>
          )}

          <div className="truncate">
            <span className="font-serif font-bold text-sm md:text-base text-[#1F1A1C]">
              {isPhysical ? 'Shreya — MG Road to Malleswaram' : 'Shreya — Digital Harassment Vault'}
            </span>
          </div>
        </div>

        {/* Center: Sleek Telemetry Stat Pills */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1A1C] bg-[#FAF6F3] px-3 py-1.5 rounded-xl border border-[#E8DFDA] shrink-0">
          <span className="flex items-center gap-1 tabular-nums font-mono">
            <Clock className="w-3.5 h-3.5 text-[#C84B53]" />
            {isPhysical ? formatElapsed(elapsedSeconds) : '20 Oct'}
          </span>
          <span className="text-[#E8DFDA]">•</span>
          <span className="flex items-center gap-1 tabular-nums font-mono">
            <Battery className="w-3.5 h-3.5 text-[#2D6A4F]" />
            {activeIncident.batteryLevel}%
          </span>
          <span className="text-[#E8DFDA]">•</span>
          <span className="flex items-center gap-1 text-[#2D6A4F] font-bold">
            <Lock className="w-3.5 h-3.5" />
            {isPhysical ? '2 Chunks Sealed' : '3 Exhibits Sealed'}
          </span>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isAck || isResolved ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-bold text-[#2D6A4F]">
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledged by Aditi</span>
            </div>
          ) : (
            <button
              onClick={handleAcknowledge}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acknowledge & Respond</span>
            </button>
          )}

          <button
            onClick={handleResolve}
            disabled={isResolved}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isResolved
                ? 'bg-[#FAF6F3] text-[#6E6265] border border-[#E8DFDA] cursor-default'
                : 'bg-[#FFFFFF] hover:bg-[#FAF6F3] text-[#1F1A1C] border border-[#E8DFDA] cursor-pointer'
            }`}
          >
            {isResolved ? 'Resolved' : 'Resolve'}
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE (ABOVE THE FOLD) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (60% / col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {isPhysical ? (
            <>
              {/* Working Map with Free OSM Tiles & 420px height */}
              <LocationMap
                location={activeIncident.location}
                victimName={activeIncident.victimDisplayName}
                lastUpdated={activeIncident.updatedAt}
              />

              {/* Compact Audio Player Strip directly underneath */}
              <AudioWaveformCard
                filename="ambient_cab_audio_01.webm"
                duration="0:14"
                sha256="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
              />
            </>
          ) : (
            <DigitalReportView />
          )}
        </div>

        {/* RIGHT COLUMN (40% / col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scannable Clean Incident Timeline */}
          <IncidentTimeline events={incidentTimeline} />

          {/* Quick Preview Card of Vault Evidence */}
          <VaultPreviewCard />
        </div>
      </div>
    </div>
  );
};
