import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldAlert,
  Clock,
  Film,
  Battery,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { IncidentHeader } from '../components/overview/IncidentHeader';
import { IncidentActions } from '../components/overview/IncidentActions';
import { LocationMap } from '../components/overview/LocationMap';
import { AudioWaveformCard } from '../components/evidence/AudioWaveformCard';
import { VictimTelemetryStrip } from '../components/overview/VictimTelemetryStrip';
import { DigitalReportView } from '../components/overview/DigitalReportView';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';
import { MetricCard } from '../components/common/MetricCard';
import { formatIncidentId } from '../utils/formatters';

export const IncidentDetailPage: React.FC = () => {
  const { incidentId, token } = useParams<{ incidentId?: string; token?: string }>();
  const navigate = useNavigate();
  const { incidents, getIncidentEvidence, getIncidentTimeline } = useGuardian();

  const incident = incidents.find(
    (inc) =>
      (incidentId && inc.id === incidentId) ||
      (token && inc.accessToken === token)
  );

  if (!incident) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#FDECEE] border border-[#F7D0D4] flex items-center justify-center mx-auto text-[#C84B53]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#1F1A1C]">
          Incident Not Found
        </h3>
        <p className="text-xs text-[#6E6265] leading-relaxed">
          The requested incident identifier <code className="font-mono text-[#C84B53] font-bold">{formatIncidentId(incidentId || token || '')}</code> was not found in the current dataset.
        </p>
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-xs font-bold text-[#1F1A1C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Incident History</span>
        </button>
      </div>
    );
  }

  const incidentEvidence = getIncidentEvidence(incident.id);
  const incidentTimeline = getIncidentTimeline(incident.id);

  const isPhysical = incident.id === 'SC-2026-0142' || incident.type === 'PHYSICAL_SOS';
  const isActive = incident.status === 'ACTIVE';
  const isAck = incident.status === 'ACKNOWLEDGED';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF6F3] border border-[#E8DFDA] text-xs font-bold text-[#6E6265] hover:text-[#1F1A1C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports?incidentId=${incident.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF6F3] border border-[#E8DFDA] text-xs font-bold text-[#C84B53] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Forensic Report</span>
          </Link>
        </div>
      </div>

      {/* 1. Header */}
      <IncidentHeader incident={incident} />

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Incident Status"
          value={incident.status}
          subtext={
            isActive
              ? 'Priority response active'
              : isAck
              ? 'Acknowledged by Guardian'
              : 'Safely resolved'
          }
          icon={
            isActive ? (
              <ShieldAlert className="w-5 h-5 animate-pulse text-[#C84B53]" />
            ) : isAck ? (
              <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
            )
          }
          variant={isActive ? 'emergency' : 'success'}
        />

        <MetricCard
          label="Time Registered"
          value={isPhysical ? '5:09 PM IST' : '20 Oct, 9:41 PM'}
          subtext="Chronological timestamp"
          icon={<Clock className="w-5 h-5 text-[#C84B53]" />}
          variant="default"
        />

        <MetricCard
          label="Preserved Evidence"
          value={`${incidentEvidence.length} Exhibits`}
          subtext="SHA-256 Section 65B certified"
          icon={<Film className="w-5 h-5 text-[#2D6A4F]" />}
          variant="success"
        />

        <MetricCard
          label="Device Battery"
          value={`${incident.batteryLevel}%`}
          subtext="Telemetry synchronized"
          icon={<Battery className="w-5 h-5 text-[#2D6A4F]" />}
          variant="default"
        />
      </div>

      {/* 3. 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {isPhysical ? (
            <>
              <LocationMap
                location={incident.location}
                victimName={incident.victimDisplayName}
                lastUpdated={incident.updatedAt}
              />
              <AudioWaveformCard
                filename="ambient_cab_audio_01.webm"
                duration="0:14"
                sha256="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
              />
              <VictimTelemetryStrip incident={incident} />
            </>
          ) : (
            <DigitalReportView />
          )}
        </div>

        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <IncidentActions incident={incident} />
          <IncidentTimeline events={incidentTimeline} />
        </div>
      </div>
    </div>
  );
};
