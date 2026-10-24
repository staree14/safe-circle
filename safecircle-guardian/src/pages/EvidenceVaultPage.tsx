import React, { useState } from 'react';
import {
  FolderSearch,
  Search,
  Film,
  Mic,
  Image as ImageIcon,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  X,
  PlusCircle
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import type { Evidence } from '../types';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { EvidenceDetailModal } from '../components/evidence/EvidenceDetailModal';

export const EvidenceVaultPage: React.FC = () => {
  const { evidence, incidents, simulateIncomingEvidence, activeIncidentId } = useGuardian();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | string>('ALL');
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const filteredEvidence = evidence
    .filter((ev) => {
      const matchesSearch =
        ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'VIDEO' && ev.type.includes('VIDEO')) ||
        (typeFilter === 'AUDIO' && ev.type.includes('AUDIO')) ||
        (typeFilter === 'IMAGE' && ev.type.includes('SCREENSHOT')) ||
        (typeFilter === 'TEXT' && ev.type.includes('TEXT'));

      const matchesIncident = incidentFilter === 'ALL' || ev.incidentId === incidentFilter;

      return matchesSearch && matchesType && matchesIncident;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const selectedIndex = selectedEvidence
    ? filteredEvidence.findIndex((e) => e.id === selectedEvidence.id)
    : -1;

  const handleNext = () => {
    if (selectedIndex < filteredEvidence.length - 1) {
      setSelectedEvidence(filteredEvidence[selectedIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedEvidence(filteredEvidence[selectedIndex - 1]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setIncidentFilter('ALL');
    setSortOrder('desc');
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-5 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#38C6A3]">
              Forensic Repository
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B2740] text-[#E8B65C] flex items-center gap-1 font-semibold uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              Simulated Custody
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F6FC] flex items-center gap-2.5">
            <FolderSearch className="w-6 h-6 text-[#38C6A3]" />
            Cryptographic Evidence Vault
          </h2>
          <p className="text-xs md:text-sm text-[#A0AEC4] max-w-2xl leading-relaxed">
            Centralized index of all captured media chunks, audio fragments, and threat screenshots preserved with immutable SHA-256 digests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => simulateIncomingEvidence(activeIncidentId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs font-semibold text-[#6EA8FE] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Ingest Chunk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71809A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Evidence ID, filename, or SHA-256 hash..."
              className="w-full bg-[#111A2E] border border-[#29364F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F6FC] placeholder-[#71809A] focus:outline-none focus:border-[#6EA8FE] transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-2 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="ALL">All Media Types</option>
              <option value="VIDEO">Video Chunks</option>
              <option value="AUDIO">Audio Chunks</option>
              <option value="IMAGE">Screenshots</option>
              <option value="TEXT">Text Logs</option>
            </select>

            {/* Incident Filter */}
            <select
              value={incidentFilter}
              onChange={(e) => setIncidentFilter(e.target.value)}
              className="bg-[#111A2E] border border-[#29364F] rounded-xl px-3 py-2 text-xs text-[#F3F6FC] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="ALL">All Incidents</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} ({inc.victimDisplayName})
                </option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-[#111A2E] border border-[#29364F] text-[#A0AEC4] hover:text-[#F3F6FC] transition-colors"
              title={`Sort by Date (${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#111A2E] border border-[#29364F] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#1B2740] text-[#F3F6FC]' : 'text-[#71809A] hover:text-[#F3F6FC]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#1B2740] text-[#F3F6FC]' : 'text-[#71809A] hover:text-[#F3F6FC]'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {(searchQuery || typeFilter !== 'ALL' || incidentFilter !== 'ALL') && (
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

      {/* Grid or List Display */}
      {filteredEvidence.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className="bg-[#151F35] border border-[#29364F] hover:border-[#6EA8FE]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer transition-all hover:bg-[#18233C] group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#1B2740] border border-[#29364F] text-[#6EA8FE]">
                        {ev.type.includes('VIDEO') && <Film className="w-4 h-4 text-[#6EA8FE]" />}
                        {ev.type.includes('AUDIO') && <Mic className="w-4 h-4 text-[#E8B65C]" />}
                        {ev.type.includes('SCREENSHOT') && <ImageIcon className="w-4 h-4 text-[#38C6A3]" />}
                        {ev.type.includes('TEXT') && <FileText className="w-4 h-4 text-[#A99AFB]" />}
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F3F6FC]">
                        {ev.id}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#111A2E] border border-[#29364F] font-mono text-[#A0AEC4]">
                      Chunk #{ev.chunkIndex}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#F3F6FC] truncate group-hover:text-[#6EA8FE] transition-colors">
                      {ev.filename}
                    </h4>
                    <span className="text-[11px] text-[#71809A] block mt-0.5">
                      Incident Ref: <code className="text-[#A0AEC4] font-mono">{ev.incidentId}</code>
                    </span>
                  </div>

                  <div className="bg-[#111A2E] p-2 rounded-xl border border-[#29364F] text-[10px] font-mono text-[#38C6A3] truncate">
                    SHA-256: {ev.sha256Hash}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#29364F]/60 flex items-center justify-between text-xs text-[#71809A] tabular-nums">
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  <span>{formatBytes(ev.sizeBytes)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEvidence.map((ev) => (
              <EvidenceCard
                key={ev.id}
                evidence={ev}
                onClick={() => setSelectedEvidence(ev)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-[#151F35] border border-[#29364F] rounded-2xl p-12 text-center space-y-3">
          <FolderSearch className="w-10 h-10 text-[#71809A] mx-auto" />
          <h4 className="text-sm font-bold text-[#F3F6FC]">
            No Evidence Matches Your Filter
          </h4>
          <p className="text-xs text-[#71809A]">
            Try adjusting your search query, selecting "All Media Types", or switching incident filters.
          </p>
        </div>
      )}

      {/* Modal Inspector */}
      <EvidenceDetailModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedIndex < filteredEvidence.length - 1}
        hasPrev={selectedIndex > 0}
      />
    </div>
  );
};
