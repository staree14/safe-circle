import React, { useState } from 'react';
import {
  FolderSearch,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ShieldCheck
} from 'lucide-react';
import { useGuardian } from '../context/GuardianContext';
import { formatIncidentId } from '../utils/formatters';
import type { Evidence } from '../types';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { EvidenceDetailModal } from '../components/evidence/EvidenceDetailModal';

export const EvidenceVaultPage: React.FC = () => {
  const { evidence, incidents } = useGuardian();

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#2D6A4F] font-bold">
              Cryptographic Evidence Vault
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] font-bold uppercase">
              Section 65B Compliant
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1F1A1C] flex items-center gap-2.5">
            <FolderSearch className="w-6 h-6 text-[#C84B53]" />
            Evidence Repository & Vault Custody
          </h2>
          <p className="text-xs md:text-sm text-[#6E6265] max-w-2xl leading-relaxed">
            All exhibits cryptographically fingerprinted with SHA-256 upon capture. Preserved for legal disclosure, police FIR filing, and Section 65B judicial evidence submission.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-serif font-bold text-[#1F1A1C] tabular-nums block">
            {filteredEvidence.length} Exhibits
          </span>
          <span className="text-xs text-[#2D6A4F] font-bold flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5" />
            Immutable Chain Sealed
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
              placeholder="Search filename, SHA-256 hash, or exhibit ID..."
              className="w-full bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F1A1C] placeholder-[#6E6265] focus:outline-none focus:border-[#C84B53] transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Incident */}
            <select
              value={incidentFilter}
              onChange={(e) => setIncidentFilter(e.target.value)}
              className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl px-3 py-2 text-xs text-[#1F1A1C] focus:outline-none font-medium"
            >
              <option value="ALL">All Dossiers</option>
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  {formatIncidentId(i.id)} ({i.type === 'PHYSICAL_SOS' ? 'Physical SOS' : 'Digital Threat'})
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#FAF6F3] border border-[#E8DFDA] rounded-xl px-3 py-2 text-xs text-[#1F1A1C] focus:outline-none font-medium"
            >
              <option value="ALL">All Media Types</option>
              <option value="AUDIO">Audio Buffer (.webm / .opus)</option>
              <option value="IMAGE">Screenshots / Images (.jpg / .png)</option>
              <option value="VIDEO">Video Chunks (.webm)</option>
              <option value="TEXT">Text Logs & Transcripts</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-[#6E6265] transition-colors"
              title={`Sort by capture time (${sortOrder})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#FAF6F3] p-1 rounded-xl border border-[#E8DFDA]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#FFFFFF] text-[#C84B53] shadow-xs' : 'text-[#6E6265]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#FFFFFF] text-[#C84B53] shadow-xs' : 'text-[#6E6265]'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Items View */}
      {filteredEvidence.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredEvidence.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onClick={() => setSelectedEvidence(ev)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl">
          <FolderSearch className="w-10 h-10 text-[#6E6265] mx-auto" />
          <h4 className="text-sm font-bold text-[#1F1A1C]">No matching exhibits found</h4>
          <p className="text-xs text-[#6E6265]">Try adjusting search query or filters.</p>
        </div>
      )}

      {/* Exhibit Detail Modal */}
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
