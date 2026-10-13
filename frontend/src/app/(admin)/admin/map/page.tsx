'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useComplaintsStore } from '@/lib/complaints-store';
import { AdminSpatialMap } from '@/components/map';
import { 
  Compass, 
  ArrowLeft, 
  Sliders, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  ShieldAlert,
  MapPin,
  Clock
} from 'lucide-react';
import { getPriorityLevel } from '@/lib/types';

export default function AdminSpatialMapPage() {
  const { complaints } = useComplaintsStore();
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const highCount = complaints.filter((c) => getPriorityLevel(c.priorityScore) === 'High').length;
  const medCount = complaints.filter((c) => getPriorityLevel(c.priorityScore) === 'Medium').length;
  const lowCount = complaints.filter((c) => getPriorityLevel(c.priorityScore) === 'Low').length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-fade-in">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] transition-colors hover-lift"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Triage Table</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Spatial Priority GIS Dispatch Engine
            </h1>
          </div>
        </div>

        {/* Priority Band Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-secondary)] font-semibold uppercase text-[10px] hidden md:inline">
            Priority Bands:
          </span>

          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              priorityFilter === 'all'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]'
            }`}
            suppressHydrationWarning
          >
            All ({complaints.length})
          </button>

          <button
            onClick={() => setPriorityFilter('high')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              priorityFilter === 'high'
                ? 'bg-[rgba(244,63,94,0.2)] text-[#FB7185] border border-[rgba(244,63,94,0.4)] shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-[var(--text-secondary)] hover:text-[#FB7185] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]'
            }`}
            suppressHydrationWarning
          >
            <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
            <span>High ({highCount})</span>
          </button>

          <button
            onClick={() => setPriorityFilter('medium')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              priorityFilter === 'medium'
                ? 'bg-[rgba(245,158,11,0.2)] text-[#FBBF24] border border-[rgba(245,158,11,0.4)] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-[var(--text-secondary)] hover:text-[#FBBF24] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]'
            }`}
            suppressHydrationWarning
          >
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
            <span>Medium ({medCount})</span>
          </button>

          <button
            onClick={() => setPriorityFilter('low')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              priorityFilter === 'low'
                ? 'bg-[rgba(59,130,246,0.2)] text-[#60A5FA] border border-[rgba(59,130,246,0.4)] shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'text-[var(--text-secondary)] hover:text-[#60A5FA] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]'
            }`}
            suppressHydrationWarning
          >
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
            <span>Low ({lowCount})</span>
          </button>
        </div>
      </div>

      {/* Full-Height Vector Leaflet Map */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <AdminSpatialMap
          complaints={complaints}
          selectedPriorityFilter={priorityFilter}
        />

        {/* Floating spatial stats HUD badge */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="pointer-events-auto p-3.5 rounded-2xl bg-[var(--surface-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] text-xs shadow-2xl space-y-2 animate-scale-in max-w-sm">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-float" />
              <span>GIS Geospatial Telemetry & Impact Engine</span>
            </div>
            <div className="text-[var(--text-primary)] font-semibold text-xs">
              Affected Incident Perimeters & Safety Corridors
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]/30 border border-[#FB7185]" />
                <span>High Impact (220m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]/30 border border-[#FBBF24]" />
                <span>Medium (140m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]/30 border border-[#60A5FA]" />
                <span>Low Impact (70m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-dashed border-red-500" />
                <span>Hospital/School Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
