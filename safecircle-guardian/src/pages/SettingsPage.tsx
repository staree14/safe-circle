import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  Check,
  Send,
  Eye
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';

export const SettingsPage: React.FC = () => {
  const { guardian, resetDemoState, addToast } = useGuardian();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('10');
  const [telegramAlerts, setTelegramAlerts] = useState(true);

  const handleSavePreferences = () => {
    addToast({
      title: 'Preferences Saved (Local Demo)',
      message: 'Interface and alert preferences updated in browser session.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#6EA8FE]">
              Configuration
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] flex items-center gap-1 font-semibold uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              Local Preferences
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#6EA8FE]" />
            Guardian Console Settings
          </h2>
          <p className="text-xs md:text-sm text-[#A0AEC4] leading-relaxed">
            Manage your responder identity, command center interface controls, and simulated dispatch preferences.
          </p>
        </div>
      </div>

      {/* 1. Guardian Profile Information */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-3 border-b border-[#29364F] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6EA8FE] to-[#A99AFB] text-[#0B1020] font-bold text-base flex items-center justify-center">
            {guardian.avatarInitials}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F3F6FC]">{guardian.displayName}</h3>
            <span className="text-xs text-[#38C6A3] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38C6A3]" />
              {guardian.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F] space-y-1">
            <span className="text-[#71809A]">Registered Mobile</span>
            <div className="font-mono font-semibold text-[#F3F6FC]">{guardian.phone}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111A2E] border border-[#29364F] space-y-1">
            <span className="text-[#71809A]">Telegram Dispatch ID</span>
            <div className="font-mono font-semibold text-[#38C6A3] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#38C6A3]" />
              {guardian.telegramChatId || 'Linked via Bot'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interface Preferences */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-6 shadow-lg space-y-5">
        <h3 className="text-sm font-bold text-[#F3F6FC] border-b border-[#29364F] pb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#6EA8FE]" />
          Command Center Interface Controls
        </h3>

        <div className="space-y-4 text-xs">
          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#F3F6FC] block">Acoustic Emergency Chimes</span>
              <span className="text-[#71809A] block mt-0.5">Play urgent audio beacon when incoming SOS or chunks arrive</span>
            </div>
            <button
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                soundAlerts
                  ? 'bg-[#13332B] text-[#38C6A3] border-[#38C6A3]/40'
                  : 'bg-[#1B2740] text-[#71809A] border-[#29364F]'
              }`}
            >
              {soundAlerts ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundAlerts ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>

          {/* Telemetry Polling Rate */}
          <div className="flex items-center justify-between pt-3 border-t border-[#29364F]/50">
            <div>
              <span className="font-semibold text-[#F3F6FC] block">Telemetry Polling Frequency</span>
              <span className="text-[#71809A] block mt-0.5">Frequency of simulated GPS & battery refreshes</span>
            </div>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(e.target.value)}
              className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-1.5 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="5">Every 5 seconds</option>
              <option value="10">Every 10 seconds</option>
              <option value="30">Every 30 seconds</option>
              <option value="0">Manual Refresh Only</option>
            </select>
          </div>

          {/* Telegram Notifications */}
          <div className="flex items-center justify-between pt-3 border-t border-[#29364F]/50">
            <div>
              <span className="font-semibold text-[#F3F6FC] block">Simulated Telegram Alert Mirroring</span>
              <span className="text-[#71809A] block mt-0.5">Simulate background bot dispatches to sister & campus desk</span>
            </div>
            <button
              onClick={() => setTelegramAlerts(!telegramAlerts)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                telegramAlerts
                  ? 'bg-[#13332B] text-[#38C6A3] border-[#38C6A3]/40'
                  : 'bg-[#1B2740] text-[#71809A] border-[#29364F]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{telegramAlerts ? 'Active' : 'Disabled'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl bg-[#6EA8FE] hover:bg-[#5B96EC] text-[#0B1020] text-xs font-bold transition-all shadow-md"
          >
            Save Interface Preferences
          </button>
        </div>
      </div>

      {/* 3. Demo State & Simulation Maintenance */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-[#F3F6FC] border-b border-[#29364F] pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E8B65C]" />
          Demo Mode Maintenance
        </h3>

        <p className="text-xs text-[#A0AEC4] leading-relaxed">
          The SafeCircle Guardian frontend operates with a rich local demo dataset. You can reset all incident statuses, clear newly simulated chunks, and revert timeline logs back to the initial demo state at any time.
        </p>

        <div className="pt-2">
          <button
            onClick={resetDemoState}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#E8B65C] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Factory Demo State</span>
          </button>
        </div>
      </div>

      {/* 4. About SafeCircle Section */}
      <div className="p-5 rounded-2xl bg-[#0E1426] border border-[#29364F] text-xs space-y-2 text-[#71809A]">
        <div className="flex items-center justify-between text-[#A0AEC4] font-semibold">
          <span>SafeCircle Guardian Console</span>
          <span className="font-mono">v1.0.0 (Frontend Demo Release)</span>
        </div>
        <p className="leading-relaxed">
          Architecture: React 19 + TypeScript + Vite + Tailwind CSS. Designed to connect to the production FastAPI backend at <code className="text-[#6EA8FE]">http://localhost:8000</code> using capability tokens and SHA-256 custody seals.
        </p>
        <p className="text-[11px] text-[#71809A]">
          "Every second matters. Every update counts."
        </p>
      </div>
    </div>
  );
};
