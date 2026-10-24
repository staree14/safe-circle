import React, { useState } from 'react';
import { FolderLock, MessageSquare, UserX, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatEvidenceModal } from '../evidence/ChatEvidenceModal';

export const VaultPreviewCard: React.FC = () => {
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-4 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFDA] pb-2.5">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-[#C84B53]" />
            <h3 className="font-serif text-sm font-bold text-[#1F1A1C] leading-none">
              Vault Evidence
            </h3>
          </div>
          <Link
            to="/evidence"
            className="text-[11px] font-bold text-[#C84B53] hover:underline flex items-center gap-0.5"
          >
            <span>All Exhibits</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 2 Quick Preview Cards */}
        <div className="space-y-2">
          {/* Item 1 */}
          <div
            onClick={() => setShowChatModal(true)}
            className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] hover:border-[#C84B53]/40 transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4] shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#1F1A1C] group-hover:text-[#C84B53] transition-colors truncate block">
                  chat_unknown_user_88.jpg
                </span>
                <span className="text-[10px] text-[#6E6265] block truncate">
                  "I'm coming for you tomorrow" • 412 KB
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#2D6A4F] bg-[#E8F5E9] px-1.5 py-0.5 rounded border border-[#C8E6C9] shrink-0">
              SHA-256
            </span>
          </div>

          {/* Item 2 */}
          <div className="p-2.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] shrink-0">
                <UserX className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#1F1A1C] truncate block">
                  fake_account_profile.jpg
                </span>
                <span className="text-[10px] text-[#6E6265] block truncate">
                  @shreya_official_xx impersonation • 326 KB
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#2D6A4F] bg-[#E8F5E9] px-1.5 py-0.5 rounded border border-[#C8E6C9] shrink-0">
              SHA-256
            </span>
          </div>
        </div>
      </div>

      <ChatEvidenceModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </>
  );
};
