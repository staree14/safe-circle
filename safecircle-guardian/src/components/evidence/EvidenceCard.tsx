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
      className="bg-[#FFFFFF] border border-[#E8DFDA] hover:border-[#C84B53]/60 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-[#FAF6F3] group shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Media Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] flex items-center justify-center shrink-0 group-hover:border-[#C84B53]/40 transition-colors">
          {isVideo && <Film className="w-4 h-4 text-[#C84B53]" />}
          {isAudio && <Mic className="w-4 h-4 text-[#D97706]" />}
          {isImg && <ImageIcon className="w-4 h-4 text-[#2D6A4F]" />}
          {!isVideo && !isAudio && !isImg && <FileText className="w-4 h-4 text-[#6E6265]" />}
        </div>

        {/* Text Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1F1A1C] truncate">
              {evidence.id}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF6F3] text-[#6E6265] border border-[#E8DFDA] uppercase font-mono">
              Exhibit #{evidence.chunkIndex + 1}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#1F1A1C] truncate group-hover:text-[#C84B53] transition-colors mt-0.5">
            {evidence.filename}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#6E6265] mt-0.5 tabular-nums">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(evidence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>•</span>
            <span>{formatBytes(evidence.sizeBytes)}</span>
          </div>
        </div>
      </div>

      {/* Right Hash Status Badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9] font-bold">
          <ShieldCheck className="w-3 h-3" />
          <span>SHA-256 Sealed</span>
        </span>
        <span className="text-[10px] text-[#6E6265] font-mono">
          {evidence.sha256Hash.slice(0, 8)}...
        </span>
      </div>
    </div>
  );
};
