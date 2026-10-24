import React, { useState } from 'react';
import {
  Users,
  Navigation,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Radio,
  Send,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import type { GuardianCoordinationStatus } from '../../types';

export const MultiGuardianCoordination: React.FC = () => {
  const { guardianCoordination, updateGuardianStatus, guardian } = useGuardian();
  const [selectedAction, setSelectedAction] = useState<GuardianCoordinationStatus['statusAction']>('NAVIGATING_TO_VICTIM');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionOptions: {
    action: GuardianCoordinationStatus['statusAction'];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      action: 'NAVIGATING_TO_VICTIM',
      label: 'On My Way (Navigating)',
      icon: Navigation,
      color: 'bg-[#C84B53] text-white border-[#C84B53]',
    },
    {
      action: 'CALLED_112',
      label: 'Calling 112 / Police',
      icon: PhoneCall,
      color: 'bg-[#FAF6F3] text-[#1F1A1C] border-[#E8DFDA] hover:bg-[#F3ECE8]',
    },
    {
      action: 'AT_SCENE',
      label: 'At Scene with Victim',
      icon: MapPin,
      color: 'bg-[#FAF6F3] text-[#1F1A1C] border-[#E8DFDA] hover:bg-[#F3ECE8]',
    },
    {
      action: 'MONITORING_STREAM',
      label: 'Monitoring Live Stream',
      icon: Radio,
      color: 'bg-[#FAF6F3] text-[#1F1A1C] border-[#E8DFDA] hover:bg-[#F3ECE8]',
    },
    {
      action: 'CONFIRMED_SAFE',
      label: 'Confirmed Safe & Secure',
      icon: CheckCircle2,
      color: 'bg-[#FAF6F3] text-[#1F1A1C] border-[#E8DFDA] hover:bg-[#F3ECE8]',
    },
  ];

  const handleBroadcastStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedOption = actionOptions.find((o) => o.action === selectedAction);
    const label = selectedOption ? selectedOption.label : 'Response Active';
    await updateGuardianStatus(selectedAction, label, customNote.trim() || undefined);
    setCustomNote('');
    setIsSubmitting(false);
  };

  const getActionBadge = (action: GuardianCoordinationStatus['statusAction']) => {
    switch (action) {
      case 'NAVIGATING_TO_VICTIM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FDECEE] border border-[#F7D0D4] text-[#A8323B] text-[11px] font-bold">
            <Navigation className="w-3 h-3 text-[#C84B53] animate-pulse" />
            <span>En Route / Navigating</span>
          </span>
        );
      case 'CALLED_112':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF8E1] border border-[#FFE082] text-[#B78103] text-[11px] font-bold">
            <PhoneCall className="w-3 h-3 text-[#B78103]" />
            <span>Contacted 112 Police</span>
          </span>
        );
      case 'AT_SCENE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-[11px] font-bold">
            <MapPin className="w-3 h-3 text-[#2D6A4F]" />
            <span>At Scene</span>
          </span>
        );
      case 'CONFIRMED_SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-[#00695C]" />
            <span>Confirmed Safe</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0FE] border border-[#D2E3FC] text-[#1967D2] text-[11px] font-bold">
            <Radio className="w-3 h-3 text-[#1967D2]" />
            <span>Monitoring Stream</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFDA] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-[#C84B53]">
            <Users className="w-5 h-5 text-[#C84B53]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1F1A1C] leading-none">
              Multi-Guardian Coordination Log
            </h3>
            <p className="text-xs text-[#6E6265] mt-1">
              Synchronized circle statuses to prevent duplicate calls or confusion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-ping" />
            <span>{guardianCoordination.length} Responders Synced</span>
          </span>
        </div>
      </div>

      {/* Responder Quick Status Updater Form */}
      <form onSubmit={handleBroadcastStatus} className="p-4 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1F1A1C] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C84B53]" />
            <span>Update Your Live Status ({guardian.displayName})</span>
          </span>
          <span className="text-[11px] text-[#6E6265]">Broadcasts instantly to all contacts</span>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap gap-2">
          {actionOptions.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = selectedAction === opt.action;
            return (
              <button
                key={opt.action}
                type="button"
                onClick={() => setSelectedAction(opt.action)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F1A1C] text-white border-[#1F1A1C] shadow-xs'
                    : 'bg-white text-[#6E6265] border-[#E8DFDA] hover:bg-[#F3ECE8]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Note & Submit Button */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add quick detail (e.g. ETA 5 mins, driving south on MG Road, police notified...)"
            className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#E8DFDA] text-xs text-[#1F1A1C] placeholder-[#9E9093] focus:outline-none focus:border-[#C84B53] focus:ring-1 focus:ring-[#C84B53]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Status</span>
          </button>
        </div>
      </form>

      {/* Responders Live Roster List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6265]">
          Active Trusted Circle Roster
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guardianCoordination.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.isCurrentUser
                  ? 'bg-[#FFFFFF] border-[#C84B53]/40 shadow-xs ring-1 ring-[#C84B53]/20'
                  : 'bg-[#FFFFFF] border-[#E8DFDA] shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#1F1A1C]">
                      {item.guardianName}
                    </span>
                    {item.isCurrentUser && (
                      <span className="px-1.5 py-0.2 bg-[#FDECEE] text-[#A8323B] rounded text-[9px] font-bold uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6E6265] block">
                    {item.role}
                  </span>
                </div>

                {getActionBadge(item.statusAction)}
              </div>

              {item.note && (
                <p className="mt-2 text-xs text-[#1F1A1C] bg-[#FAF6F3] p-2 rounded-lg border border-[#E8DFDA] italic">
                  "{item.note}"
                </p>
              )}

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#6E6265] border-t border-[#F3ECE8] pt-1.5">
                <span className="font-medium text-[#1F1A1C]">
                  {item.statusLabel}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{item.timestamp}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
