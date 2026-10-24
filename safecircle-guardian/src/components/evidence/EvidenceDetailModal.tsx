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
  Sparkles
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#151F35] border border-[#29364F] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#29364F] flex items-center justify-between bg-[#111A2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#6EA8FE]">
              {evidence.type.includes('VIDEO') && <Film className="w-5 h-5 text-[#6EA8FE]" />}
              {evidence.type.includes('AUDIO') && <Mic className="w-5 h-5 text-[#E8B65C]" />}
              {evidence.type.includes('SCREENSHOT') && <ImageIcon className="w-5 h-5 text-[#38C6A3]" />}
              {evidence.type.includes('TEXT') && <FileText className="w-5 h-5 text-[#A99AFB]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#6EA8FE] font-bold">
                  {evidence.id}
                </span>
                <StatusBadge status={evidence.hashStatus} size="sm" />
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] flex items-center gap-1 font-semibold uppercase">
                  <Sparkles className="w-2.5 h-2.5" />
                  Simulated
                </span>
              </div>
              <h3 id="evidence-modal-title" className="text-sm md:text-base font-bold text-[#F3F6FC] truncate">
                {evidence.filename}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg border border-[#29364F] text-[#A0AEC4] hover:text-[#F3F6FC] hover:bg-[#1B2740] transition-colors"
                title="Previous evidence item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-1.5 rounded-lg border border-[#29364F] text-[#A0AEC4] hover:text-[#F3F6FC] hover:bg-[#1B2740] transition-colors"
                title="Next evidence item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71809A] hover:text-[#F3F6FC] hover:bg-[#1B2740] transition-colors ml-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Media Preview Box */}
          <div className="rounded-xl border border-[#29364F] bg-[#0E1426] p-4 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
            {evidence.previewAsset?.type === 'video' && (
              <div className="w-full flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#1B2740] border border-[#29364F] flex items-center justify-center shadow-lg">
                  <Film className="w-8 h-8 text-[#6EA8FE]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#F3F6FC] block">
                    4-Second Stealth Video Chunk (#{evidence.chunkIndex})
                  </span>
                  <span className="text-[11px] text-[#71809A] block">
                    Front camera ambient buffer • Resolution: {evidence.previewAsset.mockResolution || '1080p 30fps'}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#151F35] border border-[#29364F] text-[10px] text-[#38C6A3] font-mono">
                  [Simulated Media Payload — Safe Preview]
                </div>
              </div>
            )}

            {evidence.previewAsset?.type === 'audio' && (
              <div className="w-full py-4 px-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-10 h-10 rounded-xl bg-[#E8B65C] hover:bg-[#D4A349] text-[#0B1020] flex items-center justify-center font-bold transition-all shadow-md cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-[#F3F6FC] block">
                        Ambient Microphone Segment
                      </span>
                      <span className="text-[11px] text-[#71809A]">
                        Duration: 4.0 seconds • Codec: Opus 48kHz
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#E8B65C] tabular-nums">
                    {isPlayingAudio ? '00:02 / 00:04' : '00:00 / 00:04'}
                  </span>
                </div>

                {/* Animated Waveform Simulation */}
                <div className="h-14 flex items-end gap-1.5 px-3 py-2 bg-[#151F35] rounded-xl border border-[#29364F]">
                  {(evidence.previewAsset.audioWaveformData || [30, 45, 60, 20, 80, 95, 70, 50, 65, 80, 40, 55, 30, 75, 50]).map(
                    (height, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isPlayingAudio ? 'bg-[#E8B65C]' : 'bg-[#29364F]'
                        }`}
                        style={{ height: `${isPlayingAudio ? Math.max(15, (height * (Math.sin(idx) + 1.2)) % 100) : height}%` }}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {evidence.previewAsset?.type === 'image' && (
              <div className="w-full flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#1B2740] border border-[#29364F] flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-8 h-8 text-[#38C6A3]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#F3F6FC] block">
                    Lockscreen & Notifications Capture
                  </span>
                  <span className="text-[11px] text-[#71809A] block">
                    Dimensions: {evidence.previewAsset.mockResolution || '1170x2532 PNG'} • Color Depth: 24-bit
                  </span>
                </div>
              </div>
            )}

            {evidence.previewAsset?.type === 'text' && (
              <div className="w-full text-left p-3 font-mono text-xs bg-[#111A2E] border border-[#29364F] rounded-xl text-[#F3F6FC] whitespace-pre-wrap leading-relaxed">
                {evidence.previewAsset.textSnippet || '[Log text data preserved in vault]'}
              </div>
            )}
          </div>

          {/* Cryptographic Hash Verification Block */}
          <div className="bg-[#111A2E] border border-[#29364F] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F6FC] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#38C6A3]" />
                Cryptographic SHA-256 Digest (Simulated Vault Seal)
              </span>
              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-xs text-[#6EA8FE] hover:underline"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-[#38C6A3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0E1426] border border-[#29364F] font-mono text-xs text-[#38C6A3] break-all select-all">
              {evidence.sha256Hash}
            </div>

            <p className="text-[11px] text-[#71809A]">
              Fingerprint calculated on raw binary payload. Compliant with ISO/IEC 27037:2012 and Section 65B forensic chain-of-custody verification.
            </p>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Capture Timestamp</span>
              <span className="font-mono text-[#F3F6FC] font-semibold">
                {new Date(evidence.timestamp).toUTCString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F]">
              <span className="text-[#71809A] block mb-1">Payload Size</span>
              <span className="font-mono text-[#F3F6FC] font-semibold">
                {formatBytes(evidence.sizeBytes)} ({evidence.sizeBytes.toLocaleString()} bytes)
              </span>
            </div>

            {evidence.capturedCoordinates && (
              <div className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F] sm:col-span-2">
                <span className="text-[#71809A] block mb-1">Coordinates at Capture (Simulated)</span>
                <span className="font-mono text-[#6EA8FE] font-semibold">
                  {evidence.capturedCoordinates.lat.toFixed(5)}° N, {evidence.capturedCoordinates.lng.toFixed(5)}° E
                </span>
              </div>
            )}

            {evidence.legalRelevance && (
              <div className="p-3 rounded-xl bg-[#111A2E] border border-[#29364F] sm:col-span-2">
                <span className="text-[#71809A] block mb-1">Forensic Relevance</span>
                <p className="text-[#A0AEC4] leading-relaxed">
                  {evidence.legalRelevance}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#29364F] bg-[#111A2E] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#71809A]">
            Vault Ref: <code className="text-[#A0AEC4] font-mono">{evidence.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-[#F3F6FC] font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
