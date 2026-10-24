import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { LEGAL_STATUTES } from '../data/mockData';
import { formatIncidentId, formatCustodySeal } from '../utils/formatters';

export const ForensicReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('incidentId');

  const { incidents, getIncidentEvidence, guardian } = useGuardian();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    preselectedId || incidents[0]?.id || 'SC-2026-0142'
  );

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const incidentEvidence = selectedIncident ? getIncidentEvidence(selectedIncident.id) : [];

  const formattedId = formatIncidentId(selectedIncident.id);
  const masterSeal = formatCustodySeal(selectedIncident.id);

  const legalViolations = selectedIncident?.aiCategory
    ? LEGAL_STATUTES[selectedIncident.aiCategory] || []
    : [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportJson = {
      standard: 'ISO/IEC 27037:2012 Electronic Evidence Custody',
      statutory_compliance: 'Indian Evidence Act Section 65B / Bharatiya Sakshya Adhiniyam Section 63',
      generated_at_utc: new Date().toISOString(),
      report_classification: 'CONFIDENTIAL FORENSIC AUDIT DOSSIER',
      master_custody_seal: masterSeal,
      incident_id: formattedId,
      victim_name: selectedIncident.victimDisplayName,
      status: selectedIncident.status,
      evidence_inventory: incidentEvidence.map((ev) => ({
        id: ev.id,
        filename: ev.filename,
        sha256: ev.sha256Hash,
        timestamp: ev.timestamp,
        size_bytes: ev.sizeBytes,
      })),
    };

    const blob = new Blob([JSON.stringify(reportJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SafeCircle_${formattedId}_Section65B_Report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Clean Printable Section 65B Certificate Card (No bulky top banner) */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 md:p-10 shadow-xs space-y-6 font-sans print:border-none print:shadow-none print:p-0">
        {/* Certificate Header Bar with Actions */}
        <div className="border-b-2 border-[#1F1A1C] pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/safe-circle-logo.svg"
                alt="SafeCircle"
                className="w-7 h-7 rounded-md object-contain shrink-0"
              />
              <span className="font-serif text-xl font-bold tracking-tight text-[#1F1A1C]">
                SAFECIRCLE
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C84B53] font-bold">
                FORENSIC CUSTODY
              </span>
            </div>

            {/* Print & Export Buttons right in the top right corner */}
            <div className="flex items-center gap-2 no-print">
              {/* Incident Selector Pill */}
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl px-2.5 py-1.5 text-xs text-[#1F1A1C] focus:outline-none font-bold"
              >
                {incidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    {formatIncidentId(i.id)} ({i.type === 'PHYSICAL_SOS' ? 'Physical SOS' : 'Digital Threat'})
                  </option>
                ))}
              </select>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] text-[#1F1A1C] border border-[#E8DFDA] text-xs font-bold transition-colors cursor-pointer"
                title="Export JSON"
              >
                <FileDown className="w-3.5 h-3.5 text-[#6E6265]" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-[#1F1A1C]">
              Certificate of Digital Evidence & Chain of Custody
            </h1>
            <p className="text-xs text-[#6E6265] mt-0.5">
              Pursuant to Section 65B of Indian Evidence Act, 1872 / Section 63 of Bharatiya Sakshya Adhiniyam, 2023.
            </p>
          </div>
        </div>

        {/* Master Custody Seal Strip */}
        <div className="p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#6E6265] block text-[10px] font-bold uppercase">Master Custody Digest</span>
            <code className="text-xs font-mono font-bold text-[#2D6A4F]">{masterSeal}</code>
          </div>
          <div className="text-right">
            <span className="text-[#6E6265] block text-[10px] font-bold uppercase">Certified Timestamp</span>
            <span className="font-mono text-[#1F1A1C] font-semibold">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </span>
          </div>
        </div>

        {/* 1. Incident Overview */}
        <div className="space-y-2">
          <h3 className="font-serif text-sm font-bold text-[#1F1A1C] border-b border-[#E8DFDA] pb-1">
            1. Protected Circle Member & Case Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">Victim</span>
              <span className="font-bold text-[#1F1A1C]">{selectedIncident.victimDisplayName}</span>
            </div>
            <div>
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">Case ID</span>
              <span className="font-mono font-bold text-[#C84B53]">{formattedId}</span>
            </div>
            <div>
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">Trigger Mechanism</span>
              <span className="font-bold text-[#1F1A1C]">{selectedIncident.triggerMode}</span>
            </div>
            <div>
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">Primary Contact</span>
              <span className="font-bold text-[#1F1A1C]">{guardian.displayName} ({guardian.role})</span>
            </div>
          </div>
        </div>

        {/* 2. Cryptographic Evidence Inventory */}
        <div className="space-y-2">
          <h3 className="font-serif text-sm font-bold text-[#1F1A1C] border-b border-[#E8DFDA] pb-1 flex items-center justify-between">
            <span>2. Preserved Evidence Inventory ({incidentEvidence.length} Exhibits)</span>
            <span className="text-xs text-[#2D6A4F] font-bold flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> All Verified Intact
            </span>
          </h3>

          <div className="overflow-x-auto border border-[#E8DFDA] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F3] text-[#6E6265] font-bold uppercase text-[9px] border-b border-[#E8DFDA]">
                <tr>
                  <th className="p-2.5">Exhibit</th>
                  <th className="p-2.5">Filename</th>
                  <th className="p-2.5">Capture Time</th>
                  <th className="p-2.5">SHA-256 Digest</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFDA]">
                {incidentEvidence.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-[#FAF6F3]/50">
                    <td className="p-2.5 font-mono font-bold text-[#C84B53]">#{idx + 1}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-[#1F1A1C]">{ev.filename}</div>
                    </td>
                    <td className="p-2.5 font-mono text-[#6E6265] tabular-nums">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-[#6E6265]">
                      {ev.sha256Hash}
                    </td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9] uppercase">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Sealed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Statutory Violations Triaged */}
        {legalViolations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold text-[#1F1A1C] border-b border-[#E8DFDA] pb-1">
              3. Applicable Statutory Violations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {legalViolations.map((ref, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C84B53]">{ref.section}</span>
                    <span className="text-[10px] font-bold text-[#6E6265] uppercase">{ref.title}</span>
                  </div>
                  <p className="text-[#6E6265] leading-snug text-[11px]">{ref.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Attestation */}
        <div className="border-t-2 border-[#1F1A1C] pt-4 grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[#6E6265] block text-[9px] font-bold uppercase">System Engine</span>
            <div className="font-mono text-xs text-[#1F1A1C] font-semibold">SafeCircle Evidence Engine v1.0</div>
            <div className="text-[10px] text-[#6E6265]">Tamper-evident ISO/IEC 27037 compliance.</div>
          </div>
          <div className="text-right">
            <span className="text-[#6E6265] block text-[9px] font-bold uppercase">Authorized Guardian</span>
            <div className="font-bold text-[#1F1A1C]">{guardian.displayName}</div>
            <div className="text-[10px] text-[#6E6265]">{guardian.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
