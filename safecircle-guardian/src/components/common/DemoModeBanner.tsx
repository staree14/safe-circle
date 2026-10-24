import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

export const DemoModeBanner: React.FC = () => {
  const { resetDemoState } = useGuardian();

  return (
    <div className="bg-[#151F35] border-b border-[#29364F] px-4 py-1.5 text-xs text-[#A0AEC4] flex flex-wrap items-center justify-between gap-2 no-print">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1B2740] border border-[#29364F] text-[#E8B65C] font-semibold text-[11px] tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-[#E8B65C]" />
          Demo Environment
        </span>
        <span className="text-[#A0AEC4] hidden sm:inline">
          Illustrative preview mode: GPS, evidence chunks, and verification seals are simulated for authority training and review.
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <span className="text-[#71809A] hidden md:inline">
          Backend Target: <code className="text-[#6EA8FE] font-mono text-[11px]">localhost:8000</code>
        </span>
        <button
          onClick={resetDemoState}
          title="Reset local demo data to initial state"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-[#F3F6FC] transition-colors cursor-pointer text-[11px]"
        >
          <RefreshCw className="w-3 h-3 text-[#A0AEC4]" />
          Reset Demo State
        </button>
      </div>
    </div>
  );
};
