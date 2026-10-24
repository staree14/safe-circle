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
      title: 'Capability Link Copied',
      message: 'Secure emergency access URL copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const isAck = incident.status === 'ACKNOWLEDGED';
  const isRes = incident.status === 'RESOLVED';

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#29364F] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#E8B65C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FC] leading-none">
                Guardian Response Panel
              </h3>
              <span className="text-[11px] text-[#71809A]">
                Dispatch & Verification Status
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#A0AEC4] border border-[#29364F] uppercase font-mono">
            Demo Responder
          </span>
        </div>

        {/* Status Pipeline */}
        <div className="space-y-3.5 text-xs">
          {/* Active Guardian On Duty */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A]">Primary Contact</span>
            <span className="font-semibold text-[#F3F6FC] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#38C6A3]" />
              {guardian.displayName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#71809A]">Relationship Role</span>
            <span className="text-[#A0AEC4] font-medium">{guardian.role}</span>
          </div>

          {/* Acknowledgement State */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A]">Acknowledgment</span>
            {isAck || isRes ? (
              <span className="px-2 py-0.5 rounded bg-[#382B1B] text-[#E8B65C] font-semibold border border-[#E8B65C]/40 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Acknowledged by {incident.acknowledgedBy || guardian.displayName}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#351C2A] text-[#F0525F] font-semibold border border-[#F0525F]/40 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Pending Acknowledgment
              </span>
            )}
          </div>

          {/* Resolution State */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A]">Resolution State</span>
            {isRes ? (
              <span className="px-2 py-0.5 rounded bg-[#13332B] text-[#38C6A3] font-semibold border border-[#38C6A3]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Finalized / Safe
              </span>
            ) : (
              <span className="text-[#A0AEC4]">Active Monitoring</span>
            )}
          </div>

          {/* Emergency Telegram Dispatch status */}
          <div className="flex items-center justify-between pt-2 border-t border-[#29364F]/60">
            <span className="text-[#71809A]">Telegram Dispatch</span>
            <span className="text-[#38C6A3] font-mono flex items-center gap-1">
              <Check className="w-3 h-3" />
              Broadcast Sent (Demo)
            </span>
          </div>
        </div>

        {/* Capability Link Box */}
        <div className="mt-4 p-3 rounded-xl bg-[#0E1426] border border-[#29364F] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#A0AEC4] font-medium flex items-center gap-1">
              <Share2 className="w-3 h-3 text-[#6EA8FE]" />
              Capability Stream Link
            </span>
            <span className="text-[10px] text-[#71809A]">No login required</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={capabilityUrl}
              className="flex-1 bg-[#151F35] border border-[#29364F] rounded-lg px-2 py-1 text-[11px] font-mono text-[#A0AEC4] select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-[#F3F6FC] transition-colors"
              title="Copy Capability URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#38C6A3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#71809A] flex items-center justify-between">
        <span>Channel:</span>
        <span className="text-[#A0AEC4]">Telegram Bot API & Direct Web PWA</span>
      </div>
    </div>
  );
};
