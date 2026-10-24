import React from 'react';
import {
  ShieldAlert,
  Film,
  Hash,
  Send,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot
} from 'lucide-react';
import type { TimelineEvent } from '../../types';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'SOS_TRIGGERED':
        return <ShieldAlert className="w-4 h-4 text-[#F0525F]" />;
      case 'STEALTH_RECORDING_STARTED':
        return <Film className="w-4 h-4 text-[#6EA8FE]" />;
      case 'EVIDENCE_HASHED':
        return <Hash className="w-4 h-4 text-[#38C6A3]" />;
      case 'TELEGRAM_ALERT_SENT':
        return <Send className="w-4 h-4 text-[#A99AFB]" />;
      case 'LOCATION_UPDATED':
        return <MapPin className="w-4 h-4 text-[#6EA8FE]" />;
      case 'AI_TRIAGE_COMPLETED':
        return <Bot className="w-4 h-4 text-[#E8B65C]" />;
      case 'GUARDIAN_ACKNOWLEDGED':
        return <ShieldCheck className="w-4 h-4 text-[#E8B65C]" />;
      case 'INCIDENT_RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-[#38C6A3]" />;
      default:
        return <Clock className="w-4 h-4 text-[#A0AEC4]" />;
    }
  };

  const getEventBorderClass = (eventType: string) => {
    switch (eventType) {
      case 'SOS_TRIGGERED':
        return 'border-[#F0525F]/50 bg-[#351C2A]';
      case 'GUARDIAN_ACKNOWLEDGED':
        return 'border-[#E8B65C]/50 bg-[#382B1B]';
      case 'INCIDENT_RESOLVED':
        return 'border-[#38C6A3]/50 bg-[#13332B]';
      default:
        return 'border-[#29364F] bg-[#1B2740]';
    }
  };

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#29364F] flex items-center justify-between bg-[#111A2E]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#1B2740] text-[#E8B65C] border border-[#29364F]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F3F6FC] leading-none">
              Incident Audit Trail & Timeline
            </h3>
            <p className="text-[11px] text-[#71809A] mt-0.5">
              Chronological, tamper-evident forensic log of alerts and updates
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#A0AEC4] border border-[#29364F] font-mono">
          {events.length} Events Logged
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="p-5 max-h-[460px] overflow-y-auto">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#29364F]">
          {events.map((evt, idx) => (
            <div key={evt.id} className="relative group">
              {/* Event node dot */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${getEventBorderClass(
                  evt.eventType
                )}`}
              >
                {getEventIcon(evt.eventType)}
              </div>

              {/* Event content card */}
              <div className="bg-[#111A2E] border border-[#29364F] rounded-xl p-3.5 space-y-1.5 transition-all group-hover:border-[#3B4D6E]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F3F6FC]">
                      {evt.title}
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#351C2A] border border-[#F0525F]/30 text-[#F0525F] text-[9px] font-bold uppercase tracking-wider">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#71809A] tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#A0AEC4] leading-relaxed">
                  {evt.description}
                </p>

                {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="pt-1.5 mt-1 border-t border-[#29364F]/50 flex flex-wrap gap-2 text-[10px] font-mono text-[#71809A]">
                    {Object.entries(evt.metadata).map(([key, val]) => (
                      <span key={key} className="bg-[#0E1426] px-1.5 py-0.5 rounded border border-[#29364F]">
                        {key}: <strong className="text-[#A0AEC4]">{String(val).slice(0, 24)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-[#29364F] bg-[#111A2E] text-[11px] text-[#71809A] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E8B65C]" />
          Immutable hash verification active
        </span>
        <span className="font-mono text-[#6EA8FE]">Section 65B Audit Chain</span>
      </div>
    </div>
  );
};
