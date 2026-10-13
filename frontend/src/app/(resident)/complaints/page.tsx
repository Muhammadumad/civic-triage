'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  useComplaintsStore 
} from '@/lib/complaints-store';
import { 
  CATEGORY_THEME, 
  STATUS_THEME, 
  PRIORITY_THEME, 
  getPriorityLevel,
  ComplaintCategory,
  ComplaintStatus 
} from '@/lib/types';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  FileQuestion,
  Sparkles,
  Inbox,
  Info,
  ChevronRight,
  Camera,
  Layers,
  Wrench,
  Truck
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function MyComplaintsDashboard() {
  const { complaints, isLoaded } = useComplaintsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'resolved'>('all');
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  const toggleBreakdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedBreakdownId(expandedBreakdownId === id ? null : id);
  };

  const countAll = complaints.length;
  const countInProgress = complaints.filter(c => c.status !== 'Resolved').length;
  const countResolved = complaints.filter(c => c.status === 'Resolved').length;

  const filtered = complaints.filter((item) => {
    // Search match
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter tab
    let matchesTab = true;
    if (activeFilter === 'in-progress') {
      matchesTab = item.status !== 'Resolved';
    } else if (activeFilter === 'resolved') {
      matchesTab = item.status === 'Resolved';
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Reports</h1>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1 uppercase tracking-wider">
              Ward 4 Resident Activity · {countInProgress} Active Cases
            </p>
          </div>
          <Link
            href="/complaints/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </Link>
        </div>

        {/* Filter Chips Row & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-[#161922] text-zinc-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <span>All</span>
              <span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.2 rounded">
                {countAll}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('in-progress')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeFilter === 'in-progress'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-[#161922] text-zinc-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <span>In Progress</span>
              <span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.2 rounded">
                {countInProgress}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('resolved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeFilter === 'resolved'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-[#161922] text-zinc-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <span>Resolved</span>
              <span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.2 rounded">
                {countResolved}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title or ID..."
              className="w-full bg-[#11131A] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Reports Container */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#11131A] border border-white/[0.08] rounded-xl flex flex-col items-center justify-center">
            <Inbox className="w-12 h-12 text-zinc-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No matching incident reports found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              Try adjusting your active filter or search term, or file a new civic report to track progress.
            </p>
            <Link
              href="/complaints/new"
              className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              File a Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((item) => {
              const pLevel = getPriorityLevel(item.priorityScore);
              const pTheme = PRIORITY_THEME[pLevel];
              const sTheme = STATUS_THEME[item.status] || STATUS_THEME['New'];
              const cTheme = CATEGORY_THEME[item.category] || CATEGORY_THEME['Road Damage'];
              const isExpanded = expandedBreakdownId === item.id;

              return (
                <article
                  key={item.id}
                  className="bg-[#11131A] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-5 shadow-lg transition-all flex flex-col gap-4"
                >
                  {/* Top Meta Line */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">#{item.id}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#161922] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sTheme.hex }} />
                      <span className="text-xs font-semibold text-zinc-300">{item.status}</span>
                    </div>
                  </div>

                  {/* Tag Row */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Category Chip */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: cTheme.bg, color: cTheme.text }}
                    >
                      <span>{item.category}</span>
                    </span>

                    {/* Priority Pill Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleBreakdown(item.id, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-transform active:scale-95"
                      style={{
                        backgroundColor: pTheme.bg,
                        color: pTheme.text,
                        borderColor: pTheme.border,
                        borderWidth: '1px',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pTheme.hex }} />
                      <span>{pLevel} · {item.priorityScore}</span>
                      <Info className="w-3.5 h-3.5 opacity-70 ml-0.5" />
                    </button>

                    {item.duplicateCount > 0 && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        +{item.duplicateCount} duplicates merged
                      </span>
                    )}
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                      <Link href={`/complaints/${item.id}`} className="hover:text-emerald-400 transition-colors">
                        {item.title}
                      </Link>
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-zinc-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{item.location.address}</span>
                    </div>
                  </div>

                  {/* Photo & Thumbnail Preview */}
                  <div className="rounded-lg overflow-hidden bg-[#161922] relative h-32 w-full border border-white/[0.06]">
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>1 Photo Evidence</span>
                    </div>
                  </div>

                  {/* Expandable Priority Breakdown Box */}
                  {isExpanded && (
                    <div className="p-4 rounded-lg bg-[#161922] border border-white/[0.08] flex flex-col gap-2 transition-all">
                      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Priority Score Breakdown ({item.priorityScore}/100)</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-rose-400">Tier 1</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Automated dispatch triage weighting based on safety telemetry & community proximity.
                      </p>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex items-center justify-between bg-[#11131A] px-2.5 py-1.5 rounded border border-white/[0.04]">
                          <span className="text-zinc-300">Category severity baseline</span>
                          <span className="font-mono font-semibold text-emerald-400">
                            +{item.priorityMath?.categoryBasePoints || 30} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-[#11131A] px-2.5 py-1.5 rounded border border-white/[0.04]">
                          <span className="text-zinc-300">Duplicate cluster reports</span>
                          <span className="font-mono font-semibold text-emerald-400">
                            +{item.priorityMath?.duplicatePoints || 20} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-[#11131A] px-2.5 py-1.5 rounded border border-white/[0.04]">
                          <span className="text-zinc-300">Sensitive Zone proximity (School/Hospital)</span>
                          <span className="font-mono font-semibold text-emerald-400">
                            +{item.priorityMath?.sensitiveZonePoints || 18} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-[#11131A] px-2.5 py-1.5 rounded border border-white/[0.04]">
                          <span className="text-zinc-300">Complaint age factor</span>
                          <span className="font-mono font-semibold text-zinc-300">
                            +{item.priorityMath?.agePoints || 5} pts
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>Algorithm v2.4 · Explainable DPW Triage</span>
                        <Link href="/admin/rules" className="text-emerald-400 hover:underline">
                          View Rules
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Footer / Assigned Unit & Details CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Wrench className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium text-zinc-300">
                        {item.department} Assigned
                      </span>
                    </div>

                    <Link
                      href={`/complaints/${item.id}`}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Details & Timeline</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
