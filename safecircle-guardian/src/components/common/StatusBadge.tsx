import React from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { IncidentStatus } from '../../types';

interface StatusBadgeProps {
  status: IncidentStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const normalized = status.toUpperCase();

  let bgClass = 'bg-[#1B2740] border-[#29364F] text-[#A0AEC4]';
  let icon = <Info className="w-3.5 h-3.5" />;

  switch (normalized) {
    case 'ACTIVE':
      bgClass = 'bg-[#351C2A] border-[#F0525F]/40 text-[#F0525F]';
      icon = <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />;
      break;
    case 'ACKNOWLEDGED':
      bgClass = 'bg-[#382B1B] border-[#E8B65C]/40 text-[#E8B65C]';
      icon = <ShieldCheck className="w-3.5 h-3.5" />;
      break;
    case 'RESOLVED':
      bgClass = 'bg-[#13332B] border-[#38C6A3]/40 text-[#38C6A3]';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    case 'CRITICAL':
      bgClass = 'bg-[#40141E] border-[#F0525F] text-[#F0525F]';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      break;
    case 'HIGH':
      bgClass = 'bg-[#38201C] border-[#F97316]/50 text-[#FB923C]';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      break;
    case 'MEDIUM':
      bgClass = 'bg-[#332B1A] border-[#EAB308]/40 text-[#FACC15]';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      break;
    case 'LOW':
      bgClass = 'bg-[#192742] border-[#6EA8FE]/30 text-[#6EA8FE]';
      icon = <Info className="w-3.5 h-3.5" />;
      break;
    case 'VERIFICATION_PASSED':
      bgClass = 'bg-[#13332B] border-[#38C6A3]/30 text-[#38C6A3]';
      icon = <CheckCircle2 className="w-3 h-3" />;
      break;
  }

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm gap-2 font-semibold'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase tabular-nums ${bgClass} ${sizeClass}`}
      role="status"
    >
      {showIcon && icon}
      <span>{normalized.replace('_', ' ')}</span>
    </span>
  );
};
