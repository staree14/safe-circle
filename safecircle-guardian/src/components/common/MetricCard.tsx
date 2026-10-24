import React from 'react';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'emergency' | 'warning' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'default',
}) => {
  let borderClass = 'border-[#E8DFDA]';
  let iconBgClass = 'bg-[#FAF6F3] text-[#6E6265] border-[#E8DFDA]';

  if (variant === 'emergency') {
    borderClass = 'border-[#F7D0D4] bg-[#FFFFFF] shadow-sm';
    iconBgClass = 'bg-[#FDECEE] text-[#C84B53] border-[#F7D0D4]';
  } else if (variant === 'warning') {
    borderClass = 'border-[#FFE082] bg-[#FFFFFF] shadow-sm';
    iconBgClass = 'bg-[#FFF3E0] text-[#D97706] border-[#FFE082]';
  } else if (variant === 'success') {
    borderClass = 'border-[#C8E6C9] bg-[#FFFFFF] shadow-sm';
    iconBgClass = 'bg-[#E8F5E9] text-[#2D6A4F] border-[#C8E6C9]';
  }

  return (
    <div
      className={`rounded-2xl border p-4 bg-[#FFFFFF] flex items-center justify-between gap-3 shadow-xs transition-all hover:shadow-md ${borderClass}`}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6265]">
          {label}
        </span>
        <div className="text-xl font-bold tracking-tight text-[#1F1A1C] tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-[#6E6265] tabular-nums flex items-center gap-1.5 font-medium">
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl border shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
    </div>
  );
};
