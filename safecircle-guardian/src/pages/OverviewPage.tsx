import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Film,
  Battery,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { IncidentHeader } from '../components/overview/IncidentHeader';
import { IncidentActions } from '../components/overview/IncidentActions';
import { VictimInfoCard } from '../components/overview/VictimInfoCard';
import { GuardianResponseCard } from '../components/overview/GuardianResponseCard';
import { LocationMap } from '../components/overview/LocationMap';
import { MetricCard } from '../components/common/MetricCard';
import { EvidenceList } from '../components/evidence/EvidenceList';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';

export const OverviewPage: React.FC = () => {
  const { activeIncident, getIncidentEvidence, getIncidentTimeline } = useGuardian();

  // Elapsed time ticker since SOS
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeIncident) return;
    const sosTime = new Date(activeIncident.createdAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - sosTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeIncident?.createdAt]);

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  if (!activeIncident) {
    return (
      <div className="py-20 text-center text-[#71809A]">
        No active incident selected.
      </div>
    );
  }

  const incidentEvidence = getIncidentEvidence(activeIncident.id);
  const incidentTimeline = getIncidentTimeline(activeIncident.id);

  const isActive = activeIncident.status === 'ACTIVE';
  const isAck = activeIncident.status === 'ACKNOWLEDGED';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Incident Header */}
      <IncidentHeader incident={activeIncident} />

      {/* 2. Primary Actions Bar */}
      <IncidentActions incident={activeIncident} />

      {/* 3. Summary Metrics Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Status */}
        <MetricCard
          label="Incident Status"
          value={activeIncident.status}
          subtext={
            isActive
              ? 'Priority response engaged'
              : isAck
              ? 'Coordination underway'
              : 'Safely resolved'
          }
          icon={
            isActive ? (
              <ShieldAlert className="w-5 h-5 animate-pulse text-[#F0525F]" />
            ) : isAck ? (
              <ShieldCheck className="w-5 h-5 text-[#E8B65C]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#38C6A3]" />
            )
          }
          variant={isActive ? 'emergency' : isAck ? 'warning' : 'success'}
        />

        {/* Metric 2: Elapsed Time */}
        <MetricCard
          label="Time Since SOS"
          value={formatElapsed(elapsedSeconds)}
          subtext="Continuous live telemetry"
          icon={<Clock className="w-5 h-5 text-[#6EA8FE]" />}
          variant="default"
        />

        {/* Metric 3: Preserved Evidence */}
        <MetricCard
          label="Preserved Evidence"
          value={`${incidentEvidence.length} Chunks`}
          subtext="SHA-256 sealed in vault"
          icon={<Film className="w-5 h-5 text-[#38C6A3]" />}
          variant="success"
        />

        {/* Metric 4: Battery Level */}
        <MetricCard
          label="Device Battery"
          value={`${activeIncident.batteryLevel}%`}
          subtext="Power-save stealth active"
          icon={<Battery className="w-5 h-5 text-[#E8B65C]" />}
          variant={activeIncident.batteryLevel < 25 ? 'emergency' : 'default'}
        />
      </div>

      {/* 4. Two-Column Metadata Row (Victim Profile & Guardian Response) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VictimInfoCard
          incident={activeIncident}
          evidenceCount={incidentEvidence.length}
        />
        <GuardianResponseCard incident={activeIncident} />
      </div>

      {/* 5. Live Interactive Location Map */}
      <LocationMap
        location={activeIncident.location}
        victimName={activeIncident.victimDisplayName}
        lastUpdated={activeIncident.updatedAt}
      />

      {/* 6. Evidence Stream & Chronological Timeline Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvidenceList
          evidenceList={incidentEvidence}
          incidentId={activeIncident.id}
          showSimulateButton={activeIncident.status !== 'RESOLVED'}
        />
        <IncidentTimeline events={incidentTimeline} />
      </div>
    </div>
  );
};
