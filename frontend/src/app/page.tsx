'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Complaint, 
  CATEGORY_THEME, 
  PRIORITY_THEME, 
  STATUS_THEME,
  ComplaintCategory,
  TransparencyStats
} from '@/lib/types';
import { fetchTransparencyStats } from '@/lib/api';
import { useComplaintsStore } from '@/lib/complaints-store';
import { CivicMap } from '@/components/map';
import { usePersona } from '@/context/PersonaContext';
import { 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  MapPin, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Download, 
  Layers, 
  Wrench, 
  Trash2, 
  Lightbulb, 
  Droplets, 
  Waves, 
  Building2, 
  Activity, 
  Eye, 
  Check, 
  Truck, 
  FileCheck,
  AlertTriangle,
  Flame,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { role } = usePersona();
  const { complaints } = useComplaintsStore();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [transparency, setTransparency] = useState<TransparencyStats | null>(null);

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

    // Check if complaint exists
    const match = complaints.find(c => 
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
  const filteredComplaints = activeCategoryFilter === 'All'
    ? complaints
    : complaints.filter(c => c.category === activeCategoryFilter);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden bg-[var(--canvas-base)] text-[var(--text-primary)] transition-colors duration-300">
      {/* ======================================================== */}
      {/* SECTION 1: HERO SECTION                                  */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--border-subtle)] bg-civic-grid">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[360px] h-[260px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-start max-w-4xl">
            {/* Top Operational Pill with Float Animation */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-card)] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium tracking-tight mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-float">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Smart City Dispatch v1.0 · 24/7 Real-Time Triage</span>
            </div>

            {/* Headline with Fade-in Animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] animate-fade-in-up">
              Civic Complaint Triage, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Engineered for Swift Action.
              </span>
            </h1>

            {/* Subtitle with Staggered Fade-in */}
            <p className="mt-6 text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed animate-fade-in-up delay-150">
              Report road hazards, sanitation backlogs, streetlight outages, and water leaks. Our deterministic scoring and spatial deduplication route work orders to municipal crews in minutes.
            </p>

            {/* Action Row & Interactive Track Search */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto animate-fade-in-up delay-200">
              <Link
                href="/complaints/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
              >
                <span>File a Complaint Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Interactive Ticket Tracker Input */}
              <form onSubmit={handleTrackSubmit} className="inline-flex items-center bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-1 shadow-md focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="flex items-center gap-2 px-3">
                  <Search className="w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="#CP-8492"
                    className="w-28 sm:w-36 bg-transparent text-[var(--text-primary)] font-mono text-xs uppercase outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--surface-elevated)] hover:bg-emerald-500 hover:text-zinc-950 text-[var(--text-primary)] text-xs font-semibold rounded transition-colors"
                >
                  Track
                </button>
              </form>

              {role === 'admin' ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-sm transition-all hover:scale-105"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Command Center</span>
                </Link>
              ) : (
                <Link
                  href="/complaints"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium text-sm transition-all hover:scale-105"
                >
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>My Active Reports</span>
                </Link>
              )}
            </div>

            {/* Live Public Stats Strip */}
            <div className="mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-300">
              {/* Stat 1 */}
              <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover-lift transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-3xl font-bold tracking-tight">1,420+</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                    +14% vs prev mo
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 font-medium">Issues Resolved This Month</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover-lift transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-3xl font-bold tracking-tight">18 mins</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
                    42% faster
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 font-medium">Average Triage Speed</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover-lift transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-3xl font-bold tracking-tight">94.2%</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] text-xs font-mono border border-[var(--border-subtle)]">
                    50m radius
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 font-medium">Duplicate Detection Accuracy</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover-lift transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-3xl font-bold tracking-tight">5</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                    100% online
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 font-medium">Active Municipal Wards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: HOW IT WORKS                                   */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              How CivicPulse Works: From Observation to Verified Resolution
            </h2>
            <p className="text-[var(--text-muted)] mt-2 text-sm sm:text-base leading-relaxed">
              An automated civic processing chain engineered to eradicate processing silos and expedite dispatch.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-7 left-12 right-12 h-[2px] bg-[var(--border-subtle)] -z-0" />

            {/* Step 1 */}
            <div className="relative z-10 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col h-full shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-base shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                  1
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">Stage 01 · Capture</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Snap & Pin</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-grow">
                Citizen snaps a photo, drops a pin on a Leaflet map, and types a short note. Reverse geocoding & EXIF tamper check validate authenticity instantly.
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-muted)] font-mono text-xs">
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">GEO-VERIFY: OK</span>
                <span>EXIF HASH: 9B7C1</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col h-full shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-base shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                  2
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">Stage 02 · Inference</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">AI Triage & Deduplication</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-grow">
                Multi-modal AI verifies the issue, groups identical reports, and assigns transparent priority scores (0–100) based on hazard severity and location density.
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-muted)] font-mono text-xs">
                <span className="text-cyan-500 dark:text-cyan-400 font-semibold">CLUSTERING: ACTIVE</span>
                <span>ACCURACY: 98.2%</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col h-full shadow-lg hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-base shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                  3
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">Stage 03 · Field Action</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Track to Resolution</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-grow">
                Public live tracking timeline with verified ‘after’ photos uploaded by field staff. Cryptographic completion proof recorded in the public registry.
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-muted)] font-mono text-xs">
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">PROOF-OF-WORK: SIGNED</span>
                <span>SLA: COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: CIVIC CATEGORY SHOWCASE                       */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Supported Issue Classifications
            </h2>
            <p className="text-[var(--text-muted)] mt-2 text-sm sm:text-base leading-relaxed">
              One-tap AI detection across essential municipal infrastructure categories with pre-routed dispatch pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Road Damage */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-orange-500/40 hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Road Damage</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Potholes & surface ruptures</p>
              </div>
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
                Target: 48h • Avg: 36h
              </div>
            </div>

            {/* 2. Garbage */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-lime-500/40 hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Garbage & Waste</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Overflowing bins & illegal dumps</p>
              </div>
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
                Target: 12h • Avg: 8h
              </div>
            </div>

            {/* 3. Streetlights */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/40 hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Streetlight Faults</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Dim, broken, or exposed wiring</p>
              </div>
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
                Target: 24h • Avg: 14h
              </div>
            </div>

            {/* 4. Water Leakage */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Water Leakage</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Burst pipes & water main leaks</p>
              </div>
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
                Target: 18h • Avg: 12h
              </div>
            </div>

            {/* 5. Blocked Drains */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[var(--surface-elevated)] transition-colors shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Waves className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Blocked Drains</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Stormwater clogs & runoff hazards</p>
              </div>
              <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
                Target: 24h • Avg: 20h
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: LIVE CIVIC TRIAGE PREVIEW                     */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* Header with Real-Time Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Live Public Triage Stream
              </h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                Real-time feed of ingested citizen reports and automated prioritization matrix.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Stream Active</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)]">Auto-refreshed: 3s ago</span>
            </div>
          </div>

          {/* Main Stitch High-Density Inspection Card */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl flex flex-col gap-6">
            {/* Top Status Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-lg text-emerald-600 dark:text-emerald-400 font-bold">#CP-2026-9041</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-sm text-[var(--text-muted)]">Ward 4: North Elmwood · Reported 42 mins ago</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Road Damage
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>High · 78</span>
              </div>
            </div>

            {/* Priority Breakdown Logic Bar */}
            <div className="bg-[var(--surface-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Transparent Priority Score Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs">
                <div className="p-2.5 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-sans">Road Severity</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">+30 pts</span>
                </div>
                <div className="p-2.5 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-sans">Duplicates (4)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">+20 pts</span>
                </div>
                <div className="p-2.5 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-sans">School Zone (&lt;80m)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">+18 pts</span>
                </div>
                <div className="p-2.5 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-sans">Age Factor (3d)</span>
                  <span className="font-bold text-[var(--text-primary)]">+5 pts</span>
                </div>
                <div className="p-2.5 bg-[var(--surface-card)] rounded border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block text-[10px] uppercase font-sans">Verified EXIF</span>
                  <span className="font-bold text-[var(--text-primary)]">+5 pts</span>
                </div>
                <div className="p-2.5 bg-emerald-500 text-zinc-950 rounded flex flex-col justify-center">
                  <span className="text-zinc-900 block text-[10px] uppercase font-sans font-bold">Total Score</span>
                  <span className="font-bold text-sm">78 / 100</span>
                </div>
              </div>
            </div>

            {/* Split Inspection View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Computer Vision Evidence (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Visual Evidence & Computer Vision Verification</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Image with Bounding Box Overlay */}
                  <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-sunken)] flex flex-col">
                    <div className="relative aspect-video">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Hazardous deep asphalt pothole with cracks on urban road" 
                        src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"
                      />
                      {/* Bounding Box HUD Overlay */}
                      <div className="absolute inset-4 border-2 border-rose-500/80 border-dashed pointer-events-none flex flex-col justify-between p-1.5 bg-rose-500/5">
                        <span className="bg-rose-500 text-white font-mono text-[10px] px-1 py-0.5 rounded self-start font-bold">
                          Obstruction: 96.4%
                        </span>
                        <span className="bg-emerald-500 text-zinc-950 font-mono text-[10px] px-1 py-0.5 rounded self-end font-bold">
                          Area: 1.2m² • Depth: 7.4cm
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-[var(--surface-elevated)] flex justify-between items-center font-mono text-xs text-[var(--text-muted)]">
                      <span>Reported: 14:10 EST</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Citizen Upload</span>
                    </div>
                  </div>

                  {/* After Image */}
                  <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-sunken)] flex flex-col">
                    <div className="relative aspect-video">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Asphalt repair patch leveled seamlessly" 
                        src="https://images.unsplash.com/photo-1584463699042-494b29bb01e5?auto=format&fit=crop&q=80&w=800"
                      />
                      {/* Inspector Stamp */}
                      <div className="absolute bottom-2 right-2 bg-[var(--surface-card)]/90 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] px-2 py-1 rounded shadow-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Signed Off · Crew #14</span>
                      </div>
                    </div>
                    <div className="p-2 bg-[var(--surface-elevated)] flex justify-between items-center font-mono text-xs text-[var(--text-muted)]">
                      <span>Resolved: 16:45 EST</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Field Verification</span>
                    </div>
                  </div>
                </div>

                {/* Allocation summary */}
                <div className="p-3 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--text-primary)] gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span><strong>Assigned:</strong> Public Works Div 3 (Crew: Marcus & Team)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[var(--text-muted)]">Material: Cold Asphalt Patch (320kg)</span>
                  </div>
                </div>
              </div>

              {/* Right: Resolution Stepper (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] pt-6 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-sm font-semibold text-[var(--text-primary)] block mb-4">Resolution Stepper</span>
                  <div className="flex flex-col gap-5">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">1. Reported by Resident</span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">14:10 EST · Mobile Web Geotag locked</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">2. AI Triaged & Deduplicated</span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">14:12 EST · 4 duplicate tickets merged</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">3. Crew Assigned & In Transit</span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">14:28 EST · Public Works Unit Truck #14 • ETA: 11 mins</span>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full border border-[var(--border-strong)] bg-transparent flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text-muted)]">4. Repair & Photo Sign-off</span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">Pending on-site sign-off</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--text-muted)]">AUDIT TRAIL #8942-ELM</span>
                  <Link href="/complaints/CP-1001" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-xs flex items-center gap-1 transition-colors">
                    <span>View Full Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Spatial Queue Overview with Leaflet Map */}
          <div className="mt-8 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <span>Geographic Incident Map & Ward Queue</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Explore active community reports and municipal dispatch positions in real time</p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      activeCategoryFilter === cat
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[440px] w-full rounded-xl overflow-hidden border border-[var(--border-subtle)]">
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
      {/* SECTION 5: PUBLIC TRUST & TRANSPARENCY                   */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Radical Municipal Transparency By Default
              </h2>
              <p className="text-[var(--text-muted)] mt-3 text-sm sm:text-base leading-relaxed">
                Every citizen ticket, AI confidence score, ward queue priority, and field resolution timestamp is auditable on our open public registry. No black-box prioritization.
              </p>

              {/* Compliance Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded font-mono text-xs text-[var(--text-primary)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>GDPR & CCPA Compliant</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded font-mono text-xs text-[var(--text-primary)]">
                  <FileCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Auditable AI Scoring</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded font-mono text-xs text-[var(--text-primary)]">
                  <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Open GeoJSON API</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0">
              <Link
                href="/admin/rules"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-sm transition-colors text-center shadow-[0_0_16px_rgba(16,185,129,0.25)]"
              >
                <span>Public Scoring Algorithm →</span>
              </Link>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(complaints, null, 2))}`}
                download="civicpulse-open-data.json"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Download Open Data</span>
              </a>
            </div>
          </div>

          {/* Live Transparency Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Total Complaints Logged
              </span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono mt-1" suppressHydrationWarning>
                {transparency?.totalComplaints ?? complaints.length}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">Live Public Ledger</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Field Resolved
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1" suppressHydrationWarning>
                {transparency?.totalResolved ?? complaints.filter((c) => c.status === 'Resolved').length}
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Photo Proof-of-Work</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Resolution Rate
              </span>
              <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-1" suppressHydrationWarning>
                {transparency ? `${transparency.resolutionRate}%` : '92.4%'}
              </div>
              <span className="text-[10px] text-cyan-500/80 mt-1 block">ISO 18091 Compliant</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Avg Repair Turnaround
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1" suppressHydrationWarning>
                {transparency ? `${transparency.avgResolutionHours} hrs` : '18.5 hrs'}
              </div>
              <span className="text-[10px] text-amber-500/80 mt-1 block">Target: &lt;36 hrs</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
