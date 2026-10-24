import React from 'react';
import { User, Phone, Battery, Clock, Users, Shield, Radio, CheckCircle2 } from 'lucide-react';
import type { Incident } from '../../types';

interface VictimTelemetryStripProps {
  incident: Incident;
}

export const VictimTelemetryStrip: React.FC<VictimTelemetryStripProps> = ({ incident }) => {
  const isAck = incident.status === 'ACKNOWLEDGED';

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFDA] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] flex items-center justify-center font-serif font-bold text-base text-[#1F1A1C]">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#1F1A1C]">
                {incident.victimDisplayName}
              </h3>
              <span className="font-mono text-xs text-[#6E6265]">
                {incident.victimPhone}
              </span>
            </div>
            <p className="text-[11px] text-[#6E6265]">
              SafeCircle Protected Member • Live Telemetry Stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAck ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Status: Acknowledged
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDECEE] border border-[#F7D0D4] text-[#C84B53] text-xs font-bold uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5 text-[#C84B53]" />
              Status: Active Emergency
            </span>
          )}
        </div>
      </div>

      {/* 4 Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Battery */}
        <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6E6265]">
            <span className="font-semibold">Battery</span>
            <Battery className="w-3.5 h-3.5 text-[#2D6A4F]" />
          </div>
          <div className="text-base font-bold text-[#1F1A1C] tabular-nums">
            {incident.batteryLevel}%
          </div>
          <div className="text-[10px] text-[#2D6A4F] font-bold">
            Power Save Active
          </div>
        </div>

        {/* Metric 2: Trigger Mode */}
        <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6E6265]">
            <span className="font-semibold">Entry Mode</span>
            <Shield className="w-3.5 h-3.5 text-[#C84B53]" />
          </div>
          <div className="text-xs font-bold text-[#1F1A1C] truncate" title={incident.triggerMode}>
            Calculator Camouflage
          </div>
          <div className="text-[10px] font-mono text-[#C84B53] font-bold">
            PIN: 112= Trigger
          </div>
        </div>

        {/* Metric 3: Triggered Time */}
        <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6E6265]">
            <span className="font-semibold">Activated</span>
            <Clock className="w-3.5 h-3.5 text-[#6E6265]" />
          </div>
          <div className="text-base font-bold text-[#1F1A1C] tabular-nums">
            5:09 PM
          </div>
          <div className="text-[10px] text-[#6E6265] font-mono">
            Indian Standard Time
          </div>
        </div>

        {/* Metric 4: Circle Members */}
        <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6E6265]">
            <span className="font-semibold">Shared Circle</span>
            <Users className="w-3.5 h-3.5 text-[#2D6A4F]" />
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-[10px] font-bold flex items-center justify-center border border-[#C8E6C9]">
              PS
            </span>
            <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-[10px] font-bold flex items-center justify-center border border-[#C8E6C9]">
              RM
            </span>
            <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-[10px] font-bold flex items-center justify-center border border-[#C8E6C9]">
              KS
            </span>
          </div>
          <div className="text-[10px] text-[#6E6265] truncate font-medium">
            Aditi (Primary Sister)
          </div>
        </div>
      </div>
    </div>
  );
};
