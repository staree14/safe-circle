import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  History,
  FolderSearch,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { guardian, activeIncident } = useGuardian();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incident History', icon: History },
    { to: '/evidence', label: 'Evidence Vault', icon: FolderSearch },
    { to: '/reports', label: 'Forensic Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const hasActiveEmergency = activeIncident?.status === 'ACTIVE';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0E1426] border-r border-[#29364F] flex flex-col transition-all duration-300 ease-in-out no-print ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#29364F]">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0525F] to-[#A99AFB] flex items-center justify-center shrink-0 shadow-lg shadow-[#F0525F]/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-bold tracking-tight text-[#F3F6FC] text-base block">
                  SafeCircle
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#6EA8FE] block">
                  Guardian Console
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-[#71809A] hover:text-[#F3F6FC] hover:bg-[#1B2740] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Emergency Alert Mini-Banner if active emergency */}
        {hasActiveEmergency && !isCollapsed && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#351C2A] border border-[#F0525F]/40 flex items-center gap-2 text-xs text-[#F0525F]">
            <span className="w-2 h-2 rounded-full bg-[#F0525F] animate-ping shrink-0" />
            <span className="font-medium truncate">Active SOS In Progress</span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#151F35] text-[#F3F6FC] border border-[#29364F] shadow-sm'
                      : 'text-[#A0AEC4] hover:text-[#F3F6FC] hover:bg-[#151F35]/50'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile & Demo Tag */}
        <div className="p-3 border-t border-[#29364F] bg-[#0E1426]">
          {!isCollapsed && (
            <div className="mb-2.5 px-2 py-1 rounded bg-[#151F35] border border-[#29364F] flex items-center justify-between text-[11px] text-[#71809A]">
              <span className="flex items-center gap-1 text-[#E8B65C]">
                <Sparkles className="w-3 h-3" />
                Simulation Mode
              </span>
              <span className="font-mono">v1.0.0</span>
            </div>
          )}

          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-[#151F35] border border-[#29364F] ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div
              className="w-9 h-9 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#6EA8FE] font-bold text-xs flex items-center justify-center shrink-0"
              title={guardian.displayName}
            >
              {guardian.avatarInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#F3F6FC] truncate">
                  {guardian.displayName}
                </div>
                <div className="text-[11px] text-[#A0AEC4] truncate">
                  {guardian.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
