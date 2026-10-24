import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';

export const SettingsPage: React.FC = () => {
  const { guardian, addToast } = useGuardian();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);

  const handleSavePreferences = () => {
    addToast({
      title: 'Preferences Saved',
      message: 'Interface and alert preferences updated successfully.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#C84B53] font-bold">
              Console Preferences
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
              Authorized Guardian
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1F1A1C] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#C84B53]" />
            Guardian Settings & Preferences
          </h2>
          <p className="text-xs md:text-sm text-[#6E6265] leading-relaxed">
            Manage your responder identity, companion alert notifications, and automated telemetry synchronization.
          </p>
        </div>
      </div>

      {/* 1. Guardian Profile Information */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E8DFDA] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] font-serif font-bold text-lg flex items-center justify-center">
            {guardian.avatarInitials}
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#1F1A1C]">{guardian.displayName}</h3>
            <span className="text-xs text-[#2D6A4F] font-bold">{guardian.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA]">
            <span className="text-[#6E6265] block text-[10px] font-bold uppercase">Registered Phone</span>
            <span className="font-mono font-bold text-[#1F1A1C] mt-0.5 block">{guardian.phone}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA]">
            <span className="text-[#6E6265] block text-[10px] font-bold uppercase">Telegram Gateway ID</span>
            <span className="font-mono font-bold text-[#1F1A1C] mt-0.5 block">Chat ID: {guardian.telegramChatId || '123456789'}</span>
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1F1A1C] border-b border-[#E8DFDA] pb-3">
          Alert & Dispatch Controls
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] cursor-pointer">
            <div>
              <span className="font-bold text-[#1F1A1C] block">Audible High-Priority SOS Alarm</span>
              <span className="text-[#6E6265] text-[11px]">Play siren tone on receiving active Physical SOS broadcast</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="accent-[#C84B53] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] cursor-pointer">
            <div>
              <span className="font-bold text-[#1F1A1C] block">Telegram Bot Push Integration</span>
              <span className="text-[#6E6265] text-[11px]">Forward real-time streaming link and Google Maps coordinates</span>
            </div>
            <input
              type="checkbox"
              checked={telegramAlerts}
              onChange={(e) => setTelegramAlerts(e.target.checked)}
              className="accent-[#C84B53] w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-[#C84B53] hover:bg-[#A8323B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
