import React from 'react';
import { User, Phone, MapPin, Battery, Film, Shield, Clock } from 'lucide-react';
import type { Incident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface VictimInfoCardProps {
  incident: Incident;
  evidenceCount: number;
}

export const VictimInfoCard: React.FC<VictimInfoCardProps> = ({ incident, evidenceCount }) => {
  const isPhysical = incident.type === 'PHYSICAL_SOS';

  let batteryColor = 'text-[#38C6A3]';
  if (incident.batteryLevel < 20) batteryColor = 'text-[#F0525F]';
  else if (incident.batteryLevel < 50) batteryColor = 'text-[#E8B65C]';

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#29364F] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#6EA8FE]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FC] leading-none">
                Victim & Incident Profile
              </h3>
              <span className="text-[11px] text-[#71809A]">
                Protected Circle Member
              </span>
            </div>
          </div>
          <StatusBadge status={incident.status} size="sm" />
        </div>

        {/* Profile Details List */}
        <div className="space-y-3.5 text-xs">
          {/* Victim Name & Phone */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Victim Name
            </span>
            <span className="font-semibold text-[#F3F6FC]">
              {incident.victimDisplayName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Registered Phone
            </span>
            <span className="font-mono text-[#A0AEC4]">
              {incident.victimPhone}
            </span>
          </div>

          {/* Incident Type */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Incident Type
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1B2740] font-medium text-[#F3F6FC]">
              {isPhysical ? 'Physical Emergency SOS' : 'Digital Threat Vault'}
            </span>
          </div>

          {/* Trigger Mode */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A]">Trigger Mechanism</span>
            <span className="font-mono text-[11px] text-[#A0AEC4] bg-[#111A2E] px-2 py-0.5 rounded border border-[#29364F]">
              {incident.triggerMode}
            </span>
          </div>

          {/* Activation Time */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Activated At
            </span>
            <span className="tabular-nums font-mono text-[#A0AEC4]">
              {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Battery Level */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5" />
              Device Battery
            </span>
            <span className={`font-mono font-bold tabular-nums flex items-center gap-1.5 ${batteryColor}`}>
              <span>{incident.batteryLevel}%</span>
              <span className="text-[10px] text-[#71809A] font-normal">
                {incident.batteryLevel > 70 ? '(Optimal)' : '(Monitor)'}
              </span>
            </span>
          </div>

          {/* Evidence Count */}
          <div className="flex items-center justify-between">
            <span className="text-[#71809A] flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Preserved Artifacts
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1B2740] border border-[#29364F] text-[#38C6A3] font-bold tabular-nums">
              {evidenceCount} Chunks Sealed
            </span>
          </div>

          {/* Location Summary */}
          <div className="pt-2 border-t border-[#29364F]/60">
            <div className="text-[11px] text-[#71809A] mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F0525F]" />
              Latest Location (Simulated Demo Pin)
            </div>
            <p className="text-xs text-[#F3F6FC] font-medium leading-relaxed">
              {incident.location.label}
            </p>
            {incident.location.landmark && (
              <p className="text-[11px] text-[#71809A] mt-0.5">
                {incident.location.landmark}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#29364F] text-[11px] text-[#71809A] flex items-center justify-between">
        <span>Capability Access:</span>
        <span className="font-mono text-[#6EA8FE] truncate max-w-[140px]" title={incident.accessToken}>
          {incident.accessToken.slice(0, 16)}...
        </span>
      </div>
    </div>
  );
};
