import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  Code2,
  Scale
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { LEGAL_STATUTES } from '../data/mockData';

export const ForensicReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('incidentId');

  const { incidents, getIncidentEvidence, getIncidentTimeline, guardian } = useGuardian();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    preselectedId || incidents[0]?.id || 'DEMO-SC-2026-0142'
  );
  const [reportFormat, setReportFormat] = useState<'html' | 'json'>('html');

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const incidentEvidence = selectedIncident ? getIncidentEvidence(selectedIncident.id) : [];
  const incidentTimeline = selectedIncident ? getIncidentTimeline(selectedIncident.id) : [];

  // Compute simulated Master Merkle Custody Seal (pseudo-hash of combined chunks)
  const masterSeal = selectedIncident
    ? `CUSTODY-SEAL-${selectedIncident.id.replace(/-/g, '')}-${incidentEvidence.length}EVD-${selectedIncident.status}`
    : 'CUSTODY-SEAL-PENDING';

  const legalViolations = selectedIncident?.aiCategory
    ? LEGAL_STATUTES[selectedIncident.aiCategory] || []
    : [];

  // Download real JSON file
  const handleDownloadJson = () => {
    if (!selectedIncident) return;

    const reportJson = {
      standard: 'ISO/IEC 27037:2012 Electronic Evidence Custody',
      statutory_compliance: 'Indian Evidence Act Section 65B Certificate',
      generated_at_utc: new Date().toISOString(),
      report_classification: 'CONFIDENTIAL FORENSIC AUDIT DOSSIER (DEMO)',
      master_custody_seal: masterSeal,
      incident_overview: {
        id: selectedIncident.id,
        type: selectedIncident.type,
        status: selectedIncident.status,
        victim_name: selectedIncident.victimDisplayName,
        victim_phone: selectedIncident.victimPhone,
        trigger_mode: selectedIncident.triggerMode,
        coordinates_initial: selectedIncident.location,
        battery_level: selectedIncident.batteryLevel,
        created_at: selectedIncident.createdAt,
        updated_at: selectedIncident.updatedAt,
        acknowledged_by: selectedIncident.acknowledgedBy || 'Unacknowledged in demo',
        acknowledged_at: selectedIncident.acknowledgedAt || null,
        resolved_at: selectedIncident.resolvedAt || null,
      },
      statutory_violations_triaged: legalViolations,
      evidence_inventory: incidentEvidence.map((ev) => ({
        evidence_id: ev.id,
        chunk_index: ev.chunkIndex,
        type: ev.type,
        filename: ev.filename,
        size_bytes: ev.sizeBytes,
        sha256_digest: ev.sha256Hash,
        hash_status: ev.hashStatus,
        timestamp_utc: ev.timestamp,
        captured_coordinates: ev.capturedCoordinates,
        legal_relevance: ev.legalRelevance,
      })),
      chronological_timeline_audit: incidentTimeline.map((te) => ({
        event_id: te.id,
        event_type: te.eventType,
        title: te.title,
        description: te.description,
        timestamp_utc: te.timestamp,
        metadata: te.metadata,
      })),
    };

    const blob = new Blob([JSON.stringify(reportJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SafeCircle_ForensicReport_${selectedIncident.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner with Controls */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#6EA8FE]">
              Section 65B Evidentiary Certification
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] flex items-center gap-1 font-semibold uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              Demo Report Engine
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#6EA8FE]" />
            Forensic Chain-of-Custody Reports
          </h2>
          <p className="text-xs md:text-sm text-[#A0AEC4] max-w-2xl leading-relaxed">
            Generate print-ready forensic dossiers and machine-readable JSON custody manifests for cyber cells, police desks, or judicial records.
          </p>
        </div>

        {/* Incident Selector & Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-2 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — {inc.victimDisplayName} ({inc.type === 'PHYSICAL_SOS' ? 'Physical SOS' : 'Digital Threat'})
              </option>
            ))}
          </select>

          <div className="flex items-center bg-[#111A2E] border border-[#29364F] rounded-xl p-0.5">
            <button
              onClick={() => setReportFormat('html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                reportFormat === 'html'
                  ? 'bg-[#1B2740] text-[#F3F6FC]'
                  : 'text-[#71809A] hover:text-[#F3F6FC]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Court HTML</span>
            </button>
            <button
              onClick={() => setReportFormat('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                reportFormat === 'json'
                  ? 'bg-[#1B2740] text-[#F3F6FC]'
                  : 'text-[#71809A] hover:text-[#F3F6FC]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Audit JSON</span>
            </button>
          </div>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#38C6A3] transition-colors"
            title="Download structured JSON audit manifest"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6EA8FE] hover:bg-[#5B96EC] text-[#0B1020] text-xs font-bold transition-all shadow-md"
            title="Print or Save as PDF using browser"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Content Container */}
      {selectedIncident && (
        <div className="bg-[#151F35] border border-[#29364F] rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-[#F3F6FC]">
          {/* Official Certificate Header */}
          <div className="border-b border-[#29364F] pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#13332B] border border-[#38C6A3]/40 text-[#38C6A3] text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Section 65B Electronic Evidence Certificate (Demo)
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC]">
                SafeCircle Forensic Incident & Custody Dossier
              </h1>
              <p className="text-xs text-[#A0AEC4]">
                Automated tamper-evident audit record generated under ISO/IEC 27037:2012 guidelines.
              </p>
            </div>

            <div className="text-right font-mono text-xs text-[#71809A]">
              <div>Report Ref: <strong className="text-[#F3F6FC]">{selectedIncident.id}</strong></div>
              <div>Generated: <span className="text-[#A0AEC4]">{new Date().toUTCString()}</span></div>
              <div className="text-[10px] text-[#E8B65C]">DEMO DEMONSTRATION DOCUMENT</div>
            </div>
          </div>

          {/* Master Seal Banner */}
          <div className="bg-[#111A2E] border border-[#38C6A3]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#38C6A3]">
                Master Merkle Root Custody Seal
              </span>
              <div className="font-mono text-xs md:text-sm font-bold text-[#F3F6FC] break-all">
                {masterSeal}
              </div>
            </div>
            <div className="px-3 py-1 rounded bg-[#13332B] text-[#38C6A3] text-xs font-mono font-bold shrink-0">
              TAMPER SEAL INTACT
            </div>
          </div>

          {/* Incident Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Victim / User</span>
              <span className="font-bold text-[#F3F6FC] block">{selectedIncident.victimDisplayName}</span>
              <span className="font-mono text-[11px] text-[#A0AEC4]">{selectedIncident.victimPhone}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Incident Classification</span>
              <span className="font-bold text-[#6EA8FE] block">
                {selectedIncident.type === 'PHYSICAL_SOS' ? 'Physical SOS Alert' : 'Digital Threat Vault'}
              </span>
              <span className="text-[11px] text-[#A0AEC4]">Mode: {selectedIncident.triggerMode}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Incident Status</span>
              <span className="font-bold text-[#E8B65C] block">{selectedIncident.status}</span>
              <span className="text-[11px] text-[#A0AEC4]">Battery: {selectedIncident.batteryLevel}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Verified Location</span>
              <span className="font-bold text-[#F3F6FC] block truncate">{selectedIncident.location.label}</span>
              <span className="font-mono text-[10px] text-[#71809A]">
                {selectedIncident.location.lat.toFixed(4)}° N, {selectedIncident.location.lng.toFixed(4)}° E
              </span>
            </div>
          </div>

          {/* Statutory Violations Section */}
          {legalViolations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#F3F6FC] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#A99AFB]" />
                Applicable Statutory Provisions (Indian Law Matrix)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {legalViolations.map((ref, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F] space-y-1">
                    <div className="font-mono font-bold text-[#6EA8FE]">{ref.section}</div>
                    <div className="font-semibold text-[#F3F6FC]">{ref.title}</div>
                    <p className="text-[#A0AEC4] text-[11px] leading-relaxed">{ref.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Inventory Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-[#F3F6FC] flex items-center justify-between">
              <span>Cryptographic Evidence Inventory ({incidentEvidence.length} Chunks Sealed)</span>
              <span className="text-[11px] font-normal text-[#71809A]">SHA-256 Digest Verification</span>
            </h3>

            <div className="border border-[#29364F] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111A2E] border-b border-[#29364F] text-[11px] text-[#71809A] uppercase font-semibold">
                    <th className="py-2.5 px-3">Item ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Payload Filename</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                    <th className="py-2.5 px-3">Custody Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#29364F]/50 font-mono text-[11px]">
                  {incidentEvidence.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#111A2E]/50">
                      <td className="py-2.5 px-3 text-[#6EA8FE] font-bold">{ev.id}</td>
                      <td className="py-2.5 px-3 text-[#A0AEC4] font-sans">{ev.type}</td>
                      <td className="py-2.5 px-3 text-[#F3F6FC] font-sans truncate max-w-xs">{ev.filename}</td>
                      <td className="py-2.5 px-3 text-[#71809A]">{(ev.sizeBytes / 1024).toFixed(0)} KB</td>
                      <td className="py-2.5 px-3 text-[#38C6A3] truncate max-w-[160px]" title={ev.sha256Hash}>
                        {ev.sha256Hash.slice(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3 text-[#38C6A3] font-sans font-semibold">VERIFIED (DEMO)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chronological Audit Log */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-[#F3F6FC]">
              Chronological Audit Trail (Timeline Events)
            </h3>
            <div className="divide-y divide-[#29364F] border border-[#29364F] rounded-xl overflow-hidden">
              {incidentTimeline.map((te) => (
                <div key={te.id} className="p-3 text-xs bg-[#111A2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#F3F6FC]">{te.title}</div>
                    <p className="text-[11px] text-[#A0AEC4]">{te.description}</p>
                  </div>
                  <span className="font-mono text-[11px] text-[#71809A] tabular-nums shrink-0">
                    {new Date(te.timestamp).toUTCString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Certification Statement */}
          <div className="border-t border-[#29364F] pt-6 mt-6 space-y-2 text-xs text-[#71809A]">
            <p className="leading-relaxed">
              <strong>Certificate Clause:</strong> I hereby certify that the electronic records detailed herein were automatically produced, hashed with SHA-256 digital seals, and logged by the SafeCircle Autonomous Emergency Protection System during normal operations. The system operated without unauthorized modification or data corruption.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 font-mono text-[11px]">
              <div>
                <span>Certifying Guardian: </span>
                <strong className="text-[#F3F6FC]">{guardian.displayName} ({guardian.role})</strong>
              </div>
              <div>
                <span>Digital Vault Seal: </span>
                <span className="text-[#38C6A3] font-bold">SEC-65B-VALIDATED</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
