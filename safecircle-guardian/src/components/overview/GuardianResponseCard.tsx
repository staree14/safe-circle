import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, Copy, Check, Share2, AlertCircle } from 'lucide-react';
import type { Incident } from '../../types';
import { useGuardian } from '../../context/GuardianContext';

interface GuardianResponseCardProps {
  incident: Incident;
}

export const GuardianResponseCard: React.FC<GuardianResponseCardProps> = ({ incident }) => {
  const { guardian, addToast } = useGuardian();
  const [copied, setCopied] = useState(false);

  const capabilityUrl = `${window.location.origin}/guardian/${incident.accessToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(capabilityUrl);
    setCopied(true);
    addToast({
      title: 'Stream Link Copied',
      message: 'Secure emergency stream URL copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const isAck = incident.status === 'ACKNOWLEDGED';
  const isRes = incident.status === 'RESOLVED';

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFDA] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1F1A1C] leading-none">
                Guardian Dispatch Panel
              </h3>
              <span className="text-[11px] text-[#6E6265]">
                Verification & Trusted Circle
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] uppercase font-bold">
            Primary Guardian
          </span>
        </div>

        {/* Status Pipeline */}
        <div className="space-y-3 text-xs">
          {/* Active Guardian On Duty */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265]">Primary Contact</span>
            <span className="font-bold text-[#1F1A1C] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
              {guardian.displayName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#6E6265]">Relationship</span>
            <span className="text-[#1F1A1C] font-medium">{guardian.role}</span>
          </div>

          {/* Acknowledgement State */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265]">Acknowledgment</span>
            {isAck || isRes ? (
              <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F] font-bold border border-[#C8E6C9] flex items-center gap-1">
                <Check className="w-3 h-3" />
                Acknowledged by {incident.acknowledgedBy || guardian.displayName}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#FDECEE] text-[#C84B53] font-bold border border-[#F7D0D4] flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Pending Acknowledgment
              </span>
            )}
          </div>

          {/* Resolution State */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265]">Incident State</span>
            {isRes ? (
              <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F] font-bold border border-[#C8E6C9] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Finalized / Safe
              </span>
            ) : (
              <span className="text-[#C84B53] font-bold">Active Stream</span>
            )}
          </div>

          {/* Emergency Telegram Dispatch status */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E8DFDA]">
            <span className="text-[#6E6265]">Circle Broadcast</span>
            <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Telegram Dispatch Sent
            </span>
          </div>
        </div>

        {/* Capability Link Box */}
        <div className="mt-4 p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#1F1A1C] font-semibold flex items-center gap-1">
              <Share2 className="w-3 h-3 text-[#C84B53]" />
              Secure Capability Stream Link
            </span>
            <span className="text-[10px] text-[#6E6265]">Direct Access</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={capabilityUrl}
              className="flex-1 bg-[#FFFFFF] border border-[#E8DFDA] rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#6E6265] select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-[#1F1A1C] transition-colors"
              title="Copy Capability URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2D6A4F]" /> : <Copy className="w-3.5 h-3.5 text-[#6E6265]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
