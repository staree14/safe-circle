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
  const normalized = (status || '').toUpperCase();

  let bgClass = 'bg-[#FAF6F3] border-[#E8DFDA] text-[#6E6265]';
  let icon = <Info className="w-3.5 h-3.5" />;

  switch (normalized) {
    case 'ACTIVE':
      bgClass = 'bg-[#FDECEE] border-[#F7D0D4] text-[#C84B53] font-bold';
      icon = <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-[#C84B53]" />;
      break;
    case 'ACKNOWLEDGED':
      bgClass = 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2D6A4F] font-bold';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      break;
    case 'RESOLVED':
      bgClass = 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2D6A4F] font-bold';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      break;
    case 'CRITICAL':
      bgClass = 'bg-[#FDECEE] border-[#F7D0D4] text-[#A8323B] font-bold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-[#A8323B]" />;
      break;
    case 'HIGH':
      bgClass = 'bg-[#FFF3E0] border-[#FFE082] text-[#D97706] font-bold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />;
      break;
    case 'MEDIUM':
      bgClass = 'bg-[#FFF8E1] border-[#FFE082] text-[#B45309] font-bold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />;
      break;
    case 'LOW':
      bgClass = 'bg-[#F1F5F9] border-[#E2E8F0] text-[#475569] font-bold';
      icon = <Info className="w-3.5 h-3.5 text-[#475569]" />;
      break;
    case 'VERIFICATION_PASSED':
      bgClass = 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2D6A4F] font-bold';
      icon = <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />;
      break;
  }

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm gap-2 font-bold'
      : 'px-2.5 py-1 text-xs gap-1.5 font-bold';

  return (
    <span
      className={`inline-flex items-center rounded-lg border tracking-wide uppercase tabular-nums ${bgClass} ${sizeClass}`}
      role="status"
    >
      {showIcon && icon}
      <span>{normalized.replace(/_/g, ' ')}</span>
    </span>
  );
};
