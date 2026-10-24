import React, { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  MessageSquare,
  UserX,
  Send,
  ChevronRight
} from 'lucide-react';
import { ChatEvidenceModal } from '../evidence/ChatEvidenceModal';

export const DigitalReportView: React.FC = () => {
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. AI Threat Assessment Card */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFDA] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4]">
              <AlertTriangle className="w-5 h-5 text-[#C84B53]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#A8323B] bg-[#FDECEE] px-2 py-0.5 rounded-full border border-[#F7D0D4] uppercase tracking-wider">
                  Critical Severity Triage
                </span>
                <span className="text-xs font-mono text-[#6E6265]">
                  Dossier: SC-2026-0138
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1F1A1C] mt-0.5">
                AI Threat Assessment & Statutory Legal Triage
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] text-xs font-bold uppercase tracking-wider">
              Shared with Guardian
            </span>
          </div>
        </div>

        {/* Highlighted Quote Callout (Escalation Trigger) */}
        <div className="bg-[#FAF6F3] border-l-4 border-[#C84B53] rounded-r-xl p-4.5 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8323B] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalation Trigger: Explicit Imminent Physical Confrontation Intent</span>
          </div>
          <blockquote className="font-serif italic text-lg sm:text-xl font-bold text-[#1F1A1C] leading-snug">
            "I'm coming for you tomorrow."
          </blockquote>
          <p className="text-xs text-[#6E6265]">
            Extracted from direct messaging thread with suspect <code className="font-mono text-[#1F1A1C] font-semibold">@Unknown_User_88</code>. Threat pattern combines repetitive digital surveillance with impending in-person stalking.
          </p>
        </div>

        {/* AI Triage Details & Legal Violations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-2">
            <span className="text-[11px] font-bold text-[#6E6265] uppercase tracking-wider block">
              Classification Category
            </span>
            <div className="text-sm font-bold text-[#1F1A1C]">
              Cyberstalking, Impersonation & Imminent Physical Threat
            </div>
            <p className="text-xs text-[#6E6265] leading-relaxed">
              Automated multi-modal NLP analysis identified stalking, unauthorized distribution of stolen imagery, and coercive blackmail demands.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] space-y-2">
            <span className="text-[11px] font-bold text-[#6E6265] uppercase tracking-wider block flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Applicable Indian Statutes (FIR Ready)
            </span>
            <ul className="text-xs text-[#1F1A1C] space-y-1 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C84B53]" />
                <strong>BNS Section 78 / IPC 354D:</strong> Stalking via Electronic Medium
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C84B53]" />
                <strong>IT Act Section 66D:</strong> Impersonation & Cheating
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C84B53]" />
                <strong>BNS Section 351:</strong> Criminal Intimidation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Preserved Evidence Vault Items (3 Visual Cards from Mobile Vault) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1F1A1C]">
              Preserved Evidence Vault Items (3 Exhibits)
            </h3>
            <p className="text-xs text-[#6E6265]">
              Exported from Shreya's Mobile Evidence Vault • Tamper-evident SHA-256 custody seals
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C8E6C9]">
            3 Verified Intact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exhibit 1: chat_unknown_user_88.jpg */}
          <div
            onClick={() => setShowChatModal(true)}
            className="bg-[#FFFFFF] border-2 border-[#E8DFDA] hover:border-[#C84B53] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
                  Verified Intact
                </span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-[#1F1A1C] group-hover:text-[#C84B53] transition-colors">
                  chat_unknown_user_88.jpg
                </h4>
                <div className="text-[11px] text-[#6E6265] mt-0.5">
                  Screenshot · JPEG · 412 KB
                </div>
                <div className="text-[10px] text-[#6E6265] font-mono mt-0.5">
                  20 Oct, 9:41 PM · SC-2026-0138
                </div>
              </div>

              {/* Chat snippet preview */}
              <div className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-xs text-[#1F1A1C] space-y-1">
                <p className="line-clamp-2 italic text-[#6E6265]">
                  "I know where you study... I'm coming for you tomorrow..."
                </p>
                <span className="text-[10px] text-[#C84B53] font-bold flex items-center gap-1">
                  Click to open full chat transcript & certificate <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8DFDA] flex items-center justify-between text-[10px] font-mono text-[#6E6265]">
              <span>SHA-256:</span>
              <code className="text-[#2D6A4F] font-bold">e3b0c442...</code>
            </div>
          </div>

          {/* Exhibit 2: fake_account_profile.jpg */}
          <div className="bg-[#FFFFFF] border border-[#E8DFDA] hover:border-[#2D6A4F] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9]">
                  <UserX className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
                  Verified Intact
                </span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-[#1F1A1C]">
                  fake_account_profile.jpg
                </h4>
                <div className="text-[11px] text-[#6E6265] mt-0.5">
                  Screenshot · JPEG · 326 KB
                </div>
                <div className="text-[10px] text-[#6E6265] font-mono mt-0.5">
                  20 Oct, 10:09 PM · SC-2026-0138
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-xs text-[#6E6265]">
                <p className="leading-relaxed">
                  Impersonation profile <strong className="text-[#1F1A1C]">@shreya_official_xx</strong> using stolen photos targeting mutual student contacts.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8DFDA] flex items-center justify-between text-[10px] font-mono text-[#6E6265]">
              <span>SHA-256:</span>
              <code className="text-[#2D6A4F] font-bold">4b227777...</code>
            </div>
          </div>

          {/* Exhibit 3: impersonation_message.jpg */}
          <div className="bg-[#FFFFFF] border border-[#E8DFDA] hover:border-[#2D6A4F] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#FAF6F3] text-[#1F1A1C] border border-[#E8DFDA]">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
                  Verified Intact
                </span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-[#1F1A1C]">
                  impersonation_message.jpg
                </h4>
                <div className="text-[11px] text-[#6E6265] mt-0.5">
                  Screenshot · JPEG · 343 KB
                </div>
                <div className="text-[10px] text-[#6E6265] font-mono mt-0.5">
                  21 Oct, 10:03 AM · SC-2026-0138
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] text-xs text-[#6E6265]">
                <p className="leading-relaxed">
                  Phishing/OTP request message sent to contacts while impersonating victim's identity.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8DFDA] flex items-center justify-between text-[10px] font-mono text-[#6E6265]">
              <span>SHA-256:</span>
              <code className="text-[#2D6A4F] font-bold">ef2d127d...</code>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inspector for Exhibit #1 */}
      <ChatEvidenceModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
};
