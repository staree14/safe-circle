import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  X,
  ChevronRight,
  ShieldAlert,
  FolderOpen
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { StatusBadge } from '../components/common/StatusBadge';
import type { IncidentType, IncidentStatus } from '../types';

export const IncidentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, setActiveIncidentId } = useGuardian();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | IncidentType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#C84B53] font-bold">
              Archived & Active Dossiers
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
              Synchronized
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1F1A1C] flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-[#C84B53]" />
            Incident Reports & Vault History
          </h2>
          <p className="text-xs md:text-sm text-[#6E6265] max-w-2xl leading-relaxed">
            Review emergency SOS alerts, cyberstalking reports preserved from Mobile Vault, and forensic chain-of-custody audit logs.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-serif font-bold text-[#1F1A1C] tabular-nums block">
            {filteredIncidents.length}
          </span>
          <span className="text-xs text-[#6E6265]">
            Showing {filteredIncidents.length} of {incidents.length} total reports
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E6265] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Incident ID, Victim, or Category..."
              className="w-full bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F1A1C] placeholder-[#6E6265] focus:outline-none focus:border-[#C84B53] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl px-3 py-2 text-xs text-[#1F1A1C] focus:outline-none font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="PHYSICAL_SOS">Physical SOS</option>
              <option value="DIGITAL_THREAT">Digital Threat</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl px-3 py-2 text-xs text-[#1F1A1C] focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-[#6E6265] transition-colors"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6F3] text-[#6E6265] font-bold uppercase text-[10px] border-b border-[#E8DFDA]">
              <tr>
                <th className="p-4">Report ID</th>
                <th className="p-4">Protected Member</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Trigger / Category</th>
                <th className="p-4">Date / Time</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFDA]">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => {
                    setActiveIncidentId(inc.id);
                    navigate('/');
                  }}
                  className="hover:bg-[#FAF6F3] cursor-pointer transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-[#C84B53]">
                    {inc.id}
                  </td>
                  <td className="p-4 font-bold text-[#1F1A1C]">
                    {inc.victimDisplayName}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#1F1A1C]">
                      {inc.type === 'PHYSICAL_SOS' ? (
                        <span className="w-2 h-2 rounded-full bg-[#C84B53]" />
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      )}
                      <span>{inc.type === 'PHYSICAL_SOS' ? 'Physical SOS' : 'Digital Threat'}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>
                  <td className="p-4 text-[#6E6265] max-w-xs truncate">
                    {inc.aiCategory || inc.triggerMode}
                  </td>
                  <td className="p-4 font-mono text-[#6E6265] tabular-nums">
                    {new Date(inc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C84B53]">
                      View Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
