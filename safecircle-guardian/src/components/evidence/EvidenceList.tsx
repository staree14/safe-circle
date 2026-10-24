import React, { useState } from 'react';
import { Film, PlusCircle, FolderSearch } from 'lucide-react';
import type { Evidence } from '../../types';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceDetailModal } from './EvidenceDetailModal';
import { useGuardian } from '../../context/GuardianContext';

interface EvidenceListProps {
  evidenceList: Evidence[];
  incidentId: string;
  showSimulateButton?: boolean;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidenceList,
  incidentId,
  showSimulateButton = true,
}) => {
  const { simulateIncomingEvidence } = useGuardian();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const selectedIndex = selectedEvidence
    ? evidenceList.findIndex((e) => e.id === selectedEvidence.id)
    : -1;

  const handleNext = () => {
    if (selectedIndex < evidenceList.length - 1) {
      setSelectedEvidence(evidenceList[selectedIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedEvidence(evidenceList[selectedIndex - 1]);
    }
  };

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#29364F] flex flex-wrap items-center justify-between gap-3 bg-[#111A2E]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#1B2740] text-[#6EA8FE] border border-[#29364F]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F3F6FC] leading-none">
                Preserved Evidence Stream
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#1B2740] border border-[#29364F] text-[#38C6A3] text-[10px] font-bold tabular-nums">
                {evidenceList.length} Chunks
              </span>
            </div>
            <p className="text-[11px] text-[#71809A] mt-0.5">
              Continuous 4-second stealth buffer with immutable SHA-256 digital seals
            </p>
          </div>
        </div>

        {showSimulateButton && (
          <button
            onClick={() => simulateIncomingEvidence(incidentId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#6EA8FE] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Chunk</span>
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="p-4 space-y-2.5 max-h-[460px] overflow-y-auto">
        {evidenceList.length > 0 ? (
          evidenceList.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onClick={() => setSelectedEvidence(ev)}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B2740] border border-[#29364F] flex items-center justify-center mx-auto text-[#71809A]">
              <FolderSearch className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F3F6FC]">
                Awaiting First Chunk
              </h4>
              <p className="text-xs text-[#71809A] max-w-xs mx-auto mt-1">
                The stealth background recorder on the victim's device is initializing. Incoming 4s segments will populate here automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="px-5 py-2.5 border-t border-[#29364F] bg-[#111A2E] text-[11px] text-[#71809A] flex items-center justify-between">
        <span>ISO/IEC 27037:2012 Electronic Evidence Compliant</span>
        <span className="font-mono text-[#38C6A3]">Custody Active</span>
      </div>

      {/* Modal Inspector */}
      <EvidenceDetailModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedIndex < evidenceList.length - 1}
        hasPrev={selectedIndex > 0}
      />
    </div>
  );
};
