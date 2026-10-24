import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Check,
  Radio
} from 'lucide-react';
import { useGuardian } from '../../context/GuardianContext';

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
    incidents,
    setActiveIncidentId,
  } = useGuardian();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
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

  // Compute breadcrumb / page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Emergency Command Overview';
    if (path.startsWith('/incidents/')) return 'Incident Detailed Analysis';
    if (path === '/incidents') return 'Incident History & Archives';
    if (path === '/evidence') return 'Cryptographic Evidence Vault';
    if (path === '/reports') return 'Forensic Chain-of-Custody Reports';
    if (path === '/settings') return 'Guardian Console Settings';
    if (path.startsWith('/guardian/')) return 'Capability Incident Access';
    return 'Guardian Command Center';
  };

  // Search filtering
  const filteredIncidents = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.victimDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-[#111A2E] border-b border-[#29364F] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 no-print">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#A0AEC4] hover:text-[#F3F6FC] hover:bg-[#151F35] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-[#F3F6FC] tracking-tight truncate">
              {getPageTitle()}
            </h1>
            {activeIncident?.status === 'ACTIVE' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#351C2A] border border-[#F0525F]/50 text-[#F0525F] text-[11px] font-semibold uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Feed
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#71809A] hidden md:block">
            SafeCircle • Every second matters. Every update counts.
          </span>
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="relative flex-1 max-w-xs md:max-w-md hidden sm:block" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-[#71809A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search incident ID, victim, type..."
            className="w-full bg-[#151F35] border border-[#29364F] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F3F6FC] placeholder-[#71809A] focus:outline-none focus:border-[#6EA8FE] transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151F35] border border-[#29364F] rounded-xl shadow-2xl overflow-hidden z-50 p-1">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => {
                    setActiveIncidentId(inc.id);
                    navigate(`/incidents/${inc.id}`);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#1B2740] flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-mono text-[#6EA8FE] font-semibold">{inc.id}</span>
                    <span className="text-[#A0AEC4] ml-2 font-medium">{inc.victimDisplayName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#A0AEC4] uppercase">
                    {inc.status}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-[#71809A]">
                No matching incidents found in demo dataset
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Guardian Chip */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notification Bell with Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#A0AEC4] hover:text-[#F3F6FC] hover:bg-[#151F35] transition-colors border border-transparent hover:border-[#29364F]"
            aria-label="View emergency notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F0525F] text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#151F35] border border-[#29364F] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-[#29364F] flex items-center justify-between bg-[#111A2E]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#6EA8FE]" />
                  <span className="text-xs font-semibold text-[#F3F6FC]">
                    Simulated Alerts & Updates
                  </span>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#6EA8FE] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#29364F]/50">
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
                    className={`p-3 text-xs cursor-pointer transition-colors hover:bg-[#1B2740] ${
                      n.read ? 'opacity-70 bg-transparent' : 'bg-[#18233C]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-[#F3F6FC] text-xs leading-snug">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#71809A] shrink-0 tabular-nums">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[#A0AEC4] text-[11px] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[#29364F] bg-[#111A2E] text-center text-[11px] text-[#71809A]">
                Local demonstration alerts only • No real SMS or SMS gateway triggered
              </div>
            </div>
          )}
        </div>

        {/* Guardian Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-[#29364F]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6EA8FE] to-[#A99AFB] text-[#0B1020] font-bold text-xs flex items-center justify-center shrink-0">
            {guardian.avatarInitials}
          </div>
          <div className="hidden lg:block leading-tight text-left">
            <span className="text-xs font-semibold text-[#F3F6FC] block">
              {guardian.displayName}
            </span>
            <span className="text-[10px] text-[#38C6A3] font-medium block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38C6A3]" />
              Authorized Guardian
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
