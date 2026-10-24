import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, MessageSquare, Clock } from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

interface ChatEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatEvidenceModal: React.FC<ChatEvidenceModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useGuardian();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256);
    setCopied(true);
    addToast({
      title: 'SHA-256 Certificate Copied',
      message: 'Cryptographic exhibit fingerprint copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const messages = [
    { sender: 'Unknown_User_88', text: 'I know where you study.', time: '9:38 PM', isEscalation: false },
    { sender: 'Unknown_User_88', text: 'Stop ignoring me.', time: '9:39 PM', isEscalation: false },
    { sender: 'Unknown_User_88', text: "You're making a big mistake.", time: '9:40 PM', isEscalation: false },
    { sender: 'Unknown_User_88', text: "I'm coming for you tomorrow.", time: '9:41 PM', isEscalation: true },
    { sender: 'Unknown_User_88', text: "Reply now or I'll just show up.", time: '9:41 PM', isEscalation: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#E8DFDA] flex items-center justify-between bg-[#FAF6F3]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C84B53]">
                  SC-2026-0138 • Exhibit #01
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
                  Verified Intact
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1A1C] mt-0.5">
                chat_unknown_user_88.jpg
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FFFFFF] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-xs">
            <div className="flex items-center gap-2 text-[#6E6265]">
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp: <strong className="text-[#1F1A1C]">20 Oct, 9:41 PM IST</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#6E6265]">
              <span>Format: <strong className="text-[#1F1A1C]">JPEG • 412 KB</strong></span>
            </div>
          </div>

          {/* Authentic Chat Thread View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F1A1C]">
              <span>Extracted Direct Messages</span>
              <span className="text-[11px] text-[#A8323B] bg-[#FDECEE] px-2 py-0.5 rounded font-bold uppercase">
                Imminent Physical Threat
              </span>
            </div>

            <div className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl p-4 space-y-2.5">
              <div className="text-[11px] font-bold text-[#6E6265] uppercase tracking-wider mb-2">
                Sender: @Unknown_User_88
              </div>

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs max-w-sm ${
                    msg.isEscalation
                      ? 'bg-[#FDECEE] border-2 border-[#C84B53] text-[#1F1A1C] font-semibold shadow-xs'
                      : 'bg-[#FFFFFF] border border-[#E8DFDA] text-[#1F1A1C]'
                  }`}
                >
                  <p className="leading-relaxed">"{msg.text}"</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#6E6265]">
                    <span>{msg.isEscalation ? '⚠️ High-Risk Trigger' : 'Direct Message'}</span>
                    <span className="tabular-nums font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 65B SHA-256 Certificate */}
          <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                Section 65B Electronic Certificate
              </span>
              <span className="text-[10px] font-mono text-[#2D6A4F] bg-[#FFFFFF] px-2 py-0.5 rounded font-bold">
                ISO/IEC 27037 Custody
              </span>
            </div>
            <p className="text-xs text-[#2D6A4F]">
              Immutable SHA-256 hash computed at moment of mobile capture. Proves byte-for-byte integrity for police and judicial submission:
            </p>
            <div className="flex items-center gap-2 bg-[#FFFFFF] p-2 rounded-lg border border-[#C8E6C9]">
              <code className="text-xs font-mono text-[#1F1A1C] truncate flex-1 select-all">
                {sha256}
              </code>
              <button
                onClick={handleCopyHash}
                className="p-1.5 rounded-lg bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2D6A4F] transition-colors"
                title="Copy SHA-256"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8DFDA] bg-[#FAF6F3] flex items-center justify-between">
          <span className="text-xs text-[#6E6265]">
            SafeCircle Mobile Vault Preservation • Shreya
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1F1A1C] hover:bg-[#332C2E] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};
