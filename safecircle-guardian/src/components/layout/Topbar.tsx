import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Check,
  FolderOpen
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';
import { formatIncidentId } from '../../utils/formatters';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    guardian,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    activeIncident,
    activeIncidentId,
    setActiveIncidentId,
    incidents,
  } = useGuardian();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Live Monitor';
    if (path.startsWith('/incidents/')) return 'Incident Details';
    if (path === '/incidents') return 'Incidents';
    if (path === '/evidence') return 'Evidence Vault';
    if (path === '/reports') return 'Legal Report';
    if (path === '/settings') return 'Settings';
    return 'Guardian';
  };

  const filteredIncidents = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.victimDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E8DFDA] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 no-print shadow-xs">
      {/* Left: Mobile Toggle & Page Title (Clean, no wordy subtitle) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="font-serif text-base md:text-lg font-bold text-[#1F1A1C] tracking-tight truncate">
            {getPageTitle()}
          </h1>
          {activeIncident?.status === 'ACTIVE' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FDECEE] border border-[#F7D0D4] text-[#C84B53] text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C84B53] animate-ping" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Center: The ONLY Incident Switcher on the Dashboard */}
      <div className="flex items-center gap-1.5 bg-[#FAF6F3] p-1 rounded-xl border border-[#E8DFDA] shrink-0">
        <button
          onClick={() => {
            setActiveIncidentId('SC-2026-0142');
            if (location.pathname !== '/') navigate('/');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeIncidentId.includes('0142')
              ? 'bg-[#FFFFFF] text-[#C84B53] shadow-xs border border-[#F7D0D4]'
              : 'text-[#6E6265] hover:text-[#1F1A1C]'
          }`}
          title="Switch to Physical SOS Incident"
        >
          <span className="w-2 h-2 rounded-full bg-[#C84B53] animate-ping" />
          <span>Physical SOS (SC-0142)</span>
        </button>

        <button
          onClick={() => {
            setActiveIncidentId('SC-2026-0138');
            if (location.pathname !== '/') navigate('/');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeIncidentId.includes('0138')
              ? 'bg-[#FFFFFF] text-[#2D6A4F] shadow-xs border border-[#C8E6C9]'
              : 'text-[#6E6265] hover:text-[#1F1A1C]'
          }`}
          title="Switch to Digital Harassment Report"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Digital Report (SC-0138)</span>
        </button>
      </div>

      {/* Right Controls: Notifications & Guardian Chip */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Field */}
        <div className="relative hidden xl:block w-48" ref={searchRef}>
          <Search className="w-3.5 h-3.5 text-[#6E6265] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search report..."
            className="w-full bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1F1A1C] placeholder-[#6E6265] focus:outline-none focus:border-[#C84B53] transition-colors"
          />
          {showSearchResults && filteredIncidents.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#FFFFFF] border border-[#E8DFDA] rounded-xl shadow-lg overflow-hidden z-50">
              {filteredIncidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => {
                    setActiveIncidentId(inc.id);
                    setSearchQuery('');
                    setShowSearchResults(false);
                    if (location.pathname !== '/') navigate('/');
                  }}
                  className="w-full text-left p-2.5 hover:bg-[#FAF6F3] text-xs border-b border-[#E8DFDA] last:border-0 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-mono font-bold text-[#C84B53]">{formatIncidentId(inc.id)}</span>
                  <span className="text-[#6E6265] truncate text-[11px]">{inc.victimDisplayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#6E6265] hover:text-[#1F1A1C] hover:bg-[#FAF6F3] transition-colors border border-transparent hover:border-[#E8DFDA]"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#C84B53] text-white text-[9px] font-bold flex items-center justify-center tabular-nums shadow">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-88 bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-[#E8DFDA] flex items-center justify-between bg-[#FAF6F3]">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#C84B53]" />
                  <span className="text-xs font-bold text-[#1F1A1C]">
                    Notifications
                  </span>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#2D6A4F] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E8DFDA]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.incidentId) {
                        setActiveIncidentId(n.incidentId);
                        navigate('/');
                        setShowNotifications(false);
                      }
                    }}
                    className={`p-3 text-xs cursor-pointer transition-colors hover:bg-[#FAF6F3] ${
                      n.read ? 'opacity-70 bg-transparent' : 'bg-[#FAF6F3]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-[#1F1A1C] text-xs leading-snug">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#6E6265] shrink-0 tabular-nums font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[#6E6265] text-[11px] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guardian Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E8DFDA]">
          <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] font-bold text-xs flex items-center justify-center shrink-0">
            {guardian.avatarInitials}
          </div>
          <span className="text-xs font-bold text-[#1F1A1C] hidden lg:block">
            {guardian.displayName.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
