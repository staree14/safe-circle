import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderLock,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
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
  const { guardian } = useGuardian();

  // Short, punchy human-friendly navigation labels
  const navItems = [
    { to: '/', label: 'Live Monitor', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incidents', icon: FileSpreadsheet },
    { to: '/evidence', label: 'Vault', icon: FolderLock },
    { to: '/reports', label: 'Legal Report', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#FFFFFF] border-r border-[#E8DFDA] flex flex-col transition-all duration-300 ease-in-out no-print shadow-xs ${
          isCollapsed ? 'w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header — Fixed alignment so logo is never clipped */}
        <div
          className={`h-16 flex items-center border-b border-[#E8DFDA] ${
            isCollapsed
              ? 'justify-center px-0'
              : 'justify-between px-4'
          }`}
        >
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 overflow-hidden transition-transform hover:opacity-90 ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
            title="SafeCircle Guardian"
          >
            <img
              src="/safe-circle-logo.svg"
              alt="SafeCircle Logo"
              className="w-8 h-8 rounded-lg object-contain shrink-0 drop-shadow-xs"
            />
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-serif font-bold tracking-tight text-[#1F1A1C] text-base block">
                  SafeCircle
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#C84B53] block">
                  Guardian
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle in expanded view */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3] transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center pt-2 pb-1">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3] transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation List — No duplicate switcher */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FAF6F3] text-[#C84B53] font-bold shadow-xs border border-[#F7D0D4]'
                      : 'text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3]/70'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-2.5 border-t border-[#E8DFDA] bg-[#FFFFFF]">
          <div
            className={`flex items-center gap-2.5 p-1.5 rounded-xl bg-[#FAF6F3] border border-[#E8DFDA] ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div
              className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] font-bold text-xs flex items-center justify-center shrink-0"
              title={guardian.displayName}
            >
              {guardian.avatarInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1F1A1C] truncate">
                  {guardian.displayName}
                </div>
                <div className="text-[10px] text-[#6E6265] truncate">
                  Primary Guardian
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
