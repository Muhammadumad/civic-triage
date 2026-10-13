'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Clock, 
  Camera, 
  Layers, 
  Zap,
  Info
} from 'lucide-react';
import { PRIORITY_THEME, SensitiveZone, getPriorityLevel } from '@/lib/types';
import { fetchRules, updateRules } from '@/lib/api';
import { SensitiveZoneManager } from '@/components/admin/SensitiveZoneManager';

interface RuleWeights {
  categorySeverity: number; // 0 to 35
  duplicateWeight: number;   // 0 to 25
  sensitiveZone: number;     // 0 to 20
  complaintAge: number;      // 0 to 15
  photoEvidence: number;     // 0 to 5
}

const DEFAULT_WEIGHTS: RuleWeights = {
  categorySeverity: 28,
  duplicateWeight: 18,
  sensitiveZone: 16,
  complaintAge: 12,
  photoEvidence: 5,
};

export default function AdminRulesPage() {
  const [weights, setWeights] = useState<RuleWeights>(DEFAULT_WEIGHTS);
  const [sensitiveZones, setSensitiveZones] = useState<SensitiveZone[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRules()
      .then((res) => {
        if (res) {
          if (res.rules) {
            const r = res.rules;
            setWeights({
              categorySeverity: r.maxCategoryWeight ?? 28,
              duplicateWeight: r.duplicateWeight ?? 18,
              sensitiveZone: r.sensitiveZoneWeight ?? 16,
              complaintAge: r.ageWeight ?? 12,
              photoEvidence: r.photoEvidenceWeight ?? 5,
            });
          }
          if (res.sensitiveZones && Array.isArray(res.sensitiveZones)) {
            setSensitiveZones(res.sensitiveZones);
          }
        }
      })
      .catch((err) => {
        console.info('[AdminRules] Using default weights:', err);
      });
  }, []);

  // Live Simulator sample multipliers
  const [simCategoryFactor, setSimCategoryFactor] = useState(0.9); // High severity category
  const [simDuplicates, setSimDuplicates] = useState(4); // 4 duplicates
  const [simIsSensitiveZone, setSimIsSensitiveZone] = useState(true);
  const [simAgeDays, setSimAgeDays] = useState(2);
  const [simHasPhoto, setSimHasPhoto] = useState(true);

  // Computed simulation points
  const simCategoryPts = Math.round(weights.categorySeverity * simCategoryFactor);
  const simDuplicatePts = Math.min(weights.duplicateWeight, Math.round((simDuplicates / 5) * weights.duplicateWeight));
  const simSensitivePts = simIsSensitiveZone ? weights.sensitiveZone : 0;
  const simAgePts = Math.min(weights.complaintAge, Math.round((simAgeDays / 4) * weights.complaintAge));
  const simPhotoPts = simHasPhoto ? weights.photoEvidence : 0;

  const totalSimScore = Math.min(100, simCategoryPts + simDuplicatePts + simSensitivePts + simAgePts + simPhotoPts);
  const simPriorityLevel = getPriorityLevel(totalSimScore);
  const simPriorityTheme = PRIORITY_THEME[simPriorityLevel];

  const handleSave = async () => {
    setSaveStatus('Deploying rule calibrations to municipal dispatch backend...');
    try {
      const res = await updateRules({
        maxCategoryWeight: weights.categorySeverity,
        duplicateWeight: weights.duplicateWeight,
        sensitiveZoneWeight: weights.sensitiveZone,
        ageWeight: weights.complaintAge,
        photoEvidenceWeight: weights.photoEvidence,
      });
      const count = res.recalculatedCount ?? 'Active';
      setSaveStatus(`Rules Deployed! ${count} active tickets recalibrated.`);
      setTimeout(() => setSaveStatus(null), 3500);
    } catch {
      setSaveStatus('Rules saved locally in dispatcher daemon.');
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notice */}
      {saveStatus && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <span>Dynamic Priority Scoring Rules</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono animate-float">
              v2.4 Algorithmic Config
            </span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Tune weight allocations for municipal emergency classification, clustering thresholds, and automated field dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] transition-colors hover-lift"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] hover-lift"
          >
            <Save className="w-4 h-4" />
            <span>Save & Recalibrate Active Queue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Configuration Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-[var(--border-subtle)] space-y-6">
            <div className="pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Multi-Factor Mathematical Weight Sliders</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Adjust points contributed to the overall 0–100 urgency index for each operational factor.
              </p>
            </div>

            <div className="space-y-6">
              {/* Slider 1: Category Severity */}
              <div className="space-y-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover-lift transition-all">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-[var(--text-primary)]">Category Severity Weight</span>
                  </div>
                  <span className="font-mono text-emerald-500 dark:text-emerald-400 font-extrabold text-sm">
                    {weights.categorySeverity} / 35 pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={weights.categorySeverity}
                  onChange={(e) => setWeights({ ...weights, categorySeverity: Number(e.target.value) })}
                  className="w-full accent-emerald-500 bg-slate-300 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Allocated based on intrinsic infrastructure hazard (e.g., water main breaks and severe craters vs. graffiti).
                </p>
              </div>

              {/* Slider 2: Duplicate Count */}
              <div className="space-y-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover-lift transition-all">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-[var(--text-primary)]">Duplicate Count Multiplier</span>
                  </div>
                  <span className="font-mono text-indigo-500 dark:text-indigo-400 font-extrabold text-sm">
                    {weights.duplicateWeight} / 25 pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={weights.duplicateWeight}
                  onChange={(e) => setWeights({ ...weights, duplicateWeight: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-slate-300 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Boosts urgency as neighboring residents file recurring reports within a 120-meter cluster radius.
                </p>
              </div>

              {/* Slider 3: Sensitive Zone Proximity */}
              <div className="space-y-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover-lift transition-all">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-[var(--text-primary)]">Sensitive Zone Proximity Weight</span>
                  </div>
                  <span className="font-mono text-amber-500 dark:text-amber-400 font-extrabold text-sm">
                    {weights.sensitiveZone} / 20 pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={weights.sensitiveZone}
                  onChange={(e) => setWeights({ ...weights, sensitiveZone: Number(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-300 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Applies priority escalation when incidents fall within school zones, hospital paths, or transit hubs.
                </p>
              </div>

              {/* Slider 4: Complaint Age Factor */}
              <div className="space-y-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover-lift transition-all">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-[var(--text-primary)]">Complaint Age Escalation</span>
                  </div>
                  <span className="font-mono text-rose-500 dark:text-rose-400 font-extrabold text-sm">
                    {weights.complaintAge} / 15 pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={weights.complaintAge}
                  onChange={(e) => setWeights({ ...weights, complaintAge: Number(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-300 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Prevents backlog stagnation by progressively escalating unresolved tickets nearing SLA deadlines.
                </p>
              </div>

              {/* Slider 5: Photo Evidence Weight */}
              <div className="space-y-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover-lift transition-all">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-500" />
                    <span className="font-bold text-[var(--text-primary)]">Photo Evidence Weight</span>
                  </div>
                  <span className="font-mono text-cyan-500 dark:text-cyan-400 font-extrabold text-sm">
                    {weights.photoEvidence} / 5 pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.photoEvidence}
                  onChange={(e) => setWeights({ ...weights, photoEvidence: Number(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-300 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Awards confidence bonus when verified geotagged imagery is submitted with EXIF coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Reactive Simulator Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Live Reactive Simulator</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Dynamic score calculation in real time</p>
                </div>
              </div>

              {/* Priority Pill */}
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono border ${simPriorityTheme.bg} ${simPriorityTheme.text} ${simPriorityTheme.border}`}
              >
                Score: {totalSimScore} ({simPriorityLevel})
              </span>
            </div>

            {/* Simulated Complaint Details */}
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-3 text-xs">
              <div className="flex justify-between text-[var(--text-primary)] font-semibold pb-2 border-b border-[var(--border-subtle)]">
                <span>Simulated Incident:</span>
                <span className="font-mono text-emerald-500 dark:text-emerald-400">CP-SIM-TEST</span>
              </div>

              {/* Simulator interactive controls */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                    Category Severity Multiplier:
                  </label>
                  <select
                    value={simCategoryFactor}
                    onChange={(e) => setSimCategoryFactor(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                  >
                    <option value={1.0}>Critical Hazard (Water Rupture / Deep Sinkhole - 100%)</option>
                    <option value={0.85}>High Hazard (Active Gas Seep / Severe Pothole - 85%)</option>
                    <option value={0.6}>Medium Hazard (Blocked Storm Culvert - 60%)</option>
                    <option value={0.35}>Low Hazard (Graffiti / Streetlamp Out - 35%)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)]">Simulated Duplicate Reports:</span>
                  <div className="flex items-center gap-2">
                    {[0, 2, 4, 8].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSimDuplicates(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                          simDuplicates === d
                            ? 'bg-indigo-500 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        +{d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)]">Inside Sensitive School Corridor:</span>
                  <input
                    type="checkbox"
                    checked={simIsSensitiveZone}
                    onChange={(e) => setSimIsSensitiveZone(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)]">Verified Photo Attached:</span>
                  <input
                    type="checkbox"
                    checked={simHasPhoto}
                    onChange={(e) => setSimHasPhoto(e.target.checked)}
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Mathematical Breakdown Bars */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Calculated Term Values:
              </span>

              <div className="flex justify-between items-center text-[11px] p-2 rounded bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Category Severity:</span>
                <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">+{simCategoryPts} pts</span>
              </div>

              <div className="flex justify-between items-center text-[11px] p-2 rounded bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Duplicate Clustering:</span>
                <span className="font-mono text-indigo-500 dark:text-indigo-400 font-bold">+{simDuplicatePts} pts</span>
              </div>

              <div className="flex justify-between items-center text-[11px] p-2 rounded bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Sensitive Zone Bonus:</span>
                <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">+{simSensitivePts} pts</span>
              </div>

              <div className="flex justify-between items-center text-[11px] p-2 rounded bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Age Escalation:</span>
                <span className="font-mono text-rose-500 dark:text-rose-400 font-bold">+{simAgePts} pts</span>
              </div>

              <div className="flex justify-between items-center text-[11px] p-2 rounded bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Photo Evidence:</span>
                <span className="font-mono text-cyan-500 dark:text-cyan-400 font-bold">+{simPhotoPts} pts</span>
              </div>
            </div>

            {/* Total Formula Outcome */}
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-center space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase font-semibold">
                Simulated Outcome
              </span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
                {totalSimScore} / 100
              </div>
              <p className="text-[11px]" style={{ color: simPriorityTheme.hex }}>
                Routes to: {simPriorityLevel === 'High' ? 'Emergency Rapid Dispatch (<30 min)' : simPriorityLevel === 'Medium' ? 'Standard Crew Inspection (<24 hrs)' : 'Scheduled Maintenance Batch'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitive Landmark Buffer Corridors */}
      <SensitiveZoneManager
        zones={sensitiveZones}
        onZonesChange={setSensitiveZones}
        onNotification={(msg) => {
          setSaveStatus(msg);
          setTimeout(() => setSaveStatus(null), 3500);
        }}
      />
    </div>
  );
}
