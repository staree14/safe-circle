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
  let borderClass = 'border-[#29364F]';
  let iconBgClass = 'bg-[#1B2740] text-[#6EA8FE]';

  if (variant === 'emergency') {
    borderClass = 'border-[#F0525F]/40 bg-[#1A1829]';
    iconBgClass = 'bg-[#351C2A] text-[#F0525F]';
  } else if (variant === 'warning') {
    borderClass = 'border-[#E8B65C]/40 bg-[#1D1E2A]';
    iconBgClass = 'bg-[#382B1B] text-[#E8B65C]';
  } else if (variant === 'success') {
    borderClass = 'border-[#38C6A3]/40 bg-[#14232B]';
    iconBgClass = 'bg-[#13332B] text-[#38C6A3]';
  }

  return (
    <div
      className={`rounded-2xl border p-4 bg-[#151F35] flex items-center justify-between gap-3 shadow-md transition-all hover:border-[#3B4D6E] ${borderClass}`}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#71809A]">
          {label}
        </span>
        <div className="text-xl font-bold tracking-tight text-[#F3F6FC] tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-[#A0AEC4] tabular-nums flex items-center gap-1.5">
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl border border-[#29364F] shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
    </div>
  );
};
