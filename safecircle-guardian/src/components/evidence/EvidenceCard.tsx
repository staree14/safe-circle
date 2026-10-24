import React from 'react';
import { Film, Mic, Image as ImageIcon, FileText, ShieldCheck, Clock } from 'lucide-react';
import type { Evidence } from '../../types';

interface EvidenceCardProps {
  evidence: Evidence;
  onClick: () => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onClick }) => {
  const isVideo = evidence.type.includes('VIDEO');
  const isAudio = evidence.type.includes('AUDIO');
  const isImg = evidence.type.includes('SCREENSHOT');

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#151F35] border border-[#29364F] hover:border-[#6EA8FE]/50 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-[#18233C] group shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Media Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#1B2740] border border-[#29364F] flex items-center justify-center shrink-0 group-hover:border-[#6EA8FE]/40 transition-colors">
          {isVideo && <Film className="w-4 h-4 text-[#6EA8FE]" />}
          {isAudio && <Mic className="w-4 h-4 text-[#E8B65C]" />}
          {isImg && <ImageIcon className="w-4 h-4 text-[#38C6A3]" />}
          {!isVideo && !isAudio && !isImg && <FileText className="w-4 h-4 text-[#A99AFB]" />}
        </div>

        {/* Text Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#F3F6FC] truncate">
              {evidence.id}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#111A2E] text-[#A0AEC4] border border-[#29364F] uppercase font-mono">
              Chunk #{evidence.chunkIndex}
            </span>
          </div>
          <p className="text-xs text-[#A0AEC4] truncate group-hover:text-[#F3F6FC] transition-colors">
            {evidence.filename}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#71809A] mt-0.5 tabular-nums">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(evidence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span>•</span>
            <span>{formatBytes(evidence.sizeBytes)}</span>
          </div>
        </div>
      </div>

      {/* Right Hash Status Badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38C6A3] bg-[#13332B] px-2 py-0.5 rounded border border-[#38C6A3]/30">
          <ShieldCheck className="w-3 h-3" />
          <span>SHA-256 Sealed</span>
        </span>
        <span className="text-[10px] text-[#71809A] font-mono">
          {evidence.sha256Hash.slice(0, 8)}...
        </span>
      </div>
    </div>
  );
};
