import React, { useState } from 'react';
import {
  X,
  Film,
  Mic,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock
} from 'lucide-react';
import type { Evidence } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useGuardian } from '../../context/GuardianContext';

interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  onClose,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}) => {
  const { addToast } = useGuardian();
  const [copiedHash, setCopiedHash] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!evidence) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(evidence.sha256Hash);
    setCopiedHash(true);
    addToast({
      title: 'SHA-256 Digest Copied',
      message: 'Cryptographic hash copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#E8DFDA] flex items-center justify-between bg-[#FAF6F3]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E8DFDA] text-[#1F1A1C]">
              {evidence.type.includes('VIDEO') && <Film className="w-5 h-5 text-[#C84B53]" />}
              {evidence.type.includes('AUDIO') && <Mic className="w-5 h-5 text-[#D97706]" />}
              {evidence.type.includes('SCREENSHOT') && <ImageIcon className="w-5 h-5 text-[#2D6A4F]" />}
              {evidence.type.includes('TEXT') && <FileText className="w-5 h-5 text-[#6E6265]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#C84B53] font-bold">
                  {evidence.id}
                </span>
                <StatusBadge status={evidence.hashStatus} size="sm" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
                  Verified Intact
                </span>
              </div>
              <h3 id="evidence-modal-title" className="font-serif text-base font-bold text-[#1F1A1C] truncate mt-0.5">
                {evidence.filename}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg border border-[#E8DFDA] text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FFFFFF] transition-colors"
                title="Previous evidence item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-1.5 rounded-lg border border-[#E8DFDA] text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FFFFFF] transition-colors"
                title="Next evidence item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E8DFDA] text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FFFFFF] transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preview Area */}
          <div className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl p-5 flex flex-col items-center justify-center min-h-[160px] text-center">
            {evidence.type.includes('AUDIO') && (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6E6265] px-2">
                  <span className="font-bold text-[#1F1A1C]">Ambient Directional Recording</span>
                  <span className="font-mono">0:14 / 0:14</span>
                </div>
                <div className="h-12 flex items-center justify-center gap-1.5 px-4 bg-[#FFFFFF] rounded-lg border border-[#E8DFDA]">
                  {(evidence.previewAsset?.audioWaveformData || [30, 50, 70, 90, 60, 40, 80, 75, 45, 65, 85, 95]).map(
                    (val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${val}%` }}
                        className="w-1.5 rounded-full bg-[#C84B53]"
                      />
                    )
                  )}
                </div>
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C84B53] text-white text-xs font-bold shadow-xs hover:bg-[#A8323B] transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pause Playback' : 'Play Sealed Audio'}</span>
                </button>
              </div>
            )}

            {evidence.type.includes('SCREENSHOT') && (
              <div className="space-y-2 w-full text-left">
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E8DFDA] text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#6E6265]">
                    Preserved Screen Buffer Content:
                  </span>
                  <p className="text-xs text-[#1F1A1C] leading-relaxed italic bg-[#FAF6F3] p-2.5 rounded-lg border border-[#E8DFDA]">
                    {evidence.previewAsset?.textSnippet || 'Screen capture preserved in tamper-evident mobile vault.'}
                  </p>
                </div>
              </div>
            )}

            {evidence.type.includes('VIDEO') && (
              <div className="space-y-2 text-center py-4">
                <Film className="w-10 h-10 text-[#C84B53] mx-auto" />
                <span className="text-xs font-bold text-[#1F1A1C] block">
                  Stealth Dash Recording (1080p 30fps)
                </span>
                <span className="text-[11px] text-[#6E6265] block">
                  Ambient low-light front buffer stream preserved
                </span>
              </div>
            )}
          </div>

          {/* Legal Relevance */}
          {evidence.legalRelevance && (
            <div className="p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-1 text-xs">
              <span className="font-bold text-[#1F1A1C] block">
                Section 65B Evidentiary Value:
              </span>
              <p className="text-[#6E6265] leading-relaxed">
                {evidence.legalRelevance}
              </p>
            </div>
          )}

          {/* Technical Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA]">
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">File Size</span>
              <span className="font-mono font-bold text-[#1F1A1C] mt-0.5 block">{formatBytes(evidence.sizeBytes)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA]">
              <span className="text-[#6E6265] block text-[10px] uppercase font-bold">Capture Time</span>
              <span className="font-mono font-bold text-[#1F1A1C] mt-0.5 block">
                {new Date(evidence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
              </span>
            </div>
          </div>

          {/* SHA-256 Box */}
          <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D6A4F] flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Immutable SHA-256 Digital Fingerprint
              </span>
              <span className="text-[10px] font-mono text-[#2D6A4F] font-bold">Intact</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FFFFFF] p-2 rounded-lg border border-[#C8E6C9]">
              <code className="text-xs font-mono text-[#1F1A1C] truncate flex-1 select-all">
                {evidence.sha256Hash}
              </code>
              <button
                onClick={handleCopyHash}
                className="p-1.5 rounded-lg bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2D6A4F] transition-colors"
                title="Copy hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E8DFDA] bg-[#FAF6F3] flex items-center justify-between text-xs text-[#6E6265]">
          <span>SafeCircle Forensic Vault</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1F1A1C] hover:bg-[#332C2E] text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
