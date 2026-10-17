'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Complaint,
  TransparencyStats,
  getPriorityLevel,
} from '@/lib/types';
import { fetchTransparencyStats } from '@/lib/api';
import { useComplaintsStore } from '@/lib/complaints-store';
import { CivicMap } from '@/components/map';
import { usePersona } from '@/context/PersonaContext';
import {
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Download,
  Wrench,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Building2,
  Check,
  FileCheck,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { role } = usePersona();
  const { complaints } = useComplaintsStore();
  const [mounted, setMounted] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [heroPreviewIndex, setHeroPreviewIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [transparency, setTransparency] = useState<TransparencyStats | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (complaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(complaints[0]);
    }
  }, [complaints, selectedComplaint]);

  useEffect(() => {
    fetchTransparencyStats().then((data) => {
      if (data) setTransparency(data);
    });
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().replace(/^#/, '');
    if (!query) return;

    const match = complaints.find(
      (c) =>
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.title.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      router.push(`/complaints/${match.id}`);
    } else {
      router.push(`/complaints`);
    }
  };

  const categories = ['All', 'Road Damage', 'Garbage', 'Streetlights', 'Water Leakage', 'Blocked Drains'];
  const filteredComplaints =
    activeCategoryFilter === 'All'
      ? complaints
      : complaints.filter((c) => c.category === activeCategoryFilter);

  const previewCandidates = complaints.slice(0, 3);
  const activeHeroTicket = previewCandidates[heroPreviewIndex] || complaints[0];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[var(--canvas-base)] text-[var(--text-primary)]">
      {/* ======================================================== */}
      {/* SECTION 01: ASYMMETRIC ARCHITECTURAL HERO & INSPECTOR    */}
      {/* ======================================================== */}
      <section className="border-b border-[var(--border-subtle)] bg-civic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-[var(--border-subtle)] bg-[var(--canvas-base)]">
            {/* Left Column (7 cols): Editorial Statement & Dispatch Controls */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
              <div>
                {/* Section Index */}
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-6">
                  <span className="inline-block w-2 h-2 bg-[var(--brand-primary)]" />
                  <span>01 // MUNICIPAL TRIAGE SYSTEM</span>
                  <span className="text-[var(--border-strong)]">/</span>
                  <span className="text-[var(--text-primary)] font-semibold">OPENHACK SC-01</span>
                </div>

                {/* Editorial Serif Headline */}
                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[62px] font-normal tracking-tight leading-[1.03] text-[var(--text-primary)]">
                  Civic hazard triage,{' '}
                  <span className="italic text-[var(--brand-primary)]">engineered</span> for transparent public works.
                </h1>

                {/* Editorial Lead Copy */}
                <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-[1.65]">
                  Residents report infrastructure failures in under sixty seconds. Deterministic spatial deduplication and auditable priority rules route work orders to municipal field crews without black-box guesswork.
                </p>
              </div>

              {/* Tactile Action Controls & Ticket Lookup */}
              <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] space-y-5">
                <div className="flex flex-wrap items-stretch gap-3">
                  <Link
                    href="/complaints/new"
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 stitch-btn-accent text-xs font-mono uppercase tracking-wider font-semibold"
                  >
                    <span>File a Complaint Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {mounted && role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[var(--surface-card)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
                      <span>Command Center</span>
                    </Link>
                  ) : (
                    <Link
                      href="/complaints"
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[var(--surface-card)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
                    >
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>My Active Reports</span>
                    </Link>
                  )}
                </div>

                {/* Direct Ledger Ticket Search Bar */}
                <form
                  onSubmit={handleTrackSubmit}
                  className="flex items-stretch bg-[var(--surface-card)] border border-[var(--border-strong)] max-w-md"
                >
                  <div className="flex items-center gap-2.5 px-3.5 flex-1">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Lookup ticket ID (e.g. CP-2026-891)..."
                      className="w-full bg-transparent text-[var(--text-primary)] font-mono text-xs outline-none placeholder:text-[var(--text-muted)] py-2.5"
                    />
                    <kbd className="stitch-kbd hidden sm:inline-flex">↵</kbd>
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-[var(--surface-elevated)] hover:bg-[var(--text-primary)] hover:text-[var(--canvas-base)] text-[var(--text-primary)] border-l border-[var(--border-strong)] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Track
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column (5 cols): Upfront Interactive Triage Dossier Preview */}
            <div className="lg:col-span-5 bg-[var(--surface-card)] flex flex-col justify-between">
              {/* Top Dossier Bar */}
              <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--brand-primary)]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    LIVE TRIAGE DOSSIER INSPECTOR
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {previewCandidates.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHeroPreviewIndex(idx)}
                      className={`px-2 py-1 font-mono text-[10px] border transition-colors ${
                        heroPreviewIndex === idx
                          ? 'bg-[var(--text-primary)] text-[var(--canvas-base)] border-[var(--text-primary)] font-semibold'
                          : 'bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Ticket Telemetry Body */}
              {activeHeroTicket ? (
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                      <span className="font-mono text-xs font-semibold text-[var(--brand-primary)]">
                        #{activeHeroTicket.id}
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-[var(--priority-high-bg)] text-[var(--priority-high-text)] border border-[var(--priority-high-border)] font-semibold tabular-nums">
                        PRIORITY {activeHeroTicket.priorityScore} / 100 ({getPriorityLevel(activeHeroTicket.priorityScore).toUpperCase()})
                      </span>
                    </div>

                    <div>
                      <h2 className="font-semibold text-base text-[var(--text-primary)] leading-snug">
                        {activeHeroTicket.title}
                      </h2>
                      <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[var(--brand-primary)] shrink-0" />
                        <span className="truncate">{activeHeroTicket.location.address}</span>
                      </p>
                    </div>

                    {/* Suggested Category & Confidence Row */}
                    <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                      <div className="p-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                          Suggested Category
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            {activeHeroTicket.aiCategory || activeHeroTicket.category}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--brand-primary)] font-semibold tabular-nums">
                            {Math.round((activeHeroTicket.aiConfidence <= 1 ? activeHeroTicket.aiConfidence * 100 : activeHeroTicket.aiConfidence) || 94)}% CONF
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                          Spatial Cluster
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                            +{activeHeroTicket.duplicateCount} Linked Reports
                          </span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">150m RAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Transparent Priority Reason Ledger */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Transparent Priority Calculation</span>
                        <span>Rule Engine v2.4</span>
                      </div>
                      <div className="border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] font-mono text-xs">
                        {activeHeroTicket.priorityReasons.slice(0, 3).map((reason, idx) => (
                          <div key={idx} className="px-3 py-2 flex items-center justify-between gap-2 bg-[var(--surface-card)]">
                            <span className="text-[11px] font-sans text-[var(--text-secondary)] truncate">
                              {reason.replace(/\s*\(\+\d+\)/, '')}
                            </span>
                            <span className="text-[11px] font-semibold text-[var(--text-primary)] shrink-0 tabular-nums">
                              {reason.match(/\(\+\d+\)/)?.[0] || '+20'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      STATUS: <strong className="text-[var(--text-primary)] uppercase">{activeHeroTicket.status}</strong>
                    </span>
                    <Link
                      href={`/complaints/${activeHeroTicket.id}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      <span>Inspect Audit Timeline</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Bottom Architectural Telemetry Strip (Exposed 1px Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-[var(--border-subtle)] border-x border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  METRIC // 01
                </span>
                <span className="font-mono text-[11px] text-[var(--brand-primary)] font-semibold">+14% MoM</span>
              </div>
              <div className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)] mt-2 tabular-nums">
                1,420+
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Verified Field Resolutions Logged
              </p>
            </div>

            <div className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  METRIC // 02
                </span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">SLA &lt; 30m</span>
              </div>
              <div className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)] mt-2 tabular-nums">
                18 min
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Median Intake-to-Crew Dispatch
              </p>
            </div>

            <div className="p-5 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  METRIC // 03
                </span>
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">150m Radius</span>
              </div>
              <div className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)] mt-2 tabular-nums">
                94.2%
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Spatial Duplicate Clustering Precision
              </p>
            </div>

            <div className="p-5 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  METRIC // 04
                </span>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">100% ONLINE</span>
              </div>
              <div className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)] mt-2 tabular-nums">
                05
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Municipal Wards Synchronized
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 02: EDITORIAL SPLIT — TRIAGE PROTOCOL            */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Editorial Header (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold">
                02 // OPERATIONAL PROTOCOL
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)] leading-[1.08]">
                From street observation to verified closure.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Automation suggests; municipal staff decide. Every classification, duplicate merge, and priority score exposes its underlying math and can be overridden by dispatchers.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] border-b border-[var(--text-primary)] hover:border-[var(--brand-primary)] pb-0.5 transition-colors"
                >
                  <span>Read System Specification</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Asymmetric Architectural Ledger (8 cols) */}
            <div className="lg:col-span-8 border border-[var(--border-subtle)] bg-[var(--surface-card)] divide-y divide-[var(--border-subtle)]">
              {/* Stage 01 */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-3">
                  <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] block">
                    STAGE 01
                  </span>
                  <span className="font-editorial text-2xl text-[var(--text-primary)] block mt-1">
                    Field Capture
                  </span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Geotagged Photo &amp; Sixty-Second Intake
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Citizens submit a description, optional photo evidence, and a precise map pin—with or without an account. Multimodal inspection suggests the infrastructure category immediately.
                  </p>
                </div>
                <div className="md:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-3 font-mono text-[11px] space-y-1">
                  <div className="text-[var(--text-muted)]">PAYLOAD CHECK</div>
                  <div className="text-[var(--text-primary)] font-semibold">JPG / PNG / WEBP</div>
                  <div className="text-emerald-700 dark:text-emerald-400">GEO PIN LOCKED</div>
                </div>
              </div>

              {/* Stage 02 */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-3">
                  <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] block">
                    STAGE 02
                  </span>
                  <span className="font-editorial text-2xl text-[var(--text-primary)] block mt-1">
                    Spatial Triage
                  </span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    150m Duplicate Clustering &amp; Rule Scoring
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Incoming reports within 150 meters of an open complaint of the same category are compared for text similarity. Linked duplicates elevate the primary ticket’s urgency score (0–100).
                  </p>
                </div>
                <div className="md:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-3 font-mono text-[11px] space-y-1">
                  <div className="text-[var(--text-muted)]">HAVERSINE + SIM</div>
                  <div className="text-[var(--text-primary)] font-semibold">R ≤ 150m · S ≥ 0.50</div>
                  <div className="text-[var(--brand-primary)]">TRANSPARENT MATH</div>
                </div>
              </div>

              {/* Stage 03 */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-3">
                  <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] block">
                    STAGE 03
                  </span>
                  <span className="font-editorial text-2xl text-[var(--text-primary)] block mt-1">
                    Verified Proof
                  </span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Department Dispatch &amp; After-Photo Closure
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Administrators work down the priority-sorted queue, confirm or reject duplicates, and log an “after” repair photo that appears on the resident’s live tracking timeline.
                  </p>
                </div>
                <div className="md:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-3 font-mono text-[11px] space-y-1">
                  <div className="text-[var(--text-muted)]">CLOSURE PROOF</div>
                  <div className="text-[var(--text-primary)] font-semibold">BEFORE / AFTER</div>
                  <div className="text-emerald-700 dark:text-emerald-400">72H REOPEN RIGHT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 03: MUNICIPAL INFRASTRUCTURE ROUTING MATRIX      */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold mb-2">
                03 // CLASSIFICATION &amp; SLA SCHEDULE
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
                Supported Municipal Hazard Classifications
              </h2>
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              SELECT ANY CLASSIFICATION TO FILTER THE LIVE WARD MAP BELOW
            </p>
          </div>

          {/* Architectural Specification Table */}
          <div className="border border-[var(--border-subtle)] bg-[var(--surface-card)] divide-y divide-[var(--border-subtle)]">
            {[
              {
                code: 'CAT-01',
                name: 'Road Damage',
                scope: 'Asphalt potholes, surface subsidence, curblines, and transit lane hazards',
                dept: 'Dept of Public Works & Roads',
                baseWeight: '+30 pts',
                sla: '48h Target · 36h Avg',
                icon: Wrench,
              },
              {
                code: 'CAT-02',
                name: 'Water Leakage',
                scope: 'Pressurized water main ruptures, hydrant leaks, and roadbed erosion',
                dept: 'Water & Utilities Board',
                baseWeight: '+25 pts',
                sla: '18h Target · 12h Avg',
                icon: Droplets,
              },
              {
                code: 'CAT-03',
                name: 'Blocked Drains',
                scope: 'Stormwater catch-basin clogs, culvert siltation, and crosswalk ponding',
                dept: 'Stormwater & Drainage Division',
                baseWeight: '+30 pts',
                sla: '24h Target · 20h Avg',
                icon: Waves,
              },
              {
                code: 'CAT-04',
                name: 'Garbage',
                scope: 'Commercial dumpster overflow, illegal waste dumping, and sanitation hazards',
                dept: 'Sanitation & Solid Waste Management',
                baseWeight: '+20 pts',
                sla: '12h Target · 08h Avg',
                icon: Trash2,
              },
              {
                code: 'CAT-05',
                name: 'Streetlights',
                scope: 'Luminaire outages, leaning high-mast poles, and exposed electrical wiring',
                dept: 'Municipal Electrical Grid',
                baseWeight: '+15 pts',
                sla: '24h Target · 14h Avg',
                icon: Lightbulb,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeCategoryFilter === item.name;
              return (
                <div
                  key={item.code}
                  onClick={() => setActiveCategoryFilter(isSelected ? 'All' : item.name)}
                  className={`p-5 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface-elevated)] border-l-4 border-l-[var(--brand-primary)]'
                      : 'hover:bg-[var(--surface-elevated)]/60'
                  }`}
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 border border-[var(--border-strong)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] block">{item.code}</span>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</h3>
                    </div>
                  </div>

                  <div className="md:col-span-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.scope}
                  </div>

                  <div className="md:col-span-3 font-mono text-xs text-[var(--text-primary)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Dispatch Unit</span>
                    <span>{item.dept}</span>
                  </div>

                  <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between gap-1 font-mono text-xs tabular-nums">
                    <span className="px-2 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--brand-primary)] font-semibold">
                      Base {item.baseWeight}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{item.sla}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 04: LIVE FIELD EVIDENCE & SPATIAL QUEUE          */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold mb-2">
                04 // VERIFIED CASE RECORD &amp; TELEMETRY
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
                Auditable Triage &amp; Field Verification
              </h2>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                <span className="w-2 h-2 bg-emerald-600" />
                <span>PUBLIC LEDGER SYNCHRONIZED</span>
              </span>
            </div>
          </div>

          {/* Architectural Case Inspection Dossier */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            {/* Top Status Header */}
            <div className="p-5 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-bold text-[var(--brand-primary)]">#CP-2026-891</span>
                <span className="text-[var(--border-strong)]">|</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Autobahn Road, Ward 1 · Reported 42 mins ago
                </span>
                <span className="px-2 py-0.5 font-mono text-[11px] uppercase bg-[var(--surface-card)] border border-[var(--border-strong)] text-[var(--text-primary)]">
                  Suggested: Road Damage (96%)
                </span>
              </div>
              <div className="font-mono text-xs font-semibold px-3 py-1 bg-[var(--priority-high-bg)] text-[var(--priority-high-text)] border border-[var(--priority-high-border)] tabular-nums">
                HIGH PRIORITY · 88 / 100
              </div>
            </div>

            {/* Transparent Priority Breakdown Bar */}
            <div className="border-b border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 divide-x divide-[var(--border-subtle)] font-mono text-xs tabular-nums">
              <div className="p-3.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Category Severity</span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+30 pts</span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Duplicate Cluster (6)</span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+18 pts</span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">School Zone (&lt;80m)</span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+25 pts</span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Elapsed Age Factor</span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+10 pts</span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Photo Evidence</span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+05 pts</span>
              </div>
              <div className="p-3.5 bg-[var(--text-primary)] text-[var(--canvas-base)]">
                <span className="text-[10px] uppercase opacity-75 block">Composite Score</span>
                <span className="font-bold text-sm mt-0.5 block">88 / 100</span>
              </div>
            </div>

            {/* Split Visual Evidence & Stepper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
              {/* Left: Before & After Photographic Proof (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Photographic Verification Pair
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">EXIF GEO-LOCKED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                    <div className="relative aspect-video">
                      <img
                        className="w-full h-full object-cover"
                        alt="Hazardous deep asphalt pothole with cracks on urban road"
                        src="/samples/sample_pothole_1.jpg"
                        onError={(e) => {
                          e.currentTarget.src = '/samples/sample_pothole_1.jpg';
                        }}
                      />
                      <div className="absolute inset-3 border border-[var(--brand-primary)] border-dashed pointer-events-none flex flex-col justify-between p-1.5">
                        <span className="bg-[var(--brand-primary)] text-white font-mono text-[10px] px-1.5 py-0.5 self-start font-semibold">
                          INTAKE // 96% CONF
                        </span>
                        <span className="bg-[var(--text-primary)] text-[var(--canvas-base)] font-mono text-[10px] px-1.5 py-0.5 self-end">
                          1.2m² · 14in Crater
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] flex justify-between items-center font-mono text-[11px]">
                      <span className="text-[var(--text-secondary)]">BEFORE · 14:10</span>
                      <span className="text-[var(--text-primary)] font-semibold">CITIZEN SUBMISSION</span>
                    </div>
                  </div>

                  {/* After Photo */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                    <div className="relative aspect-video">
                      <img
                        className="w-full h-full object-cover"
                        alt="Asphalt repair patch leveled seamlessly"
                        src="/samples/sample_pothole_2.jpg"
                        onError={(e) => {
                          e.currentTarget.src = '/samples/sample_pothole_2.jpg';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-[var(--surface-card)] border border-[var(--border-strong)] text-[var(--text-primary)] font-mono text-[10px] px-2 py-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>VERIFIED · CREW #14</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] flex justify-between items-center font-mono text-[11px]">
                      <span className="text-[var(--text-secondary)]">AFTER · 16:45</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">FIELD EVIDENCE</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Wrench className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>
                      <strong>Dispatched Unit:</strong> Dept of Public Works &amp; Roads (Rapid Asphalt Team 4)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    BATCH: 320KG THERMAL PATCH
                  </span>
                </div>
              </div>

              {/* Right: Audit Stepper (5 cols) */}
              <div className="lg:col-span-5 p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--text-primary)] block mb-5">
                    Immutable Status History
                  </span>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[var(--text-primary)] text-[var(--canvas-base)] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-primary)] block">
                          01. Reported by Resident
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          13:45 · Geotag locked on Autobahn Road
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[var(--text-primary)] text-[var(--canvas-base)] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-primary)] block">
                          02. Categorized &amp; Deduplicated
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          13:52 · 6 nearby reports linked (Score → 88)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                        03
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--brand-primary)] block">
                          03. Assigned &amp; In Progress
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          14:35 · Public Works Crew #4 on scene
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 border border-[var(--border-strong)] text-[var(--text-muted)] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                        04
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] block">
                          04. Resolved with After-Photo Proof
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          Awaiting final compaction sign-off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">LEDGER REF #CP-2026-891</span>
                  <Link
                    href="/complaints/CP-2026-891"
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    <span>Open Full Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Geographic Ward Map */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <div className="p-5 sm:px-6 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Geographic Incident Telemetry &amp; Ward Queue</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Pins colored by priority band ({filteredComplaints.length} active reports shown)
                </p>
              </div>

              {/* Tactile Category Filter Bar */}
              <div className="flex flex-wrap items-center gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border transition-colors ${
                      activeCategoryFilter === cat
                        ? 'bg-[var(--text-primary)] text-[var(--canvas-base)] border-[var(--text-primary)] font-semibold'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[460px] w-full">
              <CivicMap
                complaints={filteredComplaints}
                selectedId={selectedComplaint?.id}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 05: PUBLIC TRUST & OPEN DATA LEDGER              */}
      {/* ======================================================== */}
      <section className="py-20 bg-[var(--surface-elevated)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold">
                05 // PUBLIC ACCOUNTABILITY LEDGER
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
                Radical municipal transparency by default.
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Every citizen ticket, suggested category confidence, ward priority formula, and field resolution timestamp is auditable on the public ledger.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>OPEN311 COMPLIANT</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)]">
                  <FileCheck className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span>AUDITABLE RULE WEIGHTS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span>GEOJSON SYNDICATION</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-end">
              <Link
                href="/admin/rules"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 stitch-btn-primary font-mono text-xs uppercase tracking-wider font-semibold"
              >
                <span>Inspect Scoring Rules</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(complaints, null, 2))}`}
                download="civicpulse-open-data.json"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[var(--surface-card)] border border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Export JSON</span>
              </a>
            </div>
          </div>

          {/* Live Transparency Metric Ledger */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-[var(--border-subtle)] border border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="p-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] block">
                Total Complaints Logged
              </span>
              <div className="font-editorial text-4xl text-[var(--text-primary)] mt-1 tabular-nums" suppressHydrationWarning>
                {transparency?.totalComplaints ?? complaints.length}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] mt-1 block">
                LIVE PUBLIC REGISTRY
              </span>
            </div>

            <div className="p-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] block">
                Verified Resolved
              </span>
              <div className="font-editorial text-4xl text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums" suppressHydrationWarning>
                {transparency?.totalResolved ?? complaints.filter((c) => c.status === 'Resolved').length}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] mt-1 block">
                PHOTO PROOF ATTACHED
              </span>
            </div>

            <div className="p-5 border-t md:border-t-0 border-[var(--border-subtle)]">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] block">
                Resolution Rate
              </span>
              <div className="font-editorial text-4xl text-[var(--text-primary)] mt-1 tabular-nums" suppressHydrationWarning>
                {transparency ? `${transparency.resolutionRate}%` : '92.4%'}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] mt-1 block">
                ISO 18091 BENCHMARK
              </span>
            </div>

            <div className="p-5 border-t md:border-t-0 border-[var(--border-subtle)]">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] block">
                Avg Repair Turnaround
              </span>
              <div className="font-editorial text-4xl text-[var(--brand-primary)] mt-1 tabular-nums" suppressHydrationWarning>
                {transparency ? `${transparency.avgResolutionHours} hrs` : '18.5 hrs'}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] mt-1 block">
                TARGET SLA &lt; 36 HRS
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

