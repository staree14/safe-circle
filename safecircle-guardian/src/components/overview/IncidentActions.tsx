import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Check,
  PhoneCall,
  Share2,
  Copy,
  Phone
} from 'lucide-react';
import type { Incident } from '../../types';
import { useGuardian } from '../../context/GuardianContext';

interface IncidentActionsProps {
  incident: Incident;
}

export const IncidentActions: React.FC<IncidentActionsProps> = ({ incident }) => {
  const navigate = useNavigate();
  const { acknowledgeIncident, resolveIncident, guardian, addToast } = useGuardian();
  const [copiedText, setCopiedText] = useState(false);

  const isResolved = incident.status === 'RESOLVED';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';

  const guardianLink = `${window.location.origin}/guardian/${incident.accessToken}`;
  const addressText = incident.location?.landmark
    ? `${incident.location.label} (${incident.location.landmark})`
    : incident.location?.label || 'Live GPS Coordinates';

  const dispatchMessage = `🚨 EMERGENCY: ${incident.victimDisplayName} triggered SOS at ${addressText}. Battery: ${incident.batteryLevel}%. Live tracking: ${guardianLink}`;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(dispatchMessage)}`;

  const handleAcknowledge = () => {
    acknowledgeIncident(incident.id, `${guardian.displayName} (Sister / Primary Contact)`);
  };

  const handleResolve = () => {
    resolveIncident(incident.id, `Incident marked resolved by ${guardian.displayName}. Victim safely assisted.`);
  };

  const handleDownloadPdf = () => {
    navigate(`/reports?incidentId=${incident.id}`);
  };

  const handleCopyDispatchText = () => {
    navigator.clipboard.writeText(dispatchMessage);
    setCopiedText(true);
    addToast({
      title: 'Dispatch Text Copied',
      message: 'Emergency summary copied to clipboard for SMS or radio dispatch.',
      type: 'info',
    });
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DFDA] pb-3">
        <div>
          <h3 className="font-serif text-base font-bold text-[#1F1A1C] leading-none">
            Emergency Dispatch & Actions
          </h3>
          <p className="text-[11px] text-[#6E6265] mt-1">
            Rapid dialer, authority dispatch & status update
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6F3] border border-[#E8DFDA] text-[#6E6265] font-semibold uppercase">
          Authorized Contact
        </span>
      </div>

      {/* Emergency Quick-Dialer & Instant Dispatch Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C84B53] flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-[#C84B53] animate-pulse" />
            <span>Emergency Quick-Dialer</span>
          </span>
          <span className="text-[10px] font-mono text-[#6E6265]">Zero Hold Time</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* 112 Police Quick Call */}
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-xs"
            title="Dial 112 All-India Emergency Response Support System (Police, Fire, Ambulance)"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 112 (Police)</span>
          </a>

          {/* 1091 Women Helpline Quick Call */}
          <a
            href="tel:1091"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1F1A1C] hover:bg-[#332C2E] text-white text-xs font-bold transition-all shadow-xs"
            title="Dial 1091 National Women Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 1091 (Women)</span>
          </a>
        </div>

        {/* WhatsApp SOS Dispatch Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#128C7E] text-xs font-bold transition-all"
            title="Send pre-filled emergency dispatch message to WhatsApp contacts or police group"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Dispatch on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopyDispatchText}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-xs font-semibold text-[#1F1A1C] transition-colors cursor-pointer"
            title="Copy pre-filled text for SMS dispatch"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="text-[#2D6A4F] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6E6265]" />
                <span>Copy SMS Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Acknowledge Button */}
      <div className="space-y-2.5">
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
