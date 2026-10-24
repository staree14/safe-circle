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
import { VictimInfoCard } from '../components/overview/VictimInfoCard';
import { GuardianResponseCard } from '../components/overview/GuardianResponseCard';
import { LocationMap } from '../components/overview/LocationMap';
import { MetricCard } from '../components/common/MetricCard';
import { EvidenceList } from '../components/evidence/EvidenceList';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';
import { LEGAL_STATUTES } from '../data/mockData';

export const IncidentDetailPage: React.FC = () => {
  const { incidentId, token } = useParams<{ incidentId?: string; token?: string }>();
  const navigate = useNavigate();
  const { incidents, getIncidentEvidence, getIncidentTimeline } = useGuardian();

  // Find incident either by ID or by capability access token
  const incident = incidents.find(
    (inc) =>
      (incidentId && inc.id === incidentId) ||
      (token && inc.accessToken === token)
  );

  if (!incident) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#351C2A] border border-[#F0525F]/40 flex items-center justify-center mx-auto text-[#F0525F]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#F3F6FC]">
          Incident Not Found
        </h3>
        <p className="text-xs text-[#A0AEC4] leading-relaxed">
          The requested incident identifier <code className="font-mono text-[#F0525F]">{incidentId || token}</code> was not found in the current demonstration database.
        </p>
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#F3F6FC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Incident History</span>
        </button>
      </div>
    );
  }

  const incidentEvidence = getIncidentEvidence(incident.id);
  const incidentTimeline = getIncidentTimeline(incident.id);
  const legalRefs = incident.aiCategory ? LEGAL_STATUTES[incident.aiCategory] : undefined;

  const isActive = incident.status === 'ACTIVE';
  const isAck = incident.status === 'ACKNOWLEDGED';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151F35] hover:bg-[#1B2740] border border-[#29364F] text-xs font-semibold text-[#A0AEC4] hover:text-[#F3F6FC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports?incidentId=${incident.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151F35] hover:bg-[#1B2740] border border-[#29364F] text-xs font-semibold text-[#6EA8FE] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Forensic Report</span>
          </Link>
        </div>
      </div>

      {/* 1. Header */}
      <IncidentHeader incident={incident} />

      {/* 2. Actions */}
      <IncidentActions incident={incident} />

      {/* 3. Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Incident Status"
          value={incident.status}
          subtext={isActive ? 'Action Required' : isAck ? 'Responder Assigned' : 'Case Archived'}
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

        <MetricCard
          label="Trigger Mechanism"
          value={incident.triggerMode}
          subtext="Sensor / Software Trigger"
          icon={<Clock className="w-5 h-5 text-[#6EA8FE]" />}
          variant="default"
        />

        <MetricCard
          label="Vault Evidence"
          value={`${incidentEvidence.length} Items`}
          subtext="Cryptographically Sealed"
          icon={<Film className="w-5 h-5 text-[#38C6A3]" />}
          variant="success"
        />

        <MetricCard
          label="Device Battery"
          value={`${incident.batteryLevel}%`}
          subtext="Last known reading"
          icon={<Battery className="w-5 h-5 text-[#E8B65C]" />}
          variant={incident.batteryLevel < 25 ? 'emergency' : 'default'}
        />
      </div>

      {/* AI Threat Classification Banner if Digital Harassment */}
      {incident.aiCategory && (
        <div className="bg-[#181F38] border border-[#A99AFB]/30 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A99AFB] uppercase tracking-wider">
                AI Threat Classification & Statutory Cross-Reference
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] uppercase font-mono">
                {incident.aiSeverity || 'HIGH'} Severity
              </span>
            </div>
            <span className="text-[11px] text-[#71809A] font-mono">
              Deterministic Statutory Matrix
            </span>
          </div>

          <p className="text-xs text-[#F3F6FC] leading-relaxed">
            {incident.aiSummary}
          </p>

          {legalRefs && legalRefs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {legalRefs.map((ref, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F] text-xs space-y-1">
                  <div className="font-bold text-[#6EA8FE] font-mono">
                    {ref.section} — {ref.title}
                  </div>
                  <p className="text-[#A0AEC4] text-[11px] leading-relaxed">
                    {ref.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Metadata Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VictimInfoCard
          incident={incident}
          evidenceCount={incidentEvidence.length}
        />
        <GuardianResponseCard incident={incident} />
      </div>

      {/* 5. Map */}
      <LocationMap
        location={incident.location}
        victimName={incident.victimDisplayName}
        lastUpdated={incident.updatedAt}
      />

      {/* 6. Evidence & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvidenceList
          evidenceList={incidentEvidence}
          incidentId={incident.id}
          showSimulateButton={incident.status !== 'RESOLVED'}
        />
        <IncidentTimeline events={incidentTimeline} />
      </div>
    </div>
  );
};
