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

  let batteryColor = 'text-[#2D6A4F]';
  if (incident.batteryLevel < 20) batteryColor = 'text-[#C84B53]';
  else if (incident.batteryLevel < 50) batteryColor = 'text-[#D97706]';

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFDA] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-[#C84B53]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1F1A1C] leading-none">
                Protected Member Profile
              </h3>
              <span className="text-[11px] text-[#6E6265]">
                SafeCircle Circle Network
              </span>
            </div>
          </div>
          <StatusBadge status={incident.status} size="sm" />
        </div>

        {/* Profile Details List */}
        <div className="space-y-3 text-xs">
          {/* Victim Name & Phone */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Name
            </span>
            <span className="font-bold text-[#1F1A1C]">
              {incident.victimDisplayName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Phone
            </span>
            <span className="font-mono text-[#1F1A1C]">
              {incident.victimPhone}
            </span>
          </div>

          {/* Incident Type */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Type
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF6F3] font-bold text-[#1F1A1C] border border-[#E8DFDA]">
              {isPhysical ? 'Physical Emergency SOS' : 'Digital Threat Vault'}
            </span>
          </div>

          {/* Trigger Mode */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265]">Trigger Mechanism</span>
            <span className="font-mono text-[11px] text-[#C84B53] font-bold bg-[#FDECEE] px-2 py-0.5 rounded border border-[#F7D0D4]">
              {incident.triggerMode}
            </span>
          </div>

          {/* Activation Time */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Activated
            </span>
            <span className="tabular-nums font-mono text-[#1F1A1C]">
              {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </span>
          </div>

          {/* Battery Level */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5" />
              Battery
            </span>
            <span className={`font-mono font-bold tabular-nums flex items-center gap-1.5 ${batteryColor}`}>
              <span>{incident.batteryLevel}%</span>
              <span className="text-[10px] text-[#6E6265] font-normal">
                (Power Save Active)
              </span>
            </span>
          </div>

          {/* Evidence Count */}
          <div className="flex items-center justify-between">
            <span className="text-[#6E6265] flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Evidence Sealed
            </span>
            <span className="px-2 py-0.5 rounded bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] font-bold tabular-nums">
              {evidenceCount} Exhibits
            </span>
          </div>

          {/* Location Summary */}
          <div className="pt-2 border-t border-[#E8DFDA]">
            <div className="text-[11px] text-[#6E6265] mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C84B53]" />
              Transit Corridor:
            </div>
            <p className="text-xs text-[#1F1A1C] font-semibold leading-relaxed">
              {incident.location.label}
            </p>
            {incident.location.landmark && (
              <p className="text-[11px] text-[#6E6265] mt-0.5">
                {incident.location.landmark}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
