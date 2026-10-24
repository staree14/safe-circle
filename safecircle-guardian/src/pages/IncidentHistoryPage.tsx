import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  ArrowUpDown,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { StatusBadge } from '../components/common/StatusBadge';
import type { IncidentType, IncidentStatus } from '../types';

export const IncidentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, setActiveIncidentId, getIncidentEvidence } = useGuardian();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | IncidentType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter & sort logic
  const filteredIncidents = incidents
    .filter((inc) => {
      const matchesSearch =
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.victimDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inc.aiCategory && inc.aiCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#6EA8FE]">
              Historical Logs
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] flex items-center gap-1 font-semibold uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              Simulated Records
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC] flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#6EA8FE]" />
            Incident History & Vault Archives
          </h2>
          <p className="text-xs md:text-sm text-[#A0AEC4] max-w-2xl leading-relaxed">
            Review past emergency activations, cyberstalking dossiers, and finalized Section 65B forensic audit trails.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-[#F3F6FC] tabular-nums block">
            {filteredIncidents.length}
          </span>
          <span className="text-xs text-[#71809A]">
            Showing of {incidents.length} total incidents
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71809A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Incident ID, Victim, or Category..."
              className="w-full bg-[#111A2E] border border-[#29364F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F6FC] placeholder-[#71809A] focus:outline-none focus:border-[#6EA8FE] transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-2 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="ALL">All Types</option>
              <option value="PHYSICAL_SOS">Physical SOS</option>
              <option value="DIGITAL_THREAT">Digital Threat</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-2 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-[#111A2E] border border-[#29364F] text-[#A0AEC4] hover:text-[#F3F6FC] transition-colors"
              title={`Sort by Date (${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1B2740] border border-[#29364F] text-xs text-[#E8B65C] hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#29364F] bg-[#111A2E] text-[11px] font-semibold text-[#71809A] uppercase tracking-wider">
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Type & Details</th>
                <th className="py-3.5 px-4">Victim</th>
                <th className="py-3.5 px-4">Triggered Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Evidence</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29364F]/50 text-xs">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => {
                  const evCount = getIncidentEvidence(inc.id).length;
                  const isPhysical = inc.type === 'PHYSICAL_SOS';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        setActiveIncidentId(inc.id);
                        navigate(`/incidents/${inc.id}`);
                      }}
                      className="hover:bg-[#18233C] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-[#6EA8FE] whitespace-nowrap">
                        {inc.id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#F3F6FC] flex items-center gap-2">
                          <span>{isPhysical ? 'Physical Emergency SOS' : 'Digital Threat Vault'}</span>
                          {inc.aiCategory && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1B2740] text-[#A99AFB] border border-[#29364F]">
                              {inc.aiCategory}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#71809A] truncate max-w-xs mt-0.5">
                          {inc.description}
                        </p>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#F3F6FC] block">
                          {inc.victimDisplayName}
                        </span>
                        <span className="text-[10px] text-[#71809A] font-mono">
                          {inc.victimPhone}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap tabular-nums text-[#A0AEC4]">
                        {new Date(inc.createdAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#111A2E] border border-[#29364F] text-[#38C6A3] font-mono font-bold">
                          {evCount} items
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveIncidentId(inc.id);
                            navigate(`/incidents/${inc.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#F3F6FC] transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#71809A]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-[#71809A]">
                    No incidents match your current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
