import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Camera, 
  Inbox, 
  Calculator, 
  ArrowRight, 
  Download, 
  Building2, 
  Activity,
  Wrench,
  Trash2,
  Lightbulb,
  Droplets,
  Award
} from 'lucide-react';

export const metadata = {
  title: 'About CivicPulse — Architecture & Municipal Standards',
  description:
    'Learn how CivicPulse combines edge computer vision, proximity clustering, and transparent dispatch prioritization to resolve civic hazards rapidly.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* ======================================================== */}
        {/* SECTION 1: INSTITUTIONAL HEADER & TELEMETRY STRIP        */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-4 animate-fade-in-up">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">About the Platform</span>
          </nav>

          <div className="flex flex-col gap-2 pt-2">
            <div className="inline-flex items-center gap-2 self-start bg-[var(--surface-card)] border border-[var(--border-subtle)] px-3 py-1 rounded text-xs font-mono text-[var(--text-primary)] uppercase tracking-wider animate-float">
              <span>Directorate of Urban Infrastructure</span>
              <span>•</span>
              <span className="text-emerald-400">Civic Code § 14-88</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Municipal Infrastructure Triage & Accountability
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed mt-2">
              CivicPulse connects resident hazard reporting with departmental dispatch through structured classification, proximity-based deduplication, and verifiable photographic evidence.
            </p>
          </div>

          {/* System Telemetry Badge Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <div className="inline-flex items-center gap-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded text-xs font-mono text-[var(--text-primary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Public Architecture Spec v2.4</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded text-xs font-mono text-[var(--text-primary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Auditable Municipal Ledger</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>City Service Level Agreement: Compliant</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded text-xs font-mono text-[var(--text-muted)] ml-auto">
              <span>UPTIME: 99.98%</span>
              <span>•</span>
              <span>DISPATCH EPOCH: 2026.04</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: FOUNDATIONAL MANDATES                         */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Foundational Mandates</h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Codified standards enforced at database write level</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mandate 1 */}
            <div className="flex flex-col justify-between bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded">[MANDATE-01]</span>
                  <Inbox className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Guaranteed Receipt</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Every submitted issue receives an immutable reference ID and an entry in the public triage ledger without human filtering or gatekeeping.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">Zero-drop citizen telemetry · Timestamped entry</span>
              </div>
            </div>

            {/* Mandate 2 */}
            <div className="flex flex-col justify-between bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded">[MANDATE-02]</span>
                  <Calculator className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Transparent Scoring</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Priority is calculated via public weighting rules—severity, repeat reports, and proximity to sensitive infrastructure—not arbitrary queuing or political triage.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">Public scoring formula · Weight factor breakdown</span>
              </div>
            </div>

            {/* Mandate 3 */}
            <div className="flex flex-col justify-between bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded">[MANDATE-03]</span>
                  <Camera className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Evidence-Based Closure</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Field crews cannot mark tickets resolved without attaching verified photographic proof of completed repairs and material telemetry.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">Bi-directional photo proof · Tamper verification</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: THE AUTOMATED TRIAGE PIPELINE                */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">The Automated Triage Pipeline</h2>
            <p className="text-sm text-[var(--text-muted)]">
              An end-to-end algorithmic and departmental sequence from citizen mobile intake to cryptographically stamped resolution.
            </p>
          </div>

          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 sm:p-8 flex flex-col gap-8 shadow-xl">
            {/* Step Rail Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="h-0.5 bg-[var(--border-subtle)] flex-1 hidden md:block" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">STAGE 01</span>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">Resident Intake</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Capture description, image evidence, and precise GPS coordinates via browser-based map pin with zero mandatory app downloads.
                </p>
                <div className="mt-auto pt-2">
                  <div className="bg-[var(--surface-elevated)] p-3 rounded text-xs font-mono text-[var(--text-secondary)] flex flex-col gap-1 border border-[var(--border-subtle)]">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Specs:</span>
                    <span>• EXIF metadata validation</span>
                    <span>• Reverse geocoding</span>
                    <span>• Anonymized telemetry</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="h-0.5 bg-[var(--border-subtle)] flex-1 hidden md:block" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">STAGE 02</span>
                  <h3 className="text-base font-bold text-white mt-0.5">AI Classification</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Fast multi-modal classification against 5 standard categories with visible confidence ratings and full operator manual override capability.
                </p>
                <div className="mt-auto pt-2">
                  <div className="bg-[#161922] p-3 rounded text-xs font-mono text-zinc-300 flex flex-col gap-1 border border-white/[0.06]">
                    <span className="font-bold text-cyan-400">Specs:</span>
                    <span>• Edge vision inference</span>
                    <span>• Risk scoring matrix</span>
                    <span>• 5 Municipal buckets</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="h-0.5 bg-white/[0.1] flex-1 hidden md:block" />
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase">STAGE 03</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Deduplication</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cosine similarity on embeddings combined with 50-meter proximity checks links nearby matching reports into a single consolidated master ticket.
                </p>
                <div className="mt-auto pt-2">
                  <div className="bg-[#161922] p-3 rounded text-xs font-mono text-zinc-300 flex flex-col gap-1 border border-white/[0.06]">
                    <span className="font-bold text-emerald-400">Specs:</span>
                    <span>• Geo-hash spatial indexing</span>
                    <span>• Parent-child bundling</span>
                    <span>• Resident sync updates</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                    4
                  </div>
                  <div className="h-0.5 bg-transparent flex-1 hidden md:block" />
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase">STAGE 04</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Priority & Dispatch</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Calculates a 0–100 urgency score with complete factor breakdowns, routing tickets directly to Roads, Sanitation, Water, or Electrical work orders.
                </p>
                <div className="mt-auto pt-2">
                  <div className="bg-[#161922] p-3 rounded text-xs font-mono text-zinc-300 flex flex-col gap-1 border border-white/[0.06]">
                    <span className="font-bold text-amber-400">Specs:</span>
                    <span>• Dynamic Ward SLA timers</span>
                    <span>• Field tablet sync</span>
                    <span>• Public queue broadcast</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Pipeline Metric Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 bg-[#161922] p-4 rounded-xl border border-white/[0.08]">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-400 uppercase">Median Ingest Time</span>
                <span className="text-2xl font-bold text-white mt-0.5 font-mono">1.4s</span>
                <span className="text-xs font-mono text-emerald-400">99.4th percentile</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-400 uppercase">Auto-Dedup Rate</span>
                <span className="text-2xl font-bold text-white mt-0.5 font-mono">41.2%</span>
                <span className="text-xs font-mono text-zinc-400">Reduced duplicate trips</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-400 uppercase">Classification Accuracy</span>
                <span className="text-2xl font-bold text-white mt-0.5 font-mono">97.8%</span>
                <span className="text-xs font-mono text-zinc-400">Auditor verified</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-400 uppercase">SLA Compliance Rate</span>
                <span className="text-2xl font-bold text-white mt-0.5 font-mono">94.6%</span>
                <span className="text-xs font-mono text-emerald-400">All 5 city wards</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: DEPARTMENT JURISDICTION DIRECTORY             */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Department Jurisdiction Directory</h2>
            <p className="text-sm text-zinc-400">
              Standard municipal routing pipelines and operational responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roads & Transport */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl flex flex-col justify-between gap-4 shadow-lg hover:border-orange-500/30 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-orange-500 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20">
                    ROADS & TRANSPORT // CAT-ROAD
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Division 3</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">Surface & Thoroughfare Safety</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Potholes, surface ruptures, missing guardrails, collapsed curbs, traffic signaling hardware, and road paint obstruction.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-[var(--surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Target SLA</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">48h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Avg Fix</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">36h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Assigned Unit</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">Public Works 3</span>
                </div>
              </div>
            </div>

            {/* Sanitation & Waste */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl flex flex-col justify-between gap-4 shadow-lg hover:border-lime-500/30 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-lime-600 dark:text-lime-400 bg-lime-500/10 border border-lime-500/20">
                    SANITATION & WASTE // CAT-GARBAGE
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Bureau San</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">Waste Clearance & Public Hygiene</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Overflowing public bins, unauthorized bulk dumping, hazardous organic debris, litter accumulation, and illegal commercial waste.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-[var(--surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Target SLA</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">12h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Avg Fix</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">8h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Assigned Unit</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">Bureau Sanit.</span>
                </div>
              </div>
            </div>

            {/* Electrical Services */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl flex flex-col justify-between gap-4 shadow-lg hover:border-amber-500/30 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    ELECTRICAL SERVICES // CAT-STREETLIGHT
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Power & Grid</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">Public Illumination & Wiring</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Streetlight outages, dim illumination corridors, exposed electrical wiring, damaged junction boxes, and traffic sensor faults.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-[var(--surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Target SLA</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">24h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Avg Fix</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">14h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Assigned Unit</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">Grid Services</span>
                </div>
              </div>
            </div>

            {/* Water & Drainage */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 rounded-xl flex flex-col justify-between gap-4 shadow-lg hover:border-cyan-500/30 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                    WATER & DRAINAGE // CAT-WATER
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Water Auth</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">Hydraulic & Stormwater Systems</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Burst water mains, stormwater culvert blockages, street ponding, sewage backflow risks, and missing manhole covers.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-[var(--surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Target SLA</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">18h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Avg Fix</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">12h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Assigned Unit</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] truncate">Hydraulic Ops</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: PUBLIC GOVERNANCE & TRANSPARENCY GUARANTEE    */}
        {/* ======================================================== */}
        <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Open Governance Guarantee</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Auditability as a Public Utility
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              All incident records, routing logs, and dispatch latency timelines are accessible via public JSON/GeoJSON syndication feeds. Citizens retain statutory rights to contest closure statuses and request secondary administrative review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/admin/rules"
              className="px-5 py-3 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>View Scoring Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/complaints"
              className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.3)]"
            >
              <span>Live Public Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Administrative Compliance Banner */}
        <section className="bg-[var(--surface-elevated)]/60 border border-[var(--border-subtle)] p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Operated in accordance with Open Municipal Governance Protocol v1.4</span>
          </div>
          <div className="flex items-center gap-4">
            <span>System ID: <strong className="text-[var(--text-primary)]">CP-TRIAGE-2026</strong></span>
            <span className="hidden md:inline">•</span>
            <span>Authority Level 1 Public Service Infrastructure</span>
          </div>
        </section>
      </div>
    </div>
  );
}
