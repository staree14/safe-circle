import React, { useState } from 'react';
import { Film, FolderSearch } from 'lucide-react';
import type { Evidence } from '../../types';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceDetailModal } from './EvidenceDetailModal';

interface EvidenceListProps {
  evidenceList: Evidence[];
  incidentId: string;
  showSimulateButton?: boolean;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidenceList,
  incidentId: _incidentId,
}) => {
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
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#E8DFDA] flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#FAF6F3] text-[#C84B53] border border-[#E8DFDA]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm font-bold text-[#1F1A1C] leading-none">
                Preserved Evidence Stream
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-[10px] font-bold tabular-nums">
                {evidenceList.length} Exhibits Sealed
              </span>
            </div>
            <p className="text-[11px] text-[#6E6265] mt-0.5">
              Continuous 4-second buffer with immutable SHA-256 digital seals
            </p>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="p-4 space-y-2.5 max-h-[460px] overflow-y-auto bg-[#FFFFFF]">
        {evidenceList.length > 0 ? (
          evidenceList.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onClick={() => setSelectedEvidence(ev)}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center space-y-3 bg-[#FAF6F3] rounded-xl border border-[#E8DFDA]">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E8DFDA] flex items-center justify-center mx-auto text-[#6E6265]">
              <FolderSearch className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1F1A1C]">
                Awaiting First Chunk
              </h4>
              <p className="text-xs text-[#6E6265] max-w-xs mx-auto mt-1">
                The background recorder is streaming. Incoming segments will populate here with SHA-256 seals.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="px-5 py-2.5 border-t border-[#E8DFDA] bg-[#FAF6F3] text-[11px] text-[#6E6265] flex items-center justify-between">
        <span>ISO/IEC 27037:2012 Evidence Custody Verified</span>
        <span className="font-mono text-[#2D6A4F] font-bold">Custody Active</span>
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
