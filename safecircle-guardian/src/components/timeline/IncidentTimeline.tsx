import React from 'react';
import {
  ShieldAlert,
  Hash,
  Send,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bot,
  FileCheck2
} from 'lucide-react';
import type { TimelineEvent } from '../../types';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'SOS_TRIGGERED':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#C84B53]" />;
      case 'STEALTH_RECORDING_STARTED':
      case 'EVIDENCE_HASHED':
        return <Hash className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      case 'TELEGRAM_ALERT_SENT':
        return <Send className="w-3.5 h-3.5 text-[#C84B53]" />;
      case 'LOCATION_UPDATED':
        return <MapPin className="w-3.5 h-3.5 text-[#C84B53]" />;
      case 'AI_TRIAGE_COMPLETED':
        return <Bot className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'GUARDIAN_ACKNOWLEDGED':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      case 'REPORT_SHARED':
        return <FileCheck2 className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      case 'INCIDENT_RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#6E6265]" />;
    }
  };

  const getEventBadgeClass = (eventType: string) => {
    switch (eventType) {
      case 'SOS_TRIGGERED':
        return 'border-[#F7D0D4] bg-[#FDECEE]';
      case 'GUARDIAN_ACKNOWLEDGED':
      case 'EVIDENCE_HASHED':
      case 'INCIDENT_RESOLVED':
      case 'REPORT_SHARED':
        return 'border-[#C8E6C9] bg-[#E8F5E9]';
      default:
        return 'border-[#E8DFDA] bg-[#FAF6F3]';
    }
  };

  // Convert descriptions to crisp, 1-line scannable items
  const formatShortDescription = (evt: TimelineEvent) => {
    if (evt.eventType === 'SOS_TRIGGERED') return 'SOS triggered via Calculator (112=)';
    if (evt.eventType === 'TELEGRAM_ALERT_SENT') return 'Telegram alert & live link sent to Aditi';
    if (evt.eventType === 'EVIDENCE_HASHED') return evt.description.replace('cryptographically hashed with SHA-256 seal', 'sealed (SHA-256)');
    if (evt.eventType === 'GUARDIAN_ACKNOWLEDGED') return evt.description;
    if (evt.eventType === 'LOCATION_UPDATED') return 'Live GPS ping: Palace Road towards Malleswaram';
    if (evt.eventType === 'AI_TRIAGE_COMPLETED') return 'Critical Threat: "I\'m coming for you tomorrow"';
    if (evt.eventType === 'REPORT_SHARED') return 'Vault evidence shared with Aditi Sharma';
    if (evt.eventType === 'INCIDENT_RESOLVED') return 'Incident resolved • Victim safely assisted';
    return evt.description;
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-[#E8DFDA] flex items-center justify-between bg-[#FFFFFF]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C84B53]" />
          <h3 className="font-serif text-sm font-bold text-[#1F1A1C] leading-none">
            Incident Timeline
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6F3] text-[#6E6265] border border-[#E8DFDA] font-mono font-bold">
          {events.length} Events
        </span>
      </div>

      {/* Scannable Compact Timeline Feed */}
      <div className="p-3.5 max-h-[300px] overflow-y-auto">
        <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DFDA]">
          {events.map((evt, idx) => (
            <div key={evt.id} className="relative flex items-start gap-2.5 group">
              {/* Event node dot */}
              <div
                className={`absolute -left-5 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${getEventBadgeClass(
                  evt.eventType
                )}`}
              >
                {getEventIcon(evt.eventType)}
              </div>

              {/* 1-Line Scannable Entry */}
              <div className="flex-1 min-w-0 bg-[#FAF6F3] rounded-lg px-2.5 py-1.5 border border-[#E8DFDA] hover:border-[#C84B53]/30 transition-colors">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#C84B53] shrink-0 tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[11px] font-bold text-[#1F1A1C] truncate flex-1">
                    {evt.title}
                  </span>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-[#FDECEE] border border-[#F7D0D4] text-[#C84B53] text-[9px] font-bold uppercase tracking-wider shrink-0">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6E6265] truncate mt-0.5">
                  {formatShortDescription(evt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
